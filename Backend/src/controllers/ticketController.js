const userService = require('../services/ticketService');


exports.getAllTickets = async (req, res) => {
  try {
    const users = await userService.listTickets(); res.json(users); // on retourne la liste des utilisateurs au client 
  } catch (error) {
    console.error('Erreur lors de la récupération des tickets:', error); // on log l'erreur pour le débogage 
    res.status(500).json({ error: error.message }); // en cas d'erreur, on retourne une réponse avec le code 500 et le message d'erreur 
  };
}

exports.getItTickets = async (req, res) => {
  try {
    const users = await userService.listItTickets(); res.json(users); // on retourne la liste des utilisateurs au client 
  } catch (error) {
    console.error('Erreur lors de la récupération des tickets:', error); // on log l'erreur pour le débogage 
    res.status(500).json({ error: error.message }); // en cas d'erreur, on retourne une réponse avec le code 500 et le message d'erreur 
  };
}

exports.getRhTickets = async (req, res) => {
  try {
    const users = await userService.listRhTickets(); res.json(users); // on retourne la liste des utilisateurs au client 
  } catch (error) {
    console.error('Erreur lors de la récupération des tickets:', error); // on log l'erreur pour le débogage 
    res.status(500).json({ error: error.message }); // en cas d'erreur, on retourne une réponse avec le code 500 et le message d'erreur 
  };
}
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
    const userId = req.user.id; // Changé de idUtilisateurs -> id
    const tickets = await TicketService.getUserTickets(userId);
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
