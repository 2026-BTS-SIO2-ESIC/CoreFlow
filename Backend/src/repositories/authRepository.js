const db = require('../config/db');

const findUserByEmailAndPassword = (email, password) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT u.*, s.nom_service, r.role
      FROM utilisateurs u
      LEFT JOIN services s ON u.idServices = s.idServices
      LEFT JOIN posseder p ON u.idUtilisateurs = p.idUtilisateurs AND u.idServices = p.idServices
      LEFT JOIN role r ON p.idRole = r.idRole
      WHERE u.mail = ? AND u.Password = ?
    `;
    db.query(sql, [email, password], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const findUserById = (id) => {
  return new Promise((resolve, reject) => { // new Promise pour gérer les opérations asynchrones de la base de données on peut aussi utiliser async/await dans le service et promisify la fonction db.query
    const sql = `
      SELECT u.*, s.nom_service, r.role
      FROM utilisateurs u
      LEFT JOIN services s ON u.idServices = s.idServices
      LEFT JOIN posseder p ON u.idUtilisateurs = p.idUtilisateurs AND u.idServices = p.idServices
      LEFT JOIN role r ON p.idRole = r.idRole
      WHERE u.idUtilisateurs = ?
    `;
    db.query(sql, [id], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

module.exports = { findUserByEmailAndPassword, findUserById };
