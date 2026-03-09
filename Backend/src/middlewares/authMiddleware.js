const { pool } = require('../config/database');

// Vérifier que l'utilisateur est authentifié
exports.authenticate = async (req, res, next) => {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'authentification manquant'
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Décoder le token  
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());

    // Vérifier que l'utilisateur existe dans la BDD
    const [users] = await pool.query(
      'SELECT id, email, nom, prenom, role, est_actif FROM utilisateurs WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    const user = users[0];

    // Vérifier que le compte est actif
    if (!user.est_actif) {
      return res.status(401).json({
        success: false,
        message: 'Votre compte a été désactivé'
      });
    }

    // Attacher l'utilisateur à la requête pour les routes suivantes
    req.user = user;

    // Passer au middleware/controller suivant
    next();

  } catch (error) {
    console.error('Erreur authentification:', error);
    return res.status(401).json({
      success: false,
      message: 'Token invalide'
    });
  }
};

// Vérifier que l'utilisateur a un rôle spécifique
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas les permissions nécessaires'
      });
    }

    next();
  };
};