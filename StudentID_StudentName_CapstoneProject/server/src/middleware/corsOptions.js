const env = require('../config/env');
const ApiError = require('../utils/ApiError');

const corsOptions = {
  origin(origin, callback) {
    // Requests from curl, server-to-server health checks, and same-origin
    // requests do not send an Origin header.
    if (!origin) return callback(null, true);

    const normalized = origin.replace(/\/$/, '');
    if (env.clientUrls.includes(normalized)) return callback(null, true);

    // Local development on any localhost port is convenient and safe.
    if (!env.isProduction && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(normalized)) {
      return callback(null, true);
    }

    return callback(
      new ApiError(403, `Origin ${origin} is not allowed by CORS. Add it to CLIENT_URL.`)
    );
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
};

module.exports = corsOptions;
