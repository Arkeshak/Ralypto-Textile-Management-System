import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../db/prisma';
import { config } from '../config';
import { AuthenticatedRequest } from '../types';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await prisma.user.findFirst({
    where: { email: email.toLowerCase().trim() },
    include: {
      business: true,
      role: true,
      branch: true,
    },
  });

  if (!user || !user.isActive) {
    res.status(401).json({
      success: false,
      message: 'Invalid email address or account is disabled.',
    });
    return;
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    res.status(401).json({
      success: false,
      message: 'Invalid password credentials.',
    });
    return;
  }

  const token = jwt.sign(
    { userId: user.id, businessId: user.businessId },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn as any }
  );

  let permissions: string[] = [];
  try {
    permissions = JSON.parse(user.role.permissions);
  } catch {
    permissions = [];
  }

  const branches = await prisma.branch.findMany({
    where: { businessId: user.businessId, isActive: true },
    select: { id: true, name: true, code: true, isMain: true },
  });

  res.json({
    success: true,
    message: 'Welcome to Ralypto Dress Shop Manager',
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role.name,
        permissions,
        branchId: user.branchId,
        branchName: user.branch?.name,
      },
      business: {
        id: user.business.id,
        name: user.business.name,
        currency: user.business.currency,
        timezone: user.business.timezone,
        taxRate: user.business.taxRate,
        receiptFooter: user.business.receiptFooter,
      },
      branches,
    },
  });
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: {
      business: true,
      role: true,
      branch: true,
    },
  });

  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  let permissions: string[] = [];
  try {
    permissions = JSON.parse(user.role.permissions);
  } catch {
    permissions = [];
  }

  const branches = await prisma.branch.findMany({
    where: { businessId: user.businessId, isActive: true },
  });

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        permissions,
        branchId: user.branchId,
      },
      business: user.business,
      branches,
    },
  });
};

const setupSchema = z.object({
  businessName: z.string().min(2),
  legalName: z.string().optional(),
  phone: z.string().min(8),
  email: z.string().email(),
  address: z.string().optional(),
  currency: z.string().default('LKR'),
  timezone: z.string().default('Asia/Colombo'),
  ownerName: z.string().min(2),
  ownerEmail: z.string().email(),
  ownerPassword: z.string().min(6),
});

export const registerSetup = async (req: Request, res: Response): Promise<void> => {
  const data = setupSchema.parse(req.body);

  const existing = await prisma.user.findFirst({
    where: { email: data.ownerEmail.toLowerCase().trim() },
  });

  if (existing) {
    res.status(409).json({
      success: false,
      message: 'An account with this email address already exists.',
    });
    return;
  }

  // Create in transaction
  const result = await prisma.$transaction(async (tx) => {
    const business = await tx.business.create({
      data: {
        name: data.businessName,
        legalName: data.legalName,
        phone: data.phone,
        email: data.email,
        address: data.address,
        currency: data.currency,
        timezone: data.timezone,
      },
    });

    const mainBranch = await tx.branch.create({
      data: {
        businessId: business.id,
        name: `${data.businessName} - Main Store`,
        code: 'MAIN-01',
        address: data.address,
        phone: data.phone,
        isMain: true,
      },
    });

    const ownerRole = await tx.role.create({
      data: {
        businessId: business.id,
        name: 'Owner',
        description: 'Store Owner full access',
        permissions: JSON.stringify(['*']),
        isSystem: true,
      },
    });

    await tx.role.create({
      data: {
        businessId: business.id,
        name: 'Cashier',
        description: 'POS sales cashier',
        permissions: JSON.stringify(['sales:view', 'sales:create', 'products:view']),
        isSystem: true,
      },
    });

    const passwordHash = await bcrypt.hash(data.ownerPassword, 10);
    const ownerUser = await tx.user.create({
      data: {
        businessId: business.id,
        branchId: mainBranch.id,
        name: data.ownerName,
        email: data.ownerEmail.toLowerCase().trim(),
        phone: data.phone,
        passwordHash,
        roleId: ownerRole.id,
      },
    });

    // Default dress shop categories
    const defaultCategories = ['Dresses', 'Sarees', 'Tops & Shirts', 'Pants & Skirts', 'Accessories'];
    for (const catName of defaultCategories) {
      await tx.category.create({
        data: {
          businessId: business.id,
          name: catName,
          slug: catName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        },
      });
    }

    return { business, ownerUser, mainBranch };
  });

  const token = jwt.sign(
    { userId: result.ownerUser.id, businessId: result.business.id },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn as any }
  );

  res.status(201).json({
    success: true,
    message: 'Shop registration completed successfully.',
    data: {
      token,
      business: result.business,
      user: {
        id: result.ownerUser.id,
        name: result.ownerUser.name,
        email: result.ownerUser.email,
        role: 'Owner',
      },
      branch: result.mainBranch,
    },
  });
};
