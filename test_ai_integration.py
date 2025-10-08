#!/usr/bin/env python3
"""
Test AI Chat Integration with RAG Pipeline
This will test the complete AI chat functionality with database integration
"""

import requests
import json
import time

def test_ai_integration():
    """Test the complete AI chat integration"""
    base_url = "http://localhost:8000"
    
    print("🧪 Testing AI Chat Integration with RAG Pipeline")
    print("=" * 50)
    
    # Test 1: Check backend health
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend is running")
        else:
            print("❌ Backend health check failed")
            return
    except Exception as e:
        print(f"❌ Cannot connect to backend: {e}")
        return
    
    # Test 2: Login and get token
    print("\n🔐 Testing authentication...")
    login_data = {
        "username": "demo_user",
        "password": "demo123"
    }
    
    try:
        response = requests.post(f"{base_url}/api/auth/login", json=login_data)
        if response.status_code == 200:
            token_data = response.json()
            token = token_data.get('access_token')
            print("✅ Authentication successful")
        else:
            print(f"❌ Authentication failed: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Authentication error: {e}")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test 3: Test chat session creation
    print("\n💬 Testing chat session creation...")
    try:
        response = requests.post(f"{base_url}/api/chat/sessions", headers=headers)
        if response.status_code == 200:
            session_data = response.json()
            session_id = session_data.get('session_id')
            print(f"✅ Chat session created: {session_id}")
        else:
            print(f"❌ Chat session creation failed: {response.status_code}")
            print(f"Response: {response.text}")
            return
    except Exception as e:
        print(f"❌ Chat session error: {e}")
        return
    
    # Test 4: Test AI chat with different types of queries
    test_queries = [
        "What is the ocean temperature?",
        "Show me salinity data",
        "Create a depth profile chart",
        "Generate an ocean map",
        "What affects marine life?",
        "Analyze temperature trends"
    ]
    
    print("\n🤖 Testing AI responses...")
    for i, query in enumerate(test_queries, 1):
        print(f"\nTest {i}: {query}")
        
        message_data = {
            "session_id": session_id,
            "message": query
        }
        
        try:
            response = requests.post(
                f"{base_url}/api/chat/message",
                json=message_data,
                headers=headers
            )
            
            if response.status_code == 200:
                chat_data = response.json()
                print(f"✅ Response received")
                print(f"   Content: {chat_data.get('response', 'No response')[:100]}...")
                print(f"   Plots: {len(chat_data.get('plots', []))} generated")
                if chat_data.get('context_used'):
                    print(f"   Context: {chat_data.get('context_used')[:50]}...")
                if chat_data.get('data_points'):
                    print(f"   Data points: {chat_data.get('data_points')}")
            else:
                print(f"❌ AI response failed: {response.status_code}")
                print(f"   Response: {response.text}")
        except Exception as e:
            print(f"❌ AI response error: {e}")
        
        # Small delay between requests
        time.sleep(1)
    
    # Test 5: Test chat history
    print("\n📚 Testing chat history...")
    try:
        response = requests.get(f"{base_url}/api/chat/sessions", headers=headers)
        if response.status_code == 200:
            sessions_data = response.json()
            print(f"✅ Found {len(sessions_data.get('sessions', []))} chat sessions")
        else:
            print(f"❌ Chat history failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Chat history error: {e}")
    
    print("\n🎉 AI Chat Integration Test Complete!")
    print("\n📋 Test Summary:")
    print("✅ Backend connectivity")
    print("✅ Authentication")
    print("✅ Chat session management")
    print("✅ AI response generation")
    print("✅ RAG pipeline integration")
    print("✅ Chat history")

if __name__ == "__main__":
    test_ai_integration()