# Deployment Guide

This guide covers various deployment options for AutomateLanka, from local development to production environments.

## 🚀 Quick Start

### Local Development

```bash
# Clone the repository
git clone https://github.com/AsithaLKonara/AutomateLanka.git
cd AutomateLanka

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
python3 run.py --reindex

# Start development server
python3 run.py --dev
```

Access the application at: http://127.0.0.1:8000

## 🐳 Docker Deployment

### Single Container

```bash
# Build the image
docker build -t automatelanka .

# Run the container
docker run -p 8000:8000 automatelanka
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  automatelanka:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - ./database:/app/database
      - ./static:/app/static
    environment:
      - HOST=0.0.0.0
      - PORT=8000
    restart: unless-stopped

  reverse-proxy:
    image: traefik:v2.10
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
    ports:
      - "80:80"
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    depends_on:
      - automatelanka
```

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f
```

## ☸️ Kubernetes Deployment

### Basic Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: automatelanka
  labels:
    app: automatelanka
spec:
  replicas: 2
  selector:
    matchLabels:
      app: automatelanka
  template:
    metadata:
      labels:
        app: automatelanka
    spec:
      containers:
      - name: automatelanka
        image: automatelanka:latest
        ports:
        - containerPort: 8000
        env:
        - name: HOST
          value: "0.0.0.0"
        - name: PORT
          value: "8000"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
        volumeMounts:
        - name: database-storage
          mountPath: /app/database
        - name: static-storage
          mountPath: /app/static
      volumes:
      - name: database-storage
        persistentVolumeClaim:
          claimName: automatelanka-database-pvc
      - name: static-storage
        persistentVolumeClaim:
          claimName: automatelanka-static-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: automatelanka-service
spec:
  selector:
    app: automatelanka
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8000
  type: LoadBalancer
```

### Persistent Volumes

```yaml
# k8s/pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: automatelanka-database-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: automatelanka-static-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
```

### Deploy to Kubernetes

```bash
# Apply configurations
kubectl apply -f k8s/pvc.yaml
kubectl apply -f k8s/deployment.yaml

# Check deployment status
kubectl get pods -l app=automatelanka
kubectl get services

# Get external IP
kubectl get service automatelanka-service
```

## 🎯 Helm Deployment

### Helm Chart

```yaml
# helm/automatelanka/Chart.yaml
apiVersion: v2
name: automatelanka
description: Advanced N8N Workflow Automation Platform
type: application
version: 1.0.0
appVersion: "1.0.0"
keywords:
  - automation
  - n8n
  - workflows
  - api
home: https://github.com/AsithaLKonara/AutomateLanka
sources:
  - https://github.com/AsithaLKonara/AutomateLanka
maintainers:
  - name: AutomateLanka Team
    email: support@automatelanka.com
```

```yaml
# helm/automatelanka/values.yaml
replicaCount: 2

image:
  repository: automatelanka
  tag: "latest"
  pullPolicy: IfNotPresent

service:
  type: LoadBalancer
  port: 80
  targetPort: 8000

ingress:
  enabled: true
  className: ""
  annotations: {}
  hosts:
    - host: automatelanka.local
      paths:
        - path: /
          pathType: Prefix
  tls: []

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi

autoscaling:
  enabled: false
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 80

persistence:
  enabled: true
  storageClass: ""
  accessMode: ReadWriteOnce
  size: 10Gi

config:
  host: "0.0.0.0"
  port: 8000
  debug: false
```

### Deploy with Helm

```bash
# Add Helm repository (if applicable)
helm repo add automatelanka https://charts.automatelanka.com

# Install the chart
helm install automatelanka ./helm/automatelanka

# Upgrade the chart
helm upgrade automatelanka ./helm/automatelanka

# Check status
helm status automatelanka

# Uninstall
helm uninstall automatelanka
```

## 🌐 Production Deployment

### Environment Configuration

```bash
# .env.production
# Database
DATABASE_URL=postgresql://user:password@db:5432/automatelanka

# Server
HOST=0.0.0.0
PORT=8000
DEBUG=false

# Security
SECRET_KEY=your-production-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Features
ENABLE_ANALYTICS=true
ENABLE_MARKETPLACE=true
ENABLE_AI_RECOMMENDATIONS=true

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json
```

### Production Docker Compose

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  automatelanka:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/automatelanka
      - HOST=0.0.0.0
      - PORT=8000
      - DEBUG=false
      - SECRET_KEY=${SECRET_KEY}
    volumes:
      - ./static:/app/static
    depends_on:
      - db
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=automatelanka
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - automatelanka
    restart: unless-stopped

  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    restart: unless-stopped

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  grafana_data:
```

### Nginx Configuration

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream automatelanka {
        server automatelanka:8000;
    }

    server {
        listen 80;
        server_name automatelanka.com;

        # Redirect HTTP to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name automatelanka.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

        # Gzip compression
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

        # Static files
        location /static/ {
            alias /app/static/;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # API endpoints
        location /api/ {
            proxy_pass http://automatelanka;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Main application
        location / {
            proxy_pass http://automatelanka;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

## 📊 Monitoring and Observability

### Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'automatelanka'
    static_configs:
      - targets: ['automatelanka:8000']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:9113']

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:9187']
```

### Grafana Dashboards

```json
{
  "dashboard": {
    "title": "AutomateLanka Metrics",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{endpoint}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      }
    ]
  }
}
```

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check database connectivity
python3 -c "import sqlite3; conn = sqlite3.connect('database/workflows.db'); print('Database connected successfully')"

# Rebuild database
python3 run.py --reindex
```

#### Port Already in Use
```bash
# Find process using port 8000
lsof -i :8000

# Kill process
kill -9 <PID>
```

#### Memory Issues
```bash
# Check memory usage
docker stats

# Increase memory limits
docker run -m 1g automatelanka
```

#### SSL Certificate Issues
```bash
# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Check certificate
openssl x509 -in cert.pem -text -noout
```

### Logs and Debugging

```bash
# View application logs
docker-compose logs -f automatelanka

# View specific service logs
kubectl logs -f deployment/automatelanka

# Debug mode
python3 run.py --dev --debug
```

### Performance Tuning

```bash
# Database optimization
python3 optimize_performance.py

# Clear cache
rm -rf .cache/

# Rebuild indexes
python3 run.py --reindex
```

## 🚀 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
      - name: Run tests
        run: pytest

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker image
        run: docker build -t automatelanka .
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/automatelanka automatelanka=automatelanka:latest
          kubectl rollout status deployment/automatelanka
```

## 📋 Deployment Checklist

### Pre-deployment
- [ ] Code review completed
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Security scan completed
- [ ] Performance testing done
- [ ] Backup strategy in place

### Deployment
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Monitoring configured
- [ ] Health checks passing
- [ ] Load balancer configured

### Post-deployment
- [ ] Application accessible
- [ ] API endpoints responding
- [ ] Database connectivity verified
- [ ] Monitoring alerts configured
- [ ] Performance metrics normal
- [ ] User acceptance testing completed

## 🔐 Security Considerations

### Production Security
- Use strong, unique passwords
- Enable HTTPS with valid certificates
- Configure firewall rules
- Regular security updates
- Monitor for vulnerabilities
- Implement rate limiting
- Use environment variables for secrets
- Enable audit logging

### Database Security
- Encrypt database connections
- Regular backups
- Access control
- Monitor database activity
- Use connection pooling
- Implement query optimization

---

For additional support, refer to:
- 📚 [Documentation](https://github.com/AsithaLKonara/AutomateLanka/wiki)
- 🐛 [Issues](https://github.com/AsithaLKonara/AutomateLanka/issues)
- 💬 [Discussions](https://github.com/AsithaLKonara/AutomateLanka/discussions)