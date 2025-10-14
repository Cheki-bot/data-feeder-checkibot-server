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
        `Please check your .env file.`
    );
  }

  if (value && minLength > 0 && value.length < minLength) {
    throw new Error(
      `❌ SECURITY ERROR: Environment variable ${name} must be at least ${minLength} characters. ` +
        `Current length: ${value.length}. This is a security requirement.`
    );
  }

  if (value && pattern && !pattern.test(value)) {
    throw new Error(
      `❌ SECURITY ERROR: Environment variable ${name} has invalid format. ` +
        `Please check your .env file.`
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

// Warn if using default/weak JWT secret
if (
  process.env.JWT_SECRET &&
  (process.env.JWT_SECRET.includes('change-this') ||
    process.env.JWT_SECRET.includes('example') ||
    process.env.JWT_SECRET.length < 64)
) {
  console.warn(
    '⚠️  WARNING: JWT_SECRET appears to be weak or default. ' +
      'Generate a strong secret with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"'
  );
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
if (
  process.env.ADMIN_PASSWORD &&
  process.env.ADMIN_PASSWORD.length < 12 &&
  isProduction
) {
  console.warn(
    '⚠️  WARNING: ADMIN_PASSWORD is shorter than 12 characters. ' +
      'Use a stronger password in production (recommended: 16+ characters).'
  );
}

// CORS validation for production
if (
  isProduction &&
  process.env.ALLOW_ORIGINS === '*'
) {
  console.warn(
    '⚠️  WARNING: ALLOW_ORIGINS is set to * (allow all) in production. ' +
      'This is a security risk. Please specify allowed domains explicitly.'
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
