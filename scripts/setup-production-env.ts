
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const generateSecret = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};

const rootDir = path.resolve(__dirname, '..');
const backendEnvPath = path.join(rootDir, 'apps/backend/.env.production');
const frontendEnvPath = path.join(rootDir, 'apps/frontend/.env.production');

const backendEnvContent = `
# Generated Production Configuration
NODE_ENV=production
PORT=8000

# Database (Replace with actual values)
DATABASE_URL="postgresql://user:password@localhost:5432/autolanka_prod?connection_limit=10"
REDIS_URL="redis://localhost:6379"

# Security Secrets (Auto-generated)
JWT_SECRET="${generateSecret()}"
REFRESH_SECRET="${generateSecret()}"
ENCRYPTION_KEY="${generateSecret(16)}" # 32 chars hex = 16 bytes? No, wait. 
# Encryption key needs to be 32 characters for AES-256 usually if it's a string, or 32 bytes hex encoded.
# The previous config said "32 characters". Let's generate a 32 char string.
# crypto.randomBytes(16).toString('hex') is 32 chars.

# Billing
STRIPE_SECRET_KEY="sk_live_replace_me"
STRIPE_WEBHOOK_SECRET="whsec_replace_me"

# Email
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_USER="apikey"
SMTP_PASSWORD="replace_me"
SMTP_FROM="noreply@example.com"

# External URLs
FRONTEND_URL="https://your-domain.com"
`;

const frontendEnvContent = `
# Generated Production Configuration
NEXT_PUBLIC_BACKEND_URL="https://api.your-domain.com"
NEXT_PUBLIC_STRIPE_KEY="pk_live_replace_me"
`;

console.log('Generating .env.production files...');

if (!fs.existsSync(backendEnvPath)) {
    fs.writeFileSync(backendEnvPath, backendEnvContent.trim());
    console.log(`Created: ${backendEnvPath}`);
} else {
    console.log(`Skipped: ${backendEnvPath} (already exists)`);
}

if (!fs.existsSync(frontendEnvPath)) {
    fs.writeFileSync(frontendEnvPath, frontendEnvContent.trim());
    console.log(`Created: ${frontendEnvPath}`);
} else {
    console.log(`Skipped: ${frontendEnvPath} (already exists)`);
}

console.log('Done. Please manually update the files with real service credentials.');
