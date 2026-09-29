// Define la plantilla o estructura fija (schema) de los comentarios que se guardarán en MongoDB

const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    contenido: { type: String, required: true, trim: true },
    autor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    publicacion: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    estado: {
        type: String,
        enum: ['publicado', 'eliminado'],
        default: 'publicado'
    }
}, { timestamps: true }); // Agrega automáticamente la fecha de creación y actualización

module.exports = mongoose.model('Comment', commentSchema);