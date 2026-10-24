import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding Ralypto Dress Shop Database ---');

  // 1. Create Business
  const business = await prisma.business.create({
    data: {
      name: 'Ralypto Boutique',
      legalName: 'Ralypto Apparel & Retail (Pvt) Ltd',
      phone: '+94 11 258 9632',
      email: 'info@ralyptoboutique.lk',
      address: '42 Galle Road, Bambalapitiya, Colombo 03, Sri Lanka',
      currency: 'LKR',
      timezone: 'Asia/Colombo',
      taxRate: 0.0,
      receiptFooter: 'Thank you for choosing Ralypto! Exchange within 7 days with original tag and receipt.',
    },
  });

  // 2. Branches
  const mainBranch = await prisma.branch.create({
    data: {
      businessId: business.id,
      name: 'Flagship Boutique - Colombo 03',
      code: 'COL-03',
      address: '42 Galle Road, Colombo 03',
      phone: '+94 11 258 9632',
      isMain: true,
      isActive: true,
    },
  });

  const kandyBranch = await prisma.branch.create({
    data: {
      businessId: business.id,
      name: 'Kandy City Centre Branch',
      code: 'KND-01',
      address: 'Shop 24, Level 2, Kandy City Centre, Kandy',
      phone: '+94 81 220 5411',
      isMain: false,
      isActive: true,
    },
  });

  // 3. Roles
  const ownerRole = await prisma.role.create({
    data: {
      businessId: business.id,
      name: 'Owner',
      description: 'Full business administration and settings access',
      permissions: JSON.stringify(['*']),
      isSystem: true,
    },
  });

  const managerRole = await prisma.role.create({
    data: {
      businessId: business.id,
      name: 'Manager',
      description: 'Store operations, discount approval, stock management, reports',
      permissions: JSON.stringify([
        'sales:view', 'sales:create', 'sales:return', 'discounts:apply',
        'products:view', 'products:manage', 'inventory:view', 'inventory:manage',
        'expenses:view', 'expenses:create', 'customers:view', 'customers:manage',
        'reports:view'
      ]),
      isSystem: true,
    },
  });

  const cashierRole = await prisma.role.create({
    data: {
      businessId: business.id,
      name: 'Cashier',
      description: 'Front-desk POS sales, receipt printing, customer registration',
      permissions: JSON.stringify([
        'sales:view', 'sales:create', 'products:view', 'customers:view', 'customers:create'
      ]),
      isSystem: true,
    },
  });

  // 4. Users (default password: "password123")
  const passwordHash = await bcrypt.hash('password123', 10);

  const ownerUser = await prisma.user.create({
    data: {
      businessId: business.id,
      branchId: mainBranch.id,
      name: 'Nadeeka Wickramasinghe',
      email: 'owner@ralypto.lk',
      phone: '+94 77 712 3456',
      passwordHash,
      roleId: ownerRole.id,
    },
  });

  const managerUser = await prisma.user.create({
    data: {
      businessId: business.id,
      branchId: mainBranch.id,
      name: 'Ruwan Senanayake',
      email: 'manager@ralypto.lk',
      phone: '+94 71 823 4567',
      passwordHash,
      roleId: managerRole.id,
    },
  });

  const cashierUser = await prisma.user.create({
    data: {
      businessId: business.id,
      branchId: mainBranch.id,
      name: 'Sanduni Fernando',
      email: 'cashier@ralypto.lk',
      phone: '+94 76 934 5678',
      passwordHash,
      roleId: cashierRole.id,
    },
  });

  // 5. Categories
  const categoriesData = [
    { name: 'Dresses & Gowns', slug: 'dresses-gowns', description: 'Casual, party and formal evening dresses' },
    { name: 'Sarees & Ethnic Wear', slug: 'sarees-ethnic', description: 'Handloom, silk sarees and kurthis' },
    { name: 'Linen Shirts & Tops', slug: 'linen-shirts-tops', description: 'Pure breathable linen casualwear' },
    { name: 'Trousers & Denims', slug: 'trousers-denims', description: 'Pants, culottes and stretch denim' },
    { name: 'Abayas & Modest Wear', slug: 'abayas-modest', description: 'Contemporary modest fashion and hijabs' },
    { name: 'Bags & Accessories', slug: 'accessories', description: 'Belts, scarves and hand bags' },
  ];

  const categories: Record<string, any> = {};
  for (const cat of categoriesData) {
    categories[cat.slug] = await prisma.category.create({
      data: { businessId: business.id, ...cat },
    });
  }

  // 6. Brands
  const brandsData = [
    { name: 'Ralypto Signature', slug: 'ralypto-signature', description: 'In-house luxury fashion line' },
    { name: 'Linen Luxe', slug: 'linen-luxe', description: '100% Sri Lankan crafted pure linen' },
    { name: 'Ceylon Silk Weaves', slug: 'ceylon-silk', description: 'Authentic local silk and handloom' },
    { name: 'Urban Chic', slug: 'urban-chic', description: 'Contemporary high-street daily fashion' },
  ];

  const brands: Record<string, any> = {};
  for (const b of brandsData) {
    brands[b.slug] = await prisma.brand.create({
      data: { businessId: business.id, ...b },
    });
  }

  // 7. Suppliers
  const colomboGarments = await prisma.supplier.create({
    data: {
      businessId: business.id,
      name: 'Colombo Apparel Millers',
      contactPerson: 'Mr. Pradeep Alwis',
      phone: '+94 11 285 4120',
      email: 'orders@colomboapparel.lk',
      address: '15 High Level Road, Maharagama',
      outstandingBalance: 45000.0,
    },
  });

  const handloomSuppliers = await prisma.supplier.create({
    data: {
      businessId: business.id,
      name: 'Lanka Handloom Artisans',
      contactPerson: 'Mrs. Chandrika Silva',
      phone: '+94 33 222 1890',
      email: 'info@handloomart.lk',
      address: '88 Kandy Road, Gampaha',
      outstandingBalance: 0.0,
    },
  });

  // 8. Customers
  const customer1 = await prisma.customer.create({
    data: {
      businessId: business.id,
      name: 'Dilani Perera',
      phone: '0771234567',
      email: 'dilani.perera@gmail.com',
      address: '28 Alfred House Gardens, Colombo 03',
      creditLimit: 50000.0,
      outstandingBalance: 0.0,
      loyaltyPoints: 120,
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      businessId: business.id,
      name: 'Fatima Zahra',
      phone: '0765554321',
      email: 'fatima.zahra@hotmail.com',
      address: '14 Station Road, Dehiwala',
      creditLimit: 30000.0,
      outstandingBalance: 6500.0,
      loyaltyPoints: 240,
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      businessId: business.id,
      name: 'Kavindu Jayawardena',
      phone: '0719876543',
      email: 'kavindu.j@outlook.com',
      address: '56 Hotel Road, Mount Lavinia',
      creditLimit: 0.0,
      outstandingBalance: 0.0,
      loyaltyPoints: 45,
    },
  });

  // 9. Products and Variants
  const productsCatalog = [
    {
      name: 'Emerald Floral Tiered Maxi Dress',
      slug: 'emerald-floral-tiered-maxi-dress',
      description: 'Elegant tiered chiffon maxi dress featuring delicate floral embroidery and adjustable waist tie.',
      categoryId: categories['dresses-gowns'].id,
      brandId: brands['ralypto-signature'].id,
      supplierId: colomboGarments.id,
      basePrice: 5450,
      baseCost: 3100,
      imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=60',
      variants: [
        { sku: 'EMR-MAX-S', barcode: '794000101', size: 'S', color: 'Emerald Green', colorHex: '#047857', cost: 3100, price: 5450, stock: 12 },
        { sku: 'EMR-MAX-M', barcode: '794000102', size: 'M', color: 'Emerald Green', colorHex: '#047857', cost: 3100, price: 5450, stock: 18 },
        { sku: 'EMR-MAX-L', barcode: '794000103', size: 'L', color: 'Emerald Green', colorHex: '#047857', cost: 3100, price: 5450, stock: 15 },
        { sku: 'NAV-MAX-S', barcode: '794000104', size: 'S', color: 'Midnight Navy', colorHex: '#1E293B', cost: 3100, price: 5450, stock: 10 },
        { sku: 'NAV-MAX-M', barcode: '794000105', size: 'M', color: 'Midnight Navy', colorHex: '#1E293B', cost: 3100, price: 5450, stock: 14 },
        { sku: 'NAV-MAX-L', barcode: '794000106', size: 'L', color: 'Midnight Navy', colorHex: '#1E293B', cost: 3100, price: 5450, stock: 8 },
      ],
    },
    {
      name: 'Pure Handloom Traditional Cotton Saree',
      slug: 'pure-handloom-traditional-cotton-saree',
      description: 'Handwoven 100% combed cotton saree with vibrant zari border and matching unstitched blouse piece.',
      categoryId: categories['sarees-ethnic'].id,
      brandId: brands['ceylon-silk'].id,
      supplierId: handloomSuppliers.id,
      basePrice: 11900,
      baseCost: 7200,
      imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=60',
      variants: [
        { sku: 'SAR-GLD-FS', barcode: '794000201', size: 'Free Size', color: 'Mustard Gold', colorHex: '#D97706', cost: 7200, price: 11900, stock: 6 },
        { sku: 'SAR-MRN-FS', barcode: '794000202', size: 'Free Size', color: 'Maroon Crimson', colorHex: '#991B1B', cost: 7200, price: 11900, stock: 8 },
        { sku: 'SAR-TEL-FS', barcode: '794000203', size: 'Free Size', color: 'Teal Peacock', colorHex: '#0F766E', cost: 7200, price: 11900, stock: 4 },
      ],
    },
    {
      name: 'Breezy Linen Mandarin Collar Shirt',
      slug: 'breezy-linen-mandarin-collar-shirt',
      description: 'Relaxed fit pre-washed organic linen shirt with coconut shell buttons, tailored for tropical comfort.',
      categoryId: categories['linen-shirts-tops'].id,
      brandId: brands['linen-luxe'].id,
      supplierId: colomboGarments.id,
      basePrice: 3950,
      baseCost: 2200,
      imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=60',
      variants: [
        { sku: 'LIN-WHT-M', barcode: '794000301', size: 'M', color: 'Crisp White', colorHex: '#F8FAFC', cost: 2200, price: 3950, stock: 22 },
        { sku: 'LIN-WHT-L', barcode: '794000302', size: 'L', color: 'Crisp White', colorHex: '#F8FAFC', cost: 2200, price: 3950, stock: 25 },
        { sku: 'LIN-WHT-XL', barcode: '794000303', size: 'XL', color: 'Crisp White', colorHex: '#F8FAFC', cost: 2200, price: 3950, stock: 14 },
        { sku: 'LIN-BLU-M', barcode: '794000304', size: 'M', color: 'Sky Blue', colorHex: '#38BDF8', cost: 2200, price: 3950, stock: 16 },
        { sku: 'LIN-BLU-L', barcode: '794000305', size: 'L', color: 'Sky Blue', colorHex: '#38BDF8', cost: 2200, price: 3950, stock: 19 },
        { sku: 'LIN-OLV-M', barcode: '794000306', size: 'M', color: 'Olive Green', colorHex: '#4D7C0F', cost: 2200, price: 3950, stock: 12 },
      ],
    },
    {
      name: 'Pleated Modest Front-Open Abaya',
      slug: 'pleated-modest-front-open-abaya',
      description: 'Premium Korean Nida fabric abaya with subtle pleating, hidden snap closures, and matching chiffon hijab.',
      categoryId: categories['abayas-modest'].id,
      brandId: brands['ralypto-signature'].id,
      supplierId: colomboGarments.id,
      basePrice: 8950,
      baseCost: 5100,
      imageUrl: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800&auto=format&fit=crop&q=60',
      variants: [
        { sku: 'ABY-BLK-54', barcode: '794000401', size: '54', color: 'Jet Black', colorHex: '#0F172A', cost: 5100, price: 8950, stock: 8 },
        { sku: 'ABY-BLK-56', barcode: '794000402', size: '56', color: 'Jet Black', colorHex: '#0F172A', cost: 5100, price: 8950, stock: 10 },
        { sku: 'ABY-GRY-56', barcode: '794000403', size: '56', color: 'Charcoal Gray', colorHex: '#475569', cost: 5100, price: 8950, stock: 5 },
      ],
    },
    {
      name: 'High-Waist Wide-Leg Linen Culottes',
      slug: 'high-waist-wide-leg-linen-culottes',
      description: 'Comfortable high-rise trousers with elastic back waistband, deep side pockets, and relaxed flow.',
      categoryId: categories['trousers-denims'].id,
      brandId: brands['urban-chic'].id,
      supplierId: colomboGarments.id,
      basePrice: 4250,
      baseCost: 2400,
      imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=60',
      variants: [
        { sku: 'CUL-BEI-S', barcode: '794000501', size: 'S', color: 'Sand Beige', colorHex: '#D4B996', cost: 2400, price: 4250, stock: 9 },
        { sku: 'CUL-BEI-M', barcode: '794000502', size: 'M', color: 'Sand Beige', colorHex: '#D4B996', cost: 2400, price: 4250, stock: 12 },
        { sku: 'CUL-BLK-M', barcode: '794000503', size: 'M', color: 'Black', colorHex: '#0F172A', cost: 2400, price: 4250, stock: 15 },
      ],
    },
  ];

  const createdVariants: any[] = [];

  for (const item of productsCatalog) {
    const product = await prisma.product.create({
      data: {
        businessId: business.id,
        name: item.name,
        slug: item.slug,
        description: item.description,
        categoryId: item.categoryId,
        brandId: item.brandId,
        supplierId: item.supplierId,
        basePrice: item.basePrice,
        baseCost: item.baseCost,
        imageUrl: item.imageUrl,
        isActive: true,
      },
    });

    for (const v of item.variants) {
      const variant = await prisma.productVariant.create({
        data: {
          productId: product.id,
          sku: v.sku,
          barcode: v.barcode,
          size: v.size,
          color: v.color,
          colorHex: v.colorHex,
          costPrice: v.cost,
          sellingPrice: v.price,
          reorderLevel: 5,
          isActive: true,
        },
      });

      createdVariants.push({ variant, product, initialStock: v.stock });

      // Create branch inventory balance for Main Branch
      await prisma.inventoryBalance.create({
        data: {
          businessId: business.id,
          branchId: mainBranch.id,
          variantId: variant.id,
          quantityOnHand: v.stock,
          allocatedQuantity: 0,
        },
      });

      // Record initial opening stock movement in ledger
      await prisma.stockMovement.create({
        data: {
          businessId: business.id,
          branchId: mainBranch.id,
          variantId: variant.id,
          movementType: 'OPENING_BALANCE',
          quantityChange: v.stock,
          previousQuantity: 0,
          newQuantity: v.stock,
          costPerUnit: v.cost,
          referenceType: 'MANUAL',
          notes: 'Initial opening stock ledger entry',
          createdByUserId: ownerUser.id,
        },
      });

      // Also create Kandy branch stock (lower level)
      const kandyStock = Math.max(2, Math.floor(v.stock / 2));
      await prisma.inventoryBalance.create({
        data: {
          businessId: business.id,
          branchId: kandyBranch.id,
          variantId: variant.id,
          quantityOnHand: kandyStock,
          allocatedQuantity: 0,
        },
      });
    }
  }

  // 10. Create Initial Completed Sales for live Dashboard demonstration
  // Sale 1
  const sale1Item = createdVariants[0]; // Emerald Maxi S (price 5450)
  const sale1 = await prisma.sale.create({
    data: {
      businessId: business.id,
      branchId: mainBranch.id,
      invoiceNumber: 'INV-COL03-20261024-0001',
      customerId: customer1.id,
      cashierUserId: cashierUser.id,
      subtotal: 5450,
      discountAmount: 0,
      taxAmount: 0,
      grandTotal: 5450,
      paidAmount: 5450,
      balanceDue: 0,
      paymentStatus: 'PAID',
      paymentMethod: 'CARD',
      notes: 'Customer card payment via Commercial Bank POS',
      items: {
        create: [
          {
            variantId: sale1Item.variant.id,
            productName: sale1Item.product.name,
            variantDetails: `Size: ${sale1Item.variant.size}, Color: ${sale1Item.variant.color}`,
            quantity: 1,
            unitCost: sale1Item.variant.costPrice,
            unitPrice: sale1Item.variant.sellingPrice,
            discountAmount: 0,
            totalPrice: 5450,
          },
        ],
      },
      payments: {
        create: [
          {
            businessId: business.id,
            paymentMethod: 'CARD',
            amount: 5450,
            referenceNote: 'VISA **** 4819',
          },
        ],
      },
    },
  });

  // Record stock movement for Sale 1
  await prisma.stockMovement.create({
    data: {
      businessId: business.id,
      branchId: mainBranch.id,
      variantId: sale1Item.variant.id,
      movementType: 'SALE',
      quantityChange: -1,
      previousQuantity: sale1Item.initialStock,
      newQuantity: sale1Item.initialStock - 1,
      costPerUnit: sale1Item.variant.costPrice,
      referenceType: 'SALE',
      referenceId: sale1.id,
      notes: `POS checkout invoice INV-COL03-20261024-0001`,
      createdByUserId: cashierUser.id,
    },
  });

  // Update Inventory balance
  await prisma.inventoryBalance.update({
    where: {
      branchId_variantId: {
        branchId: mainBranch.id,
        variantId: sale1Item.variant.id,
      },
    },
    data: {
      quantityOnHand: sale1Item.initialStock - 1,
    },
  });

  // Sale 2 (Linen shirt + Saree)
  const sale2Item1 = createdVariants[7]; // Linen Shirt M White (3950)
  const sale2Item2 = createdVariants[6]; // Saree Teal (11900)
  const sale2Subtotal = 3950 + 11900;
  const sale2Discount = 850; // Discount applied
  const sale2GrandTotal = sale2Subtotal - sale2Discount; // 15000

  const sale2 = await prisma.sale.create({
    data: {
      businessId: business.id,
      branchId: mainBranch.id,
      invoiceNumber: 'INV-COL03-20261024-0002',
      customerId: customer2.id,
      cashierUserId: cashierUser.id,
      subtotal: sale2Subtotal,
      discountAmount: sale2Discount,
      taxAmount: 0,
      grandTotal: sale2GrandTotal,
      paidAmount: sale2GrandTotal,
      balanceDue: 0,
      paymentStatus: 'PAID',
      paymentMethod: 'CASH',
      notes: 'Weekend boutique promo discount approved by manager',
      items: {
        create: [
          {
            variantId: sale2Item1.variant.id,
            productName: sale2Item1.product.name,
            variantDetails: `Size: ${sale2Item1.variant.size}, Color: ${sale2Item1.variant.color}`,
            quantity: 1,
            unitCost: sale2Item1.variant.costPrice,
            unitPrice: sale2Item1.variant.sellingPrice,
            discountAmount: 200,
            totalPrice: 3750,
          },
          {
            variantId: sale2Item2.variant.id,
            productName: sale2Item2.product.name,
            variantDetails: `Size: ${sale2Item2.variant.size}, Color: ${sale2Item2.variant.color}`,
            quantity: 1,
            unitCost: sale2Item2.variant.costPrice,
            unitPrice: sale2Item2.variant.sellingPrice,
            discountAmount: 650,
            totalPrice: 11250,
          },
        ],
      },
      payments: {
        create: [
          {
            businessId: business.id,
            paymentMethod: 'CASH',
            amount: sale2GrandTotal,
            referenceNote: 'Cash received at till',
          },
        ],
      },
    },
  });

  // Deduct stock and record movements for sale 2
  await prisma.inventoryBalance.update({
    where: {
      branchId_variantId: {
        branchId: mainBranch.id,
        variantId: sale2Item1.variant.id,
      },
    },
    data: {
      quantityOnHand: { decrement: 1 },
    },
  });

  await prisma.inventoryBalance.update({
    where: {
      branchId_variantId: {
        branchId: mainBranch.id,
        variantId: sale2Item2.variant.id,
      },
    },
    data: {
      quantityOnHand: { decrement: 1 },
    },
  });

  // 11. Initial Operational Expenses
  await prisma.expense.createMany({
    data: [
      {
        businessId: business.id,
        branchId: mainBranch.id,
        category: 'Electricity',
        description: 'Ceylon Electricity Board monthly bill for boutique AC & lighting',
        amount: 32500,
        paymentMethod: 'BANK_TRANSFER',
        recordedByUserId: ownerUser.id,
      },
      {
        businessId: business.id,
        branchId: mainBranch.id,
        category: 'Packaging',
        description: '500 custom gold-foiled luxury paper shopping bags',
        amount: 18500,
        paymentMethod: 'CASH',
        recordedByUserId: managerUser.id,
      },
      {
        businessId: business.id,
        branchId: mainBranch.id,
        category: 'Marketing',
        description: 'Meta and Instagram targeted ads for festive collection',
        amount: 15000,
        paymentMethod: 'CARD',
        recordedByUserId: ownerUser.id,
      },
    ],
  });

  console.log('--- Seeding completed successfully! ---');
  console.log('Owner Login: owner@ralypto.lk / password123');
  console.log('Cashier Login: cashier@ralypto.lk / password123');
  console.log('Manager Login: manager@ralypto.lk / password123');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
