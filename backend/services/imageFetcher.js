const axios = require('axios');

const FALLBACK_IMAGE = 'https://picsum.photos/500/700';

const fetchPlaceholderImage = async () => {
    try {
        const response = await axios.get('https://picsum.photos/v2/list?page=1&limit=100', { timeout: 5000 });
        const images = Array.isArray(response.data) ? response.data : [];
        if (!images.length) {
            return FALLBACK_IMAGE;
        }
        const randomImage = images[Math.floor(Math.random() * images.length)];
        return randomImage.download_url || `https://picsum.photos/id/${randomImage.id}/500/700`;
    } catch (error) {
        console.error('Error al consumir la API externa de imágenes:', error.message);
        return FALLBACK_IMAGE;
    }
};

module.exports = { fetchPlaceholderImage };
