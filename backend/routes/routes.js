//Las rutas del los endpoints
const express = require('express');
const router = express.Router();

const { register, login } = require('../controllers/authControllers');
const { getProfile, updateProfile, deleteProfile} = require('../controllers/userControllers');
const { createPost, getPosts } = require('../controllers/postControllers');

const verifyToken = require('../middlewares/authMiddleware');

// Endpoint POST en /api/auth/register
router.post('/register', register);

// Endpoint de login /api/auth/login
router.post('/login', login)

//Obtener perfil de un usuario por su ID
router.get('/user/:id', verifyToken, getProfile);

//Editar perfil propio
router.put('/user/profile', verifyToken, updateProfile);

//Eliminar la cuenta propia
router.delete('/user/profile', verifyToken, deleteProfile)

//Crear una nueva publicacion
router.post('/posts', verifyToken, createPost);

//Consultar todas las publicaciones
router.get('/posts', verifyToken, getPosts);

module.exports = router;