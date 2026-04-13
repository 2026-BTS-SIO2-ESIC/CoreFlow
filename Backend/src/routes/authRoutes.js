const { pool } = require("../config/database");
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticate, authenticatePartial } = require("../middlewares/authMiddleware");

// POST /api/auth/login
router.post("/login", authController.login);

// POST /api/auth/2fa/verify
router.post("/2fa/verify", authenticatePartial, authController.verifyTwoFactor);

// POST /api/auth/2fa/setup
router.post("/2fa/setup", authenticate, authController.setupTwoFactor);

// POST /api/auth/2fa/confirm
router.post("/2fa/confirm", authenticate, authController.confirmTwoFactor);

// POST /api/auth/2fa/disable
router.post("/2fa/disable", authenticate, authController.disableTwoFactor);

// GET /api/auth/me
router.get("/me", authController.getMe);

module.exports = router;
