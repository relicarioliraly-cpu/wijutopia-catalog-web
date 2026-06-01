const { createCanvas } = require('canvas');
const crypto = require('crypto');

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
        const canvas = createCanvas(200, 80);
        const ctx = canvas.getContext('2d');
        const captchaText = crypto.randomBytes(3).toString('hex').toUpperCase();

        const grad = ctx.createLinearGradient(0, 0, 200, 80);
        grad.addColorStop(0, '#1E1E24');
        grad.addColorStop(1, '#0F0F12');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 200, 80);

        ctx.strokeStyle = '#DC2626';
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i += 1) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * 200, Math.random() * 80);
            ctx.lineTo(Math.random() * 200, Math.random() * 80);
            ctx.stroke();
        }

        ctx.fillStyle = '#FFB300';
        ctx.font = 'bold 30px sans-serif';
        for (let i = 0; i < captchaText.length; i += 1) {
            ctx.save();
            ctx.translate(30 + i * 25, 45 + (Math.random() - 0.5) * 15);
            ctx.rotate((Math.random() - 0.5) * 0.4);
            ctx.fillText(captchaText[i], 0, 0);
            ctx.restore();
        }

        const expiry = Date.now() + 5 * 60 * 1000;
        const captchaToken = encryptCaptcha({ text: captchaText, expiry });

        return res.status(200).json({
            success: true,
            captchaImage: canvas.toDataURL(),
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
