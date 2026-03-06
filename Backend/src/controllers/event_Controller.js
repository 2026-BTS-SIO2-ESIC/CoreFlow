// Declare le model event pour accéder aux fonctions dans le model
const Event = require("../models/event");

// declare et export event_list pour etre appeler dans ../routes/eventRoutes.js
exports.event_list = async (req, res) => {
  try {
    // utilise le model listAll qui vient de ../models/event.js pour récupérer tous les événements
    // On utilise "await" car listAll est maintenant une fonction asynchrone (Promise)
    const results = await Event.listAll();

    // TODO : quand il y aura des filtre a gerer faudra implementer le mapping des champs afin d'avoir un code plus extensible

    // Vérifie si des résultats existent
    if (!results || results.length === 0) {
      return res.status(200).json({
        message: "Aucun evenement trouvé",
        event: [] // On renvoie un tableau vide pour ne pas faire planter le front-end
      });
    }

    const now = new Date();

    // Ajout du statut (passé ou à venir) dynamiquement
    const eventsWithStatus = results.map((event) => {
      const dateFin = event.date_fin ? new Date(event.date_fin) : null;

      return {
        ...event,
        periode_evenement: dateFin && dateFin < now ? "passee" : "a venir",
      };
    });

    // Renvoie les événements en cas de succès
    res.status(200).json({
      message: eventsWithStatus.length,
      event: eventsWithStatus,
    });

  } catch (err) {
    // Renvoie une erreur en cas de mauvaise requête vers la DB ou de plantage serveur
    res.status(500).json({
      error: {
        error: "FETCH_FAILURE",
        message: "Erreur lors de la récupération de la liste des événements, vérifier le modèle sql",
        details: err.message,
      },
    });
  }
};

exports.event_create = async (req, res) => {
  // Vérifie si le header est bien Content-Type: application/json
  if (!verifyHeader(req, res)) {
    return;
  }

  // Mapping de la requête pour correspondre aux noms de variables utilisés dans le code
  const event = {
    serviceID: req.body.idServices,
    userID: req.body.idUtilisateurs,
    startDate: req.body.date_debut,
    endDate: req.body.date_fin,
    description: req.body.description,
    userName: req.body.nom_createur,
    title: req.body.titre,
    type: req.body.type,
  };

  // Validation des champs via la fonction helper
  const { isValid, err } = validateEvent(event);
  
  if (!isValid) {
    return res.status(400).json({
      error: {
        error: "INVALID_FIELDS",
        message: "Erreur lors de la validation des champs, vérifiez les données envoyées",
        details: err,
      },
    });
  }

  try {
    // Appel du modèle pour l'insertion en base de données
    // L'ID est généré automatiquement par MySQL (AUTO_INCREMENT)
    const newEventId = await Event.create(event);

    res.status(201).json({
      message: "L'événement a été créé avec succès",
      id: newEventId,
    });

  } catch (err) {
    // Gestion des erreurs d'insertion (ex: violation de contrainte)
    res.status(500).json({
      error: {
        error: "CREATION_FAILURE",
        message: "Une erreur est survenue lors de la création en base de données",
        detail: err.message,
      },
    });
  }
};

  /**
 * Modifie un événement
 */
exports.event_update = async (req, res) => {
  if (!verifyHeader(req, res)) return;

  const id = req.params.id;
  const eventData = {
    startDate: req.body.date_debut,
    endDate: req.body.date_fin,
    description: req.body.description,
    userName: req.body.nom_createur,
    title: req.body.titre,
    type: req.body.type,
  };

  try {
    const affectedRows = await Event.update(id, eventData);

    if (affectedRows === 0) {
      return res.status(404).json({ message: "Événement non trouvé" });
    }

    res.status(200).json({ message: "L'événement a été mis à jour avec succès" });
  } catch (err) {
    res.status(500).json({
      error: { message: "Erreur lors de la mise à jour", details: err.message }
    });
  }
};

/**
 * Supprime un événement
 * Endpoint : DELETE /api/events/delete/:id
 */
exports.event_delete = async (req, res) => {
  const id = req.params.id;

  try {
    const affectedRows = await Event.delete(id);

    if (affectedRows === 0) {
      return res.status(404).json({
        message: "Événement non trouvé, suppression impossible"
      });
    }

    res.status(200).json({
      message: `L'événement n°${id} a été supprimé avec succès`
    });

  } catch (err) {
    res.status(500).json({
      error: {
        message: "Erreur lors de la suppression",
        details: err.message
      }
    });
  }
};

// Validation des champs
const validateEvent = (event) => {
  const err = [];


  // --- 1. LOGIQUE DES DATES ---
  // Vérification de la cohérence : début avant fin
  if (event.startDate && event.endDate && 
      !isNaN(Date.parse(event.startDate)) && !isNaN(Date.parse(event.endDate))) {
    if (new Date(event.startDate) > new Date(event.endDate)) {
      err.push("La date_debut ne peut pas être après date_fin");
    }
  }

  // --- 2. IDENTIFIANTS (Clés étrangères) ---
  // On ne vérifie PLUS eventID ici car il est auto-incrémenté en BDD

  if (event.serviceID === undefined || !Number.isInteger(Number(event.serviceID))) {
    err.push("Champ idServices est invalide");
  }

  if (event.userID === undefined || !Number.isInteger(Number(event.userID))) {
    err.push("Champ idUtilisateurs est invalide");
  }

  // --- 3. VALIDATION DES FORMATS DE DATE ---
  if (event.createdAt && isNaN(Date.parse(event.createdAt))) {
    err.push("Champ date_creation est invalide");
  }

  if (event.startDate && isNaN(Date.parse(event.startDate))) {
    err.push("Champ date_debut est invalide (Format attendu: YYYY-MM-DD)");
  }

  if (event.endDate && isNaN(Date.parse(event.endDate))) {
    err.push("Champ date_fin est invalide (Format attendu: YYYY-MM-DD)");
  }

  // --- 4. TEXTES ET STRINGS ---
  if (event.description !== undefined && typeof event.description !== "string") {
    err.push("Champ description doit être une chaîne de caractères");
  }

  if (event.userName !== undefined && event.userName !== null && typeof event.userName !== "string") {
    err.push("Champ nom_createur doit être une chaîne ou null");
  }

  // Le titre est souvent obligatoire pour un calendrier
  if (!event.title || typeof event.title !== "string") {
    err.push("Le champ titre est obligatoire et doit être une chaîne de caractères");
  }

  if (event.type !== undefined && event.type !== null && typeof event.type !== "string") {
    err.push("Champ type doit être une chaîne ou null");
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
