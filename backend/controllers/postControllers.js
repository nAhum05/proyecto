const Post = require('../models/post');
const User = require('../models/user');

// Crear publicación
exports.createPost = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user && user.status === 'baneado') {
            return res.status(403).json({ 
                message: 'Tu cuenta está baneada. No tienes permisos para crear publicaciones.' 
            });
        }

        const post = new Post({ content: req.body.content, author: req.user.id });
        await post.save();
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error al publicar' });
    }
};

// Ver todas las publicaciones
exports.getPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('author', 'firstName lastName role')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error al consultar publicaciones' });
    }
};