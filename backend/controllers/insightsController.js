const db = require('../config/db');

const getSeasonKey = (date = new Date()) => {
    const month = date.getUTCMonth();
    const quarter = Math.floor(month / 3) + 1;
    return `${date.getUTCFullYear()}-T${quarter}`;
};

const getSeasonEndDate = (date = new Date()) => {
    const quarter = Math.floor(date.getUTCMonth() / 3);
    const endMonth = quarter * 3 + 3;
    return new Date(Date.UTC(date.getUTCFullYear(), endMonth, 0, 23, 59, 59)).toISOString().slice(0, 10);
};

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const ensureInterestStats = async (productId, seasonKey) => {
    await db.execute(
        `INSERT INTO product_interest_stats (product_id, season_key)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE product_id = product_id`,
        [productId, seasonKey]
    );

    const [rows] = await db.execute(
        `SELECT product_id, season_key, product_views, product_clicks, whatsapp_messages,
                restock_threshold, launch_threshold,
                (product_views + product_clicks + whatsapp_messages) AS total_interest
         FROM product_interest_stats
         WHERE product_id = ? AND season_key = ?`,
        [productId, seasonKey]
    );
    return rows[0];
};

const evaluateRestockStatus = (stats) => {
    const totalInterest = Number(stats?.total_interest || 0);
    const threshold = Number(stats?.restock_threshold || 25);
    return {
        status: totalInterest >= threshold ? 'elegible_admin' : 'en_espera',
        totalInterest,
        threshold,
        waitingMessage: totalInterest >= threshold
            ? 'Tu solicitud ya alcanzó el umbral de interés y queda en revisión del panel administrativo.'
            : `Solicitud recibida. Queda en espera hasta que la suma de vistas, clics y mensajes oficiales de WhatsApp alcance ${threshold} señales durante la temporada ${stats?.season_key}.`
    };
};


const refreshRestockEligibility = async (productId, seasonKey) => {
    const stats = await ensureInterestStats(productId, seasonKey);
    const evaluation = evaluateRestockStatus(stats);
    if (evaluation.status === 'elegible_admin') {
        await db.execute(
            `UPDATE restock_requests
             SET status = 'elegible_admin', waiting_message = ?, interest_snapshot = ?, threshold_snapshot = ?
             WHERE product_id = ? AND season_key = ? AND status = 'en_espera'`,
            [evaluation.waitingMessage, evaluation.totalInterest, evaluation.threshold, productId, seasonKey]
        );
    }
    return { stats, evaluation };
};

const recordProductInterest = async (req, res) => {
    const { id } = req.params;
    const { eventType = 'click' } = req.body;
    const seasonKey = getSeasonKey();

    if (!['view', 'click'].includes(eventType)) {
        return res.status(400).json({ success: false, message: 'El tipo de evento debe ser view o click.' });
    }

    try {
        const column = eventType === 'view' ? 'product_views' : 'product_clicks';
        await db.execute(
            `INSERT INTO product_interest_stats (product_id, season_key, ${column})
             VALUES (?, ?, 1)
             ON DUPLICATE KEY UPDATE ${column} = ${column} + 1`,
            [id, seasonKey]
        );
        const { stats, evaluation } = await refreshRestockEligibility(id, seasonKey);
        return res.status(200).json({ success: true, data: { ...stats, restockStatus: evaluation.status } });
    } catch (error) {
        console.error('Error al registrar interés del producto:', error.message);
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};

const addWhatsappInterest = async (req, res) => {
    const { id } = req.params;
    const { messageCount = 1 } = req.body;
    const seasonKey = getSeasonKey();
    const normalizedCount = Math.max(1, Number(messageCount) || 1);

    try {
        await db.execute(
            `INSERT INTO product_interest_stats (product_id, season_key, whatsapp_messages)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE whatsapp_messages = whatsapp_messages + VALUES(whatsapp_messages)`,
            [id, seasonKey, normalizedCount]
        );
        const { stats, evaluation } = await refreshRestockEligibility(id, seasonKey);
        return res.status(200).json({ success: true, message: 'Mensajes oficiales de WhatsApp agregados al análisis.', data: { ...stats, restockStatus: evaluation.status } });
    } catch (error) {
        console.error('Error al agregar interés de WhatsApp:', error.message);
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};

const requestRestock = async (req, res) => {
    const { id } = req.params;
    const { customerEmail, requestedQuantity = 1, source = 'web' } = req.body;
    const normalizedEmail = normalizeEmail(customerEmail);
    const seasonKey = getSeasonKey();

    if (!normalizedEmail) {
        return res.status(400).json({ success: false, message: 'El correo del cliente es obligatorio para permitir un solo intento por temporada.' });
    }

    try {
        const [productRows] = await db.execute('SELECT id FROM products WHERE id = ?', [id]);
        if (!productRows.length) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado para restock.' });
        }

        const stats = await ensureInterestStats(id, seasonKey);
        const evaluation = evaluateRestockStatus(stats);

        try {
            const [result] = await db.execute(
                `INSERT INTO restock_requests
                 (product_id, customer_email, requested_quantity, season_key, source, status, waiting_message, threshold_snapshot, interest_snapshot)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, normalizedEmail, requestedQuantity, seasonKey, source, evaluation.status, evaluation.waitingMessage, evaluation.threshold, evaluation.totalInterest]
            );

            return res.status(201).json({
                success: true,
                message: evaluation.waitingMessage,
                data: {
                    id: result.insertId,
                    status: evaluation.status,
                    seasonKey,
                    seasonEndsAt: getSeasonEndDate(),
                    totalInterest: evaluation.totalInterest,
                    threshold: evaluation.threshold
                }
            });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                const [existingRows] = await db.execute(
                    'SELECT id, status, waiting_message, season_key, interest_snapshot, threshold_snapshot FROM restock_requests WHERE product_id = ? AND customer_email = ? AND season_key = ?',
                    [id, normalizedEmail, seasonKey]
                );
                return res.status(409).json({
                    success: false,
                    message: 'Ya existe un intento de stock/restock para esta cuenta durante la temporada actual. Puedes cancelarlo desde el botón de cancelar.',
                    data: existingRows[0]
                });
            }
            throw error;
        }
    } catch (error) {
        console.error('Error al registrar restock:', error.message);
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};

const cancelRestock = async (req, res) => {
    const { requestId } = req.params;
    const { customerEmail } = req.body;
    const normalizedEmail = normalizeEmail(customerEmail);

    if (!normalizedEmail) {
        return res.status(400).json({ success: false, message: 'Correo requerido para cancelar la solicitud.' });
    }

    try {
        const [result] = await db.execute(
            `UPDATE restock_requests
             SET status = 'cancelado', cancelled_at = CURRENT_TIMESTAMP, waiting_message = 'Solicitud cancelada por el cliente.'
             WHERE id = ? AND customer_email = ? AND status NOT IN ('cancelado', 'resuelto')`,
            [requestId, normalizedEmail]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'No se encontró una solicitud activa para cancelar.' });
        }

        return res.status(200).json({ success: true, message: 'Solicitud de stock/restock cancelada.' });
    } catch (error) {
        console.error('Error al cancelar restock:', error.message);
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};

const requestLaunch = async (req, res) => {
    const { productName, franchise, customerEmail = null, requestedQuantity = 1, notes = null } = req.body;
    if (!productName || !franchise) {
        return res.status(400).json({ success: false, message: 'Producto y franquicia son obligatorios.' });
    }

    try {
        await db.execute(
            'INSERT INTO launch_requests (product_name, franchise, customer_email, requested_quantity, notes) VALUES (?, ?, ?, ?, ?)',
            [productName, franchise, customerEmail, requestedQuantity, notes]
        );
        return res.status(201).json({ success: true, message: 'Pedido de lanzamiento registrado.' });
    } catch (error) {
        console.error('Error al registrar lanzamiento:', error.message);
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};

const submitCustomerResearch = async (req, res) => {
    const {
        customerEmail = null,
        favoriteFranchise,
        satisfactionScore,
        preferredBudget = null,
        playStyle = 'casual',
        triviaAnswer = null,
        comments = null
    } = req.body;

    if (!favoriteFranchise || !satisfactionScore) {
        return res.status(400).json({ success: false, message: 'Franquicia favorita y satisfacción son obligatorias.' });
    }

    const numericScore = Number(satisfactionScore);
    if (!Number.isInteger(numericScore) || numericScore < 1 || numericScore > 5) {
        return res.status(400).json({ success: false, message: 'La satisfacción debe estar entre 1 y 5.' });
    }

    try {
        await db.execute(
            `INSERT INTO customer_research
             (customer_email, favorite_franchise, satisfaction_score, preferred_budget, play_style, trivia_answer, comments)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [customerEmail, favoriteFranchise, numericScore, preferredBudget, playStyle, triviaAnswer, comments]
        );
        return res.status(201).json({ success: true, message: 'Investigación de cliente registrada.' });
    } catch (error) {
        console.error('Error al guardar investigación:', error.message);
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};

const getBusinessInsights = async (req, res) => {
    const seasonKey = getSeasonKey();

    try {
        const [restockRows] = await db.execute(`
            SELECT rr.id, rr.product_id, p.name AS product_name, rr.customer_email, rr.requested_quantity,
                   rr.season_key, rr.source, rr.status, rr.waiting_message, rr.threshold_snapshot,
                   rr.interest_snapshot, rr.cancelled_at, rr.created_at, rr.updated_at
            FROM restock_requests rr
            INNER JOIN products p ON p.id = rr.product_id
            ORDER BY rr.created_at DESC
            LIMIT 50
        `);
        const [interestRows] = await db.execute(`
            SELECT pis.product_id, p.name AS product_name, pis.season_key, pis.product_views,
                   pis.product_clicks, pis.whatsapp_messages, pis.restock_threshold,
                   (pis.product_views + pis.product_clicks + pis.whatsapp_messages) AS total_interest,
                   CASE WHEN (pis.product_views + pis.product_clicks + pis.whatsapp_messages) >= pis.restock_threshold
                        THEN 'revisar_compra' ELSE 'seguir_esperando' END AS recommendation
            FROM product_interest_stats pis
            INNER JOIN products p ON p.id = pis.product_id
            ORDER BY total_interest DESC
            LIMIT 50
        `);
        const [launchRows] = await db.execute('SELECT id, product_name, franchise, customer_email, requested_quantity, notes, status, created_at FROM launch_requests ORDER BY created_at DESC LIMIT 50');
        const [researchRows] = await db.execute('SELECT id, customer_email, favorite_franchise, satisfaction_score, preferred_budget, play_style, trivia_answer, comments, created_at FROM customer_research ORDER BY created_at DESC LIMIT 50');
        const [franchiseRows] = await db.execute('SELECT favorite_franchise, COUNT(*) AS responses, ROUND(AVG(satisfaction_score), 2) AS avg_satisfaction FROM customer_research GROUP BY favorite_franchise ORDER BY responses DESC');
        const [styleRows] = await db.execute('SELECT play_style, COUNT(*) AS responses, ROUND(AVG(preferred_budget), 2) AS avg_budget FROM customer_research GROUP BY play_style ORDER BY responses DESC');

        return res.status(200).json({
            success: true,
            data: {
                currentSeason: seasonKey,
                seasonEndsAt: getSeasonEndDate(),
                restockRequests: restockRows,
                productInterest: interestRows,
                launchRequests: launchRows,
                researchResponses: researchRows,
                franchiseSummary: franchiseRows,
                playStyleSummary: styleRows
            }
        });
    } catch (error) {
        console.error('Error al generar informe de negocio:', error.message);
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};

module.exports = {
    addWhatsappInterest,
    cancelRestock,
    getBusinessInsights,
    recordProductInterest,
    requestRestock,
    requestLaunch,
    submitCustomerResearch
};
