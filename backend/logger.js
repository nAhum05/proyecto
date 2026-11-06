const winston = require('winston');
const LokiTransport = require('winston-loki');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // 1. Consola (para ver colores en tu terminal)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    
    new LokiTransport({
      host: 'http://localhost:3100',
      labels: { app: 'mi-proyecto-backend' }, 
      json: true,
      replaceTimestamp: true,
    })
  ]
});

module.exports = logger;