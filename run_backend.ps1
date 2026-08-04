# Aegis Women Safety System - Local Backend Runner
# Launches all 6 FastAPI microservices concurrently

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "   Starting Aegis Women Security Services   " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Define services, directories, and ports
$services = @(
    @{ Name = "authentication-service"; Port = 8001; Path = "backend/authentication-service" },
    @{ Name = "user-service";           Port = 8002; Path = "backend/user-service" },
    @{ Name = "emergency-service";      Port = 8003; Path = "backend/emergency-service" },
    @{ Name = "gps-service";            Port = 8004; Path = "backend/gps-service" },
    @{ Name = "notification-service";   Port = 8005; Path = "backend/notification-service" },
    @{ Name = "ai-service";             Port = 8006; Path = "backend/ai-service" }
)

# Start each service in a new minimized/hidden process
foreach ($service in $services) {
    Write-Host "Launching $($service.Name) on http://localhost:$($service.Port)..." -ForegroundColor Yellow
    
    # Configure environmental variables for fallback SQLite databases
    $dbPath = [System.IO.Path]::GetFullPath("backend/test_$($service.Name).db")
    $env:DATABASE_URL = "sqlite:///$dbPath"
    $env:JWT_SECRET = "super_secret_aegis_key_12345"
    
    # Start uvicorn process via python -m in a standard console window
    Start-Process -FilePath "python" -ArgumentList "-u -m uvicorn main:app --host 0.0.0.0 --port $($service.Port)" -WorkingDirectory $service.Path
}

Write-Host "`nAll 6 services launched successfully!" -ForegroundColor Green
Write-Host "Verify them using Swagger UI endpoints:" -ForegroundColor Green
foreach ($service in $services) {
    Write-Host " - $($service.Name): http://localhost:$($service.Port)/docs" -ForegroundColor Gray
}

Write-Host "`nTo stop all microservices later, run: " -ForegroundColor Cyan
Write-Host "  Stop-Process -Name python -Force`n" -ForegroundColor Yellow

# Keep parent script active to maintain background child processes in sandbox
Write-Host "Services are running. Keeping console active..." -ForegroundColor Green
try {
    while ($true) {
        Start-Sleep -Seconds 5
    }
}
finally {
    Write-Host "Cleaning up microservice processes..." -ForegroundColor Red
    Stop-Process -Name python -Force -ErrorAction SilentlyContinue
}
