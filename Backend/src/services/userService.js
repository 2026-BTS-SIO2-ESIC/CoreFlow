const userRepository = require('../Repository/userRepository');

function createServiceError(status, message) {
	const error = new Error(message);
	error.status = status;
	return error;
}

async function getAllUsers(filters) {
	return userRepository.getAllUsers(filters);
}

async function getUserById(id) {
	const user = await userRepository.getUserById(id);

	if (!user) {
		throw createServiceError(404, 'Utilisateur non trouvé');
	}

	return user;
}

async function createUser(userData) {
	const { email, password, nom, prenom, role } = userData;

	if (!email || !password || !nom || !prenom || !role) {
		throw createServiceError(400, 'Email, mot de passe, nom, prénom et rôle sont requis');
	}

	const existingUser = await userRepository.findByEmail(email);
	if (existingUser) {
		throw createServiceError(400, 'Cet email est déjà utilisé');
	}

	return userRepository.createUser(userData);
}

async function updateUser(id, userData) {
	const existingUser = await userRepository.getUserById(id);
	if (!existingUser) {
		throw createServiceError(404, 'Utilisateur non trouvé');
	}

	if (userData.email) {
		const emailCheck = await userRepository.findByEmailExcludingId(userData.email, id);
		if (emailCheck) {
			throw createServiceError(400, 'Cet email est déjà utilisé');
		}
	}

	const updatedUser = await userRepository.updateUser(id, userData);
	if (!updatedUser) {
		throw createServiceError(400, 'Aucune donnée à modifier');
	}

	return updatedUser;
}

async function toggleUserStatus(id) {
	const result = await userRepository.toggleUserStatus(id);

	if (!result) {
		throw createServiceError(404, 'Utilisateur non trouvé');
	}

	return result;
}

async function deleteUser(id) {
	if (parseInt(id, 10) === 1) {
		throw createServiceError(403, 'Impossible de supprimer l\'administrateur principal');
	}

	const user = await userRepository.deleteUser(id);
	if (!user) {
		throw createServiceError(404, 'Utilisateur non trouvé');
	}

	return user;
}

async function getInactiveUsers() {
	return userRepository.getInactiveUsers();
}


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
	getAllUsers,
	getUserById,
	createUser,
	updateUser,
	toggleUserStatus,
	deleteUser,
	getInactiveUsers,
};
