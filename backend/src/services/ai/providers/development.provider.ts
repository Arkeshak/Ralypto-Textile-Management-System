import { VirtualTryOnProvider, TryOnRequest, TryOnResult } from '../types';

// Map of realistic try-on composite samples keyed by garment characteristics
const DEV_COMPOSITE_PREVIEWS = [
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1000&auto=format&fit=crop&q=80',
];

export class DevelopmentTryOnProvider implements VirtualTryOnProvider {
  name = 'development-mode';
  private jobs: Map<string, { status: string; resultUrl: string; startTime: number }> = new Map();

  async generate(req: TryOnRequest): Promise<TryOnResult> {
    const jobId = `dev-job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // In development simulation, return an editorial composite preview of a model wearing a tailored garment
    const sampleIdx = Math.floor(Math.random() * DEV_COMPOSITE_PREVIEWS.length);
    const chosenPreview = DEV_COMPOSITE_PREVIEWS[sampleIdx] || req.garmentImage;

    // Store in-memory with creation timestamp to simulate realistic multi-second processing
    this.jobs.set(jobId, {
      status: 'PROCESSING',
      resultUrl: chosenPreview,
      startTime: Date.now(),
    });

    return {
      jobId,
      status: 'PROCESSING',
      provider: this.name,
      cost: 0.0,
      isDevelopmentMode: true,
      metadata: {
        disclaimer: 'Development mode simulation: Configure FASHN_API_KEY in backend/.env for live production inference.',
        category: req.category,
      },
    };
  }

  async checkStatus(providerJobId: string): Promise<TryOnResult> {
    const job = this.jobs.get(providerJobId);

    if (!job) {
      // If server restarted or job not found, return completed with demo sample
      return {
        jobId: providerJobId,
        status: 'COMPLETED',
        resultImageUrl: DEV_COMPOSITE_PREVIEWS[0],
        provider: this.name,
        cost: 0.0,
        isDevelopmentMode: true,
      };
    }

    // Complete after 2.5 seconds to allow UI loading animation testing
    const elapsed = Date.now() - job.startTime;
    if (elapsed >= 2500) {
      job.status = 'COMPLETED';
      return {
        jobId: providerJobId,
        status: 'COMPLETED',
        resultImageUrl: job.resultUrl,
        provider: this.name,
        cost: 0.0,
        isDevelopmentMode: true,
        metadata: {
          generationTimeMs: elapsed,
          notice: 'Development test simulation completed.',
        },
      };
    }

    return {
      jobId: providerJobId,
      status: 'PROCESSING',
      provider: this.name,
      isDevelopmentMode: true,
    };
  }
}
