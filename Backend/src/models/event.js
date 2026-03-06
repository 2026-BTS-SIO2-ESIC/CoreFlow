const { pool } = require("../config/database");

const Event = {
  // 1. Liste tous les événements
  listAll: async () => {
    const sql = "SELECT * FROM evenements ORDER BY date_debut ASC";
    const [rows] = await pool.query(sql);
    return rows;
  },

  // 2. Création d'un événement
  create: async (eventData) => {
    const sql = `
        INSERT INTO evenements (
            type, titre, nom_createur, description, 
            date_creation, date_debut, date_fin, 
            idUtilisateurs, idServices
        ) VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?)
    `;
    
    const values = [
      eventData.type,
      eventData.title,
      eventData.userName,
      eventData.description,
      eventData.startDate,
      eventData.endDate,
      eventData.userID,
      eventData.serviceID
    ];

    const [result] = await pool.query(sql, values);
    return result.insertId;
  },

  // 3. Modifier un événement existant
  update: async (id, eventData) => {
    const sql = `
        UPDATE evenements 
        SET type = ?, titre = ?, nom_createur = ?, description = ?, 
            date_debut = ?, date_fin = ?
        WHERE idEvenements = ?
    `;
    const values = [
      eventData.type, 
      eventData.title, 
      eventData.userName, 
      eventData.description, 
      eventData.startDate, 
      eventData.endDate, 
      id
    ];
    const [result] = await pool.query(sql, values);
    return result.affectedRows; 
  },

  // 4. Supprimer un événement
  delete: async (id) => {
    const sql = "DELETE FROM evenements WHERE idEvenements = ?";
    const [result] = await pool.query(sql, [id]);
    return result.affectedRows;
  }
}; // <--- Toutes les fonctions sont bien à l'intérieur de ces accolades

module.exports = Event;