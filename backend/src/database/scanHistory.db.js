import { supabase } from '../utils/supabaseClient.js'

export const createScanHistory = async (data) => {
  const { data: result, error } = await supabase
    .from('scanHistory')
    .insert(data)
    .select()
  if (error) throw error
  return result
}

export const getScanHistoryByUserId = async (userId) => {
  const { data, error } = await supabase
    .from('scanHistory')
    .select('*')
    .eq('shUserId', userId)
    .order('shCreatedAt', { ascending: false })
  if (error) throw error
  return data
}

export const publishScanHistory = async (shId, userId) => {
  const { data, error } = await supabase
    .from('scanHistory')
    .update({ shScanVisibility: 'public' })
    .eq('shId', shId)
    .eq('shUserId', userId)
    .select()
  if (error) throw error
  return data
}

export const getPublicScans = async () => {
  const { data, error } = await supabase
    .from('scanHistory')
    .select(`
      *,
      userAccount (
        uaUsername
      )
    `)
    .eq('shScanVisibility', 'public')
    .order('shCreatedAt', { ascending: false })
  if (error) throw error
  return data
}

export const getScanActivity = async (period) => {
  const now = new Date()
  let startDate

  if (period === 'daily') {
    startDate = new Date(now)
    startDate.setHours(0, 0, 0, 0)
  } else if (period === 'weekly') {
    startDate = new Date(now)
    startDate.setDate(now.getDate() - 6)
    startDate.setHours(0, 0, 0, 0)
  } else {
    startDate = new Date(now)
    startDate.setDate(now.getDate() - 29)
    startDate.setHours(0, 0, 0, 0)
  }

  const { data, error } = await supabase
    .from('scanHistory')
    .select('shCreatedAt, shVerdict')
    .gte('shCreatedAt', startDate.toISOString())
    .order('shCreatedAt', { ascending: true })
  if (error) throw error
  return data
}

export const getAllScansAdmin = async () => {
  const { data, error } = await supabase
    .from('scanHistory')
    .select(`*, userAccount(uaUsername, uaEmail)`)
    .order('shCreatedAt', { ascending: false })
  if (error) throw error
  return data
}