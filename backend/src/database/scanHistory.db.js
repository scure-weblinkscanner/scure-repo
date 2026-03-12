import { supabase } from '../utils/supabaseClient.js'

export const createScanHistory = async (data) => {
  const { data: result, error } = await supabase
    .from('scanHistory')
    .insert(data)
    .select()
  if (error) throw error
  return result
}