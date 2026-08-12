const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

const { apiLimiter } = require('./middleware/rateLimiter');
const { requestLogger } = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Import Route Handlers
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// 1. Task 9 & 13: Apply Helmet Security Headers & Content Security Policy (CSP)
app.use(helmet());

// 2. Task 10: Configure CORS with Environment Origins
const envOrigins = process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000';
const allowedOrigins = envOrigins.split(',').map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like Postman, mobile apps, curl) or if in allowedOrigins
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    const corsError = new Error('CORS Policy: Request from origin ' + origin + ' is blocked');
    corsError.status = 403;
    return callback(corsError);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body Parser with payload limit
app.use(express.json({ limit: '10kb' }));

// 3. Task 11: General API Rate Limiting
app.use(apiLimiter);

// 4. Task 14: Security Request Logging
app.use(requestLogger);

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, status: 'API is running securely' });
});

// Mount Feature API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

// 5. Task 12: 404 & Centralized Error Handlers
app.use(notFound);
app.use(errorHandler);

module.exports = app;
