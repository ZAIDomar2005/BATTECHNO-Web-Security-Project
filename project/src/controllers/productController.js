const { executeQuery } = require('../config/dbAdapter');
const { logSecurityEvent } = require('../middleware/logger');

// 1. Create Product (Admin Only)
const createProduct = async (req, res, next) => {
  try {
    const { category_id, name, description, price, stock_quantity } = req.body;

    const result = await executeQuery(
      'INSERT INTO products (category_id, name, description, price, stock_quantity) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [category_id, name, description, price, stock_quantity]
    );

    logSecurityEvent('PRODUCT_CREATED_BY_ADMIN', {
      adminId: req.user.id,
      productId: result.rows[0].id,
      productName: name
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

// 2. Get All Products (Public / Customer)
const getProducts = async (req, res, next) => {
  try {
    const result = await executeQuery('SELECT * FROM products ORDER BY id DESC');
    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createProduct,
  getProducts
};
