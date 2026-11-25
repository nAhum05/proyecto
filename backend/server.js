const path = require('path');
require('dotenv').config();
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/routes');
const connectDB = require('./config/db');
const morgan = require('morgan');
const logger = require('./logger');
const AuditLog = require('./models/AuditLog'); 

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

// Limpieza de IP
morgan.token('client-ip', (req) => {
    let ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;
    return ip === '::1' ? '127.0.0.1' : ip;
});

morgan.token('user-id', (req) => {
  return req.user ? (req.user.id || req.user._id || req.user.userId) : 'Anónimo';
});

morgan.token('device-uuid', (req) => {
  return req.headers['x-device-id'] || 'sin-device-uuid';
});

const morganStream = {
  write: async (message) => {
    logger.info(message.trim()); 

    try {
     
      const parts = message.trim().split(' ');
      const ip = parts[0];
      const userId = message.includes('[User:') ? message.split('[User: ')[1].split(']')[0] : 'Anónimo';
      const method = message.includes('"') ? message.split('"')[1].split(' ')[0] : 'GET';
      const url = message.includes('"') ? message.split('"')[1].split(' ')[1] : '/';
      
      await AuditLog.create({
        ip,
        userId,
        method,
        url,
        level: 'info',
        message: message.trim()
      });
    } catch (err) {
      console.error('Error al guardar log en MongoDB:', err.message);
    }
  }
};

app.use(
  morgan(':client-ip [User: :user-id] [Device: :device-uuid] ":method :url" :status :response-time ms', { 
    stream: morganStream 
  })
);

app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
  res.redirect('/paginas/login.html');
});

app.use('/api', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`>>> Servidor corriendo en el puerto ${PORT}`);
  logger.info(`Servidor iniciado y escuchando en el puerto ${PORT}`);
});