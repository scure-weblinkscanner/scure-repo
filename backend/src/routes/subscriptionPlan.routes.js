import express from 'express';
import * as subscriptionPlanController from '../controllers/subscriptionPlan.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/', requireAdmin, subscriptionPlanController.createSubscription);
router.get('/user/:uaId', requireAuth, subscriptionPlanController.getSubscriptionByUser);
router.put('/upgrade', requireAuth, subscriptionPlanController.upgradeSubscription);
router.put('/:spId/cancel', requireAuth, subscriptionPlanController.cancelSubscription);

export default router;
