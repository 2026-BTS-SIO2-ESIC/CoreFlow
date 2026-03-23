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
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs'
    });
  }
};

// GET /api/users/:id - Récupérer un utilisateur par ID
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
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'utilisateur'
    });
  }
};

// POST /api/users - Créer un nouvel utilisateur
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
      date_embauche,
    });

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
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
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'utilisateur'
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
      password,
    });

    res.json({
      success: true,
      message: 'Utilisateur modifié avec succès',
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
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification de l\'utilisateur'
    });
  }
};

// PATCH /api/users/:id/toggle-status - Activer/Désactiver un utilisateur
exports.toggleUserStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await userService.toggleUserStatus(id);

    res.json({
      success: true,
      message: `Utilisateur ${result.est_actif ? 'activé' : 'désactivé'} avec succès`,
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
    res.status(500).json({
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
      message: 'Utilisateur supprimé avec succès',
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
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'utilisateur'
    });
  }
};

// GET /api/users/me - Récupérer les utilisateurs inactifs
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
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs inactifs'
    });
  }
}
