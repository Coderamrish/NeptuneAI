#!/usr/bin/env python3
"""
Setup script for NeptuneAI ARGO Ocean Data Platform
Installs dependencies and initializes the system
"""

import os
import sys
import subprocess
import platform
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔧 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        print(f"Error output: {e.stderr}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8+ is required. Current version:", f"{version.major}.{version.minor}")
        return False
    print(f"✅ Python version {version.major}.{version.minor}.{version.micro} is compatible")
    return True

def install_dependencies():
    """Install Python dependencies"""
    print("\n📦 Installing Python dependencies...")
    
    # Core dependencies
    core_deps = [
        "pandas>=1.5.0",
        "numpy>=1.21.0",
        "sqlalchemy>=1.4.0",
        "psycopg2-binary>=2.9.0",
        "python-dotenv>=0.19.0",
        "streamlit>=1.28.0",
        "plotly>=5.15.0",
        "xarray>=2023.1.0",
        "netCDF4>=1.6.0",
        "scipy>=1.9.0",
        "bcrypt>=4.0.0",
        "pathlib2>=2.3.0"
    ]
    
    # AI/ML dependencies
    ai_deps = [
        "openai>=1.0.0",
        "groq>=0.4.0",
        "sentence-transformers>=2.2.0",
        "faiss-cpu>=1.7.0"
    ]
    
    # Optional dependencies
    optional_deps = [
        "folium>=0.14.0",
        "geopandas>=0.13.0",
        "shapely>=1.8.0",
        "pyproj>=3.4.0"
    ]
    
    all_deps = core_deps + ai_deps + optional_deps
    
    for dep in all_deps:
        if not run_command(f"pip install \"{dep}\"", f"Installing {dep}"):
            print(f"⚠️  Warning: Failed to install {dep}")
    
    return True

def create_directories():
    """Create necessary directories"""
    print("\n📁 Creating directories...")
    
    directories = [
        "data",
        "data/netcdf",
        "data/processed",
        "exports",
        "vector_index",
        "logs",
        "config"
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"✅ Created directory: {directory}")
    
    return True

def create_env_file():
    """Create .env file template"""
    print("\n🔐 Creating environment file template...")
    
    env_content = """# NeptuneAI Environment Configuration

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

# Optional: External Services
# WEATHER_API_KEY=your_weather_api_key
# MAPBOX_TOKEN=your_mapbox_token
"""
    
    env_file = Path(".env")
    if not env_file.exists():
        with open(env_file, 'w') as f:
            f.write(env_content)
        print("✅ Created .env template file")
        print("⚠️  Please edit .env file with your actual credentials")
    else:
        print("✅ .env file already exists")
    
    return True

def create_database_schema():
    """Create database schema"""
    print("\n🗄️  Setting up database schema...")
    
    schema_sql = """
-- NeptuneAI Database Schema
-- Run this in your PostgreSQL database

-- CREATE DATABASE neptuneai;
-- \\c neptuneai;

-- Create ocean data table
DROP TABLE IF EXISTS oceanbench_data;
CREATE TABLE oceanbench_data (
    "file" TEXT,
    "date" TEXT, 
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "ocean" TEXT,
    "profiler_code" BIGINT,
    "institution_code" TEXT,
    "date_update" TEXT,
    "wmo" BIGINT,
    "cyc" BIGINT,
    "institution" TEXT,
    "dac" TEXT,
    "profiler" TEXT,
    "Month" TEXT,
    "Region" TEXT
);

-- Create indexes
CREATE INDEX idx_month ON oceanbench_data("Month");
CREATE INDEX idx_region ON oceanbench_data("Region");
CREATE INDEX idx_date ON oceanbench_data("date");
CREATE INDEX idx_profiler ON oceanbench_data("profiler");
CREATE INDEX idx_institution ON oceanbench_data("institution");
CREATE INDEX idx_ocean ON oceanbench_data("ocean");
CREATE INDEX idx_lat_lon ON oceanbench_data("latitude", "longitude");

-- Add comments
COMMENT ON TABLE oceanbench_data IS 'Oceanographic profiler deployment metadata from various institutions';
COMMENT ON COLUMN oceanbench_data."file" IS 'Path to the original NetCDF profiler data file';
COMMENT ON COLUMN oceanbench_data."date" IS 'Date and time of profiler measurement';
COMMENT ON COLUMN oceanbench_data."profiler" IS 'Type and description of profiling instrument used';
COMMENT ON COLUMN oceanbench_data."institution" IS 'Institution responsible for the profiler deployment';
COMMENT ON COLUMN oceanbench_data."Month" IS 'Month name extracted from date for temporal analysis';
COMMENT ON COLUMN oceanbench_data."Region" IS 'Ocean region classification for spatial analysis';
"""
    
    schema_file = Path("database_schema.sql")
    with open(schema_file, 'w') as f:
        f.write(schema_sql)
    
    print("✅ Created database schema file: database_schema.sql")
    print("⚠️  Please run this SQL script in your PostgreSQL database")
    
    return True

def create_sample_data():
    """Create sample data for testing"""
    print("\n📊 Creating sample data...")
    
    try:
        import pandas as pd
        import numpy as np
        from datetime import datetime, timedelta
        
        # Generate sample ARGO data
        np.random.seed(42)
        n_records = 1000
        
        sample_data = {
            'file': [f'argo_{i:06d}.nc' for i in range(n_records)],
            'date': pd.date_range('2020-01-01', periods=n_records, freq='D').strftime('%Y-%m-%d'),
            'latitude': np.random.uniform(-40, 25, n_records),
            'longitude': np.random.uniform(40, 120, n_records),
            'ocean': np.random.choice(['I', 'P', 'A'], n_records),
            'profiler_code': np.random.randint(100000, 999999, n_records),
            'institution_code': np.random.choice(['AOML', 'CSIRO', 'IFREMER', 'JAMSTEC'], n_records),
            'date_update': pd.date_range('2020-01-01', periods=n_records, freq='D').strftime('%Y-%m-%d'),
            'wmo': np.random.randint(100000, 999999, n_records),
            'cyc': np.random.randint(1, 100, n_records),
            'institution': np.random.choice(['AOML, USA', 'CSIRO, Australia', 'IFREMER, France', 'JAMSTEC, Japan'], n_records),
            'dac': np.random.choice(['AOML', 'CSIRO', 'IFREMER', 'JAMSTEC'], n_records),
            'profiler': np.random.choice(['Teledyne Webb Research float', 'APEX float', 'ARVOR float', 'SOLO float'], n_records),
            'Month': pd.date_range('2020-01-01', periods=n_records, freq='D').strftime('%B'),
            'Region': np.random.choice(['Indian Ocean', 'Pacific Ocean', 'Atlantic Ocean'], n_records)
        }
        
        df = pd.DataFrame(sample_data)
        df.to_csv('data/sample_argo_data.csv', index=False)
        
        print(f"✅ Created sample data: data/sample_argo_data.csv ({len(df)} records)")
        return True
        
    except Exception as e:
        print(f"❌ Error creating sample data: {e}")
        return False

def create_docker_files():
    """Create Docker configuration files"""
    print("\n🐳 Creating Docker configuration...")
    
    # Dockerfile
    dockerfile_content = """FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    gcc \\
    g++ \\
    libpq-dev \\
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8501

# Run the application
CMD ["streamlit", "run", "frontend/app.py", "--server.port=8501", "--server.address=0.0.0.0"]
"""
    
    with open('Dockerfile', 'w') as f:
        f.write(dockerfile_content)
    
    # docker-compose.yml
    docker_compose_content = """version: '3.8'

services:
  neptuneai:
    build: .
    ports:
      - "8501:8501"
    environment:
      - DB_HOST=postgres
      - DB_USER=neptuneai
      - DB_PASS=neptuneai123
      - DB_NAME=neptuneai
    depends_on:
      - postgres
    volumes:
      - ./data:/app/data
      - ./exports:/app/exports
      - ./vector_index:/app/vector_index

  postgres:
    image: postgres:13
    environment:
      - POSTGRES_DB=neptuneai
      - POSTGRES_USER=neptuneai
      - POSTGRES_PASSWORD=neptuneai123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database_schema.sql:/docker-entrypoint-initdb.d/init.sql

volumes:
  postgres_data:
"""
    
    with open('docker-compose.yml', 'w') as f:
        f.write(docker_compose_content)
    
    print("✅ Created Dockerfile and docker-compose.yml")
    return True

def main():
    """Main setup function"""
    print("🌊 NeptuneAI ARGO Ocean Data Platform Setup")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Install dependencies
    if not install_dependencies():
        print("❌ Dependency installation failed")
        sys.exit(1)
    
    # Create directories
    if not create_directories():
        print("❌ Directory creation failed")
        sys.exit(1)
    
    # Create environment file
    if not create_env_file():
        print("❌ Environment file creation failed")
        sys.exit(1)
    
    # Create database schema
    if not create_database_schema():
        print("❌ Database schema creation failed")
        sys.exit(1)
    
    # Create sample data
    if not create_sample_data():
        print("❌ Sample data creation failed")
        sys.exit(1)
    
    # Create Docker files
    if not create_docker_files():
        print("❌ Docker configuration creation failed")
        sys.exit(1)
    
    print("\n🎉 Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Edit .env file with your database credentials and API keys")
    print("2. Set up PostgreSQL database and run database_schema.sql")
    print("3. Run: streamlit run frontend/app.py")
    print("4. Or use Docker: docker-compose up")
    print("\n🌊 Welcome to NeptuneAI!")

if __name__ == "__main__":
    main()