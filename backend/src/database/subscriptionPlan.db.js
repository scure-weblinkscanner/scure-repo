// src/database/subscriptionPlan.db.js
import { supabase } from '../utils/supabaseClient.js'

export const getSubscriptionByUser = async (uaId) => {
  const { data: result, error } = await supabase
    .from('subscriptionPlan')
    .select('*')
    .eq('spUaId', uaId)
    .single()

  if (error) throw error
  return result
}

export const cancelSubscription = async (spId) => {
  const { data: result, error } = await supabase
    .from('subscriptionPlan')
    .update({ spStatus: 'cancelled' })
    .eq('spId', spId)
    .select()

  if (error) throw error
  return result
}

export const createSubscription = async (data) => {
  const { data: result, error } = await supabase
    .from('subscriptionPlan')
    .insert(data)
    .select()

  if (error) throw error
  return result
}

export const upgradeSubscription = async (uaId) => {
  const nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0]

  const { data: result, error } = await supabase
    .from('subscriptionPlan')
    .update({
      spPlanId: 3,
      spStatus: 'active',
      spNextBillingDate: nextBillingDate,
    })
    .eq('spUaId', uaId)
    .select()

  if (error) throw error
  return result
}