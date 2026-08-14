const db = require('../db');

const getAll = (req, res) => {
  db.query('SELECT * FROM customers ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    res.json(rows);
  });
};

const create = (req, res) => {
  const { name, email, phone, native, district, address, amount_received, amount_balance, total_amount, status } = req.body;
  if (!name || !email || !phone || !native || !district || !address || amount_received === undefined || amount_balance === undefined || total_amount === undefined)
    return res.status(400).json({ message: 'All fields except status are required' });
  db.query(
    'INSERT INTO customers (name, email, phone, native, district, address, amount_received, amount_balance, total_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [name, email, phone, native, district, address, amount_received, amount_balance, total_amount, status || 'Pending'],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      res.json({ message: 'Customer created', id: result.insertId });
    }
  );
};

const update = (req, res) => {
  const { id } = req.params;
  const { name, email, phone, native, district, address, amount_received, amount_balance, total_amount, status } = req.body;
  if (!name || !email || !phone || !native || !district || !address || amount_received === undefined || amount_balance === undefined || total_amount === undefined)
    return res.status(400).json({ message: 'All fields except status are required' });
  db.query(
    'UPDATE customers SET name=?, email=?, phone=?, native=?, district=?, address=?, amount_received=?, amount_balance=?, total_amount=?, status=? WHERE id=?',
    [name, email, phone, native, district, address, amount_received, amount_balance, total_amount, status || 'Pending', id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      res.json({ message: 'Customer updated' });
    }
  );
};

const remove = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM customers WHERE id=?', [id], (err) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    res.json({ message: 'Customer deleted' });
  });
};

module.exports = { getAll, create, update, remove };
