const db = require('../config/db');
const { fetchPlaceholderImage } = require('../services/imageFetcher');

const normalizeProduct = (product) => ({
    ...product,
    price: Number(product.price)
});

// Lista productos con filtros usados por las páginas jerárquicas del frontend.
// Los filtros son opcionales para conservar compatibilidad con el catálogo general.
const getProducts = async (req, res) => {
    const { category, productTag, releaseStatus, availability, search } = req.query;
    const where = [];
    const params = [];

    if (category) {
        where.push('(LOWER(category) LIKE ? OR LOWER(name) LIKE ?)');
        params.push(`%${String(category).toLowerCase()}%`, `%${String(category).toLowerCase()}%`);
    }
    // productTag filtra por etiquetas operativas internas de Wijutopia
    // (por ejemplo: En vitrina, Restock prioritario o Preventa Wijutopia).
    if (productTag) {
        where.push('product_tag = ?');
        params.push(productTag);
    }
    if (releaseStatus) {
        where.push('release_status = ?');
        params.push(releaseStatus);
    }
    if (availability === 'available') {
        where.push('stock > 0');
    }
    if (availability === 'soldout') {
        where.push('stock = 0');
    }
    if (search) {
        where.push('(LOWER(name) LIKE ? OR LOWER(description) LIKE ?)');
        params.push(`%${String(search).toLowerCase()}%`, `%${String(search).toLowerCase()}%`);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    try {
        const [rows] = await db.execute(
            `SELECT id, name, description, price, stock, image_url, category, product_tag, release_status, preorder_available, created_at FROM products ${whereClause} ORDER BY created_at DESC`,
            params
        );
        return res.status(200).json({ success: true, data: rows.map(normalizeProduct) });
    } catch (error) {
        console.error('Error al listar productos:', error.message);
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};

const getProductById = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT id, name, description, price, stock, image_url, category, product_tag, release_status, preorder_available, created_at FROM products WHERE id = ?', [req.params.id]);
        if (!rows.length) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado.' });
        }
        return res.status(200).json({ success: true, data: normalizeProduct(rows[0]) });
    } catch (error) {
        console.error('Error al obtener producto:', error.message);
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};

// Al crear producto se guarda la etiqueta interna product_tag; si no llega una imagen,
// se genera un placeholder para evitar tarjetas vacías en las páginas por juego/rama.
const createProduct = async (req, res) => {
    const { name, description = null, price, stock, image_url, category = 'TCG', product_tag = 'En vitrina', release_status = 'catalogo', preorder_available = false } = req.body;

    try {
        const finalImageUrl = image_url || await fetchPlaceholderImage();
        const [result] = await db.execute(
            'INSERT INTO products (name, description, price, stock, image_url, category, product_tag, release_status, preorder_available) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, description, price, stock, finalImageUrl, category, product_tag, release_status, preorder_available]
        );
        const [createdRows] = await db.execute('SELECT id, name, description, price, stock, image_url, category, product_tag, release_status, preorder_available, created_at FROM products WHERE id = ?', [result.insertId]);
        return res.status(201).json({ success: true, data: normalizeProduct(createdRows[0]) });
    } catch (error) {
        console.error('Error al crear producto:', error.message);
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};

const updateProduct = async (req, res) => {
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);

    try {
        const [existing] = await db.execute('SELECT id FROM products WHERE id = ?', [req.params.id]);
        if (!existing.length) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado.' });
        }

        const assignments = fields.map((field) => `${field} = ?`).join(', ');
        await db.execute(`UPDATE products SET ${assignments} WHERE id = ?`, [...values, req.params.id]);
        const [updatedRows] = await db.execute('SELECT id, name, description, price, stock, image_url, category, product_tag, release_status, preorder_available, created_at FROM products WHERE id = ?', [req.params.id]);
        return res.status(200).json({ success: true, data: normalizeProduct(updatedRows[0]) });
    } catch (error) {
        console.error('Error al actualizar producto:', error.message);
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const [result] = await db.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
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
