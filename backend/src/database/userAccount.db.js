// src/database/userAccount.db.js
import { supabase } from '../utils/supabaseClient.js'

export const createUserAccount = async (data) => {
  const { data: result, error } = await supabase
    .from('userAccount')
    .insert(data)
    .select()

  if (error) throw error
  return result
}

export const updateUserAccount = async (uaId, updates) => {
  const { data: result, error } = await supabase
    .from('userAccount')
    .update(updates)
    .eq('uaId', uaId)
    .select()

  if (error) throw error
  return result
}

export const deleteUserAccount = async (uaId) => {
  const { error } = await supabase
    .from('userAccount')
    .delete()
    .eq('uaId', uaId)

  if (error) throw error
}

export const getAllUserAccounts = async () => {
  const { data: result, error } = await supabase
    .from('userAccount')
    .select('*')

  if (error) throw error
  return result
}

export const getUserAccountById = async (uaId) => {
  const { data: result, error } = await supabase
    .from('userAccount')
    .select('*')
    .eq('uaId', uaId)
    .single()

  if (error) throw error
  return result
}

export const searchUserAccounts = async (query) => {
  const { data: result, error } = await supabase
    .from('userAccount')
    .select('*')
    .or(`uaUsername.ilike.%${query}%,uaEmail.ilike.%${query}%`)

  if (error) throw error
  return result
}

export const getUserAccountByEmail = async (email) => {
  const { data: result, error } = await supabase
    .from('userAccount')
    .select('*')
    .eq('uaEmail', email)
    .maybeSingle()
  if (error) throw error
  return result
}