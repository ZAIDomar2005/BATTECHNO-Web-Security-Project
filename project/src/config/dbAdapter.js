const { pool } = require('./database');
const bcrypt = require('bcryptjs');

// In-Memory fallback store if PostgreSQL is unreachable locally
const memoryStore = {
  users: [
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@battechno.com',
      password_hash: '$2b$10$PkkoK4rf1cP.2ZVJPylpqOo8pNgGhjPho5q8kplER9OoIcJ/K2Q82', // Admin@123456
      role: 'admin',
      created_at: new Date()
    },
    {
      id: 2,
      name: 'Customer User',
      email: 'customer@battechno.com',
      password_hash: '$2b$10$rjwza6dcnJg2FiLKsosAMuMO/npdqVkIEv/NjViquw.bVjZ0sj4Ty', // Customer@123456
      role: 'customer',
      created_at: new Date()
    }
  ],
  categories: [
    { id: 1, name: 'Electronics', description: 'Gadgets and devices' }
  ],
  products: [
    { id: 1, category_id: 1, name: 'Security Camera', description: 'HD camera', price: 99.99, stock_quantity: 10 }
  ],
  orders: [
    { id: 1, user_id: 2, total_amount: 99.99, status: 'completed', created_at: new Date() }
  ]
};

let isPgConnected = false;

// Check connection to PostgreSQL on startup
pool.connect()
  .then(client => {
    isPgConnected = true;
    console.log('✅ Successfully connected to PostgreSQL Database.');
    client.release();
    initPgTables();
  })
  .catch(err => {
    isPgConnected = false;
    console.log('⚠️ PostgreSQL DB connection offline. Using Secure In-Memory Data Store fallback for local testing.');
  });

async function initPgTables() {
  try {
    await pool.query(`
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
        name VARCHAR(100) NOT NULL,
        description TEXT
      );

      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        category_id INT REFERENCES categories(id) ON DELETE SET NULL,
        name VARCHAR(150) NOT NULL,
        description TEXT,
        price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
        stock_quantity INT NOT NULL CHECK (stock_quantity >= 0)
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        total_amount NUMERIC(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      INSERT INTO users (name, email, password_hash, role)
      VALUES 
        ('Admin User', 'admin@battechno.com', '$2b$10$PkkoK4rf1cP.2ZVJPylpqOo8pNgGhjPho5q8kplER9OoIcJ/K2Q82', 'admin'),
        ('Customer User', 'customer@battechno.com', '$2b$10$rjwza6dcnJg2FiLKsosAMuMO/npdqVkIEv/NjViquw.bVjZ0sj4Ty', 'customer')
      ON CONFLICT (email) DO NOTHING;
    `);
    console.log('✅ PostgreSQL Schema & Seed Initialized Successfully.');
  } catch (err) {
    console.error('Error initializing PG tables:', err.message);
  }
}

/**
 * Execute query safely using Parameterized Query pattern ($1, $2)
 */
async function executeQuery(text, params = []) {
  if (isPgConnected) {
    return await pool.query(text, params);
  }

  // --- In-Memory Fallback Evaluator ---
  const normalizedText = text.trim().toLowerCase();

  // 1. SELECT user by email
  if (normalizedText.includes('select') && normalizedText.includes('from users where email = $1')) {
    const email = params[0];
    const user = memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
  }

  // 2. SELECT user by id
  if (normalizedText.includes('select') && normalizedText.includes('from users where id = $1')) {
    const id = parseInt(params[0], 10);
    const user = memoryStore.users.find(u => u.id === id);
    if (!user) return { rows: [], rowCount: 0 };

    // Respect safe projected user queries in the local fallback as PostgreSQL does.
    const isSafeProjection = normalizedText.includes('select id, name, email, role, created_at');
    const row = isSafeProjection
      ? { id: user.id, name: user.name, email: user.email, role: user.role, created_at: user.created_at }
      : user;
    return { rows: [row], rowCount: 1 };
  }

  // 3. INSERT user (Register)
  if (normalizedText.includes('insert into users')) {
    const [name, email, password_hash, role = 'customer'] = params;
    const existing = memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      const err = new Error('duplicate key value violates unique constraint "users_email_key"');
      err.code = '23505';
      throw err;
    }
    const newUser = {
      id: memoryStore.users.length + 1,
      name,
      email,
      password_hash,
      role: 'customer', // Always customer for public registration
      created_at: new Date()
    };
    memoryStore.users.push(newUser);
    return { rows: [newUser], rowCount: 1 };
  }

  // 4. INSERT product
  if (normalizedText.includes('insert into products')) {
    const [category_id, name, description, price, stock_quantity] = params;
    const newProduct = {
      id: memoryStore.products.length + 1,
      category_id: parseInt(category_id, 10) || 1,
      name,
      description,
      price: parseFloat(price),
      stock_quantity: parseInt(stock_quantity, 10)
    };
    memoryStore.products.push(newProduct);
    return { rows: [newProduct], rowCount: 1 };
  }

  // 5. SELECT all products
  if (normalizedText.includes('select') && normalizedText.includes('from products')) {
    return { rows: memoryStore.products, rowCount: memoryStore.products.length };
  }

  // 6. SELECT order by id
  if (normalizedText.includes('select') && normalizedText.includes('from orders where id = $1')) {
    const id = parseInt(params[0], 10);
    const order = memoryStore.orders.find(o => o.id === id);
    return { rows: order ? [order] : [], rowCount: order ? 1 : 0 };
  }

  return { rows: [], rowCount: 0 };
}

module.exports = {
  executeQuery,
  isPgConnected: () => isPgConnected
};
