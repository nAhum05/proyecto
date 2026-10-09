const express = require('express');
const router = express.Router();
const verifyToken         = require('../middlewares/authMiddleware');
const moderatorMiddleware = require('../middlewares/moderatorMiddleware');
const adminMiddleware     = require('../middlewares/adminMiddleware');

const { register, login } = require('../controllers/authControllers');

const {
    getProfile,
    updateProfile,
    deleteProfile,
    getUsers,
    updateUserStatus
} = require('../controllers/userControllers');

const { createPost, getPosts } = require('../controllers/postControllers');

const {
    updateUserRole,
    banOrSuspendUser,
    deleteAnyPost,
    deleteUser,
    getStats
} = require('../controllers/adminControllers');

router.post('/register', register);
router.post('/login', login);

// Perfil propio (específicas PRIMERO para evitar colisión con /:id)
router.put('/user/profile', verifyToken, updateProfile);
router.delete('/user/profile', verifyToken, deleteProfile);
router.get('/user/:id', verifyToken, getProfile);

// Publicaciones
router.post('/posts', verifyToken, createPost);
router.get('/posts', verifyToken, getPosts);

// Moderador
router.get('/moderator/users', verifyToken, moderatorMiddleware, getUsers);
router.put('/moderator/users/:id/status', verifyToken, moderatorMiddleware, updateUserStatus);

// Admin — estadísticas
router.get('/admin/stats', verifyToken, adminMiddleware, getStats);

// Admin — usuarios
router.get('/admin/users', verifyToken, adminMiddleware, getUsers);
router.put('/admin/users/:id/role', verifyToken, adminMiddleware, updateUserRole);
router.put('/admin/users/:id/status', verifyToken, adminMiddleware, banOrSuspendUser);
router.delete('/admin/users/:id', verifyToken, adminMiddleware, deleteUser);

// Admin — publicaciones
router.delete('/admin/posts/:id', verifyToken, adminMiddleware, deleteAnyPost);

module.exports = router;
