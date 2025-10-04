#!/bin/bash

# Autolanka Production Deployment Script
# This script handles the deployment of the Autolanka SaaS platform

set -euo pipefail

# Configuration
PROJECT_NAME="autolanka"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"
BACKUP_DIR="/opt/autolanka/backups"
LOG_FILE="/var/log/autolanka/deploy.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root"
    fi
}

# Check system requirements
check_requirements() {
    log "Checking system requirements..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed"
    fi
    
    # Check available disk space (minimum 10GB)
    available_space=$(df / | awk 'NR==2 {print $4}')
    if [[ $available_space -lt 10485760 ]]; then
        warning "Low disk space: $(df -h / | awk 'NR==2 {print $4}') available"
    fi
    
    # Check memory (minimum 4GB)
    total_memory=$(free -m | awk 'NR==2{print $2}')
    if [[ $total_memory -lt 4096 ]]; then
        warning "Low memory: ${total_memory}MB available"
    fi
    
    success "System requirements check passed"
}

# Create necessary directories
create_directories() {
    log "Creating necessary directories..."
    
    sudo mkdir -p "$BACKUP_DIR"
    sudo mkdir -p "/var/log/autolanka"
    sudo mkdir -p "/opt/autolanka/nginx/ssl"
    sudo mkdir -p "/opt/autolanka/monitoring"
    sudo mkdir -p "/opt/autolanka/scripts"
    
    # Set permissions
    sudo chown -R $(whoami):$(whoami) "$BACKUP_DIR"
    sudo chown -R $(whoami):$(whoami) "/var/log/autolanka"
    
    success "Directories created"
}

# Backup current deployment
backup_current() {
    log "Creating backup of current deployment..."
    
    local backup_timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_path="$BACKUP_DIR/backup_$backup_timestamp"
    
    mkdir -p "$backup_path"
    
    # Backup database
    if docker-compose -f "$DOCKER_COMPOSE_FILE" ps postgres | grep -q "Up"; then
        log "Backing up PostgreSQL database..."
        docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > "$backup_path/database.sql"
    fi
    
    # Backup Redis data
    if docker-compose -f "$DOCKER_COMPOSE_FILE" ps redis | grep -q "Up"; then
        log "Backing up Redis data..."
        docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T redis redis-cli --rdb "$backup_path/redis.rdb"
    fi
    
    # Backup MinIO data
    if docker-compose -f "$DOCKER_COMPOSE_FILE" ps minio | grep -q "Up"; then
        log "Backing up MinIO data..."
        cp -r /opt/autolanka/minio_data "$backup_path/"
    fi
    
    # Backup configuration files
    log "Backing up configuration files..."
    cp -r /opt/autolanka/nginx "$backup_path/"
    cp -r /opt/autolanka/monitoring "$backup_path/"
    cp "$DOCKER_COMPOSE_FILE" "$backup_path/"
    cp .env "$backup_path/" 2>/dev/null || true
    
    # Compress backup
    tar -czf "$backup_path.tar.gz" -C "$BACKUP_DIR" "backup_$backup_timestamp"
    rm -rf "$backup_path"
    
    success "Backup created: $backup_path.tar.gz"
}

# Pull latest images
pull_images() {
    log "Pulling latest Docker images..."
    
    docker-compose -f "$DOCKER_COMPOSE_FILE" pull
    
    success "Images pulled successfully"
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    # Wait for database to be ready
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T postgres pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" &>/dev/null; then
            break
        fi
        
        log "Waiting for database... (attempt $attempt/$max_attempts)"
        sleep 2
        ((attempt++))
    done
    
    if [[ $attempt -gt $max_attempts ]]; then
        error "Database is not ready after $max_attempts attempts"
    fi
    
    # Run migrations
    docker-compose -f "$DOCKER_COMPOSE_FILE" exec backend npx prisma migrate deploy
    
    success "Database migrations completed"
}

# Deploy services
deploy_services() {
    log "Deploying services..."
    
    # Start services
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d
    
    # Wait for services to be healthy
    local max_attempts=60
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        local healthy_services=0
        local total_services=0
        
        # Check each service
        for service in frontend backend ml-service postgres redis minio nginx; do
            ((total_services++))
            if docker-compose -f "$DOCKER_COMPOSE_FILE" ps "$service" | grep -q "healthy\|Up"; then
                ((healthy_services++))
            fi
        done
        
        if [[ $healthy_services -eq $total_services ]]; then
            break
        fi
        
        log "Waiting for services to be healthy... ($healthy_services/$total_services) (attempt $attempt/$max_attempts)"
        sleep 5
        ((attempt++))
    done
    
    if [[ $attempt -gt $max_attempts ]]; then
        error "Services are not healthy after $max_attempts attempts"
    fi
    
    success "Services deployed successfully"
}

# Run health checks
health_checks() {
    log "Running health checks..."
    
    local endpoints=(
        "http://localhost/health"
        "http://localhost/api/health"
        "http://localhost/ml/health"
    )
    
    for endpoint in "${endpoints[@]}"; do
        local max_attempts=10
        local attempt=1
        
        while [[ $attempt -le $max_attempts ]]; do
            if curl -f -s "$endpoint" &>/dev/null; then
                break
            fi
            
            log "Health check failed for $endpoint... (attempt $attempt/$max_attempts)"
            sleep 5
            ((attempt++))
        done
        
        if [[ $attempt -gt $max_attempts ]]; then
            error "Health check failed for $endpoint"
        fi
    done
    
    success "All health checks passed"
}

# Cleanup old images and containers
cleanup() {
    log "Cleaning up old Docker resources..."
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused volumes
    docker volume prune -f
    
    # Remove unused networks
    docker network prune -f
    
    success "Cleanup completed"
}

# Rollback deployment
rollback() {
    log "Rolling back deployment..."
    
    # Stop current services
    docker-compose -f "$DOCKER_COMPOSE_FILE" down
    
    # Find latest backup
    local latest_backup=$(ls -t "$BACKUP_DIR"/backup_*.tar.gz | head -n1)
    
    if [[ -z "$latest_backup" ]]; then
        error "No backup found for rollback"
    fi
    
    log "Rolling back to: $latest_backup"
    
    # Extract backup
    local backup_dir="$BACKUP_DIR/rollback_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    tar -xzf "$latest_backup" -C "$backup_dir" --strip-components=1
    
    # Restore configuration
    cp -r "$backup_dir/nginx"/* /opt/autolanka/nginx/ 2>/dev/null || true
    cp -r "$backup_dir/monitoring"/* /opt/autolanka/monitoring/ 2>/dev/null || true
    cp "$backup_dir/docker-compose.prod.yml" . 2>/dev/null || true
    cp "$backup_dir/.env" . 2>/dev/null || true
    
    # Start services
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d
    
    # Restore database
    if [[ -f "$backup_dir/database.sql" ]]; then
        log "Restoring database..."
        docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T postgres psql -U "$POSTGRES_USER" "$POSTGRES_DB" < "$backup_dir/database.sql"
    fi
    
    # Restore Redis data
    if [[ -f "$backup_dir/redis.rdb" ]]; then
        log "Restoring Redis data..."
        cp "$backup_dir/redis.rdb" /opt/autolanka/redis_data/
        docker-compose -f "$DOCKER_COMPOSE_FILE" restart redis
    fi
    
    # Restore MinIO data
    if [[ -d "$backup_dir/minio_data" ]]; then
        log "Restoring MinIO data..."
        cp -r "$backup_dir/minio_data"/* /opt/autolanka/minio_data/
        docker-compose -f "$DOCKER_COMPOSE_FILE" restart minio
    fi
    
    # Cleanup
    rm -rf "$backup_dir"
    
    success "Rollback completed"
}

# Main deployment function
deploy() {
    log "Starting Autolanka deployment..."
    
    check_root
    check_requirements
    create_directories
    backup_current
    pull_images
    run_migrations
    deploy_services
    health_checks
    cleanup
    
    success "Deployment completed successfully!"
    
    # Display service status
    log "Service status:"
    docker-compose -f "$DOCKER_COMPOSE_FILE" ps
}

# Parse command line arguments
case "${1:-deploy}" in
    deploy)
        deploy
        ;;
    rollback)
        rollback
        ;;
    backup)
        backup_current
        ;;
    health)
        health_checks
        ;;
    cleanup)
        cleanup
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|backup|health|cleanup}"
        exit 1
        ;;
esac
    deploy_services
    health_checks
    cleanup
    
    success "Deployment completed successfully!"
    
    # Display service status
    log "Service status:"
    docker-compose -f "$DOCKER_COMPOSE_FILE" ps
}

# Parse command line arguments
case "${1:-deploy}" in
    deploy)
        deploy
        ;;
    rollback)
        rollback
        ;;
    backup)
        backup_current
        ;;
    health)
        health_checks
        ;;
    cleanup)
        cleanup
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|backup|health|cleanup}"
        exit 1
        ;;
esac