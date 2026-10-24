import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../types';
import { virtualTryOnService } from '../services/ai/virtualTryOn.service';
import { aiStylistService } from '../services/ai/aiStylist.service';
import { productPhotoStudioService } from '../services/ai/productPhotoStudio.service';
import { inventoryInsightsService } from '../services/ai/inventoryInsights.service';
import { aiUsageService } from '../services/ai/aiUsage.service';
import prisma from '../db/prisma';

export const getAIInfo = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const info = virtualTryOnService.getProviderInfo();
  res.json({
    success: true,
    data: info,
  });
};

const tryOnSchema = z.object({
  productId: z.string().min(1, 'Product selection is required'),
  variantId: z.string().optional().nullable(),
  category: z.enum(['dresses', 'tops', 'bottoms', 'one-pieces']).default('dresses'),
  personImage: z.string().min(10, 'A valid customer photo is required'),
  consentConfirmed: z.boolean().refine((val) => val === true, {
    message: 'Customer permission and consent must be confirmed.',
  }),
  sessionId: z.string().optional(),
});

export const createVirtualTryOn = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId || (await prisma.business.findFirst())?.id;
    if (!businessId) {
      res.status(400).json({ success: false, message: 'Business context not found' });
      return;
    }

    const data = tryOnSchema.parse(req.body);

    const result = await virtualTryOnService.createTryOnJob({
      businessId,
      sessionId: data.sessionId || (req.headers['x-session-id'] as string),
      userId: req.user?.id,
      productId: data.productId,
      variantId: data.variantId || undefined,
      category: data.category,
      personImage: data.personImage,
      consentConfirmed: data.consentConfirmed,
    });

    res.status(201).json({
      success: true,
      message: 'Virtual try-on job submitted successfully.',
      data: result.job,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: error.errors[0]?.message || 'Validation error',
        errors: error.errors,
      });
      return;
    }
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to initiate virtual try-on',
    });
  }
};

export const getTryOnStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const businessId = req.businessId || (await prisma.business.findFirst())?.id;
  const { id } = req.params;

  if (!businessId) {
    res.status(400).json({ success: false, message: 'Business context not found' });
    return;
  }

  try {
    const job = await virtualTryOnService.getJobStatus(id, businessId);
    res.json({
      success: true,
      data: job,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message || 'Try-on job not found',
    });
  }
};

export const deleteTryOn = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const businessId = req.businessId || (await prisma.business.findFirst())?.id;
  const { id } = req.params;

  if (!businessId) {
    res.status(400).json({ success: false, message: 'Business context not found' });
    return;
  }

  try {
    await virtualTryOnService.deleteJob(id, businessId);
    res.json({
      success: true,
      message: 'Customer photo and virtual try-on preview deleted permanently.',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete try-on record',
    });
  }
};

export const getTryOnHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const businessId = req.businessId || (await prisma.business.findFirst())?.id;
  const sessionId = (req.query.sessionId as string) || (req.headers['x-session-id'] as string);

  if (!businessId) {
    res.status(400).json({ success: false, message: 'Business context not found' });
    return;
  }

  const jobs = await virtualTryOnService.getRecentJobs(businessId, sessionId);
  res.json({
    success: true,
    data: jobs,
  });
};

// 2. AI Stylist
const stylistSchema = z.object({
  occasion: z.string().min(2, 'Occasion is required'),
  preferredStyle: z.string().optional(),
  preferredColors: z.array(z.string()).optional(),
  maxBudgetLkr: z.number().positive().optional(),
  genderOrCategory: z.string().optional(),
  size: z.string().optional(),
  formality: z.enum(['casual', 'smart-casual', 'formal', 'luxury-ethnic']).optional(),
});

export const getStylistRecommendations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId || (await prisma.business.findFirst())?.id;
    if (!businessId) {
      res.status(400).json({ success: false, message: 'Business context not found' });
      return;
    }

    const data = stylistSchema.parse(req.body);

    const result = await aiStylistService.getRecommendations(businessId, data);
    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: error.errors[0]?.message || 'Validation error' });
      return;
    }
    res.status(400).json({
      success: false,
      message: error.message || 'Stylist recommendation failed',
    });
  }
};

// 3. AI Photo Studio
const photoStudioSchema = z.object({
  productId: z.string().optional(),
  originalImageUrl: z.string().min(5, 'Original product image is required'),
  backgroundScene: z.enum([
    'LUXURY_STUDIO',
    'COLOMBO_BOUTIQUE',
    'TROPICAL_CEYLON',
    'MINIMALIST_SLATE',
    'RUNWAY_VELVET',
  ]).default('LUXURY_STUDIO'),
  generateCopy: z.boolean().default(true),
});

export const processPhotoStudio = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const businessId = req.businessId || (await prisma.business.findFirst())?.id;
    if (!businessId) {
      res.status(400).json({ success: false, message: 'Business context not found' });
      return;
    }

    const data = photoStudioSchema.parse(req.body);

    const result = await productPhotoStudioService.processProductImage(businessId, data);
    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: error.errors[0]?.message || 'Validation error' });
      return;
    }
    res.status(400).json({
      success: false,
      message: error.message || 'Photo studio processing failed',
    });
  }
};

export const approvePhotoStudio = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const businessId = req.businessId || (await prisma.business.findFirst())?.id;
  const { jobId, updateTitle, updateDescription, updateImage } = req.body;

  if (!businessId || !jobId) {
    res.status(400).json({ success: false, message: 'Job ID and business context required' });
    return;
  }

  try {
    const result = await productPhotoStudioService.approveAndPublish(jobId, businessId, {
      title: updateTitle ?? true,
      description: updateDescription ?? true,
      image: updateImage ?? true,
    });
    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to approve photo studio update',
    });
  }
};

// 4. AI Inventory Insights
export const getInventoryInsights = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const businessId = req.businessId || (await prisma.business.findFirst())?.id;
  if (!businessId) {
    res.status(400).json({ success: false, message: 'Business context not found' });
    return;
  }

  try {
    const result = await inventoryInsightsService.getInsights(businessId);
    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to load inventory insights',
    });
  }
};

// 5. Usage Quota
export const getUsageQuota = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const businessId = req.businessId || (await prisma.business.findFirst())?.id;
  if (!businessId) {
    res.status(400).json({ success: false, message: 'Business context not found' });
    return;
  }

  const quota = await aiUsageService.getQuota(businessId);
  res.json({
    success: true,
    data: quota,
  });
};
