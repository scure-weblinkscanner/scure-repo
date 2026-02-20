import express from 'express';
import multer from 'multer';
import { scanImageForURLs } from '../controllers/scanURL.controller.js';

const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.post('/ocr', upload.single('image'), scanImageForURLs);

export default router;