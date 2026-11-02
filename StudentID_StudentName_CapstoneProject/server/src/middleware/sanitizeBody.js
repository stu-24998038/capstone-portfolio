/**
 * Removes MongoDB operator keys ($) and dotted paths from request bodies.
 * express-validator handles type/format checks; this closes the NoSQL
 * injection surface created by passing object bodies into Mongoose.
 */
const cleanValue = (value) => {
  if (Array.isArray(value)) return value.map(cleanValue);
  if (!value || typeof value !== 'object' || value instanceof Date) return value;

  const result = {};
  for (const [key, item] of Object.entries(value)) {
    if (key.startsWith('$') || key.includes('.')) continue;
    result[key] = cleanValue(item);
  }
  return result;
};

const sanitizeBody = (req, _res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = cleanValue(req.body);
  }
  next();
};

module.exports = sanitizeBody;
