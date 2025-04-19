// filepath: e:\Users\Lenovo\Downloads\project\back\index.js
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const passport = require('passport');
const app = express();
require('dotenv').config();
require('./db/config');
const responseRoutes = require('./routes/response');
const authRoutes = require('./routes/auth'); // This now contains the passport config

// --- Middleware Setup ---
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

if (!process.env.Secret_Key) {
    console.error("FATAL ERROR: Session Secret_Key is not defined.");
    process.exit(1);
}
app.use(session({
  secret: process.env.Secret_Key,
  resave: false,
  saveUninitialized: false,
  // cookie: { secure: process.env.NODE_ENV === 'production', httpOnly: true, sameSite: 'lax' }
}));

app.use(passport.initialize());
app.use(passport.session());
// Passport strategies and serialization are now configured within authRoutes

// --- Routes ---
app.use('/', responseRoutes);
app.use('/api', authRoutes);

// --- Server Start ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// --- REMOVED DUPLICATE PASSPORT CONFIGURATION ---
// // Passport session setup (REMOVED - Now handled in auth.js)
// passport.serializeUser((user, done) => {
//   // ... REMOVED ...
// });
//
// passport.deserializeUser(async (id, done) => {
//   // ... REMOVED ...
// });