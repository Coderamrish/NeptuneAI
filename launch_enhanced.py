#!/usr/bin/env python3
"""
NeptuneAI Enhanced Frontend Launcher
Launcher for the enhanced frontend with full backend integration
"""

import subprocess
import sys
import os
from pathlib import Path

def main():
    """Launch the NeptuneAI enhanced frontend"""
    print("🌊 Launching NeptuneAI Enhanced Frontend...")
    
    # Change to the frontend directory
    frontend_dir = Path(__file__).parent / "frontend"
    os.chdir(frontend_dir)
    
    # Launch Streamlit with enhanced app
    try:
        cmd = [sys.executable, "-m", "streamlit", "run", "app_enhanced.py", 
               "--server.port=8501", "--server.address=0.0.0.0",
               "--theme.base=light", "--theme.primaryColor=#3498db"]
        
        print(f"Running: {' '.join(cmd)}")
        print("🚀 Enhanced Frontend will be available at: http://localhost:8501")
        print("✨ Features: Full backend integration, AI insights, real data processing")
        print("Press Ctrl+C to stop the server")
        
        subprocess.run(cmd, check=True)
        
    except KeyboardInterrupt:
        print("\n👋 Enhanced Frontend stopped by user")
    except Exception as e:
        print(f"❌ Error launching enhanced frontend: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)