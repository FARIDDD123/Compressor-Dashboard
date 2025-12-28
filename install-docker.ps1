# Script to install and setup Docker Desktop on Windows
# Run as Administrator

Write-Host "🐳 Docker Desktop Installation and Setup Script" -ForegroundColor Green
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "⚠️  This script requires Administrator privileges" -ForegroundColor Yellow
    Write-Host "Please run PowerShell as Administrator and try again" -ForegroundColor Yellow
    exit 1
}

# Check if Docker Desktop is already installed
Write-Host "📋 Checking Docker Desktop installation..." -ForegroundColor Cyan
$dockerPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
if (Test-Path $dockerPath) {
    Write-Host "✅ Docker Desktop is already installed" -ForegroundColor Green
    
    # Check if Docker is running
    Write-Host "📋 Checking if Docker is running..." -ForegroundColor Cyan
    try {
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        docker ps | Out-Null
        Write-Host "✅ Docker is running" -ForegroundColor Green
        exit 0
    } catch {
        Write-Host "⚠️  Docker Desktop is installed but not running" -ForegroundColor Yellow
        Write-Host "🔧 Starting Docker Desktop..." -ForegroundColor Cyan
        
        # Start Docker Desktop
        Start-Process $dockerPath
        
        Write-Host "⏳ Waiting for Docker Desktop to start (this may take 30-60 seconds)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        
        # Wait for Docker to be ready (max 2 minutes)
        $maxAttempts = 24
        $attempt = 0
        $dockerReady = $false
        
        while ($attempt -lt $maxAttempts) {
            try {
                $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
                docker ps | Out-Null
                $dockerReady = $true
                break
            } catch {
                $attempt++
                Write-Host "   Waiting... ($attempt/$maxAttempts)" -ForegroundColor Gray
                Start-Sleep -Seconds 5
            }
        }
        
        if ($dockerReady) {
            Write-Host "✅ Docker Desktop is now running!" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Docker Desktop is starting but not ready yet" -ForegroundColor Yellow
            Write-Host "Please wait a bit longer and check manually with: docker ps" -ForegroundColor Yellow
        }
        
        exit 0
    }
}

# Docker Desktop is not installed
Write-Host "❌ Docker Desktop is not installed" -ForegroundColor Red
Write-Host ""
Write-Host "📥 Download and Installation Options:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Option 1: Download from official website (Recommended)" -ForegroundColor Yellow
Write-Host "  URL: https://www.docker.com/products/docker-desktop/" -ForegroundColor White
Write-Host "  Then run the installer manually" -ForegroundColor White
Write-Host ""
Write-Host "Option 2: Use winget (if available)" -ForegroundColor Yellow

# Check if winget is available
try {
    winget --version | Out-Null
    Write-Host "  ✅ winget is available" -ForegroundColor Green
    
    $response = Read-Host "Do you want to install Docker Desktop using winget? (Y/N)"
    if ($response -eq "Y" -or $response -eq "y") {
        Write-Host "🔧 Installing Docker Desktop using winget..." -ForegroundColor Cyan
        winget install Docker.DockerDesktop
        
        Write-Host "⏳ Waiting for installation to complete..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        
        Write-Host "🔧 Starting Docker Desktop..." -ForegroundColor Cyan
        if (Test-Path $dockerPath) {
            Start-Process $dockerPath
            Write-Host "✅ Docker Desktop installation started!" -ForegroundColor Green
            Write-Host "Please complete the setup in the Docker Desktop GUI" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "  ❌ winget is not available" -ForegroundColor Red
}

Write-Host ""
Write-Host "📋 Manual Installation Steps:" -ForegroundColor Cyan
Write-Host "1. Download Docker Desktop from: https://www.docker.com/products/docker-desktop/" -ForegroundColor White
Write-Host "2. Run the installer (Docker Desktop Installer.exe)" -ForegroundColor White
Write-Host "3. Follow the installation wizard" -ForegroundColor White
Write-Host "4. Restart your computer if prompted" -ForegroundColor White
Write-Host "5. Start Docker Desktop from Start Menu" -ForegroundColor White
Write-Host "6. Wait for Docker Desktop to finish starting" -ForegroundColor White
Write-Host ""
Write-Host "After installation, run this script again to verify setup." -ForegroundColor Yellow

