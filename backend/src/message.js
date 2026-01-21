// Message model and message table creation for chatPro backend
const pool = require('./db');

async function createMessageTable() {
  const sql = `CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read TINYINT(1) DEFAULT 0,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
  )`;
  const conn = await pool.getConnection();
  await conn.query(sql);
  conn.release();
}

async function createMessage({ sender_id, receiver_id, content }) {
  const sql = 'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)';
  const conn = await pool.getConnection();
  const [result] = await conn.execute(sql, [sender_id, receiver_id, content]);
  conn.release();
  return result.insertId;
}

async function markMessagesAsRead(sender_id, receiver_id) {
  const sql = 'UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ? AND is_read = 0';
  const conn = await pool.getConnection();
  await conn.execute(sql, [sender_id, receiver_id]);
  conn.release();
}

async function getMessagesBetweenUsers(user1, user2) {
  const sql = `SELECT *, DATE_FORMAT(created_at, '%d/%m/%Y %H:%i') as formatted_time FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY created_at ASC`;
  const conn = await pool.getConnection();
  const [rows] = await conn.execute(sql, [user1, user2, user2, user1]);
  conn.release();
  return rows;
}

module.exports = {
  createMessageTable,
  createMessage,
  getMessagesBetweenUsers,
  markMessagesAsRead
};
