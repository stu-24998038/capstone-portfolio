const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const jsonLimitHandler = (_req, res) =>
  res.status(429).json({
    success: false,
    message: 'Too many requests. Please wait a moment and try again.',
  });

const base = {
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: () => env.isTest,
  handler: jsonLimitHandler,
};

const apiLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 500,
});

const authLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 30,
  message: 'Too many sign-in attempts. Please try again in a few minutes.',
});

const contactLimiter = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  limit: 12,
});

module.exports = { apiLimiter, authLimiter, contactLimiter };
