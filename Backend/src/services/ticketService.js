const TicketRepository = require("../repositories/ticketRepository");

const TicketService = {
  createNewTicket: async (formData, userData) => {
    const ticketData = {
      ...formData,
      demandeur_id: userData.id, // Utilise 'id' de la nouvelle structure
    };
    return await TicketRepository.create(ticketData);
  },

  getUserTickets: async (userId) => {
    return await TicketRepository.getByUserId(userId);
  },

  getTicketById: async (ticketId) => {
    return await TicketRepository.getById(ticketId);
  },
};

module.exports = TicketService;
