import express from 'express';
import {
  analyzeScan,
  factCheckScan,
  getScanHistory,
  publishScan,
  getPublicScansList,
  getScanActivityController,
  getAllScansAdminController,
} from '../controllers/scan.controller.js'

const router = express.Router();

router.post('/analyze', analyzeScan);
router.post('/fact-check', factCheckScan); 
router.get('/history', getScanHistory);
router.patch('/history/:shId/publish', publishScan);
router.get('/public', getPublicScansList)
router.get('/admin/activity', getScanActivityController)
router.get('/admin/all', getAllScansAdminController)

export default router;