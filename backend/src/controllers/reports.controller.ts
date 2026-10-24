import { Response } from 'express';
import prisma from '../db/prisma';
import { AuthenticatedRequest } from '../types';

export const getSalesReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const businessId = req.businessId!;
  const branchId = req.branchId;
  const { startDate, endDate } = req.query;

  const whereClause: any = { businessId };
  if (branchId) whereClause.branchId = branchId;

  if (startDate || endDate) {
    whereClause.createdAt = {};
    if (startDate) whereClause.createdAt.gte = new Date(startDate as string);
    if (endDate) {
      const e = new Date(endDate as string);
      e.setHours(23, 59, 59, 999);
      whereClause.createdAt.lte = e;
    }
  }

  const sales = await prisma.sale.findMany({
    where: whereClause,
    include: {
      customer: { select: { name: true, phone: true } },
      cashier: { select: { name: true } },
      items: true,
      payments: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  let totalRevenue = 0;
  let totalDiscounts = 0;
  let totalCOGS = 0;
  let totalPaid = 0;

  for (const s of sales) {
    totalRevenue += s.grandTotal;
    totalDiscounts += s.discountAmount;
    totalPaid += s.paidAmount;
    for (const item of s.items) {
      totalCOGS += item.unitCost * item.quantity;
    }
  }

  const grossProfit = totalRevenue - totalCOGS;
  const grossMarginPercentage = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  res.json({
    success: true,
    data: {
      sales,
      summary: {
        totalSalesCount: sales.length,
        totalRevenue,
        totalDiscounts,
        totalCOGS,
        grossProfit,
        grossMarginPercentage: parseFloat(grossMarginPercentage.toFixed(2)),
        totalPaid,
        outstandingReceivables: Math.max(0, totalRevenue - totalPaid),
      },
    },
  });
};

export const getProductMarginReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const businessId = req.businessId!;

  // Group by variant in SaleItems
  const saleItems = await prisma.saleItem.findMany({
    where: {
      sale: { businessId },
    },
    include: {
      variant: {
        include: {
          product: { select: { id: true, name: true, category: true } },
        },
      },
    },
  });

  const productMap: Record<string, {
    productName: string;
    variantDetails: string;
    unitsSold: number;
    totalRevenue: number;
    totalCost: number;
    grossProfit: number;
  }> = {};

  for (const item of saleItems) {
    const key = item.variantId;
    if (!productMap[key]) {
      productMap[key] = {
        productName: item.productName,
        variantDetails: item.variantDetails,
        unitsSold: 0,
        totalRevenue: 0,
        totalCost: 0,
        grossProfit: 0,
      };
    }

    productMap[key].unitsSold += item.quantity;
    productMap[key].totalRevenue += item.totalPrice;
    const cost = item.unitCost * item.quantity;
    productMap[key].totalCost += cost;
    productMap[key].grossProfit += item.totalPrice - cost;
  }

  const results = Object.values(productMap).map((p) => ({
    ...p,
    marginPercentage: p.totalRevenue > 0 ? parseFloat(((p.grossProfit / p.totalRevenue) * 100).toFixed(1)) : 0,
  }));

  results.sort((a, b) => b.totalRevenue - a.totalRevenue);

  res.json({
    success: true,
    data: results,
  });
};
