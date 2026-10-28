require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/routes');
const connectDB = require('./config/db');
const morgan = require('morgan');

const app = express();

require('dotenv').config({ path: path.join(__dirname, '../.env') });

connectDB(),
// Middlewares
app.use(cors());
app.use(express.json()); // lee lo que envia el front

morgan.token('client-ip', (req) => {
    let ip = req.headers['x-forwarded-for']?.split(',')[0].trim()
        || req.socket.remoteAddress;

    if (ip === '::1') {
        ip = '127.0.0.1';
    }

    return ip;
});

// Obtener el ID del usuario desde el JWT verificado
morgan.token('user-id', (req) => {
    return req.user?.id || req.user?._id || 'no-autenticado';
});

// Obtener el nombre desde el JWT verificado
morgan.token('user-name', (req) => {
    return req.user?.firstName || 'no-autenticado';
});

// Formato personalizado de los registros
app.use(
    morgan(':client-ip - [:date[clf]] ":method :url" :status :response-time ms | Usuario: :user-name | ID: :user-id')
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
});