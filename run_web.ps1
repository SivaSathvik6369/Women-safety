# Aegis Web Application Startup Script
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "   Starting Aegis Web App & Backend Monolith  " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# 1. Stop any dangling python instances
Write-Host "Clearing existing Python processes..." -ForegroundColor Yellow
Stop-Process -Name python -Force -ErrorAction SilentlyContinue

# 2. Launch Unified Backend (Port 8000)
Write-Host "Starting Backend Monolith on http://localhost:8000..." -ForegroundColor Green
$env:DATABASE_URL = "sqlite:///./aegis.db"
$env:JWT_SECRET = "super_secret_aegis_key_12345"
Start-Process -FilePath "python" -ArgumentList "-u -m uvicorn main:app --host 0.0.0.0 --port 8000" -WorkingDirectory "backend" -WindowStyle Hidden

# 3. Launch HTTP Web Server (Port 3000)
Write-Host "Starting Web Frontend on http://localhost:3000..." -ForegroundColor Green
Start-Process -FilePath "python" -ArgumentList "-m http.server 3000" -WorkingDirectory "frontend-web" -WindowStyle Hidden

# 4. Keep active
Write-Host "`nAll running! Web app active at: http://localhost:3000" -ForegroundColor Green
Write-Host "Keeping console active. Press Ctrl+C to terminate." -ForegroundColor Cyan
try {
    while ($true) {
        Start-Sleep -Seconds 5
    }
}
finally {
    Write-Host "`nCleaning up processes..." -ForegroundColor Red
    Stop-Process -Name python -Force -ErrorAction SilentlyContinue
}
