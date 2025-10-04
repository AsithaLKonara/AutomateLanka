#!/bin/bash

# Autolanka Backup Script
# This script creates comprehensive backups of the Autolanka platform

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
BACKUP_DIR="/backups/autolanka"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="autolanka_backup_${TIMESTAMP}"
RETENTION_DAYS=30

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"

print_status "Starting Autolanka backup process..."

# Function to backup database
backup_database() {
    print_status "Backing up database..."
    
    if [ -z "$DATABASE_URL" ]; then
        print_error "DATABASE_URL not found in environment"
        return 1
    fi
    
    # Extract database connection details
    DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
    DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
    DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
    DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
    
    # Create database backup
    PGPASSWORD="$DB_PASS" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --verbose --clean --no-acl --no-owner \
        --file="$BACKUP_DIR/${BACKUP_NAME}_database.sql"
    
    print_success "Database backup completed"
}

# Function to backup Redis
backup_redis() {
    print_status "Backing up Redis data..."
    
    if [ -z "$REDIS_URL" ]; then
        print_warning "REDIS_URL not found, skipping Redis backup"
        return 0
    fi
    
    # Extract Redis connection details
    REDIS_HOST=$(echo $REDIS_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
    REDIS_PORT=$(echo $REDIS_URL | sed -n 's/.*:\([0-9]*\).*/\1/p')
    
    # Create Redis backup
    redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" --rdb "$BACKUP_DIR/${BACKUP_NAME}_redis.rdb"
    
    print_success "Redis backup completed"
}

# Function to backup S3/MinIO data
backup_s3() {
    print_status "Backing up S3/MinIO data..."
    
    if [ -z "$S3_ENDPOINT" ] || [ -z "$S3_ACCESS_KEY" ] || [ -z "$S3_SECRET_KEY" ] || [ -z "$S3_BUCKET" ]; then
        print_warning "S3 configuration not found, skipping S3 backup"
        return 0
    fi
    
    # Create S3 backup using AWS CLI
    aws s3 sync "s3://$S3_BUCKET" "$BACKUP_DIR/${BACKUP_NAME}_s3/" \
        --endpoint-url="$S3_ENDPOINT" \
        --access-key-id="$S3_ACCESS_KEY" \
        --secret-access-key="$S3_SECRET_KEY" \
        --delete
    
    print_success "S3 backup completed"
}

# Function to backup application files
backup_application() {
    print_status "Backing up application files..."
    
    # Create application backup
    tar -czf "$BACKUP_DIR/${BACKUP_NAME}_application.tar.gz" \
        --exclude="node_modules" \
        --exclude=".git" \
        --exclude="dist" \
        --exclude="build" \
        --exclude="*.log" \
        --exclude=".env" \
        --exclude="backups" \
        .
    
    print_success "Application backup completed"
}

# Function to backup configuration files
backup_config() {
    print_status "Backing up configuration files..."
    
    # Create configuration backup
    tar -czf "$BACKUP_DIR/${BACKUP_NAME}_config.tar.gz" \
        docker-compose*.yml \
        nginx/ \
        monitoring/ \
        ssl/ \
        .github/ \
        scripts/ \
        env.example
    
    print_success "Configuration backup completed"
}

# Function to create backup manifest
create_manifest() {
    print_status "Creating backup manifest..."
    
    cat > "$BACKUP_DIR/${BACKUP_NAME}_manifest.json" << EOF
{
  "backup_name": "$BACKUP_NAME",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "version": "1.0.0",
  "components": {
    "database": "$([ -f "$BACKUP_DIR/${BACKUP_NAME}_database.sql" ] && echo "included" || echo "skipped")",
    "redis": "$([ -f "$BACKUP_DIR/${BACKUP_NAME}_redis.rdb" ] && echo "included" || echo "skipped")",
    "s3": "$([ -d "$BACKUP_DIR/${BACKUP_NAME}_s3" ] && echo "included" || echo "skipped")",
    "application": "$([ -f "$BACKUP_DIR/${BACKUP_NAME}_application.tar.gz" ] && echo "included" || echo "skipped")",
    "config": "$([ -f "$BACKUP_DIR/${BACKUP_NAME}_config.tar.gz" ] && echo "included" || echo "skipped")"
  },
  "size": {
    "total": "$(du -sh "$BACKUP_DIR/${BACKUP_NAME}"* | awk '{sum+=$1} END {print sum "B"}')"
  },
  "retention_days": $RETENTION_DAYS
}
EOF
    
    print_success "Backup manifest created"
}

# Function to clean up old backups
cleanup_old_backups() {
    print_status "Cleaning up old backups..."
    
    find "$BACKUP_DIR" -name "autolanka_backup_*" -type d -mtime +$RETENTION_DAYS -exec rm -rf {} \;
    find "$BACKUP_DIR" -name "autolanka_backup_*.sql" -type f -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "autolanka_backup_*.rdb" -type f -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "autolanka_backup_*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "autolanka_backup_*.json" -type f -mtime +$RETENTION_DAYS -delete
    
    print_success "Old backups cleaned up"
}

# Function to verify backup
verify_backup() {
    print_status "Verifying backup..."
    
    local backup_files=(
        "$BACKUP_DIR/${BACKUP_NAME}_manifest.json"
    )
    
    # Check if database backup exists
    if [ -f "$BACKUP_DIR/${BACKUP_NAME}_database.sql" ]; then
        backup_files+=("$BACKUP_DIR/${BACKUP_NAME}_database.sql")
    fi
    
    # Check if Redis backup exists
    if [ -f "$BACKUP_DIR/${BACKUP_NAME}_redis.rdb" ]; then
        backup_files+=("$BACKUP_DIR/${BACKUP_NAME}_redis.rdb")
    fi
    
    # Check if S3 backup exists
    if [ -d "$BACKUP_DIR/${BACKUP_NAME}_s3" ]; then
        backup_files+=("$BACKUP_DIR/${BACKUP_NAME}_s3")
    fi
    
    # Check if application backup exists
    if [ -f "$BACKUP_DIR/${BACKUP_NAME}_application.tar.gz" ]; then
        backup_files+=("$BACKUP_DIR/${BACKUP_NAME}_application.tar.gz")
    fi
    
    # Check if config backup exists
    if [ -f "$BACKUP_DIR/${BACKUP_NAME}_config.tar.gz" ]; then
        backup_files+=("$BACKUP_DIR/${BACKUP_NAME}_config.tar.gz")
    fi
    
    # Verify all files exist and are not empty
    for file in "${backup_files[@]}"; do
        if [ ! -e "$file" ]; then
            print_error "Backup file missing: $file"
            return 1
        fi
        
        if [ -f "$file" ] && [ ! -s "$file" ]; then
            print_error "Backup file is empty: $file"
            return 1
        fi
    done
    
    print_success "Backup verification completed"
}

# Main backup process
main() {
    print_status "Starting backup process for $BACKUP_NAME"
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR/${BACKUP_NAME}"
    
    # Run backup components
    backup_database
    backup_redis
    backup_s3
    backup_application
    backup_config
    
    # Create manifest
    create_manifest
    
    # Verify backup
    verify_backup
    
    # Clean up old backups
    cleanup_old_backups
    
    print_success "Backup process completed successfully!"
    print_status "Backup location: $BACKUP_DIR/${BACKUP_NAME}"
    print_status "Backup size: $(du -sh "$BACKUP_DIR/${BACKUP_NAME}"* | awk '{sum+=$1} END {print sum "B"}')"
    
    # Show backup contents
    print_status "Backup contents:"
    ls -la "$BACKUP_DIR/${BACKUP_NAME}"*
}

# Run main function
main "$@"