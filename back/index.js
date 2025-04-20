// filepath: e:\Users\Lenovo\Downloads\project\back\index.js

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const passport = require('passport');
const app = express();
require('dotenv').config();
require('./db/config');
const responseRoutes = require('./routes/response');
const authRoutes = require('./routes/auth');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const SESSION_SECRET = process.env.Secret_Key || 'fallback-secret';
const IS_PROD = process.env.NODE_ENV === 'production';

// --- CORS Setup (allow frontend to send cookies) ---
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));

// --- JSON Parser ---
app.use(express.json());

// --- Session Setup ---
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: IS_PROD, // true only in production with HTTPS
    sameSite: IS_PROD ? 'none' : 'lax' // allow cookies across domains only if HTTPS
  }
}));

// --- Passport Initialization ---
app.use(passport.initialize());
app.use(passport.session());

// --- Routes ---
app.use('/', responseRoutes);
app.use('/api', authRoutes);

// --- Server Start ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
