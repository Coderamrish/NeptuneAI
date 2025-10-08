#!/usr/bin/env python3
"""
Test script to verify AI chat backend is working
"""

import requests
import json

def test_ai_chat():
    """Test the AI chat functionality"""
    base_url = "http://localhost:8000"
    
    print("🧪 Testing AI Chat Backend")
    print("=" * 30)
    
    # Test 1: Check if backend is running
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            print("✅ Backend is running")
        else:
            print("❌ Backend health check failed")
            return
    except Exception as e:
        print(f"❌ Cannot connect to backend: {e}")
        return
    
    # Test 2: Test login (get a token)
    print("\n🔐 Testing login...")
    login_data = {
        "username": "demo_user",
        "password": "demo123"
    }
    
    try:
        response = requests.post(f"{base_url}/api/auth/login", json=login_data)
        if response.status_code == 200:
            token_data = response.json()
            token = token_data.get('access_token')
            print("✅ Login successful")
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"Response: {response.text}")
            return
    except Exception as e:
        print(f"❌ Login error: {e}")
        return
    
    # Test 3: Test chat sessions
    print("\n💬 Testing chat sessions...")
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        # Get existing sessions
        response = requests.get(f"{base_url}/api/chat/sessions", headers=headers)
        if response.status_code == 200:
            sessions_data = response.json()
            print(f"✅ Found {len(sessions_data.get('sessions', []))} existing sessions")
        else:
            print(f"❌ Failed to get sessions: {response.status_code}")
            print(f"Response: {response.text}")
        
        # Create new session
        response = requests.post(f"{base_url}/api/chat/sessions", headers=headers)
        if response.status_code == 200:
            session_data = response.json()
            session_id = session_data.get('session_id')
            print(f"✅ Created new session: {session_id}")
        else:
            print(f"❌ Failed to create session: {response.status_code}")
            print(f"Response: {response.text}")
            return
        
    except Exception as e:
        print(f"❌ Sessions error: {e}")
        return
    
    # Test 4: Test AI chat message
    print("\n🤖 Testing AI chat message...")
    message_data = {
        "session_id": session_id,
        "message": "What is the ocean temperature?"
    }
    
    try:
        response = requests.post(f"{base_url}/api/chat/message", 
                               json=message_data, 
                               headers=headers)
        if response.status_code == 200:
            chat_data = response.json()
            print("✅ AI chat message successful!")
            print(f"Response: {chat_data.get('response', 'No response')[:100]}...")
            if chat_data.get('plots'):
                print(f"Plots generated: {len(chat_data['plots'])}")
        else:
            print(f"❌ AI chat failed: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ AI chat error: {e}")
    
    print("\n🎉 AI Chat Backend Test Complete!")

if __name__ == "__main__":
    test_ai_chat()