import { Response } from 'express';
import { z } from 'zod';
import prisma from '../db/prisma';
import { AuthenticatedRequest } from '../types';

export const getProducts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const businessId = req.businessId!;
  const branchId = req.branchId;
  const { categoryId, brandId, search, status } = req.query;

  const whereClause: any = {
    businessId,
  };

  if (status === 'archived') {
    whereClause.isActive = false;
  } else if (status !== 'all') {
    whereClause.isActive = true;
  }

  if (categoryId) {
    whereClause.categoryId = categoryId as string;
  }

  if (brandId) {
    whereClause.brandId = brandId as string;
  }

  if (search) {
    const s = String(search).trim();
    whereClause.OR = [
      { name: { contains: s } },
      { description: { contains: s } },
      {
        variants: {
          some: {
            OR: [
              { sku: { contains: s } },
              { barcode: { contains: s } },
              { color: { contains: s } },
              { size: { contains: s } },
            ],
          },
        },
      },
    ];
  }

  const products = await prisma.product.findMany({
    where: whereClause,
    include: {
      category: { select: { id: true, name: true } },
      brand: { select: { id: true, name: true } },
      supplier: { select: { id: true, name: true } },
      variants: {
        where: { isActive: true },
        include: {
          balances: branchId
            ? { where: { branchId } }
            : true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate total stock per product for easy display
  const formatted = products.map((prod) => {
    let totalStock = 0;
    const variantsWithStock = prod.variants.map((v) => {
      const stock = v.balances.reduce((acc, b) => acc + b.quantityOnHand, 0);
      totalStock += stock;
      return {
        ...v,
        stockOnHand: stock,
      };
    });

    return {
      ...prod,
      totalStockOnHand: totalStock,
      variants: variantsWithStock,
    };
  });

  res.json({
    success: true,
    data: formatted,
  });
};

export const getProductById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const businessId = req.businessId!;
  const { id } = req.params;

  const product = await prisma.product.findFirst({
    where: { id, businessId },
    include: {
      category: true,
      brand: true,
      supplier: true,
      variants: {
        include: {
          balances: {
            include: { branch: true },
          },
        },
      },
    },
  });

  if (!product) {
    res.status(404).json({ success: false, message: 'Product not found' });
    return;
  }

  res.json({ success: true, data: product });
};

export const searchByBarcode = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const businessId = req.businessId!;
  const branchId = req.branchId;
  const { code } = req.params;

  const variant = await prisma.productVariant.findFirst({
    where: {
      product: { businessId, isActive: true },
      isActive: true,
      OR: [
        { barcode: code },
        { sku: code },
      ],
    },
    include: {
      product: {
        include: { category: true, brand: true },
      },
      balances: branchId ? { where: { branchId } } : true,
    },
  });

  if (!variant) {
    res.status(404).json({
      success: false,
      message: `No product variant found matching barcode/SKU: ${code}`,
    });
    return;
  }

  const stockOnHand = variant.balances.reduce((acc, b) => acc + b.quantityOnHand, 0);

  res.json({
    success: true,
    data: {
      variantId: variant.id,
      productId: variant.productId,
      productName: variant.product.name,
      categoryName: variant.product.category.name,
      brandName: variant.product.brand?.name || 'Ralypto',
      sku: variant.sku,
      barcode: variant.barcode,
      size: variant.size,
      color: variant.color,
      colorHex: variant.colorHex,
      costPrice: variant.costPrice,
      sellingPrice: variant.sellingPrice,
      stockOnHand,
      imageUrl: variant.product.imageUrl,
    },
  });
};

const variantInputSchema = z.object({
  id: z.string().optional(),
  sku: z.string().min(2),
  barcode: z.string().optional().nullable(),
  size: z.string().min(1),
  color: z.string().min(1),
  colorHex: z.string().optional().nullable(),
  costPrice: z.number().min(0),
  sellingPrice: z.number().min(0),
  reorderLevel: z.number().default(5),
  initialStock: z.number().default(0),
});

const createProductSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().nullable(),
  categoryId: z.string().min(1),
  brandId: z.string().optional().nullable(),
  supplierId: z.string().optional().nullable(),
  basePrice: z.number().min(0),
  baseCost: z.number().min(0),
  imageUrl: z.string().optional().nullable(),
  variants: z.array(variantInputSchema).min(1, 'At least one variant (size & color) is required'),
});

export const createProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const businessId = req.businessId!;
  const branchId = req.branchId || (await prisma.branch.findFirst({ where: { businessId, isMain: true } }))?.id;

  if (!branchId) {
    res.status(400).json({ success: false, message: 'Branch context is required to register stock.' });
    return;
  }

  const data = createProductSchema.parse(req.body);
  const slug = `${data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;

  const created = await prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        businessId,
        name: data.name,
        slug,
        description: data.description,
        categoryId: data.categoryId,
        brandId: data.brandId || null,
        supplierId: data.supplierId || null,
        basePrice: data.basePrice,
        baseCost: data.baseCost,
        imageUrl: data.imageUrl,
      },
    });

    for (const v of data.variants) {
      const variant = await tx.productVariant.create({
        data: {
          productId: product.id,
          sku: v.sku,
          barcode: v.barcode || null,
          size: v.size,
          color: v.color,
          colorHex: v.colorHex || '#1E293B',
          costPrice: v.costPrice,
          sellingPrice: v.sellingPrice,
          reorderLevel: v.reorderLevel,
        },
      });

      // Initial branch stock balance
      await tx.inventoryBalance.create({
        data: {
          businessId,
          branchId,
          variantId: variant.id,
          quantityOnHand: v.initialStock || 0,
        },
      });

      if (v.initialStock && v.initialStock > 0) {
        await tx.stockMovement.create({
          data: {
            businessId,
            branchId,
            variantId: variant.id,
            movementType: 'OPENING_BALANCE',
            quantityChange: v.initialStock,
            previousQuantity: 0,
            newQuantity: v.initialStock,
            costPerUnit: v.costPrice,
            referenceType: 'MANUAL',
            notes: 'Product creation opening balance',
            createdByUserId: req.user?.id,
          },
        });
      }
    }

    return product;
  });

  res.status(201).json({
    success: true,
    message: 'Product and size/colour variants created successfully.',
    data: created,
  });
};

export const updateProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const businessId = req.businessId!;
  const { id } = req.params;
  const data = req.body;

  const existing = await prisma.product.findFirst({
    where: { id, businessId },
  });

  if (!existing) {
    res.status(404).json({ success: false, message: 'Product not found.' });
    return;
  }

  const updated = await prisma.product.update({
    where: { id },
    data: {
      name: data.name ?? existing.name,
      description: data.description ?? existing.description,
      categoryId: data.categoryId ?? existing.categoryId,
      brandId: data.brandId ?? existing.brandId,
      basePrice: data.basePrice ?? existing.basePrice,
      baseCost: data.baseCost ?? existing.baseCost,
      imageUrl: data.imageUrl ?? existing.imageUrl,
      isActive: data.isActive ?? existing.isActive,
    },
  });

  res.json({
    success: true,
    message: 'Product updated successfully.',
    data: updated,
  });
};
