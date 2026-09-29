const Comment = require('../models/comment');
const Post = require('../models/post');

// Crear comentario en un post
exports.crearComentario = async (req, res) => {
    try {
        const { contenido } = req.body;
        const { postId } = req.params;

        if (!contenido) {
            return res.status(400).json({ message: 'El contenido es obligatorio' });
        }

        const postExiste = await Post.findById(postId);
        if (!postExiste) {
            return res.status(404).json({ message: 'La publicación no existe' });
        }

        const nuevoComentario = new Comment({
            contenido,
            autor: req.user.id,
            publicacion: postId
        });

        await nuevoComentario.save();
        res.status(201).json({ message: 'Comentario creado', comentario: nuevoComentario });

    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

// Listar comentarios de un post (solo 'publicado')
exports.listarComentarios = async (req, res) => {
    try {
        const comentarios = await Comment.find({
            publicacion: req.params.postId,
            estado: 'publicado'
        })
            .populate('autor', 'nombre apellido avatar')
            .sort({ createdAt: -1 });

        res.json(comentarios);
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};