var express = require("express");
var router = express.Router();
const { authenticate, authorize } = require("../middlewares/authMiddleware");
// Declare event_controller pour accéder aux fonctions dans le controller
var event_controller = require("../controllers/event_Controller");

router.use(authenticate);
// EVENTS ROUTES
// Appelle la fonction event_list dans ../controllers/event_Controller quand est appelé sur localhost:3000/event/list
router.get(
  "/list/participation/:user_id/:userRole",
  event_controller.event_list,
);
// Appelle la fonction event_create dans ../controllers/event_Controller quand est appelé sur localhost:3000/event/create
router.post(
  "/create/:userRole",
  authorize("admin", "manager"),
  event_controller.event_create,
);
// Appelee la fonction event_update dans ../controllers/evetController quand est appelé sur localhost:3000/event/update
router.put(
  "/update/:user_id/:userRole",
  authorize("admin", "manager"),
  event_controller.event_update,
);

// Appelle la fonction event_delete dans ../controllers/event_Controller quand est appelé sur localhost:3000/event/delete
router.delete(
  "/delete/:user_id/:userRole",
  authorize("admin", "manager"),
  event_controller.event_delete,
);

// Afficher les événements terminés
router.get("/past/:user_id/:userRole", event_controller.past_events);

// Afficher les événements à venir
router.get("/future/:user_id/:userRole", event_controller.future_events);

// Point 1 : Réponse employé
router.post("/participation/respond/:user_id", event_controller.event_respond);

// Point 2 : Changement de statut (Manager/Admin)
router.patch("/status", authorize("admin", "manager"), (req, res) => {
  const { id, status } = req.body;
  Event.updateStatus(id, status, (err) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Statut mis à jour" });
  });
});

// Apelle la fonction list_one dans ../controllers/event_Controller quand est appele sur localhost:3000/event/list/:id
router.get(`/list/:id`, event_controller.event_list_by_id);
//Apelle la fonction user_list_by_email dans ../controllers/event_Controller quand est appeler sur localhost:3000/event/user_list_by_email
router.post("/user_list_by_email", event_controller.user_list_by_email);
// export pour l'utiliser dans le ../server.js
module.exports = router;
