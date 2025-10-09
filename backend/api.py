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
import uvicorn
from groq import Groq
import os
import logging
load_dotenv = True
from dotenv import load_dotenv
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
# Initialize Groq client globally
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
try:
    load_dotenv()
    groq_api_key = os.getenv("GROQ_API_KEY")
    if groq_api_key:
        groq_client = Groq(api_key=groq_api_key)
        print("✅ Groq client initialized")
    else:
        groq_client = None
        print("⚠️ GROQ_API_KEY not found")
except Exception as e:
    print(f"⚠️ Groq initialization failed: {e}")
    groq_client = None
# CORS configuration for React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3002", "http://localhost:5173"],  # React dev servers
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

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatSession(BaseModel):
    title: str = "New Chat"

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict

class NotificationCreate(BaseModel):
    title: str
    message: str
    type: str = "info"  # info, warning, error, success

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

# Token verification endpoint
@app.get("/api/auth/verify")
async def verify_token_endpoint(user: dict = Depends(get_current_user)):
    with get_user_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, username, email, full_name, role, created_at, last_login
            FROM users WHERE id = ? AND is_active = 1
        ''', (user['user_id'],))
        
        user_data = cursor.fetchone()
        if not user_data:
            raise HTTPException(status_code=401, detail="User not found")
        
        return {
            'id': user_data['id'],
            'username': user_data['username'],
            'email': user_data['email'],
            'full_name': user_data['full_name'],
            'role': user_data['role'],
            'created_at': user_data['created_at'],
            'last_login': user_data['last_login']
        }

# Profile update endpoint
@app.put("/api/auth/profile")
async def update_profile(profile_data: UserUpdate, user: dict = Depends(get_current_user)):
    with get_user_db() as conn:
        cursor = conn.cursor()
        
        # Build update query dynamically
        update_fields = []
        values = []
        
        if profile_data.full_name is not None:
            update_fields.append("full_name = ?")
            values.append(profile_data.full_name)
        
        if profile_data.email is not None:
            update_fields.append("email = ?")
            values.append(profile_data.email)
        
        if not update_fields:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        values.append(user['user_id'])
        
        cursor.execute(f'''
            UPDATE users SET {', '.join(update_fields)}, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', values)
        conn.commit()
        
        # Return updated user data
        cursor.execute('''
            SELECT id, username, email, full_name, role, created_at, last_login
            FROM users WHERE id = ? AND is_active = 1
        ''', (user['user_id'],))
        
        updated_user = cursor.fetchone()
        return {
            'id': updated_user['id'],
            'username': updated_user['username'],
            'email': updated_user['email'],
            'full_name': updated_user['full_name'],
            'role': updated_user['role'],
            'created_at': updated_user['created_at'],
            'last_login': updated_user['last_login']
        }
# AI Response Generation with RAG Pipeline
def generate_ai_response(query: str):
    """
    Enhanced AI response generation with better error handling and logging
    """
    logger.info(f"Generating AI response for query: {query[:100]}...")
    
    try:
        # Try enhanced RAG pipeline first
        from rag_pipeline import answer_query as rag_answer_query
        
        logger.info("Using RAG pipeline...")
        rag_response = rag_answer_query(query)
        
        logger.info(f"RAG response type: {type(rag_response)}")
        
        # Handle different response formats from RAG pipeline
        if isinstance(rag_response, dict):
            # Check for enhanced pipeline response
            if rag_response.get('enhanced'):
                summary_text = rag_response.get('text_response') or rag_response.get('summary', 'No response generated')
                logger.info("Using enhanced RAG response")
            else:
                # Standard RAG response
                summary_text = rag_response.get('summary') or rag_response.get('content', 'No response generated')
                logger.info("Using standard RAG response")
            
            # If summary is still generic, try to get more details
            if summary_text in ['No response generated', 'Hello! I am NeptuneAI. 🌊 How can I help you explore global ocean data today?']:
                logger.warning("Generic response detected, trying fallback...")
                return generate_fallback_response_with_groq(query)
                
        else:
            summary_text = str(rag_response)
        
        # Get database context for additional insights
        try:
            engine = get_db_engine()
            
            # Try to extract region from query
            region = None
            regions = get_unique_regions(engine)
            
            for r in regions:
                if r and r.lower() in query.lower():
                    region = r
                    break
            
            # Get database stats for context
            from query_engine import run_query
            
            # Use parameterized query to prevent SQL injection
            if region:
                stats_query = "SELECT COUNT(*) as count FROM oceanbench_data WHERE region = %s"
                stats_df = run_query(engine, stats_query, params=(region,))
            else:
                stats_query = "SELECT COUNT(*) as count FROM oceanbench_data"
                stats_df = run_query(engine, stats_query)
            
            total_records = int(stats_df.iloc[0]['count']) if not stats_df.empty else 0
            logger.info(f"Found {total_records} records for region: {region or 'all'}")
            
        except Exception as db_error:
            logger.warning(f"Database context error: {db_error}")
            total_records = 0
            region = None
        
        # Generate relevant plots based on query
        plots = generate_relevant_plots(query, {"total_records": total_records, "region": region})
        
        return {
            "content": summary_text,
            "plots": plots,
            "context_used": f"RAG Pipeline with {total_records} database records" + (f" (Region: {region})" if region else ""),
            "data_points": total_records
        }
        
    except ImportError as import_error:
        logger.error(f"RAG Pipeline import error: {import_error}")
        return generate_fallback_response_with_groq(query)
        
    except Exception as e:
        logger.error(f"RAG Pipeline error: {e}", exc_info=True)
        return generate_fallback_response_with_groq(query)

def generate_fallback_response_with_groq(query: str):
    """
    Enhanced fallback with personalized greeting and Groq AI
    """
    try:
        if groq_client:
            logger.info("Using Groq fallback...")
            
            system_prompt = """You are NeptuneAI, an expert ocean data analyst assistant. 

IMPORTANT: Always start your response with a friendly acknowledgment of the user's question.

Examples:
- "Thank you for asking about ocean temperature! Let me help you with that..."
- "Great question about salinity! Here's what I can tell you..."
- "I'd be happy to explain ocean pressure at depth..."

Then provide accurate, scientific information in a conversational but professional tone.
Keep responses focused and under 300 words unless detailed explanation is requested.
Use relevant emojis naturally (🌊 🔬 📊 🌡️ 💧) to make responses engaging.

Structure your responses:
1. Friendly acknowledgment
2. Direct answer to the question
3. Supporting details and context
4. Interesting related facts
5. Optional follow-up suggestion"""

            response = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": query}
                ],
                temperature=0.7,
                max_tokens=800
            )
            
            ai_content = response.choices[0].message.content
            logger.info(f"Groq response generated: {len(ai_content)} chars")
            
            return {
                "content": ai_content,
                "plots": [],
                "context_used": "Direct Groq response (RAG pipeline unavailable)",
                "data_points": 0
            }
    except Exception as e:
        logger.error(f"Groq fallback error: {e}")
    
    # Final fallback to rule-based with greeting
    logger.info("Using rule-based fallback...")
    return generate_fallback_response(query)

def generate_fallback_response(query: str):
    """
    Enhanced fallback response with friendly greeting
    """
    query_lower = query.lower()
    
    # Add personalized greeting based on query type
    greeting_prefix = "Thank you for your question! "
    
    if any(word in query_lower for word in ['temperature', 'temp', 'warm', 'cold', 'heat']):
        return {
            "content": f"""{greeting_prefix}Let me help you understand ocean temperatures. 🌡️

**Global Ocean Temperature Insights:**

🌊 **Surface Layer (0-200m):**
- Tropical regions: 25-30°C (warm currents, high solar radiation)
- Temperate zones: 10-20°C (seasonal variations)
- Polar regions: -2 to 5°C (ice-covered areas)

🌡️ **Deep Ocean (200m+):**
- Consistent temperatures: 2-4°C globally
- Temperature decreases rapidly in thermocline layer (200-1000m)
- Below 1000m: remarkably stable temperatures

📊 **Key Factors:**
- Solar radiation (primary heat source)
- Ocean currents distribute heat globally
- Latitude strongly affects temperature
- Climate change causing gradual warming trend

💡 **Interesting Fact:** The ocean absorbs 93% of Earth's excess heat from greenhouse gases!

Would you like me to show you temperature distribution maps or depth profiles for a specific region?""",
            "plots": [{
                "data": [{
                    "x": ['Surface', '100m', '500m', '1000m', '2000m', '4000m'],
                    "y": [25, 20, 15, 10, 5, 2],
                    "type": "scatter",
                    "mode": "lines+markers",
                    "name": "Temperature",
                    "line": {"color": "#ff6b6b", "width": 3},
                    "marker": {"size": 10, "color": "#ff6b6b"}
                }],
                "layout": {
                    "title": "Ocean Temperature vs Depth Profile",
                    "xaxis": {"title": "Depth"},
                    "yaxis": {"title": "Temperature (°C)"},
                    "height": 350,
                    "template": "plotly_white"
                }
            }],
            "context_used": "Knowledge-based response",
            "data_points": 0
        }
    
    elif any(word in query_lower for word in ['salinity', 'salt', 'saltwater', 'psu']):
        return {
            "content": f"""{greeting_prefix}Great question about ocean salinity! 🧂

Ocean Salinity Overview:

💧 Global Average:
- Standard salinity: 35 PSU (Practical Salinity Units)
- This equals about 35 grams of salt per liter of water

🌍 Regional Variations:
- Highest: Subtropical regions (36-37 PSU) - high evaporation
- Lowest: Polar regions (32-33 PSU) - ice melt and freshwater input
- Mediterranean Sea: 38-39 PSU (warmest, highest evaporation)
- Baltic Sea: 7-8 PSU (heavy river input, low evaporation)

📊 What Affects Salinity:
- ☀️ Evaporation (increases salinity)
- 🌧️ Precipitation (decreases salinity)
- ❄️ Ice formation/melting (varies by season)
- 🏞️ River discharge (dilutes coastal waters)
- 🌊 Ocean currents (distribute salt globally)

🐠 Marine Life Impact:
Most marine organisms are adapted to ~35 PSU. Rapid changes can stress ecosystems and affect osmoregulation.

Want to see salinity distribution maps or compare different ocean regions?""",
            "plots": [{
                "data": [{
                    "x": ['Tropical', 'Subtropical', 'Temperate', 'Polar', 'Mediterranean'],
                    "y": [35.5, 36.8, 35.0, 32.5, 38.5],
                    "type": "bar",
                    "name": "Salinity",
                    "marker": {"color": ["#4ecdc4", "#45b7d1", "#5f9ea0", "#87ceeb", "#1e90ff"]}
                }],
                "layout": {
                    "title": "Average Salinity by Ocean Region",
                    "xaxis": {"title": "Region"},
                    "yaxis": {"title": "Salinity (PSU)"},
                    "height": 350,
                    "template": "plotly_white"
                }
            }],
            "context_used": "Knowledge-based response",
            "data_points": 0
        }
    
    elif any(word in query_lower for word in ['depth', 'pressure', 'deep', 'trench', 'bathymetry']):
        return {
            "content": f"""{greeting_prefix}Let me explain ocean depth and pressure! 🌊

Ocean Depth Zones:

📏 Depth Classification:
- Epipelagic (Sunlight Zone): 0-200m - photosynthesis occurs
- Mesopelagic (Twilight Zone): 200-1000m - dim light
- Bathypelagic (Midnight Zone): 1000-4000m - complete darkness
- Abyssopelagic (Abyss): 4000-6000m - extreme pressure
- Hadopelagic (Trenches): 6000m+ - deepest zones

💪 Pressure Facts:
- Increases by 1 atmosphere (14.7 psi) every 10 meters
- At 1000m depth: ~100 atmospheres (1,470 psi)
- At 4000m depth: ~400 atmospheres (5,880 psi)
- **Mariana Trench** (10,994m): ~1,100 atmospheres!

🌡️ Deep Ocean Characteristics:
- Temperature: Constant 2-4°C below 1000m
- No light penetration below 1000m
- Unique life adapted to extreme pressure
- High mineral concentrations

🔬 Scientific Significance:
Deep ocean exploration helps us understand extreme life, geological processes, and climate patterns.

Interested in specific ocean trenches or pressure calculations?""",
            "plots": [{
                "data": [{
                    "x": [0, 500, 1000, 2000, 4000, 6000, 8000, 10000],
                    "y": [1, 51, 101, 201, 401, 601, 801, 1001],
                    "type": "scatter",
                    "mode": "lines+markers",
                    "name": "Pressure",
                    "line": {"color": "#45b7d1", "width": 3},
                    "marker": {"size": 10, "color": "#2874a6"}
                }],
                "layout": {
                    "title": "Ocean Pressure vs Depth",
                    "xaxis": {"title": "Depth (m)"},
                    "yaxis": {"title": "Pressure (atmospheres)"},
                    "height": 350,
                    "template": "plotly_white"
                }
            }],
            "context_used": "Knowledge-based response",
            "data_points": 0
        }
    
    elif any(word in query_lower for word in ['code', 'python', 'programming', 'script']):
        return {
            "content": f"""{greeting_prefix}I'm specialized in ocean data analysis, not general programming. However, I can help you with:

🔬 Ocean Data Analysis:
- Query and visualize ocean temperature data
- Analyze salinity patterns
- Create depth profiles
- Generate geographic maps
- Compare regional ocean characteristics

📊 Data Science Tasks:
- Statistical analysis of ocean data
- Trend identification in oceanographic parameters
- Correlation studies between variables
- Time series analysis

💡 Try asking me:
- "Show me temperature data for the Pacific Ocean"
- "Create a salinity vs depth chart"
- "What's the average pressure at 2000m depth?"
- "Compare temperatures between different ocean regions"

What ocean data would you like to explore?""",
            "plots": [],
            "context_used": "Specialized response",
            "data_points": 0
        }
    
    else:
        return {
            "content": f"""🌊 **Welcome! I'm NeptuneAI, your ocean data expert!**

I'd be happy to help you explore ocean data! Here's what I can assist you with:

📊 Ocean Parameters I Can Analyze:
- 🌡️ Temperature distribution and trends
- 🧂 Salinity levels and variations
- 💪 Pressure and depth profiles
- 🌊 Ocean currents and circulation
- 📈 Climate trends and sea level changes

🗺️ **Geographic Coverage:**
- Global ocean data analysis
- Regional comparisons (Atlantic, Pacific, Indian, Arctic, Southern)
- Specific location insights
- Climate zone analysis

📈 **Visualizations I Can Create:**
- Interactive depth profile charts
- Geographic distribution maps
- Temperature and salinity trends
- Time series analysis
- Comparative regional studies

💡 **Popular Questions:**
- "What's the ocean temperature at different depths?"
- "Show me salinity data for the Indian Ocean"
- "Create a pressure vs depth chart"
- "Compare temperature between ocean regions"
- "What's the average ocean depth?"

**What would you like to know about our oceans?** 🌊

Try asking me a specific question about temperature, salinity, depth, or any ocean region!""",
            "plots": [],
            "context_used": "Welcome message",
            "data_points": 0
        }
# Chat endpoints
@app.post("/api/chat/message")
async def send_chat_message(message: ChatMessage, user: dict = Depends(get_current_user)):
    """
    Send a chat message and get AI response with proper error handling
    """
    try:
        logger.info(f"Processing message from user {user['user_id']}: {message.message[:50]}...")
        
        # Generate AI response based on query
        ai_response = generate_ai_response(message.message)
        
        # Log the response for debugging
        logger.info(f"AI Response type: {type(ai_response)}")
        logger.info(f"AI Response keys: {ai_response.keys() if isinstance(ai_response, dict) else 'Not a dict'}")
        
        # Extract content properly - handle multiple response formats
        response_content = None
        
        if isinstance(ai_response, dict):
            # Try different keys that might contain the response
            response_content = (
                ai_response.get('content') or 
                ai_response.get('summary') or 
                ai_response.get('text_response') or
                ai_response.get('response') or
                'I apologize, but I could not generate a proper response.'
            )
        elif isinstance(ai_response, str):
            response_content = ai_response
        else:
            response_content = str(ai_response)
        
        logger.info(f"Final response content length: {len(response_content)}")
        
        # Save to database if session_id provided
        if message.session_id:
            try:
                with get_user_db() as conn:
                    cursor = conn.cursor()
                    
                    # Save user message
                    cursor.execute('''
                        INSERT INTO chat_messages (session_id, user_id, role, content, timestamp)
                        VALUES (?, ?, ?, ?, ?)
                    ''', (message.session_id, user['user_id'], 'user', message.message, datetime.now().isoformat()))
                    
                    # Save assistant message
                    cursor.execute('''
                        INSERT INTO chat_messages (session_id, user_id, role, content, timestamp)
                        VALUES (?, ?, ?, ?, ?)
                    ''', (message.session_id, user['user_id'], 'assistant', response_content, datetime.now().isoformat()))
                    
                    # Update session last_activity
                    cursor.execute('''
                        UPDATE chat_sessions 
                        SET last_activity = ?
                        WHERE session_id = ? AND user_id = ?
                    ''', (datetime.now().isoformat(), message.session_id, user['user_id']))
                    
                    conn.commit()
                    logger.info("Messages saved to database successfully")
                    
            except Exception as db_error:
                logger.error(f"Database save error: {db_error}")
                # Don't fail the request if database save fails
        
        # Return the response
        return {
            "response": response_content,
            "plots": ai_response.get('plots', []) if isinstance(ai_response, dict) else [],
            "timestamp": datetime.now().isoformat(),
            "session_id": message.session_id
        }
        
    except Exception as e:
        logger.error(f"Error processing chat message: {e}", exc_info=True)
        
        # Return a helpful error response
        error_response = (
            f"I apologize, but I encountered an error: {str(e)}. "
            "Please try rephrasing your question about ocean data, or ask me about:\n\n"
            "🌊 Ocean temperature and salinity\n"
            "📊 Depth profiles and pressure data\n"
            "🗺️ Geographic ocean data\n"
            "📈 Ocean trends and analysis"
        )
        
        return {
            "response": error_response,
            "plots": [],
            "timestamp": datetime.now().isoformat(),
            "error": True
        }

def generate_relevant_plots(query: str, context_data: dict = None):
    """Generate relevant plots based on the user query and database context"""
    query_lower = query.lower()
    plots = []
    
    # Use real data from context if available
    if context_data and context_data.get('data'):
        data = context_data['data']
        
        if any(word in query_lower for word in ['temperature', 'temp', 'warm', 'cold']):
            # Generate temperature plot with real data
            temp_data = data.get('temperature_data', [])
            if temp_data:
                plots.append({
                    "data": [{
                        "x": [item.get('depth', 0) for item in temp_data],
                        "y": [item.get('temperature', 0) for item in temp_data],
                        "type": "scatter",
                        "mode": "lines+markers",
                        "name": "Temperature",
                        "line": {"color": "#ff6b6b", "width": 3},
                        "marker": {"size": 8}
                    }],
                    "layout": {
                        "title": f"Ocean Temperature vs Depth Profile ({len(temp_data)} data points)",
                        "xaxis": {"title": "Depth (m)"},
                        "yaxis": {"title": "Temperature (°C)"},
                        "height": 300
                    }
                })
        
        elif any(word in query_lower for word in ['salinity', 'salt', 'saltwater']):
            # Generate salinity plot with real data
            sal_data = data.get('salinity_data', [])
            if sal_data:
                plots.append({
                    "data": [{
                        "x": [item.get('depth', 0) for item in sal_data],
                        "y": [item.get('salinity', 0) for item in sal_data],
                        "type": "scatter",
                        "mode": "lines+markers",
                        "name": "Salinity",
                        "line": {"color": "#4fc3f7", "width": 3},
                        "marker": {"size": 8}
                    }],
                    "layout": {
                        "title": f"Ocean Salinity vs Depth Profile ({len(sal_data)} data points)",
                        "xaxis": {"title": "Depth (m)"},
                        "yaxis": {"title": "Salinity (PSU)"},
                        "height": 300
                    }
                })
        
        elif any(word in query_lower for word in ['map', 'location', 'geographic', 'region']):
            # Generate geographic map with real data
            geo_data = data.get('geographic_data', [])
            if geo_data:
                plots.append({
                    "data": [{
                        "type": "scattermapbox",
                        "lat": [item.get('latitude', 0) for item in geo_data],
                        "lon": [item.get('longitude', 0) for item in geo_data],
                        "mode": "markers",
                        "marker": {
                            "size": 8,
                            "color": [item.get('temperature', 0) for item in geo_data],
                            "colorscale": "Viridis",
                            "showscale": True,
                            "colorbar": {"title": "Temperature (°C)"}
                        },
                        "text": [f"Temp: {item.get('temperature', 0):.1f}°C<br>Sal: {item.get('salinity', 0):.1f} PSU" for item in geo_data]
                    }],
                    "layout": {
                        "mapbox": {
                            "style": "open-street-map",
                            "center": {"lat": 0, "lon": 0},
                            "zoom": 1
                        },
                        "height": 400,
                        "margin": {"t": 0, "b": 0, "l": 0, "r": 0}
                    }
                })
    
    # Fallback to sample data if no real data available
    if not plots:
        if any(word in query_lower for word in ['temperature', 'temp', 'warm', 'cold']):
            plots.append({
                "data": [{
                    "x": ['Surface', '100m', '500m', '1000m', '2000m', '4000m'],
                    "y": [25, 20, 15, 10, 5, 2],
                    "type": "scatter",
                    "mode": "lines+markers",
                    "name": "Temperature",
                    "line": {"color": "#ff6b6b", "width": 3},
                    "marker": {"size": 8}
                }],
                "layout": {
                    "title": "Ocean Temperature vs Depth Profile (Sample Data)",
                    "xaxis": {"title": "Depth"},
                    "yaxis": {"title": "Temperature (°C)"},
                    "height": 300
                }
            })
    
    return plots

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

@app.post("/api/chat/sessions")
async def create_chat_session_simple(user: dict = Depends(get_current_user)):
    try:
        import uuid
        session_id = str(uuid.uuid4())
        
        with get_user_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO chat_sessions (user_id, session_id, title, created_at, last_activity)
                VALUES (?, ?, ?, ?, ?)
            ''', (user['user_id'], session_id, 'New Chat', datetime.now().isoformat(), datetime.now().isoformat()))
            
            conn.commit()
            
            return {
                "session_id": session_id,
                "title": "New Chat",
                "created_at": datetime.now().isoformat(),
                "last_activity": datetime.now().isoformat()
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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

# Notification endpoints
@app.get("/api/notifications")
async def get_notifications(user: dict = Depends(get_current_user)):
    with get_user_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, title, message, type, created_at, is_read
            FROM notifications WHERE user_id = ? OR user_id IS NULL
            ORDER BY created_at DESC LIMIT 20
        ''', (user['user_id'],))
        
        notifications = [dict(row) for row in cursor.fetchall()]
        return {"notifications": notifications}

@app.post("/api/notifications")
async def create_notification(notification: NotificationCreate, user: dict = Depends(get_current_user)):
    with get_user_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO notifications (user_id, title, message, type, created_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        ''', (user['user_id'], notification.title, notification.message, notification.type))
        conn.commit()
        
        return {"message": "Notification created successfully"}

@app.put("/api/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: int, user: dict = Depends(get_current_user)):
    with get_user_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?
        ''', (notification_id, user['user_id']))
        conn.commit()
        
        return {"message": "Notification marked as read"}

# Data export endpoints
@app.get("/api/export/csv")
async def export_csv(
    region: Optional[str] = None,
    limit: int = 10000,
    user: dict = Depends(get_current_user)
):
    try:
        import pandas as pd
        import io
        from fastapi.responses import StreamingResponse
        
        engine = get_db_engine()
        df = get_data_for_plotting(engine, region=region, limit=limit)
        
        if df.empty:
            raise HTTPException(status_code=404, detail="No data found")
        
        # Create CSV in memory
        output = io.StringIO()
        df.to_csv(output, index=False)
        output.seek(0)
        
        # Create streaming response
        def iter_csv():
            yield output.getvalue()
        
        return StreamingResponse(
            iter_csv(),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=ocean_data_{region or 'all'}.csv"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/export/json")
async def export_json(
    region: Optional[str] = None,
    limit: int = 10000,
    user: dict = Depends(get_current_user)
):
    try:
        engine = get_db_engine()
        df = get_data_for_plotting(engine, region=region, limit=limit)
        
        if df.empty:
            raise HTTPException(status_code=404, detail="No data found")
        
        return {"data": df.to_dict('records')}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Ocean parameters endpoint
@app.get("/api/ocean/parameters")
async def get_ocean_parameters(user: dict = Depends(get_current_user)):
    try:
        engine = get_db_engine()
        
        # Get available parameters from the database
        from query_engine import run_query
        from sqlalchemy import text
        
        # Get column information
        columns_query = """
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'oceanbench_data'
            ORDER BY ordinal_position
        """
        
        try:
            columns_df = run_query(engine, columns_query)
            parameters = columns_df.to_dict('records')
        except Exception as e:
            print(f"❌ Query failed: {e}")
            print(f"Query: {columns_query}")
            print(f"Params: None")
            # Fallback for SQLite
            parameters = [
                {"column_name": "temperature", "data_type": "numeric"},
                {"column_name": "salinity", "data_type": "numeric"},
                {"column_name": "pressure", "data_type": "numeric"},
                {"column_name": "latitude", "data_type": "numeric"},
                {"column_name": "longitude", "data_type": "numeric"},
                {"column_name": "depth", "data_type": "numeric"},
                {"column_name": "region", "data_type": "text"},
                {"column_name": "year", "data_type": "integer"},
                {"column_name": "month", "data_type": "integer"}
            ]
        
        return {"parameters": parameters}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Additional missing endpoints
@app.get("/api/analytics")
async def get_analytics(user: dict = Depends(get_current_user)):
    """Get analytics data"""
    try:
        # Generate sample analytics data
        return {
            "stats": {
                "totalRecords": 125000,
                "avgTemperature": 15.2,
                "avgSalinity": 35.1,
                "maxDepth": 5000,
                "dataPoints": 200
            },
            "temperatureData": [],
            "salinityData": [],
            "depthData": [],
            "geographicData": [],
            "monthlyData": [],
            "correlationData": []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/data/explorer")
async def get_data_explorer(user: dict = Depends(get_current_user)):
    """Get data explorer data"""
    try:
        # Generate sample data for explorer
        import random
        data = []
        for i in range(1000):
            data.append({
                "id": i + 1,
                "timestamp": datetime.now().isoformat(),
                "latitude": -90 + random.random() * 180,
                "longitude": -180 + random.random() * 360,
                "temperature": 10 + random.random() * 20,
                "salinity": 30 + random.random() * 10,
                "pressure": random.random() * 1000,
                "depth": random.random() * 5000,
                "region": random.choice(['Atlantic', 'Pacific', 'Indian', 'Arctic', 'Southern']),
                "year": 2020 + random.randint(0, 4),
                "station_id": f"ST{str(i + 1).zfill(4)}",
                "quality": random.choice(['Good', 'Poor'])
            })
        return {"data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/user/stats")
async def get_user_stats(user: dict = Depends(get_current_user)):
    """Get user statistics"""
    try:
        return {
            "totalDownloads": 47,
            "totalChats": 23,
            "totalUploads": 8,
            "dataPoints": 125000,
            "lastActivity": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/user/activity")
async def get_user_activity(user: dict = Depends(get_current_user)):
    """Get user activity"""
    try:
        activities = [
            {
                "id": 1,
                "type": "download",
                "description": "Downloaded ocean temperature data",
                "timestamp": datetime.now().isoformat(),
                "icon": "Download",
                "color": "primary"
            },
            {
                "id": 2,
                "type": "chat",
                "description": "Asked about salinity patterns",
                "timestamp": datetime.now().isoformat(),
                "icon": "Chat",
                "color": "success"
            }
        ]
        return {"activities": activities}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Health check
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)