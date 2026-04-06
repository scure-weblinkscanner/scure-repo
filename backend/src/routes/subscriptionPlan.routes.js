// src/routes/subscriptionPlan.routes.js
import express from 'express'
import * as subscriptionPlanController from '../controllers/subscriptionPlan.controller.js'

const router = express.Router()

router.post('/', subscriptionPlanController.createSubscription)
router.get('/user/:uaId', subscriptionPlanController.getSubscriptionByUser)
router.put('/upgrade', subscriptionPlanController.upgradeSubscription)
router.put('/:spId/cancel', subscriptionPlanController.cancelSubscription)

export default router