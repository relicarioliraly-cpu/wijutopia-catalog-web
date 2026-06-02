const crypto = require('crypto');
const svgCaptcha = require('svg-captcha');

const getCipherConfig = () => ({
    key: Buffer.from(process.env.CAPTCHA_KEY || '8e9fb74ab1a89f81a7199c09930fca611a2f1b49e19dcaef18a66bc2df7f2931', 'hex'),
    iv: Buffer.from(process.env.CAPTCHA_IV || '4b3d2b7e192a013e8d9a2a3bc5d6a7ef', 'hex')
});

const encryptCaptcha = (payload) => {
    const { key, iv } = getCipherConfig();
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(JSON.stringify(payload), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
};

const decryptCaptcha = (token) => {
    const { key, iv } = getCipherConfig();
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(token, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
};

const generateCaptcha = (req, res) => {
    try {
        const captcha = svgCaptcha.create({
            size: 6,
            noise: 3,
            color: true,
            background: '#0F0F12',
            width: 240,
            height: 80,
            charPreset: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
        });

        const expiry = Date.now() + 5 * 60 * 1000;
        const captchaToken = encryptCaptcha({ text: captcha.text, expiry });
        const captchaDataUrl = `data:image/svg+xml;base64,${Buffer.from(captcha.data).toString('base64')}`;

        return res.status(200).json({
            success: true,
            captchaImage: captchaDataUrl,
            captchaToken
        });
    } catch (error) {
        console.error('Error al generar captcha:', error.message);
        return res.status(500).json({ success: false, message: 'No se pudo generar el captcha.' });
    }
};

const verifyCaptcha = (captchaToken, captchaAnswer) => {
    try {
        const payload = decryptCaptcha(captchaToken);
        return payload.expiry >= Date.now() && String(payload.text).toUpperCase() === String(captchaAnswer || '').toUpperCase();
    } catch (error) {
        return false;
    }
};

module.exports = { generateCaptcha, verifyCaptcha };
