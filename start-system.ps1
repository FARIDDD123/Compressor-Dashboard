# Script to start Digital Twin Gas Turbine 1 System
# Requires Docker Desktop to be installed and running

Write-Host "🚀 Starting Digital Twin Gas Turbine 1 System..." -ForegroundColor Green
Write-Host ""

# Check if Docker is installed
Write-Host "📋 Checking Docker installation..." -ForegroundColor Cyan
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    exit 1
}

# Check if Docker is running
Write-Host "📋 Checking if Docker is running..." -ForegroundColor Cyan
try {
    docker ps | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check if .env file exists
Write-Host "📋 Checking .env file..." -ForegroundColor Cyan
if (Test-Path .env) {
    Write-Host "✅ .env file exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env file not found. Creating default .env..." -ForegroundColor Yellow
    @"
# Database Configuration
DB_HOST=mysql
DB_PORT=3306
DB_USER=app_user
DB_PASSWORD=app_password_123
DB_DATABASE=compressor_db

# MySQL Root Configuration
MYSQL_ROOT_PASSWORD=root_password_123
MYSQL_DATABASE=compressor_db

# InfluxDB Configuration
INFLUXDB_URL=http://influxdb:8086
INFLUXDB_TOKEN=default_token_change_in_production
INFLUXDB_ORG=my-org
INFLUXDB_BUCKET=compressor_metrics
INFLUXDB_USER=admin

# Kafka Configuration
KAFKA_BROKER_URL=kafka:9092
KAFKA_CLUSTER_ID=test-cluster-id-12345
KAFKA_BOOTSTRAP_SERVERS=kafka:9092
KAFKA_INTER_BROKER_LISTENER=PLAINTEXT

# JWT Authentication
JWT_SECRET_KEY=your-secret-jwt-key-change-this-in-production-12345678901234567890
JWT_EXPIRATION_HOURS=24

# OPC-UA Configuration (Optional)
OPCUA_ENDPOINT_URL=opc.tcp://localhost:4840
OPCUA_USERNAME=
OPCUA_PASSWORD=

# Grafana Configuration
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=admin

# MLflow Configuration
MLFLOW_TRACKING_URI=http://mlflow:5000
"@ | Out-File -FilePath .env -Encoding utf8
    Write-Host "✅ .env file created" -ForegroundColor Green
}

# Start services
Write-Host ""
Write-Host "🔧 Starting Docker containers..." -ForegroundColor Cyan
Write-Host "This may take a few minutes on first run..." -ForegroundColor Yellow
Write-Host ""

try {
    docker-compose up -d
    Write-Host ""
    Write-Host "✅ Services started successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error starting services" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# Wait a bit for services to initialize
Write-Host ""
Write-Host "⏳ Waiting for services to initialize..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Show status
Write-Host ""
Write-Host "📊 Service Status:" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "🌐 Access Points:" -ForegroundColor Cyan
Write-Host "  - Backend API:     http://localhost:5000" -ForegroundColor White
Write-Host "  - Frontend:        http://localhost:5173 (run 'cd frontend && npm run dev')" -ForegroundColor White
Write-Host "  - Prometheus:      http://localhost:9090" -ForegroundColor White
Write-Host "  - Grafana:         http://localhost:3000 (admin/admin)" -ForegroundColor White
Write-Host "  - MLflow:          http://localhost:5001" -ForegroundColor White
Write-Host "  - InfluxDB:        http://localhost:8086" -ForegroundColor White

Write-Host ""
Write-Host "📋 View logs:" -ForegroundColor Cyan
Write-Host "  docker-compose logs -f" -ForegroundColor White
Write-Host ""
Write-Host "📋 Default users:" -ForegroundColor Cyan
Write-Host "  - admin / admin123 (role: admin)" -ForegroundColor White
Write-Host "  - engineer / admin123 (role: engineer)" -ForegroundColor White
Write-Host "  - operator / admin123 (role: operator)" -ForegroundColor White

Write-Host ""
Write-Host "✅ System is starting! Check logs with: docker-compose logs -f" -ForegroundColor Green
Write-Host ""

