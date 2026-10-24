import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permission.middleware';

// Controllers
import * as authController from '../controllers/auth.controller';
import * as productsController from '../controllers/products.controller';
import * as inventoryController from '../controllers/inventory.controller';
import * as salesController from '../controllers/sales.controller';
import * as returnsController from '../controllers/returns.controller';
import * as customersController from '../controllers/customers.controller';
import * as suppliersController from '../controllers/suppliers.controller';
import * as expensesController from '../controllers/expenses.controller';
import * as dashboardController from '../controllers/dashboard.controller';
import * as reportsController from '../controllers/reports.controller';
import * as categoriesController from '../controllers/categories.controller';

const router = Router();

// 1. Auth & Setup
router.post('/auth/login', authController.login);
router.post('/auth/register-setup', authController.registerSetup);
router.get('/auth/me', authenticate, authController.getMe);

// 2. Dashboard
router.get('/dashboard/metrics', authenticate, dashboardController.getDashboardMetrics);

// 3. Products & Variants
router.get('/products', authenticate, productsController.getProducts);
router.get('/products/search-barcode/:code', authenticate, productsController.searchByBarcode);
router.get('/products/:id', authenticate, productsController.getProductById);
router.post('/products', authenticate, requirePermission('products:manage'), productsController.createProduct);
router.put('/products/:id', authenticate, requirePermission('products:manage'), productsController.updateProduct);

// 4. Categories & Brands
router.get('/categories', authenticate, categoriesController.getCategories);
router.post('/categories', authenticate, requirePermission('products:manage'), categoriesController.createCategory);
router.get('/brands', authenticate, categoriesController.getBrands);
router.post('/brands', authenticate, requirePermission('products:manage'), categoriesController.createBrand);

// 5. Inventory & Stock Ledger
router.get('/inventory/ledger', authenticate, inventoryController.getInventoryLedger);
router.get('/inventory/balances', authenticate, inventoryController.getInventoryBalances);
router.get('/inventory/valuation', authenticate, inventoryController.getInventoryValuation);
router.post('/inventory/receive', authenticate, requirePermission('inventory:manage'), inventoryController.receiveStock);
router.post('/inventory/adjust', authenticate, requirePermission('inventory:manage'), inventoryController.adjustStock);

// 6. POS Sales & Invoices
router.get('/sales', authenticate, salesController.getSales);
router.get('/sales/:id', authenticate, salesController.getSaleById);
router.post('/sales', authenticate, salesController.createSale);

// 7. Returns & Exchanges
router.get('/returns', authenticate, returnsController.getReturns);
router.post('/returns', authenticate, returnsController.processReturn);

// 8. Customers & Credit
router.get('/customers', authenticate, customersController.getCustomers);
router.get('/customers/:id', authenticate, customersController.getCustomerById);
router.post('/customers', authenticate, customersController.createCustomer);
router.post('/customers/:id/payments', authenticate, customersController.recordCustomerPayment);

// 9. Suppliers & Purchasing
router.get('/suppliers', authenticate, suppliersController.getSuppliers);
router.post('/suppliers', authenticate, suppliersController.createSupplier);

// 10. Expenses
router.get('/expenses', authenticate, expensesController.getExpenses);
router.post('/expenses', authenticate, expensesController.createExpense);

// 11. Reports & Analytics
router.get('/reports/sales', authenticate, requirePermission('reports:view'), reportsController.getSalesReport);
router.get('/reports/product-margins', authenticate, requirePermission('reports:view'), reportsController.getProductMarginReport);

// 12. Staff
router.get('/staff', authenticate, requirePermission('settings:manage'), categoriesController.getStaff);

// 13. AI Fashion Studio (Virtual Try-On, Personal Stylist, Photo Studio, Inventory Insights)
import aiRoutes from './ai.routes';
router.use('/ai', aiRoutes);

export default router;
