import sqlite3
import os
from datetime import datetime

def fix_database():
    """Fix the database schema and create missing tables"""
    db_path = 'neptune_users.db'
    
    print(" Fixing NeptuneAI database...")
    
    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Drop existing tables if they exist (to recreate with correct schema)
        print(" Cleaning existing tables...")
        cursor.execute("DROP TABLE IF EXISTS notifications")
        cursor.execute("DROP TABLE IF EXISTS chat_messages")
        cursor.execute("DROP TABLE IF EXISTS chat_sessions")
        cursor.execute("DROP TABLE IF EXISTS users")
        
        # Create users table with correct schema
        print(" Creating users table...")
        cursor.execute('''
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                full_name TEXT NOT NULL,
                role TEXT DEFAULT 'user',
                is_active INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP
            )
        ''')
        
        # Create chat_sessions table
        print(" Creating chat_sessions table...")
        cursor.execute('''
            CREATE TABLE chat_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                session_id TEXT UNIQUE NOT NULL,
                title TEXT DEFAULT 'New Chat',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Create chat_messages table
        print(" Creating chat_messages table...")
        cursor.execute('''
            CREATE TABLE chat_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                user_id INTEGER NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES chat_sessions (session_id),
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Create notifications table
        print(" Creating notifications table...")
        cursor.execute('''
            CREATE TABLE notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                type TEXT DEFAULT 'info',
                is_read INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Insert sample data
        print(" Inserting sample data...")
        
        # Insert sample user
        cursor.execute('''
            INSERT INTO users (username, email, password_hash, full_name, role, created_at, last_login)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            'demo_user',
            'demo@neptuneai.com',
            '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.8K2O',  # password: demo123
            'Demo User',
            'user',
            datetime.now().isoformat(),
            datetime.now().isoformat()
        ))
        
        # Insert sample notifications
        cursor.execute('''
            INSERT INTO notifications (title, message, type, created_at)
            VALUES 
                ('Welcome to NeptuneAI', 'Welcome to the ocean data platform!', 'info', ?),
                ('System Update', 'New features have been added to the platform', 'success', ?),
                ('Data Sync', 'Ocean data has been updated', 'info', ?)
        ''', (datetime.now().isoformat(), datetime.now().isoformat(), datetime.now().isoformat()))
        
        # Insert sample chat session
        cursor.execute('''
            INSERT INTO chat_sessions (user_id, session_id, title, created_at, last_activity)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            1,
            'demo_session_1',
            'Ocean Data Discussion',
            datetime.now().isoformat(),
            datetime.now().isoformat()
        ))
        
        # Insert sample chat messages
        cursor.execute('''
            INSERT INTO chat_messages (session_id, user_id, role, content, timestamp)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            'demo_session_1',
            1,
            'user',
            'What is the current ocean temperature?',
            datetime.now().isoformat()
        ))
        
        cursor.execute('''
            INSERT INTO chat_messages (session_id, user_id, role, content, timestamp)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            'demo_session_1',
            1,
            'assistant',
            'Based on the latest ocean data, the average global ocean temperature is 15.2°C. Temperature varies significantly by region and depth.',
            datetime.now().isoformat()
        ))
        
        conn.commit()
        print(" Database fixed successfully!")
        
        # Verify tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        print(f" Created tables: {[table[0] for table in tables]}")
        
        # Verify data
        cursor.execute("SELECT COUNT(*) FROM users")
        user_count = cursor.fetchone()[0]
        print(f" Users: {user_count}")
        
        cursor.execute("SELECT COUNT(*) FROM notifications")
        notification_count = cursor.fetchone()[0]
        print(f" Notifications: {notification_count}")
        
        cursor.execute("SELECT COUNT(*) FROM chat_sessions")
        session_count = cursor.fetchone()[0]
        print(f" Chat sessions: {session_count}")
        
        cursor.execute("SELECT COUNT(*) FROM chat_messages")
        message_count = cursor.fetchone()[0]
        print(f" Chat messages: {message_count}")
        
    except Exception as e:
        print(f" Error fixing database: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()
    
    return True

if __name__ == "__main__":
    success = fix_database()
    if success:
        print("\n Database fix completed successfully!")
        print("You can now run the backend: python api.py")
    else:
        print("\n Database fix failed!")