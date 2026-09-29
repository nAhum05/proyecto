//Las rutas del los endpoints
const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authControllers');
const userController = require('../controllers/userControllers');
const comunidadController = require('../controllers/comunidadControllers');
const postController = require('../controllers/postControllers');
const commentController = require('../controllers/commentControllers');
const moderationController = require('../controllers/moderationControllers');

const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

// Endpoint POST en /api/auth/register
router.post('/register', register);

// Endpoint de login /api/auth/login
router.post('/login', login)

// Usuarios
router.put('/usuarios/perfil', verifyToken, userController.updateProfile);
router.delete('/usuarios/perfil', verifyToken, userController.deleteProfile);
router.get('/usuarios/:id', verifyToken, userController.getProfile);

// Comunidades
router.post('/comunidades', verifyToken, comunidadController.crearComunidad);
router.get('/comunidades', verifyToken, comunidadController.listarComunidades);
router.get('/comunidades/:id', verifyToken, comunidadController.obtenerComunidad);
router.put('/comunidades/:id/miembro', verifyToken, comunidadController.toggleMiembro);

//Publicaciones
router.post('/posts', verifyToken, postController.crearPost);
router.get('/posts/comunidad/:comunidadId', verifyToken, postController.listarPostsPorComunidad);
router.get('/posts/:id', verifyToken, postController.obtenerPost);
router.put('/posts/:id/like', verifyToken, postController.toggleLike);

//Comentarios
router.post('/posts/:postId/comentarios', verifyToken, commentController.crearComentario);
router.get('/posts/:postId/comentarios', verifyToken, commentController.listarComentarios);

//Reportes y moderacion
router.post('/reportes', verifyToken, moderationController.crearReporte);
router.get('/moderacion/reportes', verifyToken, checkRole('moderador', 'administrador'), moderationController.obtenerReportesPendientes);
router.put('/moderacion/publicacion', verifyToken, checkRole('moderador', 'administrador'), moderationController.cambiarEstadoPublicacion);

module.exports = router;