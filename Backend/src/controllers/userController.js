const { pool } = require('../config/database');

// GET /api/users - Liste tous les utilisateurs
exports.getAllUsers = async (req, res) => {
  const { role, departement, search, actif } = req.query;

  try {
    let query = 'SELECT id, email, nom, prenom, role, departement, poste, telephone, date_embauche, est_actif, created_at, updated_at FROM utilisateurs WHERE 1=1';
    const params = [];

    // Filtre par rôle
    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    // Filtre par département
    if (departement) {
      query += ' AND departement = ?';
      params.push(departement);
    }

    // Filtre par statut actif/inactif
    if (actif !== undefined) {
      const isActif = actif === 'true' ? 1 : 0;
      query += ' AND est_actif = ?';
      params.push(isActif);
    }

    // Recherche par nom, prénom ou email
    if (search) {
      query += ' AND (nom LIKE ? OR prenom LIKE ? OR email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY id ASC';

    const [users] = await pool.query(query, params);

    res.json({
      success: true,
      data: users,
      total: users.length
    });

  } catch (error) {
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
    const [users] = await pool.query(
      'SELECT id, email, nom, prenom, role, departement, poste, telephone, date_embauche, est_actif, created_at, updated_at FROM utilisateurs WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });

  } catch (error) {
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

  // Validation basique
  if (!email || !password || !nom || !prenom || !role) {
    return res.status(400).json({
      success: false,
      message: 'Email, mot de passe, nom, prénom et rôle sont requis'
    });
  }

  try {
    // Vérifier que l'email n'existe pas déjà
    const [existingUsers] = await pool.query(
      'SELECT id FROM utilisateurs WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }

    // Créer le nouvel utilisateur
    const [result] = await pool.query(
      `INSERT INTO utilisateurs 
      (email, password, nom, prenom, role, departement, poste, telephone, date_embauche, est_actif) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        email,
        password,
        nom,
        prenom,
        role,
        departement || null,
        poste || null,
        telephone || null,
        date_embauche || null
      ]
    );

    // Récupérer l'utilisateur créé
    const [newUser] = await pool.query(
      'SELECT id, email, nom, prenom, role, departement, poste, telephone, date_embauche, est_actif, created_at FROM utilisateurs WHERE id = ?',
      [result.insertId]
    );

    // Créer le solde de congés pour l'année en cours
    const currentYear = new Date().getFullYear();
    await pool.query(
      'INSERT INTO soldes_conges (user_id, conges_payes_total, conges_payes_pris, rtt_total, rtt_pris, annee) VALUES (?, 25, 0, 10, 0, ?)',
      [result.insertId, currentYear]
    );

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: newUser[0]
    });

  } catch (error) {
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
    // Vérifier que l'utilisateur existe
    const [existingUsers] = await pool.query(
      'SELECT id FROM utilisateurs WHERE id = ?',
      [id]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Vérifier que l'email n'est pas déjà utilisé par un autre utilisateur
    if (email) {
      const [emailCheck] = await pool.query(
        'SELECT id FROM utilisateurs WHERE email = ? AND id != ?',
        [email, id]
      );

      if (emailCheck.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cet email est déjà utilisé'
        });
      }
    }

    // Construire la requête de mise à jour dynamiquement
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
      updates.push('password = ?');
      params.push(password);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucune donnée à modifier'
      });
    }

    params.push(id);

    await pool.query(
      `UPDATE utilisateurs SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    // Récupérer l'utilisateur modifié
    const [updatedUser] = await pool.query(
      'SELECT id, email, nom, prenom, role, departement, poste, telephone, date_embauche, est_actif, updated_at FROM utilisateurs WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Utilisateur modifié avec succès',
      data: updatedUser[0]
    });

  } catch (error) {
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
    // Récupérer le statut actuel
    const [users] = await pool.query(
      'SELECT id, est_actif FROM utilisateurs WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    const newStatus = !users[0].est_actif;

    // Mettre à jour le statut
    await pool.query(
      'UPDATE utilisateurs SET est_actif = ? WHERE id = ?',
      [newStatus, id]
    );

    // Récupérer l'utilisateur mis à jour
    const [updatedUser] = await pool.query(
      'SELECT id, email, nom, prenom, role, departement, poste, est_actif FROM utilisateurs WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: `Utilisateur ${newStatus ? 'activé' : 'désactivé'} avec succès`,
      data: updatedUser[0]
    });

  } catch (error) {
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

  // Empêcher la suppression de l'admin principal (ID 1)
  if (parseInt(id) === 1) {
    return res.status(403).json({
      success: false,
      message: 'Impossible de supprimer l\'administrateur principal'
    });
  }

  try {
    // Vérifier que l'utilisateur existe
    const [users] = await pool.query(
      'SELECT id, nom, prenom FROM utilisateurs WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Supprimer l'utilisateur (CASCADE supprimera automatiquement les données liées)
    await pool.query('DELETE FROM utilisateurs WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès',
      data: users[0]
    });

  } catch (error) {
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
    const [users] = await pool.query(
      'SELECT id, email, nom, prenom, role, departement, poste, telephone, date_embauche, est_actif FROM utilisateurs WHERE est_actif = FALSE ORDER BY id ASC'
    );
    res.json({
      success: true,
      data: users,
      total: users.length
    });
  } catch (error) {
    console.error('Erreur getInactiveUsers:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs inactifs'
    });
  }
}