import express from 'express';
import {
  analyzeScan,
  factCheckScan,
  getScanHistory,
  publishScan,
  getPublicScansList,
  getScanActivityController,
  getAllScansAdminController,
} from '../controllers/scan.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { scanLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

router.post('/analyze', requireAuth, scanLimiter, analyzeScan);
router.post('/fact-check', requireAuth, scanLimiter, factCheckScan);
router.get('/history', requireAuth, getScanHistory);
router.patch('/history/:shId/publish', requireAuth, publishScan);
router.get('/public', getPublicScansList);
router.get('/admin/activity', requireAdmin, getScanActivityController);
router.get('/admin/all', requireAdmin, getAllScansAdminController);

export default router;
