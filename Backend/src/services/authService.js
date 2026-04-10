const bcrypt = require('bcrypt');
const authRepository = require('../repository/authRepository');

function createServiceError(status, message) {
	const error = new Error(message);
	error.status = status;
	return error;
}

async function login(email, password) {
	if (!email || !password) {
		throw createServiceError(400, 'Email et mot de passe requis');
	}

	const user = await authRepository.findUserByEmail(email);
	if (!user) {
		throw createServiceError(401, 'Email ou mot de passe incorrect');
	}

	const passwordMatch = await bcrypt.compare(password, user.password);
	if (!passwordMatch) {
		throw createServiceError(401, 'Email ou mot de passe incorrect');
	}

	if (!user.est_actif) {
		throw createServiceError(401, 'Votre compte a été désactivé. Contactez un administrateur.');
	}

	const token = Buffer.from(JSON.stringify({ userId: user.id })).toString('base64');
	const { password: _password, ...userWithoutPassword } = user;

	return {
		user: userWithoutPassword,
		token,
	};
}

async function getMeFromToken(token) {
	if (!token) {
		throw createServiceError(401, 'Token manquant');
	}

	let decoded;
	try {
		decoded = JSON.parse(Buffer.from(token, 'base64').toString());
	} catch (error) {
		throw createServiceError(401, 'Token invalide');
	}

	const user = await authRepository.findUserById(decoded.userId);
	if (!user) {
		throw createServiceError(401, 'Utilisateur non trouvé');
	}

	const { password: _password, ...userWithoutPassword } = user;
	return userWithoutPassword;
}

module.exports = {
	login,
	getMeFromToken,
};
