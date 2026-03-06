const db = require('../config/db');

const getAllUsers = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT u.id, u.nom, u.prenom, u.email, u.role, u.departement, u.poste, u.telephone, u.date_embauche, u.est_actif
      FROM utilisateurs u
    `;
    db.query(sql, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const getAllUsersAdmin = () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT id, nom, prenom, email, role, departement, poste, telephone, date_embauche, est_actif FROM utilisateurs";
    db.query(sql, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const findPasswordById = (userId) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT password FROM utilisateurs WHERE id = ?', [userId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const updatePasswordById = (userId, newPassword) => {
  return new Promise((resolve, reject) => {
    db.query('UPDATE utilisateurs SET password = ? WHERE id = ?', [newPassword, userId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

module.exports = { getAllUsers, getAllUsersAdmin, findPasswordById, updatePasswordById };
