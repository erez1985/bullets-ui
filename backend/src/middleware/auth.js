// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({
    success: false,
    error: 'Unauthorized - Please log in',
  });
};

// Attach userId to request for convenience
const attachUserId = (req, res, next) => {
  if (req.user) {
    req.userId = req.user._id;
  }
  next();
};

module.exports = {
  isAuthenticated,
  attachUserId,
};

