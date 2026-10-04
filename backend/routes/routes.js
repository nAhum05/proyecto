// routes.js — Rutas de la API
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

const {
    createPost,
    getPosts
} = require('../controllers/postControllers');

const {
    updateUserRole,
    banOrSuspendUser,
    deleteAnyPost,
    deleteUser,
    getStats
} = require('../controllers/adminControllers');


router.post('/register', register);
router.post('/login', login);



// Perfil propio (específicas PRIMERO)
router.put('/user/profile', verifyToken, updateProfile);
router.delete('/user/profile', verifyToken, deleteProfile);

// Perfil por ID (parametrizada DESPUÉS)
router.get('/user/:id', verifyToken, getProfile);

// Publicaciones
router.post('/posts', verifyToken, createPost);
router.get('/posts', verifyToken, getPosts);


router.get(
    '/moderator/users',
    verifyToken,
    moderatorMiddleware,
    getUsers
);

router.put(
    '/moderator/users/:id/status',
    verifyToken,
    moderatorMiddleware,
    updateUserStatus   // solo activo/suspendido
);


// Dashboard
router.get('/admin/stats', verifyToken, adminMiddleware, getStats);

// Usuarios
router.get('/admin/users', verifyToken, adminMiddleware, getUsers);

router.put(
    '/admin/users/:id/role',
    verifyToken,
    adminMiddleware,
    updateUserRole
);

router.put(
    '/admin/users/:id/status',
    verifyToken,
    adminMiddleware,
    banOrSuspendUser   // activo/suspendido/baneado
);

router.delete(
    '/admin/users/:id',
    verifyToken,
    adminMiddleware,
    deleteUser
);

// Publicaciones
router.delete(
    '/admin/posts/:id',
    verifyToken,
    adminMiddleware,
    deleteAnyPost
);

module.exports = router;