const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function protect(req, res, next) {
  try {
    const token = req.cookies.token || (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) {
      const error = new Error('Authentication required.');
      error.statusCode = 401;
      throw error;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      const error = new Error('User account no longer exists.');
      error.statusCode = 401;
      throw error;
    }

    req.user = user;
    next();
  } catch (err) {
    err.statusCode = err.statusCode || 401;
    next(err);
  }
}

module.exports = { protect };
