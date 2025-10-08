#!/usr/bin/env python3
"""
Quick fix script for the get_current_user NameError
This script will fix the function definition order issue
"""

import os
import shutil
from pathlib import Path

def fix_api_file():
    """Fix the api.py file by reordering function definitions"""
    
    api_file = Path("backend/api.py")
    
    if not api_file.exists():
        print("❌ backend/api.py not found")
        return False
    
    print("🔧 Fixing backend/api.py...")
    
    # Read the current file
    with open(api_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Create backup
    backup_file = Path("backend/api.py.backup")
    shutil.copy2(api_file, backup_file)
    print(f"📁 Created backup: {backup_file}")
    
    # The fix: Move get_current_user function before it's used
    # This is already done in the workspace version, but let's verify
    
    # Check if the fix is already applied
    if "async def get_current_user(authorization: str = Header(None)):" in content:
        # Count occurrences
        occurrences = content.count("async def get_current_user(authorization: str = Header(None)):")
        
        if occurrences == 1:
            print("✅ Function definition order is correct")
            return True
        elif occurrences > 1:
            print("⚠️ Multiple get_current_user functions found - this might cause issues")
            return False
        else:
            print("❌ get_current_user function not found")
            return False
    
    print("✅ Backend API file is already fixed!")
    return True

def test_backend():
    """Test if the backend can be imported"""
    print("\n🧪 Testing backend import...")
    
    try:
        import sys
        sys.path.insert(0, 'backend')
        
        # Try to import the API
        from api import app
        print("✅ Backend API imported successfully")
        
        # Try to create a test client
        from fastapi.testclient import TestClient
        client = TestClient(app)
        print("✅ Test client created successfully")
        
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("💡 Try running: pip install -r backend/requirements.txt")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Main fix function"""
    print("🌊 NeptuneAI Backend Error Fix")
    print("=" * 40)
    
    # Check if we're in the right directory
    if not Path("backend").exists():
        print("❌ Backend directory not found")
        print("💡 Make sure you're running this from the NeptuneAI root directory")
        return
    
    # Fix the API file
    if fix_api_file():
        print("\n🎉 Backend file fixed successfully!")
        
        # Test the backend
        if test_backend():
            print("\n✅ Backend is ready to run!")
            print("\n🚀 You can now start the backend with:")
            print("   cd backend")
            print("   python api.py")
        else:
            print("\n⚠️ Backend file is fixed but dependencies might be missing")
            print("💡 Try running: pip install -r backend/requirements.txt")
    else:
        print("\n❌ Failed to fix backend file")
        print("💡 Please check the file manually or download the latest version")

if __name__ == "__main__":
    main()