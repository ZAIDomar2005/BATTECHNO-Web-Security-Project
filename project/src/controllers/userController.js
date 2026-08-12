const { executeQuery } = require('../config/dbAdapter');
const { logSecurityEvent } = require('../middleware/logger');

// Get User By ID (Prevent IDOR)
const getUserById = async (req, res, next) => {
  try {
    const targetUserId = parseInt(req.params.id, 10);

    // IDOR Security Ownership Check: User can only view their own data unless they are Admin
    if (req.user.role !== 'admin' && req.user.id !== targetUserId) {
      logSecurityEvent('IDOR_ATTEMPT_USER_PROFILE', {
        requesterId: req.user.id,
        targetId: targetUserId
      });
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Access denied to requested user profile'
      });
    }

    // Execute safe Parameterized Query ($1)
    const result = await executeQuery(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [targetUserId]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    // Build an explicit response object as a second safety layer. This prevents
    // password_hash from leaking even if a database adapter returns extra fields.
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
  getUserById
};
