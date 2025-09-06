@echo off
REM PulseCollab Deployment Script for Windows
setlocal enabledelayedexpansion

echo 🚀 Starting PulseCollab deployment...

REM Configuration
set PROJECT_NAME=pulsecollab
set ENV=%1
if "%ENV%"=="" set ENV=development
set DOMAIN=%2
if "%DOMAIN%"=="" set DOMAIN=localhost

echo 📋 Deployment Configuration:
echo    Environment: %ENV%
echo    Domain: %DOMAIN%
echo    Project: %PROJECT_NAME%

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)

REM Create environment file if it doesn't exist
if not exist .env (
    echo 📝 Creating environment file...
    (
        echo # Database Configuration
        echo DB_HOST=postgres
        echo DB_PORT=5432
        echo DB_NAME=pulsecollab
        echo DB_USER=postgres
        echo DB_PASSWORD=password123
        echo.
        echo # Redis Configuration
        echo REDIS_URL=redis://redis:6379
        echo.
        echo # JWT Configuration
        echo JWT_SECRET=your-super-secret-jwt-key-change-in-production
        echo REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key
        echo.
        echo # Email Configuration (Update with your SMTP settings^)
        echo EMAIL_HOST=smtp.gmail.com
        echo EMAIL_PORT=587
        echo EMAIL_USER=your-email@gmail.com
        echo EMAIL_PASS=your-email-password
        echo.
        echo # OAuth Configuration (Update with your OAuth app credentials^)
        echo GOOGLE_CLIENT_ID=your-google-client-id
        echo GOOGLE_CLIENT_SECRET=your-google-client-secret
        echo GITHUB_CLIENT_ID=your-github-client-id
        echo GITHUB_CLIENT_SECRET=your-github-client-secret
        echo MICROSOFT_CLIENT_ID=your-microsoft-client-id
        echo MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
        echo.
        echo # Application URLs
        echo FRONTEND_URL=http://%DOMAIN%:3000
        echo BACKEND_URL=http://%DOMAIN%:3001
        echo.
        echo # Environment
        echo NODE_ENV=%ENV%
    ) > .env
    echo ✅ Environment file created. Please update it with your actual credentials.
)

REM Create uploads directory
if not exist uploads mkdir uploads

REM Pull latest images
echo 📦 Pulling latest Docker images...
docker-compose pull

REM Build and start services
echo 🔨 Building and starting services...
if "%ENV%"=="production" (
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
) else (
    docker-compose up --build -d
)

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Check service health
echo 🔍 Checking service health...
docker-compose ps

echo.
echo 🎉 PulseCollab deployment completed successfully!
echo.
echo 📍 Access URLs:
echo    Frontend: http://%DOMAIN%:3000
echo    Backend API: http://%DOMAIN%:3001/api
echo    Database: postgres://%DOMAIN%:5432/pulsecollab
echo.
echo 📋 Next Steps:
echo 1. Update the .env file with your actual credentials
echo 2. Configure your domain/DNS settings if deploying to production
echo 3. Set up SSL certificates for production deployment
echo 4. Configure your OAuth applications with the correct redirect URLs
echo.
echo 📖 Useful Commands:
echo    View logs: docker-compose logs -f [service_name]
echo    Stop services: docker-compose down
echo    Restart services: docker-compose restart
echo    Update services: docker-compose pull ^&^& docker-compose up -d

if "%ENV%"=="production" (
    echo.
    echo 🔒 Production Deployment Notes:
    echo    - Make sure to use strong passwords and secrets
    echo    - Configure proper backup strategies for the database
    echo    - Set up monitoring and alerting
    echo    - Enable SSL/TLS certificates
    echo    - Review and harden security settings
)

pause
