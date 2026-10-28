const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/routes');
const connectDB = require('./config/db');
const morgan = require('morgan');
const logger = require('./logger');

const app = express();

connectDB();

// Middlewares
app.use(cors());
app.use(express.json()); // lee lo que envia el front

// Tokens personalizados de Morgan
morgan.token('client-ip', (req) => {
  let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  if (ip === '::1') {
      ip = '127.0.0.1';
  }
  return ip;
});

morgan.token('user-id', (req) => {
  return req.user ? (req.user.id || req.user._id || req.user.userId) : 'Anónimo';
});

const morganStream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

// Usamos el formato personalizado incluyendo IP, ID de Usuario, Método, URL, Estado y Tiempo
app.use(
  morgan(':client-ip [User: :user-id] ":method :url" :status :response-time ms', { 
    stream: morganStream 
  })
);

// Servir el frontend
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
  res.redirect('/paginas/login.html');
});

// Definir rutas principales
app.use('/api', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`>>> Servidor corriendo en el puerto ${PORT}`);
  logger.info(`Servidor iniciado y escuchando en el puerto ${PORT}`);
});