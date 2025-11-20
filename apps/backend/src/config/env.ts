/**
 * Environment Variable Validation
 * Validates all required environment variables at startup
 */

interface EnvConfig {
  // Database
  DATABASE_URL: string;
  
  // Redis
  REDIS_URL?: string;
  
  // JWT
  JWT_SECRET: string;
  REFRESH_SECRET: string;
  
  // Encryption
  ENCRYPTION_KEY: string;
  
  // Stripe
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  
  // Server
  PORT: string;
  NODE_ENV: string;
  FRONTEND_URL?: string;
  
  // Optional
  SENTRY_DSN?: string;
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USER?: string;
  SMTP_PASSWORD?: string;
  SMTP_FROM?: string;
}

/**
 * Validate environment variables
 */
export function validateEnv(): EnvConfig {
  const errors: string[] = [];

  // Required variables
  if (!process.env.DATABASE_URL) {
    errors.push('DATABASE_URL is required');
  }

  if (!process.env.JWT_SECRET) {
    errors.push('JWT_SECRET is required');
  } else if (process.env.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters');
  }

  if (!process.env.REFRESH_SECRET) {
    errors.push('REFRESH_SECRET is required');
  } else if (process.env.REFRESH_SECRET.length < 32) {
    errors.push('REFRESH_SECRET must be at least 32 characters');
  }

  if (!process.env.ENCRYPTION_KEY) {
    errors.push('ENCRYPTION_KEY is required');
  } else if (process.env.ENCRYPTION_KEY.length !== 32) {
    errors.push('ENCRYPTION_KEY must be exactly 32 characters');
  }

  // Production-specific validations
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.FRONTEND_URL) {
      errors.push('FRONTEND_URL is required in production');
    }

    if (!process.env.REDIS_URL) {
      errors.push('REDIS_URL is required in production');
    }

    // Warn about weak secrets in production
    if (process.env.JWT_SECRET?.includes('dev') || process.env.JWT_SECRET?.includes('test')) {
      errors.push('JWT_SECRET appears to be a development secret. Use a strong production secret.');
    }

    if (process.env.ENCRYPTION_KEY === '12345678901234567890123456789012') {
      errors.push('ENCRYPTION_KEY is using default value. Change it in production.');
    }
  }

  if (errors.length > 0) {
    console.error('❌ Environment variable validation failed:');
    errors.forEach(error => console.error(`  - ${error}`));
    throw new Error(`Environment validation failed: ${errors.join(', ')}`);
  }

  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    REDIS_URL: process.env.REDIS_URL,
    JWT_SECRET: process.env.JWT_SECRET!,
    REFRESH_SECRET: process.env.REFRESH_SECRET!,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY!,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    PORT: process.env.PORT || '8000',
    NODE_ENV: process.env.NODE_ENV || 'development',
    FRONTEND_URL: process.env.FRONTEND_URL,
    SENTRY_DSN: process.env.SENTRY_DSN,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    SMTP_FROM: process.env.SMTP_FROM,
  };
}

/**
 * Get validated environment config
 */
export const env = validateEnv();

export default env;

