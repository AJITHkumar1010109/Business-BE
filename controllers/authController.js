const bcrypt = require('bcryptjs');
const db = require('../db');

const login = (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password)
    return res.status(400).json({ message: 'Phone and password are required' });

  const cleanPhone = phone.replace(/\s+/g, '');
  db.query('SELECT * FROM users WHERE phone = ?', [cleanPhone], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (rows.length === 0) return res.status(401).json({ message: 'Invalid phone number or password' });

    const user = rows[0];
    if (!bcrypt.compareSync(password, user.password))
      return res.status(401).json({ message: 'Invalid phone number or password' });

    res.json({ message: 'Login successful', userId: user.id, phone: user.phone, username: user.username || '' });
  });
};

const getUser = (req, res) => {
  const { userId } = req.params;
  db.query('SELECT id, phone, username, menu_pin FROM users WHERE id = ?', [userId], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    const user = rows[0];
    res.json({ id: user.id, phone: user.phone, username: user.username, has_menu_pin: !!user.menu_pin });
  });
};

const changeUsername = (req, res) => {
  const { userId, username } = req.body;
  if (!userId || !username) return res.status(400).json({ message: 'All fields are required' });
  db.query('UPDATE users SET username = ? WHERE id = ?', [username.trim(), userId], (err) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    res.json({ message: 'Username updated successfully' });
  });
};

const changePassword = (req, res) => {
  const { phone, newPassword } = req.body;
  if (!phone || !newPassword)
    return res.status(400).json({ message: 'All fields are required' });

  db.query('SELECT * FROM users WHERE phone = ?', [phone], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });

    const hashed = bcrypt.hashSync(newPassword, 10);
    db.query('UPDATE users SET password = ? WHERE phone = ?', [hashed, phone], (err) => {
      if (err) return res.status(500).json({ message: 'Failed to update password' });
      res.json({ message: 'Password updated successfully' });
    });
  });
};

const verifyMenuPin = (req, res) => {
  const { userId, pin } = req.body;
  if (!userId || !pin) return res.status(400).json({ message: 'All fields are required' });
  db.query('SELECT menu_pin FROM users WHERE id = ?', [userId], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    const stored = rows[0].menu_pin;
    if (!stored) return res.status(403).json({ message: 'No PIN set' });
    if (!bcrypt.compareSync(pin, stored)) return res.status(401).json({ message: 'Incorrect PIN' });
    res.json({ message: 'PIN verified' });
  });
};

const setMenuPin = (req, res) => {
  const { userId, pin } = req.body;
  if (!userId || !pin || pin.length !== 6) return res.status(400).json({ message: 'A 6-digit PIN is required' });
  const hashed = bcrypt.hashSync(pin, 10);
  db.query('UPDATE users SET menu_pin = ? WHERE id = ?', [hashed, userId], (err) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    res.json({ message: 'PIN set successfully' });
  });
};

module.exports = { login, changePassword, getUser, changeUsername, verifyMenuPin, setMenuPin };
