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
// Mapping des champs
const mapEventBody = (body) => {
  return {
    eventID: body.idEvenements,
    serviceID: body.idServices,
    userID: body.idUtilisateurs,
    createdAt: body.date_creation,
    startDate: body.date_debut,
    endDate: body.date_fin,
    description: body.description,
    userName: body.nom_createur,
    title: body.titre,
    type: body.type,
    level: body.niveau,
    invited: body.inviter,
  };
};

// Déclare et exporte event_list pour être appelée dans ../routes/eventRoutes.js
exports.event_list = function (req, res) {
  // Utilise le modèle listAll qui vient de ../models/event.js pour afficher tous les événements dans la variable results
  // Ainsi déclare err pour afficher les erreurs rencontrées dans la DB
  const serviceID = req.params.serviceID;
  Event.listAll(serviceID, (err, resultsOne, resultsTwo) => {
    // Vérifie si le header est bien Content-Type: application/json
    if (!verifyHeader(req, res)) {
      return;
    }
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
    // Renvoie les événements en cas de succès
    logSuccess(
      200,
      "Liste des événements récupérée avec succès (" +
        resultsOne.length +
        resultsTwo.length,
      " événement(s))",
    );
    res.status(200).json({
      message: resultsOne.length + resultsTwo.length,
      eventLevelOne: resultsOne,
      eventLevelTwo: resultsTwo,
    });
  });
};

exports.event_list_by_id = function (req, res) {
  // Utilise le modèle listById qui vient de ../models/event.js pour afficher un événement selon son id
  if (!verifyHeader(req, res)) {
    return;
  }
  // Récupère l'id depuis le paramètre de l'URL a partir de la requette (req) et l'assigne a la variable eventId
  const eventId = req.params.id;

  // Appelle la fonction listById du modèle Event et donne eventId comme parametre pour recuperer l'evenement
  Event.listById(eventId, (err, results) => {
    console.log("has been executed");
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

  // Déclaration de isValid bool avec une fonction validateEvent qui prend le body mapper de la requette comme variable
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
  Event.create(event, (err) => {
    if (err) {
      logError(
        409,
        "DUPLICATION_ERROR",
        "Un événement existe déjà avec cet ID : " + event.eventID,
      );
      return res.status(500).json({
        error: {
          error: "DUPLICATION_ERROR",
          message:
            "Un événement avec cet ID existe déjà dans la base de données",
          detail: err.message,
        },
      });
    }

    // Redonne le message de success en quoi l'evenement a ete crees
    logSuccess(
      201,
      "L'evenement crees avec success, ID evenement: " + event.eventID,
    );
    res.status(201).json({
      message: "L'événement a été créé",
      id: event.eventID,
    });
  });
};

exports.event_update = async (req, res) => {
  // Récupère le body mappé par la fonction mapEventBody
  const event = mapEventBody(req.body);
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
    if (err && err.code === "EVENT_NOT_OWNED") {
      logError(
        403,
        "PERMISSION_ERROR",
        "Droits insuffisants sur l'événement ID: " + event.eventID,
      );
      return res.status(403).json({
        error: {
          error: "PERMISSION_ERROR",
          message: "Vous ne posseder pas les droit sur cette evenement",
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

    // En cas de succès renvoie le message de succès et l'id de l'événement modifié
    logSuccess(201, "Événement modifié avec succès, ID: " + event.eventID);
    res.status(201).json({
      message: "La modification avec succès",
      id: event.eventID,
    });
  });
};

// Validation des champs
const validateEvent = async (event) => {
  const err = [];
  // Vérifie si le champ invited est présent
  if (event.invited === undefined) {
    err.push("Champ inviter est invalide");
  }
  const { userExist, mail } = await Event.checkIfUserExist(event.invited);
  if (!userExist) {
    err.push("l'utilisateur " + mail + " n'existe pas");
  }

  // Vérification eventID
  if (event.eventID === undefined || !Number.isInteger(Number(event.eventID))) {
    err.push("Champ idEvenements est invalide");
  }
  // Vérification serviceID
  if (
    event.serviceID === undefined ||
    !Number.isInteger(Number(event.serviceID))
  ) {
    err.push("Champ idServices est invalide");
  }
  // Vérification userID
  if (event.userID === undefined || !Number.isInteger(Number(event.userID))) {
    err.push("Champ idUtilisateurs est invalide");
  }

  // Vérification createdAt (doit être une date valide)
  // Date.parse transforme les caractères de dates en nombre
  // 2026-02-23 => 1771804800000
  if (!event.createdAt || isNaN(Date.parse(event.createdAt))) {
    err.push("Champ date_creation est invalide, doit être YYYY-MM-DD");
    // Appelle la fonction timeVerify qui vérifie si la date de création est avant aujourd'hui
  } else if (!timeVerify(Date.parse(event.createdAt))) {
    err.push("La date de début ne peut pas être avant aujourd'hui.");
    // Vérifie si la date de création est après la date de début
  } else if (Date.parse(event.createdAt) > Date.parse(event.startDate)) {
    err.push("La date de début ne peut pas être avant la date de création");
  }
  // Vérification startDate (doit être une date valide)
  if (!event.startDate || isNaN(Date.parse(event.startDate))) {
    err.push("Champ date_debut est invalide, doit être YYYY-MM-DD");
  }
  // Vérification endDate (doit être une date valide)
  if (!event.endDate || isNaN(Date.parse(event.endDate))) {
    err.push("Champ date_fin est invalide, doit être YYYY-MM-DD");
    // Vérifie si la date de fin n'est pas avant la date de début
  } else if (event.endDate < event.startDate) {
    err.push("La date de fin ne peut pas être avant la date de début");
  }

  // Vérification des autres champs
  if (
    event.description !== undefined &&
    typeof event.description !== "string"
  ) {
    err.push("Champ description doit être une chaîne de caractères");
  }
  // Vérification userName (obligatoire)
  if (!event.userName || typeof event.userName !== "string") {
    err.push("Champ nom_createur est invalide");
  }
  // Vérification title (obligatoire)
  if (!event.title || typeof event.title !== "string") {
    err.push("Champ titre est invalide");
  }
  // Vérification type (obligatoire)
  if (!event.type || typeof event.type !== "string") {
    err.push("Champ type est invalide");
  }

  // Vérifie si le niveau est soit 1 ou 2
  if (event.level !== "1" && event.level !== "2") {
    err.push("Champ niveau est invalide doit être 1 ou 2");
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

  if (event.createdAt) {
    err.push("Vous ne povez pas changer la date de creation de l'evenement");
  }
  // Vérifie si le champ invited est présent
  if (event.invited === undefined) {
    err.push("Champ inviter est invalide");
  } else {
    const { userExist, mail } = await Event.checkIfUserExist(event.invited);
    if (!userExist) {
      err.push("l'utilisateur " + mail + " n'existe pas");
      codeError = 404;
    }
  }

  // Vérification eventID
  if (event.eventID === undefined || !Number.isInteger(Number(event.eventID))) {
    err.push("Champ idEvenements est invalide ou non ajouté");
  }
  // Vérification serviceID
  if (
    event.serviceID === undefined ||
    !Number.isInteger(Number(event.serviceID))
  ) {
    err.push("Champ idServices est invalide ou non ajouté");
  }

  // Vérification du niveau si 1 ou 2
  if (event.level !== "1" && event.level !== "2") {
    err.push("Champ niveau est invalide doit être 1 ou 2");
  }

  return {
    isValid: err.length === 0,
    err,
    codeError,
  };
};

// Vérifie le header de la requête
const verifyHeader = (req, res) => {
  // Déclaration de ce à quoi doit ressembler le header de la requête
  const header = req.headers["content-type"];

  // Vérification du header, s'il n'y en a pas : erreur, s'il y en a un mais incorrect : erreur 415
  if (!header || !header.includes("application/json")) {
    logError(
      415,
      "INVALID_CONTENT_TYPE",
      "Le header doit être Content-Type: application/json",
    );
    res.status(415).json({
      error: {
        code: "INVALID_CONTENT_TYPE",
        message: "Le header doit être Content-Type: application/json",
      },
    });
    return false;
  }
  return true;
};

const timeVerify = (time) => {
  const today = Date.now();
  return time >= today;
};
