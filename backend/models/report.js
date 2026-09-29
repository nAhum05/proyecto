// Define la plantilla o estructura fija (schema) de los reportes de moderación que se guardarán en MongoDB

const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reportadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    publicacion: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    comentario: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
    motivo: { type: String, required: true, trim: true },
    estado: {
        type: String,
        enum: ['pendiente', 'revisado', 'resuelto', 'descartado'],
        default: 'pendiente'
    },
    resultoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true }); // Agrega automáticamente la fecha de creación y actualización

module.exports = mongoose.model('Report', reportSchema);