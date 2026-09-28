//Define la plantilla o estructura fija (schema) de los documentos que se guardarán en MongoDB

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },
  birthDate: { type: Date, required: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true },
  bio: {type: String, default: ''},
  role:{
    type: String,
    enum: ['usuario', 'moderador', 'administrador'],
    default: 'usuario'
  }
}, { timestamps: true }); // Agrega automáticamente la fecha de creación y actualización

module.exports = mongoose.model('User', userSchema);


