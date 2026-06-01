const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { verifyCaptcha } = require('./captchaController');

const signToken = (user) => jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET || 'secret_desarrollo_local_wijutopia_123',
    { expiresIn: '8h' }
);

const ensureAdminUser = async () => {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@wijutopia.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'WijuAdmin2026_TrujilloTcg!';
    const [rows] = await db.execute('SELECT id FROM users WHERE email = ?', [adminEmail]);
    if (!rows.length) {
        const passwordHash = await bcrypt.hash(adminPassword, 12);
        await db.execute(
            'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
            ['Administrador Wijutopia', adminEmail, passwordHash, 'empleado']
        );
    }
};

const register = async (req, res) => {
    const { name, email, password, captchaToken, captchaAnswer } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Nombre, correo y contraseña son obligatorios.' });
    }
    if (!verifyCaptcha(captchaToken, captchaAnswer)) {
        return res.status(400).json({ success: false, message: 'Captcha inválido o expirado.' });
    }

    try {
        const passwordHash = await bcrypt.hash(password, 12);
        const [result] = await db.execute(
            'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [name, email, passwordHash, 'cliente']
        );
        const user = { id: result.insertId, name, email, role: 'cliente' };
        return res.status(201).json({ success: true, token: signToken(user), user });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: 'El correo ya está registrado.' });
        }
        console.error('Error al registrar usuario:', error.message);
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Correo y contraseña son obligatorios.' });
    }

    try {
        await ensureAdminUser();
        const [rows] = await db.execute('SELECT id, name, email, password_hash, role FROM users WHERE email = ?', [email]);
        if (!rows.length) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas.' });
        }
        const user = rows[0];
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas.' });
        }
        const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role };
        return res.status(200).json({ success: true, token: signToken(safeUser), user: safeUser });
    } catch (error) {
        console.error('Error al iniciar sesión:', error.message);
        return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
};

module.exports = { register, login };
