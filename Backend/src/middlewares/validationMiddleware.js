// Valider la création d'un utilisateur
exports.validateUserCreation = (req, res, next) => {
  const { email, password, nom, prenom, role } = req.body;
  const errors = [];

  // Vérifier les champs requis
  if (!email) errors.push('Email requis');
  if (!password) errors.push('Mot de passe requis');
  if (!nom) errors.push('Nom requis');
  if (!prenom) errors.push('Prénom requis');
  if (!role) errors.push('Rôle requis');

  // Validationdu format email
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Format d\'email invalide');
  }

  // Valider la longueur du mot de passe
  if (password && password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }

  // Valider le rôle
  const rolesValides = ['admin', 'rh', 'manager', 'employe'];
  if (role && !rolesValides.includes(role)) {
    errors.push('Rôle invalide');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Données invalides',
      errors: errors
    });
  }

  next();
};

// Valider la mise à jour d'un utilisateur
exports.validateUserUpdate = (req, res, next) => {
  const { email, role } = req.body;
  const errors = [];

  // Valider le format email si fourni
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Format d\'email invalide');
  }

  // Valider le rôle si fourni
  const rolesValides = ['admin', 'rh', 'manager', 'employe'];
  if (role && !rolesValides.includes(role)) {
    errors.push('Rôle invalide');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Données invalides',
      errors: errors
    });
  }

  next();
};

// Valider la création d'un congé
exports.validateCongeCreation = (req, res, next) => {
  const { date_debut, date_fin, type_conge } = req.body;
  const errors = [];

  if (!date_debut) errors.push('Date de début requise');
  if (!date_fin) errors.push('Date de fin requise');
  if (!type_conge) errors.push('Type de congé requis');

  // Vérifier que date_fin >= date_debut
  if (date_debut && date_fin) {
    const debut = new Date(date_debut);
    const fin = new Date(date_fin);
    
    if (fin < debut) {
      errors.push('La date de fin doit être après la date de début');
    }
  }

  // Valider le type de congé
  const typesValides = ['conge_paye', 'rtt', 'maladie', 'sans_solde'];
  if (type_conge && !typesValides.includes(type_conge)) {
    errors.push('Type de congé invalide');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Données invalides',
      errors: errors
    });
  }

  next();
};