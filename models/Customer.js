const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: String,
  phone: String,
  native: String,
  district: String,
  address: String,
  amount_received: { type: Number, default: 0 },
  amount_balance: { type: Number, default: 0 },
  total_amount: { type: Number, default: 0 },
  status: { type: String, enum: ['Completed', 'Pending'], default: 'Pending' },
  deleted: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Customer', customerSchema);
