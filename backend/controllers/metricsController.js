const db = require('../config/db');

const trackClickEvent = async (req, res) => {
    const { elementId } = req.body;
    if (!elementId) {
        return res.status(400).json({ success: false, message: 'Identificador del elemento requerido.' });
    }

    try {
        const analytics = db.collection('click_analytics');
        const result = await analytics.updateOne(
            { element_identifier: elementId },
            { $inc: { accumulated_clicks: 1 }, $set: { last_triggered: new Date() } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: 'Elemento no registrado en el inventario de métricas.' });
        }

        return res.status(200).json({ success: true, message: 'Métrica incrementada exitosamente.' });
    } catch (error) {
        console.error('Error en base de datos al guardar métrica:', error.message);
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};

const getDashboardMetrics = async (req, res) => {
    try {
        const analytics = db.collection('click_analytics');
        const rows = await analytics.find().sort({ accumulated_clicks: -1 }).toArray();
        const totalClicks = rows.reduce((sum, row) => sum + Number(row.accumulated_clicks || 0), 0);
        const keyClicks = rows
            .filter((row) => ['btn_agregar_carrito', 'imagen_producto_detalle'].includes(row.element_identifier))
            .reduce((sum, row) => sum + Number(row.accumulated_clicks || 0), 0);
        const interactionRatio = totalClicks > 0 ? Number((keyClicks / totalClicks).toFixed(4)) : 0;

        return res.status(200).json({
            success: true,
            data: {
                metrics: rows,
                totalClicks,
                interactionRatio,
                threshold: 0.35
            }
        });
    } catch (error) {
        console.error('Error al leer métricas:', error.message);
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};

module.exports = { trackClickEvent, getDashboardMetrics };
