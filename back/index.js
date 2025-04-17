const express = require('express');
const session = require('express-session');
const cors = require('cors');
const app = express();
require('dotenv').config();
require('./db/config'); // Ensure this runs if needed for DB setup
const responseRoutes = require('./routes/response');
const authRoutes = require('./routes/auth'); // Assuming you have this file

// --- Middleware Setup (Order Matters!) ---

// 1. CORS - Apply CORS headers first
app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend URL if different
  credentials: true
}));

// 2. Body Parsers - Parse JSON bodies
app.use(express.json());
// If you need to parse URL-encoded bodies (form submissions), uncomment the next line
// app.use(express.urlencoded({ extended: true }));

// 3. Session - Initialize session handling
// Ensure Secret_Key is set in your .env file
if (!process.env.Secret_Key) {
    console.error("FATAL ERROR: Session Secret_Key is not defined in environment variables.");
    process.exit(1); // Exit if the secret key is missing
}
app.use(session({
  secret: process.env.Secret_Key,
  resave: false,
  saveUninitialized: false,
  // Consider adding cookie settings for security (secure, httpOnly, sameSite)
  // cookie: { secure: process.env.NODE_ENV === 'production', httpOnly: true, sameSite: 'lax' }
}));

// --- Routes ---

// 4. Mount Routers - Define API endpoints AFTER middleware
app.use('/', responseRoutes); // Mounts POST /generate
app.use('/api', authRoutes); // Mounts routes defined in ./routes/auth under /api

// Simple root route (optional)
app.get('/', (req, res) => {
  res.send('Node server is running');
});

// --- Error Handling (Basic Example - Add more specific handlers if needed) ---
// Add a catch-all error handler (optional but recommended)
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).send('Something broke!');
});


// --- Start Server ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));