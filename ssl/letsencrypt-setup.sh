#!/bin/bash

# Let's Encrypt SSL Certificate Setup Script for Autolanka
# This script sets up Let's Encrypt certificates for production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
DOMAIN="autolanka.com"
EMAIL="admin@autolanka.com"
WEBROOT="/var/www/html"
CERT_DIR="/etc/letsencrypt/live/$DOMAIN"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run this script as root or with sudo"
    exit 1
fi

print_status "Setting up Let's Encrypt SSL certificates for $DOMAIN..."

# Update system packages
print_status "Updating system packages..."
apt-get update

# Install certbot
print_status "Installing certbot..."
apt-get install -y certbot python3-certbot-nginx

# Check if domain is accessible
print_status "Checking domain accessibility..."
if ! curl -s "http://$DOMAIN" > /dev/null; then
    print_warning "Domain $DOMAIN is not accessible. Please ensure DNS is configured correctly."
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Create webroot directory
print_status "Creating webroot directory..."
mkdir -p $WEBROOT

# Generate certificate
print_status "Generating Let's Encrypt certificate..."
certbot certonly \
    --webroot \
    --webroot-path=$WEBROOT \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --domains $DOMAIN,www.$DOMAIN,api.$DOMAIN,app.$DOMAIN

# Check if certificate was generated successfully
if [ ! -d "$CERT_DIR" ]; then
    print_error "Certificate generation failed"
    exit 1
fi

print_success "Certificate generated successfully!"

# Set up automatic renewal
print_status "Setting up automatic renewal..."
cat > /etc/cron.d/certbot-renew << EOF
0 12 * * * root certbot renew --quiet --post-hook "systemctl reload nginx"
EOF

# Create nginx configuration for SSL
print_status "Creating nginx SSL configuration..."
cat > /etc/nginx/sites-available/autolanka-ssl << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN api.$DOMAIN app.$DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    ssl_certificate $CERT_DIR/fullchain.pem;
    ssl_certificate_key $CERT_DIR/privkey.pem;
    ssl_trusted_certificate $CERT_DIR/chain.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}

server {
    listen 443 ssl http2;
    server_name api.$DOMAIN;

    ssl_certificate $CERT_DIR/fullchain.pem;
    ssl_certificate_key $CERT_DIR/privkey.pem;
    ssl_trusted_certificate $CERT_DIR/chain.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # API
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}

server {
    listen 443 ssl http2;
    server_name app.$DOMAIN;

    ssl_certificate $CERT_DIR/fullchain.pem;
    ssl_certificate_key $CERT_DIR/privkey.pem;
    ssl_trusted_certificate $CERT_DIR/chain.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # App
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable the site
print_status "Enabling nginx site..."
ln -sf /etc/nginx/sites-available/autolanka-ssl /etc/nginx/sites-enabled/

# Test nginx configuration
print_status "Testing nginx configuration..."
nginx -t

# Reload nginx
print_status "Reloading nginx..."
systemctl reload nginx

# Test certificate
print_status "Testing SSL certificate..."
openssl s_client -connect $DOMAIN:443 -servername $DOMAIN < /dev/null 2>/dev/null | openssl x509 -noout -dates

print_success "Let's Encrypt SSL setup completed successfully!"

print_status "Certificate information:"
echo "Domain: $DOMAIN"
echo "Certificate path: $CERT_DIR"
echo "Expires: $(openssl x509 -in $CERT_DIR/fullchain.pem -noout -enddate | cut -d= -f2)"
echo "Auto-renewal: Enabled (daily check at 12:00)"

print_warning "Make sure to:"
print_warning "1. Update your DNS records to point to this server"
print_warning "2. Configure your application to use HTTPS"
print_warning "3. Test the certificate renewal process"
print_warning "4. Monitor certificate expiration"
