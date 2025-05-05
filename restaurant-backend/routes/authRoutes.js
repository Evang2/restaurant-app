// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authcontroller');

// POST route for registering a user
router.post('/register', authController.register);

// POST route for logging in a user
router.post('/login', authController.login);

module.exports = router;
