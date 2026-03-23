const repo = require("../repositories/congeRepository");

exports.getPending = () => repo.findPending();

exports.valider = (id) => repo.updateStatut(id, "validé");

exports.refuser = (id) => repo.updateStatut(id, "refusé");

exports.getCountPending = () => repo.countPending();