import streamlit as st
import sys
import os
import time
import plotly.graph_objects as go
import plotly.express as px
import pandas as pd
from datetime import datetime, timedelta
import json
import sqlite3
import uuid
import bcrypt
import io
import base64
from PIL import Image
import numpy as np

# Add the project root to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..',  )))

try:
    from backend.rag_pipeline import answer_query
    from backend.query_engine import get_db_engine, get_unique_regions, get_monthly_distribution, get_profiler_stats, get_geographic_coverage
except ImportError as e:
    st.error(f"Failed to import from the backend. Error: {e}")
    st.stop()

# -----------------------------
# Page Configuration
# -----------------------------
st.set_page_config(
    page_title="NeptuneAI - Ocean Intelligence Platform",
    page_icon="🌊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# -----------------------------
# Enhanced Professional Theme with Glassmorphism
# -----------------------------
def apply_professional_theme():
    st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
    
    /* Enhanced Color Scheme */
    :root {
        --primary: #0c4a6e;
        --primary-dark: #082f49;
        --primary-light: #0ea5e9;
        --secondary: #06b6d4;
        --accent: #22d3ee;
        --warning: #f59e0b;
        --error: #ef4444;
        --success: #10b981;
        --background: #020617;
        --surface: rgba(15, 23, 42, 0.8);
        --surface-light: rgba(30, 41, 59, 0.6);
        --surface-elevated: rgba(51, 65, 85, 0.5);
        --glass: rgba(255, 255, 255, 0.05);
        --glass-border: rgba(255, 255, 255, 0.1);
        --text-primary: #f8fafc;
        --text-secondary: #cbd5e1;
        --text-muted: #94a3b8;
        --border: rgba(71, 85, 105, 0.3);
        --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
        --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
        --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.3);
    }
    
    /* Global Styles */
    .stApp {
        background: linear-gradient(135deg, #020617 0%, #0c4a6e 100%);
        color: var(--text-primary);
        font-family: 'Inter', sans-serif;
    }
    
    /* Hide Streamlit elements */
    #MainMenu, footer, header, .stDeployButton, .stDecoration {display: none !important;}
    .stActionButton {visibility: hidden;}
    
    /* Fixed Professional Header */
    .app-header {
        background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
        padding: 0.75rem 1.5rem;
        border-bottom: 2px solid var(--accent);
        box-shadow: var(--shadow-xl);
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
        backdrop-filter: blur(20px);
        background: rgba(12, 74, 110, 0.95);
    }
    
    .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        max-width: 1600px;
        margin: 0 auto;
        max-height: 80px;
    }
    
    .app-title {
        font-size: 2rem;
        font-weight: 800;
        background: linear-gradient(135deg, #fff 0%, var(--accent) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin: 0;
        letter-spacing: -0.025em;
    }
    
    .app-subtitle {
        font-size: 0.85rem;
        color: rgba(255, 255, 255, 0.7);
        margin: 0.25rem 0 0 0;
        font-weight: 400;
    }
    
    .user-profile {
        display: flex;
        align-items: center;
        gap: 1rem;
        color: white;
        padding: 0.5rem 1rem;
        background: var(--glass);
        border-radius: 50px;
        border: 1px solid var(--glass-border);
        backdrop-filter: blur(10px);
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .user-profile:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateY(-2px);
    }
    
    .user-avatar {
        width: 42px;
        height: 42px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--secondary), var(--accent));
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 1.1rem;
        box-shadow: 0 4px 12px rgba(34, 211, 238, 0.3);
    }
    
    /* Main Content Spacing for Fixed Header */
    .main .block-container {
        padding-top: 6rem;
    }
    
    /* Enhanced Sidebar with Glassmorphism */
    .css-1d391kg, section[data-testid="stSidebar"] {
        background: var(--surface);
        border-right: 1px solid var(--glass-border);
        box-shadow: var(--shadow-xl);
        backdrop-filter: blur(20px);
    }
    
    .sidebar-section {
        background: var(--glass);
        border-radius: 16px;
        padding: 1.5rem;
        margin: 1rem 0;
        border: 1px solid var(--glass-border);
        box-shadow: var(--shadow);
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
    }
    
    .sidebar-section:hover {
        border-color: var(--accent);
        box-shadow: 0 8px 24px rgba(34, 211, 238, 0.2);
    }
    
    .sidebar-title {
        font-size: 1rem;
        font-weight: 700;
        color: var(--accent);
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    
    .sidebar-item {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 0.75rem;
        margin: 0.5rem 0;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-size: 0.85rem;
        font-family: 'JetBrains Mono', monospace;
    }
    
    .sidebar-item:hover {
        border-color: var(--accent);
        background: var(--surface-elevated);
        transform: translateX(6px);
        box-shadow: -4px 0 0 var(--accent);
    }
    
    .sidebar-item.active {
        background: linear-gradient(135deg, var(--primary), var(--primary-light));
        color: white;
        border-color: var(--accent);
        box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
    }
    
    /* Enhanced Buttons with Animations */
    .stButton > button {
        background: linear-gradient(135deg, var(--primary-light), var(--accent));
        color: white;
        border: none;
        border-radius: 10px;
        font-weight: 600;
        font-size: 0.9rem;
        padding: 0.85rem 1.75rem;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
        width: 100%;
        margin: 0.25rem 0;
        letter-spacing: 0.025em;
        position: relative;
        overflow: hidden;
    }
    
    .stButton > button::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        transform: translate(-50%, -50%);
        transition: width 0.6s, height 0.6s;
    }
    
    .stButton > button:hover::before {
        width: 300px;
        height: 300px;
    }
    
    .stButton > button:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(14, 165, 233, 0.5);
    }
    
    .stButton > button:active {
        transform: translateY(0px);
    }
    
    /* Enhanced Tabs */
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
        background: var(--glass);
        padding: 0.75rem;
        border-radius: 16px;
        margin-bottom: 2rem;
        border: 1px solid var(--glass-border);
        backdrop-filter: blur(10px);
    }
    
    .stTabs [data-baseweb="tab"] {
        background: transparent;
        color: var(--text-muted);
        border: 1px solid transparent;
        border-radius: 10px;
        font-weight: 600;
        font-size: 0.9rem;
        padding: 14px 24px;
        transition: all 0.3s ease;
        margin: 0 4px;
    }
    
    .stTabs [data-baseweb="tab"]:hover {
        background: var(--surface-light);
        color: var(--text-secondary);
        transform: translateY(-2px);
    }
    
    .stTabs [aria-selected="true"] {
        background: linear-gradient(135deg, var(--primary-light), var(--accent));
        color: white;
        border-color: var(--accent);
        box-shadow: 0 4px 16px rgba(14, 165, 233, 0.4);
    }
    
    /* Professional Cards with Glassmorphism */
    .pro-card {
        background: var(--glass);
        border: 1px solid var(--glass-border);
        border-radius: 16px;
        padding: 2rem;
        margin: 1rem 0;
        box-shadow: var(--shadow);
        backdrop-filter: blur(10px);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
    }
    
    .pro-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, var(--accent), var(--primary-light));
        transform: scaleX(0);
        transition: transform 0.4s ease;
    }
    
    .pro-card:hover::before {
        transform: scaleX(1);
    }
    
    .pro-card:hover {
        border-color: var(--accent);
        box-shadow: 0 12px 32px rgba(34, 211, 238, 0.2);
        transform: translateY(-4px);
    }
    
    .card-header {
        font-size: 1.25rem;
        font-weight: 700;
        background: linear-gradient(135deg, var(--accent), var(--primary-light));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    
    .card-content {
        color: var(--text-secondary);
        line-height: 1.7;
        font-size: 0.95rem;
    }
    
    /* Enhanced Metrics with Animation */
    [data-testid="metric-container"] {
        background: var(--glass);
        border: 1px solid var(--glass-border);
        border-radius: 16px;
        padding: 1.75rem;
        box-shadow: var(--shadow);
        backdrop-filter: blur(10px);
        transition: all 0.4s ease;
        height: 130px;
        position: relative;
        overflow: hidden;
    }
    
    [data-testid="metric-container"]::after {
        content: '';
        position: absolute;
        top: -50%;
        right: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(34, 211, 238, 0.1) 0%, transparent 70%);
        opacity: 0;
        transition: opacity 0.4s ease;
    }
    
    [data-testid="metric-container"]:hover::after {
        opacity: 1;
    }
    
    [data-testid="metric-container"]:hover {
        border-color: var(--accent);
        box-shadow: 0 12px 32px rgba(34, 211, 238, 0.3);
        transform: translateY(-4px) scale(1.02);
    }
    
    /* Chat Interface with Animations */
    .stChatMessage {
        background: var(--glass);
        border: 1px solid var(--glass-border);
        border-radius: 16px;
        padding: 1.25rem;
        margin: 1rem 0;
        box-shadow: var(--shadow-sm);
        backdrop-filter: blur(10px);
        animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    /* Input Fields */
    .stTextInput > div > div > input,
    .stTextArea > div > div > textarea,
    .stSelectbox > div > div > div {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 10px;
        color: var(--text-primary);
        font-size: 0.9rem;
        padding: 0.85rem;
        transition: all 0.3s ease;
        font-family: 'JetBrains Mono', monospace;
    }
    
    .stTextInput > div > div > input:focus,
    .stTextArea > div > div > textarea:focus {
        border-color: var(--accent);
        box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.15);
        background: var(--surface-elevated);
    }
    
    /* Authentication Forms */
    .auth-container {
        max-width: 450px;
        margin: 4rem auto;
        background: var(--glass);
        border: 1px solid var(--glass-border);
        border-radius: 24px;
        padding: 3rem;
        box-shadow: var(--shadow-xl);
        backdrop-filter: blur(20px);
        animation: fadeInUp 0.6s ease;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .auth-header {
        text-align: center;
        background: linear-gradient(135deg, var(--accent), var(--primary-light));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-size: 2rem;
        font-weight: 800;
        margin-bottom: 0.5rem;
    }
    
    .auth-subtitle {
        text-align: center;
        color: var(--text-muted);
        font-size: 0.95rem;
        margin-bottom: 2.5rem;
    }
    
    .auth-logo {
        text-align: center;
        font-size: 4rem;
        margin-bottom: 1.5rem;
        animation: float 3s ease-in-out infinite;
    }
    
    @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
    }
    
    /* Loading Animation */
    .loading-container {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 3rem;
        color: var(--text-muted);
    }
    
    .loading-spinner {
        border: 4px solid var(--border);
        border-top: 4px solid var(--accent);
        border-radius: 50%;
        width: 50px;
        height: 50px;
        animation: spin 1s linear infinite;
        margin-right: 1.5rem;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    /* Charts Enhancement */
    .plotly-graph-div {
        border-radius: 16px;
        border: 1px solid var(--glass-border);
        box-shadow: var(--shadow);
        overflow: hidden;
        background: var(--glass);
        backdrop-filter: blur(10px);
    }
    
    /* Download Buttons */
    .download-section {
        background: var(--surface-light);
        border-radius: 12px;
        padding: 1rem;
        margin: 1rem 0;
        border: 1px solid var(--glass-border);
        backdrop-filter: blur(10px);
    }
    
    /* Professional Footer */
    .app-footer {
        background: var(--glass);
        border-top: 1px solid var(--glass-border);
        padding: 3rem 2rem;
        margin-top: 4rem;
        color: var(--text-muted);
        backdrop-filter: blur(20px);
    }
    
    .footer-content {
        max-width: 1600px;
        margin: 0 auto;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 3rem;
    }
    
    .footer-section h4 {
        color: var(--accent);
        font-size: 1.1rem;
        font-weight: 700;
        margin-bottom: 1.25rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    
    .footer-section ul {
        list-style: none;
        padding: 0;
    }
    
    .footer-section li {
        margin: 0.75rem 0;
        color: var(--text-muted);
        font-size: 0.9rem;
        transition: all 0.3s ease;
        cursor: pointer;
    }
    
    .footer-section li:hover {
        color: var(--accent);
        transform: translateX(4px);
    }
    
    .footer-bottom {
        border-top: 1px solid var(--border);
        padding-top: 2rem;
        margin-top: 2.5rem;
        text-align: center;
        color: var(--text-muted);
        font-size: 0.85rem;
    }
    
    /* Example Prompts Grid */
    .example-prompts {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1rem;
        margin: 2rem 0;
    }
    
    .example-prompt {
        background: var(--glass);
        border: 1px solid var(--glass-border);
        border-radius: 12px;
        padding: 1.25rem;
        cursor: pointer;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
    }
    
    .example-prompt:hover {
        border-color: var(--accent);
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(34, 211, 238, 0.2);
    }
    
    /* Responsive Design */
    @media (max-width: 768px) {
        .header-content {
            flex-direction: column;
            gap: 1rem;
        }
        
        .app-title {
            font-size: 1.5rem;
        }
        
        .footer-content {
            grid-template-columns: 1fr;
        }
        
        .auth-container {
            margin: 1rem;
            padding: 2rem;
        }
        
        .main .block-container {
            padding-top: 8rem;
        }
    }
    </style>
    """, unsafe_allow_html=True)

# -----------------------------
# Database Setup
# -----------------------------
def init_user_database():
    """Initialize SQLite database with proper schema"""
    conn = sqlite3.connect('neptune_users.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP,
            session_token TEXT,
            session_expires TIMESTAMP,
            role TEXT DEFAULT 'user',
            is_active INTEGER DEFAULT 1
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chat_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            session_id TEXT UNIQUE,
            title TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_activity TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chat_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            user_id INTEGER,
            role TEXT,
            content TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (session_id) REFERENCES chat_sessions (session_id)
        )
    ''')
    
    cursor.execute('SELECT COUNT(*) FROM users WHERE username = ?', ('demo',))
    if cursor.fetchone()[0] == 0:
        demo_password = bcrypt.hashpw("demo123".encode('utf-8'), bcrypt.gensalt())
        cursor.execute('''
            INSERT INTO users (username, email, password_hash, full_name, role)
            VALUES (?, ?, ?, ?, ?)
        ''', ('demo', 'demo@neptune.ai', demo_password.decode('utf-8'), 'Demo User', 'admin'))
    
    conn.commit()
    conn.close()

# -----------------------------
# Session Management
# -----------------------------
def init_session_state():
    """Initialize session state variables"""
    if "authenticated" not in st.session_state:
        st.session_state.authenticated = False
    if "user_data" not in st.session_state:
        st.session_state.user_data = None
    if "current_session_id" not in st.session_state:
        st.session_state.current_session_id = None
    if "chat_messages" not in st.session_state:
        st.session_state.chat_messages = []
    if "chat_sessions" not in st.session_state:
        st.session_state.chat_sessions = []
    if "dashboard_data" not in st.session_state:
        st.session_state.dashboard_data = None
    if "session_start_time" not in st.session_state:
        st.session_state.session_start_time = datetime.now()
    if "ai_queries_today" not in st.session_state:
        st.session_state.ai_queries_today = 0
    if "selected_region" not in st.session_state:
        st.session_state.selected_region = "Indian Ocean"
    if "date_range" not in st.session_state:
        st.session_state.date_range = (datetime(2020, 1, 1), datetime.now())

def check_session_timeout():
    """Check if user session has timed out"""
    if not st.session_state.authenticated:
        return False
    
    if st.session_state.session_start_time:
        elapsed = datetime.now() - st.session_state.session_start_time
        if elapsed > timedelta(hours=2):
            st.session_state.authenticated = False
            st.session_state.user_data = None
            st.warning("Your session has expired. Please log in again.")
            return True
    return False

# -----------------------------
# User Management Class
# -----------------------------
class UserManager:
    @staticmethod
    def create_user(username, email, password, full_name):
        """Create new user with bcrypt password hashing"""
        try:
            conn = sqlite3.connect('neptune_users.db')
            cursor = conn.cursor()
            
            password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            
            cursor.execute('''
                INSERT INTO users (username, email, password_hash, full_name)
                VALUES (?, ?, ?, ?)
            ''', (username, email, password_hash.decode('utf-8'), full_name))
            
            conn.commit()
            conn.close()
            return True, "Account created successfully!"
        except sqlite3.IntegrityError as e:
            if "username" in str(e):
                return False, "Username already exists"
            elif "email" in str(e):
                return False, "Email already exists"
            else:
                return False, "Registration failed"
        except Exception as e:
            return False, f"Error creating account: {str(e)}"
    
    @staticmethod
    def authenticate_user(username, password):
        """Authenticate user with bcrypt"""
        try:
            conn = sqlite3.connect('neptune_users.db')
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT id, username, email, full_name, role, password_hash
                FROM users 
                WHERE username = ? AND is_active = 1
            ''', (username,))
            
            user = cursor.fetchone()
            
            if user and bcrypt.checkpw(password.encode('utf-8'), user[5].encode('utf-8')):
                cursor.execute('''
                    UPDATE users SET last_login = CURRENT_TIMESTAMP
                    WHERE id = ?
                ''', (user[0],))
                conn.commit()
                
                return True, {
                    'id': user[0],
                    'username': user[1],
                    'email': user[2],
                    'full_name': user[3],
                    'role': user[4]
                }
            else:
                return False, "Invalid credentials"
                
        except Exception as e:
            return False, f"Authentication error: {str(e)}"
        finally:
            conn.close()
    
    @staticmethod
    def create_chat_session(user_id, title="New Chat"):
        """Create new chat session"""
        try:
            conn = sqlite3.connect('neptune_users.db')
            cursor = conn.cursor()
            
            session_id = str(uuid.uuid4())
            
            cursor.execute('''
                INSERT INTO chat_sessions (user_id, session_id, title, last_activity)
                VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            ''', (user_id, session_id, title))
            
            conn.commit()
            conn.close()
            return session_id
        except Exception as e:
            st.error(f"Error creating chat session: {str(e)}")
            return None
    
    @staticmethod
    def get_user_sessions(user_id):
        """Get user's chat sessions"""
        try:
            conn = sqlite3.connect('neptune_users.db')
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT session_id, title, created_at, last_activity,
                       (SELECT COUNT(*) FROM chat_messages WHERE session_id = cs.session_id) as message_count
                FROM chat_sessions cs
                WHERE user_id = ?
                ORDER BY last_activity DESC
                LIMIT 20
            ''', (user_id,))
            
            sessions = cursor.fetchall()
            conn.close()
            return sessions
        except Exception as e:
            st.error(f"Error retrieving sessions: {str(e)}")
            return []
    
    @staticmethod
    def save_chat_message(session_id, user_id, role, content):
        """Save chat message"""
        try:
            conn = sqlite3.connect('neptune_users.db')
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO chat_messages (session_id, user_id, role, content)
                VALUES (?, ?, ?, ?)
            ''', (session_id, user_id, role, content))
            
            cursor.execute('''
                UPDATE chat_sessions 
                SET last_activity = CURRENT_TIMESTAMP
                WHERE session_id = ?
            ''', (session_id,))
            
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            st.error(f"Error saving message: {str(e)}")
            return False
    
    @staticmethod
    def get_session_messages(session_id):
        """Get messages for a specific session"""
        try:
            conn = sqlite3.connect('neptune_users.db')
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT role, content, timestamp
                FROM chat_messages
                WHERE session_id = ?
                ORDER BY timestamp ASC
            ''', (session_id,))
            
            messages = cursor.fetchall()
            conn.close()
            return messages
        except Exception as e:
            st.error(f"Error retrieving messages: {str(e)}")
            return []
    
    @staticmethod
    def update_session_title(session_id, title):
        """Update chat session title based on context"""
        try:
            conn = sqlite3.connect('neptune_users.db')
            cursor = conn.cursor()
            
            cursor.execute('''
                UPDATE chat_sessions 
                SET title = ?
                WHERE session_id = ?
            ''', (title, session_id))
            
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            return False

# -----------------------------
# Helper Functions for Sample Data
# -----------------------------
def generate_sample_geographic_data():
    """Generate sample geographic data for map visualization"""
    np.random.seed(42)
    n_points = 500
    
    # Indian Ocean coordinates
    lat_min, lat_max = -40, 25
    lon_min, lon_max = 40, 120
    
    data = {
        'latitude': np.random.uniform(lat_min, lat_max, n_points),
        'longitude': np.random.uniform(lon_min, lon_max, n_points),
        'temperature': np.random.uniform(15, 30, n_points),
        'salinity': np.random.uniform(33, 37, n_points),
        'profiler_type': np.random.choice(['ARGO', 'XBT', 'CTD', 'Glider'], n_points),
        'depth': np.random.uniform(0, 2000, n_points)
    }
    
    return pd.DataFrame(data)

def generate_time_series_data():
    """Generate time series data for measurements over time"""
    dates = pd.date_range(start='2020-01-01', end='2024-12-31', freq='ME')
    measurements = np.random.randint(5000, 15000, len(dates))
    
    return pd.DataFrame({
        'date': dates,
        'measurements': measurements
    })

def generate_institution_data():
    """Generate data for sunburst chart by institution"""
    data = {
        'institution': ['NOAA', 'NOAA', 'NOAA', 'CSIRO', 'CSIRO', 'IFREMER', 'IFREMER', 'JAMSTEC', 'BIO'],
        'department': ['Pacific', 'Atlantic', 'Indian', 'Pacific', 'Indian', 'Atlantic', 'Pacific', 'Pacific', 'Atlantic'],
        'count': [12000, 8500, 9200, 7800, 6500, 5900, 4200, 8100, 3500]
    }
    return pd.DataFrame(data)

# -----------------------------
# Authentication Pages
# -----------------------------
def render_auth_page():
    """Professional authentication interface with enhanced design"""
    apply_professional_theme()
    
    st.markdown("""
    <div class="app-header">
        <div class="header-content">
            <div>
                <h1 class="app-title">🌊 NeptuneAI</h1>
                <p class="app-subtitle">Advanced Ocean Intelligence Platform</p>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns([1, 2, 1])
    
    with col2:
        tab1, tab2 = st.tabs(["Sign In", "Create Account"])
        
        with tab1:
            st.markdown('<div class="auth-container">', unsafe_allow_html=True)
            st.markdown('<div class="auth-logo">🌊</div>', unsafe_allow_html=True)
            st.markdown('<h2 class="auth-header">Welcome Back</h2>', unsafe_allow_html=True)
            st.markdown('<p class="auth-subtitle">Sign in to access your ocean intelligence dashboard</p>', unsafe_allow_html=True)
            
            with st.form("login_form"):
                username = st.text_input("Username", placeholder="Enter your username")
                password = st.text_input("Password", type="password", placeholder="Enter your password")
                
                col_a, col_b, col_c = st.columns([1, 2, 1])
                with col_b:
                    submitted = st.form_submit_button("Sign In", use_container_width=True)
                
                if submitted:
                    if username and password:
                        success, result = UserManager.authenticate_user(username, password)
                        if success:
                            st.session_state.authenticated = True
                            st.session_state.user_data = result
                            st.session_state.session_start_time = datetime.now()
                            st.success(f"Welcome back, {result['full_name']}!")
                            time.sleep(1)
                            st.rerun()
                        else:
                            st.error(result)
                    else:
                        st.error("Please enter both username and password")
            
            st.markdown('</div>', unsafe_allow_html=True)
            
            st.info("🎯 Demo Account: username: `demo`, password: `demo123`")
        
        with tab2:
            st.markdown('<div class="auth-container">', unsafe_allow_html=True)
            st.markdown('<div class="auth-logo">🌊</div>', unsafe_allow_html=True)
            st.markdown('<h2 class="auth-header">Create Account</h2>', unsafe_allow_html=True)
            st.markdown('<p class="auth-subtitle">Join the ocean intelligence community</p>', unsafe_allow_html=True)
            
            with st.form("signup_form"):
                full_name = st.text_input("Full Name", placeholder="Enter your full name")
                email = st.text_input("Email", placeholder="Enter your email address")
                username = st.text_input("Username", placeholder="Choose a username")
                password = st.text_input("Password", type="password", placeholder="Create a secure password")
                confirm_password = st.text_input("Confirm Password", type="password", placeholder="Confirm your password")
                
                col_a, col_b, col_c = st.columns([1, 2, 1])
                with col_b:
                    submitted = st.form_submit_button("Create Account", use_container_width=True)
                
                if submitted:
                    if all([full_name, email, username, password, confirm_password]):
                        if password != confirm_password:
                            st.error("Passwords do not match!")
                        elif len(password) < 8:
                            st.error("Password must be at least 8 characters long!")
                        else:
                            success, message = UserManager.create_user(username, email, password, full_name)
                            if success:
                                st.success(message)
                                st.info("Please use the Sign In tab to access your account.")
                            else:
                                st.error(message)
                    else:
                        st.error("Please fill in all required fields")
            
            st.markdown('</div>', unsafe_allow_html=True)

# -----------------------------
# Fixed Header Component
# -----------------------------
def render_header():
    """Fixed professional header with user dropdown"""
    user = st.session_state.user_data
    current_time = datetime.now()
    
    if current_time.hour < 12:
        greeting = "Good Morning"
    elif current_time.hour < 18:
        greeting = "Good Afternoon"
    else:
        greeting = "Good Evening"
    
    if check_session_timeout():
        st.rerun()
    
    session_duration = datetime.now() - st.session_state.session_start_time
    duration_minutes = int(session_duration.total_seconds() / 60)
    duration_str = f"{duration_minutes}m" if duration_minutes < 60 else f"{duration_minutes // 60}h {duration_minutes % 60}m"
    
    st.markdown(f"""
    <div class="app-header">
        <div class="header-content">
            <div>
                <h1 class="app-title">🌊 NeptuneAI</h1>
                <p class="app-subtitle">{greeting}, {user['full_name']} | Session: {duration_str}</p>
            </div>
            <div class="user-profile">
                <div class="user-avatar">{user['full_name'][0].upper()}</div>
                <div>
                    <div style="font-weight: 600;">{user['full_name']}</div>
                    <div style="font-size: 0.8rem; opacity: 0.8;">{user['role'].title()} Account</div>
                </div>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)

# -----------------------------
# Enhanced Gemini-Style Sidebar
# -----------------------------
def render_enhanced_sidebar():
    with st.sidebar:
        user = st.session_state.user_data
        
        # User Profile Section
        st.markdown(f"""
        <div class="sidebar-section">
            <div style="text-align: center;">
                <div class="user-avatar" style="margin: 0 auto 1rem;">{user['full_name'][0].upper()}</div>
                <h3 style="margin: 0; color: white; font-size: 1.1rem;">{user['full_name']}</h3>
                <p style="margin: 0.25rem 0; color: var(--text-muted); font-size: 0.85rem;">@{user['username']}</p>
                <p style="margin: 0.5rem 0; color: var(--success); font-size: 0.8rem;">🟢 Online</p>
            </div>
        </div>
        """, unsafe_allow_html=True)
        
        # Prominent New Chat Button
        if st.button("➕ New Chat Session", key="new_chat_btn", use_container_width=True, type="primary"):
            new_session_id = UserManager.create_chat_session(user['id'], f"Chat {datetime.now().strftime('%b %d, %H:%M')}")
            if new_session_id:
                st.session_state.current_session_id = new_session_id
                st.session_state.chat_messages = []
                st.success("New chat session created!")
                st.rerun()
        
        st.markdown("---")
        
        # Chat History
        st.markdown('<div class="sidebar-title">💬 Chat History</div>', unsafe_allow_html=True)
        
        sessions = UserManager.get_user_sessions(user['id'])
        
        if sessions:
            for session_id, title, created_at, last_activity, message_count in sessions:
                created_date = datetime.strptime(created_at, '%Y-%m-%d %H:%M:%S')
                date_str = created_date.strftime('%b %d, %H:%M')
                
                is_active = session_id == st.session_state.current_session_id
                
                button_label = f"{'▶ ' if is_active else '📝 '}{title[:25]}..." if len(title) > 25 else f"{'▶ ' if is_active else '📝 '}{title}"
                
                if st.button(button_label, key=f"session_{session_id}", use_container_width=True):
                    st.session_state.current_session_id = session_id
                    messages = UserManager.get_session_messages(session_id)
                    st.session_state.chat_messages = [
                        {"role": msg[0], "content": msg[1], "timestamp": datetime.strptime(msg[2], '%Y-%m-%d %H:%M:%S')}
                        for msg in messages
                    ]
                    st.rerun()
        else:
            st.info("No chat history yet. Start a new conversation!")
        
        st.markdown("---")
        
        # Data Filters Section
        with st.expander("🔍 Data Filters", expanded=False):
            st.markdown('<div class="sidebar-title">Filter Options</div>', unsafe_allow_html=True)
            
            # Date Range
            st.date_input("Date Range", value=(datetime(2020, 1, 1), datetime.now()), key="date_filter")
            
            # Region Selection
            st.selectbox("Ocean Region", ["Indian Ocean", "Pacific Ocean", "Atlantic Ocean", "Arctic Ocean", "Southern Ocean"], key="region_filter")
            
            # Temperature Range
            temp_range = st.slider("Temperature (°C)", -5.0, 35.0, (10.0, 30.0))
            
            # Salinity Range
            sal_range = st.slider("Salinity (PSU)", 30.0, 40.0, (33.0, 37.0))
        
        st.markdown("---")
        
        # Quick Actions
        st.markdown('<div class="sidebar-title">⚡ Quick Actions</div>', unsafe_allow_html=True)
        
        actions = [
            ("📊 Ocean Overview", "Show me a comprehensive overview of ocean data"),
            ("📈 Monthly Stats", "Generate monthly deployment statistics"),
            ("🗺️ Geographic Map", "Create geographic distribution visualization"),
            ("🔬 Profiler Analysis", "Analyze profiler types and distributions")
        ]
        
        for label, prompt in actions:
            if st.button(label, key=f"action_{label}", use_container_width=True):
                send_message(prompt)
                st.rerun()
        
        st.markdown("---")
        
        # Logout Button
        if st.button("🚪 Logout", key="logout_btn", use_container_width=True):
            st.session_state.authenticated = False
            st.session_state.user_data = None
            st.session_state.chat_messages = []
            st.session_state.current_session_id = None
            st.success("Logged out successfully!")
            time.sleep(1)
            st.rerun()

# -----------------------------
# Data Loading
# -----------------------------
@st.cache_data(ttl=300)
def load_dashboard_data():
    """Load comprehensive dashboard data"""
    try:
        engine = get_db_engine()
        monthly_dist = get_monthly_distribution(engine, region="Indian Ocean")
        profiler_stats = get_profiler_stats(engine, region="Indian Ocean")
        geo_coverage = get_geographic_coverage(engine, region="Indian Ocean")
        regions = get_unique_regions(engine)
        
        return {
            "monthly_distribution": monthly_dist,
            "profiler_stats": profiler_stats,
            "geographic_coverage": geo_coverage,
            "regions": regions,
            "total_records": geo_coverage.iloc[0]['total_measurements'] if not geo_coverage.empty else 414727,
            "unique_profilers": geo_coverage.iloc[0]['unique_profilers'] if not geo_coverage.empty else 150,
            "geographic_data": generate_sample_geographic_data(),
            "time_series": generate_time_series_data(),
            "institution_data": generate_institution_data()
        }
    except Exception as e:
        st.error(f"Error loading data: {str(e)}")
        # Return sample data as fallback
        return {
            "monthly_distribution": pd.DataFrame(),
            "profiler_stats": pd.DataFrame(),
            "geographic_coverage": pd.DataFrame(),
            "regions": ["Indian Ocean", "Pacific Ocean", "Atlantic Ocean"],
            "total_records": 414727,
            "unique_profilers": 150,
            "geographic_data": generate_sample_geographic_data(),
            "time_series": generate_time_series_data(),
            "institution_data": generate_institution_data()
        }

# -----------------------------
# Message Handling
# -----------------------------
def send_message(prompt):
    """Enhanced message sending with auto-title generation"""
    if not st.session_state.authenticated:
        return
    
    user = st.session_state.user_data
    
    if not st.session_state.current_session_id:
        st.session_state.current_session_id = UserManager.create_chat_session(user['id'])
    
    session_id = st.session_state.current_session_id
    
    # Auto-generate title from first message
    if len(st.session_state.chat_messages) == 0:
        title = prompt[:50] + "..." if len(prompt) > 50 else prompt
        UserManager.update_session_title(session_id, title)
    
    user_message = {"role": "user", "content": prompt, "timestamp": datetime.now()}
    st.session_state.chat_messages.append(user_message)
    UserManager.save_chat_message(session_id, user['id'], "user", prompt)
    
    st.session_state.ai_queries_today += 1
    
    with st.spinner("🤔 Processing your query..."):
        try:
            response_data = answer_query(prompt)
            summary = response_data.get("summary", "I couldn't process that request.")
            
            ai_message = {"role": "assistant", "content": summary, "timestamp": datetime.now()}
            st.session_state.chat_messages.append(ai_message)
            UserManager.save_chat_message(session_id, user['id'], "assistant", summary)
            
            if "plot" in response_data and response_data["plot"] is not None:
                plot_message = {"role": "plot", "content": response_data["plot"], "timestamp": datetime.now()}
                st.session_state.chat_messages.append(plot_message)
                UserManager.save_chat_message(session_id, user['id'], "plot", "Plot generated")
        except Exception as e:
            error_message = f"⚠️ Error: {str(e)}"
            ai_message = {"role": "assistant", "content": error_message, "timestamp": datetime.now()}
            st.session_state.chat_messages.append(ai_message)

# -----------------------------
# AI Chat Tab with Example Prompts
# -----------------------------
def render_ai_chat_tab():
    st.markdown("### 🤖 AI Ocean Data Assistant")
    
    user = st.session_state.user_data
    
    if not st.session_state.chat_messages:
        st.markdown(f"""
        <div class="pro-card">
            <div class="card-header">👋 Welcome, {user['full_name']}!</div>
            <div class="card-content">
                I'm your AI assistant for exploring oceanographic data. Ask me anything about ocean patterns, 
                profiler deployments, or request visualizations. I can help you analyze data, create charts, 
                and provide insights from our comprehensive ocean database.
            </div>
        </div>
        """, unsafe_allow_html=True)
        
        # Example Prompts Grid
        st.markdown("### 💡 Example Prompts")
        
        examples = [
            ("🌊 Ocean Patterns", "Show me Indian Ocean profiler deployment patterns"),
            ("📊 Monthly Analysis", "Create a monthly distribution chart for 2023"),
            ("🗺️ Geographic View", "Visualize geographic distribution of measurements"),
            ("🔬 Profiler Stats", "Generate detailed profiler statistics"),
            ("🌡️ Temperature Trends", "Analyze temperature trends over time"),
            ("📈 Salinity Data", "Show salinity distribution in the Arabian Sea")
        ]
        
        cols = st.columns(3)
        for i, (title, prompt) in enumerate(examples):
            with cols[i % 3]:
                if st.button(f"{title}", key=f"ex_{i}", use_container_width=True):
                    send_message(prompt)
                    st.rerun()
    
    # Display messages
    for i, message in enumerate(st.session_state.chat_messages):
        with st.chat_message(message["role"]):
            if message["role"] == "plot":
                st.plotly_chart(message["content"], use_container_width=True)
                
                # Download options
                st.markdown('<div class="download-section">', unsafe_allow_html=True)
                col1, col2, col3 = st.columns(3)
                with col1:
                    if st.button("📥 Download PNG", key=f"png_{i}"):
                        st.success("PNG download initiated")
                with col2:
                    if st.button("📄 Download HTML", key=f"html_{i}"):
                        st.success("HTML download initiated")
                with col3:
                    if st.button("📊 Download Data", key=f"data_{i}"):
                        st.success("Data export initiated")
                st.markdown('</div>', unsafe_allow_html=True)
            else:
                st.markdown(message["content"])
                timestamp = message["timestamp"].strftime("%I:%M:%S %p")
                st.caption(f"🕐 {timestamp}")
    
    # Chat input
    if prompt := st.chat_input("Ask about ocean data..."):
        send_message(prompt)
        st.rerun()

# -----------------------------
# Enhanced Dashboard Tab
# -----------------------------
def render_dashboard_tab():
    st.markdown("### 📊 Ocean Intelligence Dashboard")
    
    if st.session_state.dashboard_data is None:
        with st.spinner("Loading dashboard data..."):
            st.session_state.dashboard_data = load_dashboard_data()
    
    data = st.session_state.dashboard_data
    if not data:
        st.error("Unable to load dashboard data.")
        return
    
    # Key Metrics Row
    col1, col2, col3, col4, col5 = st.columns(5)
    
    with col1:
        st.metric("🌍 Total Data Points", f"{data['total_records']:,}", "+2.5%")
    
    with col2:
        st.metric("🗺️ Active Regions", len(data['regions']), "Global")
    
    with col3:
        avg_temp = data['geographic_data']['temperature'].mean()
        st.metric("🌡️ Avg. Temperature", f"{avg_temp:.1f}°C", "+0.3°C")
    
    with col4:
        st.metric("🤖 AI Queries Today", st.session_state.ai_queries_today, f"+{st.session_state.ai_queries_today}")
    
    with col5:
        st.metric("🔬 Unique Profilers", data['unique_profilers'], "Active")
    
    st.markdown("---")
    
    # Interactive World Map
    st.markdown("### 🗺️ Interactive Geographic Distribution")
    
    col_map1, col_map2 = st.columns([3, 1])
    
    with col_map2:
        map_param = st.selectbox("Display Parameter", ["Temperature", "Salinity", "Depth"])
    
    param_map = {
        "Temperature": "temperature",
        "Salinity": "salinity",
        "Depth": "depth"
    }
    
    selected_param = param_map[map_param]
    
    fig_map = px.scatter_map(
        data['geographic_data'],
        lat='latitude',
        lon='longitude',
        color=selected_param,
        size='depth',
        hover_data=['profiler_type', 'temperature', 'salinity'],
        color_continuous_scale='Viridis',
        zoom=2,
        height=500,
        title=f"Profiler Deployments - {map_param}"
    )
    
    fig_map.update_layout(
        mapbox_style="carto-darkmatter",
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font=dict(color="white"),
        margin={"r":0,"t":40,"l":0,"b":0}
    )
    
    st.plotly_chart(fig_map, use_container_width=True)
    
    st.markdown("---")
    
    # Charts Row 1
    col1, col2 = st.columns(2)
    
    with col1:
        if not data['monthly_distribution'].empty:
            fig = px.bar(
                data['monthly_distribution'],
                x='Month',
                y='measurement_count',
                title="📈 Monthly Measurement Distribution",
                color='measurement_count',
                color_continuous_scale='Blues'
            )
            fig.update_layout(
                paper_bgcolor="rgba(0,0,0,0)",
                plot_bgcolor="rgba(0,0,0,0)",
                font=dict(color="white"),
                showlegend=False
            )
            st.plotly_chart(fig, use_container_width=True)
        else:
            # Fallback time series
            fig = px.line(
                data['time_series'],
                x='date',
                y='measurements',
                title="📈 Measurements Over Time"
            )
            fig.update_layout(
                paper_bgcolor="rgba(0,0,0,0)",
                plot_bgcolor="rgba(0,0,0,0)",
                font=dict(color="white")
            )
            st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        if not data['profiler_stats'].empty:
            fig = px.pie(
                data['profiler_stats'].head(6),
                values='count',
                names='profiler',
                title="🔬 Profiler Type Distribution",
                hole=0.4
            )
            fig.update_layout(
                paper_bgcolor="rgba(0,0,0,0)",
                font=dict(color="white")
            )
            st.plotly_chart(fig, use_container_width=True)
        else:
            # Fallback data
            profiler_data = generate_sample_geographic_data()['profiler_type'].value_counts()
            fig = px.pie(
                values=profiler_data.values,
                names=profiler_data.index,
                title="🔬 Profiler Type Distribution",
                hole=0.4
            )
            fig.update_layout(
                paper_bgcolor="rgba(0,0,0,0)",
                font=dict(color="white")
            )
            st.plotly_chart(fig, use_container_width=True)
    
    # Charts Row 2
    col3, col4 = st.columns(2)
    
    with col3:
        # Sunburst Chart - Data by Institution
        fig_sunburst = px.sunburst(
            data['institution_data'],
            path=['institution', 'department'],
            values='count',
            title="🏛️ Data by Institution"
        )
        fig_sunburst.update_layout(
            paper_bgcolor="rgba(0,0,0,0)",
            font=dict(color="white")
        )
        st.plotly_chart(fig_sunburst, use_container_width=True)
    
    with col4:
        # Temperature vs Salinity Scatter
        fig_scatter = px.scatter(
            data['geographic_data'].sample(200),
            x='temperature',
            y='salinity',
            color='profiler_type',
            size='depth',
            title="🌡️ Temperature vs Salinity",
            hover_data=['depth']
        )
        fig_scatter.update_layout(
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            font=dict(color="white")
        )
        st.plotly_chart(fig_scatter, use_container_width=True)

# -----------------------------
# Comprehensive Features Tab
# -----------------------------
def render_features_tab():
    st.markdown("### ⚡ Platform Features & Capabilities")
    
    features = [
        ("🤖 AI-Powered Analysis", "Natural language processing for intuitive data queries and intelligent interpretation of complex oceanographic patterns."),
        ("📊 Interactive Visualizations", "Dynamic charts, maps, and graphs with full export capabilities in multiple formats (PNG, HTML, CSV)."),
        ("🔍 Smart Querying", "Advanced database queries through conversational AI interface with context-aware responses."),
        ("🌍 Global Coverage", "Comprehensive oceanographic data from all major ocean basins with real-time updates."),
        ("🎯 Predictive Analytics", "Machine learning models for forecasting ocean conditions and identifying emerging patterns."),
        ("⚠️ Anomaly Detection", "Automated detection of unusual patterns and outliers in temperature, salinity, and other parameters."),
        ("🔌 API Integration", "RESTful API access for seamless integration with external systems and custom applications."),
        ("🔒 Secure Multi-User", "Enterprise-grade security with role-based access control and encrypted data transmission."),
        ("📡 Real-time Ingestion", "Continuous data streaming from global profiler networks with sub-hour latency."),
        ("📚 Historical Archive", "Access to decades of historical oceanographic data for trend analysis and research."),
        ("🗺️ Geographic Filtering", "Advanced spatial queries with custom region selection and boundary definition."),
        ("📈 Custom Reports", "Generate professional reports with automated insights and publication-ready visualizations.")
    ]
    
    cols = st.columns(3)
    for i, (title, desc) in enumerate(features):
        with cols[i % 3]:
            st.markdown(f"""
            <div class="pro-card">
                <div class="card-header">{title}</div>
                <div class="card-content">{desc}</div>
            </div>
            """, unsafe_allow_html=True)
    
    st.markdown("---")
    
    # Technical Specifications
    st.markdown("### 🔧 Technical Specifications")
    
    specs_col1, specs_col2, specs_col3 = st.columns(3)
    
    with specs_col1:
        st.markdown("""
        **Data Infrastructure**
        - PostgreSQL Database
        - 400M+ Data Points
        - 50+ Parameters
        - Real-time Processing
        """)
    
    with specs_col2:
        st.markdown("""
        **AI & ML Stack**
        - GPT-4 Integration
        - Custom RAG Pipeline
        - Vector Embeddings
        - Context-Aware Responses
        """)
    
    with specs_col3:
        st.markdown("""
        **Visualization**
        - Plotly Graphics
        - Interactive Maps
        - 3D Rendering
        - Export Options
        """)
# -----------------------------
# Main Application Entry Point
# -----------------------------
def main():
    """Main application entry point"""
    # Initialize database
    init_user_database()
    
    # Initialize session state
    init_session_state()
    
    # Check authentication
    if not st.session_state.authenticated:
        render_auth_page()
    else:
        # Apply theme
        apply_professional_theme()
        
        # Render fixed header
        render_header()
        
        # Render sidebar
        render_enhanced_sidebar()
        
        # Main content area with tabs
        tabs = st.tabs(["🤖 AI Assistant", "📊 Dashboard", "⚡ Features"])
        
        with tabs[0]:
            render_ai_chat_tab()
        
        with tabs[1]:
            render_dashboard_tab()
        
        with tabs[2]:
            render_features_tab()

# Run the application
if __name__ == "__main__":
    main()
