import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/index';
import prisma from '../src/db/prisma';

let authToken: string = '';
let businessId: string = '';
let testProductId: string = '';
let testTryOnJobId: string = '';

// Valid 1x1 test PNG base64
const VALID_TEST_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

beforeAll(async () => {
  // Login with seeded owner credentials
  const res = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'owner@ralypto.lk',
      password: 'password123',
    });

  authToken = res.body.data.token;
  businessId = res.body.data.business.id;

  const product = await prisma.product.findFirst({
    where: { businessId, isActive: true },
  });
  testProductId = product!.id;
});

describe('AI Fashion Studio — Automated Test Suite', () => {
  it('1. AI Info: returns provider status and non-guarantee disclaimer', async () => {
    const res = await request(app).get('/api/ai/info');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.disclaimer).toContain('visual approximations');
    expect(res.body.data.name).toBeDefined();
  });

  it('2. Virtual Try-On: rejects requests without explicit customer consent', async () => {
    const res = await request(app)
      .post('/api/ai/try-on')
      .send({
        productId: testProductId,
        personImage: VALID_TEST_IMAGE,
        consentConfirmed: false, // Not confirmed
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('3. Virtual Try-On: rejects invalid / unsupported image formats', async () => {
    const res = await request(app)
      .post('/api/ai/try-on')
      .send({
        productId: testProductId,
        personImage: 'data:image/bmp;base64,Qk06AAAAAAAAADYAAAAoAAAAAQAAAAEAAAABABgAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAA=',
        consentConfirmed: true,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Unsupported format');
  });

  it('4. Virtual Try-On: successfully creates try-on job using authoritative product image', async () => {
    const res = await request(app)
      .post('/api/ai/try-on')
      .send({
        productId: testProductId,
        personImage: VALID_TEST_IMAGE,
        category: 'dresses',
        consentConfirmed: true,
        sessionId: 'test-session-123',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.productId).toBe(testProductId);
    expect(res.body.data.status).toBeDefined();
    testTryOnJobId = res.body.data.id;
  });

  it('5. Virtual Try-On: retrieves status and completed result', async () => {
    const res = await request(app).get(`/api/ai/try-on/${testTryOnJobId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.product).toBeDefined();
  });

  it('6. Privacy & Deletion: permanently deletes customer photo and generated result upon request', async () => {
    const delRes = await request(app).delete(`/api/ai/try-on/${testTryOnJobId}`);
    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);

    // Verify subsequent lookup is rejected / returns deleted status
    const getRes = await request(app).get(`/api/ai/try-on/${testTryOnJobId}`);
    expect(getRes.status).toBe(404);
  });

  it('7. AI Personal Stylist: returns verified outfits grounded in live database within budget', async () => {
    const res = await request(app)
      .post('/api/ai/stylist/recommend')
      .send({
        occasion: 'Sri Lankan Wedding Reception',
        preferredStyle: 'Traditional Elegance',
        maxBudgetLkr: 25000,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.outfits.length).toBeGreaterThan(0);

    const outfit = res.body.data.outfits[0];
    expect(outfit.totalCostLkr).toBeLessThanOrEqual(25000);
    expect(outfit.items.length).toBeGreaterThan(0);

    // Verify all item IDs exist in database
    for (const item of outfit.items) {
      const prodInDb = await prisma.product.findUnique({ where: { id: item.productId } });
      expect(prodInDb).toBeTruthy();
      expect(item.price).toBe(prodInDb!.basePrice);
    }
  });

  it('8. AI Product Photo Studio: processes background and requires approval to update product', async () => {
    const res = await request(app)
      .post('/api/ai/photo-studio/process')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        productId: testProductId,
        originalImageUrl: VALID_TEST_IMAGE,
        backgroundScene: 'COLOMBO_BOUTIQUE',
        generateCopy: true,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.result.processedImageUrl).toBeDefined();
    expect(res.body.data.result.generatedTitle).toBeDefined();
    expect(res.body.data.job.approved).toBe(false);

    // Test explicit owner approval
    const approveRes = await request(app)
      .post('/api/ai/photo-studio/approve')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        jobId: res.body.data.job.id,
        updateImage: true,
      });

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.success).toBe(true);
  });

  it('9. AI Inventory Insights: returns data-driven insights grounded in sales and stock', async () => {
    const res = await request(app)
      .get('/api/ai/inventory-insights')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.insights.length).toBeGreaterThan(0);

    const insight = res.body.data.insights[0];
    expect(insight.title).toBeDefined();
    expect(insight.supportingData).toBeDefined();
    expect(insight.confidenceScore).toBeGreaterThanOrEqual(80);
  });
});
