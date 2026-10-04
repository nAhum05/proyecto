// middlewares/moderatorMiddleware.js
const moderatorMiddleware = (req, res, next) => {
    if (!req.user || !['moderador', 'administrador'].includes(req.user.role)) {
        return res.status(403).json({
            message: 'Acceso denegado. Se requiere rol de moderador o administrador.'
        });
    }

    next();
};

module.exports = moderatorMiddleware;