const Post = require('../models/post');
const Community = require('../models/community');

// Crear publicación
exports.crearPost = async (req, res) => {
    try {
        const { titulo, contenido, comunidad } = req.body;

        if (!titulo || !contenido || !comunidad) {
            return res.status(400).json({ message: 'Título, contenido y comunidad son obligatorios' });
        }

        // Verificar que la comunidad exista
        const comunidadExiste = await Community.findById(comunidad);
        if (!comunidadExiste) {
            return res.status(404).json({ message: 'La comunidad no existe' });
        }

        const nuevoPost = new Post({
            titulo,
            contenido,
            comunidad,
            autor: req.user.id // viene del JWT
        });

        await nuevoPost.save();
        res.status(201).json({ message: 'Publicación creada', post: nuevoPost });

    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

// Listar publicaciones de una comunidad
exports.listarPostsPorComunidad = async (req, res) => {
    try {
        const posts = await Post.find({
            comunidad: req.params.comunidadId,
            estado: 'publicado' // los usuarios normales solo ven publicados
        })
            .populate('autor', 'nombre apellido avatar')
            .populate('comunidad', 'nombre')
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

// Obtener un post por ID
exports.obtenerPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('autor', 'nombre apellido avatar')
            .populate('comunidad', 'nombre');

        if (!post) {
            return res.status(404).json({ message: 'Publicación no encontrada' });
        }

        res.json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

// Dar o quitar like 
exports.toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Publicación no encontrada' });
        }

        const userId = req.user.id;
        const yaDioLike = post.likes.includes(userId);

        if (yaDioLike) {
            // Quitar like
            post.likes = post.likes.filter(id => id.toString() !== userId);
        } else {
            // Agregar like
            post.likes.push(userId);
        }

        await post.save();
        res.json({
            message: yaDioLike ? 'Like eliminado' : 'Like agregado',
            likes: post.likes.length
        });

    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};