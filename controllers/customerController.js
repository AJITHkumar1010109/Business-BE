const Customer = require('../models/Customer');

const getAll = async (req, res) => {
  const customers = await Customer.find().sort({ created_at: -1 });
  res.json(customers);
};

const create = async (req, res) => {
  const { name, email, phone, native, district, address, amount_received, amount_balance, total_amount, status } = req.body;
  if (!name || !email || !phone || !native || !district || !address || amount_received === undefined || amount_balance === undefined || total_amount === undefined)
    return res.status(400).json({ message: 'All fields except status are required' });
  const customer = await Customer.create({ name, email, phone, native, district, address, amount_received, amount_balance, total_amount, status: status || 'Pending' });
  res.json({ message: 'Customer created', id: customer._id });
};

const update = async (req, res) => {
  const { name, email, phone, native, district, address, amount_received, amount_balance, total_amount, status } = req.body;
  if (!name || !email || !phone || !native || !district || !address || amount_received === undefined || amount_balance === undefined || total_amount === undefined)
    return res.status(400).json({ message: 'All fields except status are required' });
  await Customer.findByIdAndUpdate(req.params.id, { name, email, phone, native, district, address, amount_received, amount_balance, total_amount, status: status || 'Pending' });
  res.json({ message: 'Customer updated' });
};

const remove = async (req, res) => {
  await Customer.findByIdAndDelete(req.params.id);
  res.json({ message: 'Customer deleted' });
};

module.exports = { getAll, create, update, remove };
