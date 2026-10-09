// controllers/adminControllers.js
const User = require('../models/user');
const Post = require('../models/post');


exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const rolesValidos = ['usuario', 'moderador', 'administrador'];

        if (!rolesValidos.includes(role)) {
            return res.status(400).json({ message: 'Rol no válido' });
        }

        // Evitar que un admin se degrade a sí mismo si es el último admin
        if (req.params.id === req.user.id) {
            const adminsCount = await User.countDocuments({ role: 'administrador' });
            if (adminsCount <= 1) {
                return res.status(400).json({
                    message: 'No puedes degradar al último administrador.'
                });
            }
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { returnDocument: 'after' }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({
            message: `Rol actualizado a "${role}" correctamente.`,
            user
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error al actualizar el rol',
            error: error.message
        });
    }
};

exports.banOrSuspendUser = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['activo', 'suspendido', 'baneado'].includes(status)) {
            return res.status(400).json({ message: 'Estado no válido' });
        }

        // No permitir que un admin se banee a sí mismo
        if (req.params.id === req.user.id) {
            return res.status(400).json({
                message: 'No puedes cambiar tu propio estado.'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status },
            { returnDocument: 'after' }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({
            message: `Estado cambiado a "${status}" correctamente.`,
            user
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error al cambiar el estado del usuario',
            error: error.message
        });
    }
};


exports.deleteAnyPost = async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Publicación no encontrada' });
        }

        res.json({ message: 'Publicación eliminada por administrador.' });

    } catch (error) {
        res.status(500).json({
            message: 'Error al eliminar la publicación',
            error: error.message
        });
    }
};


exports.deleteUser = async (req, res) => {
    try {
        if (req.params.id === req.user.id) {
            return res.status(400).json({
                message: 'Usa /user/profile para eliminar tu propia cuenta.'
            });
        }

        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({ message: 'Usuario eliminado correctamente.' });

    } catch (error) {
        res.status(500).json({
            message: 'Error al eliminar usuario',
            error: error.message
        });
    }
};


exports.getStats = async (req, res) => {
    try {
        const [totalUsers, activos, suspendidos, totalPosts] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ status: 'activo' }),
            User.countDocuments({ status: 'suspendido' }),
            Post.countDocuments()
        ]);

        res.json({
            usuarios: {
                total: totalUsers,
                activos,
                suspendidos
            },
            publicaciones: {
                total: totalPosts
            }
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener estadísticas',
            error: error.message
        });
    }
};