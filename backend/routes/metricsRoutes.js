const express = require('express');
const { getDashboardMetrics, trackClickEvent } = require('../controllers/metricsController');
const { authenticate, authorizeRole } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/track', trackClickEvent);
router.get('/dashboard', authenticate, authorizeRole('empleado'), getDashboardMetrics);

module.exports = router;
