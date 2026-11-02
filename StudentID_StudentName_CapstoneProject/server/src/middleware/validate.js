const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Converts express-validator results into one consistent, field-aware 422
 * response used by the client forms.
 */
const validate = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array().map((error) => ({
    field: error.path,
    message: error.msg,
  }));

  return next(new ApiError(422, 'Please check the highlighted fields.', errors));
};

module.exports = validate;
