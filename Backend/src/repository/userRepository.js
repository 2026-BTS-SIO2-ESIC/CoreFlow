const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

const USER_SELECT_FIELDS = 'id, email, nom, prenom, role, departement, poste, telephone, date_embauche, est_actif, created_at, updated_at';

async function getAllUsers(filters = {}) {
	const { role, departement, search, actif } = filters;

	let query = `SELECT ${USER_SELECT_FIELDS} FROM utilisateurs WHERE 1=1`;
	const params = [];

	if (role) {
		query += ' AND role = ?';
		params.push(role);
	}

	if (departement) {
		query += ' AND departement = ?';
		params.push(departement);
	}

	if (actif !== undefined) {
		const isActif = actif === true || actif === 'true' ? 1 : 0;
		query += ' AND est_actif = ?';
		params.push(isActif);
	}

	if (search) {
		const searchTerm = `%${search}%`;
		query += ' AND (nom LIKE ? OR prenom LIKE ? OR email LIKE ?)';
		params.push(searchTerm, searchTerm, searchTerm);
	}

	query += ' ORDER BY id ASC';

	const [users] = await pool.query(query, params);
	return users;
}

async function getUserById(id) {
	const [users] = await pool.query(
		`SELECT ${USER_SELECT_FIELDS} FROM utilisateurs WHERE id = ?`,
		[id]
	);
	return users[0] || null;
}

async function findByEmail(email) {
	const [users] = await pool.query('SELECT id, email FROM utilisateurs WHERE email = ?', [email]);
	return users[0] || null;
}

async function findByEmailExcludingId(email, id) {
	const [users] = await pool.query('SELECT id, email FROM utilisateurs WHERE email = ? AND id != ?', [email, id]);
	return users[0] || null;
}

async function createUser(userData) {
	const { email, password, nom, prenom, role, departement, poste, telephone, date_embauche } = userData;
	const hashedPassword = await bcrypt.hash(password, 10);

	const [result] = await pool.query(
		`INSERT INTO utilisateurs
		(email, password, nom, prenom, role, departement, poste, telephone, date_embauche, est_actif)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
		[
			email,
			hashedPassword,
			nom,
			prenom,
			role,
			departement || null,
			poste || null,
			telephone || null,
			date_embauche || null,
		]
	);

	const currentYear = new Date().getFullYear();
	await pool.query(
		'INSERT INTO soldes_conges (user_id, conges_payes_total, conges_payes_pris, rtt_total, rtt_pris, annee) VALUES (?, 25, 0, 10, 0, ?)',
		[result.insertId, currentYear]
	);

	return getUserById(result.insertId);
}

async function updateUser(id, userData) {
	const { email, nom, prenom, role, departement, poste, telephone, date_embauche, password } = userData;
	const updates = [];
	const params = [];

	if (email) {
		updates.push('email = ?');
		params.push(email);
	}
	if (nom) {
		updates.push('nom = ?');
		params.push(nom);
	}
	if (prenom) {
		updates.push('prenom = ?');
		params.push(prenom);
	}
	if (role) {
		updates.push('role = ?');
		params.push(role);
	}
	if (departement !== undefined) {
		updates.push('departement = ?');
		params.push(departement || null);
	}
	if (poste !== undefined) {
		updates.push('poste = ?');
		params.push(poste || null);
	}
	if (telephone !== undefined) {
		updates.push('telephone = ?');
		params.push(telephone || null);
	}
	if (date_embauche) {
		updates.push('date_embauche = ?');
		params.push(date_embauche);
	}
	if (password) {
		const hashedPassword = await bcrypt.hash(password, 10);
		updates.push('password = ?');
		params.push(hashedPassword);
	}

	if (updates.length === 0) {
		return null;
	}

	params.push(id);
	await pool.query(`UPDATE utilisateurs SET ${updates.join(', ')} WHERE id = ?`, params);

	return getUserById(id);
}

async function toggleUserStatus(id) {
	const [users] = await pool.query('SELECT id, est_actif FROM utilisateurs WHERE id = ?', [id]);
	const user = users[0] || null;

	if (!user) {
		return null;
	}

	const newStatus = !user.est_actif;
	await pool.query('UPDATE utilisateurs SET est_actif = ? WHERE id = ?', [newStatus, id]);

	const [updatedUsers] = await pool.query(
		'SELECT id, email, nom, prenom, role, departement, poste, est_actif FROM utilisateurs WHERE id = ?',
		[id]
	);

	return {
		user: updatedUsers[0] || null,
		est_actif: newStatus,
	};
}

async function deleteUser(id) {
	const [users] = await pool.query('SELECT id, nom, prenom FROM utilisateurs WHERE id = ?', [id]);
	const user = users[0] || null;

	if (!user) {
		return null;
	}

	await pool.query('DELETE FROM utilisateurs WHERE id = ?', [id]);
	return user;
}

async function getInactiveUsers() {
	const [users] = await pool.query(
		'SELECT id, email, nom, prenom, role, departement, poste, telephone, date_embauche, est_actif FROM utilisateurs WHERE est_actif = FALSE ORDER BY id ASC'
	);
	return users;
}

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
	getAllUsers,
	getUserById,
	findByEmail,
	findByEmailExcludingId,
	createUser,
	updateUser,
	toggleUserStatus,
	deleteUser,
	getInactiveUsers,
	getAllTickets,
	getItTickets,
	getRhTickets,
};
