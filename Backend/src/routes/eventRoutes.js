var express = require("express");
var router = express.Router();

var event_controller = require("../controllers/event_Controller");
var event_user_controller = require("../controllers/event_userController");

// EVENTS ROUTES

// get all events
router.get("/events", event_controller.event_list);
// create an event
router.post("/event", event_controller.event_create_post);

// USER EVENTS ROUTES
router.get("/events/users", event_user_controller.user_list);
