const bcrypt = require('bcrypt'); // à ajouter en haut du fichier
const { pool } = require('../config/database');


// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email et mot de passe requis'
    });
  }

  try {
    const [users] = await pool.query(
      'SELECT * FROM utilisateurs WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    const user = users[0];

    // Vérification bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier que l'utilisateur est actif
    if (!user.est_actif) {
      return res.status(401).json({
        success: false,
        message: 'Votre compte a été désactivé. Contactez un administrateur.'
      });
    }

    // Créer un "token" simple (juste l'ID encodé pour le dev)
    const token = Buffer.from(JSON.stringify({ userId: user.id })).toString('base64');

    // Retourner les infos utilisateur (sans le mot de passe)
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: userWithoutPassword,
        token: token
      }
    });

  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la connexion'
    });
  }
};

// Récupérer l'utilisateur connecté (à partir du token)
exports.getMe = async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token manquant'
    });
  }

  try {
    // Décoder le token
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    
    // Récupérer l'utilisateur depuis la BDD
    const [users] = await pool.query(
      'SELECT * FROM utilisateurs WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    const user = users[0];

    // Retourner l'utilisateur sans le mot de passe
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: userWithoutPassword
    });

  } catch (error) {
    console.error('Erreur getMe:', error);
    res.status(401).json({
      success: false,
      message: 'Token invalide'
    });
  }
};

// Déconnexion
exports.logout =(req, res) => {
  res.status(200).json({
    success: true,
    message: 'Déconnexion réussie'
  });
};