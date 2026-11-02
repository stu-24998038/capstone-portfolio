const express = require('express');
const { body } = require('express-validator');

const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

router.post(
  '/register',
  authLimiter,
  [
    body('username')
      .trim()
      .notEmpty()
      .withMessage('Username is required.')
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be 3–30 characters.')
      .matches(/^[a-zA-Z0-9_.-]+$/)
      .withMessage('Use only letters, numbers, dots, hyphens, and underscores.'),
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required.')
      .isEmail()
      .withMessage('Enter a valid email address.')
      .isLength({ max: 160 })
      .withMessage('Email is too long.'),
    body('password')
      .isString()
      .withMessage('Password must be text.')
      .isLength({ min: 6, max: 72 })
      .withMessage('Password must be 6–72 characters.'),
  ],
  validate,
  register
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').trim().notEmpty().withMessage('Email is required.').isEmail().withMessage('Enter a valid email address.'),
    body('password').isString().notEmpty().withMessage('Password is required.'),
  ],
  validate,
  login
);

router.get('/me', protect, getMe);

module.exports = router;
