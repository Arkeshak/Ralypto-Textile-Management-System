import { Response } from 'express';
import { z } from 'zod';
import prisma from '../db/prisma';
import { AuthenticatedRequest } from '../types';

export const getCategories = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const businessId = req.businessId!;
  const categories = await prisma.category.findMany({
    where: { businessId, isActive: true },
    include: {
      _count: { select: { products: true } },
    },
    orderBy: { name: 'asc' },
  });
  res.json({ success: true, data: categories });
};

const categorySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().nullable(),
});

export const createCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const businessId = req.businessId!;
  const data = categorySchema.parse(req.body);
  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const category = await prisma.category.create({
    data: {
      businessId,
      name: data.name,
      slug,
      description: data.description,
    },
  });

  res.status(201).json({ success: true, data: category });
};

export const getBrands = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const businessId = req.businessId!;
  const brands = await prisma.brand.findMany({
    where: { businessId, isActive: true },
    include: {
      _count: { select: { products: true } },
    },
    orderBy: { name: 'asc' },
  });
  res.json({ success: true, data: brands });
};

export const createBrand = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const businessId = req.businessId!;
  const data = categorySchema.parse(req.body);
  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const brand = await prisma.brand.create({
    data: {
      businessId,
      name: data.name,
      slug,
      description: data.description,
    },
  });

  res.status(201).json({ success: true, data: brand });
};

export const getStaff = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const businessId = req.businessId!;
  const users = await prisma.user.findMany({
    where: { businessId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      isActive: true,
      createdAt: true,
      role: { select: { id: true, name: true, description: true } },
      branch: { select: { id: true, name: true, code: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: users });
};
