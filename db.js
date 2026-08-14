const envFile = process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.local';
require('dotenv').config({ path: envFile });
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

// First connect without DB to create it if not exists
const init = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

init.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`, (err) => {
  if (err) throw err;
  console.log(`Database "${process.env.DB_NAME}" ready`);
  init.end();
});

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) throw err;
  console.log('MySQL connected');

  db.query(`CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(100) DEFAULT NULL
  )`, (err) => {
    if (err) throw err;

    // Add username column if it doesn't exist (for existing tables)
    db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(100) DEFAULT NULL`, () => {});
    db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS menu_pin VARCHAR(255) DEFAULT NULL`, () => {});

  db.query(`CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(10),
    native VARCHAR(100),
    district VARCHAR(100),
    address TEXT,
    amount_received DECIMAL(10,2) DEFAULT 0,
    amount_balance DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) DEFAULT 0,
    status ENUM('Completed','Pending') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => { if (err) throw err; });

  db.query(`ALTER TABLE customers
    ADD COLUMN IF NOT EXISTS native VARCHAR(100),
    ADD COLUMN IF NOT EXISTS district VARCHAR(100),
    ADD COLUMN IF NOT EXISTS address TEXT,
    ADD COLUMN IF NOT EXISTS amount_received DECIMAL(10,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS amount_balance DECIMAL(10,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2) DEFAULT 0`, () => {});

    const phone = '9884573714';
    db.query('SELECT id FROM users WHERE phone = ?', [phone], (err, rows) => {
      if (err) throw err;
      if (rows.length === 0) {
        const hashed = bcrypt.hashSync('123456', 10);
        db.query('INSERT INTO users (phone, password, username) VALUES (?, ?, ?)', [phone, hashed, 'Admin']);
        console.log('Default user seeded');
      }
    });
  });
});

module.exports = db;
