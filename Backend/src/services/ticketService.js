const userRepository = require('../Repository/ticketRepository');

async function listTickets() {
    const tickets = await userRepository.getAllTickets(); 
    return tickets;
}

async function listItTickets() {
    const tickets = await userRepository.getItTickets(); 
    return tickets;
}
async function listRhTickets() {
    const tickets = await userRepository.getRhTickets(); 
    return tickets;
}


module.exports = {
	listTickets,
	listItTickets,
	listRhTickets,
};
