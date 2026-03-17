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

export const createTicket = async (data) => {
  const { data: result, error } = await supabase
    .from('tickets')
    .insert(data)
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