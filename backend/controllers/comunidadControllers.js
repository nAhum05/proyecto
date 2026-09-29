const Community = require('../models/community');

// Crear comunidad (cualquier usuario autenticado)
exports.crearComunidad = async (req, res) => {
    try {
        const { nombre, descripcion, icono } = req.body;

        if (!nombre) {
            return res.status(400).json({ message: 'El nombre es obligatorio' });
        }

        const existe = await Community.findOne({ nombre });
        if (existe) {
            return res.status(400).json({ message: 'Ya existe una comunidad con ese nombre' });
        }

        const nueva = new Community({
            nombre,
            descripcion,
            icono,
            creadoPor: req.user.id,
            moderadores: [req.user.id], // el creador se vuelve moderador automáticamente
            miembros: [req.user.id]
        });

        await nueva.save();
        res.status(201).json({ message: 'Comunidad creada', comunidad: nueva });

    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

// Listar todas las comunidades
exports.listarComunidades = async (req, res) => {
    try {
        const comunidades = await Community.find()
            .populate('creadoPor', 'nombre apellido')
            .populate('moderadores', 'nombre apellido')
            .populate('miembros', 'nombre apellido avatar');

        res.json(comunidades);
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

// Obtener una comunidad por ID
exports.obtenerComunidad = async (req, res) => {
    try {
        const comunidad = await Community.findById(req.params.id)
            .populate('creadoPor', 'nombre apellido')
            .populate('moderadores', 'nombre apellido')
            .populate('miembros', 'nombre apellido avatar');

        if (!comunidad) {
            return res.status(404).json({ message: 'Comunidad no encontrada' });
        }

        res.json(comunidad);
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

// Unirse o salir de una comunidad (toggle)
exports.toggleMiembro = async (req, res) => {
    try {
        const comunidad = await Community.findById(req.params.id);
        if (!comunidad) {
            return res.status(404).json({ message: 'Comunidad no encontrada' });
        }

        const userId = req.user.id;
        const yaEsMiembro = comunidad.miembros.some(id => id.toString() === userId);

        if (yaEsMiembro) {
            // Salir
            comunidad.miembros = comunidad.miembros.filter(id => id.toString() !== userId);
        } else {
            // Unirse
            comunidad.miembros.push(userId);
        }

        await comunidad.save();
        res.json({
            message: yaEsMiembro ? 'Has salido de la comunidad' : 'Te has unido a la comunidad',
            esMiembro: !yaEsMiembro,
            totalMiembros: comunidad.miembros.length
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al modificar membresía', error: error.message });
    }
};