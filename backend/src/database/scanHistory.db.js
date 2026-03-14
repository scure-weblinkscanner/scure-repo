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