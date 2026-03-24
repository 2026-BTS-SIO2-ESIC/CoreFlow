exports.checkRH = (req, res, next) => {
  const role = req.headers["role"];

  if (role !== "RH") {
    return res.status(403).json({ message: "Accès refusé" });
  }

  next();
};