# NeptuneAI Full Stack Launcher - PowerShell
Write-Host "🌊 NeptuneAI Full Stack Launcher" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is available
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if we're in a virtual environment
Write-Host "🐍 Checking Python environment..." -ForegroundColor Yellow
$venvCheck = python -c "import sys; print('venv' if hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix) else 'no-venv')" 2>&1
if ($venvCheck -eq "venv") {
    Write-Host "✅ Virtual environment detected" -ForegroundColor Green
} else {
    Write-Host "⚠️  No virtual environment detected" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🚀 Starting NeptuneAI services..." -ForegroundColor Cyan
Write-Host ""

# Start backend
Write-Host "🐍 Starting Backend..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    python -m streamlit run frontend/app_enhanced.py --server.port=8000 --server.address=0.0.0.0
}

# Wait for backend to start
Start-Sleep -Seconds 5

# Check if React frontend exists
if (-not (Test-Path "neptuneai-frontend")) {
    Write-Host "❌ React frontend not found. Please create it first:" -ForegroundColor Red
    Write-Host "   npx create-react-app neptuneai-frontend" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Start frontend
Write-Host "⚛️  Starting Frontend..." -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "$using:PWD\neptuneai-frontend"
    npm start
}

Write-Host ""
Write-Host "🎉 Both services are starting!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "🔗 Backend: http://localhost:8000" -ForegroundColor White
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Monitor jobs
Write-Host "Monitoring services... (Press Ctrl+C to stop)" -ForegroundColor Yellow
try {
    while ($true) {
        if ($backendJob.State -eq "Failed") {
            Write-Host "❌ Backend failed" -ForegroundColor Red
            break
        }
        if ($frontendJob.State -eq "Failed") {
            Write-Host "❌ Frontend failed" -ForegroundColor Red
            break
        }
        Start-Sleep -Seconds 1
    }
} catch {
    Write-Host "`n🛑 Stopping services..." -ForegroundColor Yellow
    Stop-Job $backendJob, $frontendJob
    Remove-Job $backendJob, $frontendJob
    Write-Host "✅ Services stopped" -ForegroundColor Green
}