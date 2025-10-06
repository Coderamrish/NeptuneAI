@echo off
echo 🌊 NeptuneAI Full Stack Launcher
echo ==================================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found. Please install Python first.
    pause
    exit /b 1
)

REM Check if we're in a virtual environment
echo 🐍 Checking Python environment...
python -c "import sys; print('✅ Virtual environment detected' if hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix) else '⚠️  No virtual environment detected')"

echo.
echo 🚀 Starting NeptuneAI services...
echo.

REM Start backend in background
echo 🐍 Starting Backend...
start "NeptuneAI Backend" cmd /k "python -m streamlit run frontend/app_enhanced.py --server.port=8000 --server.address=0.0.0.0"

REM Wait a bit for backend to start
timeout /t 5 /nobreak >nul

REM Check if React frontend exists
if not exist "neptuneai-frontend" (
    echo ❌ React frontend not found. Please create it first:
    echo    npx create-react-app neptuneai-frontend
    pause
    exit /b 1
)

REM Start frontend
echo ⚛️  Starting Frontend...
cd neptuneai-frontend
start "NeptuneAI Frontend" cmd /k "npm start"
cd ..

echo.
echo 🎉 Both services are starting!
echo ==================================================
echo 🌐 Frontend: http://localhost:3000
echo 🔗 Backend: http://localhost:8000
echo ==================================================
echo.
echo Press any key to exit...
pause >nul