const { Pool } = require('pg');
require('dotenv').config();

// Ensure DATABASE_URL is loaded from environment
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ CRITICAL SECURITY WARNING: DATABASE_URL is not defined in environment variables!');
}

const pool = new Pool({
  connectionString,
  ssl: connectionString && connectionString.includes('neon.tech')
    ? { rejectUnauthorized: true }
    : false
});

// Helper to execute parameterized queries safely
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', { text, duration, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
};

module.exports = {
  pool,
  query
};
