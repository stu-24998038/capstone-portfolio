const env = require('../config/env');
const ApiError = require('../utils/ApiError');

const notFound = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  if (res.headersSent) return;

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong.';
  let errors = err.errors;

  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for ${err.path}.`;
  } else if (err.name === 'ValidationError') {
    statusCode = 422;
    message = 'Validation failed. Please check your input.';
    errors = Object.values(err.errors).map((item) => ({
      field: item.path,
      message: item.message,
    }));
  } else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0] || 'field';
    message =
      field === 'email'
        ? 'An account with that email already exists.'
        : field === 'username'
          ? 'That username is already taken.'
          : 'A record with those details already exists.';
  } else if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Request body contains invalid JSON.';
  } else if (err.type === 'entity.too.large') {
    statusCode = 413;
    message = 'Request body is too large.';
  }

  if (statusCode >= 500) {
    message = env.isProduction ? 'An unexpected server error occurred.' : message;
    if (!env.isTest) {
      console.error('[error]', err);
    }
  }

  const body = {
    success: false,
    message,
    ...(errors ? { errors } : {}),
    ...(!env.isProduction && statusCode >= 500 && err.stack ? { stack: err.stack } : {}),
  };

  res.status(statusCode).json(body);
};

module.exports = { notFound, errorHandler };
