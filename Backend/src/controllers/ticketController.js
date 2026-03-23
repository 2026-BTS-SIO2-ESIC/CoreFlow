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