//Define la plantilla o estructura fija (schema) de los documentos que se guardarán en MongoDB

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  apellido:  { type: String, required: true, trim: true },
  fechaNacimiento: { type: Date, required: true },
  correo:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true },
  biografia:       { type: String, default: '' },
  avatar:    { type: String, default: '' },
  rol: {
    type: String,
    enum: ['usuario', 'moderador', 'administrador'],
    default: 'usuario'
  },
  estado: {
    type: String,
    enum: ['activo', 'suspendido', 'baneado'],
    default: 'activo'
  }
}, { timestamps: true }); // Agrega automáticamente la fecha de creación y actualización

module.exports = mongoose.model('User', userSchema);


