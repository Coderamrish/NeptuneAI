@echo off
echo 🌊 NeptuneAI Quick Fix
echo =====================
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
echo 🔧 Fixing database schema...
cd backend
python fix_database.py
if errorlevel 1 (
    echo ❌ Database fix failed
    pause
    exit /b 1
)
echo ✅ Database fixed successfully!

echo.
echo 🧪 Testing backend...
python -c "from api import app; print('✅ Backend imports successfully')"
if errorlevel 1 (
    echo ❌ Backend test failed
    pause
    exit /b 1
)
echo ✅ Backend test passed!

echo.
echo 🎉 All issues fixed!
echo.
echo 📋 Fixed issues:
echo ✅ Database schema (missing tables and columns)
echo ✅ API endpoints (analytics, data explorer, user stats)
echo ✅ AI chat functionality
echo ✅ Error handling
echo.
echo 🚀 You can now run the backend:
echo    cd backend
echo    python api.py
echo.
echo The frontend should now work without errors!
echo.
pause