import { VirtualTryOnProvider, TryOnRequest, TryOnResult } from '../types';

export class FashnTryOnProvider implements VirtualTryOnProvider {
  name = 'fashn-ai';
  private apiKey: string;
  private baseUrl = 'https://api.fashn.ai/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Map application categories to FASHN API supported categories
  private mapCategory(cat: string): 'tops' | 'bottoms' | 'one-pieces' {
    if (cat === 'bottoms') return 'bottoms';
    if (cat === 'tops') return 'tops';
    return 'one-pieces'; // Dresses, sarees, abayas, gowns
  }

  async generate(req: TryOnRequest): Promise<TryOnResult> {
    try {
      const category = this.mapCategory(req.category);

      const payload = {
        model_image: req.personImage,
        garment_image: req.garmentImage,
        category,
        mode: req.mode || 'balanced',
        adjust_hands: req.adjustHands ?? true,
        cover_feet: req.coverFeet ?? false,
        restore_background: true,
      };

      const response = await fetch(`${this.baseUrl}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      const data: any = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error?.message || `FASHN API error: ${response.status} ${response.statusText}`);
      }

      const jobId = data.id;
      const initialStatus = data.status || 'starting';

      if (initialStatus === 'completed' && data.output && data.output.length > 0) {
        return {
          jobId,
          status: 'COMPLETED',
          resultImageUrl: data.output[0],
          provider: this.name,
          cost: 15.0, // Standard FASHN API credit approx cost in LKR
        };
      }

      return {
        jobId,
        status: 'PROCESSING',
        provider: this.name,
        cost: 15.0,
      };
    } catch (error: any) {
      return {
        jobId: `fashn-err-${Date.now()}`,
        status: 'FAILED',
        provider: this.name,
        error: error.message || 'FASHN AI request failed',
      };
    }
  }

  async checkStatus(providerJobId: string): Promise<TryOnResult> {
    try {
      const response = await fetch(`${this.baseUrl}/status/${providerJobId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      const data: any = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error?.message || `FASHN status check failed: ${response.status}`);
      }

      if (data.status === 'completed' && data.output && data.output.length > 0) {
        return {
          jobId: providerJobId,
          status: 'COMPLETED',
          resultImageUrl: data.output[0],
          provider: this.name,
          cost: 15.0,
        };
      }

      if (data.status === 'failed') {
        return {
          jobId: providerJobId,
          status: 'FAILED',
          provider: this.name,
          error: data.error?.message || 'Virtual try-on generation failed on provider',
        };
      }

      return {
        jobId: providerJobId,
        status: 'PROCESSING',
        provider: this.name,
      };
    } catch (error: any) {
      return {
        jobId: providerJobId,
        status: 'FAILED',
        provider: this.name,
        error: error.message || 'Status check failed',
      };
    }
  }
}
