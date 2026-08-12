const express = require('express');
const router = express.Router();
const { getUserById } = require('../controllers/userController');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const { idParamSchema } = require('../validators');

// GET user by ID - Protected with authentication and ID parameter validation
router.get('/:id', authenticate, validate(idParamSchema, 'params'), getUserById);

module.exports = router;
