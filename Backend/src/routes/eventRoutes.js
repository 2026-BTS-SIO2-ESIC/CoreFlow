var express = require("express");
var router = express.Router();

// Declare event_controller pour accéder aux fonctions dans le controller
var event_controller = require("../controllers/event_Controller");

// EVENTS ROUTES
// Appelle la fonction event_list dans ../controllers/event_Controller quand est appelé sur localhost:3000/event/list
router.get("/list", event_controller.event_list);
// Appelle la fonction event_create dans ../controllers/event_Controller quand est appelé sur localhost:3000/event/create
router.post("/create", event_controller.event_create);
// Appelee la fonction event_update dans ../controllers/evetController quand est appelé sur localhost:3000/event/update
router.put("/update", event_controller.event_update);
// Apelle la fonction list_one dans ../controllers/event_Controller quand est appele sur localhost:3000/event/list/:id
router.get(`/list/:id`, event_controller.event_list_one);

// export pour l'utiliser dans le ../server.js
module.exports = router;
