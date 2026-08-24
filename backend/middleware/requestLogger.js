/**
 * Global Request Logger Middleware
 * Logs incoming HTTP requests and response metrics on completion.
 * Format: [METHOD] [PATH] [STATUS] [RESPONSE-TIME ms]
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    const method = req.method;
    const path = req.originalUrl || req.url;
    const status = res.statusCode;

    console.log(`[${method}] [${path}] [${status}] [${responseTime}ms]`);
  });

  next();
};

module.exports = requestLogger;
