#!/usr/bin/env python3
"""
NeptuneAI Full Stack Launcher
Launches both backend and frontend simultaneously
"""

import subprocess
import sys
import os
import time
import signal
import threading
from pathlib import Path

class NeptuneAILauncher:
    def __init__(self):
        self.backend_process = None
        self.frontend_process = None
        self.running = True
        
    def start_backend(self):
        """Start the Python backend server"""
        print("🐍 Starting Python Backend...")
        try:
            # Check if we're in a virtual environment
            if hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
                print("✅ Python virtual environment detected")
            else:
                print("⚠️  No virtual environment detected. Consider using one.")
            
            # Start backend
            self.backend_process = subprocess.Popen([
                sys.executable, '-m', 'streamlit', 'run', 'frontend/app_enhanced.py',
                '--server.port=8000', '--server.address=0.0.0.0',
                '--server.headless=true'
            ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            
            # Give backend time to start
            time.sleep(3)
            
            # Check if backend started successfully
            if self.backend_process.poll() is None:
                print("✅ Backend started successfully on port 8000")
                return True
            else:
                print("❌ Backend failed to start")
                return False
                
        except Exception as e:
            print(f"❌ Error starting backend: {e}")
            return False
    
    def start_frontend(self):
        """Start the React frontend"""
        print("⚛️  Starting React Frontend...")
        try:
            # Check if React frontend exists
            if not Path('neptuneai-frontend').exists():
                print("❌ React frontend not found. Please create it first:")
                print("   npx create-react-app neptuneai-frontend")
                return False
            
            # Check if node_modules exists
            if not Path('neptuneai-frontend/node_modules').exists():
                print("📦 Installing React dependencies...")
                install_process = subprocess.run(['npm', 'install'], cwd='neptuneai-frontend')
                if install_process.returncode != 0:
                    print("❌ Failed to install React dependencies")
                    return False
            
            # Set environment variables
            env = os.environ.copy()
            env['REACT_APP_API_URL'] = 'http://localhost:8000'
            env['BROWSER'] = 'none'  # Don't auto-open browser
            
            # Start React
            self.frontend_process = subprocess.Popen([
                'npm', 'start'
            ], cwd='neptuneai-frontend', env=env)
            
            # Give frontend time to start
            time.sleep(5)
            
            if self.frontend_process.poll() is None:
                print("✅ Frontend started successfully on port 3000")
                return True
            else:
                print("❌ Frontend failed to start")
                return False
                
        except Exception as e:
            print(f"❌ Error starting frontend: {e}")
            return False
    
    def check_services(self):
        """Check if both services are running"""
        backend_running = self.backend_process and self.backend_process.poll() is None
        frontend_running = self.frontend_process and self.frontend_process.poll() is None
        
        return backend_running, frontend_running
    
    def stop_services(self):
        """Stop both services"""
        print("\n🛑 Stopping services...")
        
        if self.frontend_process:
            self.frontend_process.terminate()
            print("✅ Frontend stopped")
        
        if self.backend_process:
            self.backend_process.terminate()
            print("✅ Backend stopped")
        
        self.running = False
    
    def signal_handler(self, signum, frame):
        """Handle Ctrl+C gracefully"""
        print(f"\n🛑 Received signal {signum}")
        self.stop_services()
        sys.exit(0)
    
    def run(self):
        """Main launcher function"""
        print("🌊 NeptuneAI Full Stack Launcher")
        print("=" * 50)
        
        # Set up signal handler for graceful shutdown
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)
        
        # Start backend
        if not self.start_backend():
            print("❌ Failed to start backend. Exiting.")
            return False
        
        # Start frontend
        if not self.start_frontend():
            print("❌ Failed to start frontend. Stopping backend.")
            self.stop_services()
            return False
        
        # Display status
        print("\n🎉 Both services are running!")
        print("=" * 50)
        print("🌐 Frontend: http://localhost:3000")
        print("🔗 Backend API: http://localhost:8000")
        print("📊 Streamlit UI: http://localhost:8000")
        print("=" * 50)
        print("Press Ctrl+C to stop both services")
        
        # Monitor services
        try:
            while self.running:
                backend_running, frontend_running = self.check_services()
                
                if not backend_running:
                    print("❌ Backend stopped unexpectedly")
                    break
                
                if not frontend_running:
                    print("❌ Frontend stopped unexpectedly")
                    break
                
                time.sleep(1)
                
        except KeyboardInterrupt:
            pass
        finally:
            self.stop_services()
        
        return True

def main():
    launcher = NeptuneAILauncher()
    success = launcher.run()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()