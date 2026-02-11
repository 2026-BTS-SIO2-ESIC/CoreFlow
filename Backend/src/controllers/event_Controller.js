// Declare le model event pour
var Event = require("../models/event");

// declare et export event_list pour etre utiliser dans ../routes/eventRoutes.js
exports.event_list = function (req, res) {
  // utilise le model listAll dans ../models/event pour afficher tout les evenements dans la variable results
  Event.listAll((err, results) => {
    // TODO : quand il y aura des filtre a gerer faudra implementer le mapping des champs afin d'avoir un code plus extensible

    // déclaration de a quoi doit ressembler le header
    const header = req.headers["content-type"];

    // verification du header, si il y a pas: erreur, si il y a mais c'est incorrect: erreur
    if (!header || !header.includes("application/json")) {
      return res.status(415).json({
        error: {
          code: "INVALID_CONTENT_TYPE",
          message: "Le header doit être Content-Type: application/json",
        },
      });
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
  // Mapping de la requête afin d'avoir des champs corrects, transforme le raw json dans les champs structurés pour le code
  // Exemple au lieu de nom_createur => userName
  const event = {
    eventID: req.body.idEvenements,
    serviceID: req.body.idServices,
    userID: req.body.idUtilisateurs,
    createdAt: req.body.date_creation,
    startDate: req.body.date_debut,
    endDate: req.body.date_fin,
    description: req.body.description,
    userName: req.body.nom_createur,
    title: req.body.titre,
    type: req.body.type,
  };

  // Declaraison de isValid bool avec une fonction validateEvent qui prend la requette comme variable
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
  //
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
  if (!event.createdAt || isNaN(Date.parse(event.createdAt))) {
    err.push("Champ date_creation est invalide, doit être YYYY-MM-DD");
  }

  // Vérification startDate (doit être une date valide)
  if (!event.startDate || isNaN(Date.parse(event.startDate))) {
    err.push("Champ date_debut est invalide, doit être YYYY-MM-DD");
  }

  // Vérification endDate (doit être une date valide)
  if (!event.endDate || isNaN(Date.parse(event.endDate))) {
    err.push("Champ date_fin est invalide, doit être YYYY-MM-DD");
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

  return {
    isValid: err.length === 0,
    err,
  };
};
