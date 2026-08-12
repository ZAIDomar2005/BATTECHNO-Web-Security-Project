const { executeQuery } = require('../config/dbAdapter');
const { logSecurityEvent } = require('../middleware/logger');

// Get Order By ID (Prevent IDOR)
const getOrderById = async (req, res, next) => {
  try {
    const orderId = parseInt(req.params.id, 10);

    // Fetch order safely using Parameterized Query ($1)
    const result = await executeQuery('SELECT * FROM orders WHERE id = $1', [orderId]);
    const order = result.rows[0];

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // IDOR Check: User can only access their own order unless Admin
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      logSecurityEvent('IDOR_ATTEMPT_UNOWNED_ORDER', {
        requesterId: req.user.id,
        orderId: orderId,
        orderOwnerId: order.user_id
      });
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view this order'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getOrderById
};
