const { pool } = require('../config/database');

class User {
  // Trouver un utilisateur par email
  static async findByEmail(email) {
    const [users] = await pool.query(
      'SELECT * FROM utilisateurs WHERE email = ?',
      [email]
    );
    return users[0] || null;
  }

  // Trouver un utilisateur par ID
  static async findById(id) {
    const [users] = await pool.query(
      'SELECT * FROM utilisateurs WHERE id = ?',
      [id]
    );
    return users[0] || null;
  }

  // Récupérer tous les utilisateurs
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM utilisateurs WHERE 1=1';
    const params = [];

    if (filters.role) {
      query += ' AND role = ?';
      params.push(filters.role);
    }

    if (filters.est_actif !== undefined) {
      query += ' AND est_actif = ?';
      params.push(filters.est_actif);
    }

    const [users] = await pool.query(query, params);
    return users;
  }

  // Créer un utilisateur
  static async create(userData) {
    const { email, password, nom, prenom, role, departement, poste, telephone, date_embauche } = userData;
    
    const [result] = await pool.query(
      `INSERT INTO utilisateurs 
      (email, password, nom, prenom, role, departement, poste, telephone, date_embauche, est_actif) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [email, password, nom, prenom, role, departement, poste, telephone, date_embauche]
    );

    return await User.findById(result.insertId);
  }

  // Mettre à jour un utilisateur
  static async update(id, userData) {
    const updates = [];
    const params = [];

    Object.keys(userData).forEach(key => {
      if (userData[key] !== undefined) {
        updates.push(`${key} = ?`);
        params.push(userData[key]);
      }
    });

    if (updates.length === 0) return null;

    params.push(id);

    await pool.query(
      `UPDATE utilisateurs SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    return await User.findById(id);
  }

  // Supprimer un utilisateur
  static async delete(id) {
    const [result] = await pool.query('DELETE FROM utilisateurs WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  // Compter les utilisateurs
  static async count(filters = {}) {
    let query = 'SELECT COUNT(*) as total FROM utilisateurs WHERE 1=1';
    const params = [];

    if (filters.role) {
      query += ' AND role = ?';
      params.push(filters.role);
    }

    const [result] = await pool.query(query, params);
    return result[0].total;
  }
}

module.exports = User;