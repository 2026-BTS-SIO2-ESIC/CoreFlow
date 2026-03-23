const db = require("../../config/db");

const TicketRepository = {
  create: (ticketData) => {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO tickets 
      (titre, description, categorie, statut, priorite, demandeur_id) 
      VALUES (?, ?, ?, ?, ?, ?)`;

    const values = [
      ticketData.titre,
      ticketData.description,
      ticketData.categorie || "Informatique",
      "En attente", // <--- Doit correspondre à tes filtres/badges CSS
      "normale",
      ticketData.demandeur_id,
    ];

    db.query(sql, values, (err, result) => {
      if (err) return reject(err);
      resolve(result.insertId);
    });
  });
},

  getByUserId: (userId) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT t.*, u.nom, u.prenom, u.departement
        FROM tickets t
        JOIN utilisateurs u ON t.demandeur_id = u.id
        WHERE t.demandeur_id = ?
        ORDER BY t.created_at DESC`;

      db.query(sql, [userId], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  },

  getById: (idTicket) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT t.*, u.nom, u.prenom, u.departement
        FROM tickets t
        JOIN utilisateurs u ON t.demandeur_id = u.id
        WHERE t.id = ?`;

      db.query(sql, [idTicket], (err, result) => {
        if (err) reject(err);
        resolve(result[0]);
      });
    });
  },
};

module.exports = TicketRepository;
