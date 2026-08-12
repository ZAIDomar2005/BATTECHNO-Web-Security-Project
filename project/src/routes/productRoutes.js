const express = require('express');
const router = express.Router();
const { createProduct, getProducts } = require('../controllers/productController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { productSchema } = require('../validators');

// Public route to view products
router.get('/', getProducts);

// Admin-only route to add products
router.post('/', authenticate, authorize('admin'), validate(productSchema), createProduct);

module.exports = router;
