const db = require("../config/database");

const Event = {
  // fonction listAll qui permet de recuperer tous les evenements de la base de donnees
  listAll: (serviceID, callback) => {
    console.log("service id :", serviceID);
    // requette sql pour recuperer tous les evenements
    const sql = "SELECT * FROM evenements WHERE niveau=1";
    const secondSql =
      "SELECT * FROM evenements WHERE niveau=2 AND idServices=?";

    db.query(sql, (err, resultsOne) => {
      if (err) {
        console.error("DB ERROR :", err);
        return callback(err, null);
      }
      db.query(secondSql, [serviceID], (err, resultsTwo) => {
        if (err) {
          console.error("DB ERROR :", err);
          return callback(err, null);
        }
        return callback(null, resultsOne, resultsTwo);
      });
      // return callback(null, resultsOne);
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
    sql += " WHERE idEvenements=? AND idUtilisateurs=?";
    params.push(event.eventID, event.userID); // envoie les valeurs idEvenement et idUtilisateur données dans la requette a la sql

    db.query(sql, params, (err, results) => {
      if (err) {
        console.error("DB ERROR :", err);
        return callback(err, null);
      }
      if (results.affectedRows === 0) {
        const err = new Error("EVENT_NOT_OWNED");
        err.code = "EVENT_NOT_OWNED";
        return callback(err, null);
      }
      return callback(null, results);
    });
  },

  // fonction qui lance  une requette pour verfier si utilisateurs dans champ inviter existe deans la DB
  checkIfUserExist: async (userMail) => {
    // declaraison de la variable userExiste qui va aider a renvoyer l'erreure en cas si email existe pas
    let userExist = false;
    // declaraison de la liste userMailList pour stocker les email des utilisateur apres que l'email a ete verifier
    let userMailList = [];
    // Convertie le tableau de(s) email(s) en une chaine de charachter string
    // ["mail1.com, mail2.com"] => "mail1.com, mail2.com"
    const userMailString = String(userMail);
    // split: separe le userMailString en plusieure string grace a la virgule
    // map((x)=>x.trim):  pour chaque element suprime les espaces
    const mails = userMailString.split(",").map((x) => x.trim());
    // Boucle chaque mail dans mails pour verifier si existe dans la DB
    for (const mail of mails) {
      // requette sql pour verifier si mail existe
      const sql = "SELECT mail FROM utilisateurs WHERE mail=?";
      // stock le resultat obtenu dans tableau rows
      const [rows] = await db.promise().query(sql, [mail]);
      // si trouve au moins 1 mail met userExiste en true et ajoute (push) le mail dans le userMailList
      if (rows.length > 0) {
        userExist = true;
        userMailList.push(mail);
      } else {
        // Si trouve pas renvoi une erreure et met userExist en false
        console.error("user mail with mail: ", mail, "does not exist");
        userExist = false;
        // renvoi user exist et mail qui n'a pas ete trouver
        return { userExist, mail: mail };
      }
    }
    // en cas success renvoi userExiste et userMailList
    return { userExist };
  },
};

module.exports = Event;
