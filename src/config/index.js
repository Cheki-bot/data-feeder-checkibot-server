import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * Validate that required environment variables are set
 * @param {string} name - Variable name
 * @param {*} value - Variable value
 * @param {Object} options - Validation options
 */
function validateEnvVar(name, value, options = {}) {
  const { required = false, minLength = 0, pattern = null } = options;

  if (required && !value) {
    throw new Error(
      `❌ SECURITY ERROR: Environment variable ${name} is required but not set. ` +
        `Please check your .env file.`,
    );
  }

  if (value && minLength > 0 && value.length < minLength) {
    throw new Error(
      `❌ SECURITY ERROR: Environment variable ${name} must be at least ${minLength} characters. ` +
        `Current length: ${value.length}. This is a security requirement.`,
    );
  }

  if (value && pattern && !pattern.test(value)) {
    throw new Error(
      `❌ SECURITY ERROR: Environment variable ${name} has invalid format. ` +
        `Please check your .env file.`,
    );
  }
}

// Validate critical environment variables
const isProduction = process.env.NODE_ENV === 'production';

// MongoDB validation
validateEnvVar('MONGO_URI', process.env.MONGO_URI, {
  required: true,
});

validateEnvVar('MONGO_DB_NAME', process.env.MONGO_DB_NAME, {
  required: true,
  minLength: 1,
});

// JWT Secret validation (must be strong)
validateEnvVar('JWT_SECRET', process.env.JWT_SECRET, {
  required: true,
  minLength: 32, // Minimum 32 characters for security
});

// Validate JWT secret strength
if (
  process.env.JWT_SECRET &&
  (process.env.JWT_SECRET.includes('change-this') ||
    process.env.JWT_SECRET.includes('example') ||
    process.env.JWT_SECRET.includes('your-super-secret'))
) {
  const message =
    '❌ SECURITY ERROR: JWT_SECRET contains default/example values. ' +
    "Generate a strong secret with: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\"";

  if (isProduction) {
    throw new Error(message + '\n🚫 Server will not start in production with weak secrets.');
  } else {
    console.warn('⚠️  ' + message);
  }
}

// Enforce minimum length in production
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 64) {
  const message = `JWT_SECRET is too short (${process.env.JWT_SECRET.length} characters). Minimum required: 64 characters for production security.`;

  if (isProduction) {
    throw new Error(
      `❌ SECURITY ERROR: ${message}\n🚫 Server will not start in production with weak secrets.`,
    );
  } else {
    console.warn(`⚠️  WARNING: ${message}`);
  }
}

// Admin credentials validation
validateEnvVar('ADMIN_EMAIL', process.env.ADMIN_EMAIL, {
  required: true,
  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Basic email validation
});

validateEnvVar('ADMIN_PASSWORD', process.env.ADMIN_PASSWORD, {
  required: true,
  minLength: 8,
});

// Warn about weak admin password
if (process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length < 12 && isProduction) {
  console.warn(
    '⚠️  WARNING: ADMIN_PASSWORD is shorter than 12 characters. ' +
      'Use a stronger password in production (recommended: 16+ characters).',
  );
}

// CORS validation - enforce in production
if (isProduction && process.env.ALLOW_ORIGINS === '*') {
  throw new Error(
    '❌ SECURITY ERROR: ALLOW_ORIGINS is set to * (allow all) in production.\n' +
      'This is a critical security risk. You must specify allowed domains explicitly.\n' +
      'Example: ALLOW_ORIGINS=https://yourdomain.com,https://app.yourdomain.com\n' +
      '🚫 Server will not start in production with insecure CORS settings.',
  );
}

// Warn in development
if (!isProduction && process.env.ALLOW_ORIGINS === '*') {
  console.warn(
    '⚠️  DEVELOPMENT MODE: ALLOW_ORIGINS is set to * (allow all). ' +
      'Remember to specify allowed domains explicitly in production.',
  );
}

export const env = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT || 3000,

  MONGO_URI: process.env.MONGO_URI,
  MONGO_DB_NAME: process.env.MONGO_DB_NAME,

  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  JWT_SECRET: process.env.JWT_SECRET,

  ALLOW_ORIGINS: process.env.ALLOW_ORIGINS || '*',
};
