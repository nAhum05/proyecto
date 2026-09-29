const User = require('../models/user');
const bcrypt = require('bcryptjs');

// 1 Obtener perfil de un usuario por su ID
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el perfil', error: error.message });
    }
};

// 2 Editar el perfil propio
exports.updateProfile = async (req, res) => {
    try {
        const { nombre, apellido, biografia, avatar, password } = req.body;
        const userId = req.user.id;

        const camposActualizar = {};
        if (nombre) camposActualizar.nombre = nombre;
        if (apellido) camposActualizar.apellido = apellido;
        if (biografia !== undefined) camposActualizar.biografia = biografia;
        if (avatar !== undefined) camposActualizar.avatar = avatar;

        // Si envían nueva contraseña, la encriptamos
        if (password) {
            const salt = await bcrypt.genSalt(10);
            camposActualizar.password = await bcrypt.hash(password, salt);
        }

        const usuarioActualizado = await User.findByIdAndUpdate(
            userId,
            { $set: camposActualizar },
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({
            message: 'Perfil actualizado exitosamente',
            user: usuarioActualizado
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el perfil', error: error.message });
    }
};

// 3 Eliminar la cuenta propia
exports.deleteProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        await User.findByIdAndDelete(userId);

        res.status(200).json({ message: 'Cuenta eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la cuenta', error: error.message });
    }
};