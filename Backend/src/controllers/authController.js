// Création d'utilisateurs de test (en dur pour le développement)
const User_test = [
  {
    id: 1,
    email: "admin@coreflow.fr",
    password: "@dmiN1234",
    role: "admin",
    nom: "Admin",
    prenom: "CoreFlow",
    Departement: "Informatique",
  },
  {
    id: 2,
    email: "rh@coreflow.fr",
    password: "Rh_1234",
    role: "rh",
    nom: "RH",
    prenom: "CoreFlow",
    Departement: "Ressources Humaines",
  },
  {
    id: 3,
    email: "manager@coreflow.fr",
    password: "Manager_1234",
    role: "manager",
    nom: "Manager",
    prenom: "CoreFlow",
    Departement: "Direction",
  },
  {
    id: 4,
    email: "employe@coreflow.fr",
    password: "Employe_1234",
    role: "employe",
    nom: "Employé",
    prenom: "CoreFlow",
    Departement: "Employés",
  },
];

// Fonction pour générer un token factice
const generateToken = (userId) => {
  const tokenData = { userId, timestamp: Date.now() };
  return Buffer.from(JSON.stringify(tokenData)).toString("base64");
};

// Connexion d'un utilisateur
exports.login = (req, res) => {
  const { email, password } = req.body;

  // Validation des champs
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email et mot de passe requis",
    });
  }

  // Recherche de l'utilisateur
  const user = User_test.find(
    (u) => u.email === email && u.password === password,
  );

  if (user) {
    // Générer un token pour cet utilisateur
    const token = generateToken(user.id);

    // Retourner les infos sans le mot de passe
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: "Connexion réussie",
      data: {
        user: userWithoutPassword,
        token: token,
      },
    });
  } else {
    res.status(401).json({
      success: false,
      message: "Email ou mot de passe incorrect",
    });
  }
};

// Récupérer l'utilisateur connecté (via le token)
exports.getMe = (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Token manquant",
    });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    // Décoder le token
    const decoded = JSON.parse(Buffer.from(token, "base64").toString());

    // Trouver l'utilisateur
    const user = User_test.find((u) => u.id === decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    // Retourner l'utilisateur sans le mot de passe
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Token invalide",
    });
  }
};

// Déconnexion (côté serveur, pas vraiment nécessaire avec JWT factice)
exports.logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Déconnexion réussie",
  });
};
