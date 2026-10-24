import { Response } from 'express';
import { z } from 'zod';
import prisma from '../db/prisma';
import { AuthenticatedRequest } from '../types';

export const getCustomers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const businessId = req.businessId!;
  const { search } = req.query;

  const whereClause: any = { businessId };
  if (search) {
    const s = String(search).trim();
    whereClause.OR = [
      { name: { contains: s } },
      { phone: { contains: s } },
      { email: { contains: s } },
    ];
  }

  const customers = await prisma.customer.findMany({
    where: whereClause,
    include: {
      _count: { select: { sales: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, data: customers });
};

export const getCustomerById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const businessId = req.businessId!;
  const { id } = req.params;

  const customer = await prisma.customer.findFirst({
    where: { id, businessId },
    include: {
      sales: {
        include: {
          items: true,
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!customer) {
    res.status(404).json({ success: false, message: 'Customer not found' });
    return;
  }

  res.json({ success: true, data: customer });
};

const customerSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(9),
  email: z.string().email().optional().nullable(),
  address: z.string().optional().nullable(),
  creditLimit: z.number().min(0).default(0),
  notes: z.string().optional().nullable(),
});

export const createCustomer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const businessId = req.businessId!;
  const data = customerSchema.parse(req.body);

  const existing = await prisma.customer.findFirst({
    where: { businessId, phone: data.phone },
  });

  if (existing) {
    res.status(409).json({ success: false, message: 'A customer with this phone number already exists.' });
    return;
  }

  const customer = await prisma.customer.create({
    data: {
      businessId,
      ...data,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Customer registered successfully.',
    data: customer,
  });
};

export const recordCustomerPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const businessId = req.businessId!;
  const { id } = req.params;
  const { amount, paymentMethod, reference } = req.body;

  if (!amount || amount <= 0) {
    res.status(400).json({ success: false, message: 'Valid payment amount is required.' });
    return;
  }

  const customer = await prisma.customer.findFirst({
    where: { id, businessId },
  });

  if (!customer) {
    res.status(404).json({ success: false, message: 'Customer not found.' });
    return;
  }

  const updated = await prisma.customer.update({
    where: { id },
    data: {
      outstandingBalance: Math.max(0, customer.outstandingBalance - amount),
    },
  });

  res.json({
    success: true,
    message: `Payment of LKR ${amount} recorded against customer balance. Remaining balance: LKR ${updated.outstandingBalance}`,
    data: updated,
  });
};
