import * as ticketsDb from '../database/tickets.db.js'

export const getAllTickets = async () => {
  return await ticketsDb.getAllTickets()
}

export const getTicketById = async (tkId) => {
  return await ticketsDb.getTicketById(tkId)
}

export const createTicket = async (tkUserId, tkSubject, tkDescription) => {
  return await ticketsDb.createTicket({ tkUserId, tkSubject, tkDescription })
}

export const respondToTicket = async (tkId, tkAdminResponse, tkStatus) => {
  return await ticketsDb.respondToTicket(tkId, tkAdminResponse, tkStatus)
}