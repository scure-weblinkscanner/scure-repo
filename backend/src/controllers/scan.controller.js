import { analyzeURL } from '../services/scan.service.js';
import { createScanHistory, getScanHistoryByUserId, publishScanHistory, getPublicScans, getScanActivity, getAllScansAdmin } from '../services/scanHistory.service.js'
import { getSubscriptionByUser } from '../database/subscriptionPlan.db.js'
import jwt from 'jsonwebtoken';

export const analyzeScan = async (req, res) => {
  try {
    const { url, scanMethod, skipBlocklist, adDetection } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.uaId;

    const subscription = await getSubscriptionByUser(userId)
    const isPremium = subscription?.spPlanId === 3 && subscription?.spStatus === 'active'

    const result = await analyzeURL(url, isPremium, isPremium && !!adDetection, !!skipBlocklist);

    // Don't save blocklist fast-returns — the "Continue" full scan will save the complete result
    if (!result.blocklist) {
      createScanHistory(userId, scanMethod ?? 'cameraUrl', result).catch((err) =>
        console.error('Failed to save scan history:', err.message)
      );
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('[analyzeScan] 500 error:', error.message, error.stack);
    res.status(500).json({ error: error.message });
  }
};

export const getScanHistory = async (req, res) => {
  try {
    const decoded = jwt.verify(req.headers.authorization?.split(' ')[1], process.env.JWT_SECRET);
    const userId = decoded.uaId;
    const history = await getScanHistoryByUserId(userId);
    res.status(200).json({ history });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const publishScan = async (req, res) => {
  try {
    const decoded = jwt.verify(req.headers.authorization?.split(' ')[1], process.env.JWT_SECRET);
    const userId = decoded.uaId;
    const { shId } = req.params;
    const result = await publishScanHistory(shId, userId);
    res.status(200).json({ result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPublicScansList = async (req, res) => {
  try {
    const scans = await getPublicScans()
    res.status(200).json({ scans })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getScanActivityController = async (req, res) => {
  try {
    const { period } = req.query
    const validPeriods = ['daily', 'weekly', 'monthly']
    if (!validPeriods.includes(period)) {
      return res.status(400).json({ message: 'Invalid period. Use daily, weekly, or monthly' })
    }
    const data = await getScanActivity(period)
    res.status(200).json({ data })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getAllScansAdminController = async (req, res) => {
  try {
    const scans = await getAllScansAdmin()
    res.status(200).json({ scans })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
