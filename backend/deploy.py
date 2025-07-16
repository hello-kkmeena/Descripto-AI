#!/usr/bin/env python3
"""
Deployment script for Descripto-AI Backend
Helps configure the application for production deployment
"""

import os
import sys
from pathlib import Path

def create_production_env():
    """Create production environment configuration"""
    env_file = Path('.env.production')
    
    env_content = """# Production Configuration
FLASK_ENV=production
PORT=5000
SECRET_KEY=CHANGE_THIS_TO_A_SECURE_SECRET_KEY

# OpenAI Configuration
OPENAI_API_KEY=your-production-openai-api-key

# CORS Configuration - Update with your domain
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Logging Configuration
LOG_LEVEL=WARNING

# Rate Limiting - More restrictive for production
RATELIMIT_DEFAULT=100 per day

# Database Configuration (for future use)
DATABASE_URL=postgresql://user:password@host:port/db

# Redis Configuration (for future caching)
REDIS_URL=redis://localhost:6379/0
"""
    
    with open(env_file, 'w') as f:
        f.write(env_content)
    
    print("✓ Created .env.production file")
    print("⚠️  Please update the production environment variables")

def create_gunicorn_config():
    """Create Gunicorn configuration for production"""
    gunicorn_config = """# Gunicorn configuration for Descripto-AI Backend
import multiprocessing

# Server socket
bind = "0.0.0.0:5000"
backlog = 2048

# Worker processes
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
worker_connections = 1000
timeout = 30
keepalive = 2

# Restart workers after this many requests, to help prevent memory leaks
max_requests = 1000
max_requests_jitter = 50

# Logging
accesslog = "logs/gunicorn_access.log"
errorlog = "logs/gunicorn_error.log"
loglevel = "info"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# Process naming
proc_name = "descripto-ai-backend"

# Server mechanics
daemon = False
pidfile = "logs/gunicorn.pid"
user = None
group = None
tmp_upload_dir = None

# SSL (uncomment for HTTPS)
# keyfile = "path/to/keyfile"
# certfile = "path/to/certfile"
"""
    
    with open('gunicorn.conf.py', 'w') as f:
        f.write(gunicorn_config)
    
    print("✓ Created gunicorn.conf.py")

def create_systemd_service():
    """Create systemd service file"""
    service_content = """[Unit]
Description=Descripto-AI Backend
After=network.target

[Service]
Type=notify
User=www-data
Group=www-data
WorkingDirectory=/path/to/descripto-ai/backend
Environment=PATH=/path/to/descripto-ai/backend/venv/bin
ExecStart=/path/to/descripto-ai/backend/venv/bin/gunicorn --config gunicorn.conf.py app:app
ExecReload=/bin/kill -s HUP $MAINPID
KillMode=mixed
TimeoutStopSec=5
PrivateTmp=true

[Install]
WantedBy=multi-user.target
"""
    
    with open('descripto-ai-backend.service', 'w') as f:
        f.write(service_content)
    
    print("✓ Created descripto-ai-backend.service")
    print("⚠️  Update the paths in the service file before installing")

def create_nginx_config():
    """Create Nginx configuration"""
    nginx_config = """server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Proxy to Flask app
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # Static files (if any)
    location /static/ {
        alias /path/to/descripto-ai/backend/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:5000/health;
        access_log off;
    }
}
"""
    
    with open('nginx-descripto-ai.conf', 'w') as f:
        f.write(nginx_config)
    
    print("✓ Created nginx-descripto-ai.conf")
    print("⚠️  Update domain names and SSL certificate paths")

def create_dockerfile():
    """Create Dockerfile for containerized deployment"""
    dockerfile_content = """FROM python:3.9-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV FLASK_ENV=production

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    gcc \\
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Create logs directory
RUN mkdir -p logs

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 5000

# Run the application
CMD ["gunicorn", "--config", "gunicorn.conf.py", "app:app"]
"""
    
    with open('Dockerfile', 'w') as f:
        f.write(dockerfile_content)
    
    print("✓ Created Dockerfile")

def create_docker_compose():
    """Create docker-compose.yml for easy deployment"""
    compose_content = """version: '3.8'

services:
  backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - SECRET_KEY=${SECRET_KEY}
      - CORS_ORIGINS=${CORS_ORIGINS}
      - LOG_LEVEL=WARNING
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Redis for caching (optional)
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  redis_data:
"""
    
    with open('docker-compose.yml', 'w') as f:
        f.write(compose_content)
    
    print("✓ Created docker-compose.yml")

def main():
    """Main deployment setup function"""
    print("🚀 Setting up Descripto-AI Backend for Production...")
    print()
    
    print("Creating production configuration files...")
    create_production_env()
    print()
    
    print("Creating server configuration...")
    create_gunicorn_config()
    print()
    
    print("Creating systemd service...")
    create_systemd_service()
    print()
    
    print("Creating Nginx configuration...")
    create_nginx_config()
    print()
    
    print("Creating Docker configuration...")
    create_dockerfile()
    create_docker_compose()
    print()
    
    print("✅ Production configuration files created!")
    print()
    print("Next steps:")
    print("1. Update .env.production with your production values")
    print("2. Update paths in descripto-ai-backend.service")
    print("3. Update domain and SSL paths in nginx-descripto-ai.conf")
    print("4. Install dependencies: pip install gunicorn")
    print("5. Test with: gunicorn --config gunicorn.conf.py app:app")
    print()
    print("For Docker deployment:")
    print("1. docker-compose up -d")
    print()
    print("For systemd deployment:")
    print("1. sudo cp descripto-ai-backend.service /etc/systemd/system/")
    print("2. sudo systemctl enable descripto-ai-backend")
    print("3. sudo systemctl start descripto-ai-backend")

if __name__ == "__main__":
    main() 