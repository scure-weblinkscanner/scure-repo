import * as ticketsService from '../services/tickets.service.js';

export const getAllTickets = async (req, res) => {
  try {
    const tickets = await ticketsService.getAllTickets();
    res.status(200).json({ tickets });
  } catch (error) {
    console.error(error); res.status(500).json({ message: 'Something went wrong.' });
  }
};

export const getTicketById = async (req, res) => {
  try {
    const { tkId } = req.params;
    const ticket = await ticketsService.getTicketById(tkId);
    res.status(200).json({ ticket });
  } catch (error) {
    console.error(error); res.status(500).json({ message: 'Something went wrong.' });
  }
};

export const getTicketsByUser = async (req, res) => {
  try {
    const { uaId } = req.params;
    if (String(uaId) !== String(req.user.uaId)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const tickets = await ticketsService.getTicketsByUser(uaId);
    res.status(200).json({ tickets });
  } catch (error) {
    console.error(error); res.status(500).json({ message: 'Something went wrong.' });
  }
};

export const createTicket = async (req, res) => {
  try {
    const { tkSubject, tkDescription } = req.body;
    if (!tkSubject || !tkDescription) {
      return res.status(400).json({ message: 'Subject and description are required' });
    }
    const ticket = await ticketsService.createTicket(req.user.uaId, tkSubject, tkDescription);
    res.status(201).json({ ticket });
  } catch (error) {
    console.error(error); res.status(500).json({ message: 'Something went wrong.' });
  }
};

export const respondToTicket = async (req, res) => {
  try {
    const { tkId } = req.params;
    const { tkAdminResponse, tkStatus } = req.body;
    if (!tkAdminResponse) {
      return res.status(400).json({ message: 'Response is required' });
    }
    const validStatuses = ['open', 'in_progress', 'resolved'];
    if (!tkStatus || !validStatuses.includes(tkStatus)) {
      return res.status(400).json({ message: 'A valid status is required' });
    }
    const ticket = await ticketsService.respondToTicket(tkId, tkAdminResponse, tkStatus ?? 'resolved');
    res.status(200).json({ ticket });
  } catch (error) {
    console.error(error); res.status(500).json({ message: 'Something went wrong.' });
  }
};
