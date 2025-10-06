#!/usr/bin/env python3
"""
NeptuneAI ARGO Ocean Data Platform Launcher
Simple launcher script with error handling and setup checks
"""

import os
import sys
import subprocess
from pathlib import Path

def check_dependencies():
    """Check if required dependencies are installed"""
    print("🔍 Checking dependencies...")
    
    required_packages = [
        'streamlit', 'plotly', 'pandas', 'numpy', 'sqlalchemy', 
        'psycopg2', 'python-dotenv', 'xarray', 'netCDF4', 
        'faiss-cpu', 'sentence-transformers', 'groq', 'bcrypt'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"✅ {package}")
        except ImportError:
            print(f"❌ {package}")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n⚠️  Missing packages: {', '.join(missing_packages)}")
        print("Run: pip3 install " + " ".join(missing_packages))
        return False
    
    return True

def check_environment():
    """Check environment configuration"""
    print("\n🔧 Checking environment...")
    
    env_file = Path(".env")
    if not env_file.exists():
        print("⚠️  .env file not found")
        print("Creating template .env file...")
        
        env_template = """# NeptuneAI Environment Configuration

# Database Configuration
DB_USER=your_db_user
DB_PASS=your_db_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=neptuneai

# API Keys
OPENAI_API_KEY=your_openai_api_key_here
GROQ_API_KEY=your_groq_api_key_here
HUGGINGFACE_API_KEY=your_huggingface_api_key_here

# Application Settings
DEBUG=True
LOG_LEVEL=INFO
VECTOR_STORE_PATH=vector_index
NETCDF_PROCESSING_PATH=data/processed
EXPORT_PATH=exports
"""
        
        with open(env_file, 'w') as f:
            f.write(env_template)
        
        print("✅ Created .env template file")
        print("⚠️  Please edit .env file with your actual credentials")
        return False
    else:
        print("✅ .env file found")
        return True

def create_directories():
    """Create necessary directories"""
    print("\n📁 Creating directories...")
    
    directories = [
        "data", "data/netcdf", "data/processed", 
        "exports", "vector_index", "logs"
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"✅ {directory}")

def launch_application():
    """Launch the Streamlit application"""
    print("\n🚀 Launching NeptuneAI...")
    
    try:
        # Change to the correct directory
        os.chdir(Path(__file__).parent)
        
        # Launch Streamlit
        cmd = [sys.executable, "-m", "streamlit", "run", "frontend/app.py", 
               "--server.port=8501", "--server.address=0.0.0.0"]
        
        print(f"Running: {' '.join(cmd)}")
        subprocess.run(cmd, check=True)
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to launch application: {e}")
        return False
    except KeyboardInterrupt:
        print("\n👋 Application stopped by user")
        return True
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def main():
    """Main launcher function"""
    print("🌊 NeptuneAI ARGO Ocean Data Platform Launcher")
    print("=" * 50)
    
    # Check dependencies
    if not check_dependencies():
        print("\n❌ Please install missing dependencies and try again")
        return False
    
    # Check environment
    env_ok = check_environment()
    
    # Create directories
    create_directories()
    
    if not env_ok:
        print("\n⚠️  Environment not fully configured, but launching anyway...")
        print("Some features may not work without proper API keys and database connection")
    
    # Launch application
    return launch_application()

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)