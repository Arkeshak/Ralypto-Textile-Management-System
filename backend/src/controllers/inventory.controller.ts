import { Response } from 'express';
import { z } from 'zod';
import prisma from '../db/prisma';
import { AuthenticatedRequest } from '../types';

export const getInventoryLedger = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const businessId = req.businessId!;
  const branchId = req.branchId;
  const { movementType, variantId, limit = '50', page = '1' } = req.query;

  const whereClause: any = { businessId };
  if (branchId) whereClause.branchId = branchId;
  if (movementType) whereClause.movementType = movementType as string;
  if (variantId) whereClause.variantId = variantId as string;

  const take = Math.min(parseInt(limit as string, 10) || 50, 100);
  const skip = (Math.max(parseInt(page as string, 10) || 1, 1) - 1) * take;

  const [movements, total] = await Promise.all([
    prisma.stockMovement.findMany({
      where: whereClause,
      include: {
        variant: {
          include: {
            product: { select: { id: true, name: true, imageUrl: true } },
          },
        },
        branch: { select: { id: true, name: true, code: true } },
        createdByUser: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    }),
    prisma.stockMovement.count({ where: whereClause }),
  ]);

  res.json({
    success: true,
    data: movements,
    meta: {
      total,
      page: Math.floor(skip / take) + 1,
      limit: take,
      totalPages: Math.ceil(total / take),
    },
  });
};

export const getInventoryBalances = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const businessId = req.businessId!;
  const branchId = req.branchId;
  const { search, lowStockOnly } = req.query;

  const whereClause: any = { businessId };
  if (branchId) whereClause.branchId = branchId;

  const balances = await prisma.inventoryBalance.findMany({
    where: whereClause,
    include: {
      variant: {
        include: {
          product: {
            select: { id: true, name: true, category: true, brand: true, imageUrl: true },
          },
        },
      },
      branch: { select: { id: true, name: true, code: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  let filtered = balances;
  if (search) {
    const s = String(search).toLowerCase();
    filtered = filtered.filter(
      (b) =>
        b.variant.sku.toLowerCase().includes(s) ||
        (b.variant.barcode && b.variant.barcode.toLowerCase().includes(s)) ||
        b.variant.product.name.toLowerCase().includes(s) ||
        b.variant.color.toLowerCase().includes(s) ||
        b.variant.size.toLowerCase().includes(s)
    );
  }

  if (lowStockOnly === 'true') {
    filtered = filtered.filter((b) => b.quantityOnHand <= b.variant.reorderLevel);
  }

  res.json({
    success: true,
    data: filtered,
  });
};

const receiveStockSchema = z.object({
  branchId: z.string().optional(),
  items: z.array(
    z.object({
      variantId: z.string(),
      quantity: z.number().int().positive(),
      costPerUnit: z.number().min(0),
    })
  ).min(1),
  supplierId: z.string().optional(),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
});

export const receiveStock = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const businessId = req.businessId!;
  const branchId = req.body.branchId || req.branchId;

  if (!branchId) {
    res.status(400).json({ success: false, message: 'Branch ID is required for stock receiving.' });
    return;
  }

  const { items, supplierId, referenceNumber, notes } = receiveStockSchema.parse(req.body);

  const results = await prisma.$transaction(async (tx) => {
    const ledgerEntries = [];

    for (const item of items) {
      // Find or create balance
      let balance = await tx.inventoryBalance.findUnique({
        where: {
          branchId_variantId: {
            branchId,
            variantId: item.variantId,
          },
        },
      });

      const prevQty = balance ? balance.quantityOnHand : 0;
      const newQty = prevQty + item.quantity;

      if (!balance) {
        balance = await tx.inventoryBalance.create({
          data: {
            businessId,
            branchId,
            variantId: item.variantId,
            quantityOnHand: newQty,
          },
        });
      } else {
        await tx.inventoryBalance.update({
          where: { id: balance.id },
          data: { quantityOnHand: newQty },
        });
      }

      // Record movement
      const movement = await tx.stockMovement.create({
        data: {
          businessId,
          branchId,
          variantId: item.variantId,
          movementType: 'PURCHASE_RECEIPT',
          quantityChange: item.quantity,
          previousQuantity: prevQty,
          newQuantity: newQty,
          costPerUnit: item.costPerUnit,
          referenceType: 'PURCHASE',
          referenceId: referenceNumber || null,
          notes: notes || `Goods received into stock (${referenceNumber || 'GRN'})`,
          createdByUserId: req.user?.id,
        },
      });

      ledgerEntries.push(movement);
    }

    return ledgerEntries;
  });

  res.status(201).json({
    success: true,
    message: `Successfully received ${items.length} items into inventory.`,
    data: results,
  });
};

const adjustStockSchema = z.object({
  branchId: z.string().optional(),
  variantId: z.string(),
  adjustmentType: z.enum(['DAMAGE', 'CORRECTION', 'MISSING']),
  quantityChange: z.number().int(), // e.g. -2 for damage, or +3 for recount correction
  reason: z.string().min(3),
});

export const adjustStock = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const businessId = req.businessId!;
  const branchId = req.body.branchId || req.branchId;

  if (!branchId) {
    res.status(400).json({ success: false, message: 'Branch ID is required for stock adjustment.' });
    return;
  }

  const { variantId, adjustmentType, quantityChange, reason } = adjustStockSchema.parse(req.body);

  if (quantityChange === 0) {
    res.status(400).json({ success: false, message: 'Quantity change must be non-zero.' });
    return;
  }

  const result = await prisma.$transaction(async (tx) => {
    let balance = await tx.inventoryBalance.findUnique({
      where: {
        branchId_variantId: {
          branchId,
          variantId,
        },
      },
      include: { variant: true },
    });

    const prevQty = balance ? balance.quantityOnHand : 0;
    const newQty = prevQty + quantityChange;

    if (newQty < 0) {
      throw new Error(`Cannot adjust stock below 0. Current stock is ${prevQty}, attempted change: ${quantityChange}`);
    }

    if (!balance) {
      balance = await tx.inventoryBalance.create({
        data: {
          businessId,
          branchId,
          variantId,
          quantityOnHand: newQty,
        },
        include: { variant: true },
      });
    } else {
      await tx.inventoryBalance.update({
        where: { id: balance.id },
        data: { quantityOnHand: newQty },
      });
    }

    const movement = await tx.stockMovement.create({
      data: {
        businessId,
        branchId,
        variantId,
        movementType: adjustmentType,
        quantityChange,
        previousQuantity: prevQty,
        newQuantity: newQty,
        costPerUnit: balance.variant.costPrice,
        referenceType: 'MANUAL',
        notes: reason,
        createdByUserId: req.user?.id,
      },
    });

    return { movement, newQuantity: newQty };
  });

  res.json({
    success: true,
    message: 'Stock adjustment successfully ledgered.',
    data: result,
  });
};

export const getInventoryValuation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const businessId = req.businessId!;
  const branchId = req.branchId;

  const whereClause: any = { businessId };
  if (branchId) whereClause.branchId = branchId;

  const balances = await prisma.inventoryBalance.findMany({
    where: whereClause,
    include: {
      variant: true,
    },
  });

  let totalUnits = 0;
  let totalCostValue = 0;
  let totalRetailValue = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;

  for (const b of balances) {
    totalUnits += b.quantityOnHand;
    totalCostValue += b.quantityOnHand * b.variant.costPrice;
    totalRetailValue += b.quantityOnHand * b.variant.sellingPrice;

    if (b.quantityOnHand === 0) {
      outOfStockCount++;
    } else if (b.quantityOnHand <= b.variant.reorderLevel) {
      lowStockCount++;
    }
  }

  res.json({
    success: true,
    data: {
      totalUnits,
      totalCostValue,
      totalRetailValue,
      potentialGrossMargin: totalRetailValue - totalCostValue,
      lowStockCount,
      outOfStockCount,
    },
  });
};
