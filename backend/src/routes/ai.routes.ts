import { Router } from 'express';
import * as aiController from '../controllers/ai.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Middleware that optionally authenticates if Bearer token present, but allows guest access
const optionalAuthenticate = (req: any, res: any, next: any) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return authenticate(req, res, next);
  }
  next();
};

// 1. AI System Info & Provider Status
router.get('/info', aiController.getAIInfo);
router.get('/usage-quota', optionalAuthenticate, aiController.getUsageQuota);

// 2. AI Virtual Try-On
router.post('/try-on', optionalAuthenticate, aiController.createVirtualTryOn);
router.get('/try-on/history', optionalAuthenticate, aiController.getTryOnHistory);
router.get('/try-on/:id', optionalAuthenticate, aiController.getTryOnStatus);
router.delete('/try-on/:id', optionalAuthenticate, aiController.deleteTryOn);

// 3. AI Personal Stylist
router.post('/stylist/recommend', optionalAuthenticate, aiController.getStylistRecommendations);

// 4. AI Product Photo Studio (Owner / Manager)
router.post('/photo-studio/process', authenticate, aiController.processPhotoStudio);
router.post('/photo-studio/approve', authenticate, aiController.approvePhotoStudio);

// 5. AI Inventory Insights
router.get('/inventory-insights', authenticate, aiController.getInventoryInsights);

export default router;
