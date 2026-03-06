const db = require('../config/db');

const findUserByEmailAndPassword = (email, password) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT u.*
      FROM utilisateurs u
      WHERE u.email = ? AND u.password = ?
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
      SELECT u.*
      FROM utilisateurs u
      WHERE u.id = ?
    `;
    db.query(sql, [id], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

module.exports = { findUserByEmailAndPassword, findUserById };
