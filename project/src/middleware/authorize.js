/**
 * Role-Based Access Control (RBAC) Authorization Middleware
 * @param  {...string} allowedRoles Roles allowed to access the endpoint (e.g., 'admin')
 */
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Insufficient permissions to perform this action'
    });
  }

  next();
};

module.exports = authorize;
