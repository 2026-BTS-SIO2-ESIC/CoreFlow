// Déclare le modèle event pour accéder aux fonctions dans le modèle
var Event = require("../models/event");

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
// Mapping des champs (structure table evenements)
const mapEventBody = (body) => {
  return {
    id: body.id,
    title: body.titre,
    description: body.description,
    eventType: body.type_evenement,
    startDate: body.date_debut,
    endDate: body.date_fin,
    location: body.lieu,
    organizerId: body.organisateur_id,
    isRequired: body.est_obligatoire,
    maxPlaces: body.nb_places_max,
    status: body.statut,
    level: body.niveau,
    createdAt: body.created_at,
    updatedAt: body.updated_at,

    statusParticipation: body.statut_participation,
    invited: body.inviter,
    department: body.departement,
    comment: body.commentaire,
  };
};

// Déclare et exporte event_list pour être appelée dans ../routes/eventRoutes.js
exports.event_list = async function (req, res) {
  // Utilise le modèle listAll qui vient de ../models/event.js pour afficher tous les événements dans la variable results
  // Ainsi déclare err pour afficher les erreurs rencontrées dans la DB
  const userId = req.params.user_id;
  const userRole = req.params.userRole;

  Event.listAll(
    userId,
    userRole,
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
      console.log("result admin", resultsAdmin);
      console.log("result lvl two", resultsLvlTwo);
      console.log("result lvl one", resultsLvlOne);
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
  Event.create(event, event.department, (err, results) => {
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

// Validation des champs (create)
const validateEvent = async (event) => {
  const err = [];

  // Vérification organisateur_id (obligatoire)
  if (
    event.organizerId === undefined ||
    !Number.isInteger(Number(event.organizerId))
  ) {
    err.push("Champ organisateur_id est invalide ou requis");
  }

  // Vérification inviter (requis si niveau=2)
  if (
    event.invited !== undefined &&
    event.invited !== null &&
    event.invited !== ""
  ) {
    const { userExist, mail } = await Event.checkIfUserExist(event.invited);
    if (!userExist) {
      err.push("L'utilisateur " + mail + " n'existe pas");
    }
  }

  // Vérification date_debut
  if (!event.startDate || isNaN(Date.parse(event.startDate))) {
    err.push(
      "Champ date_debut est invalide, doit être une date valide (YYYY-MM-DD)",
    );
  } else if (!timeVerify(Date.parse(event.startDate))) {
    err.push("La date de début ne peut pas être avant aujourd'hui");
  }

  // Vérification date_fin
  if (!event.endDate || isNaN(Date.parse(event.endDate))) {
    err.push(
      "Champ date_fin est invalide, doit être une date valide (YYYY-MM-DD)",
    );
  } else if (event.startDate && event.endDate < event.startDate) {
    err.push("La date de fin ne peut pas être avant la date de début");
  }

  // Vérification description
  if (
    event.description !== undefined &&
    typeof event.description !== "string"
  ) {
    err.push("Champ description doit être une chaîne de caractères");
  }

  // Vérification titre (obligatoire)
  if (!event.title || typeof event.title !== "string") {
    err.push("Champ titre est invalide ou requis");
  }

  // Vérification type_evenement (obligatoire)
  if (!event.eventType || typeof event.eventType !== "string") {
    err.push("Champ type_evenement est invalide ou requis");
  }

  // Vérification niveau (1 ou 2)
  if (event.level !== "1" && event.level !== "2") {
    err.push("Champ niveau est invalide, doit être 1 ou 2");
  }

  // Vérification nb_places_max si fourni
  if (event.maxPlaces !== undefined && event.maxPlaces !== null) {
    if (
      !Number.isInteger(Number(event.maxPlaces)) ||
      Number(event.maxPlaces) < 0
    ) {
      err.push("Champ nb_places_max doit être un entier positif");
    }
  }

  //available status 'planifie','en_cours','termine','annule'
  if (event.status !== undefined && event.status !== null) {
    if (
      event.status !== "planifie" &&
      event.status !== "en_cours" &&
      event.status !== "termine" &&
      event.status !== "annule"
    ) {
      err.push(
        "Champ statut est invalide, doit être planifie, en_cours, termine ou annule",
      );
    }
  }

  // Vérification est_obligatoire si fourni (booléen 0/1)
  if (event.isRequired !== undefined && event.isRequired !== null) {
    const v = Number(event.isRequired);
    if (v !== 0 && v !== 1) {
      err.push("Champ est_obligatoire doit être 0 ou 1");
    }
  }

  return {
    isValid: err.length === 0,
    err,
  };
};

// Valide les champs nécessaires pour modifier l'événement
const validateUpdateEvent = async (event) => {
  const err = [];
  let codeError = 400;

  // Vérification id (obligatoire pour update)
  if (event.id === undefined || !Number.isInteger(Number(event.id))) {
    err.push("Champ id est invalide ou requis pour la mise à jour");
  }

  // Vérification organisateur_id (obligatoire pour vérifier la propriété)
  if (
    event.organizerId === undefined ||
    !Number.isInteger(Number(event.organizerId))
  ) {
    err.push(
      "Champ organisateur_id est invalide ou requis pour la mise à jour",
    );
  }

  // Vérification inviter si fourni
  if (
    event.invited !== undefined &&
    event.invited !== null &&
    event.invited !== ""
  ) {
    const { userExist, mail } = await Event.checkIfUserExist(event.invited);
    if (!userExist) {
      err.push("L'utilisateur " + mail + " n'existe pas");
      codeError = 404;
    }
  }

  if (event.status !== undefined && event.status !== null) {
    if (
      event.status !== "planifie" &&
      event.status !== "en_cours" &&
      event.status !== "termine" &&
      event.status !== "annule"
    ) {
      err.push(
        "Champ statut est invalide, doit être planifie, en_cours, termine ou annule",
      );
    }
  }

  // Vérification niveau si fourni
  if (event.level !== undefined && event.level !== "1" && event.level !== "2") {
    err.push("Champ niveau est invalide, doit être 1 ou 2");
  }

  return {
    isValid: err.length === 0,
    err,
    codeError,
  };
};

const timeVerify = (time) => {
  const today = Date.now();
  return time >= today;
};
