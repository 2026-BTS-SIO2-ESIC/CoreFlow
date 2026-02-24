// Declare le model event pour accéder aux fonctions dans le model
var Event = require("../models/event");

// Maping des champs
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

// declare et export event_list pour etre appeler dans ../routes/eventRoutes.js
exports.event_list = function (req, res) {
  // utilise le model listAll qui vien de ../models/event.js pour afficher tout les evenements dans la variable results
  //Ainsi declare err pour aficher les erreur rencontrer dans la DB
  Event.listAll((err, results) => {
    // Verifie si le header est bien Content-Type: application/json
    if (!verifyHeader(req, res)) {
      return;
    }

    // Renvoie une erreur en cas d'une mauvaise requête vers la DB
    if (err) {
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
    res.status(200).json({
      message: results.length,
      event: results,
    });
  });
};

exports.event_create = (req, res) => {
  const event = mapEventBody(req.body);

  // Declaraison de isValid bool avec une fonction validateEvent qui prend la requette nomme event comme variable
  const { isValid, err } = validateEvent(event);
  if (!isValid) {
    console.log(event);
    return res.status(400).json({
      error: {
        error: "INVALID_FIELDS",
        message:
          "Erreur lors de la validation des champs json vérifier que les champs sont corrects",
        details: err,
      },
    });
  }

  // Appelle la fonction create de model Event, prend event comme parametre
  Event.create(event, (err) => {
    if (err) {
      return res.status(500).json({
        error: {
          error: "DUPLICATION_ERROR",
          message:
            "Un evenement avec cet ID existe deja dans la base de données",
          detail: err.message,
        },
      });
    }

    //
    res.status(201).json({
      message: "L'événement a été créé",
      id: event.eventID,
    });
  });
};

exports.event_update = (req, res) => {
  const event = mapEventBody(req.body);
  const { isValid, err } = validateUpdateEvent(event);

  if (!isValid) {
    console.log(event);
    return res.status(400).json({
      error: {
        error: "INVALID_FIELD",
        message: err,
      },
    });
  }
  Event.update(event, (err) => {
    if (err) {
      return res.status(500).json({
        error: {
          error: "DB_ERROR",
          message: "Erreur lors de la modification de l'évenement",
          details: err.message,
        },
      });
    }

    res.status(201).json({
      message: "la modification avec cuccess",
      id: event.eventID,
    });
  });
};

// Validation des champs
const validateEvent = (event) => {
  const err = [];
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
  // Date.parse transforme les charachters de Dates en nombre
  // 2026-02-23 => 1771804800000
  if (!event.createdAt || isNaN(Date.parse(event.createdAt))) {
    err.push("Champ date_creation est invalide, doit être YYYY-MM-DD");
  } else if (!timeVerify(Date.parse(event.createdAt))) {
    err.push("La date du debut ne peut pas etre avant aujourd'hui.");
  } else if (Date.parse(event.createdAt) > Date.parse(event.startDate)) {
    err.push("La date debut ne peut pas etre avant la date du creation");
  }
  // Vérification startDate (doit être une date valide)
  if (!event.startDate || isNaN(Date.parse(event.startDate))) {
    err.push("Champ date_debut est invalide, doit être YYYY-MM-DD");
  }
  // Vérification endDate (doit être une date valide)
  if (!event.endDate || isNaN(Date.parse(event.endDate))) {
    err.push("Champ date_fin est invalide, doit être YYYY-MM-DD");
  } else if (event.endDate < event.startDate) {
    err.push("la date fin ne peut pas etre avat la date du debut");
  }

  // Vérification description (optionnel, mais si présent doit être une string)
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

  if (event.level !== "1" && event.level !== "2") {
    err.push("Champ niveau est invalide doit etre 1 ou 2");
  }

  if (!event.invited) {
    err.push("Champ inviter est invalide");
  }

  return {
    isValid: err.length === 0,
    err,
  };
};

// Valide les champ nessesaire pour modifier l'évenement
const validateUpdateEvent = (event) => {
  const err = [];
  // Vérification eventID
  if (event.eventID === undefined || !Number.isInteger(Number(event.eventID))) {
    err.push("Champ idEvenements est invalide ou non ajouter");
  }
  // Vérification serviceID
  if (
    event.serviceID === undefined ||
    !Number.isInteger(Number(event.serviceID))
  ) {
    err.push("Champ idServices est invalide ou non ajouter");
  }
  // Vérification userID
  if (event.userID != null) {
    err.push("Vous ne pouvez pas changer le idUtilisateurs");
  }

  // Verification du niveau
  if (event.level !== "1" && event.level !== "2") {
    err.push("Champ niveau est invalide doit etre 1 ou 2");
  }

  return {
    isValid: err.length === 0,
    err,
  };
};

// Verifie le header de la requette
const verifyHeader = (req, res) => {
  // Déclaration de ce que doit ressembler le header de la requette
  const header = req.headers["content-type"];

  // Verification du header, si il y a pas: erreur, si il y a mais c'est incorrect: erreur 415
  if (!header || !header.includes("application/json")) {
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
