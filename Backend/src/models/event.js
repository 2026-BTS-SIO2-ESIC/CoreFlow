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
        \`type\`)
        VALUES (?,?,?,?,?,?,?,?,?,?)
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
};

module.exports = Event;
