const express = require('express');
const { body } = require('express-validator');

const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
} = require('../controllers/blogController');
const {
  getComments,
  addComment,
  deleteComment,
} = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

const postRules = (isCreate = false) => {
  const optional = { values: 'undefined' };
  return [
    (isCreate ? body('title') : body('title').optional(optional))
      .trim()
      .notEmpty()
      .withMessage('Post title is required.')
      .isLength({ max: 160 })
      .withMessage('Title cannot exceed 160 characters.'),
    (isCreate ? body('content') : body('content').optional(optional))
      .notEmpty()
      .withMessage('Post content is required.')
      .isLength({ max: 50000 })
      .withMessage('Content cannot exceed 50,000 characters.'),
    body('excerpt').optional(optional).isString().isLength({ max: 320 }),
    body('coverImage').optional(optional).isString(),
    body('tags')
      .optional(optional)
      .custom((value) => Array.isArray(value) || typeof value === 'string')
      .withMessage('Tags must be an array or comma-separated string.'),
    body('featured')
      .optional(optional)
      .isBoolean()
      .withMessage('Featured must be true or false.')
      .toBoolean(),
  ];
};

const commentRules = [
  body('body')
    .trim()
    .notEmpty()
    .withMessage('Write a comment before posting.')
    .isLength({ min: 2, max: 1000 })
    .withMessage('Comment must be 2–1000 characters.'),
];

router.get('/', getPosts);
router.get('/:id', getPost);
router.post('/', protect, postRules(true), validate, createPost);
router.put('/:id', protect, postRules(false), validate, updatePost);
router.delete('/:id', protect, deletePost);

router.get('/:postId/comments', getComments);
router.post('/:postId/comments', protect, commentRules, validate, addComment);
router.delete('/:postId/comments/:commentId', protect, deleteComment);

module.exports = router;
