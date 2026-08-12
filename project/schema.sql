-- PostgreSQL Schema Creation & Seed Script for Neon Database
-- BATTECHNO Web Security Fundamentals Task

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  category_id INT REFERENCES categories(id) ON DELETE SET NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  stock_quantity INT NOT NULL CHECK (stock_quantity >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending',
  total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Seed Initial Users (Admin & Customer with verified bcrypt hashes)
-- Passwords: Admin@123456 and Customer@123456
INSERT INTO users (name, email, password_hash, role) 
VALUES 
  ('Admin User', 'admin@battechno.com', '$2b$10$PkkoK4rf1cP.2ZVJPylpqOo8pNgGhjPho5q8kplER9OoIcJ/K2Q82', 'admin'),
  ('Customer User', 'customer@battechno.com', '$2b$10$rjwza6dcnJg2FiLKsosAMuMO/npdqVkIEv/NjViquw.bVjZ0sj4Ty', 'customer')
ON CONFLICT (email) DO NOTHING;

-- 3. Seed Initial Category & Product
INSERT INTO categories (id, name) VALUES (1, 'Electronics') ON CONFLICT DO NOTHING;

INSERT INTO products (category_id, name, description, price, stock_quantity)
VALUES (1, 'Encrypted Hard Drive', '1TB Hardware Encrypted Drive', 199.99, 25)
ON CONFLICT DO NOTHING;

-- 4. Seed Initial Order
INSERT INTO orders (user_id, status, total)
VALUES (2, 'completed', 199.99)
ON CONFLICT DO NOTHING;
