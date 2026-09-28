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