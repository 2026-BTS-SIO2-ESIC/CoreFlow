const { pool } = require('../config/database');
const bcrypt = require('bcrypt');


async function getAllTickets() {
	const [rows] = await pool.query(
		"SELECT id, titre, description, categorie, statut, demandeur_id, assigne_a_id, updated_at FROM tickets ORDER by id ASC"
	);
	return rows;
}

async function getItTickets() {
 const [rows] = await pool.query(
		"SELECT id, titre, description, statut, demandeur_id, updated_at FROM tickets WHERE categorie = 'it' ORDER by id ASC"
	);
	return rows;
}
async function getRhTickets() {
 const [rows] = await pool.query(
		"SELECT id, titre, description, statut, demandeur_id, updated_at FROM tickets WHERE categorie = 'rh' ORDER by id ASC"
	);
	return rows;
}

module.exports = {
    getAllTickets,
    getItTickets,
    getRhTickets,
}