const Reporte = require('../models/report');
const Publicacion = require('../models/post');

// 1 Crear un reporte sobre una publicación esto lo hace el usuario
exports.crearReporte = async (req, res) => {
    try {
        const { publicacionId, motivo } = req.body;

        // Verificar que la publicación exista
        const publicacion = await Publicacion.findById(publicacionId);
        if (!publicacion) {
            return res.status(404).json({ message: 'La publicación no existe' });
        }

        // Verificar que el usuario no esté reportando su propia publicacion
        if (publicacion.autor.toString() === req.user.id) {
            return res.status(400).json({ message: 'No puedes reportar tu propia publicación' });
        }

        const nuevoReporte = new Reporte({
            reportadoPor: req.user.id,
            publicacion: publicacionId,
            motivo
        });

        await nuevoReporte.save();
        res.status(201).json({ message: 'Reporte enviado a moderación' });
    } catch (error) {
        res.status(500).json({ message: 'Error al enviar el reporte', error: error.message });
    }
};

// 2 Obtener lista de reportes pendientes esto lo hace el moderador
exports.obtenerReportesPendientes = async (req, res) => {
    try {
        const reportes = await Reporte.find({ estado: 'pendiente' })
            .populate('reportadoPor', 'nombre apellido correo')
            .populate('publicacion')
            .sort({ createdAt: -1 });

        res.status(200).json(reportes);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener reportes', error: error.message });
    }
};

// 3 Ocultar o eliminar publicación reportada esto lo hace el moderador
exports.cambiarEstadoPublicacion = async (req, res) => {
    try {
        const { publicacionId, nuevoEstado, reporteId } = req.body; // 'oculto' o 'eliminado'

        // Cambia el estado de la publicación
        await Publicacion.findByIdAndUpdate(publicacionId, { estado: nuevoEstado });

        // Marca el reporte como resuelto
        if (reporteId) {
            await Reporte.findByIdAndUpdate(reporteId, {
                estado: 'resuelto',
                resueltoPor: req.user.id
            });
        }

        res.status(200).json({ message: `Publicación actualizada a estado '${nuevoEstado}'` });
    } catch (error) {
        res.status(500).json({ message: 'Error al moderar publicación', error: error.message });
    }
};