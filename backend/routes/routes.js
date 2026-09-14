//Las rutas del los endpoints
const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authControllers');

// Endpoint POST en /api/auth/register
router.post('/register', register);

// Endpoint de login /api/auth/login
router.post('/login', login)
module.exports = router;