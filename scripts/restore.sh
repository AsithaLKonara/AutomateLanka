#!/bin/bash

# Autolanka Restore Script
# This script restores the Autolanka platform from backups

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
RESTORE_DIR="/tmp/autolanka_restore"

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS] BACKUP_NAME"
    echo ""
    echo "Options:"
    echo "  -h, --help          Show this help message"
    echo "  -l, --list          List available backups"
    echo "  -d, --dry-run       Show what would be restored without actually restoring"
    echo "  -f, --force         Force restore even if backup verification fails"
    echo ""
    echo "Examples:"
    echo "  $0 autolanka_backup_20240101_120000"
    echo "  $0 --list"
    echo "  $0 --dry-run autolanka_backup_20240101_120000"
}

# Function to list available backups
list_backups() {
    print_status "Available backups:"
    
    if [ ! -d "$BACKUP_DIR" ]; then
        print_warning "Backup directory does not exist: $BACKUP_DIR"
        return 1
    fi
    
    local backups=($(find "$BACKUP_DIR" -name "autolanka_backup_*" -type d | sort -r))
    
    if [ ${#backups[@]} -eq 0 ]; then
        print_warning "No backups found in $BACKUP_DIR"
        return 1
    fi
    
    printf "%-30s %-20s %-15s %s\n" "BACKUP_NAME" "DATE" "SIZE" "STATUS"
    printf "%-30s %-20s %-15s %s\n" "------------------------------" "--------------------" "---------------" "------"
    
    for backup in "${backups[@]}"; do
        local backup_name=$(basename "$backup")
        local manifest_file="$backup/manifest.json"
        
        if [ -f "$manifest_file" ]; then
            local date=$(jq -r '.timestamp' "$manifest_file" 2>/dev/null || echo "Unknown")
            local size=$(du -sh "$backup" 2>/dev/null | cut -f1 || echo "Unknown")
            local status="Complete"
        else
            local date="Unknown"
            local size=$(du -sh "$backup" 2>/dev/null | cut -f1 || echo "Unknown")
            local status="Incomplete"
        fi
        
        printf "%-30s %-20s %-15s %s\n" "$backup_name" "$date" "$size" "$status"
    done
}

# Function to verify backup
verify_backup() {
    local backup_name="$1"
    local backup_path="$BACKUP_DIR/$backup_name"
    
    print_status "Verifying backup: $backup_name"
    
    if [ ! -d "$backup_path" ]; then
        print_error "Backup directory not found: $backup_path"
        return 1
    fi
    
    local manifest_file="$backup_path/manifest.json"
    
    if [ ! -f "$manifest_file" ]; then
        print_error "Backup manifest not found: $manifest_file"
        return 1
    fi
    
    # Check manifest validity
    if ! jq empty "$manifest_file" 2>/dev/null; then
        print_error "Invalid manifest file: $manifest_file"
        return 1
    fi
    
    # Check required backup files
    local required_files=("manifest.json")
    
    # Check database backup
    if [ -f "$backup_path/database.sql" ]; then
        required_files+=("database.sql")
    fi
    
    # Check Redis backup
    if [ -f "$backup_path/redis.rdb" ]; then
        required_files+=("redis.rdb")
    fi
    
    # Check S3 backup
    if [ -d "$backup_path/s3" ]; then
        required_files+=("s3")
    fi
    
    # Check application backup
    if [ -f "$backup_path/application.tar.gz" ]; then
        required_files+=("application.tar.gz")
    fi
    
    # Check config backup
    if [ -f "$backup_path/config.tar.gz" ]; then
        required_files+=("config.tar.gz")
    fi
    
    # Verify all files exist and are not empty
    for file in "${required_files[@]}"; do
        local file_path="$backup_path/$file"
        
        if [ ! -e "$file_path" ]; then
            print_error "Required backup file missing: $file_path"
            return 1
        fi
        
        if [ -f "$file_path" ] && [ ! -s "$file_path" ]; then
            print_error "Required backup file is empty: $file_path"
            return 1
        fi
    done
    
    print_success "Backup verification completed"
    return 0
}

# Function to restore database
restore_database() {
    local backup_path="$1"
    local dry_run="$2"
    
    print_status "Restoring database..."
    
    if [ ! -f "$backup_path/database.sql" ]; then
        print_warning "Database backup not found, skipping database restore"
        return 0
    fi
    
    if [ -z "$DATABASE_URL" ]; then
        print_error "DATABASE_URL not found in environment"
        return 1
    fi
    
    if [ "$dry_run" = "true" ]; then
        print_status "DRY RUN: Would restore database from $backup_path/database.sql"
        return 0
    fi
    
    # Extract database connection details
    DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
    DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
    DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
    DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
    
    # Restore database
    PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        -f "$backup_path/database.sql"
    
    print_success "Database restore completed"
}

# Function to restore Redis
restore_redis() {
    local backup_path="$1"
    local dry_run="$2"
    
    print_status "Restoring Redis data..."
    
    if [ ! -f "$backup_path/redis.rdb" ]; then
        print_warning "Redis backup not found, skipping Redis restore"
        return 0
    fi
    
    if [ -z "$REDIS_URL" ]; then
        print_warning "REDIS_URL not found, skipping Redis restore"
        return 0
    fi
    
    if [ "$dry_run" = "true" ]; then
        print_status "DRY RUN: Would restore Redis from $backup_path/redis.rdb"
        return 0
    fi
    
    # Extract Redis connection details
    REDIS_HOST=$(echo $REDIS_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
    REDIS_PORT=$(echo $REDIS_URL | sed -n 's/.*:\([0-9]*\).*/\1/p')
    
    # Stop Redis service
    systemctl stop redis-server
    
    # Restore Redis data
    cp "$backup_path/redis.rdb" /var/lib/redis/dump.rdb
    chown redis:redis /var/lib/redis/dump.rdb
    
    # Start Redis service
    systemctl start redis-server
    
    print_success "Redis restore completed"
}

# Function to restore S3
restore_s3() {
    local backup_path="$1"
    local dry_run="$2"
    
    print_status "Restoring S3/MinIO data..."
    
    if [ ! -d "$backup_path/s3" ]; then
        print_warning "S3 backup not found, skipping S3 restore"
        return 0
    fi
    
    if [ -z "$S3_ENDPOINT" ] || [ -z "$S3_ACCESS_KEY" ] || [ -z "$S3_SECRET_KEY" ] || [ -z "$S3_BUCKET" ]; then
        print_warning "S3 configuration not found, skipping S3 restore"
        return 0
    fi
    
    if [ "$dry_run" = "true" ]; then
        print_status "DRY RUN: Would restore S3 from $backup_path/s3"
        return 0
    fi
    
    # Restore S3 data using AWS CLI
    aws s3 sync "$backup_path/s3" "s3://$S3_BUCKET" \
        --endpoint-url="$S3_ENDPOINT" \
        --access-key-id="$S3_ACCESS_KEY" \
        --secret-access-key="$S3_SECRET_KEY" \
        --delete
    
    print_success "S3 restore completed"
}

# Function to restore application
restore_application() {
    local backup_path="$1"
    local dry_run="$2"
    
    print_status "Restoring application files..."
    
    if [ ! -f "$backup_path/application.tar.gz" ]; then
        print_warning "Application backup not found, skipping application restore"
        return 0
    fi
    
    if [ "$dry_run" = "true" ]; then
        print_status "DRY RUN: Would restore application from $backup_path/application.tar.gz"
        return 0
    fi
    
    # Create restore directory
    mkdir -p "$RESTORE_DIR"
    
    # Extract application backup
    tar -xzf "$backup_path/application.tar.gz" -C "$RESTORE_DIR"
    
    # Copy files to current directory
    cp -r "$RESTORE_DIR"/* .
    
    # Clean up restore directory
    rm -rf "$RESTORE_DIR"
    
    print_success "Application restore completed"
}

# Function to restore configuration
restore_config() {
    local backup_path="$1"
    local dry_run="$2"
    
    print_status "Restoring configuration files..."
    
    if [ ! -f "$backup_path/config.tar.gz" ]; then
        print_warning "Configuration backup not found, skipping configuration restore"
        return 0
    fi
    
    if [ "$dry_run" = "true" ]; then
        print_status "DRY RUN: Would restore configuration from $backup_path/config.tar.gz"
        return 0
    fi
    
    # Create restore directory
    mkdir -p "$RESTORE_DIR"
    
    # Extract configuration backup
    tar -xzf "$backup_path/config.tar.gz" -C "$RESTORE_DIR"
    
    # Copy configuration files
    cp -r "$RESTORE_DIR"/* .
    
    # Clean up restore directory
    rm -rf "$RESTORE_DIR"
    
    print_success "Configuration restore completed"
}

# Function to show restore summary
show_restore_summary() {
    local backup_name="$1"
    local backup_path="$BACKUP_DIR/$backup_name"
    local manifest_file="$backup_path/manifest.json"
    
    print_status "Restore summary for: $backup_name"
    
    if [ -f "$manifest_file" ]; then
        echo "Backup timestamp: $(jq -r '.timestamp' "$manifest_file")"
        echo "Backup version: $(jq -r '.version' "$manifest_file")"
        echo "Backup size: $(jq -r '.size.total' "$manifest_file")"
        echo ""
        echo "Components:"
        jq -r '.components | to_entries[] | "  \(.key): \(.value)"' "$manifest_file"
    else
        echo "Manifest file not found"
    fi
}

# Main restore function
main() {
    local dry_run="false"
    local force="false"
    local backup_name=""
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            -l|--list)
                list_backups
                exit 0
                ;;
            -d|--dry-run)
                dry_run="true"
                shift
                ;;
            -f|--force)
                force="true"
                shift
                ;;
            *)
                backup_name="$1"
                shift
                ;;
        esac
    done
    
    if [ -z "$backup_name" ]; then
        print_error "Backup name is required"
        show_usage
        exit 1
    fi
    
    local backup_path="$BACKUP_DIR/$backup_name"
    
    # Verify backup
    if [ "$force" != "true" ]; then
        if ! verify_backup "$backup_name"; then
            print_error "Backup verification failed. Use --force to override."
            exit 1
        fi
    fi
    
    # Show restore summary
    show_restore_summary "$backup_name"
    
    # Confirmation prompt
    if [ "$dry_run" != "true" ]; then
        echo ""
        print_warning "This will restore the Autolanka platform from backup: $backup_name"
        print_warning "Are you sure you want to continue? (y/N)"
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            print_status "Restore cancelled."
            exit 0
        fi
    fi
    
    print_status "Starting restore process for: $backup_name"
    
    # Restore components
    restore_database "$backup_path" "$dry_run"
    restore_redis "$backup_path" "$dry_run"
    restore_s3 "$backup_path" "$dry_run"
    restore_application "$backup_path" "$dry_run"
    restore_config "$backup_path" "$dry_run"
    
    if [ "$dry_run" = "true" ]; then
        print_success "Dry run completed successfully!"
    else
        print_success "Restore process completed successfully!"
        print_status "Please restart the Autolanka services to apply changes."
    fi
}

# Run main function
main "$@"
