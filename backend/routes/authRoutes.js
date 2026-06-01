const express = require('express');
const { generateCaptcha } = require('../controllers/captchaController');
const { login, register } = require('../controllers/authController');

const router = express.Router();

router.get('/captcha', generateCaptcha);
router.post('/register', register);
router.post('/login', login);

module.exports = router;
