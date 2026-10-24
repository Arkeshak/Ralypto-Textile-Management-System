import { Response } from 'express';
import { z } from 'zod';
import prisma from '../db/prisma';
import { AuthenticatedRequest } from '../types';

const saleItemInputSchema = z.object({
  variantId: z.string(),
  quantity: z.number().int().positive(),
  discountAmount: z.number().min(0).default(0),
});

const paymentInputSchema = z.object({
  paymentMethod: z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'CREDIT']),
  amount: z.number().positive(),
  referenceNote: z.string().optional(),
});

const createSaleSchema = z.object({
  branchId: z.string().optional(),
  customerId: z.string().optional().nullable(),
  items: z.array(saleItemInputSchema).min(1, 'Cart cannot be empty'),
  overallDiscountAmount: z.number().min(0).default(0),
  payments: z.array(paymentInputSchema).min(1, 'At least one payment entry is required'),
  notes: z.string().optional(),
});

export const createSale = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const businessId = req.businessId!;
  const cashierUserId = req.user!.id;
  const branchId = req.body.branchId || req.branchId;

  if (!branchId) {
    res.status(400).json({ success: false, message: 'Branch ID is required for completing sales.' });
    return;
  }

  const { customerId, items, overallDiscountAmount, payments, notes } = createSaleSchema.parse(req.body);

  try {
    const saleResult = await prisma.$transaction(async (tx) => {
      // 1. Fetch branch info for invoice numbering
      const branch = await tx.branch.findUnique({
        where: { id: branchId },
      });
      if (!branch) {
        throw new Error('Branch not found');
      }

      // Generate invoice number: INV-COL03-YYYYMMDD-XXXX
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const countToday = await tx.sale.count({
        where: {
          businessId,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      });
      const seqStr = String(countToday + 1).padStart(4, '0');
      const invoiceNumber = `INV-${branch.code}-${todayStr}-${seqStr}`;

      // 2. Validate items, recalculate prices from DB (NEVER trust client unit prices)
      let subtotal = 0;
      let totalItemDiscounts = 0;
      const verifiedLineItems = [];

      for (const item of items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          include: { product: true },
        });

        if (!variant || !variant.isActive || !variant.product.isActive) {
          throw new Error(`Product variant ${item.variantId} is not available.`);
        }

        // Verify stock
        const balance = await tx.inventoryBalance.findUnique({
          where: {
            branchId_variantId: {
              branchId,
              variantId: item.variantId,
            },
          },
        });

        const currentStock = balance ? balance.quantityOnHand : 0;
        if (currentStock < item.quantity) {
          throw new Error(
            `Insufficient stock for "${variant.product.name} (${variant.size}/${variant.color})". Requested: ${item.quantity}, Available: ${currentStock}`
          );
        }

        const lineSubtotal = variant.sellingPrice * item.quantity;
        const lineDiscount = item.discountAmount || 0;
        const lineTotal = Math.max(0, lineSubtotal - lineDiscount);

        subtotal += lineSubtotal;
        totalItemDiscounts += lineDiscount;

        verifiedLineItems.push({
          variantId: variant.id,
          productName: variant.product.name,
          variantDetails: `Size: ${variant.size}, Color: ${variant.color}`,
          quantity: item.quantity,
          unitCost: variant.costPrice,
          unitPrice: variant.sellingPrice,
          discountAmount: lineDiscount,
          totalPrice: lineTotal,
          previousStock: currentStock,
          newStock: currentStock - item.quantity,
        });
      }

      const totalDiscount = totalItemDiscounts + overallDiscountAmount;
      const grandTotal = Math.max(0, subtotal - totalDiscount);

      // 3. Verify payments
      const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);
      const balanceDue = Math.max(0, grandTotal - totalPaid);

      let paymentStatus = 'PAID';
      if (balanceDue > 0 && totalPaid > 0) {
        paymentStatus = 'PARTIAL';
      } else if (totalPaid === 0 || balanceDue >= grandTotal) {
        paymentStatus = 'UNPAID';
      }

      // Check if credit sale
      const hasCredit = payments.some((p) => p.paymentMethod === 'CREDIT');
      if (hasCredit || balanceDue > 0) {
        if (!customerId) {
          throw new Error('A customer must be selected for credit / pay-later sales.');
        }

        const customer = await tx.customer.findUnique({ where: { id: customerId } });
        if (!customer) throw new Error('Customer not found');

        const creditAmount = payments
          .filter((p) => p.paymentMethod === 'CREDIT')
          .reduce((acc, p) => acc + p.amount, 0) + balanceDue;

        if (customer.creditLimit > 0 && customer.outstandingBalance + creditAmount > customer.creditLimit) {
          throw new Error(
            `Customer credit limit exceeded. Limit: LKR ${customer.creditLimit}, Current Balance: LKR ${customer.outstandingBalance}, New: LKR ${creditAmount}`
          );
        }

        // Increment customer outstanding balance
        await tx.customer.update({
          where: { id: customerId },
          data: {
            outstandingBalance: { increment: creditAmount },
          },
        });
      }

      // Determine primary payment method label
      const paymentMethodSummary = payments.length > 1
        ? 'SPLIT'
        : payments[0]?.paymentMethod || 'CASH';

      // 4. Create Sale
      const sale = await tx.sale.create({
        data: {
          businessId,
          branchId,
          invoiceNumber,
          customerId: customerId || null,
          cashierUserId,
          subtotal,
          discountAmount: totalDiscount,
          taxAmount: 0,
          grandTotal,
          paidAmount: totalPaid,
          balanceDue,
          paymentStatus,
          paymentMethod: paymentMethodSummary,
          notes,
          items: {
            create: verifiedLineItems.map((v) => ({
              variantId: v.variantId,
              productName: v.productName,
              variantDetails: v.variantDetails,
              quantity: v.quantity,
              unitCost: v.unitCost,
              unitPrice: v.unitPrice,
              discountAmount: v.discountAmount,
              totalPrice: v.totalPrice,
            })),
          },
          payments: {
            create: payments.map((p) => ({
              businessId,
              paymentMethod: p.paymentMethod,
              amount: p.amount,
              referenceNote: p.referenceNote || null,
            })),
          },
        },
        include: {
          items: true,
          payments: true,
          customer: true,
          cashier: { select: { id: true, name: true } },
          branch: true,
          business: true,
        },
      });

      // 5. Deduct stock & create immutable stock ledger movements
      for (const item of verifiedLineItems) {
        await tx.inventoryBalance.update({
          where: {
            branchId_variantId: {
              branchId,
              variantId: item.variantId,
            },
          },
          data: {
            quantityOnHand: item.newStock,
          },
        });

        await tx.stockMovement.create({
          data: {
            businessId,
            branchId,
            variantId: item.variantId,
            movementType: 'SALE',
            quantityChange: -item.quantity,
            previousQuantity: item.previousStock,
            newQuantity: item.newStock,
            costPerUnit: item.unitCost,
            referenceType: 'SALE',
            referenceId: sale.id,
            notes: `POS Checkout ${invoiceNumber}`,
            createdByUserId: cashierUserId,
          },
        });
      }

      // 6. Award loyalty points if customer linked (1 point per 100 LKR spent)
      if (customerId && totalPaid > 0) {
        const pointsEarned = Math.floor(totalPaid / 100);
        if (pointsEarned > 0) {
          await tx.customer.update({
            where: { id: customerId },
            data: {
              loyaltyPoints: { increment: pointsEarned },
            },
          });
        }
      }

      return sale;
    });

    res.status(201).json({
      success: true,
      message: `Sale completed successfully. Invoice: ${saleResult.invoiceNumber}`,
      data: saleResult,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Transaction failed',
    });
  }
};

export const getSales = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const businessId = req.businessId!;
  const branchId = req.branchId;
  const { startDate, endDate, paymentStatus, search, limit = '50', page = '1' } = req.query;

  const whereClause: any = { businessId };
  if (branchId) whereClause.branchId = branchId;
  if (paymentStatus) whereClause.paymentStatus = paymentStatus as string;

  if (startDate || endDate) {
    whereClause.createdAt = {};
    if (startDate) whereClause.createdAt.gte = new Date(startDate as string);
    if (endDate) {
      const e = new Date(endDate as string);
      e.setHours(23, 59, 59, 999);
      whereClause.createdAt.lte = e;
    }
  }

  if (search) {
    const s = String(search).trim();
    whereClause.OR = [
      { invoiceNumber: { contains: s } },
      { customer: { name: { contains: s } } },
      { customer: { phone: { contains: s } } },
    ];
  }

  const take = Math.min(parseInt(limit as string, 10) || 50, 100);
  const skip = (Math.max(parseInt(page as string, 10) || 1, 1) - 1) * take;

  const [sales, total] = await Promise.all([
    prisma.sale.findMany({
      where: whereClause,
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        cashier: { select: { id: true, name: true } },
        branch: { select: { id: true, name: true, code: true } },
        items: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    }),
    prisma.sale.count({ where: whereClause }),
  ]);

  res.json({
    success: true,
    data: sales,
    meta: {
      total,
      page: Math.floor(skip / take) + 1,
      limit: take,
      totalPages: Math.ceil(total / take),
    },
  });
};

export const getSaleById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const businessId = req.businessId!;
  const { id } = req.params;

  const sale = await prisma.sale.findFirst({
    where: {
      businessId,
      OR: [{ id }, { invoiceNumber: id }],
    },
    include: {
      customer: true,
      cashier: { select: { id: true, name: true, email: true } },
      branch: true,
      business: true,
      items: {
        include: {
          variant: true,
        },
      },
      payments: true,
      returns: {
        include: {
          items: true,
        },
      },
    },
  });

  if (!sale) {
    res.status(404).json({ success: false, message: 'Sale invoice not found.' });
    return;
  }

  res.json({
    success: true,
    data: sale,
  });
};
