# Aegis Security - Unified Startup Runner (Backend & Frontend)

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "     Starting Aegis Women Security Application    " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Stop any dangling backend processes to clear ports
Write-Host "Clearing existing Python backend services..." -ForegroundColor Yellow
Stop-Process -Name python -Force -ErrorAction SilentlyContinue

# 2. Launch the Unified Backend Monolith (Port 8000)
Write-Host "`nLaunching Unified Backend Monolith on http://localhost:8000..." -ForegroundColor Green
$env:DATABASE_URL = "sqlite:///./aegis.db"
$env:JWT_SECRET = "super_secret_aegis_key_12345"

# Spawn monolith uvicorn background process
Start-Process -FilePath "python" -ArgumentList "-u -m uvicorn main:app --host 0.0.0.0 --port 8000" -WorkingDirectory "backend"

# 3. Launch React Native Mobile Frontend (Expo)
Write-Host "`nLaunching React Native Expo Frontend..." -ForegroundColor Green
Write-Host "This will open a new console window to run 'npm install' and 'expo start'..." -ForegroundColor Yellow

# Start in a new interactive CMD window so the developer can see the progress of npm install and QR codes
Start-Process -FilePath "cmd" -ArgumentList "/c echo Installing frontend dependencies... && npm install && echo Starting Expo Server... && npx expo start" -WorkingDirectory "frontend"

Write-Host "`n==================================================" -ForegroundColor Green
Write-Host "  Backend running at: http://localhost:8000" -ForegroundColor Green
Write-Host "  Backend documentation: http://localhost:8000/docs" -ForegroundColor Green
Write-Host "  Frontend building in separate CMD console window." -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Keep parent script active to monitor the backend
Write-Host "Monitoring backend status. Press Ctrl+C to stop backend." -ForegroundColor Cyan
try {
    while ($true) {
        Start-Sleep -Seconds 5
    }
}
finally {
    Write-Host "`nCleaning up python backend processes..." -ForegroundColor Red
    Stop-Process -Name python -Force -ErrorAction SilentlyContinue
}
