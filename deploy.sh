#!/bin/bash

# PulseCollab Deployment Script
set -e

echo "🚀 Starting PulseCollab deployment..."

# Configuration
PROJECT_NAME="pulsecollab"
ENV=${1:-development}
DOMAIN=${2:-localhost}

echo "📋 Deployment Configuration:"
echo "   Environment: $ENV"
echo "   Domain: $DOMAIN"
echo "   Project: $PROJECT_NAME"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cat > .env << EOF
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=pulsecollab
DB_USER=postgres
DB_PASSWORD=password123

# Redis Configuration
REDIS_URL=redis://redis:6379

# JWT Configuration
JWT_SECRET=$(openssl rand -base64 32)
REFRESH_TOKEN_SECRET=$(openssl rand -base64 32)

# Email Configuration (Update with your SMTP settings)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password

# OAuth Configuration (Update with your OAuth app credentials)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret

# Application URLs
FRONTEND_URL=http://$DOMAIN:3000
BACKEND_URL=http://$DOMAIN:3001

# Environment
NODE_ENV=$ENV
EOF
    echo "✅ Environment file created. Please update it with your actual credentials."
fi

# Create uploads directory
mkdir -p uploads
chmod 755 uploads

# Pull latest images
echo "📦 Pulling latest Docker images..."
docker-compose pull

# Build and start services
echo "🔨 Building and starting services..."
if [ "$ENV" = "production" ]; then
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
else
    docker-compose up --build -d
fi

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Run database migrations
echo "📊 Running database migrations..."
docker-compose exec backend sh /usr/local/bin/docker-entrypoint.sh migrate

# Check service health
echo "🔍 Checking service health..."
services=("postgres" "redis" "backend" "frontend")
for service in "${services[@]}"; do
    if docker-compose ps | grep -q "$service.*Up"; then
        echo "✅ $service is running"
    else
        echo "❌ $service is not running"
        docker-compose logs $service
        exit 1
    fi
done

# Display access information
echo ""
echo "🎉 PulseCollab deployment completed successfully!"
echo ""
echo "📍 Access URLs:"
echo "   Frontend: http://$DOMAIN:3000"
echo "   Backend API: http://$DOMAIN:3001/api"
echo "   Database: postgres://$DOMAIN:5432/pulsecollab"
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "📋 Next Steps:"
echo "1. Update the .env file with your actual credentials"
echo "2. Configure your domain/DNS settings if deploying to production"
echo "3. Set up SSL certificates for production deployment"
echo "4. Configure your OAuth applications with the correct redirect URLs"
echo ""
echo "📖 Useful Commands:"
echo "   View logs: docker-compose logs -f [service_name]"
echo "   Stop services: docker-compose down"
echo "   Restart services: docker-compose restart"
echo "   Update services: docker-compose pull && docker-compose up -d"
echo ""

if [ "$ENV" = "production" ]; then
    echo "🔒 Production Deployment Notes:"
    echo "   - Make sure to use strong passwords and secrets"
    echo "   - Configure proper backup strategies for the database"
    echo "   - Set up monitoring and alerting"
    echo "   - Enable SSL/TLS certificates"
    echo "   - Review and harden security settings"
fi
