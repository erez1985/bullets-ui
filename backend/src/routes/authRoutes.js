const express = require('express');
const passport = require('passport');
const router = express.Router();

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:8080';
const isGoogleConfigured = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;

// Google OAuth login
router.get('/google', (req, res, next) => {
  if (!isGoogleConfigured) {
    return res.status(503).json({
      success: false,
      error: 'Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.',
    });
  }
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })(req, res, next);
});

// Google OAuth callback
router.get('/google/callback', (req, res, next) => {
  if (!isGoogleConfigured) {
    return res.redirect(`${CLIENT_URL}/login?error=auth_not_configured`);
  }
  passport.authenticate('google', (err, user, info) => {
    if (err) {
      console.error('OAuth error:', err);
      return res.redirect(`${CLIENT_URL}/login?error=auth_failed`);
    }
    if (!user) {
      console.error('No user returned from OAuth');
      return res.redirect(`${CLIENT_URL}/login?error=auth_failed`);
    }
    // Establish the session
    req.login(user, (loginErr) => {
      if (loginErr) {
        console.error('Login error:', loginErr);
        return res.redirect(`${CLIENT_URL}/login?error=session_failed`);
      }
      // Successful authentication
      res.redirect(CLIENT_URL);
    });
  })(req, res, next);
});

// Get current user
router.get('/me', (req, res) => {
  // Disable caching for auth endpoint
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  
  if (req.isAuthenticated() && req.user) {
    res.json({
      success: true,
      data: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        avatar: req.user.avatar,
      },
    });
  } else {
    res.json({
      success: true,
      data: null,
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to logout',
      });
    }
    req.session.destroy((err) => {
      res.clearCookie('connect.sid');
      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    });
  });
});

module.exports = router;

