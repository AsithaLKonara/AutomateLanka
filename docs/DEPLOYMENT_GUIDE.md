# Autolanka Deployment Guide

## Overview

This guide covers deploying the Autolanka SaaS platform to various environments, from local development to production.

## Prerequisites

- Node.js 18+ and npm/pnpm
- Docker and Docker Compose
- PostgreSQL 14+
- Redis 6+
- MinIO or AWS S3
- Domain name (for production)
- SSL certificates (for production)

## Environment Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd n8n-workflows-main
cp env.example .env
# Edit .env with your configuration
pnpm install
```

### 2. Database Setup

```bash
# Generate Prisma client
pnpm db:generate

# Run database migrations
pnpm db:migrate

# Seed initial data (optional)
pnpm db:seed
```

### 3. Environment Variables

Copy `env.example` to `.env` and configure:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/autolanka_dev"

# Redis
REDIS_URL="redis://localhost:6379"

# S3/MinIO
S3_ENDPOINT="http://localhost:9000"
S3_ACCESS_KEY="your-access-key"
S3_SECRET_KEY="your-secret-key"
S3_BUCKET="autolanka-dev"

# Authentication (Clerk)
CLERK_SECRET_KEY="sk_test_..."
CLERK_PUBLISHABLE_KEY="pk_test_..."

# OpenAI
OPENAI_API_KEY="sk-..."

# Social Media APIs
INSTAGRAM_CLIENT_ID="..."
INSTAGRAM_CLIENT_SECRET="..."
# ... other social media credentials
```

## Local Development

### Using Docker Compose (Recommended)

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up --build

# Or start specific services
docker-compose -f docker-compose.dev.yml up postgres redis minio
```

### Manual Setup

```bash
# Terminal 1: Database
docker run -d --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:14

# Terminal 2: Redis
docker run -d --name redis -p 6379:6379 redis:6-alpine

# Terminal 3: MinIO
docker run -d --name minio -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio server /data --console-address ":9001"

# Terminal 4: Backend
cd apps/backend
pnpm dev

# Terminal 5: Frontend
cd apps/frontend
pnpm dev

# Terminal 6: ML Service
cd services/ml
python -m uvicorn main:app --reload --port 8001
```

## Production Deployment

### 1. Server Requirements

**Minimum Requirements:**
- 4 CPU cores
- 8GB RAM
- 100GB SSD storage
- Ubuntu 20.04+ or CentOS 8+

**Recommended:**
- 8 CPU cores
- 16GB RAM
- 500GB SSD storage
- Load balancer
- CDN

### 2. Docker Production Deployment

```bash
# Build and start production services
docker-compose -f docker-compose.prod.yml up -d --build

# Check service status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 3. Manual Production Setup

#### Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
npm install -g pnpm

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### Database Setup

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE autolanka_prod;
CREATE USER autolanka WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE autolanka_prod TO autolanka;
\q
```

#### Application Deployment

```bash
# Clone repository
git clone <repository-url> /opt/autolanka
cd /opt/autolanka

# Install dependencies
pnpm install

# Build applications
pnpm build

# Set up environment
cp env.example .env
# Edit .env with production values

# Run database migrations
pnpm db:migrate

# Set up systemd service
sudo cp scripts/autolanka.service /etc/systemd/system/
sudo systemctl enable autolanka
sudo systemctl start autolanka
```

### 4. Nginx Configuration

```bash
# Install Nginx
sudo apt install nginx

# Copy configuration
sudo cp nginx/nginx.conf /etc/nginx/sites-available/autolanka
sudo ln -s /etc/nginx/sites-available/autolanka /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 5. SSL Certificate Setup

#### Using Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Manual SSL Setup

```bash
# Generate self-signed certificate (development only)
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Or use your own certificate
# Copy your certificate files to /etc/ssl/autolanka/
```

### 6. Monitoring Setup

#### Prometheus and Grafana

```bash
# Start monitoring stack
docker-compose -f monitoring/docker-compose.yml up -d

# Access Grafana
# URL: http://yourdomain.com:3001
# Default credentials: admin/admin
```

#### Log Management

```bash
# Set up log rotation
sudo cp scripts/logrotate.conf /etc/logrotate.d/autolanka

# Configure log aggregation (optional)
# Use ELK stack or similar solution
```

## Cloud Deployment

### AWS Deployment

#### Using AWS ECS

```bash
# Build and push Docker images
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com

docker build -t autolanka-frontend -f apps/frontend/Dockerfile.prod .
docker build -t autolanka-backend -f apps/backend/Dockerfile.prod .
docker build -t autolanka-ml -f services/ml/Dockerfile.prod .

docker tag autolanka-frontend:latest <account>.dkr.ecr.us-east-1.amazonaws.com/autolanka-frontend:latest
docker tag autolanka-backend:latest <account>.dkr.ecr.us-east-1.amazonaws.com/autolanka-backend:latest
docker tag autolanka-ml:latest <account>.dkr.ecr.us-east-1.amazonaws.com/autolanka-ml:latest

docker push <account>.dkr.ecr.us-east-1.amazonaws.com/autolanka-frontend:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/autolanka-backend:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/autolanka-ml:latest
```

#### Using AWS EKS

```bash
# Create EKS cluster
eksctl create cluster --name autolanka-cluster --region us-east-1 --nodes 3

# Deploy using Helm
helm install autolanka ./helm/autolanka --values ./helm/autolanka/values-prod.yaml
```

### Google Cloud Platform

#### Using Google Cloud Run

```bash
# Build and deploy to Cloud Run
gcloud builds submit --tag gcr.io/PROJECT-ID/autolanka-frontend
gcloud run deploy autolanka-frontend --image gcr.io/PROJECT-ID/autolanka-frontend --platform managed --region us-central1

gcloud builds submit --tag gcr.io/PROJECT-ID/autolanka-backend
gcloud run deploy autolanka-backend --image gcr.io/PROJECT-ID/autolanka-backend --platform managed --region us-central1
```

### DigitalOcean

#### Using DigitalOcean App Platform

```yaml
# .do/app.yaml
name: autolanka
services:
- name: frontend
  source_dir: apps/frontend
  github:
    repo: your-username/autolanka
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  http_port: 3000
  routes:
  - path: /
- name: backend
  source_dir: apps/backend
  github:
    repo: your-username/autolanka
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  http_port: 8000
  routes:
  - path: /api
```

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: pnpm install
      
    - name: Run tests
      run: pnpm test
      
    - name: Build applications
      run: pnpm build
      
    - name: Deploy to production
      run: |
        # Add your deployment commands here
        echo "Deploying to production..."
```

### GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

test:
  stage: test
  script:
    - pnpm install
    - pnpm test
  only:
    - main

build:
  stage: build
  script:
    - pnpm install
    - pnpm build
  artifacts:
    paths:
      - apps/frontend/dist
      - apps/backend/dist
  only:
    - main

deploy:
  stage: deploy
  script:
    - echo "Deploying to production..."
  only:
    - main
```

## Backup and Recovery

### Database Backup

```bash
# Create backup script
#!/bin/bash
BACKUP_DIR="/opt/backups/autolanka"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup PostgreSQL
pg_dump -h localhost -U autolanka autolanka_prod > $BACKUP_DIR/db_$DATE.sql

# Backup Redis
redis-cli --rdb $BACKUP_DIR/redis_$DATE.rdb

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /opt/autolanka

# Clean old backups (keep 30 days)
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: $DATE"
```

### Automated Backups

```bash
# Add to crontab
0 2 * * * /opt/autolanka/scripts/backup.sh
```

### Recovery

```bash
# Restore database
psql -h localhost -U autolanka autolanka_prod < /opt/backups/autolanka/db_20240115_020000.sql

# Restore Redis
redis-cli --pipe < /opt/backups/autolanka/redis_20240115_020000.rdb

# Restore application files
tar -xzf /opt/backups/autolanka/app_20240115_020000.tar.gz -C /
```

## Security Hardening

### 1. System Security

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Configure firewall
sudo ufw enable
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS

# Disable root login
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart ssh

# Install fail2ban
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 2. Application Security

```bash
# Set secure file permissions
chmod 600 .env
chmod 600 /etc/ssl/autolanka/*.key

# Use non-root user for application
sudo useradd -r -s /bin/false autolanka
sudo chown -R autolanka:autolanka /opt/autolanka
```

### 3. Database Security

```bash
# Configure PostgreSQL
sudo -u postgres psql
ALTER USER autolanka PASSWORD 'new_secure_password';
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO autolanka;
\q

# Update pg_hba.conf
sudo nano /etc/postgresql/14/main/pg_hba.conf
# Change: local all all md5
sudo systemctl restart postgresql
```

## Monitoring and Alerting

### 1. Health Checks

```bash
# Application health check
curl -f http://localhost:8000/api/health || exit 1

# Database health check
pg_isready -h localhost -p 5432 || exit 1

# Redis health check
redis-cli ping || exit 1
```

### 2. Log Monitoring

```bash
# Set up log monitoring with ELK stack
docker-compose -f monitoring/elk-stack.yml up -d

# Configure log shipping
# Use Filebeat or similar to ship logs to Elasticsearch
```

### 3. Performance Monitoring

```bash
# Install monitoring tools
sudo apt install htop iotop nethogs

# Set up Prometheus monitoring
docker-compose -f monitoring/prometheus.yml up -d

# Configure Grafana dashboards
# Import dashboards from monitoring/grafana/dashboards/
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -h localhost -U autolanka -d autolanka_prod

# Check logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

#### 2. Redis Connection Issues

```bash
# Check Redis status
sudo systemctl status redis

# Test connection
redis-cli ping

# Check logs
sudo tail -f /var/log/redis/redis-server.log
```

#### 3. Application Issues

```bash
# Check application logs
sudo journalctl -u autolanka -f

# Check Docker logs
docker-compose -f docker-compose.prod.yml logs -f backend

# Check Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

#### 4. SSL Certificate Issues

```bash
# Check certificate
openssl x509 -in /etc/ssl/autolanka/cert.pem -text -noout

# Test SSL
openssl s_client -connect yourdomain.com:443

# Renew Let's Encrypt certificate
sudo certbot renew --dry-run
```

### Performance Optimization

#### 1. Database Optimization

```sql
-- Add indexes
CREATE INDEX CONCURRENTLY idx_media_org_id ON media(org_id);
CREATE INDEX CONCURRENTLY idx_posts_scheduled_at ON scheduled_posts(scheduled_at);

-- Analyze tables
ANALYZE;

-- Check slow queries
SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;
```

#### 2. Application Optimization

```bash
# Enable gzip compression
# Add to Nginx config:
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

# Enable caching
# Add to Nginx config:
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

#### 3. Redis Optimization

```bash
# Configure Redis for performance
# Edit /etc/redis/redis.conf:
maxmemory 2gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

## Scaling

### Horizontal Scaling

#### 1. Load Balancer Setup

```bash
# Install HAProxy
sudo apt install haproxy

# Configure HAProxy
sudo nano /etc/haproxy/haproxy.cfg
```

```haproxy
global
    daemon

defaults
    mode http
    timeout connect 5000ms
    timeout client 50000ms
    timeout server 50000ms

frontend autolanka_frontend
    bind *:80
    bind *:443 ssl crt /etc/ssl/autolanka/cert.pem
    redirect scheme https if !{ ssl_fc }
    default_backend autolanka_backend

backend autolanka_backend
    balance roundrobin
    server app1 127.0.0.1:8000 check
    server app2 127.0.0.1:8001 check
    server app3 127.0.0.1:8002 check
```

#### 2. Database Scaling

```bash
# Set up read replicas
# Configure PostgreSQL streaming replication
# Update application to use read replicas for queries
```

#### 3. Cache Scaling

```bash
# Set up Redis Cluster
redis-cli --cluster create 127.0.0.1:7000 127.0.0.1:7001 127.0.0.1:7002 127.0.0.1:7003 127.0.0.1:7004 127.0.0.1:7005 --cluster-replicas 1
```

## Support

For deployment support:
- Email: deploy-support@autolanka.com
- Documentation: https://docs.autolanka.com/deployment
- Community: https://community.autolanka.com
- Status Page: https://status.autolanka.com

