const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');
const autho = require('../middlewares/autho');

router.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;
    await User.createUser(first_name, last_name, email, password);
    res.json({ success: true, message: 'User registered' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.getUserByEmail(email);
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    req.session.user = { id: user.id, email: user.email, first_name: user.first_name };
    res.json({ success: true, message: 'Logged in', user: { first_name: user.first_name } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

router.post('/logout', autho, (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true, message: 'Logged out' });
  });
});

router.get('/dashboard', autho, (req, res) => {
  res.json({ success: true, message: 'Welcome to your dashboard' });
});

module.exports = router;