# 🛠️ NeptuneAI Troubleshooting Guide

## Quick Fix for Your Current Error

The error you're seeing is because `get_current_user` function is being used before it's defined. This has been **FIXED** in the latest version.

### ✅ **SOLUTION:**

1. **Download the latest fixed files** from the workspace
2. **Replace your current `api.py`** with the fixed version
3. **Run the backend again**

## 🚀 **Easy Setup Options**

### Option 1: Use the Batch File (Windows)
```bash
# Simply double-click this file:
run_neptuneai.bat
```

### Option 2: Use the Python Setup Script
```bash
python setup_and_run.py
```

### Option 3: Manual Setup

#### Backend Setup:
```bash
cd backend
pip install -r requirements.txt
python init_db.py
python api.py
```

#### Frontend Setup (in new terminal):
```bash
cd react-frontend
npm install
npm start
```

## 🔧 **Common Issues & Solutions**

### 1. **NameError: name 'get_current_user' is not defined**
**Status:** ✅ **FIXED**
- **Cause:** Function definition order issue
- **Solution:** Use the updated `api.py` file

### 2. **ModuleNotFoundError: No module named 'fastapi'**
**Solution:**
```bash
cd backend
pip install -r requirements.txt
```

### 3. **npm: command not found**
**Solution:**
- Install Node.js from https://nodejs.org/
- Restart your terminal after installation

### 4. **Port already in use**
**Solution:**
```bash
# Kill processes using ports 3000 and 8000
# Windows:
netstat -ano | findstr :3000
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F

# Or change ports in the configuration
```

### 5. **Database connection issues**
**Solution:**
```bash
cd backend
python init_db.py
```

### 6. **Frontend build errors**
**Solution:**
```bash
cd react-frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

## 📋 **Prerequisites Checklist**

- [ ] **Python 3.8+** installed
- [ ] **Node.js 16+** installed
- [ ] **pip** package manager
- [ ] **npm** package manager
- [ ] **Git** (optional, for version control)

## 🔍 **Verification Steps**

### 1. **Check Backend:**
```bash
cd backend
python -c "import fastapi; print('✅ FastAPI installed')"
python api.py
```
Should show: `INFO: Uvicorn running on http://0.0.0.0:8000`

### 2. **Check Frontend:**
```bash
cd react-frontend
npm --version
npm start
```
Should show: `webpack compiled successfully`

### 3. **Test API:**
Open http://localhost:8000/docs in your browser
Should show the FastAPI documentation

## 🌐 **Access Points**

Once everything is running:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/health

## 🆘 **Still Having Issues?**

### Check Logs:
1. **Backend logs:** Look at the terminal where you ran `python api.py`
2. **Frontend logs:** Look at the terminal where you ran `npm start`
3. **Browser console:** Press F12 in your browser

### Common Error Messages:

#### `ImportError: No module named 'fastapi'`
```bash
pip install fastapi uvicorn python-multipart
```

#### `Error: listen EADDRINUSE: address already in use :::3000`
```bash
# Kill the process using port 3000
npx kill-port 3000
```

#### `Module not found: Can't resolve 'react'`
```bash
cd react-frontend
npm install
```

#### `Database is locked`
```bash
# Delete the database file and recreate
rm backend/neptune_users.db
python backend/init_db.py
```

## 📞 **Getting Help**

If you're still experiencing issues:

1. **Check the error message** carefully
2. **Verify all prerequisites** are installed
3. **Try the automated setup script** first
4. **Check the logs** for specific error details
5. **Ensure all files** are in the correct locations

## 🎯 **Expected Behavior**

When everything works correctly:

1. **Backend starts** with message: `INFO: Uvicorn running on http://0.0.0.0:8000`
2. **Frontend starts** with message: `webpack compiled successfully`
3. **Browser opens** to http://localhost:3000
4. **Login page** appears with modern UI
5. **All features work** including AI chat, analytics, data explorer

## 🔄 **Reset Everything**

If you want to start fresh:

```bash
# Stop all servers (Ctrl+C in terminals)

# Clean backend
cd backend
rm -rf __pycache__ neptune_users.db
pip install -r requirements.txt
python init_db.py

# Clean frontend
cd ../react-frontend
rm -rf node_modules package-lock.json
npm install

# Start again
python setup_and_run.py
```

---

**Remember:** The `get_current_user` error has been **FIXED** in the latest version. Just replace your `api.py` file with the updated one! 🎉