const db = require('../config/db');
const { fetchPlaceholderImage } = require('../services/imageFetcher');

const normalizeProduct = (product) => ({
    id: product._id?.toString() || product.id,
    name: product.name,
    description: product.description || null,
    price: Number(product.price || 0),
    stock: Number(product.stock || 0),
    image_url: product.image_url || null,
    category: product.category || 'TCG',
    product_tag: product.product_tag || 'En vitrina',
    release_status: product.release_status || 'catalogo',
    preorder_available: Boolean(product.preorder_available),
    created_at: product.created_at ? product.created_at.toISOString() : null
});

const getProducts = async (req, res) => {
    const { category, productTag, releaseStatus, availability, search } = req.query;
    const products = db.collection('products');
    const filter = {};

    if (category) {
        filter.$or = [
            { category: { $regex: String(category), $options: 'i' } },
            { name: { $regex: String(category), $options: 'i' } }
        ];
    }
    if (productTag) {
        filter.product_tag = productTag;
    }
    if (releaseStatus) {
        filter.release_status = releaseStatus;
    }
    if (availability === 'available') {
        filter.stock = { $gt: 0 };
    }
    if (availability === 'soldout') {
        filter.stock = 0;
    }
    if (search) {
        filter.$or = [
            ...(filter.$or || []),
            { name: { $regex: String(search), $options: 'i' } },
            { description: { $regex: String(search), $options: 'i' } }
        ];
    }

    try {
        const rows = await products.find(filter).sort({ created_at: -1 }).toArray();
        return res.status(200).json({ success: true, data: rows.map(normalizeProduct) });
    } catch (error) {
        console.error('Error al listar productos:', error.message);
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};

const getProductById = async (req, res) => {
    try {
        const products = db.collection('products');
        const product = await products.findOne({ _id: db.objectId(req.params.id) });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado.' });
        }
        return res.status(200).json({ success: true, data: normalizeProduct(product) });
    } catch (error) {
        console.error('Error al obtener producto:', error.message);
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};

const createProduct = async (req, res) => {
    const { name, description = null, price, stock, image_url, category = 'TCG', product_tag = 'En vitrina', release_status = 'catalogo', preorder_available = false } = req.body;
    const products = db.collection('products');

    try {
        const finalImageUrl = image_url || await fetchPlaceholderImage();
        const result = await products.insertOne({
            name,
            description,
            price: Number(price || 0),
            stock: Number(stock || 0),
            image_url: finalImageUrl,
            category,
            product_tag,
            release_status,
            preorder_available: Boolean(preorder_available),
            created_at: new Date()
        });
        const createdProduct = await products.findOne({ _id: result.insertedId });
        return res.status(201).json({ success: true, data: normalizeProduct(createdProduct) });
    } catch (error) {
        console.error('Error al crear producto:', error.message);
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};

const updateProduct = async (req, res) => {
    const fields = { ...req.body };
    const products = db.collection('products');

    try {
        const filter = { _id: db.objectId(req.params.id) };
        const existing = await products.findOne(filter, { projection: { _id: 1 } });
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado.' });
        }

        delete fields.id;
        delete fields._id;
        if (fields.price !== undefined) fields.price = Number(fields.price);
        if (fields.stock !== undefined) fields.stock = Number(fields.stock);
        if (fields.preorder_available !== undefined) fields.preorder_available = Boolean(fields.preorder_available);
        fields.updated_at = new Date();

        await products.updateOne(filter, { $set: fields });
        const updatedProduct = await products.findOne(filter);
        return res.status(200).json({ success: true, data: normalizeProduct(updatedProduct) });
    } catch (error) {
        console.error('Error al actualizar producto:', error.message);
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const products = db.collection('products');
        const result = await products.deleteOne({ _id: db.objectId(req.params.id) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado.' });
        }
        return res.status(200).json({ success: true, message: 'Producto eliminado correctamente.' });
    } catch (error) {
        console.error('Error al eliminar producto:', error.message);
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
