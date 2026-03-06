const db = require("../config/database");

const Event = {
  // fonction listAll qui permet de recuperer tous les evenements de la base de donnees
  listAll: (invitedEmail, callback) => {
    console.log("inviter email:", invitedEmail);
    // requette sql pour recuperer tous les evenements
    const sql = "SELECT * FROM evenements WHERE niveau=1";
    const secondSql =
      "SELECT * FROM evenements WHERE niveau=2 AND inviter=?";

    db.query(sql, (err, resultsOne) => {
      if (err) {
        console.error("DB ERROR :", err);
        return callback(err, null);
      }
      db.query(secondSql, [invitedEmail], (err, resultsTwo) => {
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
    // requette sql qui selectionne l'evenement a partir du id donner(eventId) dans la table evenements
    const sql = "SELECT * FROM evenements WHERE id = ?";
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

  // fonction create qui cree une requette d'Insertion dans la table evenements
  create: (event, callback) => {
    // requette sql avec tous les champs de la table evenements
    const sql = `
        INSERT INTO evenements (
        titre, 
        description, 
        type_evenement, 
        date_debut, 
        date_fin, 
        lieu, 
        organisateur_id, 
        est_obligatoire, 
        nb_places_max, 
        inviter, 
        statut, 
        created_at, 
        updated_at, 
        niveau)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `;
    // execute la query en lui donnant la requette (sql) et les valeurs de l'evenement comme parametre
    db.query(
      sql,
      [
        event.titre,
        event.description,
        event.typeEvenement,
        event.dateDebut,
        event.dateFin,
        event.lieu ?? null,
        event.organisateurId,
        event.estObligatoire ?? null,
        event.nbPlacesMax ?? null,
        event.inviter ?? null,
        event.statut ?? null,
        event.createdAt,
        event.updatedAt,
        event.niveau,
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

  // la fonction update qui rajoute les champs a modifier dans la table evenements
  update: (event, callback) => {
    // requette sql qui remplace les valeurs de la table par les nouvelles valeurs
    let sql = "UPDATE evenements SET ";
    let params = [];
    if (event.titre) {
      sql += "titre=?, ";
      params.push(event.titre);
    }
    if (event.description !== undefined) {
      sql += "description=?, ";
      params.push(event.description);
    }
    if (event.typeEvenement) {
      sql += "type_evenement=?, ";
      params.push(event.typeEvenement);
    }
    if (event.dateDebut) {
      sql += "date_debut=?, ";
      params.push(event.dateDebut);
    }
    if (event.dateFin) {
      sql += "date_fin=?, ";
      params.push(event.dateFin);
    }
    if (event.lieu !== undefined) {
      sql += "lieu=?, ";
      params.push(event.lieu);
    }
    if (event.estObligatoire !== undefined) {
      sql += "est_obligatoire=?, ";
      params.push(event.estObligatoire);
    }
    if (event.nbPlacesMax !== undefined) {
      sql += "nb_places_max=?, ";
      params.push(event.nbPlacesMax);
    }
    if (event.inviter !== undefined) {
      sql += "inviter=?, ";
      params.push(event.inviter);
    }
    if (event.statut !== undefined) {
      sql += "statut=?, ";
      params.push(event.statut);
    }
    if (event.updatedAt) {
      sql += "updated_at=?, ";
      params.push(event.updatedAt);
    }
    if (event.niveau) {
      sql += "niveau=?, ";
      params.push(event.niveau);
    }
    if (params.length === 0) {
      const err = new Error("Aucun champ à modifier");
      err.code = "NO_FIELDS_TO_UPDATE";
      return callback(err, null);
    }

    // Vérifier si l'événement existe, puis exécuter l'UPDATE
    const sql_exist = "SELECT * FROM evenements WHERE id=?";
    db.query(sql_exist, [event.id], (err, existResults) => {
      if (err) {
        console.error("DB ERROR :", err);
        return callback(err, null);
      }
      if (existResults.length === 0) {
        const errNotFound = new Error("EVENT_NOT_FOUND");
        errNotFound.code = "EVENT_NOT_FOUND";
        return callback(errNotFound, null);
      }

      sql = sql.slice(0, -2);
      sql += " WHERE id=? AND organisateur_id=?";
      const updateParams = [...params, event.id, event.organisateurId];

      db.query(sql, updateParams, (err, results) => {
        if (err) {
          console.error("DB ERROR :", err);
          return callback(err, null);
        }
        if (results.affectedRows === 0) {
          const errOwned = new Error("EVENT_NOT_OWNED");
          errOwned.code = "EVENT_NOT_OWNED";
          return callback(errOwned, null);
        }
        return callback(null, results);
      });
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
      const sql = "SELECT email FROM utilisateurs WHERE email=?";
      // stock le resultat obtenu dans tableau rows
      const [rows] = await db.promise().query(sql, [mail]);
      // si trouve au moins 1 mail met userExiste en true et ajoute (push) le mail dans le userMailList
      if (rows.length > 0) {
        userExist = true;
        userMailList.push(mail);
      } else {
        // Si trouve pas renvoi une erreure et met userExist en false
        console.error("user email with email: ", mail, "does not exist");
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
