#!/bin/bash

# Autolanka Backup Cron Setup Script
# This script sets up automated backup scheduling

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
BACKUP_SCRIPT="$(pwd)/scripts/backup.sh"
CRON_USER="root"
BACKUP_SCHEDULE="0 2 * * *"  # Daily at 2 AM

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run this script as root or with sudo"
    exit 1
fi

print_status "Setting up automated backup scheduling..."

# Check if backup script exists
if [ ! -f "$BACKUP_SCRIPT" ]; then
    print_error "Backup script not found: $BACKUP_SCRIPT"
    exit 1
fi

# Make backup script executable
chmod +x "$BACKUP_SCRIPT"

# Create backup log directory
mkdir -p /var/log/autolanka
chown $CRON_USER:$CRON_USER /var/log/autolanka

# Create cron job entry
CRON_ENTRY="$BACKUP_SCHEDULE $BACKUP_SCRIPT >> /var/log/autolanka/backup.log 2>&1"

# Check if cron job already exists
if crontab -u $CRON_USER -l 2>/dev/null | grep -q "$BACKUP_SCRIPT"; then
    print_warning "Backup cron job already exists"
    echo "Current cron jobs:"
    crontab -u $CRON_USER -l | grep "$BACKUP_SCRIPT"
else
    # Add cron job
    (crontab -u $CRON_USER -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -u $CRON_USER -
    print_success "Backup cron job added"
fi

# Create log rotation configuration
print_status "Setting up log rotation..."
cat > /etc/logrotate.d/autolanka-backup << EOF
/var/log/autolanka/backup.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 $CRON_USER $CRON_USER
    postrotate
        systemctl reload rsyslog > /dev/null 2>&1 || true
    endscript
}
EOF

# Create backup monitoring script
print_status "Creating backup monitoring script..."
cat > /usr/local/bin/autolanka-backup-monitor.sh << 'EOF'
#!/bin/bash

# Autolanka Backup Monitor
# This script monitors backup status and sends alerts if needed

BACKUP_LOG="/var/log/autolanka/backup.log"
ALERT_EMAIL="admin@autolanka.com"
RETENTION_DAYS=7

# Check if backup log exists
if [ ! -f "$BACKUP_LOG" ]; then
    echo "Backup log not found: $BACKUP_LOG"
    exit 1
fi

# Check last backup status
LAST_BACKUP=$(tail -n 50 "$BACKUP_LOG" | grep -E "\[SUCCESS\]|\[ERROR\]" | tail -n 1)

if echo "$LAST_BACKUP" | grep -q "\[ERROR\]"; then
    echo "Backup failed: $LAST_BACKUP"
    # Send alert email (requires mailutils)
    echo "Backup failed: $LAST_BACKUP" | mail -s "Autolanka Backup Failed" "$ALERT_EMAIL"
    exit 1
elif echo "$LAST_BACKUP" | grep -q "\[SUCCESS\]"; then
    echo "Backup successful: $LAST_BACKUP"
    exit 0
else
    echo "No recent backup status found"
    exit 1
fi
EOF

chmod +x /usr/local/bin/autolanka-backup-monitor.sh

# Add backup monitoring to cron (run 30 minutes after backup)
MONITOR_CRON="30 2 * * * /usr/local/bin/autolanka-backup-monitor.sh >> /var/log/autolanka/backup-monitor.log 2>&1"

if crontab -u $CRON_USER -l 2>/dev/null | grep -q "autolanka-backup-monitor.sh"; then
    print_warning "Backup monitoring cron job already exists"
else
    (crontab -u $CRON_USER -l 2>/dev/null; echo "$MONITOR_CRON") | crontab -u $CRON_USER -
    print_success "Backup monitoring cron job added"
fi

# Create backup cleanup script
print_status "Creating backup cleanup script..."
cat > /usr/local/bin/autolanka-backup-cleanup.sh << 'EOF'
#!/bin/bash

# Autolanka Backup Cleanup
# This script cleans up old backup files

BACKUP_DIR="/backups/autolanka"
RETENTION_DAYS=30

if [ ! -d "$BACKUP_DIR" ]; then
    echo "Backup directory not found: $BACKUP_DIR"
    exit 1
fi

# Clean up old backups
find "$BACKUP_DIR" -name "autolanka_backup_*" -type d -mtime +$RETENTION_DAYS -exec rm -rf {} \;
find "$BACKUP_DIR" -name "autolanka_backup_*.sql" -type f -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "autolanka_backup_*.rdb" -type f -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "autolanka_backup_*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "autolanka_backup_*.json" -type f -mtime +$RETENTION_DAYS -delete

echo "Backup cleanup completed"
EOF

chmod +x /usr/local/bin/autolanka-backup-cleanup.sh

# Add cleanup to cron (run daily at 3 AM)
CLEANUP_CRON="0 3 * * * /usr/local/bin/autolanka-backup-cleanup.sh >> /var/log/autolanka/backup-cleanup.log 2>&1"

if crontab -u $CRON_USER -l 2>/dev/null | grep -q "autolanka-backup-cleanup.sh"; then
    print_warning "Backup cleanup cron job already exists"
else
    (crontab -u $CRON_USER -l 2>/dev/null; echo "$CLEANUP_CRON") | crontab -u $CRON_USER -
    print_success "Backup cleanup cron job added"
fi

# Show current cron jobs
print_status "Current cron jobs for $CRON_USER:"
crontab -u $CRON_USER -l

print_success "Automated backup scheduling setup completed!"

print_status "Backup schedule:"
echo "  - Daily backup: 2:00 AM"
echo "  - Backup monitoring: 2:30 AM"
echo "  - Backup cleanup: 3:00 AM"

print_status "Log files:"
echo "  - Backup log: /var/log/autolanka/backup.log"
echo "  - Monitor log: /var/log/autolanka/backup-monitor.log"
echo "  - Cleanup log: /var/log/autolanka/backup-cleanup.log"

print_warning "Make sure to:"
print_warning "1. Configure email alerts in /usr/local/bin/autolanka-backup-monitor.sh"
print_warning "2. Test the backup script manually"
print_warning "3. Monitor the backup logs regularly"
print_warning "4. Verify backup retention settings"
