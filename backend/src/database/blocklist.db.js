import { supabase } from '../utils/supabaseClient.js'

export const checkUrlInBlocklist = async (url) => {
  const { data, error } = await supabase
    .from('blocklist')
    .select('blId, blUrl, blSource, blThreatType, blAddedAt')
    .eq('blUrl', url)
    .eq('blIsActive', true)
    .maybeSingle()
  if (error) throw error
  return data
}

export const addToBlocklist = async (url, source, threatType = null) => {
  const { error } = await supabase
    .from('blocklist')
    .insert({ blUrl: url, blSource: source, blThreatType: threatType })
    .throwOnError()
  // ON CONFLICT is handled via the UNIQUE constraint — duplicate inserts are
  // ignored by catching the unique-violation error code at the service layer.
  if (error && error.code !== '23505') throw error
}

export const bulkInsertBlocklist = async (rows) => {
  const { error } = await supabase
    .from('blocklist')
    .upsert(rows, { onConflict: 'blUrl', ignoreDuplicates: true })
  if (error) throw error
}
