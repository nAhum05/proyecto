const moderatorMiddleware = (req, res, next) => {

    if (!req.user || req.user.role !== 'moderador') {
        return res.status(403).json({
            message: 'Acceso denegado. Se requiere rol de moderador.'
        });
    }

    next();
};

module.exports = moderatorMiddleware;