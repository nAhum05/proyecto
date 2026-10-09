// middlewares/adminMiddleware.js
const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== 'administrador') {
        return res.status(403).json({
            message: 'Acceso denegado. Se requiere rol de administrador.'
        });
    }
    next();
};

module.exports = adminMiddleware;