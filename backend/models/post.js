// Define la plantilla o estructura fija (schema) de las publicaciones que se guardarán en MongoDB

const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    titulo: { type: String, required: true, trim: true },
    contenido: { type: String, required: true },
    autor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    comunidad: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    estado: {
        type: String,
        enum: ['publicado', 'oculto', 'eliminado'],
        default: 'publicado'
    }
}, { timestamps: true }); // Agrega automáticamente la fecha de creación y actualización

module.exports = mongoose.model('Post', postSchema);