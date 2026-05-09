import { supabase } from '../utils/supabaseClient.js'

export const getAllTickets = async () => {
  const { data, error } = await supabase
    .from('tickets')
    .select(`*, userAccount(uaUsername, uaEmail)`)
    .order('tkCreatedAt', { ascending: false })
  if (error) throw error
  return data
}

export const getTicketById = async (tkId) => {
  const { data, error } = await supabase
    .from('tickets')
    .select(`*, userAccount(uaUsername, uaEmail)`)
    .eq('tkId', tkId)
    .single()
  if (error) throw error
  return data
}

export const getTicketsByUser = async (uaId) => {
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('tkUserId', uaId)
    .order('tkCreatedAt', { ascending: false })
  if (error) throw error
  return data
}

export const createTicket = async ({ tkUserId, tkSubject, tkDescription }) => {
  const { data: result, error } = await supabase
    .from('tickets')
    .insert([{ tkUserId, tkSubject, tkDescription, tkStatus: 'open' }])
    .select()
  if (error) throw error
  return result
}

export const respondToTicket = async (tkId, tkAdminResponse, tkStatus) => {
  const { data, error } = await supabase
    .from('tickets')
    .update({
      tkAdminResponse,
      tkStatus,
      tkUpdatedAt: new Date().toISOString(),
    })
    .eq('tkId', tkId)
    .select()
  if (error) throw error
  return data
}