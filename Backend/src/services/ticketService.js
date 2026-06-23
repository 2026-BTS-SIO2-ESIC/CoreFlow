const TicketRepository = require("../repository/ticketRepository");

const TicketService = {
    // --- Listing all tickets ---
    getAllTickets: async () => {
        return await TicketRepository.getAllTickets();
    },

    // --- Listing IT tickets ---
    getItTickets: async () => {
        return await TicketRepository.getItTickets();
    },

    // --- Listing RH tickets ---
    getRhTickets: async () => {
        return await TicketRepository.getRhTickets();
    },

    // --- User-specific tickets ---
    getMyTickets: async (userId) => {
        return await TicketRepository.getByUserId(userId);
    },

    // --- Ticket operations ---
    createNewTicket: async (formData, userData) => {
        const ticketData = {
            ...formData,
            demandeur_id: userData.id,
        };
        return await TicketRepository.create(ticketData);
    },

    getTicketById: async (ticketId) => {
        return await TicketRepository.getById(ticketId);
    },

    // --- Take charge of a ticket ---
    takeChargeTicket: async (ticketId, userId) => {
        return await TicketRepository.takeCharge(ticketId, userId);
    },

    // --- Mark ticket as resolved ---
    resolvedTicket: async (ticketId, userId) => {
        return await TicketRepository.isResolved(ticketId, userId);
    },
    // --- Delete a ticket ---
    deleteTicket: async (ticketId) => {
        return await TicketRepository.DeleteTicket(ticketId);
    }
};

module.exports = TicketService;