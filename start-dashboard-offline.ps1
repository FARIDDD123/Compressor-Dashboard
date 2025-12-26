# Script to run dashboard online first, then offline with all current details
# This script will:
# 1. Start the dev server to load and save current dashboard data
# 2. Build the application for offline use
# 3. Serve the built application offline

param(
    [switch]$SkipOnline = $false,
    [int]$OnlineWaitTime = 10
)

$ErrorActionPreference = "Stop"
$frontendPath = "frontend"
$backendPath = "backend"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Digital Twin Dashboard - Offline Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if port is in use
function Test-Port {
    param([int]$Port)
    $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue -InformationLevel Quiet
    return $connection
}

# Function to wait for server to be ready
function Wait-ForServer {
    param(
        [string]$Url,
        [int]$MaxWait = 60,
        [int]$Interval = 2
    )
    $elapsed = 0
    while ($elapsed -lt $MaxWait) {
        try {
            $response = Invoke-WebRequest -Uri $Url -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                return $true
            }
        } catch {
            Start-Sleep -Seconds $Interval
            $elapsed += $Interval
            Write-Host "." -NoNewline -ForegroundColor Yellow
        }
    }
    Write-Host ""
    return $false
}

# Step 1: Start online dev server to load and save dashboard data
if (-not $SkipOnline) {
    Write-Host "[1/4] Starting online dev server to load dashboard data..." -ForegroundColor Green
    
    if (-not (Test-Path $frontendPath)) {
        Write-Host "ERROR: Frontend directory not found!" -ForegroundColor Red
        exit 1
    }
    
    Set-Location $frontendPath
    
    # Check if node_modules exists
    if (-not (Test-Path "node_modules")) {
        Write-Host "Installing dependencies..." -ForegroundColor Yellow
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "ERROR: Failed to install dependencies!" -ForegroundColor Red
            exit 1
        }
    }
    
    # Check if port 5178 is available
    if (Test-Port -Port 5178) {
        Write-Host "WARNING: Port 5178 is already in use. Trying to use it anyway..." -ForegroundColor Yellow
    }
    
    Write-Host "Starting dev server..." -ForegroundColor Cyan
    Write-Host "Waiting for server to be ready and data to be saved..." -ForegroundColor Gray
    
    # Start dev server in background
    $devServer = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru -NoNewWindow
    
    # Wait for server to be ready
    $serverReady = Wait-ForServer -Url "http://localhost:5178" -MaxWait 30
    if (-not $serverReady) {
        Write-Host "ERROR: Dev server failed to start!" -ForegroundColor Red
        Stop-Process -Id $devServer.Id -Force -ErrorAction SilentlyContinue
        exit 1
    }
    
    Write-Host "SUCCESS: Dev server is running on http://localhost:5178" -ForegroundColor Green
    Write-Host "Waiting $OnlineWaitTime seconds for dashboard to load and save data..." -ForegroundColor Yellow
    
    # Wait for dashboard to load and save data to localStorage
    Start-Sleep -Seconds $OnlineWaitTime
    
    Write-Host "SUCCESS: Dashboard data should be saved now" -ForegroundColor Green
    Write-Host "Stopping dev server..." -ForegroundColor Yellow
    
    # Stop dev server
    Stop-Process -Id $devServer.Id -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    
    Set-Location ..
    Write-Host ""
} else {
    Write-Host "[1/4] Skipping online phase (--SkipOnline flag set)" -ForegroundColor Yellow
    Write-Host ""
}

# Step 2: Build the application for offline use
Write-Host "[2/4] Building application for offline use..." -ForegroundColor Green

Set-Location $frontendPath

# Clean previous build
if (Test-Path "dist") {
    Write-Host "Cleaning previous build..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "dist"
}

Write-Host "Building application..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Build failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

if (-not (Test-Path "dist")) {
    Write-Host "ERROR: Build output not found!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "SUCCESS: Build completed successfully!" -ForegroundColor Green
Set-Location ..
Write-Host ""

# Step 3: Copy service worker and manifest to dist
Write-Host "[3/4] Setting up offline files..." -ForegroundColor Green

if (Test-Path "$frontendPath\public\sw.js") {
    Copy-Item "$frontendPath\public\sw.js" "$frontendPath\dist\sw.js" -Force
    Write-Host "SUCCESS: Service worker copied" -ForegroundColor Green
}

if (Test-Path "$frontendPath\public\manifest.json") {
    Copy-Item "$frontendPath\public\manifest.json" "$frontendPath\dist\manifest.json" -Force
    Write-Host "SUCCESS: Manifest copied" -ForegroundColor Green
}

# Update index.html in dist to ensure service worker is registered
$indexPath = "$frontendPath\dist\index.html"
if (Test-Path $indexPath) {
    $indexContent = Get-Content $indexPath -Raw
    if ($indexContent -notmatch "serviceWorker.register") {
        $swScript = @"
    <script>
      // Register Service Worker for offline support
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
              console.log('Service Worker registered:', registration.scope);
            })
            .catch((error) => {
              console.log('Service Worker registration failed:', error);
            });
        });
      }
    </script>
"@
        $indexContent = $indexContent -replace "</body>", "$swScript`n  </body>"
        Set-Content $indexPath $indexContent -NoNewline
        Write-Host "SUCCESS: Service worker registration added to index.html" -ForegroundColor Green
    }
}

Write-Host ""

# Step 4: Start offline server
Write-Host "[4/4] Starting offline server..." -ForegroundColor Green

Set-Location $frontendPath

# Check if serve is installed
$serveInstalled = npm list -g serve 2>$null
if (-not $serveInstalled) {
    Write-Host "Installing 'serve' globally for offline serving..." -ForegroundColor Yellow
    npm install -g serve
}

# Find available port for offline server
$offlinePort = 3000
$portFound = $false
$maxAttempts = 10
$attempt = 0

while (-not $portFound -and $attempt -lt $maxAttempts) {
    if (-not (Test-Port -Port $offlinePort)) {
        $portFound = $true
    } else {
        $offlinePort++
        $attempt++
    }
}

if (-not $portFound) {
    Write-Host "ERROR: Could not find available port!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "Starting offline server on port $offlinePort..." -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SUCCESS: Dashboard is now running OFFLINE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Local URL: http://localhost:$offlinePort" -ForegroundColor Yellow
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like '192.168.*' -or $_.IPAddress -like '10.*'}).IPAddress
if ($ipAddress) {
    Write-Host "Network URL: http://$ipAddress`:$offlinePort" -ForegroundColor Yellow
}
Write-Host ""
Write-Host "The dashboard will work completely offline with all saved data!" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Start serve
Set-Location "dist"
serve -s . -l $offlinePort

Set-Location ..\..
