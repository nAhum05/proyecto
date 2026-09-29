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
            { new: true }
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
exports.getUsers = async (req, res) => {
    try {

        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 });

        res.json(users);

    } catch (error) {

        res.status(500).json({
            message: 'Error al consultar usuarios'
        });

    }
};

// Cambiar el estado de un usuario
exports.updateUserStatus = async (req, res) => {
    try {

        const { status } = req.body;

        if (!['activo', 'suspendido'].includes(status)) {
            return res.status(400).json({
                message: 'Estado no válido'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
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
            message: 'Error al actualizar el estado del usuario'
        });

    }
};