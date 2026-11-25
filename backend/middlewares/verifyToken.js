const jwt = require('jsonwebtoken');
const logger = require('../logger.js');
const AuditLog = require('../models/AuditLog'); 

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    let ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;
    if (ip === '::1') ip = '127.0.0.1';

    if (!token) {
        logger.warn('Acceso rechazado: Token no proporcionado');
        
        await AuditLog.create({
            ip,
            method: req.method,
            url: req.originalUrl,
            level: 'warn',
            message: 'Acceso rechazado: Token no proporcionado'
        }).catch(err => console.error(err));

        return res.status(401).json({ message: 'Acceso denegado, token requerido' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto');
        req.user = decoded; 
        next();
    } catch (error) {
        logger.warn('Acceso rechazado: Token no válido o expirado');

        await AuditLog.create({
            ip,
            method: req.method,
            url: req.originalUrl,
            level: 'warn',
            message: `Acceso rechazado: Token no válido o expirado - ${error.message}`
        }).catch(err => console.error(err));

        return res.status(403).json({ message: 'Token no válido o expirado' });
    }
};

module.exports = verifyToken;