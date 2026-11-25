const User = require('../models/user');

// Consultar perfil por ID
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error al consultar perfil' });
    }
};

// Editar perfil del usuario autenticado
exports.updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, bio } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { firstName, lastName, bio },
            { returnDocument: 'after' }
        ).select('-password');

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar perfil' });
    }
};

// Eliminar perfil
exports.deleteProfile = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user.id);
        res.json({ message: 'Cuenta eliminada con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar cuenta' });
    }
};

// Consultar todos los usuarios

// Consultar todos los usuarios
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('-password') // Excluimos únicamente la contraseña, permitiendo que viajen los timestamps y demás datos
            .sort({ createdAt: -1 });

        res.json(users);

    } catch (error) {
        res.status(500).json({
            message: 'Error al consultar usuarios'
        });
    }
};

// En tu userControllers.js (Función updateUserStatus)
exports.updateUserStatus = async (req, res) => {
    try {
        const { status } = req.body;

        // El moderador SOLO puede cambiar entre 'activo' y 'baneado'
        if (!['activo', 'baneado'].includes(status)) {
            return res.status(400).json({
                message: 'Los moderadores solo pueden activar o banear usuarios.'
            });
        }

        const updateData = { status };

        if (status === 'baneado') {
            updateData.fechaBaneo = new Date(); // Registra el timestamp del baneo
        } else {
            updateData.fechaBaneo = null; // Limpia la fecha si se activa
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { returnDocument: 'after' }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                message: 'Usuario no encontrado'
            });
        }

        res.json({
            message: 'Estado actualizado correctamente',
            user
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error al actualizar el estado del usuario',
            error: error.message
        });
    }
};