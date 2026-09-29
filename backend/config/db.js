// se encarga de establecer la conexion entre Express y la bd usando mongoose
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('>>> Base de datos MongoDB conectada exitosamente');
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error);
    process.exit(1); // Detiene la ejecución si falla la base de datos
  }
};

module.exports = connectDB;