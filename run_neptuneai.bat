@echo off
echo 🌊 NeptuneAI Ocean Data Platform
echo ================================
echo.

echo Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found. Please install Python 3.8+
    pause
    exit /b 1
)
echo ✅ Python found

echo.
echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js 16+
    pause
    exit /b 1
)
echo ✅ Node.js found

echo.
echo 🚀 Starting NeptuneAI Platform...
echo.

REM Start backend
echo Starting backend server...
start "NeptuneAI Backend" cmd /k "cd backend && python api.py"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
echo Starting frontend server...
start "NeptuneAI Frontend" cmd /k "cd react-frontend && npm start"

echo.
echo 🎉 NeptuneAI Platform is starting!
echo.
echo 📱 Access the application:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:8000
echo    API Docs: http://localhost:8000/docs
echo.
echo ⚠️ Close the command windows to stop the servers
echo.

REM Open the frontend in browser after a delay
timeout /t 10 /nobreak >nul
start http://localhost:3000

pause