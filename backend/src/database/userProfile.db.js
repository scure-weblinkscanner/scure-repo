import { supabase } from '../utils/supabaseClient.js'

export const createUserProfile = async (data) => {
  const { data: result, error } = await supabase
    .from('userProfile')
    .insert(data)
    .select()

  if (error) throw error
  return result
}

export const getAllUserProfiles = async () => {
  const { data: result, error } = await supabase
    .from('userProfile')
    .select('upId, upName, upDescription, upCreatedAt, upUpdatedAt')
    .order('upId', { ascending: true })

  if (error) throw error
  return result
}

export const getUserProfileById = async (upId) => {
  const { data: result, error } = await supabase
    .from('userProfile')
    .select('*')
    .eq('upId', upId)
    .single()

  if (error) throw error
  return result
}

export const searchUserProfiles = async (query) => {
  const { data: result, error } = await supabase
    .from('userProfile')
    .select('*')
    .ilike('upName', `%${query}%`)

  if (error) throw error
  return result
}

export const updateUserProfile = async (upId, updates) => {
  const { data: result, error } = await supabase
    .from('userProfile')
    .update(updates)
    .eq('upId', upId)
    .select()

  if (error) throw error
  return result
}

export const deleteUserProfile = async (upId) => {
  const { error } = await supabase
    .from('userProfile')
    .delete()
    .eq('upId', upId)

  if (error) throw error
}