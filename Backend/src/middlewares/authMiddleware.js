// middleware/authMiddleware.js
const { pool } = require('../config/database');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// ─── Helpers token ────────────────────────────────────────────────────────────

/**
 * Token partiel : login OK mais 2FA pas encore validé (expire en 5min)
 */
exports.signPartialToken = (userId) => {
  return jwt.sign(
    { userId, twofa_pending: true },
    JWT_SECRET,
    { expiresIn: '5m' }
  );
};

/**
 * Token complet : accès total à l'API
 */
exports.signFullToken = (userId) => {
  return jwt.sign(
    { userId, twofa_pending: false },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ─── Middlewares ──────────────────────────────────────────────────────────────

/**
 * Vérifie que l'utilisateur est authentifié avec un token COMPLET (2FA validé)
 * Remplace ton ancien `authenticate`
 */
exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: "Token d'authentification manquant"
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // ✅ Vérification cryptographique avec la clé secrète
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: 'Token invalide ou expiré' });
    }

    // Bloque les tokens partiels (2FA en attente) sur les routes protégées
    if (decoded.twofa_pending) {
      return res.status(403).json({
        success: false,
        message: '2FA requis pour accéder à cette ressource'
      });
    }

    const [users] = await pool.query(
      'SELECT id, email, nom, prenom, role, est_actif FROM utilisateurs WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    const user = users[0];

    if (!user.est_actif) {
      return res.status(401).json({ success: false, message: 'Votre compte a été désactivé' });
    }

    // Attacher l'utilisateur à la requête pour les routes suivantes
    req.user = {
      ...user,
      userId: user.id
    };

    // Passer au middleware/controller suivant
    next();

  } catch (error) {
    console.error('Erreur authentification:', error);
    return res.status(401).json({ success: false, message: 'Token invalide' });
  }
};

/**
 * Vérifie un token PARTIEL (utilisé uniquement par POST /auth/2fa/validate)
 */
exports.authenticatePartial = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: "Token manquant" });
    }

    const token = authHeader.replace('Bearer ', '');

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: 'Token invalide ou expiré' });
    }

    if (!decoded.twofa_pending) {
      return res.status(400).json({ success: false, message: 'Token déjà complet, 2FA non requis' });
    }

    req.userId = decoded.userId;
    next();

  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token invalide' });
  }
};

// ─── Autorisation par rôle (inchangé) ────────────────────────────────────────

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentification requise' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Vous n'avez pas les permissions nécessaires" });
    }
    next();
  };
};

exports.authMiddleware = (...roles) => {
  return [exports.authenticate, exports.authorize(...roles)];
};

exports.checkRH = (req, res, next) => {
  if (req.user.role !== 'RH') {
    return res.status(403).json({ success: false, message: 'Accès réservé aux RH' });
  }
  next();
};