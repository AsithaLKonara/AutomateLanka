#!/bin/bash

# SSL Certificate Generation Script for Autolanka
# This script generates self-signed SSL certificates for development

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

# Create SSL directory if it doesn't exist
mkdir -p ssl

# Navigate to SSL directory
cd ssl

print_status "Generating SSL certificates for Autolanka..."

# Generate private key
print_status "Generating private key..."
openssl genrsa -out autolanka.key 2048

# Generate certificate signing request
print_status "Generating certificate signing request..."
openssl req -new -key autolanka.key -out autolanka.csr -config openssl.conf

# Generate self-signed certificate
print_status "Generating self-signed certificate..."
openssl x509 -req -in autolanka.csr -signkey autolanka.key -out autolanka.crt -days 365 -extensions v3_req -extfile openssl.conf

# Generate certificate bundle
print_status "Creating certificate bundle..."
cat autolanka.crt autolanka.key > autolanka.pem

# Set proper permissions
chmod 600 autolanka.key
chmod 644 autolanka.crt
chmod 600 autolanka.pem

# Generate DH parameters for stronger security
print_status "Generating DH parameters (this may take a while)..."
openssl dhparam -out dhparam.pem 2048

# Generate a certificate for localhost development
print_status "Generating localhost certificate..."
openssl req -x509 -newkey rsa:2048 -keyout localhost.key -out localhost.crt -days 365 -nodes -subj "/C=US/ST=CA/L=SF/O=Autolanka/CN=localhost" -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

# Set proper permissions for localhost certificate
chmod 600 localhost.key
chmod 644 localhost.crt

print_success "SSL certificates generated successfully!"

# Display certificate information
print_status "Certificate information:"
openssl x509 -in autolanka.crt -text -noout | grep -A 2 "Subject:"
openssl x509 -in autolanka.crt -text -noout | grep -A 5 "Subject Alternative Name"

print_warning "These are self-signed certificates for development only."
print_warning "For production, use certificates from a trusted CA like Let's Encrypt."

# List generated files
print_status "Generated files:"
ls -la *.key *.crt *.pem *.csr

print_success "SSL certificate generation completed!"
print_status "You can now use these certificates in your development environment."
print_status "Update your .env file to point to the certificate files if needed."
