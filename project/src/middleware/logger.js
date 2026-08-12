/**
 * Safe Security Logger Middleware
 * Logs critical events WITHOUT storing passwords, JWT tokens, hashes, or secrets.
 */
const logSecurityEvent = (eventType, details = {}) => {
  const timestamp = new Date().toISOString();
  
  // Sanitize any potential sensitive data
  const { password, token, password_hash, database_url, ...safeDetails } = details;

  console.log(`[SECURITY EVENT LOG] [${timestamp}] [TYPE: ${eventType}]`, JSON.stringify(safeDetails));
};

const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Log unauthorized or forbidden requests for security audit
    if (res.statusCode === 401 || res.statusCode === 403 || res.statusCode === 429) {
      logSecurityEvent('UNAUTHORIZED_OR_BLOCKED_ATTEMPT', {
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        userId: req.user ? req.user.id : 'ANONYMOUS',
        ip: req.ip,
        duration: `${duration}ms`
      });
    }
  });

  next();
};

module.exports = {
  logSecurityEvent,
  requestLogger
};
