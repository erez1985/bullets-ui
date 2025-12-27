const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const noteRoutes = require('./noteRoutes');
const folderRoutes = require('./folderRoutes');
const tagRoutes = require('./tagRoutes');
const personRoutes = require('./personRoutes');
const { isAuthenticated, attachUserId } = require('../middleware/auth');

// Health check (public)
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// Auth routes (public)
router.use('/auth', authRoutes);

// Protected routes - require authentication
router.use('/notes', isAuthenticated, attachUserId, noteRoutes);
router.use('/folders', isAuthenticated, attachUserId, folderRoutes);
router.use('/tags', isAuthenticated, attachUserId, tagRoutes);
router.use('/people', isAuthenticated, attachUserId, personRoutes);

module.exports = router;
