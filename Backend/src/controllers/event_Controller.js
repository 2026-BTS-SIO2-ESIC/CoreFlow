// Declare le model event pour accéder aux fonctions dans le model
var Event = require("../models/event");

// declare et export event_list pour etre appeler dans ../routes/eventRoutes.js
exports.event_list = function (req, res) {
  // utilise le model listAll qui vien de ../models/event.js pour afficher tout les evenements dans la variable results
  //Ainsi declare err pour aficher les erreur rencontrer dans la DB
  Event.listAll((err, results) => {
    // TODO : quand il y aura des filtre a gerer faudra implementer le mapping des champs afin d'avoir un code plus extensible

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

    if (!results || results.length === 0) {
      return res.status(404).json({
        message: "Aucun evenement trouvé",
      });
    }

     const now = new Date();

    const eventsWithStatus = results.map((event) => {
      const dateFin = event.date_fin
        ? new Date(event.date_fin)
        : null;

      return {
        ...event,
        periode_evenement:
          dateFin && dateFin < now ? "passee" : "a venir",
      };
    });

    // Renvoie les événements en cas de succès
    res.status(200).json({
      message: eventsWithStatus.length,
      event: eventsWithStatus,
    });
  });
};

exports.event_create = (req, res) => {
  if (!verifyHeader(req, res)) {
    return;
  }
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

  // Declaraison de isValid bool et err, avec une fonction validateEvent qui prend la requette nommé event, comme variable
  const { isValid, err } = validateEvent(event);
  // Si false jette une erreur 400 mauvaise champs
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

// Validation des champs
const validateEvent = (event) => {
  const err = [];

  if (event.createdAt && event.createdAt.trim() !== "") {
  if (isNaN(Date.parse(event.createdAt))) {
    err.push("Champ date_creation est invalide, doit être YYYY-MM-DD");
  }
}


  if (
  event.startDate &&
  event.endDate &&
  !isNaN(Date.parse(event.startDate)) &&
  !isNaN(Date.parse(event.endDate))
) {
  if (new Date(event.startDate) > new Date(event.endDate)) {
    err.push("La date_debut ne peut pas être après date_fin");
  }
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
  if (event.createdAt && event.createdAt.trim() !== "") {
    if (isNaN(Date.parse(event.createdAt))) {
      err.push("Champ date_creation est invalide, doit être YYYY-MM-DD");
    }
  }

  // Vérification startDate (doit être une date valide)
  if (event.startDate && event.startDate.trim() !== "") {
    if (isNaN(Date.parse(event.startDate))) {
      err.push("Champ date_debut est invalide, doit être YYYY-MM-DD");
    }
  }

  // Vérification endDate (optionnel mais doit être valide si présent)
  if (event.endDate && event.endDate.trim() !== "") {
    if (isNaN(Date.parse(event.endDate))) {
      err.push("Champ date_fin doit être au format YYYY-MM-DD");
    }
  }

  // Vérification description (optionnel, mais si présent doit être une string)
  if (
    event.description !== undefined &&
    typeof event.description !== "string"
  ) {
    err.push("Champ description doit être une chaîne de caractères");
  }

  // Vérification userName (optionel)
  if (
    event.userName !== undefined &&
    event.userName !== null &&
    typeof event.userName !== "string"
  ) {
    err.push("Champ nom_createur  doit etre une chaine ou null");
  }

  // Vérification title (optionel)
  if (
    event.title !== undefined &&
    event.title !== null &&
    typeof event.title !== "string"
  ) {
    err.push("Champ titre doit etre une chaine ou null");
  }

  // Vérification type (optionel)
  if (
    event.type !== undefined &&
    event.type !== null &&
    typeof event.type !== "string"
  ) {
    err.push("Champ type doit etre une chaine ou null");
  }

  return {
    isValid: err.length === 0,
    err,
  };
};

const verifyHeader = (req, res) => {
  // déclaration de ce que doit ressembler le header de la requette
  const header = req.headers["content-type"];

  // verification du header, si il y a pas: erreur, si il y a mais c'est incorrect: erreur 415
  if (!header || !header.includes("application/json")) {
    res.status(415).json({
      error: {
        code: "INVALID_CONTENT_TYPE",
        message: "Le header doit être Content-Type: application/json",
      },
    });
    return false; // IMPORTANT
  }
  return true;
};
