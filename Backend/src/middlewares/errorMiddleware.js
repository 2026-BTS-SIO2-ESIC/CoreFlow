// Middleware pour gérer les erreurs 404 (route non trouvée)
exports.notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} non trouvée`
  });
};

// Middleware pour gérer toutes les erreurs
exports.errorHandler = (err, req, res, next) => {
  // Erreur de parsing JSON (body invalide : ex. headers envoyés comme body)
  if (err.type === 'entity.parse.failed') {
    console.warn(
      `[Body parse] Requête invalide sur ${req.method} ${req.originalUrl} - ` +
        `Le corps de la requête n'est pas du JSON valide (body reçu: "${String(err.body || '').slice(0, 80)}...")`
    );
    return res.status(400).json({
      success: false,
      message:
        "Corps de requête JSON invalide. Vérifiez que vous envoyez un body JSON valide et non les headers.",
    });
  }

  console.error('Erreur:', err);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Erreur serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};