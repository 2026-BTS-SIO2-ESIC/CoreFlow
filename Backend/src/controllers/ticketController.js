const ticketService = require('../services/ticketService');


exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await ticketService.getAllTickets();
    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    console.error('Erreur lors de la récupération des tickets:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getItTickets = async (req, res) => {
  try {
    const tickets = await ticketService.getItTickets();
    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    console.error('Erreur lors de la récupération des tickets IT:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getRhTickets = async (req, res) => {
  try {
    const tickets = await ticketService.getRhTickets();
    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    console.error('Erreur lors de la récupération des tickets RH:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
const TicketService = require("../services/ticketService");

exports.create = async (req, res) => {
  try {
    // req.user vient de ton middleware d'auth (le token)
    const ticketId = await TicketService.createNewTicket(req.body, req.user);

    res.status(201).json({
      success: true,
      id: ticketId, // Très important pour mettre à jour le tableau sans recharger la page
      message: "Ticket créé",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création",
      error: error.message,
    });
  }
};

exports.getMyTickets = async (req, res) => {
  try {
    const userId = req.user.id;
    const tickets = await TicketService.getMyTickets(userId);
    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getTicketDetails = async (req, res) => {
  try {
    const ticket = await TicketService.getTicketById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket non trouvé" });
    
    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
