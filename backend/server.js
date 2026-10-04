require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/routes');
const connectDB = require('./config/db');

const app = express();

require('dotenv').config({ path: path.join(__dirname, '../.env') });

connectDB(),
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