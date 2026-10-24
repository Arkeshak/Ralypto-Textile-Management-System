import { Response } from 'express';
import { z } from 'zod';
import prisma from '../db/prisma';
import { AuthenticatedRequest } from '../types';

export const getSuppliers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const businessId = req.businessId!;
  const suppliers = await prisma.supplier.findMany({
    where: { businessId },
    include: {
      _count: { select: { products: true, purchases: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, data: suppliers });
};

const supplierSchema = z.object({
  name: z.string().min(2),
  contactPerson: z.string().optional().nullable(),
  phone: z.string().min(8),
  email: z.string().email().optional().nullable(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const createSupplier = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const businessId = req.businessId!;
  const data = supplierSchema.parse(req.body);

  const supplier = await prisma.supplier.create({
    data: {
      businessId,
      ...data,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Supplier created successfully.',
    data: supplier,
  });
};
