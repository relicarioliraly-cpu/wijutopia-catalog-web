const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Acceso denegado: Token ausente.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_desarrollo_local_wijutopia_123');
        req.user = decoded;
        return next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Token de autenticación inválido o expirado.' });
    }
};

const authorizeRole = (requiredRole) => (req, res, next) => {
    if (requiredRole && req.user?.role !== requiredRole) {
        return res.status(403).json({ success: false, message: 'Acceso prohibido: Privilegios insuficientes.' });
    }
    return next();
};

module.exports = { authenticate, authorizeRole };
