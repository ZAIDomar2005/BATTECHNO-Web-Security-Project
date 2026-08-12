const { z } = require('zod');

// 1. User Registration Schema (STRICTLY enforces customer role for public registration)
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long').max(100, 'Name cannot exceed 100 characters'),
  email: z.string().email('Invalid email address format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .max(100, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(['customer'], {
    errorMap: () => ({ message: 'Public registration is restricted to customer role. Admin role registration is forbidden.' })
  }).optional().default('customer')
});

// 2. User Login Schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required')
});

// 3. Product Schema
const productSchema = z.object({
  category_id: z.number({ invalid_type_error: 'category_id must be a number' }).positive('category_id must be positive'),
  name: z.string().min(2, 'Product name is required').max(150, 'Product name cannot exceed 150 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  price: z.number({ invalid_type_error: 'Price must be a number' }).gt(0, 'Price must be greater than zero'),
  stock_quantity: z.number({ invalid_type_error: 'stock_quantity must be a number' })
    .int('stock_quantity must be an integer')
    .min(0, 'stock_quantity cannot be negative')
});

// 4. ID Parameter Schema (Check for numeric IDs)
const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a positive integer numeric value')
});

module.exports = {
  registerSchema,
  loginSchema,
  productSchema,
  idParamSchema
};
