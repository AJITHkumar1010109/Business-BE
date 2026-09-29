const bcrypt = require('bcryptjs');
const User = require('../models/User');

const login = async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password)
    return res.status(400).json({ message: 'Phone and password are required' });

  const cleanPhone = phone.replace(/\s+/g, '');
  const user = await User.findOne({ phone: cleanPhone });
  if (!user) return res.status(401).json({ message: 'Invalid phone number or password' });
  if (!bcrypt.compareSync(password, user.password))
    return res.status(401).json({ message: 'Invalid phone number or password' });

  res.json({ message: 'Login successful', userId: user._id, phone: user.phone, username: user.username || '' });
};

const getUser = async (req, res) => {
  const user = await User.findById(req.params.userId).select('phone username menu_pin');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ id: user._id, phone: user.phone, username: user.username, has_menu_pin: !!user.menu_pin });
};

const changeUsername = async (req, res) => {
  const { userId, username } = req.body;
  if (!userId || !username) return res.status(400).json({ message: 'All fields are required' });
  await User.findByIdAndUpdate(userId, { username: username.trim() });
  res.json({ message: 'Username updated successfully' });
};

const changePassword = async (req, res) => {
  const { phone, newPassword } = req.body;
  if (!phone || !newPassword)
    return res.status(400).json({ message: 'All fields are required' });

  const user = await User.findOne({ phone });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const hashed = bcrypt.hashSync(newPassword, 10);
  await User.findByIdAndUpdate(user._id, { password: hashed });
  res.json({ message: 'Password updated successfully' });
};

const verifyMenuPin = async (req, res) => {
  const { userId, pin } = req.body;
  if (!userId || !pin) return res.status(400).json({ message: 'All fields are required' });
  const user = await User.findById(userId).select('menu_pin');
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (!user.menu_pin) return res.status(403).json({ message: 'No PIN set' });
  if (!bcrypt.compareSync(pin, user.menu_pin)) return res.status(401).json({ message: 'Incorrect PIN' });
  res.json({ message: 'PIN verified' });
};

const setMenuPin = async (req, res) => {
  const { userId, pin } = req.body;
  if (!userId || !pin || pin.length !== 6) return res.status(400).json({ message: 'A 6-digit PIN is required' });
  const hashed = bcrypt.hashSync(pin, 10);
  await User.findByIdAndUpdate(userId, { menu_pin: hashed });
  res.json({ message: 'PIN set successfully' });
};

module.exports = { login, changePassword, getUser, changeUsername, verifyMenuPin, setMenuPin };
