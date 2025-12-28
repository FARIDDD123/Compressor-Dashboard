# Script to stop Digital Twin Gas Turbine 1 System

Write-Host "🛑 Stopping Digital Twin Gas Turbine 1 System..." -ForegroundColor Yellow
Write-Host ""

try {
    docker-compose down
    Write-Host ""
    Write-Host "✅ Services stopped successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error stopping services" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "💡 To remove volumes as well, run: docker-compose down -v" -ForegroundColor Cyan

