// src/controllers/subscriptionPlan.controller.js
import * as subscriptionPlanService from '../services/subscriptionPlan.service.js'

export const getSubscriptionByUser = async (req, res) => {
  try {
    const result = await subscriptionPlanService.getSubscriptionByUser(req.params.uaId)
    res.status(200).json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const cancelSubscription = async (req, res) => {
  try {
    const { uaId } = req.body
    if (!uaId) return res.status(400).json({ error: 'uaId is required' })
    const result = await subscriptionPlanService.cancelSubscription(req.params.spId, uaId)
    res.status(200).json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const createSubscription = async (req, res) => {
  try {
    const { uaId, planId } = req.body
    if (!uaId || !planId) return res.status(400).json({ error: 'uaId and planId are required' })
    const result = await subscriptionPlanService.createSubscription(uaId, planId)
    res.status(201).json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const upgradeSubscription = async (req, res) => {
  try {
    const { uaId } = req.body
    if (!uaId) return res.status(400).json({ error: 'uaId is required' })
    const result = await subscriptionPlanService.upgradeSubscription(uaId)
    res.status(200).json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}