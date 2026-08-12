const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 BATTECHNO Web Security REST API Server running on port ${PORT}`);
  console.log(`🔒 Security Protections Active: Helmet Headers, CORS, RateLimiter, JWT Auth, Parameterized Queries, Zod Validation.`);
});

// Handle unhandled promise rejections gracefully
process.on('unhandledRejection', (err) => {
  console.error('[UNHANDLED REJECTION]:', err.message);
  server.close(() => process.exit(1));
});
