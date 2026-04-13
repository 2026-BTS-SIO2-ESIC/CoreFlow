const authService = require("../services/authService");

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await authService.login(email, password);

    res.json({
      success: true,
      message: result.requiresTwofa ? "Code TOTP requis" : "Connexion réussie",
      data: {
        user: result.user,
        token: result.token,
        requiresTwofa: result.requiresTwofa,
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

exports.verifyTwoFactor = async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const { code } = req.body;

  try {
    const result = await authService.verifyTwoFactorLogin(token, code);

    res.json({
      success: true,
      message: "2FA validée",
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

    console.error("Erreur verifyTwoFactor:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la validation 2FA",
    });
  }
};

exports.setupTwoFactor = async (req, res) => {
  try {
    const result = await authService.initializeTwoFactor(req.user.id);

    res.json({
      success: true,
      message: "A2F préparée",
      data: result,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Erreur setupTwoFactor:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la configuration 2FA",
    });
  }
};

exports.confirmTwoFactor = async (req, res) => {
  const { code } = req.body;

  try {
    const result = await authService.confirmTwoFactorSetup(req.user.id, code);

    res.json({
      success: true,
      message: "A2F activée",
      data: result,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Erreur confirmTwoFactor:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la confirmation 2FA",
    });
  }
};

exports.disableTwoFactor = async (req, res) => {
  try {
    const result = await authService.disableTwoFactor(req.user.id);

    res.json({
      success: true,
      message: "A2F désactivée",
      data: result,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Erreur disableTwoFactor:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la désactivation 2FA",
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
