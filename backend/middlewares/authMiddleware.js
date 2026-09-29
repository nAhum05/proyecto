// Verifica que el usuario este autenticado y tenga permisos
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado, token requerido' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ message: 'Token no válido o expirado' });
    }
};

const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.rol)) {
            return res.status(403).json({ message: 'Acceso denegado: No tienes permisos' });
        }
        next();
    };
};

module.exports = {verifyToken, checkRole};