import { Response } from 'express';
import { z } from 'zod';
import prisma from '../db/prisma';
import { AuthenticatedRequest } from '../types';

export const getExpenses = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const businessId = req.businessId!;
  const branchId = req.branchId;
  const { category, startDate, endDate } = req.query;

  const whereClause: any = { businessId };
  if (branchId) whereClause.branchId = branchId;
  if (category) whereClause.category = category as string;

  if (startDate || endDate) {
    whereClause.expenseDate = {};
    if (startDate) whereClause.expenseDate.gte = new Date(startDate as string);
    if (endDate) {
      const e = new Date(endDate as string);
      e.setHours(23, 59, 59, 999);
      whereClause.expenseDate.lte = e;
    }
  }

  const expenses = await prisma.expense.findMany({
    where: whereClause,
    include: {
      recordedByUser: { select: { id: true, name: true } },
      branch: { select: { id: true, name: true, code: true } },
    },
    orderBy: { expenseDate: 'desc' },
  });

  const totalAmount = expenses.reduce((acc, e) => acc + e.amount, 0);

  res.json({
    success: true,
    data: expenses,
    summary: { totalAmount, count: expenses.length },
  });
};

const expenseSchema = z.object({
  branchId: z.string().optional(),
  category: z.string().min(2),
  description: z.string().min(2),
  amount: z.number().positive(),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'CARD']).default('CASH'),
  expenseDate: z.string().optional(),
});

export const createExpense = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const businessId = req.businessId!;
  const branchId = req.body.branchId || req.branchId;
  const recordedByUserId = req.user!.id;

  if (!branchId) {
    res.status(400).json({ success: false, message: 'Branch ID is required.' });
    return;
  }

  const data = expenseSchema.parse(req.body);

  const expense = await prisma.expense.create({
    data: {
      businessId,
      branchId,
      category: data.category,
      description: data.description,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      expenseDate: data.expenseDate ? new Date(data.expenseDate) : new Date(),
      recordedByUserId,
    },
    include: {
      recordedByUser: { select: { id: true, name: true } },
      branch: { select: { id: true, name: true } },
    },
  });

  res.status(201).json({
    success: true,
    message: 'Expense recorded successfully.',
    data: expense,
  });
};
