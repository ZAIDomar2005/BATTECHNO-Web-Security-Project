/**
 * 404 Not Found Middleware for undefined API endpoints
 */
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Endpoint not found`
  });
};

module.exports = notFound;
