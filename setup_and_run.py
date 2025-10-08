#!/usr/bin/env python3
"""
Comprehensive setup and run script for NeptuneAI Ocean Data Platform
This script will help you set up and run both backend and frontend
"""

import subprocess
import sys
import os
import time
import webbrowser
from pathlib import Path

def run_command(command, cwd=None, shell=True):
    """Run a command and return the result"""
    try:
        result = subprocess.run(
            command, 
            shell=shell, 
            cwd=cwd, 
            capture_output=True, 
            text=True,
            check=True
        )
        return True, result.stdout
    except subprocess.CalledProcessError as e:
        return False, e.stderr

def check_python():
    """Check if Python is available"""
    print("🐍 Checking Python installation...")
    success, output = run_command("python --version")
    if success:
        print(f"✅ Python found: {output.strip()}")
        return True
    else:
        print("❌ Python not found. Please install Python 3.8+")
        return False

def check_node():
    """Check if Node.js is available"""
    print("📦 Checking Node.js installation...")
    success, output = run_command("node --version")
    if success:
        print(f"✅ Node.js found: {output.strip()}")
        return True
    else:
        print("❌ Node.js not found. Please install Node.js 16+")
        return False

def setup_backend():
    """Set up the backend"""
    print("\n🔧 Setting up backend...")
    backend_dir = Path("backend")
    
    if not backend_dir.exists():
        print("❌ Backend directory not found")
        return False
    
    # Install Python dependencies
    print("📦 Installing Python dependencies...")
    success, output = run_command("pip install -r requirements.txt", cwd=backend_dir)
    if success:
        print("✅ Python dependencies installed")
    else:
        print(f"❌ Failed to install Python dependencies: {output}")
        return False
    
    # Initialize database
    print("🗄️ Initializing database...")
    success, output = run_command("python init_db.py", cwd=backend_dir)
    if success:
        print("✅ Database initialized")
    else:
        print(f"⚠️ Database initialization failed: {output}")
    
    return True

def setup_frontend():
    """Set up the frontend"""
    print("\n🎨 Setting up frontend...")
    frontend_dir = Path("react-frontend")
    
    if not frontend_dir.exists():
        print("❌ Frontend directory not found")
        return False
    
    # Install Node.js dependencies
    print("📦 Installing Node.js dependencies...")
    success, output = run_command("npm install", cwd=frontend_dir)
    if success:
        print("✅ Node.js dependencies installed")
    else:
        print(f"❌ Failed to install Node.js dependencies: {output}")
        return False
    
    return True

def start_backend():
    """Start the backend server"""
    print("\n🚀 Starting backend server...")
    backend_dir = Path("backend")
    
    try:
        # Start the backend in a subprocess
        process = subprocess.Popen(
            [sys.executable, "api.py"],
            cwd=backend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Wait a moment for the server to start
        time.sleep(3)
        
        # Check if the process is still running
        if process.poll() is None:
            print("✅ Backend server started successfully")
            print("🌐 Backend API available at: http://localhost:8000")
            print("📚 API documentation at: http://localhost:8000/docs")
            return process
        else:
            stdout, stderr = process.communicate()
            print(f"❌ Backend server failed to start")
            print(f"Error: {stderr}")
            return None
            
    except Exception as e:
        print(f"❌ Failed to start backend: {e}")
        return None

def start_frontend():
    """Start the frontend server"""
    print("\n🎨 Starting frontend server...")
    frontend_dir = Path("react-frontend")
    
    try:
        # Start the frontend in a subprocess
        process = subprocess.Popen(
            ["npm", "start"],
            cwd=frontend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Wait a moment for the server to start
        time.sleep(5)
        
        # Check if the process is still running
        if process.poll() is None:
            print("✅ Frontend server started successfully")
            print("🌐 Frontend available at: http://localhost:3000")
            return process
        else:
            stdout, stderr = process.communicate()
            print(f"❌ Frontend server failed to start")
            print(f"Error: {stderr}")
            return None
            
    except Exception as e:
        print(f"❌ Failed to start frontend: {e}")
        return None

def main():
    """Main setup and run function"""
    print("🌊 NeptuneAI Ocean Data Platform Setup")
    print("=" * 50)
    
    # Check prerequisites
    if not check_python():
        return
    
    if not check_node():
        return
    
    # Setup backend
    if not setup_backend():
        print("❌ Backend setup failed")
        return
    
    # Setup frontend
    if not setup_frontend():
        print("❌ Frontend setup failed")
        return
    
    print("\n🎉 Setup completed successfully!")
    print("\n🚀 Starting servers...")
    
    # Start backend
    backend_process = start_backend()
    if not backend_process:
        print("❌ Failed to start backend")
        return
    
    # Start frontend
    frontend_process = start_frontend()
    if not frontend_process:
        print("❌ Failed to start frontend")
        backend_process.terminate()
        return
    
    print("\n🎉 Both servers are running!")
    print("\n📱 Access the application:")
    print("   Frontend: http://localhost:3000")
    print("   Backend API: http://localhost:8000")
    print("   API Docs: http://localhost:8000/docs")
    
    print("\n⚠️ Press Ctrl+C to stop both servers")
    
    try:
        # Keep the script running
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Stopping servers...")
        backend_process.terminate()
        frontend_process.terminate()
        print("✅ Servers stopped")

if __name__ == "__main__":
    main()