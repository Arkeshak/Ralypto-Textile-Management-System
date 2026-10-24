import { Response } from 'express';
import { z } from 'zod';
import prisma from '../db/prisma';
import { AuthenticatedRequest } from '../types';

const returnItemSchema = z.object({
  saleItemId: z.string(),
  variantId: z.string(),
  quantity: z.number().int().positive(),
  refundAmount: z.number().min(0),
});

const createReturnSchema = z.object({
  saleId: z.string(),
  reason: z.string().min(2),
  disposition: z.enum(['RESTOCK', 'DAMAGED', 'INSPECTION']).default('RESTOCK'),
  notes: z.string().optional(),
  items: z.array(returnItemSchema).min(1, 'Select at least one item to return'),
});

export const processReturn = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const businessId = req.businessId!;
  const userId = req.user!.id;

  const { saleId, reason, disposition, notes, items } = createReturnSchema.parse(req.body);

  try {
    const returnRecord = await prisma.$transaction(async (tx) => {
      // 1. Verify original sale
      const sale = await tx.sale.findFirst({
        where: { id: saleId, businessId },
        include: {
          items: true,
          branch: true,
        },
      });

      if (!sale) {
        throw new Error('Original sale invoice not found.');
      }

      // 2. Validate return items against original sale item quantities
      let totalRefund = 0;
      for (const item of items) {
        const saleItem = sale.items.find((si) => si.id === item.saleItemId);
        if (!saleItem) {
          throw new Error(`Item ${item.saleItemId} does not belong to this sale.`);
        }

        // Check if already returned in previous returns
        const previousReturns = await tx.returnItem.findMany({
          where: { saleItemId: item.saleItemId },
        });
        const alreadyReturnedQty = previousReturns.reduce((acc, r) => acc + r.quantity, 0);

        if (alreadyReturnedQty + item.quantity > saleItem.quantity) {
          throw new Error(
            `Cannot return ${item.quantity} units of "${saleItem.productName}". Originally purchased: ${saleItem.quantity}, already returned: ${alreadyReturnedQty}.`
          );
        }

        totalRefund += item.refundAmount;
      }

      // Generate Return Number: RET-COL03-YYYYMMDD-XXXX
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const returnCount = await tx.return.count({
        where: { businessId },
      });
      const returnNumber = `RET-${sale.branch.code}-${todayStr}-${String(returnCount + 1).padStart(4, '0')}`;

      // 3. Create Return
      const createdReturn = await tx.return.create({
        data: {
          businessId,
          branchId: sale.branchId,
          saleId: sale.id,
          returnNumber,
          totalRefundAmount: totalRefund,
          reason,
          disposition,
          notes,
          processedByUserId: userId,
          items: {
            create: items.map((i) => {
              const si = sale.items.find((item) => item.id === i.saleItemId)!;
              return {
                saleItemId: i.saleItemId,
                variantId: i.variantId,
                quantity: i.quantity,
                unitPrice: si.unitPrice,
                refundAmount: i.refundAmount,
              };
            }),
          },
        },
        include: {
          items: true,
        },
      });

      // 4. Update inventory according to disposition
      if (disposition === 'RESTOCK') {
        for (const item of items) {
          const balance = await tx.inventoryBalance.findUnique({
            where: {
              branchId_variantId: {
                branchId: sale.branchId,
                variantId: item.variantId,
              },
            },
            include: { variant: true },
          });

          const prevQty = balance ? balance.quantityOnHand : 0;
          const newQty = prevQty + item.quantity;

          if (balance) {
            await tx.inventoryBalance.update({
              where: { id: balance.id },
              data: { quantityOnHand: newQty },
            });
          } else {
            await tx.inventoryBalance.create({
              data: {
                businessId,
                branchId: sale.branchId,
                variantId: item.variantId,
                quantityOnHand: newQty,
              },
            });
          }

          // Stock movement ledger entry
          await tx.stockMovement.create({
            data: {
              businessId,
              branchId: sale.branchId,
              variantId: item.variantId,
              movementType: 'CUSTOMER_RETURN',
              quantityChange: item.quantity,
              previousQuantity: prevQty,
              newQuantity: newQty,
              costPerUnit: balance ? balance.variant.costPrice : 0,
              referenceType: 'RETURN',
              referenceId: createdReturn.id,
              notes: `Customer return restocked: ${returnNumber} (${reason})`,
              createdByUserId: userId,
            },
          });
        }
      } else if (disposition === 'DAMAGED') {
        for (const item of items) {
          const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } });
          const balance = await tx.inventoryBalance.findUnique({
            where: {
              branchId_variantId: {
                branchId: sale.branchId,
                variantId: item.variantId,
              },
            },
          });

          // Log damaged stock movement without increasing sellable stock
          await tx.stockMovement.create({
            data: {
              businessId,
              branchId: sale.branchId,
              variantId: item.variantId,
              movementType: 'DAMAGE',
              quantityChange: 0,
              previousQuantity: balance ? balance.quantityOnHand : 0,
              newQuantity: balance ? balance.quantityOnHand : 0,
              costPerUnit: variant?.costPrice || 0,
              referenceType: 'RETURN',
              referenceId: createdReturn.id,
              notes: `Returned item marked as damaged: ${returnNumber} (${reason})`,
              createdByUserId: userId,
            },
          });
        }
      }

      return createdReturn;
    });

    res.status(201).json({
      success: true,
      message: `Return ${returnRecord.returnNumber} processed successfully. Refund: LKR ${returnRecord.totalRefundAmount}`,
      data: returnRecord,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to process return',
    });
  }
};

export const getReturns = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const businessId = req.businessId!;
  const branchId = req.branchId;

  const whereClause: any = { businessId };
  if (branchId) whereClause.branchId = branchId;

  const returns = await prisma.return.findMany({
    where: whereClause,
    include: {
      sale: {
        include: {
          customer: true,
          cashier: { select: { id: true, name: true } },
        },
      },
      branch: true,
      items: {
        include: {
          variant: {
            include: {
              product: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: returns,
  });
};
