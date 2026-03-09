const db = require('../config/db');
const hash = require('bcryptjs'); // pour le hachage des mots de passe, à utiliser dans les fonctions d'authentification et de mise à jour du mot de passe


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
// la fonction findPasswordById esrt utilisé pour récuperer le mot de passe d'un utilisateur hashé dans la base de données, cette fonction est utilisée dans le service pour vérifier si le mot de passe actuel fourni par l'utilisateur correspond au mot de passe stocké dans la base de données avant de permettre la mise à jour du mot de passe.

const findPasswordById = (userId) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT password FROM utilisateurs WHERE id = ?', [userId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};
// la fonction updatePasswordById est utilisée pour mettre a jour le mot de passe d'un utilisateur dans la bdd la fonction doit etre hasher avant d'etre stocker dans la bdd pour des raisons de sécurité, il est important de ne jamais stocker les mots de passe en clair dans la base de données.
const updatePasswordById = (userId, newPassword) => {
  return new Promise((resolve, reject) => { 
    hash.hash(newPassword, 10, (err, hashedPassword) => {
      if (err) return reject(err);
      db.query('UPDATE utilisateurs SET password = ? WHERE id = ?', [hashedPassword, userId], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  });
};


module.exports = { getAllUsers, getAllUsersAdmin, findPasswordById, updatePasswordById };
