// Déclare le modèle event pour accéder aux fonctions dans le modèle
var Event = require("../repository/eventRepository");
const {
  validateEvent,
  validateUpdateEvent,
  validateDeleteEvent,
  validateEventList,
} = require("../services/eventService");

const logSuccess = (code, msg) => {
  console.log(
    "\x1b[32mSTATUS CODE:\x1b[0m[\x1b[32m" +
      code +
      "\x1b[0m]" +
      "\n" +
      "\x1b[32mSUCCESS:\x1b[0m",
    msg,
  );
};

const logError = (code, errorCode, msg) => {
  console.error(
    "\x1b[31mSTATUS CODE:\x1b[0m[\x1b[31m" +
      code +
      "\x1b[0m]" +
      "\n" +
      "\x1b[31mERROR [" +
      errorCode +
      "]:\x1b[0m",
    msg,
  );
};
// DB: type_evenement ENUM('reunion','formation','afterwork','seminaire','autre')
const TYPE_EVENT_MAP = {
  meeting: "reunion",
  conference: "seminaire",
  atelier: "formation",
};

// Mapping des champs (structure table evenements)
const mapEventBody = (body) => {
  const rawType = body.type_evenement;
  const eventType =
    rawType && TYPE_EVENT_MAP[rawType] ? TYPE_EVENT_MAP[rawType] : rawType;
  return {
    id: body.id,
    title: body.titre,
    description: body.description,
    eventType,
    startDate: body.date_debut,
    endDate: body.date_fin,
    location: body.lieu,
    organizerId: body.organisateur_id,
    isRequired: body.est_obligatoire,
    maxPlaces: body.nb_places_max,
    status: body.statut ?? "planifie",
    level: body.niveau,
    createdAt: body.created_at,
    updatedAt: body.updated_at,

    statusParticipation: body.statut_participation,
    invited: body.inviter,
    department: body.departement ?? body.department,
    comment: body.commentaire,
  };
};

// Déclare et exporte event_list pour être appelée dans ../routes/eventRoutes.js
exports.event_list = async function (req, res) {
  // Utilise le modèle listAll qui vient de ../models/event.js pour afficher tous les événements dans la variable results
  // Ainsi déclare err pour afficher les erreurs rencontrées dans la DB
  const userId = req.params.user_id;
  const userRole = req.params.userRole;
  const typeFilter = req.query.type;

  Event.listAll(
    userId,
    userRole,
    typeFilter,
    (err, resultsAdmin, resultsLvlOne, resultsLvlTwo) => {
      // Vérifie si le header est bien Content-Type: application/json
      // Renvoie une erreur en cas d'une mauvaise requête vers la DB
      if (err) {
        logError(
          500,
          "FETCH_FAILURE",
          "Erreur lors de la récupération de la liste des événements: " +
            err.message,
        );
        return res.status(500).json({
          error: {
            error: "FETCH_FAILURE",
            message:
              "Erreur lors de la récupération de la liste des événements, vérifier le modèle sql",
            details: err.message,
          },
        });
      }
      if (resultsAdmin != null) {
        logSuccess(
          200,
          "Liste des événements récupérée avec succès (" +
            resultsAdmin.length +
            " événement(s))",
        );
        res.status(200).json({
          message: resultsAdmin.length,
          eventAdmin: resultsAdmin,
        });
      } else {
        // Renvoie les événements en cas de succès
        logSuccess(
          200,
          "Liste des événements récupérée avec succès (" +
            resultsLvlOne.length +
            resultsLvlTwo.length,
          " événement(s))",
        );
        res.status(200).json({
          message: resultsLvlOne.length + resultsLvlTwo.length,
          eventLevelOne: resultsLvlOne,
          eventLevelTwo: resultsLvlTwo,
        });
      }
    },
  );
};

exports.user_list_by_email = function (req, res) {
  // Utilise le modèle listByEmail qui vient de ../models/event.js pour afficher les utilisateurs selon email donner dans la requette
  // Récupère l'id depuis le paramètre de l'URL a partir de la requette (req) et l'assigne a la variable eventId

  // Appelle la fonction listById du modèle Event et donne eventId comme parametre pour recuperer l'evenement
  Event.listByEmail(req.body.email, async (err, resultsUserIds) => {
    // Vérification des erreurs
    if (err) {
      logError(
        500,
        "DB_ERROR",
        "Erreur lors de la récupération des utilisateurs par email: " +
          err.message,
      );
      return res.status(500).json({
        error: {
          error: "DB_ERROR",
          message: "Erreur lors de la récupération des utilisateurs par email",
          detail: err.message,
        },
      });
    } else if (resultsUserIds.length === 0) {
      // En cas où l'événement n'existe pas, affiche une erreur 404
      logError(
        404,
        "NOT FOUND",
        "Aucun utilisateurs existe avec les charactères donnés (email: " +
          req.body.email +
          ")",
      );
      return res.status(404).json({
        error: {
          error: "NOT FOUND",
          message:
            "Aucun utilisateurs existe avec les charactères donnés (email: " +
            req.body.email +
            ")",
        },
      });
    }
    // Affiche la réponse
    logSuccess(200, "Utilisateurs récupérés par email: " + req.body.email);
    res.status(200).json({
      message: resultsUserIds.length,
      usersInfos: resultsUserIds,
    });
  });
};

exports.event_list_by_id = function (req, res) {
  // Utilise le modèle listById qui vient de ../models/event.js pour afficher un evenement selon id donner dans la requette
  // Récupère l'id depuis le paramètre de l'URL a partir de la requette (req) et l'assigne a la variable eventId
  const eventId = req.params.id;

  // Appelle la fonction listById du modèle Event et donne eventId comme parametre pour recuperer l'evenement
  Event.listById(eventId, (err, results) => {
    // Vérification des erreurs
    if (err) {
      logError(
        500,
        "DB_ERROR",
        "Erreur lors de la récupération de l'événement par id: " + err.message,
      );
      return res.status(500).json({
        error: {
          error: "DB_ERROR",
          message: "Erreur lors de la récupération de l'événement par id",
          detail: err.message,
        },
      });
    } else if (results.length === 0) {
      // En cas où l'événement n'existe pas, affiche une erreur 404
      logError(
        404,
        "NOT FOUND",
        "L'événement n'existe pas (ID: " + eventId + ")",
      );
      return res.status(404).json({
        error: {
          error: "NOT FOUND",
          message: "L'événement n'existe pas",
        },
      });
    }
    // Affiche la réponse
    logSuccess(200, "Événement récupéré par ID: " + eventId);
    res.status(200).json({
      message: results.length,
      event: results,
    });
  });
};

exports.event_create = async (req, res) => {
  // recuprer le body mapper de la requette
  const event = mapEventBody(req.body);

  const userRole = req.params.userRole;
  if (userRole !== "manager" && userRole !== "admin") {
    return res.status(403).json({
      error: {
        error: "PERMISSION_DENIED",
        message: "Vous n'avez pas les droits pour crees un evenement",
      },
    });
  }

  // Déclaration de isValid bool avec une fonction validateEvent qui prend le body mapper de la requette comme variable
  // Générer created_at et updated_at si non fournis
  if (!event.createdAt)
    event.createdAt = new Date().toISOString().slice(0, 19).replace("T", " ");
  if (!event.updatedAt)
    event.updatedAt = new Date().toISOString().slice(0, 19).replace("T", " ");

  const { isValid, err } = await validateEvent(event);
  if (!isValid) {
    logError(
      400,
      "INVALID_FIELDS",
      "Erreur lors de la validation des champs JSON: " + JSON.stringify(err),
    );
    return res.status(400).json({
      error: {
        error: "INVALID_FIELDS",
        message:
          "Erreur lors de la validation des champs json vérifier que les champs sont corrects",
        details: err,
      },
    });
  }

  // Appelle la fonction create du modèle Event, prend event comme paramètre
  Event.create(event, event.department || null, (err, results) => {
    if (err) {
      logError(
        500,
        "DB_ERROR",
        "Erreur lors de la création de l'événement: " + err.message,
      );
      return res.status(500).json({
        error: {
          error: "DB_ERROR",
          message: "Erreur lors de la création de l'événement",
          detail: err.message,
        },
      });
    }

    const { eventId, participationIds } = results;
    logSuccess(201, "Événement créé avec succès, ID: " + eventId);
    logSuccess(
      201,
      "Participations créées avec succès, IDs: " + participationIds.join(", "),
    );
    res.status(201).json({
      message: "L'événement et les participations ont été créés avec succès",
      id: eventId,
      participationIds,
    });
  });
};

exports.event_update = async (req, res) => {
  // Récupère le body mappé par la fonction mapEventBody
  const event = mapEventBody(req.body);
  // Mise à jour de updated_at
  event.updatedAt = new Date().toISOString().slice(0, 19).replace("T", " ");
  // Vérifie les champs importants
  const { isValid, err, codeError } = await validateUpdateEvent(event);

  // En cas où les champs sont invalides renvoie une erreur 400
  if (!isValid) {
    logError(
      codeError,
      "INVALID_FIELD",
      "Erreur lors de la validation (update): " + JSON.stringify(err),
    );
    return res.status(codeError).json({
      error: {
        error: "INVALID_FIELD",
        message: err,
      },
    });
  }
  // Appelle la fonction updateEvent du modèle Event
  Event.update(event, (err) => {
    if (err && err.code === "EVENT_NOT_FOUND") {
      logError(
        404,
        "NOT_FOUND",
        "Événement introuvable (ID: " + event.id + ")",
      );
      return res.status(404).json({
        error: {
          error: "NOT_FOUND",
          message: "L'événement n'existe pas",
          details: err.message,
        },
      });
    }
    if (err && err.code === "EVENT_NOT_OWNED") {
      logError(
        403,
        "PERMISSION_ERROR",
        "Droits insuffisants sur l'événement ID: " + event.id,
      );
      return res.status(403).json({
        error: {
          error: "PERMISSION_ERROR",
          message: "Vous ne possédez pas les droits sur cet événement",
          details: err.message,
        },
      });
    }
    if (err) {
      logError(
        500,
        "DB_ERROR",
        "Erreur lors de la modification de l'événement: " + err.message,
      );
      return res.status(500).json({
        error: {
          error: "DB_ERROR",
          message: "Erreur lors de la modification de l'événement",
          details: err.message,
        },
      });
    }

    logSuccess(201, "Événement modifié avec succès, ID: " + event.id);
    res.status(201).json({
      message: "La modification a réussi",
      id: event.id,
    });
  });
};


// Fonction qui permet de supprimer un événement, prend l'id de l'événement à supprimer depuis les paramètres de l'URL
exports.event_delete = async (req, res) => {
    const eventId = req.params.id;

    // 1. Validation via le Service (ton service utilise async/await)
    const { isValid, err } = await validateDeleteEvent({ id: eventId });
    
    if (!isValid) {
        console.error("[VALIDATION_ERROR]", err);
        return res.status(400).json({ error: "ID invalide", details: err });
    }

    // 2. Appel au Repository (style Callback)
    Event.delete(eventId, (err, results) => {
        if (err) {
            // Gestion erreur 404 (demandée par ton collègue)
            if (err.code === "EVENT_NOT_FOUND") {
                console.error(`[NOT_FOUND] Événement ${eventId} inexistant.`);
                return res.status(404).json({ error: "Événement introuvable" });
            }
            // Gestion erreur 500
            console.error("[DB_ERROR]", err.message);
            return res.status(500).json({ error: "Erreur lors de la suppression" });
        }

        // 3. Succès
        console.log(`[SUCCESS] Événement ${eventId} supprimé par ${req.user.id}`);
        return res.status(200).json({ 
            message: "Événement supprimé avec succès", 
            id: eventId 
        });
    });
};


// methode Get pour afficher les evenements passés, prend l'id de l'utilisateur depuis les paramètres de l'URL
exports.past_events = async (req, res) => {
  const userId = req.params.user_id || req.user.id;

  const { isValid, err } = await validateEventList(userId);
  if (!isValid) return res.status(400).json({ error: err });

  Event.listPast(userId, (err, results) => {
    if (err) {
      console.error("[DB_ERROR]", err.message);
      return res.status(500).json({ error: "Erreur lors de la récupération des archives" });
    }
    res.status(200).json({ success: true, count: results.length, data: results });
  });
};

// methode Get pour afficher les evenements à venir, prend l'id de l'utilisateur depuis les paramètres de l'URL

exports.future_events = async (req, res) => {
  const userId = req.params.user_id || req.user.id;

  const { isValid, err } = await validateEventList(userId);
  if (!isValid) return res.status(400).json({ error: err });

  Event.listFuture(userId, (err, results) => {
    if (err) {
      console.error("[DB_ERROR]", err.message);
      return res.status(500).json({ error: "Erreur lors de la récupération des événements à venir" });
    }
    res.status(200).json({ success: true, count: results.length, data: results });
  });
};


exports.event_respond = async (req, res) => {
  const { eventId, userId, status } = req.body;
  
  Event.updateParticipation(eventId, userId, status, (err, results) => {
    if (err) {
      logError(500, "DB_ERROR", "Erreur participation: " + err.message);
      return res.status(500).json({ error: "Erreur lors de la réponse" });
    }
    logSuccess(200, `Utilisateur ${userId} a répondu ${status} à l'event ${eventId}`);
    res.status(200).json({ message: "Réponse enregistrée" });
  });
};

exports.getAllEvents = (req, res) => {
    const userId = req.user.id;
    const userRole = req.user.role;

    // On passe bien (err, results) à la fin
    Event.listAll(userId, userRole, (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Erreur serveur", error: err });
        }
        return res.status(200).json(results);
    });
};

// La logique de validation métier est déportée dans services/eventService.js
