import express from 'express';
import { getSettings, patchSettings } from '../controllers/settings.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, getSettings);
router.patch('/', requireAuth, patchSettings);

export default router;
