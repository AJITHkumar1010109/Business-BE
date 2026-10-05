const express = require('express');
const router = express.Router();
const { login, changePassword, getUser, changeUsername, verifyMenuPin, setMenuPin } = require('../controllers/authController');
const { getAll, create, update, remove, addPayment } = require('../controllers/customerController');

router.get('/', (req, res) => {
  res.json({ message: 'API route working' });
});

router.post('/login', login);
router.post('/change-password', changePassword);
router.get('/user/:userId', getUser);
router.post('/change-username', changeUsername);
router.post('/verify-menu-pin', verifyMenuPin);
router.post('/set-menu-pin', setMenuPin);

router.get('/customers', getAll);
router.post('/customers', create);
router.put('/customers/:id', update);
router.delete('/customers/:id', remove);

router.post('/customers/:id/payment', addPayment);

module.exports = router;
