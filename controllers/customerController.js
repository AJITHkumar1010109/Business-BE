const Customer = require('../models/Customer');

const getAll = async (req, res) => {
  const customers = await Customer.find({ deleted: { $ne: true } }).sort({ created_at: -1 });
  res.json(customers);
};

const create = async (req, res) => {
  const { name, email, phone, native, district, address, amount_received, amount_balance, total_amount, status } = req.body;
  if (!name || !email || !phone || !native || !district || !address || amount_received === undefined || amount_balance === undefined || total_amount === undefined)
    return res.status(400).json({ message: 'All fields except status are required' });

  const payment_history = Number(amount_received) > 0
    ? [{ amount: Number(amount_received), note: 'Initial payment', received_at: new Date() }]
    : [];

  const customer = await Customer.create({ name, email, phone, native, district, address, amount_received, amount_balance, total_amount, status: status || 'Pending', payment_history });
  res.json({ message: 'Customer created', id: customer._id });
};

const update = async (req, res) => {
  const { name, email, phone, native, district, address, amount_received, amount_balance, total_amount, status } = req.body;
  if (!name || !email || !phone || !native || !district || !address || amount_received === undefined || amount_balance === undefined || total_amount === undefined)
    return res.status(400).json({ message: 'All fields except status are required' });

  const customer = await Customer.findById(req.params.id);
  if (!customer) return res.status(404).json({ message: 'Customer not found' });

  // Update initial payment entry amount if it exists, else add it
  const initialIdx = customer.payment_history.findIndex(p => p.note === 'Initial payment');
  if (Number(amount_received) > 0) {
    if (initialIdx !== -1) {
      customer.payment_history[initialIdx].amount = Number(amount_received);
    } else {
      customer.payment_history.unshift({ amount: Number(amount_received), note: 'Initial payment', received_at: customer.created_at });
    }
  } else if (initialIdx !== -1) {
    customer.payment_history.splice(initialIdx, 1);
  }

  // Recalculate amount_received as sum of all payment history
  const totalPaid = customer.payment_history.reduce((sum, p) => sum + Number(p.amount), 0);
  customer.name = name; customer.email = email; customer.phone = phone;
  customer.native = native; customer.district = district; customer.address = address;
  customer.total_amount = Number(total_amount);
  customer.amount_received = totalPaid;
  customer.amount_balance = Math.max(0, Number(total_amount) - totalPaid);
  customer.status = customer.amount_balance <= 0 ? 'Completed' : (status || 'Pending');

  await customer.save();
  res.json({ message: 'Customer updated' });
};

const remove = async (req, res) => {
  await Customer.findByIdAndUpdate(req.params.id, { deleted: true });
  res.json({ message: 'Customer deleted' });
};

const addPayment = async (req, res) => {
  const { amount, note } = req.body;
  if (!amount || isNaN(amount) || Number(amount) <= 0)
    return res.status(400).json({ message: 'Valid amount required' });

  const customer = await Customer.findById(req.params.id);
  if (!customer) return res.status(404).json({ message: 'Customer not found' });

  const newReceived = Number(customer.amount_received) + Number(amount);
  const newBalance = Number(customer.total_amount) - newReceived;

  customer.payment_history.push({ amount: Number(amount), note, received_at: new Date() });
  customer.amount_received = newReceived;
  customer.amount_balance = newBalance < 0 ? 0 : newBalance;
  if (newBalance <= 0) customer.status = 'Completed';

  await customer.save();
  res.json({ message: 'Payment recorded', customer });
};

module.exports = { getAll, create, update, remove, addPayment };
