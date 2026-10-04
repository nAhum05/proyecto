const Post = require('../models/post');

// Crear publicación
exports.createPost = async (req, res) => {
    try {
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