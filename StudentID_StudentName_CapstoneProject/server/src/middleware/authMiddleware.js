const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Verifies the Bearer token, loads the current user, and attaches it to
 * req.user. Every protected endpoint in the API depends on this middleware.
 */
const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';

  if (!header.startsWith('Bearer ')) {
    throw new ApiError(401, 'Not authorized. Please sign in to continue.');
  }

  const token = header.slice(7).trim();
  if (!token) {
    throw new ApiError(401, 'Not authorized. Please sign in to continue.');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Your session has expired. Please sign in again.');
    }
    throw new ApiError(401, 'Invalid session token. Please sign in again.');
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new ApiError(401, 'The account for this session no longer exists.');
  }

  req.user = user;
  return next();
});

module.exports = { protect };
