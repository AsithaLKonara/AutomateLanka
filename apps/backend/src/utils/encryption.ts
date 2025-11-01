import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'; // Must be 32 characters
const ALGORITHM = 'aes-256-gcm';

/**
 * Encrypt sensitive data (like OAuth tokens, API keys)
 * Uses AES-256-GCM for authenticated encryption
 */
export function encrypt(text: string): string {
  try {
    // Validate encryption key
    if (ENCRYPTION_KEY.length !== 32) {
      throw new Error('ENCRYPTION_KEY must be exactly 32 characters');
    }

    // Generate random IV (initialization vector)
    const iv = crypto.randomBytes(16);

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);

    // Encrypt the data
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Get auth tag (for authenticated encryption)
    const authTag = cipher.getAuthTag();

    // Combine IV + authTag + encrypted data
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt encrypted data
 */
export function decrypt(encryptedData: string): string {
  try {
    // Validate encryption key
    if (ENCRYPTION_KEY.length !== 32) {
      throw new Error('ENCRYPTION_KEY must be exactly 32 characters');
    }

    // Split the encrypted data
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const [ivHex, authTagHex, encrypted] = parts;

    // Convert from hex
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    decipher.setAuthTag(authTag);

    // Decrypt the data
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Hash sensitive data (one-way, for API keys)
 */
export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

/**
 * Generate a secure random API key
 */
export function generateApiKey(): string {
  // Format: al_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX (alphanumeric)
  const randomPart = crypto.randomBytes(24).toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 32);
  
  const env = process.env.NODE_ENV === 'production' ? 'live' : 'test';
  return `al_${env}_${randomPart}`;
}

/**
 * Mask sensitive data for logging (show only first/last few characters)
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (data.length <= visibleChars * 2) {
    return '***';
  }
  const start = data.substring(0, visibleChars);
  const end = data.substring(data.length - visibleChars);
  return `${start}...${end}`;
}

