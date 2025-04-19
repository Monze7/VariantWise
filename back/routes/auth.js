// filepath: e:\Users\Lenovo\Downloads\project\back\routes\auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user'); // Ensure User model is imported
const autho = require('../middlewares/autho');

// --- Passport Google Strategy Configuration ---
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.getUserByEmail(profile.emails[0].value);

      if (user) {
        return done(null, user);
      } else {
        // Create new user - passing null for password
        // Ensure User.createUser can handle a null password (e.g., for OAuth users)
        const newUserInfo = await User.createUser(
          profile.name.givenName || 'GoogleUser',
          profile.name.familyName || '',
          profile.emails[0].value,
          null // Pass null for password for Google sign-up
        );
        // Fetch the newly created user to get their full details including ID
        user = await User.getUserByEmail(profile.emails[0].value);
        if (!user) {
            // Handle case where user creation seemed successful but fetch failed
            return done(new Error('Failed to retrieve newly created user.'), null);
        }
        return done(null, user);
      }
    } catch (error) {
      console.error("Error in Google Strategy:", error); // Log the error
      return done(error, null);
    }
  }
));

// --- Passport Session Serialization/Deserialization ---
passport.serializeUser((user, done) => {
  // Ensure user object has an 'id' property after creation/retrieval
  if (!user || typeof user.id === 'undefined') {
      return done(new Error('User object or user ID is missing for serialization.'), null);
  }
  done(null, user.id); // Store user ID in session
});

passport.deserializeUser(async (id, done) => {
  try {
    // Fetch user from DB using ID stored in session
    // This requires User.getUserById(id) to be implemented in your User model
    const user = await User.getUserById(id);
    if (!user) {
        return done(new Error('User not found during deserialization.'), null);
    }
    done(null, user); // Pass the full user object
  } catch (error) {
    console.error("Error in deserializeUser:", error); // Log the error
    done(error, null);
  }
});



// --- Google OAuth Routes ---
router.get('/auth/google', (req, res, next) => {
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    callbackURL: process.env.GOOGLE_CALLBACK_URL  // 👈 explicitly add this
  })(req, res, next);
});

router.get('/auth/google/callback',
  passport.authenticate('google', {
      failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google_auth_failed`, // Redirect to frontend login on failure
      failureMessage: true // Optional: adds failure message to session flash
  }),
  (req, res) => {
    // Successful authentication
    // req.user is populated by deserializeUser
    if (!req.user) {
         // Should not happen if authentication succeeded, but good to check
         console.error("Google auth callback success but req.user is missing.");
         return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_error`);
    }
    // Establish session
    req.session.user = { id: req.user.id, email: req.user.email, first_name: req.user.first_name };
    // Redirect to the frontend dashboard
    res.redirect(process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/dashboard` : 'http://localhost:3000/dashboard');
  }
);

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