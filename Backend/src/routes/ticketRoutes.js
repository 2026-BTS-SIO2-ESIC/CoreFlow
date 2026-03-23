const express = require('express');
const router = express.Router();
const userController = require('../controllers/ticketController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { validateUserCreation, validateUserUpdate } = require('../middlewares/validationMiddleware');

router.use(authenticate);

// GET /api/ticket/tickets - Liste tous les tickets
router.get('/tickets', userController.getAllTickets);

// GET /api/ticket/itTickets - Liste tous les tickets de la catégorie IT
router.get('/itTickets', userController.getItTickets);

// GET /api/ticket/rhTickets - Liste tous les tickets de la catégorie RH
router.get('/rhTickets', userController.getRhTickets);



const ticketController = require('../controllers/ticketController');

router.post('/', authenticate, ticketController.create);
router.get('/my-tickets', authenticate, ticketController.getMyTickets);
router.get('/:id', authenticate, ticketController.getTicketDetails);

module.exports = router;