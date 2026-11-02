const path = require('path');
const dotenv = require('dotenv');

// Load server/.env regardless of whether the process was started from the
// repository root or from the server directory.
dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true });

const splitOrigins = (value) =>
  String(value || '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);

const isProduction = process.env.NODE_ENV === 'production';

if (!process.env.MONGODB_URI) {
  throw new Error(
    'MONGODB_URI is missing. Copy server/.env.example to server/.env and add your MongoDB Atlas connection string.'
  );
}

if (!process.env.JWT_SECRET) {
  throw new Error(
    'JWT_SECRET is missing. Copy server/.env.example to server/.env and set a strong secret.'
  );
}

if (isProduction && process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters in production.');
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction,
  isTest: process.env.NODE_ENV === 'test',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrls: splitOrigins(
    process.env.CLIENT_URL || 'http://localhost:5173,http://127.0.0.1:5173'
  ),
  admin: {
    username: process.env.ADMIN_USERNAME || 'alex',
    email: process.env.ADMIN_EMAIL || 'admin@folio.dev',
    password: process.env.ADMIN_PASSWORD || 'Admin123!',
  },
};

module.exports = env;
