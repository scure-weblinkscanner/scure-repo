import * as subscriptionPlanService from '../services/subscriptionPlan.service.js';

export const getSubscriptionByUser = async (req, res) => {
  try {
    if (String(req.params.uaId) !== String(req.user.uaId)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const result = await subscriptionPlanService.getSubscriptionByUser(req.params.uaId);
    res.status(200).json(result);
  } catch (error) {
    console.error(error); res.status(500).json({ error: 'Something went wrong.' });
  }
};

export const cancelSubscription = async (req, res) => {
  try {
    const result = await subscriptionPlanService.cancelSubscription(req.params.spId, req.user.uaId);
    res.status(200).json(result);
  } catch (error) {
    console.error(error); res.status(500).json({ error: 'Something went wrong.' });
  }
};

export const createSubscription = async (req, res) => {
  try {
    const { uaId, planId } = req.body;
    if (!uaId || !planId) return res.status(400).json({ error: 'uaId and planId are required' });
    const result = await subscriptionPlanService.createSubscription(uaId, planId);
    res.status(201).json(result);
  } catch (error) {
    console.error(error); res.status(500).json({ error: 'Something went wrong.' });
  }
};

export const upgradeSubscription = async (req, res) => {
  try {
    const result = await subscriptionPlanService.upgradeSubscription(req.user.uaId);
    res.status(200).json(result);
  } catch (error) {
    console.error(error); res.status(500).json({ error: 'Something went wrong.' });
  }
};
