const { db } = require("../config/database");

const Event = {
  // fonction listAll qui permet de recuperer tous les evenements de la base de donnees
  listAll: (userId, userRole, callback) => {
    // requette sql pour recuperer tous les evenements
    const adminsql = "SELECT * FROM evenements;"; // pour admin

    const sql = "SELECT * FROM evenements WHERE niveau=1";
    const eventIdsSql =
      "SELECT evenement_id FROM participations WHERE user_id=?";
    const secondSql = "SELECT * FROM evenements WHERE niveau=2 AND id IN (?)";

    if (userRole === "admin") {
      db.query(adminsql, (err, resultsAdmin) => {
        if (err) {
          console.error("DB ERROR :", err);
          return callback(err, null);
        }
        return callback(null, resultsAdmin, null, null);
      });
    } else {
      db.query(sql, (err, resultsLvlOne) => {
        if (err) {
          console.error("DB ERROR :", err);
          return callback(err, null);
        }
        db.query(eventIdsSql, [userId], (err, resultsEventIds) => {
          if (err) {
            console.error("DB_ERROR :", err);
            return callback(err, null, null, null);
          }

          const eventIds = (resultsEventIds || []).map((r) => r.evenement_id);

          if (eventIds.length === 0) {
            return callback(null, null, resultsLvlOne, []);
          }

          db.query(secondSql, [eventIds], (err, resultsLvlTwo) => {
            if (err) {
              console.error("DB ERROR :", err);
              return callback(err, null, null, null);
            }
            return callback(null, null, resultsLvlOne, resultsLvlTwo || []);
          });
        });
      });
    }
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

  // fonction listByEmail qui prend comme valeur des emails dans la fonction event_list_by_email
  listByEmail: async (email, callback) => {
    // requette sql qui selectionne les utilisateurs a partir du email donner(email) dans la table utilisateurs
    const sql = "SELECT id, email FROM utilisateurs WHERE email LIKE ?";
    const pattern = "%" + email + "%";
    db.query(sql, [pattern], (err, results) => {
      if (err) {
        console.error("DB_ERROR:", err);
        return callback(err, null);
      }
      return callback(null, results);
    });
  },

  // fonction create qui cree une requette d'Insertion dans la table evenements
  create: async (event, department, callback) => {
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
        statut, 
        created_at, 
        updated_at, 
        niveau)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
    `;

    const sqlParticipation =
      "INSERT INTO participations (evenement_id, user_id, commentaire, statut, created_at, updated_at) VALUES(?,?,?,?,?,?)";
    const getUserRoleFromId = "SELECT role FROM utilisateurs WHERE id=?";
    const getUserIdsFromDepartment =
      "SELECT id FROM utilisateurs WHERE departement=?";

    const [getUserRoleFromIdResult] = await db
      .promise()
      .query(getUserRoleFromId, [event.organizerId]);
    if (
      getUserRoleFromIdResult[0].role !== "manager" &&
      getUserRoleFromIdResult[0].role !== "admin"
    ) {
      const err = new Error("USER_NOT_AUTHORIZED");
      err.code = "USER_NOT_AUTHORIZED";
      return callback(err, null);
    }

    // 1. Validations AVANT l'INSERT (pour ne pas insérer si erreur)
    let idsForParticipations = [];
    if (event.invited && String(event.invited).trim()) {
      const { userExist, userIdsList } = await Event.checkIfUserExist(
        event.invited,
      );
      if (userExist === false) {
        const err = new Error("USER_NOT_FOUND");
        err.code = "USER_NOT_FOUND";
        return callback(err, null);
      }
      idsForParticipations = [...(userIdsList || [])];
    }

    if (department) {
      const [deptResults] = await db
        .promise()
        .query(getUserIdsFromDepartment, [department]);
      if (deptResults.length === 0) {
        const err = new Error("USER_NOT_FOUND_FOR_DEPARTMENT");
        err.code = "USER_NOT_FOUND_FOR_DEPARTMENT";
        return callback(err, null);
      }
      idsForParticipations.push(...deptResults.map((user) => user.id));
    }
    // Dédupliquer : un user peut être à la fois invité ET dans le département
    idsForParticipations = [...new Set(idsForParticipations)];

    // 2. INSERT evenement (seulement si toutes les validations passent)
    const statutValue = event.status ?? "planifie";

    db.query(
      sql,
      [
        event.title,
        event.description,
        event.eventType,
        event.startDate,
        event.endDate,
        event.location ?? null,
        event.organizerId,
        event.isRequired ?? null,
        event.maxPlaces ?? null,
        statutValue,
        event.createdAt,
        event.updatedAt,
        event.level,
      ],
      (err, results) => {
        if (err) {
          console.error("DB ERROR :", err);
          return callback(err, null);
        }
        const eventId = results.insertId;

        if (idsForParticipations.length === 0) {
          return callback(null, { eventId, participationIds: [] });
        }

        const participationIds = [];
        let completed = 0;
        for (const userId of idsForParticipations) {
          db.query(
            sqlParticipation,
            [
              eventId,
              userId,
              event.comment ?? null,
              "en_attente",
              event.createdAt,
              event.updatedAt ?? null,
            ],
            (err, resultsParticipations) => {
              if (err) {
                console.error("DB ERROR :", err);
                return callback(err, null);
              }
              participationIds.push(resultsParticipations.insertId);
              completed++;
              if (completed === idsForParticipations.length) {
                return callback(null, { eventId, participationIds });
              }
            },
          );
        }
      },
    );
  },

  // la fonction update qui rajoute les champs a modifier dans la table evenements
  update: (event, callback) => {
    // requette sql qui remplace les valeurs de la table par les nouvelles valeurs
    let sql = "UPDATE evenements SET ";
    let params = [];

    let sqlParticipations = "UPDATE participations SET ";
    let participationsParams = [];

    // Vérifier si l'événement existe, puis exécuter l'UPDATE
    const sql_exist = "SELECT * FROM evenements WHERE id=?";
    // Pour table evenements
    if (event.title) {
      sql += "titre=?, ";
      params.push(event.title);
    }
    if (event.description !== undefined) {
      sql += "description=?, ";
      params.push(event.description);
    }
    if (event.eventType) {
      sql += "type_evenement=?, ";
      params.push(event.eventType);
    }
    if (event.startDate) {
      sql += "date_debut=?, ";
      params.push(event.startDate);
    }
    if (event.endDate) {
      sql += "date_fin=?, ";
      params.push(event.endDate);
    }
    if (event.location !== undefined) {
      sql += "lieu=?, ";
      params.push(event.location);
    }
    if (event.isRequired !== undefined) {
      sql += "est_obligatoire=?, ";
      params.push(event.isRequired);
    }
    if (event.maxPlaces !== undefined) {
      sql += "nb_places_max=?, ";
      params.push(event.maxPlaces);
    }
    if (event.status !== undefined) {
      sql += "statut=?, ";
      params.push(event.status);
    }
    if (event.updatedAt) {
      sql += "updated_at=?, ";
      params.push(event.updatedAt);
    }
    if (event.level) {
      sql += "niveau=?, ";
      params.push(event.level);
    }

    // Pour table participations
    if (event.statusParticipation !== undefined) {
      sqlParticipations += "statut=?, ";
      participationsParams.push(event.statusParticipation);
    }
    if (event.comment) {
      sqlParticipations += "commentaire=?, ";
      participationsParams.push(event.comment);
    }
    if (params.length === 0) {
      const err = new Error("Aucun champ à modifier");
      err.code = "NO_FIELDS_TO_UPDATE";
      return callback(err, null);
    }

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
      sqlParticipations = sqlParticipations.slice(0, -2);
      sqlParticipations += " WHERE evenement_id=?";

      const updateParams = [...params, event.id, event.organizerId];
      const updateParticipationsParams = [...participationsParams, event.id];

      console.log(sqlParticipations, updateParticipationsParams);

      if (updateParams.length > 0) {
        db.query(sql, updateParams, async (err, results) => {
          if (err) {
            console.error("DB ERROR :", err);
            return callback(err, null);
          }
          if (results.affectedRows === 0) {
            const errOwned = new Error("EVENT_NOT_OWNED");
            errOwned.code = "EVENT_NOT_OWNED";
            return callback(errOwned, null);
          }
          if (participationsParams.length > 0) {
            db.query(
              sqlParticipations,
              updateParticipationsParams,
              (err, resultsParticipations) => {
                if (err) {
                  console.error("DB ERROR :", err);
                  return callback(err, null);
                }
                if (resultsParticipations.affectedRows === 0) {
                  const errParticipationsNotFound = new Error(
                    "PARTICIPATIONS_NOT_FOUND",
                  );
                  errParticipationsNotFound.code = "PARTICIPATIONS_NOT_FOUND";
                  return callback(errParticipationsNotFound, null);
                }
                return callback(null, results);
              },
            );
          }
        });
      }
    });
  },

    // fonction delete qui supprime un evenement de la table evenements a partir de son id
  delete: (eventId, callback) => {
    // requette sql qui supprime l'evenement a partir du id donner(eventId) dans la table evenements  
    const sql = "DELETE FROM evenements WHERE id = ?";
    // execute la query en lui donnant la requette (sql) et le eventId comme parametre
    db.query(sql, [eventId], (err, results) => {
      // en cas d'erreur renvoi l'erreur
      if (err) {
        console.error("DB ERROR :", err);
        return callback(err, null);
      }
      return callback(null, results);
    });
  } ,
  


  // fonction qui lance  une requette pour verfier si utilisateurs dans champ inviter existe deans la DB
  checkIfUserExist: async (userMail) => {
    // declaraison de la variable userExiste qui va aider a renvoyer l'erreure en cas si email existe pas
    let userExist = false;
    // declaraison de la liste userMailList pour stocker les email des utilisateur apres que l'email a ete verifier
    let userMailList = [];
    let userIdsList = [];
    // Convertie le tableau de(s) email(s) en une chaine de charachter string
    // ["mail1.com, mail2.com"] => "mail1.com, mail2.com"
    const userMailString = String(userMail);
    // split: separe le userMailString en plusieure string grace a la virgule
    // map((x)=>x.trim):  pour chaque element suprime les espaces
    const mails = userMailString.split(",").map((x) => x.trim());
    // Boucle chaque mail dans mails pour verifier si existe dans la DB
    for (const mail of mails) {
      // requette sql pour verifier si mail existe
      const sql = "SELECT email, id FROM utilisateurs WHERE email=?";
      // stock le resultat obtenu dans tableau rows
      const [rows] = await db.promise().query(sql, [mail]);
      // si trouve au moins 1 mail met userExiste en true et ajoute (push) le mail dans le userMailList
      if (rows.length > 0) {
        userExist = true;
        userMailList.push(mail);
        userIdsList.push(rows[0].id);
      } else {
        // Si trouve pas renvoi une erreure et met userExist en false
        console.error("user email with email: ", mail, "does not exist");
        userExist = false;
        // renvoi user exist et mail qui n'a pas ete trouver
        return { userExist, mail: mail, userId: null };
      }
    }
    // en cas success renvoi userExiste et userMailList
    return { userExist, userMailList, userIdsList };
  },
};

module.exports = Event;
