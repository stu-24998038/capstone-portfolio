/**
 * Wraps an async route handler so rejected promises reach the central error
 * middleware. Express 5 does this automatically, but keeping the helper makes
 * the intent explicit and keeps the controllers portable.
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
