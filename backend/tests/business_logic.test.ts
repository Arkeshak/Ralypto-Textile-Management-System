import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/index';
import prisma from '../src/db/prisma';

let authToken: string = '';
let businessId: string = '';
let branchId: string = '';
let sampleVariantId: string = '';
let sampleProductId: string = '';
let sampleSaleId: string = '';
let sampleSaleItemId: string = '';
let initialStock: number = 0;

beforeAll(async () => {
  // Login with seeded owner credentials
  const res = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'owner@ralypto.lk',
      password: 'password123',
    });

  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
  authToken = res.body.data.token;
  businessId = res.body.data.business.id;
  branchId = res.body.data.branches[0].id;
});

describe('Ralypto Dress Shop — Core Business Logic & Architecture Tests', () => {
  it('1. Auth: rejects invalid login credentials gracefully', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'owner@ralypto.lk',
        password: 'wrong_password_xyz',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('2. Multi-Tenant Protection: rejects unauthorized access without JWT token', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('3. Catalog & Variants: creates clothing product with multi-size/color variants and opening stock', async () => {
    const cat = await prisma.category.findFirst({ where: { businessId } });
    expect(cat).toBeTruthy();

    const uniqueSku = `TST-DRS-${Date.now().toString().slice(-4)}`;

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${authToken}`)
      .set('x-branch-id', branchId)
      .send({
        name: 'Test Chiffon Floral Maxi Dress',
        categoryId: cat!.id,
        basePrice: 5500,
        baseCost: 3000,
        variants: [
          {
            sku: `${uniqueSku}-S`,
            barcode: `999${Date.now().toString().slice(-6)}1`,
            size: 'S',
            color: 'Blush Pink',
            costPrice: 3000,
            sellingPrice: 5500,
            reorderLevel: 5,
            initialStock: 20,
          },
          {
            sku: `${uniqueSku}-M`,
            barcode: `999${Date.now().toString().slice(-6)}2`,
            size: 'M',
            color: 'Blush Pink',
            costPrice: 3000,
            sellingPrice: 5500,
            reorderLevel: 5,
            initialStock: 25,
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    sampleProductId = res.body.data.id;

    // Verify variants and stock ledger
    const variant = await prisma.productVariant.findFirst({
      where: { sku: `${uniqueSku}-S` },
      include: { balances: true, movements: true },
    });

    expect(variant).toBeTruthy();
    sampleVariantId = variant!.id;
    initialStock = variant!.balances[0].quantityOnHand;
    expect(initialStock).toBe(20);
    expect(variant!.movements.length).toBeGreaterThanOrEqual(1);
    expect(variant!.movements[0].movementType).toBe('OPENING_BALANCE');
  });

  it('4. POS Checkout: server recalculates line totals, deducts stock atomically, and creates ledger movement', async () => {
    const qtyToBuy = 3;

    const res = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${authToken}`)
      .set('x-branch-id', branchId)
      .send({
        branchId,
        items: [
          {
            variantId: sampleVariantId,
            quantity: qtyToBuy,
            discountAmount: 100, // 100 LKR line discount
          },
        ],
        payments: [
          {
            paymentMethod: 'CASH',
            amount: 5500 * qtyToBuy - 100, // exact verified amount
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.invoiceNumber).toMatch(/^INV-/);
    sampleSaleId = res.body.data.id;
    sampleSaleItemId = res.body.data.items[0].id;

    // Verify stock balance was deducted by exactly 3
    const updatedBalance = await prisma.inventoryBalance.findUnique({
      where: {
        branchId_variantId: {
          branchId,
          variantId: sampleVariantId,
        },
      },
    });

    expect(updatedBalance!.quantityOnHand).toBe(initialStock - qtyToBuy);

    // Verify immutable stock movement trace
    const movement = await prisma.stockMovement.findFirst({
      where: {
        referenceId: sampleSaleId,
        variantId: sampleVariantId,
      },
    });

    expect(movement).toBeTruthy();
    expect(movement!.movementType).toBe('SALE');
    expect(movement!.quantityChange).toBe(-qtyToBuy);
  });

  it('5. Negative Stock Guard: prevents overselling beyond available stock', async () => {
    const res = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${authToken}`)
      .set('x-branch-id', branchId)
      .send({
        branchId,
        items: [
          {
            variantId: sampleVariantId,
            quantity: 99999, // Exceeds available stock
          },
        ],
        payments: [{ paymentMethod: 'CASH', amount: 5500 * 99999 }],
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Insufficient stock');
  });

  it('6. Returns & Restock: processes customer return, restocks inventory, and creates trace', async () => {
    const beforeReturnBalance = await prisma.inventoryBalance.findUnique({
      where: {
        branchId_variantId: {
          branchId,
          variantId: sampleVariantId,
        },
      },
    });

    const res = await request(app)
      .post('/api/returns')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        saleId: sampleSaleId,
        reason: 'Wrong size selected by customer',
        disposition: 'RESTOCK',
        items: [
          {
            saleItemId: sampleSaleItemId,
            variantId: sampleVariantId,
            quantity: 1,
            refundAmount: 5400,
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.returnNumber).toMatch(/^RET-/);

    // Verify restocked by 1 unit
    const afterReturnBalance = await prisma.inventoryBalance.findUnique({
      where: {
        branchId_variantId: {
          branchId,
          variantId: sampleVariantId,
        },
      },
    });

    expect(afterReturnBalance!.quantityOnHand).toBe(beforeReturnBalance!.quantityOnHand + 1);

    // Verify return stock movement
    const movement = await prisma.stockMovement.findFirst({
      where: {
        referenceId: res.body.data.id,
        movementType: 'CUSTOMER_RETURN',
      },
    });
    expect(movement).toBeTruthy();
    expect(movement!.quantityChange).toBe(1);
  });

  it('7. Dashboard & Financial Metrics: calculates real sales revenue, gross profit, and inventory value', async () => {
    const res = await request(app)
      .get('/api/dashboard/metrics')
      .set('Authorization', `Bearer ${authToken}`)
      .set('x-branch-id', branchId);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const summary = res.body.data.summary;

    expect(summary.todayRevenue).toBeGreaterThan(0);
    expect(summary.todayGrossProfit).toBeGreaterThan(0);
    expect(summary.totalInventoryUnits).toBeGreaterThan(0);
    expect(summary.inventoryCostValue).toBeGreaterThan(0);
    expect(res.body.data.last7DaysTrend.length).toBe(7);
  });
});
