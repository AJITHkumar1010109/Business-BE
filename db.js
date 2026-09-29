const envFile = process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.local';
require('dotenv').config({ path: envFile });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    const exists = await User.findOne({ phone: '9884573714' });
    if (!exists) {
      const hashed = bcrypt.hashSync('12345678', 10);
      await User.create({ phone: '9884573714', password: hashed, username: 'Admin' });
      console.log('Default user seeded');
    }
  })
  .catch((err) => { console.error('MongoDB connection error:', err); process.exit(1); });

module.exports = mongoose;
