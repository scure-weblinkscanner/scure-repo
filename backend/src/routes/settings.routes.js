import express from 'express';
import { getSettings, patchSettings } from '../controllers/settings.controller.js';

const router = express.Router();

router.get('/', getSettings);
router.patch('/', patchSettings);

export default router;
