from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict
import jwt
from datetime import datetime, timedelta
import bcrypt
import sqlite3
from contextlib import contextmanager
from fastapi import Header

from rag_pipeline import answer_query
from query_engine import (
    get_db_engine,
    get_unique_regions,
    get_monthly_distribution,
    get_profiler_stats,
    
    get_geographic_coverage,
    get_data_for_plotting
)

app = FastAPI(title="NeptuneAI API", version="1.0.0")

# CORS configuration for React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3002", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Configuration
SECRET_KEY = "b6896c7e48894048a059cbb64604a6e4"  # Use environment variable in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

# Database context manager
@contextmanager
def get_user_db():
    conn = sqlite3.connect('neptune_users.db')
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

# Pydantic models
class UserRegister(BaseModel):
    username: str
    email: str
    password: str
    full_name: str

class UserLogin(BaseModel):
    username: str
    password: str

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatSession(BaseModel):
    title: str = "New Chat"

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict

# Helper functions
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Auth endpoints
@app.post("/api/auth/register", response_model=Token)
async def register(user: UserRegister):
    try:
        with get_user_db() as conn:
            cursor = conn.cursor()
            password_hash = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt())
            
            cursor.execute('''
                INSERT INTO users (username, email, password_hash, full_name)
                VALUES (?, ?, ?, ?)
            ''', (user.username, user.email, password_hash.decode('utf-8'), user.full_name))
            conn.commit()
            
            user_id = cursor.lastrowid
            user_data = {
                'id': user_id,
                'username': user.username,
                'email': user.email,
                'full_name': user.full_name,
                'role': 'user'
            }
            
            token = create_access_token({"sub": user.username, "user_id": user_id})
            return {"access_token": token, "token_type": "bearer", "user": user_data}
            
    except sqlite3.IntegrityError as e:
        if "username" in str(e):
            raise HTTPException(status_code=400, detail="Username already exists")
        elif "email" in str(e):
            raise HTTPException(status_code=400, detail="Email already exists")
        raise HTTPException(status_code=400, detail="Registration failed")

@app.post("/api/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    with get_user_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, username, email, full_name, role, password_hash
            FROM users WHERE username = ? AND is_active = 1
        ''', (credentials.username,))
        
        user = cursor.fetchone()
        
        if not user or not bcrypt.checkpw(credentials.password.encode('utf-8'), 
                                          user['password_hash'].encode('utf-8')):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        cursor.execute('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', 
                      (user['id'],))
        conn.commit()
        
        user_data = {
            'id': user['id'],
            'username': user['username'],
            'email': user['email'],
            'full_name': user['full_name'],
            'role': user['role']
        }
        
        token = create_access_token({"sub": user['username'], "user_id": user['id']})
        return {"access_token": token, "token_type": "bearer", "user": user_data}

# Protected route dependency
async def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.split(" ")[1]
    payload = verify_token(token)
    return payload

# Chat endpoints
@app.post("/api/chat/message")
async def send_chat_message(message: ChatMessage, user: dict = Depends(get_current_user)):
    try:
        response = answer_query(message.message)
        
        # Save to database if session_id provided
        if message.session_id:
            with get_user_db() as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO chat_messages (session_id, user_id, role, content)
                    VALUES (?, ?, ?, ?)
                ''', (message.session_id, user['user_id'], 'user', message.message))
                
                cursor.execute('''
                    INSERT INTO chat_messages (session_id, user_id, role, content)
                    VALUES (?, ?, ?, ?)
                ''', (message.session_id, user['user_id'], 'assistant', response['summary']))
                
                conn.commit()
        
        return {
            "response": response['summary'],
            "plot": response.get('plot'),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat/session")
async def create_chat_session(session: ChatSession, user: dict = Depends(get_current_user)):
    import uuid
    with get_user_db() as conn:
        cursor = conn.cursor()
        session_id = str(uuid.uuid4())
        cursor.execute('''
            INSERT INTO chat_sessions (user_id, session_id, title, last_activity)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ''', (user['user_id'], session_id, session.title))
        conn.commit()
        
        return {"session_id": session_id, "title": session.title}

@app.get("/api/chat/sessions")
async def get_chat_sessions(user: dict = Depends(get_current_user)):
    with get_user_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT session_id, title, created_at, last_activity
            FROM chat_sessions WHERE user_id = ?
            ORDER BY last_activity DESC LIMIT 20
        ''', (user['user_id'],))
        
        sessions = [dict(row) for row in cursor.fetchall()]
        return {"sessions": sessions}

@app.get("/api/chat/messages/{session_id}")
async def get_chat_messages(session_id: str, user: dict = Depends(get_current_user)):
    with get_user_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT role, content, timestamp
            FROM chat_messages WHERE session_id = ? AND user_id = ?
            ORDER BY timestamp ASC
        ''', (session_id, user['user_id']))
        
        messages = [dict(row) for row in cursor.fetchall()]
        return {"messages": messages}

# Dashboard endpoints
@app.get("/api/dashboard/stats")
async def get_dashboard_stats(user: dict = Depends(get_current_user)):
    try:
        engine = get_db_engine()
        regions = get_unique_regions(engine)
        
        # Get sample data for visualization
        from query_engine import run_query
        from sqlalchemy import text
        
        total_records_df = run_query(engine, 'SELECT COUNT(*) as count FROM oceanbench_data')
        total_records = total_records_df.iloc[0]['count'] if not total_records_df.empty else 0
        
        return {
            "total_records": int(total_records),
            "unique_regions": len(regions),
            "regions": regions,
            "last_updated": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard/geographic-data")
async def get_geographic_data(
    region: Optional[str] = None,
    limit: int = 1000,
    user: dict = Depends(get_current_user)
):
    try:
        engine = get_db_engine()
        df = get_data_for_plotting(engine, region=region, limit=limit)
        
        if df.empty:
            return {"data": []}
        
        return {"data": df.to_dict('records')}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard/profiler-stats")
async def get_profiler_statistics(
    region: Optional[str] = None,
    user: dict = Depends(get_current_user)
):
    try:
        engine = get_db_engine()
        stats = get_profiler_stats(engine, region=region)
        return {"stats": stats.to_dict('records') if not stats.empty else []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard/monthly-distribution")
async def get_monthly_stats(
    region: Optional[str] = None,
    user: dict = Depends(get_current_user)
):
    try:
        engine = get_db_engine()
        monthly = get_monthly_distribution(engine, region=region)
        return {"data": monthly.to_dict('records') if not monthly.empty else []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Health check
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)