const dotenv = require('dotenv');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const requestLogger = require('./middlewares/requestLogger');
const authRoutes = require('./routes/authRoutes');
const metricsRoutes = require('./routes/metricsRoutes');
const insightsRoutes = require('./routes/insightsRoutes');
const productRoutes = require('./routes/productRoutes');
const db = require('./config/db');

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(requestLogger);

app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true, service: 'wijutopia-backend', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/insights', insightsRoutes);

app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Ruta no encontrada.' });
});

app.use((error, req, res, next) => {
    console.error('Error no controlado:', error.message);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
});

if (require.main === module) {
    db.connect()
        .then(() => {
            app.listen(port, () => {
                console.log(`API Wijutopia escuchando en http://localhost:${port}`);
            });
        })
        .catch((error) => {
            console.error('No se pudo conectar a MongoDB Atlas:', error.message);
            process.exit(1);
        });
}

module.exports = app;
