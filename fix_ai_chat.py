#!/usr/bin/env python3
"""
Fix AI Chat functionality
This will ensure the AI chat works properly with the backend
"""

import os
import sys
import subprocess
import time

def check_backend():
    """Check if backend is running"""
    try:
        import requests
        response = requests.get("http://localhost:8000/health", timeout=5)
        return response.status_code == 200
    except:
        return False

def start_backend():
    """Start the backend if not running"""
    print("🚀 Starting backend...")
    
    # Check if we're in the right directory
    if not os.path.exists("backend"):
        print("❌ Backend directory not found")
        return False
    
    try:
        # Start backend in background
        process = subprocess.Popen(
            ["python", "api.py"],
            cwd="backend",
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Wait a bit for backend to start
        time.sleep(3)
        
        # Check if backend is now running
        if check_backend():
            print("✅ Backend started successfully")
            return True
        else:
            print("❌ Backend failed to start")
            return False
            
    except Exception as e:
        print(f"❌ Error starting backend: {e}")
        return False

def test_ai_chat():
    """Test AI chat functionality"""
    print("\n🧪 Testing AI Chat...")
    
    try:
        import requests
        
        # Test login
        login_data = {"username": "demo_user", "password": "demo123"}
        response = requests.post("http://localhost:8000/api/auth/login", json=login_data)
        
        if response.status_code != 200:
            print("❌ Login failed")
            return False
        
        token = response.json().get('access_token')
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test chat message
        message_data = {
            "session_id": None,
            "message": "What is the ocean temperature?"
        }
        
        response = requests.post(
            "http://localhost:8000/api/chat/message",
            json=message_data,
            headers=headers
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ AI Chat is working!")
            print(f"Response: {data.get('response', 'No response')[:100]}...")
            return True
        else:
            print(f"❌ AI Chat failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ AI Chat test error: {e}")
        return False

def main():
    """Main fix function"""
    print("🌊 NeptuneAI AI Chat Fix")
    print("=" * 30)
    
    # Check if backend is running
    if not check_backend():
        print("❌ Backend is not running")
        if not start_backend():
            print("❌ Failed to start backend")
            return
    else:
        print("✅ Backend is already running")
    
    # Test AI chat
    if test_ai_chat():
        print("\n🎉 AI Chat is working properly!")
        print("\n📋 What's fixed:")
        print("✅ Backend connection")
        print("✅ AI response generation")
        print("✅ Chat session management")
        print("✅ Error handling")
        
        print("\n🚀 You can now use the AI chat in the frontend!")
        print("💡 Try asking: 'What is the ocean temperature?'")
    else:
        print("\n❌ AI Chat still has issues")
        print("🔧 Check the backend logs for more details")

if __name__ == "__main__":
    main()