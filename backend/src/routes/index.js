const express = require('express');
const router = express.Router();

const noteRoutes = require('./noteRoutes');
const folderRoutes = require('./folderRoutes');
const tagRoutes = require('./tagRoutes');
const personRoutes = require('./personRoutes');

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
router.use('/notes', noteRoutes);
router.use('/folders', folderRoutes);
router.use('/tags', tagRoutes);
router.use('/people', personRoutes);

module.exports = router;

