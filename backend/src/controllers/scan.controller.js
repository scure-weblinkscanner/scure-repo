import { analyzeURL } from '../services/scan.service.js';
import { createScanHistory } from '../services/scanHistory.service.js';
import jwt from 'jsonwebtoken';

export const analyzeScan = async (req, res) => {
  try {
    const { url, scanMethod } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // extract userId from JWT
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.uaId;

    const result = await analyzeURL(url);

    // save to scan history (non-blocking — don't fail the scan if save fails)
    createScanHistory(userId, scanMethod ?? 'cameraUrl', result).catch((err) =>
      console.error('Failed to save scan history:', err.message)
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};