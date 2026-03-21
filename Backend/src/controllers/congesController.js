const congesService = require('../services/congesService');

// GET /api/conges
exports.getMyConges = async (req, res) => {
  try {
    const userId = req.user.id;

    const conges = await congesService.getMyConges(userId);

    return res.status(200).json({
      success: true,
      data: conges
    });
  } catch (error) {
    console.error('Erreur getMyConges :', error.message);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des congés"
    });
  }
};

// POST /api/conges
exports.createConge = async (req, res) => {
  try {

    const userId = req.user.id;

    const conge = await congesService.createConge(userId, req.body);

    return res.status(201).json({
      success: true,
      message: "Demande créée",
      data: conge
    });
  } catch (error) {
    console.error('Erreur createConge :', error.message);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Erreur serveur lors de la création du congé"
    });
  }
};

// PUT /api/conges/:id/annuler
exports.annulerConge = async (req, res) => {
  try {

    const userId = req.user.id;
    const congeId = Number(req.params.id);

    const conge = await congesService.annulerConge(userId, congeId);

    return res.status(200).json({
      success: true,
      message: "Demande annulée avec succès",
      data: conge
    });
  } catch (error) {
    console.error('Erreur annulerConge :', error.message);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Erreur serveur lors de l’annulation du congé"
    });
  }
};


// GET /api/conges/solde
exports.getSoldeConges = async (req, res) => {
  try {
    const userId = req.user.id;

    const solde = await congesService.getSoldeConges(userId);

    return res.status(200).json({
      success: true,
      data: solde
    });

  } catch (error) {
    console.error('Erreur getSoldeConges :', error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Erreur serveur lors de la récupération du solde"
    });
  }
};