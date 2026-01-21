// User model and user table creation for chatPro backend
const pool = require('./db');

async function createUserTable() {
  const sql = `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;
  const conn = await pool.getConnection();
  await conn.query(sql);
  conn.release();
}

async function createUser({ name, email, password }) {
  const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
  const conn = await pool.getConnection();
  const [result] = await conn.execute(sql, [name, email, password]);
  conn.release();
  return result.insertId;
}

async function getUserByEmail(email) {
  const sql = 'SELECT * FROM users WHERE email = ?';
  const conn = await pool.getConnection();
  const [rows] = await conn.execute(sql, [email]);
  conn.release();
  return rows[0];
}

module.exports = {
  createUserTable,
  createUser,
  getUserByEmail
};
