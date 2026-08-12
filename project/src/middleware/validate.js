const { z } = require('zod');

/**
 * Generic validator middleware using Zod schemas
 * Always returns HTTP 400 Bad Request on validation failures
 */
const validate = (schema, source = 'body') => (req, res, next) => {
  try {
    const dataToValidate = req[source];
    const parsed = schema.parse(dataToValidate);
    req[source] = parsed; // Replace with sanitized/parsed data
    next();
  } catch (err) {
    let formattedErrors = [];

    if (err.issues && Array.isArray(err.issues)) {
      formattedErrors = err.issues.map(e => ({
        field: Array.isArray(e.path) ? e.path.join('.') : 'body',
        message: e.message
      }));
    } else if (err.errors && Array.isArray(err.errors)) {
      formattedErrors = err.errors.map(e => ({
        field: Array.isArray(e.path) ? e.path.join('.') : 'body',
        message: e.message
      }));
    } else {
      formattedErrors = [{ field: 'body', message: err.message || 'Validation failed' }];
    }

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors
    });
  }
};

module.exports = validate;
