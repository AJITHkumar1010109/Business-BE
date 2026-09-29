const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phone: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  username: { type: String, default: null },
  menu_pin: { type: String, default: null },
});

module.exports = mongoose.model('User', userSchema);
