// Define la plantilla o estructura fija (schema) de las comunidades/canales que se guardarán en MongoDB

const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
    nombre: { type: String, required: true, unique: true, trim: true },
    descripcion: { type: String, default: '', trim: true },
    icono: { type: String, default: '' },
    creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    moderadores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    miembros: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] 
}, { timestamps: true }); // Agrega automáticamente la fecha de creación y actualización

module.exports = mongoose.model('Community', communitySchema);