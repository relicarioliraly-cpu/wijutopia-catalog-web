const Joi = require('joi');

const productSchema = Joi.object({
    name: Joi.string().min(3).max(255).required().messages({
        'any.required': 'El nombre del producto es obligatorio para el registro.',
        'string.min': 'El nombre debe poseer como mínimo 3 caracteres de longitud.'
    }),
    description: Joi.string().max(2000).allow('', null),
    price: Joi.number().precision(2).positive().required().messages({
        'number.positive': 'El precio establecido debe ser estrictamente superior a cero.',
        'any.required': 'El precio de mercado es mandatorio.'
    }),
    stock: Joi.number().integer().min(0).required().messages({
        'number.min': 'La cantidad de existencias no puede ser menor a cero unidades.',
        'any.required': 'El stock disponible debe ser especificado.'
    }),
    image_url: Joi.string().uri().allow('', null),
    category: Joi.string().max(120).allow('', null),
    marketplace_tag: Joi.string().valid('TCGPlayer', 'Cardmarket', 'TradingCardMint', 'Local Wijutopia').default('Local Wijutopia'),
    release_status: Joi.string().valid('catalogo', 'lanzamiento').default('catalogo'),
    preorder_available: Joi.boolean().default(false)
});

const partialProductSchema = productSchema.fork(['name', 'price', 'stock'], (schema) => schema.optional()).min(1);

const validateProduct = (schema = productSchema) => (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
        return res.status(400).json({
            success: false,
            errors: error.details.map((err) => err.message)
        });
    }
    req.body = value;
    return next();
};

module.exports = {
    productSchema,
    partialProductSchema,
    validateProduct
};
