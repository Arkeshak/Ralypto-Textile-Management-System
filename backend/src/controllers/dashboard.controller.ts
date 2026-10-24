import { Response } from 'express';
import prisma from '../db/prisma';
import { AuthenticatedRequest } from '../types';

export const getDashboardMetrics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const businessId = req.businessId!;
  const branchId = req.branchId;

  const branchFilter: any = {};
  if (branchId) branchFilter.branchId = branchId;

  // Time boundaries (Asia/Colombo timezone consideration)
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // 1. Sales metrics
  const todaySales = await prisma.sale.findMany({
    where: {
      businessId,
      ...branchFilter,
      createdAt: { gte: todayStart },
    },
    include: {
      items: true,
      payments: true,
    },
  });

  const todayRevenue = todaySales.reduce((acc, s) => acc + s.grandTotal, 0);
  const todayTransactions = todaySales.length;
  const todayCashCollected = todaySales.reduce((acc, s) => acc + s.paidAmount, 0);

  // Calculate COGS and Gross Profit for today
  let todayCOGS = 0;
  for (const s of todaySales) {
    for (const item of s.items) {
      todayCOGS += item.unitCost * item.quantity;
    }
  }
  const todayGrossProfit = Math.max(0, todayRevenue - todayCOGS);

  // 2. Month sales metrics
  const monthSales = await prisma.sale.findMany({
    where: {
      businessId,
      ...branchFilter,
      createdAt: { gte: monthStart },
    },
    include: {
      items: true,
    },
  });
  const monthRevenue = monthSales.reduce((acc, s) => acc + s.grandTotal, 0);
  let monthCOGS = 0;
  for (const s of monthSales) {
    for (const item of s.items) {
      monthCOGS += item.unitCost * item.quantity;
    }
  }
  const monthGrossProfit = Math.max(0, monthRevenue - monthCOGS);

  // 3. Expenses
  const todayExpenses = await prisma.expense.aggregate({
    where: {
      businessId,
      ...branchFilter,
      expenseDate: { gte: todayStart },
    },
    _sum: { amount: true },
  });
  const todayExpenseAmount = todayExpenses._sum.amount || 0;

  const monthExpenses = await prisma.expense.aggregate({
    where: {
      businessId,
      ...branchFilter,
      expenseDate: { gte: monthStart },
    },
    _sum: { amount: true },
  });
  const monthExpenseAmount = monthExpenses._sum.amount || 0;

  const monthNetProfit = monthGrossProfit - monthExpenseAmount;

  // 4. Inventory stats
  const balances = await prisma.inventoryBalance.findMany({
    where: {
      businessId,
      ...branchFilter,
    },
    include: {
      variant: {
        include: { product: true },
      },
    },
  });

  let totalInventoryUnits = 0;
  let inventoryCostValue = 0;
  let inventoryRetailValue = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;
  const lowStockAlerts: any[] = [];

  for (const b of balances) {
    totalInventoryUnits += b.quantityOnHand;
    inventoryCostValue += b.quantityOnHand * b.variant.costPrice;
    inventoryRetailValue += b.quantityOnHand * b.variant.sellingPrice;

    if (b.quantityOnHand === 0) {
      outOfStockCount++;
      if (lowStockAlerts.length < 8) {
        lowStockAlerts.push({
          variantId: b.variantId,
          productName: b.variant.product.name,
          variantDetails: `${b.variant.size} / ${b.variant.color}`,
          sku: b.variant.sku,
          stock: 0,
          reorderLevel: b.variant.reorderLevel,
          status: 'OUT_OF_STOCK',
        });
      }
    } else if (b.quantityOnHand <= b.variant.reorderLevel) {
      lowStockCount++;
      if (lowStockAlerts.length < 8) {
        lowStockAlerts.push({
          variantId: b.variantId,
          productName: b.variant.product.name,
          variantDetails: `${b.variant.size} / ${b.variant.color}`,
          sku: b.variant.sku,
          stock: b.quantityOnHand,
          reorderLevel: b.variant.reorderLevel,
          status: 'LOW_STOCK',
        });
      }
    }
  }

  // 5. Receivables & Payables
  const customerAggregate = await prisma.customer.aggregate({
    where: { businessId },
    _sum: { outstandingBalance: true },
  });
  const customerReceivables = customerAggregate._sum.outstandingBalance || 0;

  const supplierAggregate = await prisma.supplier.aggregate({
    where: { businessId },
    _sum: { outstandingBalance: true },
  });
  const supplierPayables = supplierAggregate._sum.outstandingBalance || 0;

  // 6. Recent Sales
  const recentSales = await prisma.sale.findMany({
    where: {
      businessId,
      ...branchFilter,
    },
    include: {
      customer: { select: { name: true, phone: true } },
      cashier: { select: { name: true } },
      branch: { select: { code: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  // 7. Last 7 Days Sales Trend
  const last7DaysTrend: any[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const nextD = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1);

    const daySales = await prisma.sale.findMany({
      where: {
        businessId,
        ...branchFilter,
        createdAt: { gte: d, lt: nextD },
      },
      include: { items: true },
    });

    const dayRevenue = daySales.reduce((acc, s) => acc + s.grandTotal, 0);
    let dayCost = 0;
    for (const s of daySales) {
      for (const item of s.items) {
        dayCost += item.unitCost * item.quantity;
      }
    }

    const dayName = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
    last7DaysTrend.push({
      date: dayName,
      sales: dayRevenue,
      profit: Math.max(0, dayRevenue - dayCost),
      transactions: daySales.length,
    });
  }

  // 8. Payment Method Distribution
  const payments = await prisma.payment.groupBy({
    by: ['paymentMethod'],
    where: {
      businessId,
      createdAt: { gte: monthStart },
    },
    _sum: { amount: true },
  });

  const paymentBreakdown = payments.map((p) => ({
    method: p.paymentMethod,
    amount: p._sum.amount || 0,
  }));

  res.json({
    success: true,
    data: {
      summary: {
        todayRevenue,
        todayTransactions,
        todayGrossProfit,
        todayCashCollected,
        todayExpenseAmount,
        monthRevenue,
        monthGrossProfit,
        monthExpenseAmount,
        monthNetProfit,
        totalInventoryUnits,
        inventoryCostValue,
        inventoryRetailValue,
        lowStockCount,
        outOfStockCount,
        customerReceivables,
        supplierPayables,
      },
      last7DaysTrend,
      paymentBreakdown,
      recentSales,
      lowStockAlerts,
    },
  });
};
