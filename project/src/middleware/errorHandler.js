/**
 * Centralized Error Handling Middleware
 * Prevents Stack Trace and internal database details from leaking to clients
 */
const errorHandler = (err, req, res, next) => {
  // Log error details internally for developers (never send to user)
  console.error('[SECURITY LOG - ERROR INTERNAL]:', {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  const statusCode = err.status || err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Internal server error' : err.message
  });
};

module.exports = errorHandler;
