import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config';
import apiRoutes from './routes/api.routes';
import { errorHandler } from './middlewares/errorHandler.middleware';

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // Allow frontend dev server and network access
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-branch-id'],
}));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));
app.use(morgan('dev'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    product: 'Ralypto Dress Shop Management System',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    currency: config.defaultCurrency,
    timezone: config.defaultTimezone,
  });
});

// Mount Master API Router
app.use('/api', apiRoutes);

// Global Error Handler
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`=======================================================`);
    console.log(`👗 RALYPTO DRESS SHOP MANAGER — BACKEND SERVER RUNNING`);
    console.log(`🚀 Port: http://localhost:${config.port}`);
    console.log(`🩺 Health: http://localhost:${config.port}/health`);
    console.log(`📦 Database: SQLite local dev (Prisma)`);
    console.log(`🇱🇰 Market: Sri Lanka (LKR, Asia/Colombo)`);
    console.log(`=======================================================`);
  });
}

export default app;
