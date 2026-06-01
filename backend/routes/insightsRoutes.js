const express = require('express');
const {
    addWhatsappInterest,
    cancelRestock,
    getBusinessInsights,
    recordProductInterest,
    requestLaunch,
    requestRestock,
    submitCustomerResearch
} = require('../controllers/insightsController');
const { authenticate, authorizeRole } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/products/:id/interest', recordProductInterest);
router.post('/products/:id/restock', requestRestock);
router.post('/restock/:requestId/cancel', cancelRestock);
router.post('/launch-requests', requestLaunch);
router.post('/research', submitCustomerResearch);
router.post('/products/:id/whatsapp-interest', authenticate, authorizeRole('empleado'), addWhatsappInterest);
router.get('/dashboard', authenticate, authorizeRole('empleado'), getBusinessInsights);

module.exports = router;
