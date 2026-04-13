const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const authRepository = require('../repository/authRepository');
const userRepository = require('../repository/userRepository');
const { signFullToken, signPartialToken } = require('../middlewares/authMiddleware');

const TOTP_ISSUER = 'CoreFlow';
const TOTP_STEP_SECONDS = 30;
const TOTP_DIGITS = 6;
const TOTP_WINDOW = 1;
const JWT_SECRET = process.env.JWT_SECRET;

function createServiceError(status, message) {
	const error = new Error(message);
	error.status = status;
	return error;
}

function sanitizeUser(user) {
	if (!user) {
		return null;
	}

	const { password: _password, totp_secret: _totpSecret, ...userWithoutSecrets } = user;
	return userWithoutSecrets;
}

function base32Encode(buffer) {
	const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
	let bits = '';
	for (const byte of buffer) {
		bits += byte.toString(2).padStart(8, '0');
	}

	let encoded = '';
	for (let index = 0; index < bits.length; index += 5) {
		const chunk = bits.slice(index, index + 5);
		if (chunk.length < 5) {
			encoded += alphabet[parseInt(chunk.padEnd(5, '0'), 2)];
			break;
		}
		encoded += alphabet[parseInt(chunk, 2)];
	}

	while (encoded.length % 8 !== 0) {
		encoded += '=';
	}

	return encoded;
}

function base32Decode(value) {
	const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
	const sanitized = value.toUpperCase().replace(/[^A-Z2-7]/g, '');
	let bits = '';

	for (const char of sanitized) {
		const index = alphabet.indexOf(char);
		if (index === -1) {
			continue;
		}
		bits += index.toString(2).padStart(5, '0');
	}

	const bytes = [];
	for (let index = 0; index + 8 <= bits.length; index += 8) {
		bytes.push(parseInt(bits.slice(index, index + 8), 2));
	}

	return Buffer.from(bytes);
}

function generateTotpSecret(accountLabel) {
	const secretBuffer = crypto.randomBytes(20);
	const base32Secret = base32Encode(secretBuffer).replace(/=+$/g, '');
	const issuer = encodeURIComponent(TOTP_ISSUER);
	const label = encodeURIComponent(`${TOTP_ISSUER}:${accountLabel}`);
	const otpauthUrl = `otpauth://totp/${label}?secret=${base32Secret}&issuer=${issuer}&algorithm=SHA1&digits=${TOTP_DIGITS}&period=${TOTP_STEP_SECONDS}`;

	return {
		base32Secret,
		otpauthUrl,
	};
}

function generateTotpCode(secret, timeStep = Math.floor(Date.now() / 1000 / TOTP_STEP_SECONDS)) {
	const key = base32Decode(secret);
	const counter = Buffer.alloc(8);
	counter.writeBigUInt64BE(BigInt(timeStep));

	const hmac = crypto.createHmac('sha1', key).update(counter).digest();
	const offset = hmac[hmac.length - 1] & 0x0f;
	const code = (
		((hmac[offset] & 0x7f) << 24) |
		((hmac[offset + 1] & 0xff) << 16) |
		((hmac[offset + 2] & 0xff) << 8) |
		hmac[offset + 3]
	) % 10 ** TOTP_DIGITS;

	return String(code).padStart(TOTP_DIGITS, '0');
}

function verifyTotpCode(secret, code, window = TOTP_WINDOW) {
	if (!secret || !code) {
		return false;
	}

	const normalizedCode = String(code).replace(/\s+/g, '');
	const currentStep = Math.floor(Date.now() / 1000 / TOTP_STEP_SECONDS);

	for (let offset = -window; offset <= window; offset += 1) {
		const expectedCode = generateTotpCode(secret, currentStep + offset);
		if (expectedCode.length !== normalizedCode.length) {
			continue;
		}

		if (crypto.timingSafeEqual(Buffer.from(expectedCode), Buffer.from(normalizedCode))) {
			return true;
		}
	}

	return false;
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

	if (user.twofa_enabled && user.totp_secret) {
		return {
			user: sanitizeUser(user),
			token: signPartialToken(user.id),
			requiresTwofa: true,
		};
	}

	return {
		user: sanitizeUser(user),
		token: signFullToken(user.id),
		requiresTwofa: false,
	};
}

async function getMeFromToken(token) {
	if (!token) {
		throw createServiceError(401, 'Token manquant');
	}

	let decoded;
	try {
		decoded = jwt.verify(token, JWT_SECRET);
	} catch (error) {
		throw createServiceError(401, 'Token invalide');
	}

	if (decoded.twofa_pending) {
		throw createServiceError(403, '2FA requise');
	}

	const user = await authRepository.findUserById(decoded.userId);
	if (!user) {
		throw createServiceError(401, 'Utilisateur non trouvé');
	}

	return sanitizeUser(user);
}

async function verifyTwoFactorLogin(token, code) {
	if (!token) {
		throw createServiceError(401, 'Token manquant');
	}

	if (!code) {
		throw createServiceError(400, 'Code TOTP requis');
	}

	let decoded;
	try {
		decoded = jwt.verify(token, JWT_SECRET);
	} catch (error) {
		throw createServiceError(401, 'Token invalide');
	}

	if (!decoded.twofa_pending) {
		throw createServiceError(400, '2FA non requise');
	}

	const user = await authRepository.findUserById(decoded.userId);
	if (!user) {
		throw createServiceError(401, 'Utilisateur non trouvé');
	}

	if (!user.twofa_enabled || !user.totp_secret) {
		throw createServiceError(400, 'A2F non configurée pour cet utilisateur');
	}

	if (!verifyTotpCode(user.totp_secret, code)) {
		throw createServiceError(401, 'Code TOTP invalide');
	}

	return {
		user: sanitizeUser(user),
		token: signFullToken(user.id),
	};
}

async function initializeTwoFactor(userId) {
	const user = await authRepository.findUserById(userId);
	if (!user) {
		throw createServiceError(404, 'Utilisateur non trouvé');
	}

	if (user.twofa_enabled) {
		throw createServiceError(400, 'L\'A2F est déjà activée');
	}

	const secret = generateTotpSecret(user.email);
	await userRepository.updateTwoFactorSecret(userId, secret.base32Secret);

	return {
		secret: secret.base32Secret,
		otpauthUrl: secret.otpauthUrl,
		issuer: TOTP_ISSUER,
		accountLabel: user.email,
	};
}

async function confirmTwoFactorSetup(userId, code) {
	const user = await authRepository.findUserById(userId);
	if (!user) {
		throw createServiceError(404, 'Utilisateur non trouvé');
	}

	if (!user.totp_secret) {
		throw createServiceError(400, 'Initialisez d\'abord l\'A2F');
	}

	if (!verifyTotpCode(user.totp_secret, code)) {
		throw createServiceError(400, 'Code TOTP invalide');
	}

	await userRepository.enableTwoFactor(userId);
	const updatedUser = await authRepository.findUserById(userId);

	return {
		user: sanitizeUser(updatedUser),
	};
}

async function disableTwoFactor(userId) {
	const user = await authRepository.findUserById(userId);
	if (!user) {
		throw createServiceError(404, 'Utilisateur non trouvé');
	}

	await userRepository.disableTwoFactor(userId);
	const updatedUser = await authRepository.findUserById(userId);

	return {
		user: sanitizeUser(updatedUser),
	};
}

module.exports = {
	login,
	getMeFromToken,
	verifyTwoFactorLogin,
	initializeTwoFactor,
	confirmTwoFactorSetup,
	disableTwoFactor,
};
