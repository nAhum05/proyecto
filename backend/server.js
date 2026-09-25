require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/routes');

const app = express();

require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Conectar a la base de datos
connectDB();

// Middlewares
app.use(cors());
app.use(express.json()); // lee lo que envia el front

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