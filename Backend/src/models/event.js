const db = require("../config/database");

const Event = {
  // fonction listAll qui permet de recuperer tous les evenements de la base de donnees
  listAll: (callback) => {
    // requette sql pour recuperer tous les evenements
    const sql = "SELECT * FROM evenements";
    db.query(sql, (err, results) => {
      if (err) {
        console.error("DB ERROR :", err);
        return callback(err, null);
      }
      return callback(null, results);
    });
  },

  // fonction listById qui pren comme valeur eventId a partir dans la fonction event_list_by_id
  listById: (eventId, callback) => {
    // reauette sql qui selectionne lévenement a partir du id donner(eventId) dans la table evenements
    const sql = "SELECT * FROM evenements WHERE idEvenements = ?";
    // execute la query en lui donnant la requette (sql) et le eventId comme parametre
    db.query(sql, [eventId], (err, results) => {
      // en cas d'erreur renvoi l'erreur
      if (err) {
        console.error("DB ERROR :", err);
        return callback(err, null);
      }
      return callback(null, results);
    });
  },

  // fonction create aui crees une requette de Insertion dans la table evenement
  create: (event, callback) => {
    // requette sql avec tout les champs de la table evenement
    const sql = `
        INSERT INTO evenements (
        date_creation, 
        date_debut, 
        date_fin, 
        description, 
        idEvenements, 
        idServices, 
        idUtilisateurs, 
        nom_createur,
        titre, 
        \`type\`,
        niveau,
        inviter)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    `;
    // execute la query en lui donnant la requette (sql) et les valeurs de l'evenement comme parametre
    db.query(
      sql,
      [
        event.createdAt,
        event.startDate,
        event.endDate,
        event.description,
        event.eventID,
        event.serviceID,
        event.userID,
        event.userName,
        event.title,
        event.type,
        event.level,
        event.invited,
      ],
      (err, results) => {
        if (err) {
          console.error("DB ERROR :", err);
          return callback(err, null);
        }
        return callback(null, results);
      },
    );
  },

  // la fonction update qui rajoute les champs a modifier dans la table evenement
  update: (event, callback) => {
    // requette sql qui remplace les valeurs de la table par les nouvelles valeurs
    let sql = "UPDATE evenements SET ";
    // crees un tableau pour les valeurs a modifier
    let params = [];
    // verification des champs si present et en cas si ils sont present rajoute ces champs dans le tableau params
    if (event.createdAt) {
      sql += "date_creation=?, ";
      params.push(event.createdAt);
    }
    if (event.startDate) {
      sql += "date_debut=?, ";
      params.push(event.startDate);
    }
    if (event.description) {
      sql += "description=? ,";
      params.push(event.description);
    }
    if (event.userID) {
      sql += "idUtilisateurs=?, ";
      params.push(event.userID);
    }
    if (event.userName) {
      sql += "nom_createur=?, ";
      params.push(event.userName);
    }
    if (event.title) {
      sql += "titre=?, ";
      params.push(event.title);
    }
    if (event.type) {
      sql += "`type`=?, ";
      params.push(event.type);
    }
    if (event.invited) {
      sql += "inviter=?, ";
      params.push(event.invited);
    }
    if (event.level) {
      sql += "niveau=?, ";
      params.push(event.level);
    }
    sql = sql.slice(0, -2); // retire la derniere virgule
    sql += " WHERE idEvenements=?";
    params.push(event.eventID); // trouve le evenement a partir du id données dans la requette
    db.query(sql, params, (err, results) => {
      if (err) {
        console.error("DB ERROR :", err);
        return callback(err, null);
      }
      return callback(null, results);
    });
  },
};

module.exports = Event;
