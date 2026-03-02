const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection on startup
(async () => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT 1 AS connected');
    console.log('✅ AIVEN MySQL Connected:', rows[0]);
    conn.release();
  } catch (err) {
    console.error('❌ DB Connection Failed:', err.message);
  }
})();

module.exports = pool;
