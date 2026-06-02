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
    const statsCollection = db.collection('product_interest_stats');
    const filter = { product_id: db.objectId(productId), season_key: seasonKey };
    await statsCollection.updateOne(
        filter,
        {
            $setOnInsert: {
                product_views: 0,
                product_clicks: 0,
                whatsapp_messages: 0,
                restock_threshold: 25,
                launch_threshold: 0,
                created_at: new Date()
            }
        },
        { upsert: true }
    );
    return statsCollection.findOne(filter);
};

const evaluateRestockStatus = (stats) => {
    const totalInterest = Number(stats?.product_views || 0) + Number(stats?.product_clicks || 0) + Number(stats?.whatsapp_messages || 0);
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
        const restockRequests = db.collection('restock_requests');
        await restockRequests.updateMany(
            { product_id: db.objectId(productId), season_key: seasonKey, status: 'en_espera' },
            {
                $set: {
                    status: 'elegible_admin',
                    waiting_message: evaluation.waitingMessage,
                    interest_snapshot: evaluation.totalInterest,
                    threshold_snapshot: evaluation.threshold,
                    updated_at: new Date()
                }
            }
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
        const statsCollection = db.collection('product_interest_stats');
        const filter = { product_id: db.objectId(id), season_key: seasonKey };
        const update = {
            $setOnInsert: {
                product_views: 0,
                product_clicks: 0,
                whatsapp_messages: 0,
                restock_threshold: 25,
                launch_threshold: 0,
                created_at: new Date()
            },
            $inc: { [eventType === 'view' ? 'product_views' : 'product_clicks']: 1 }
        };
        await statsCollection.updateOne(filter, update, { upsert: true });
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
        const statsCollection = db.collection('product_interest_stats');
        const filter = { product_id: db.objectId(id), season_key: seasonKey };
        await statsCollection.updateOne(
            filter,
            {
                $setOnInsert: {
                    product_views: 0,
                    product_clicks: 0,
                    whatsapp_messages: 0,
                    restock_threshold: 25,
                    launch_threshold: 0,
                    created_at: new Date()
                },
                $inc: { whatsapp_messages: normalizedCount }
            },
            { upsert: true }
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
        const products = db.collection('products');
        const restockRequests = db.collection('restock_requests');
        const product = await products.findOne({ _id: db.objectId(id) });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado para restock.' });
        }

        const stats = await ensureInterestStats(id, seasonKey);
        const evaluation = evaluateRestockStatus(stats);

        const existingRequest = await restockRequests.findOne({ product_id: db.objectId(id), customer_email: normalizedEmail, season_key: seasonKey });
        if (existingRequest) {
            return res.status(409).json({
                success: false,
                message: 'Ya existe un intento de stock/restock para esta cuenta durante la temporada actual. Puedes cancelarlo desde el botón de cancelar.',
                data: {
                    id: existingRequest._id.toString(),
                    status: existingRequest.status,
                    waiting_message: existingRequest.waiting_message,
                    season_key: existingRequest.season_key,
                    interest_snapshot: existingRequest.interest_snapshot,
                    threshold_snapshot: existingRequest.threshold_snapshot
                }
            });
        }

        const result = await restockRequests.insertOne({
            product_id: db.objectId(id),
            customer_email: normalizedEmail,
            requested_quantity: Number(requestedQuantity || 1),
            season_key: seasonKey,
            source,
            status: evaluation.status,
            waiting_message: evaluation.waitingMessage,
            threshold_snapshot: evaluation.threshold,
            interest_snapshot: evaluation.totalInterest,
            created_at: new Date(),
            updated_at: new Date()
        });

        return res.status(201).json({
            success: true,
            message: evaluation.waitingMessage,
            data: {
                id: result.insertedId.toString(),
                status: evaluation.status,
                seasonKey,
                seasonEndsAt: getSeasonEndDate(),
                totalInterest: evaluation.totalInterest,
                threshold: evaluation.threshold
            }
        });
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
        const restockRequests = db.collection('restock_requests');
        const result = await restockRequests.updateOne(
            { _id: db.objectId(requestId), customer_email: normalizedEmail, status: { $nin: ['cancelado', 'resuelto'] } },
            {
                $set: {
                    status: 'cancelado',
                    cancelled_at: new Date(),
                    waiting_message: 'Solicitud cancelada por el cliente.',
                    updated_at: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
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
        const launchRequests = db.collection('launch_requests');
        await launchRequests.insertOne({
            product_name: productName,
            franchise,
            customer_email: customerEmail,
            requested_quantity: Number(requestedQuantity || 1),
            notes,
            status: 'pendiente',
            created_at: new Date()
        });
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

    if (!favoriteFranchise || satisfactionScore === undefined || satisfactionScore === null) {
        return res.status(400).json({ success: false, message: 'Franquicia favorita y satisfacción son obligatorias.' });
    }

    const numericScore = Number(satisfactionScore);
    if (!Number.isInteger(numericScore) || numericScore < 1 || numericScore > 5) {
        return res.status(400).json({ success: false, message: 'La satisfacción debe estar entre 1 y 5.' });
    }

    try {
        const research = db.collection('customer_research');
        await research.insertOne({
            customer_email: customerEmail,
            favorite_franchise: favoriteFranchise,
            satisfaction_score: numericScore,
            preferred_budget: preferredBudget !== null ? Number(preferredBudget) : null,
            play_style: playStyle,
            trivia_answer: triviaAnswer,
            comments,
            created_at: new Date()
        });
        return res.status(201).json({ success: true, message: 'Investigación de cliente registrada.' });
    } catch (error) {
        console.error('Error al guardar investigación:', error.message);
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};

const getBusinessInsights = async (req, res) => {
    const seasonKey = getSeasonKey();

    try {
        const restockRequestsCollection = db.collection('restock_requests');
        const productInterestCollection = db.collection('product_interest_stats');
        const launchRequestsCollection = db.collection('launch_requests');
        const researchCollection = db.collection('customer_research');

        const restockRows = await restockRequestsCollection.aggregate([
            { $sort: { created_at: -1 } },
            { $limit: 50 },
            {
                $lookup: {
                    from: 'products',
                    localField: 'product_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    id: { $toString: '$_id' },
                    product_id: { $toString: '$product_id' },
                    product_name: '$product.name',
                    customer_email: 1,
                    requested_quantity: 1,
                    season_key: 1,
                    source: 1,
                    status: 1,
                    waiting_message: 1,
                    threshold_snapshot: 1,
                    interest_snapshot: 1,
                    cancelled_at: 1,
                    created_at: 1,
                    updated_at: 1
                }
            }
        ]).toArray();

        const interestRows = await productInterestCollection.aggregate([
            {
                $lookup: {
                    from: 'products',
                    localField: 'product_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    product_id: { $toString: '$product_id' },
                    product_name: '$product.name',
                    season_key: 1,
                    product_views: 1,
                    product_clicks: 1,
                    whatsapp_messages: 1,
                    restock_threshold: 1,
                    total_interest: {
                        $add: [{ $ifNull: ['$product_views', 0] }, { $ifNull: ['$product_clicks', 0] }, { $ifNull: ['$whatsapp_messages', 0] }]
                    }
                }
            },
            {
                $addFields: {
                    recommendation: {
                        $cond: [
                            { $gte: ['$total_interest', '$restock_threshold'] },
                            'revisar_compra',
                            'seguir_esperando'
                        ]
                    }
                }
            },
            { $sort: { total_interest: -1 } },
            { $limit: 50 }
        ]).toArray();

        const launchRows = await launchRequestsCollection.find().sort({ created_at: -1 }).limit(50).toArray();
        const researchRows = await researchCollection.find().sort({ created_at: -1 }).limit(50).toArray();
        const franchiseRows = await researchCollection.aggregate([
            {
                $group: {
                    _id: '$favorite_franchise',
                    responses: { $sum: 1 },
                    avg_satisfaction: { $avg: '$satisfaction_score' }
                }
            },
            {
                $project: {
                    favorite_franchise: '$_id',
                    responses: 1,
                    avg_satisfaction: { $round: ['$avg_satisfaction', 2] }
                }
            },
            { $sort: { responses: -1 } }
        ]).toArray();
        const styleRows = await researchCollection.aggregate([
            {
                $group: {
                    _id: '$play_style',
                    responses: { $sum: 1 },
                    avg_budget: { $avg: '$preferred_budget' }
                }
            },
            {
                $project: {
                    play_style: '$_id',
                    responses: 1,
                    avg_budget: { $round: ['$avg_budget', 2] }
                }
            },
            { $sort: { responses: -1 } }
        ]).toArray();

        return res.status(200).json({
            success: true,
            data: {
                currentSeason: seasonKey,
                seasonEndsAt: getSeasonEndDate(),
                restockRequests: restockRows,
                productInterest: interestRows,
                launchRequests: launchRows.map((item) => ({
                    id: item._id?.toString(),
                    product_name: item.product_name,
                    franchise: item.franchise,
                    customer_email: item.customer_email,
                    requested_quantity: item.requested_quantity,
                    notes: item.notes,
                    status: item.status,
                    created_at: item.created_at?.toISOString()
                })),
                researchResponses: researchRows.map((item) => ({
                    id: item._id?.toString(),
                    customer_email: item.customer_email,
                    favorite_franchise: item.favorite_franchise,
                    satisfaction_score: item.satisfaction_score,
                    preferred_budget: item.preferred_budget,
                    play_style: item.play_style,
                    trivia_answer: item.trivia_answer,
                    comments: item.comments,
                    created_at: item.created_at?.toISOString()
                })),
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
