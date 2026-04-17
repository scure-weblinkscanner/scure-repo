import express from 'express';
import { getAllTickets, getTicketById, getTicketsByUser, createTicket, respondToTicket } from '../controllers/tickets.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAdmin, getAllTickets);
router.get('/user/:uaId', requireAuth, getTicketsByUser);
router.get('/:tkId', requireAuth, getTicketById);
router.post('/', requireAuth, createTicket);
router.patch('/:tkId/respond', requireAdmin, respondToTicket);

export default router;
