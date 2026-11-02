const express = require('express');
const { body } = require('express-validator');

const {
  createMessage,
  getMessages,
  markMessageRead,
  deleteMessage,
} = require('../controllers/contactController');
const { protect } = require('../middleware/authMiddleware');
const { contactLimiter } = require('../middleware/rateLimiters');
const validate = require('../middleware/validate');

const router = express.Router();

router.post(
  '/',
  contactLimiter,
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Your name is required.')
      .isLength({ max: 80 })
      .withMessage('Name cannot exceed 80 characters.'),
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Your email is required.')
      .isEmail()
      .withMessage('Enter a valid email address.')
      .isLength({ max: 160 })
      .withMessage('Email is too long.'),
    body('message')
      .trim()
      .notEmpty()
      .withMessage('A message is required.')
      .isLength({ min: 10, max: 3000 })
      .withMessage('Message must be 10–3000 characters.'),
  ],
  validate,
  createMessage
);

router.get('/', protect, getMessages);
router.patch(
  '/:id/read',
  protect,
  [body('read').optional().isBoolean().withMessage('Read must be true or false.').toBoolean()],
  validate,
  markMessageRead
);
router.delete('/:id', protect, deleteMessage);

module.exports = router;
