// src/services/subscriptionPlan.service.js
import * as subscriptionPlanDb from '../database/subscriptionPlan.db.js'
import * as userAccountDb from '../database/userAccount.db.js'

export const getSubscriptionByUser = async (uaId) => {
  const subscription = await subscriptionPlanDb.getSubscriptionByUser(uaId)
  if (!subscription) throw new Error('Subscription not found')
  return subscription
}

export const cancelSubscription = async (spId, uaId) => {
  const result = await subscriptionPlanDb.cancelSubscription(spId)
  await userAccountDb.updateUserAccount(uaId, { uaUserProfileId: 2 })
  return result
}

export const createSubscription = async (uaId, planId) => {
  const nextBillingDate = planId === 3
    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    : null

  return await subscriptionPlanDb.createSubscription({
    spUaId: uaId,
    spPlanId: planId,
    spStatus: 'active',
    spNextBillingDate: nextBillingDate,
  })
}

export const upgradeSubscription = async (uaId) => {
  // Update subscriptionPlan table
  const result = await subscriptionPlanDb.upgradeSubscription(uaId)

  // Upgrade userAccount to Premium (profileId = 3)
  await userAccountDb.updateUserAccount(uaId, { uaUserProfileId: 3 })

  // Return updated account so frontend can sync sessionStorage
  const updatedAccount = await userAccountDb.getUserAccountById(uaId)
  return { subscription: result, account: updatedAccount }
}