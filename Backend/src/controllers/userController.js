const userService = require('../services/userService');

// GET /api/users - Liste tous les utilisateurs
exports.getAllUsers = async (req, res) => {
  const { role, departement, search, actif } = req.query;

  try {
    const users = await userService.getAllUsers({ role, departement, search, actif });
    res.json({
      success: true,
      data: users,
      total: users.length
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message
      });
    }

    console.error('Erreur getAllUsers:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la recuperation des utilisateurs'
    });
  }
};

// GET /api/users/:id - Recuperer un utilisateur par ID
exports.getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await userService.getUserById(id);

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message
      });
    }

    console.error('Erreur getUserById:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la recuperation de l\'utilisateur'
    });
  }
};

// POST /api/users - Creer un nouvel utilisateur
exports.createUser = async (req, res) => {
  const { email, password, nom, prenom, role, departement, poste, telephone, date_embauche } = req.body;

  try {
    const newUser = await userService.createUser({
      email,
      password,
      nom,
      prenom,
      role,
      departement,
      poste,
      telephone,
      date_embauche
    });

    res.status(201).json({
      success: true,
      message: 'Utilisateur cree avec succes',
      data: newUser
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message
      });
    }

    console.error('Erreur createUser:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la creation de l\'utilisateur'
    });
  }
};

// PUT /api/users/:id - Modifier un utilisateur
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, nom, prenom, role, departement, poste, telephone, date_embauche, password } = req.body;

  try {
    const updatedUser = await userService.updateUser(id, {
      email,
      nom,
      prenom,
      role,
      departement,
      poste,
      telephone,
      date_embauche,
      password
    });

    res.json({
      success: true,
      message: 'Utilisateur modifie avec succes',
      data: updatedUser
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message
      });
    }

    console.error('Erreur updateUser:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification de l\'utilisateur'
    });
  }
};

// PATCH /api/users/:id/toggle-status - Activer/Desactiver un utilisateur
exports.toggleUserStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await userService.toggleUserStatus(id);

    res.json({
      success: true,
      message: `Utilisateur ${result.est_actif ? 'active' : 'desactive'} avec succes`,
      data: result.user
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message
      });
    }

    console.error('Erreur toggleUserStatus:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors du changement de statut'
    });
  }
};

// DELETE /api/users/:id - Supprimer un utilisateur
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await userService.deleteUser(id);

    res.json({
      success: true,
      message: 'Utilisateur supprime avec succes',
      data: user
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message
      });
    }

    console.error('Erreur deleteUser:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'utilisateur'
    });
  }
};

// GET /api/users/inactive - Recuperer les utilisateurs inactifs
exports.getInactiveUsers = async (req, res) => {
  try {
    const users = await userService.getInactiveUsers();

    res.json({
      success: true,
      data: users,
      total: users.length
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message
      });
    }

    console.error('Erreur getInactiveUsers:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la recuperation des utilisateurs inactifs'
    });
  }
};

// PUT /api/users/password - Modifier son propre mot de passe
exports.updatePassword = async (req, res) => {
  const userId = req.user?.id;
  const { oldPass, newPass } = req.body;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Authentification requise.'
    });
  }

  if (!oldPass || !newPass) {
    return res.status(400).json({
      success: false,
      message: 'Champs manquants.'
    });
  }

  try {
    const result = await userService.updatePassword(userId, oldPass, newPass);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Mot de passe mis a jour.'
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message
      });
    }

    console.error('Erreur updatePassword:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du mot de passe'
    });
  }
};
