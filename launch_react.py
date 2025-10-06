#!/usr/bin/env python3
"""
NeptuneAI React Frontend Launcher
Launcher script for the React frontend with backend integration
"""

import subprocess
import sys
import os
from pathlib import Path
import time

def check_node():
    """Check if Node.js is installed"""
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Node.js found: {result.stdout.strip()}")
            return True
        else:
            print("❌ Node.js not found")
            return False
    except FileNotFoundError:
        print("❌ Node.js not installed")
        return False

def check_npm():
    """Check if npm is installed"""
    try:
        result = subprocess.run(['npm', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ npm found: {result.stdout.strip()}")
            return True
        else:
            print("❌ npm not found")
            return False
    except FileNotFoundError:
        print("❌ npm not installed")
        return False

def install_dependencies():
    """Install React dependencies"""
    print("📦 Installing React dependencies...")
    try:
        result = subprocess.run(['npm', 'install'], cwd='react-frontend', check=True)
        print("✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def start_backend():
    """Start the backend server"""
    print("🚀 Starting backend server...")
    try:
        # Start backend in background
        backend_process = subprocess.Popen([
            sys.executable, '-m', 'streamlit', 'run', 'frontend/app_enhanced.py',
            '--server.port=8000', '--server.address=0.0.0.0'
        ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        # Give backend time to start
        time.sleep(3)
        print("✅ Backend server started on port 8000")
        return backend_process
    except Exception as e:
        print(f"❌ Failed to start backend: {e}")
        return None

def start_react():
    """Start the React development server"""
    print("🌊 Starting React frontend...")
    try:
        # Set environment variables
        env = os.environ.copy()
        env['REACT_APP_API_URL'] = 'http://localhost:8000'
        env['BROWSER'] = 'none'  # Don't auto-open browser
        
        # Start React
        react_process = subprocess.Popen([
            'npm', 'start'
        ], cwd='react-frontend', env=env)
        
        print("✅ React frontend starting on port 3000")
        print("🌐 Frontend will be available at: http://localhost:3000")
        print("🔗 Backend API available at: http://localhost:8000")
        print("Press Ctrl+C to stop both servers")
        
        return react_process
    except Exception as e:
        print(f"❌ Failed to start React: {e}")
        return None

def main():
    """Main launcher function"""
    print("🌊 NeptuneAI React Frontend Launcher")
    print("=" * 50)
    
    # Check prerequisites
    if not check_node():
        print("\n❌ Please install Node.js from https://nodejs.org/")
        return False
    
    if not check_npm():
        print("\n❌ Please install npm (comes with Node.js)")
        return False
    
    # Check if React frontend exists
    if not Path('react-frontend').exists():
        print("\n❌ React frontend directory not found")
        print("Please run the setup script first")
        return False
    
    # Install dependencies
    if not install_dependencies():
        return False
    
    # Start backend
    backend_process = start_backend()
    if not backend_process:
        return False
    
    # Start React
    react_process = start_react()
    if not react_process:
        backend_process.terminate()
        return False
    
    try:
        # Wait for processes
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n👋 Shutting down servers...")
        
        # Terminate processes
        if react_process:
            react_process.terminate()
        if backend_process:
            backend_process.terminate()
        
        print("✅ Servers stopped")
        return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)