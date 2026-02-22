import express from 'express';
import { analyzeScan } from '../controllers/scan.controller.js';

const router = express.Router();

router.post('/analyze', analyzeScan);

export default router;