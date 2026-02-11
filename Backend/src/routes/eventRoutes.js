var express = require("express");
var router = express.Router();

var event_controller = require("../controllers/event_Controller");

// EVENTS ROUTES
// Appelle la fonction event_list dans ../controllers/event_Controller quand est appelé sur localhost:3000/event/list
router.get("/list", event_controller.event_list);
// Appelle la fonction event_create dans ../controllers/event_Controller quand est appelé sur localhost:3000/event/create
router.post("/create", event_controller.event_create);

// export pour l'utiliser dans le ../server.js
module.exports = router;
