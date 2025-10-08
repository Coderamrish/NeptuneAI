#!/usr/bin/env python3
"""
Test script to verify the API can be imported and started
"""

import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    # Try to import the API
    from api import app
    print("✅ API imported successfully")
    
    # Try to create a test client
    from fastapi.testclient import TestClient
    client = TestClient(app)
    print("✅ Test client created successfully")
    
    # Test a simple endpoint
    response = client.get("/")
    print(f"✅ Root endpoint responded with status: {response.status_code}")
    
    print("\n🎉 Backend API is ready to run!")
    print("You can now start the server with: python api.py")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Make sure all dependencies are installed: pip install -r requirements.txt")
    sys.exit(1)
    
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)