const db = require("../config/db");

exports.findPending = async () => {
  const [rows] = await db.query(
    "SELECT * FROM congés WHERE statut = 'en_attente'"
  );
  return rows;
};

exports.updateStatut = async (id, statut) => {
  const [result] = await db.query(
    "UPDATE congés SET statut = ? WHERE id = ?",
    [statut, idCongés]
  );
  return result;
};

exports.countPending = async () => {
  const [rows] = await db.query(
    "SELECT COUNT(*) as total FROM congés WHERE statut = 'en_attente'"
  );
  return rows[0].total;
};