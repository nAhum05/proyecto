const winston = require('winston');

const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  })
];

// Si LOKI_HOST está configurado (por ejemplo en local con docker-compose: http://localhost:3100)
if (process.env.LOKI_HOST) {
  try {
    const LokiTransport = require('winston-loki');
    transports.push(
      new LokiTransport({
        host: process.env.LOKI_HOST,
        labels: { app: 'mi-proyecto-backend' },
        json: true,
        replaceTimestamp: true,
      })
    );
  } catch (err) {
    console.warn('Loki transport no disponible:', err.message);
  }
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports
});

module.exports = logger;
