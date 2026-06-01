const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const startTime = process.hrtime.bigint();

    res.on('finish', () => {
        const durationInMs = Number(process.hrtime.bigint() - startTime) / 1e6;
        console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} (${durationInMs.toFixed(3)} ms) - IP: ${req.ip}`);
    });

    next();
};

module.exports = requestLogger;
