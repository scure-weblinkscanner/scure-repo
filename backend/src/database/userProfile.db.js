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
    .select('*')

  if (error) throw error
  return result
}

export const getUserProfileById = async (userProfileId) => {
  const { data: result, error } = await supabase
    .from('userProfile')
    .select('*')
    .eq('userProfileId', userProfileId)
    .single()

  if (error) throw error
  return result
}

export const searchUserProfiles = async (query) => {
  const { data: result, error } = await supabase
    .from('userProfile')
    .select('*')
    .ilike('profileName', `%${query}%`)

  if (error) throw error
  return result
}

export const updateUserProfile = async (userProfileId, updates) => {
  const { data: result, error } = await supabase
    .from('userProfile')
    .update(updates)
    .eq('userProfileId', userProfileId)
    .select()

  if (error) throw error
  return result
}

export const deleteUserProfile = async (userProfileId) => {
  const { error } = await supabase
    .from('userProfile')
    .delete()
    .eq('userProfileId', userProfileId)

  if (error) throw error
}