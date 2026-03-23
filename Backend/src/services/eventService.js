const EventRepository = require("../repository/eventRepository");

// Validation des champs (create)
const validateEvent = async (event) => {
  const err = [];

  // 1. Vérification organisateur_id
  if (event.organizerId === undefined || !Number.isInteger(Number(event.organizerId))) {
    err.push("Champ organisateur_id est invalide ou requis");
  }

  // 2. Vérification inviter (niveau 2)
  if (event.invited !== undefined && event.invited !== null && event.invited !== "") {
    const { userExist, mail } = await EventRepository.checkIfUserExist(event.invited);
    if (!userExist) {
      err.push("L'utilisateur " + mail + " n'existe pas");
    }
  }

  // 3. Vérification des dates de debut
  if (!event.startDate || isNaN(Date.parse(event.startDate))) {
    err.push("Champ date_debut est invalide (YYYY-MM-DD)");
  } else if (!timeVerify(Date.parse(event.startDate))) {
    err.push("La date de début ne peut pas être avant aujourd'hui");
  }
  // Vérification des dates de fin
  if (!event.endDate || isNaN(Date.parse(event.endDate))) {
    err.push("Champ date_fin est invalide (YYYY-MM-DD)");
  } else if (event.startDate && event.endDate < event.startDate) {
    err.push("La date de fin ne peut pas être avant la date de début");
  }

  // 4. Vérification Titre et Type
  if (!event.title || typeof event.title !== "string") {
    err.push("Champ titre est invalide ou requis");
  }
  // Vérification type_evenement (obligatoire) - valeurs DB: 'reunion', 'formation', 'afterwork', 'seminaire', 'autre'
  const allowedTypes = ["reunion", "formation", "afterwork", "seminaire", "autre"];
  if (!event.eventType || typeof event.eventType !== "string") {
    err.push("Champ type_evenement est invalide ou requis");
  } else if (!allowedTypes.includes(event.eventType)) {
    err.push(
      "Champ type_evenement invalide, doit être: reunion, formation, afterwork, seminaire ou autre",
    );
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

  // available status 'planifie','en_cours','termine','annule'
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
  // ==========================================================

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
    err.push("Champ organisateur_id est invalide ou requis pour la mise à jour");
  }

  // Vérification inviter si fourni
  if (
    event.invited !== undefined &&
    event.invited !== null &&
    event.invited !== ""
  ) {
    const { userExist, mail } = await EventRepository.checkIfUserExist(
      event.invited,
    );
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


// valide les champs necessaires pour supprimer un evenement
const validateDeleteEvent = (id) => {
  const errors = [];
  if (!id || isNaN(id)) {
    errors.push("ID d'événement invalide ou manquant.");
  }
  // On a retiré le bloc "if (event.location)..." d'ici car il n'a pas sa place dans une suppression
  return { isValid: errors.length === 0, errors };
};


//verification des evenements passés et a venir
const validateEventList = async (userId) => {
  const err = [];
  if (!userId || isNaN(userId)) {
    err.push("ID utilisateur manquant ou invalide");
  }
  return {
    isValid: err.length === 0,
    err,
  };
}; 



const timeVerify = (time) => {
  const today = Date.now();
  return time >= today;
};

module.exports = {
  validateEvent,
  validateUpdateEvent,
  validateDeleteEvent,
  validateEventList,
};

