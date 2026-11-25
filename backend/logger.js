const winston = require('winston');
require('winston-mongodb');
require('dotenv').config();

const RETENTION_DAYS = 7;
const SECONDS_PER_DAY = 24 * 60 * 60;

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.MongoDB({
      db: process.env.MONGO_URI_LOGS,
      collection: 'security_logs',
      level: 'info', 
      expireAfterSeconds: RETENTION_DAYS * SECONDS_PER_DAY, // 7 días exactos
      storeHost: false,
      metaKey: 'meta'
    }),
    
    // Consola local para desarrollo
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

module.exports = logger;