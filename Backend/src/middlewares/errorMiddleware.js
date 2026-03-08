// Middleware pour gérer les erreurs 404 (route non trouvée)
exports.notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} non trouvée`
  });
};

// Middleware pour gérer toutes les erreurs
exports.errorHandler = (err, req, res, next) => {
  console.error('Erreur:', err);

  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Erreur serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};