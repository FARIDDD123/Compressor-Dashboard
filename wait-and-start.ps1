# Script to wait for Docker Desktop and then start the system

Write-Host "🐳 Waiting for Docker Desktop to be ready..." -ForegroundColor Cyan
Write-Host ""

# Start Docker Desktop if not running
$dockerPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
if (Test-Path $dockerPath) {
    $dockerProcess = Get-Process "Docker Desktop" -ErrorAction SilentlyContinue
    if (-not $dockerProcess) {
        Write-Host "🔧 Starting Docker Desktop..." -ForegroundColor Yellow
        Start-Process $dockerPath
        Start-Sleep -Seconds 5
    }
}

# Update PATH to include Docker
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Wait for Docker to be ready
Write-Host "⏳ Waiting for Docker to be ready (this may take 1-2 minutes)..." -ForegroundColor Yellow
Write-Host ""

$maxAttempts = 60  # 5 minutes total
$attempt = 0
$dockerReady = $false

while ($attempt -lt $maxAttempts) {
    try {
        docker ps | Out-Null
        $dockerReady = $true
        Write-Host ""
        Write-Host "✅ Docker is ready!" -ForegroundColor Green
        break
    } catch {
        $attempt++
        if ($attempt % 6 -eq 0) {
            Write-Host "   Still waiting... ($([Math]::Floor($attempt/6)) minute(s))" -ForegroundColor Gray
        } else {
            Write-Host "." -NoNewline -ForegroundColor Gray
        }
        Start-Sleep -Seconds 10
    }
}

if (-not $dockerReady) {
    Write-Host ""
    Write-Host "⚠️  Docker Desktop is taking longer than expected" -ForegroundColor Yellow
    Write-Host "Please check Docker Desktop manually and ensure it's running" -ForegroundColor Yellow
    Write-Host "Then run: docker-compose up -d" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🚀 Starting Digital Twin Gas Turbine 1 System..." -ForegroundColor Green
Write-Host ""

# Check if .env exists
if (-not (Test-Path .env)) {
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
}

# Start services
try {
    Write-Host "🔧 Starting Docker containers..." -ForegroundColor Cyan
    Write-Host "This may take several minutes on first run..." -ForegroundColor Yellow
    Write-Host ""
    
    docker-compose up -d
    
    Write-Host ""
    Write-Host "✅ Services started!" -ForegroundColor Green
    Write-Host ""
    
    # Wait a bit for services to initialize
    Write-Host "⏳ Waiting for services to initialize (30 seconds)..." -ForegroundColor Cyan
    Start-Sleep -Seconds 30
    
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
    Write-Host "✅ System is running! Check logs with: docker-compose logs -f" -ForegroundColor Green
    
} catch {
    Write-Host ""
    Write-Host "❌ Error starting services" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Try running manually: docker-compose up -d" -ForegroundColor Yellow
    exit 1
}

