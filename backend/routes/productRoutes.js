const express = require('express');
const productController = require('../controllers/productController');
const { authenticate, authorizeRole } = require('../middlewares/authMiddleware');
const { partialProductSchema, productSchema, validateProduct } = require('../validators/productValidator');

const router = express.Router();

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post('/', authenticate, authorizeRole('empleado'), validateProduct(productSchema), productController.createProduct);
router.put('/:id', authenticate, authorizeRole('empleado'), validateProduct(partialProductSchema), productController.updateProduct);
router.delete('/:id', authenticate, authorizeRole('empleado'), productController.deleteProduct);

module.exports = router;
