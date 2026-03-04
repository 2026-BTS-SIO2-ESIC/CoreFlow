const db = require('../config/db');

const getAllUsers = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT u.idUtilisateurs, u.Nom, u.Preonom, u.mail, s.nom_service
      FROM utilisateurs u
      LEFT JOIN services s ON u.idServices = s.idServices
    `;
    db.query(sql, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const getAllUsersAdmin = () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT idUtilisateurs, Nom, Preonom, mail FROM utilisateurs";
    db.query(sql, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const findPasswordById = (userId) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT Password FROM utilisateurs WHERE idUtilisateurs = ?', [userId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const updatePasswordById = (userId, newPassword) => {
  return new Promise((resolve, reject) => {
    db.query('UPDATE utilisateurs SET Password = ? WHERE idUtilisateurs = ?', [newPassword, userId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

module.exports = { getAllUsers, getAllUsersAdmin, findPasswordById, updatePasswordById };
