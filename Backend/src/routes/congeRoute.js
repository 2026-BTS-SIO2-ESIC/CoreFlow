const express = require("express");
const router = express.Router();
const controller = require("../controllers/congeController");
const { checkRH } = require("../middlewares/congeMiddleware");

router.get("/pending", checkRH, controller.getPending);
router.get("/count", checkRH, controller.countPending);
router.put("/valider/:id", checkRH, controller.valider);
router.put("/refuser/:id", checkRH, controller.refuser);

module.exports = router;