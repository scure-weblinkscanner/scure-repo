import { analyzeURL, factCheckURL } from '../services/scan.service.js';
import { createScanHistory, getScanHistoryByUserId, publishScanHistory, getPublicScans, getScanActivity, getAllScansAdmin } from '../services/scanHistory.service.js';
import { getSubscriptionByUser } from '../database/subscriptionPlan.db.js';

const PREMIUM_PROFILE_ID = 3;

export const analyzeScan = async (req, res) => {
  try {
    const { url, scanMethod, skipBlocklist, adDetection } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const userId = req.user.uaId;

    const subscription = await getSubscriptionByUser(userId);
    const isPremium = subscription?.spPlanId === 3 && subscription?.spStatus === 'active';

    const result = await analyzeURL(url, isPremium, isPremium && !!adDetection, !!skipBlocklist);

    // Don't save blocklist fast-returns — the "Continue" full scan will save the complete result
    if (!result.blocklist) {
      createScanHistory(userId, scanMethod ?? 'cameraUrl', result).catch((err) =>
        console.error('Failed to save scan history:', err.message)
      );
    }

    res.status(200).json(result);
  } catch (error) {
    console.error(error); res.status(500).json({ error: 'Something went wrong.' });
  }
};

// (Premium only)
export const factCheckScan = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const subscription = await getSubscriptionByUser(req.user.uaId);
    const isPremium = subscription?.spPlanId === 3 && subscription?.spStatus === 'active';
    if (!isPremium) {
      return res.status(403).json({ error: 'This feature is available for Premium users only.' });
    }

    const result = await factCheckURL(url);
    res.status(200).json(result);
  } catch (error) {
    console.error(error); res.status(500).json({ error: 'Something went wrong.' });
  }
};

export const getScanHistory = async (req, res) => {
  try {
    const history = await getScanHistoryByUserId(req.user.uaId);
    res.status(200).json({ history });
  } catch (error) {
    console.error(error); res.status(500).json({ message: 'Something went wrong.' });
  }
};

export const publishScan = async (req, res) => {
  try {
    const { shId } = req.params;
    const result = await publishScanHistory(shId, req.user.uaId);
    res.status(200).json({ result });
  } catch (error) {
    console.error(error); res.status(500).json({ message: 'Something went wrong.' });
  }
};

export const getPublicScansList = async (req, res) => {
  try {
    const scans = await getPublicScans()
    res.status(200).json({ scans })
  } catch (error) {
    console.error(error); res.status(500).json({ message: 'Something went wrong.' })
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
    console.error(error); res.status(500).json({ message: 'Something went wrong.' })
  }
}

export const getAllScansAdminController = async (req, res) => {
  try {
    const scans = await getAllScansAdmin()
    res.status(200).json({ scans })
  } catch (error) {
    console.error(error); res.status(500).json({ message: 'Something went wrong.' })
  }
}
