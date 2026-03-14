import express from 'express';
import { analyzeScan, getScanHistory, publishScan, getPublicScansList } from '../controllers/scan.controller.js';

const router = express.Router();

router.post('/analyze', analyzeScan);
router.get('/history', getScanHistory);
router.patch('/history/:shId/publish', publishScan);
router.get('/public', getPublicScansList)

export default router;