const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validators');
const authenticate = require('../middleware/authenticate');
const { loginLimiter } = require('../middleware/rateLimiter');

// Public auth routes
router.post('/register', validate(registerSchema), register);
router.post('/login', loginLimiter, validate(loginSchema), login);

// Protected auth route
router.get('/me', authenticate, getMe);

module.exports = router;
