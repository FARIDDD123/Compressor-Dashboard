# PowerShell Script برای اجرای Dashboard
# Dashboard Startup Script

Write-Host "🚀 Starting Digital Twin Gas Turbine Dashboard..." -ForegroundColor Green
Write-Host ""

# بررسی Node.js
Write-Host "📦 Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "✅ Node.js $nodeVersion found" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js not found! Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

# رفتن به پوشه frontend
Write-Host ""
Write-Host "📁 Navigating to frontend directory..." -ForegroundColor Yellow
Set-Location frontend

# بررسی node_modules
Write-Host "📦 Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "⏳ Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

# بررسی .env file
Write-Host ""
Write-Host "⚙️ Checking environment variables..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating .env file..." -ForegroundColor Yellow
    @"
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api

# WebSocket Configuration
VITE_SOCKET_URL=http://localhost:5000

# Error Logging
VITE_ERROR_LOGGING_ENABLED=true
VITE_ERROR_LOGGING_SERVICE_URL=

# Performance Monitoring
VITE_PERFORMANCE_MONITORING=true
VITE_PERFORMANCE_SERVICE_URL=
"@ | Out-File -FilePath ".env" -Encoding utf8
    Write-Host "✅ .env file created" -ForegroundColor Green
} else {
    Write-Host "✅ .env file exists" -ForegroundColor Green
}

# اجرای development server
Write-Host ""
Write-Host "🎯 Starting development server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Dashboard will be available at: http://localhost:5178" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# اجرای npm run dev
npm run dev

