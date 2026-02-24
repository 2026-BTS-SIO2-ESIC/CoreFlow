const db = require("../config/database");

const Event = {
  listAll: (callback) => {
    const sql = "SELECT * FROM evenements";
    db.query(sql, (err, results) => {
      if (err) {
        console.error("DB ERROR :", err);
        return callback(err, null);
      }
      return callback(null, results);
    });
  },

  listById: (eventId, callback) => {
    const sql = "SELECT * FROM evenements WHERE idEvenements = ?";
    db.query(sql, [eventId], (err, results) => {
      if (err) {
        console.error("DB ERROR :", err);
        return callback(err, null);
      }
      console.log(results);
      return callback(null, results);
    });
  },

  create: (event, callback) => {
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

  // Put query will change every values in the DB exept dates
  update: (event, callback) => {
    let sql = "UPDATE evenements SET ";
    let params = [];
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
