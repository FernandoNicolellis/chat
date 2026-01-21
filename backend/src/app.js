// Express app with login endpoint for chatPro backend
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createUserTable, getUserByEmail } = require('./user');
const { createMessageTable, createMessage, getMessagesBetweenUsers, markMessagesAsRead } = require('./message');
const authenticateToken = require('./auth');

const app = express();
app.use(bodyParser.json());

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Initialize tables
(async () => {
  await createUserTable();
  await createMessageTable();
})();

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const user = await getUserByEmail(email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});


// List all users (for chat) with unread count
app.get('/api/users', authenticateToken, async (req, res) => {
  const pool = require('./db');
  const conn = await pool.getConnection();
  const [users] = await conn.query('SELECT id, name, email FROM users WHERE id != ?', [req.user.id]);
  // Get unread count for each user
  const unreadCounts = {};
  const [rows] = await conn.query('SELECT sender_id, COUNT(*) as unread FROM messages WHERE receiver_id = ? AND is_read = 0 GROUP BY sender_id', [req.user.id]);
  rows.forEach(r => { unreadCounts[r.sender_id] = r.unread; });
  const usersWithUnread = users.map(u => ({ ...u, unread: unreadCounts[u.id] || 0 }));
  conn.release();
  res.json(usersWithUnread);
});

// Get chat messages with another user
app.get('/api/messages/:userId', authenticateToken, async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  if (!userId) return res.status(400).json({ error: 'Invalid userId' });
  // Mark messages as read (messages sent to current user by userId)
  await markMessagesAsRead(userId, req.user.id);
  const messages = await getMessagesBetweenUsers(req.user.id, userId);
  res.json(messages);
});

// Send a message to another user
app.post('/api/messages/:userId', authenticateToken, async (req, res) => {
  const receiver_id = parseInt(req.params.userId, 10);
  const { content } = req.body;
  if (!receiver_id || !content) return res.status(400).json({ error: 'receiver_id and content required' });
  await createMessage({ sender_id: req.user.id, receiver_id, content });
  res.json({ success: true });
});

module.exports = app;
