const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { authenticate } = require('../middlewares/authMiddleware');

router.use(authenticate);

// Middleware to check role authorization
const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    next();
  };
};

// GET /api/ticket/tickets - Liste tous les tickets (admin et manager seulement)
router.get('/tickets', authorizeRole(['admin', 'manager']), ticketController.getAllTickets);

// GET /api/ticket/itTickets - Liste tous les tickets IT (IT seulement)
router.get('/itTickets', authorizeRole(['it']), ticketController.getItTickets);

// GET /api/ticket/rhTickets - Liste tous les tickets RH (RH seulement)
router.get('/rhTickets', authorizeRole(['rh']), ticketController.getRhTickets);

// POST /api/ticket - Créer un nouveau ticket
router.post('/', ticketController.create);

// GET /api/ticket/my-tickets - Récupérer les tickets de l'utilisateur connecté
router.get('/my-tickets', ticketController.getMyTickets);

// GET /api/ticket/:id - Récupérer les détails d'un ticket
router.get('/:id', ticketController.getTicketDetails);

module.exports = router;