const express = require('express');
const { body } = require('express-validator');

const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

const projectRules = (isCreate = false) => {
  const optional = { values: 'undefined' };
  // express-validator's `optional` is applied per-field below; the create
  // route makes the required fields mandatory.
  return [
    (isCreate ? body('title') : body('title').optional(optional))
      .trim()
      .notEmpty()
      .withMessage('Project title is required.')
      .isLength({ max: 120 })
      .withMessage('Title cannot exceed 120 characters.'),
    (isCreate ? body('description') : body('description').optional(optional))
      .trim()
      .notEmpty()
      .withMessage('Project description is required.')
      .isLength({ max: 5000 })
      .withMessage('Description cannot exceed 5000 characters.'),
    body('imageUrl').optional(optional).isString().withMessage('Image URL must be text.'),
    body('repoUrl').optional(optional).isString().withMessage('Repository URL must be text.'),
    body('liveUrl').optional(optional).isString().withMessage('Live URL must be text.'),
    body('techStack')
      .optional(optional)
      .custom((value) => Array.isArray(value) || typeof value === 'string')
      .withMessage('Tech stack must be an array or comma-separated string.'),
    body('featured')
      .optional(optional)
      .isBoolean()
      .withMessage('Featured must be true or false.')
      .toBoolean(),
    body('year').optional(optional).isString().isLength({ max: 12 }),
    body('accent')
      .optional(optional)
      .isIn(['terracotta', 'olive', 'ink', 'sand', 'clay', 'sky'])
      .withMessage('Choose a valid accent.'),
    body('order')
      .optional(optional)
      .isInt({ min: 0 })
      .withMessage('Order must be a positive number.')
      .toInt(),
  ];
};

router.get('/', getProjects);
router.get('/:id', getProject);

router.post('/', protect, projectRules(true), validate, createProject);
router.put('/:id', protect, projectRules(false), validate, updateProject);
router.delete('/:id', protect, deleteProject);

module.exports = router;
