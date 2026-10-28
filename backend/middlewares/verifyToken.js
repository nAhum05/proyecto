const jwt = require('jsonwebtoken');
const logger = require('./logger.js');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        logger.warn('Acceso rechazado: Token no proporcionado', {
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            url: req.originalUrl,
            metodo: req.method
        });
        return res.status(401).json({ message: 'Acceso denegado, token requerido' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto');
        
        // Inyectamos los datos del usuario decodificados en la petición
        req.user = decoded; 
        next();
    } catch (error) {
        logger.warn('Acceso rechazado: Token no válido o expirado', {
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            url: req.originalUrl,
            metodo: req.method,
            error: error.message
        });
        return res.status(403).json({ message: 'Token no válido o expirado' });
    }
};

module.exports = verifyToken;