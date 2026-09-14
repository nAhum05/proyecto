//Define la plantilla o estructura fija (schema) de los documentos que se guardarán en MongoDB
//Esta en ingles porque busque un formulario y
//sus variables estan el ingles
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },
  birthDate: { type: Date, required: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true }
}, { timestamps: true }); // Agrega automáticamente la fecha de creación y actualización

module.exports = mongoose.model('User', userSchema);