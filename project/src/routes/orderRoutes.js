const express = require('express');
const router = express.Router();
const { getOrderById } = require('../controllers/orderController');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const { idParamSchema } = require('../validators');

// GET order by ID - Protected with authentication and ID parameter validation
router.get('/:id', authenticate, validate(idParamSchema, 'params'), getOrderById);

module.exports = router;
