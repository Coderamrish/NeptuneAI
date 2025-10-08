#!/usr/bin/env python3
"""
NeptuneAI Ocean Data Platform - Full Stack Launch Script
This script launches both the FastAPI backend and React frontend
"""

import subprocess
import sys
import os
import time
import signal
import threading
from pathlib import Path

def print_banner():
    """Print the NeptuneAI banner"""
    banner = """
    ╔══════════════════════════════════════════════════════════════╗
    ║                                                              ║
    ║  🌊 NeptuneAI Ocean Data Platform v2.0                      ║
    ║                                                              ║
    ║  Advanced AI-Powered Ocean Data Analytics & Visualization   ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝
    """
    print(banner)

def check_requirements():
    """Check if required tools are installed"""
    print("🔍 Checking requirements...")
    
    # Check Python
    try:
        python_version = subprocess.check_output([sys.executable, '--version'], text=True).strip()
        print(f"✅ Python: {python_version}")
    except:
        print("❌ Python not found")
        return False
    
    # Check Node.js
    node_path = None
    try:
        node_version = subprocess.check_output(['node', '--version'], text=True).strip()
        print(f"✅ Node.js: {node_version}")
        node_path = subprocess.check_output(['where', 'node'], text=True).strip().split('\n')[0]
    except:
        print("❌ Node.js not found")
        return False
    
    # Check npm (with fallback detection)
    try:
        npm_version = subprocess.check_output(['npm', '--version'], text=True).strip()
        print(f"✅ npm: {npm_version}")
    except:
        print("⚠️ npm not found in PATH, attempting to locate manually...")
        try:
            node_dir = os.path.dirname(node_path)
            npm_guess = os.path.join(node_dir, "npm.cmd")
            npm_version = subprocess.check_output([npm_guess, '--version'], text=True).strip()
            os.environ["PATH"] += os.pathsep + node_dir  # Add it to PATH dynamically
            print(f"✅ npm: {npm_version} (found via {npm_guess})")
        except Exception as e:
            print(f"❌ npm not found even after fallback: {e}")
            return False

    return True


def install_backend_dependencies():
    """Install backend dependencies"""
    print("\n📦 Installing backend dependencies...")
    backend_dir = Path("backend")
    
    if not backend_dir.exists():
        print("❌ Backend directory not found")
        return False
    
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "backend/requirements.txt"], 
                      check=True, cwd=os.getcwd())
        print("✅ Backend dependencies installed")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install backend dependencies: {e}")
        return False

def install_frontend_dependencies():
    """Install frontend dependencies"""
    print("\n📦 Installing frontend dependencies...")
    frontend_dir = Path("react-frontend")
    
    if not frontend_dir.exists():
        print("❌ Frontend directory not found")
        return False
    
    try:
        subprocess.run(["npm", "install"], check=True, cwd=frontend_dir)
        print("✅ Frontend dependencies installed")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install frontend dependencies: {e}")
        return False

def start_backend():
    """Start the FastAPI backend"""
    print("\n🚀 Starting FastAPI backend...")
    backend_dir = Path("backend")
    
    try:
        # Start the backend server
        process = subprocess.Popen([
            sys.executable, "-m", "uvicorn", "api:app", 
            "--host", "0.0.0.0", "--port", "8000", "--reload"
        ], cwd=backend_dir)
        
        print("✅ Backend server started on http://localhost:8000")
        return process
    except Exception as e:
        print(f"❌ Failed to start backend: {e}")
        return None

def start_frontend():
    """Start the React frontend"""
    print("\n🚀 Starting React frontend...")
    frontend_dir = Path("react-frontend")
    
    try:
        # Start the frontend development server
        process = subprocess.Popen([
            "npm", "start"
        ], cwd=frontend_dir)
        
        print("✅ Frontend server started on http://localhost:3000")
        return process
    except Exception as e:
        print(f"❌ Failed to start frontend: {e}")
        return None

def setup_database():
    """Setup the database"""
    print("\n🗄️ Setting up database...")
    backend_dir = Path("backend")
    
    try:
        # Create database tables
        subprocess.run([
            sys.executable, "-c", 
            """
import sqlite3
conn = sqlite3.connect('neptune_users.db')
cursor = conn.cursor()

# Create users table
cursor.execute('''
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
)
''')

# Create chat_sessions table
cursor.execute('''
CREATE TABLE IF NOT EXISTS chat_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_id TEXT UNIQUE NOT NULL,
    title TEXT DEFAULT 'New Chat',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
)
''')

# Create chat_messages table
cursor.execute('''
CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES chat_sessions (session_id),
    FOREIGN KEY (user_id) REFERENCES users (id)
)
''')

# Create notifications table
cursor.execute('''
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
)
''')

conn.commit()
conn.close()
print("Database tables created successfully")
"""
        ], cwd=backend_dir, check=True)
        
        print("✅ Database setup completed")
        return True
    except Exception as e:
        print(f"❌ Failed to setup database: {e}")
        return False

def signal_handler(sig, frame):
    """Handle Ctrl+C gracefully"""
    print("\n\n🛑 Shutting down servers...")
    sys.exit(0)

def main():
    """Main function"""
    print_banner()
    
    # Set up signal handler
    signal.signal(signal.SIGINT, signal_handler)
    
    # Check requirements
    if not check_requirements():
        print("\n❌ Requirements check failed. Please install missing dependencies.")
        sys.exit(1)
    
    # Install dependencies
    if not install_backend_dependencies():
        print("\n❌ Failed to install backend dependencies")
        sys.exit(1)
    
    if not install_frontend_dependencies():
        print("\n❌ Failed to install frontend dependencies")
        sys.exit(1)
    
    # Setup database
    if not setup_database():
        print("\n❌ Failed to setup database")
        sys.exit(1)
    
    # Start servers
    backend_process = start_backend()
    if not backend_process:
        print("\n❌ Failed to start backend")
        sys.exit(1)
    
    # Wait a bit for backend to start
    time.sleep(3)
    
    frontend_process = start_frontend()
    if not frontend_process:
        print("\n❌ Failed to start frontend")
        backend_process.terminate()
        sys.exit(1)
    
    print("\n" + "="*60)
    print("🎉 NeptuneAI Ocean Data Platform is now running!")
    print("="*60)
    print("📊 Frontend: http://localhost:3000")
    print("🔧 Backend API: http://localhost:8000")
    print("📚 API Docs: http://localhost:8000/docs")
    print("="*60)
    print("\nPress Ctrl+C to stop all servers")
    print("="*60)
    
    try:
        # Wait for processes
        while True:
            time.sleep(1)
            
            # Check if processes are still running
            if backend_process.poll() is not None:
                print("\n❌ Backend process stopped unexpectedly")
                break
            
            if frontend_process.poll() is not None:
                print("\n❌ Frontend process stopped unexpectedly")
                break
                
    except KeyboardInterrupt:
        print("\n\n🛑 Shutting down servers...")
    
    finally:
        # Clean up processes
        if backend_process:
            backend_process.terminate()
        if frontend_process:
            frontend_process.terminate()
        
        print("✅ All servers stopped")

if __name__ == "__main__":
    main()