const authService = require("../services/authService");

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await authService.login(email, password);

    res.json({
      success: true,
      message: "Connexion réussie",
      data: {
        user: result.user,
        token: result.token,
      },
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Erreur login:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la connexion",
    });
  }
};

// Récupérer l'utilisateur connecté (à partir du token)
exports.getMe = async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  try {
    const userWithoutPassword = await authService.getMeFromToken(token);

    res.json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Erreur getMe:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération de l'utilisateur",
    });
  }
};

// Déconnexion
exports.logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Déconnexion réussie",
  });
};
