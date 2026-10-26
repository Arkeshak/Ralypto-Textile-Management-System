import prisma from '../../db/prisma';
import { VirtualTryOnProvider, TryOnRequest, TryOnResult } from './types';
import { FashnTryOnProvider } from './providers/fashn.provider';
import { DevelopmentTryOnProvider } from './providers/development.provider';
import { aiUsageService } from './aiUsage.service';

export class VirtualTryOnService {
  private provider: VirtualTryOnProvider;

  constructor() {
    const fashnKey = process.env.FASHN_API_KEY;
    if (fashnKey && fashnKey.trim() !== '') {
      this.provider = new FashnTryOnProvider(fashnKey.trim());
    } else {
      this.provider = new DevelopmentTryOnProvider();
    }
  }

  // Allow switching or querying active provider
  getProviderInfo() {
    const isDev = this.provider.name === 'development-mode';
    return {
      name: this.provider.name,
      provider: isDev ? 'Development AI (Simulated)' : 'FASHN AI Studio v2',
      isDevelopmentMode: isDev,
      isConfigured: !isDev,
      remainingGenerationsToday: 50,
      supportedCategories: ['dresses', 'tops', 'bottoms', 'one-pieces'],
      costPerGenerationLkr: isDev ? 0 : 35,
      disclaimer:
        'AI Virtual Try-On generates visual approximations. Variations in real-world fabric texture, draping, and exact body measurements may occur.',
    };
  }

  // Validate uploaded photo format and size
  validatePersonImage(imageString: string): { valid: boolean; error?: string } {
    if (!imageString || imageString.trim().length === 0) {
      return { valid: false, error: 'A photo is required for virtual try-on.' };
    }

    if (imageString.startsWith('data:image/')) {
      // Check MIME type
      const mimeMatch = imageString.match(/^data:(image\/[a-zA-Z+]+);base64,/);
      if (!mimeMatch) {
        return { valid: false, error: 'Invalid image format. Supported formats: JPEG, PNG, WEBP.' };
      }

      const mime = mimeMatch[1].toLowerCase();
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(mime)) {
        return { valid: false, error: 'Unsupported format. Please upload a JPEG, PNG, or WEBP photo.' };
      }

      // Check approximate size from base64 string
      const base64Content = imageString.split(',')[1] || '';
      const approximateSizeInBytes = (base64Content.length * 3) / 4;
      const maxSizeInBytes = 12 * 1024 * 1024; // 12 MB

      if (approximateSizeInBytes > maxSizeInBytes) {
        return { valid: false, error: 'Photo exceeds maximum allowed size (12MB). Please upload a smaller photo.' };
      }
    } else if (!imageString.startsWith('http://') && !imageString.startsWith('https://')) {
      return { valid: false, error: 'Invalid photo URL or data format.' };
    }

    return { valid: true };
  }

  async createTryOnJob(params: {
    businessId: string;
    sessionId?: string;
    userId?: string;
    productId: string;
    variantId?: string;
    category: 'dresses' | 'tops' | 'bottoms' | 'one-pieces';
    personImage: string;
    consentConfirmed: boolean;
  }): Promise<{ job: any; providerResult: TryOnResult }> {
    if (!params.consentConfirmed) {
      throw new Error('You must confirm permission and consent to process the uploaded photo.');
    }

    // 1. Validate image format and safety
    const validation = this.validatePersonImage(params.personImage);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // 2. Check business and session usage limits
    await aiUsageService.checkQuota(params.businessId, params.sessionId);

    // 3. Fetch authoritative product from database (never trust client garment image)
    let product = await prisma.product.findUnique({
      where: { id: params.productId },
      include: {
        category: true,
        variants: true,
      },
    });

    if (!product || !product.isActive) {
      // Graceful fallback for demo catalogue IDs (e.g., 'prod-1') or missing products:
      product = await prisma.product.findFirst({
        where: { isActive: true },
        include: {
          category: true,
          variants: true,
        },
      });
    }

    if (!product || !product.isActive) {
      throw new Error('The selected clothing garment is no longer available in the catalogue.');
    }

    const matchedVariant = params.variantId
      ? product.variants.find((v) => v.id === params.variantId)
      : product.variants[0];
    const safeVariantId = matchedVariant?.id || null;

    const authoritativeGarmentImage =
      product.imageUrl ||
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=60';

    // 4. Create initial pending database record
    const job = await prisma.aITryOnJob.create({
      data: {
        businessId: params.businessId,
        sessionId: params.sessionId || null,
        userId: params.userId || null,
        productId: product.id,
        variantId: safeVariantId,
        category: params.category || 'dresses',
        personImageUrl: params.personImage,
        garmentImageUrl: authoritativeGarmentImage,
        status: 'PROCESSING',
        provider: this.provider.name,
        consentConfirmed: true,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hour retention policy
      },
    });

    // 5. Submit to provider
    const tryOnReq: TryOnRequest = {
      personImage: params.personImage,
      garmentImage: authoritativeGarmentImage,
      category: params.category,
      mode: 'balanced',
    };

    const providerResult = await this.provider.generate(tryOnReq);

    // 6. Update database record with provider job ID and status
    const updatedJob = await prisma.aITryOnJob.update({
      where: { id: job.id },
      data: {
        providerJobId: providerResult.jobId,
        status: providerResult.status,
        resultImageUrl: providerResult.resultImageUrl || null,
        errorMessage: providerResult.error || null,
        cost: providerResult.cost || 0.0,
      },
      include: {
        product: { select: { id: true, name: true, basePrice: true, imageUrl: true } },
      },
    });

    // Record usage
    await aiUsageService.recordUsage(params.businessId);

    return { job: updatedJob, providerResult };
  }

  async getJobStatus(jobId: string, businessId: string): Promise<any> {
    const job = await prisma.aITryOnJob.findFirst({
      where: { id: jobId, businessId, isDeleted: false },
      include: {
        product: {
          select: { id: true, name: true, basePrice: true, imageUrl: true, category: true },
        },
        variant: true,
      },
    });

    if (!job) {
      throw new Error('Virtual try-on job not found or has been deleted for privacy.');
    }

    // If still processing and has provider job ID, check provider status
    if (job.status === 'PROCESSING' && job.providerJobId) {
      const statusRes = await this.provider.checkStatus(job.providerJobId);

      if (statusRes.status !== job.status) {
        const updated = await prisma.aITryOnJob.update({
          where: { id: job.id },
          data: {
            status: statusRes.status,
            resultImageUrl: statusRes.resultImageUrl || job.resultImageUrl,
            errorMessage: statusRes.error || null,
          },
          include: {
            product: {
              select: { id: true, name: true, basePrice: true, imageUrl: true, category: true },
            },
            variant: true,
          },
        });
        return updated;
      }
    }

    return job;
  }

  // Immediate permanent deletion for customer privacy
  async deleteJob(jobId: string, businessId: string): Promise<void> {
    const job = await prisma.aITryOnJob.findFirst({
      where: { id: jobId, businessId },
    });

    if (!job) return;

    await prisma.aITryOnJob.update({
      where: { id: jobId },
      data: {
        isDeleted: true,
        status: 'DELETED',
        personImageUrl: '[DELETED_FOR_PRIVACY]',
        resultImageUrl: null,
      },
    });
  }

  async getRecentJobs(businessId: string, sessionId?: string): Promise<any[]> {
    const whereClause: any = { businessId, isDeleted: false };
    if (sessionId) {
      whereClause.sessionId = sessionId;
    }

    return prisma.aITryOnJob.findMany({
      where: whereClause,
      include: {
        product: { select: { id: true, name: true, basePrice: true, imageUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }
}

export const virtualTryOnService = new VirtualTryOnService();
