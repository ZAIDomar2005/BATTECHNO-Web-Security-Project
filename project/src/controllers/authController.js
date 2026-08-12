const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/dbAdapter');
const { logSecurityEvent } = require('../middleware/logger');
require('dotenv').config();

// 1. Register User
const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'customer' } = req.body;

    // Check if user already exists using Parameterized Query ($1)
    const existing = await executeQuery('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email address is already registered'
      });
    }

    // Hash password securely with bcrypt
    const password_hash = await bcrypt.hash(password, 12);

    // Insert user using Parameterized Query ($1, $2, $3, $4)
    const result = await executeQuery(
      'INSERT INTO users(name, email, password_hash, role) VALUES($1, $2, $3, $4) RETURNING id, name, email, role, created_at',
      [name, email, password_hash, role]
    );

    const newUser = result.rows[0];

    logSecurityEvent('USER_REGISTERED', { userId: newUser.id, email: newUser.email, role: newUser.role });

    // Exclude password_hash completely from JSON response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        created_at: newUser.created_at
      }
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Email address is already registered'
      });
    }
    next(err);
  }
};

// 2. Login User
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Fetch user using Parameterized Query ($1)
    const result = await executeQuery('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      logSecurityEvent('FAILED_LOGIN_UNKNOWN_EMAIL', { email });
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      logSecurityEvent('FAILED_LOGIN_WRONG_PASSWORD', { userId: user.id, email: user.email });
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT Token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      const configError = new Error('JWT configuration is missing');
      configError.status = 500;
      throw configError;
    }
    const expiresIn = process.env.JWT_EXPIRES_IN || '1h';

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn }
    );

    logSecurityEvent('SUCCESSFUL_LOGIN', { userId: user.id, email: user.email });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

// 3. Get Me Profile (Protected)
const getMe = async (req, res, next) => {
  try {
    const result = await executeQuery('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    // Ensure password_hash is completely excluded from response
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at
    };

    res.status(200).json({
      success: true,
      data: safeUser
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getMe
};
