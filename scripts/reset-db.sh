#!/bin/bash

# Autolanka Database Reset Script
# This script resets the database to a clean state

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

# Check if .env file exists
if [ ! -f .env ]; then
    print_error ".env file not found. Please copy env.example to .env and configure it."
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    print_error "DATABASE_URL not found in .env file"
    exit 1
fi

# Confirmation prompt
echo -e "${YELLOW}WARNING: This will completely reset your database and delete all data!${NC}"
echo -e "${YELLOW}Are you sure you want to continue? (y/N)${NC}"
read -r response
if [[ ! "$response" =~ ^[Yy]$ ]]; then
    print_status "Database reset cancelled."
    exit 0
fi

print_status "Starting database reset..."

# Navigate to the db package directory
cd packages/db

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm install
fi

# Reset the database
print_status "Resetting database..."
npx prisma migrate reset --force || {
    print_error "Database reset failed. Please check the error above."
    exit 1
}

# Generate Prisma client
print_status "Generating Prisma client..."
npx prisma generate

# Seed the database if seed script exists
if [ -f "prisma/seed.ts" ] || [ -f "prisma/seed.js" ]; then
    print_status "Seeding database..."
    npx prisma db seed || {
        print_warning "Database seeding failed, but this is not critical."
    }
fi

# Verify reset
print_status "Verifying database reset..."
npx prisma db pull --print > /dev/null || {
    print_error "Database reset verification failed."
    exit 1
}

print_success "Database reset completed successfully!"

# Show database status
print_status "Database status:"
npx prisma studio --port 5555 &
STUDIO_PID=$!
print_status "Prisma Studio started on port 5555 (PID: $STUDIO_PID)"
print_status "You can access it at http://localhost:5555"
print_status "Press Ctrl+C to stop Prisma Studio"

# Wait for user to stop
trap "kill $STUDIO_PID 2>/dev/null; exit 0" INT
wait $STUDIO_PID
