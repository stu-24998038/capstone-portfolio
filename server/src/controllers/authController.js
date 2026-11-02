const User = require('../models/User');
const { signToken } = require('../utils/token');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const publicUser = (user) => user.toJSON();

/**
 * POST /api/users/register
 * Creates an account with an automatically hashed password and returns a JWT
 * so the client can sign the user in immediately.
 */
const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, 'An account with that email already exists.');
  }

  const usernameTaken = await User.findOne({ username });
  if (usernameTaken) {
    throw new ApiError(409, 'That username is already taken.');
  }

  const user = await User.create({ username, email, password });
  const token = signToken(user._id);

  res.status(201).json({
    success: true,
    message: 'Your account is ready. Welcome in.',
    token,
    user: publicUser(user),
  });
});

/**
 * POST /api/users/login
 * Compares the supplied password with the bcrypt hash and issues a JWT.
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Email or password is incorrect.');
  }

  const matches = await user.comparePassword(password);
  if (!matches) {
    throw new ApiError(401, 'Email or password is incorrect.');
  }

  const token = signToken(user._id);
  user.password = undefined;

  res.status(200).json({
    success: true,
    message: `Welcome back, ${user.username}.`,
    token,
    user: publicUser(user),
  });
});

/**
 * GET /api/users/me
 * Used by the AuthContext to restore a session from a stored token.
 */
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, user: publicUser(req.user) });
});

module.exports = { register, login, getMe };
