#!/usr/bin/env python3
"""
NeptuneAI Frontend Launcher
Quick launcher for the modern Streamlit frontend
"""

import subprocess
import sys
import os
from pathlib import Path

def main():
    """Launch the NeptuneAI frontend"""
    print("🌊 Launching NeptuneAI ARGO Ocean Data Platform Frontend...")
    
    # Change to the frontend directory
    frontend_dir = Path(__file__).parent / "frontend"
    os.chdir(frontend_dir)
    
    # Launch Streamlit
    try:
        cmd = [sys.executable, "-m", "streamlit", "run", "app.py", 
               "--server.port=8501", "--server.address=0.0.0.0",
               "--theme.base=light", "--theme.primaryColor=#3498db"]
        
        print(f"Running: {' '.join(cmd)}")
        print("🚀 Frontend will be available at: http://localhost:8501")
        print("Press Ctrl+C to stop the server")
        
        subprocess.run(cmd, check=True)
        
    except KeyboardInterrupt:
        print("\n👋 Frontend stopped by user")
    except Exception as e:
        print(f"❌ Error launching frontend: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
