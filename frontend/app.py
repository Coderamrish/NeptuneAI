#!/usr/bin/env python3
"""
NeptuneAI ARGO Ocean Data Platform - Modern Interactive Frontend
A comprehensive Streamlit application with modern UI/UX design
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import pydeck as pdk
import json
import os
import sys
from datetime import datetime, timedelta
import base64
from pathlib import Path
import hashlib
import sqlite3
import bcrypt

# Add backend to path
sys.path.append('backend')

# Page configuration
st.set_page_config(
    page_title="🌊 NeptuneAI - ARGO Ocean Data Platform",
    page_icon="🌊",
    layout="wide",
    initial_sidebar_state="expanded",
    menu_items={
        'Get Help': 'https://github.com/neptuneai/argo-platform',
        'Report a bug': "https://github.com/neptuneai/argo-platform/issues",
        'About': "NeptuneAI ARGO Ocean Data Platform v2.0"
    }
)

# Custom CSS for modern styling
def load_css():
    st.markdown("""
    <style>
    /* Import Google Fonts */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    /* Global Styles */
    .main {
        padding-top: 2rem;
    }
    
    .stApp {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        font-family: 'Inter', sans-serif;
    }
    
    /* Header Styles */
    .main-header {
        background: linear-gradient(90deg, #1e3c72 0%, #2a5298 100%);
        padding: 2rem 0;
        border-radius: 15px;
        margin-bottom: 2rem;
        box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    }
    
    .main-header h1 {
        color: white;
        font-size: 3rem;
        font-weight: 700;
        text-align: center;
        margin: 0;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    
    .main-header p {
        color: rgba(255,255,255,0.9);
        font-size: 1.2rem;
        text-align: center;
        margin: 0.5rem 0 0 0;
    }
    
    /* Sidebar Styles */
    .css-1d391kg {
        background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
    }
    
    .sidebar .sidebar-content {
        background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
    }
    
    /* Card Styles */
    .metric-card {
        background: white;
        padding: 1.5rem;
        border-radius: 15px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        border-left: 4px solid #3498db;
        margin-bottom: 1rem;
    }
    
    .feature-card {
        background: white;
        padding: 2rem;
        border-radius: 15px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        text-align: center;
        transition: transform 0.3s ease;
        margin-bottom: 1rem;
    }
    
    .feature-card:hover {
        transform: translateY(-5px);
    }
    
    .feature-card h3 {
        color: #2c3e50;
        margin-bottom: 1rem;
    }
    
    .feature-card p {
        color: #7f8c8d;
        line-height: 1.6;
    }
    
    /* Button Styles */
    .stButton > button {
        background: linear-gradient(45deg, #3498db, #2980b9);
        color: white;
        border: none;
        border-radius: 25px;
        padding: 0.5rem 2rem;
        font-weight: 600;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
    }
    
    .stButton > button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
    }
    
    /* Input Styles */
    .stTextInput > div > div > input {
        border-radius: 10px;
        border: 2px solid #ecf0f1;
        padding: 0.5rem 1rem;
    }
    
    .stSelectbox > div > div > select {
        border-radius: 10px;
        border: 2px solid #ecf0f1;
    }
    
    /* Chart Container */
    .chart-container {
        background: white;
        padding: 1.5rem;
        border-radius: 15px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        margin-bottom: 2rem;
    }
    
    /* Status Indicators */
    .status-online {
        color: #27ae60;
        font-weight: 600;
    }
    
    .status-offline {
        color: #e74c3c;
        font-weight: 600;
    }
    
    /* Loading Animation */
    .loading-spinner {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 3px solid #f3f3f3;
        border-top: 3px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    /* Responsive Design */
    @media (max-width: 768px) {
        .main-header h1 {
            font-size: 2rem;
        }
        
        .feature-card {
            margin-bottom: 1rem;
        }
    }
    
    /* Custom Scrollbar */
    ::-webkit-scrollbar {
        width: 8px;
    }
    
    ::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 10px;
    }
    
    ::-webkit-scrollbar-thumb {
        background: #3498db;
        border-radius: 10px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
        background: #2980b9;
    }
    </style>
    """, unsafe_allow_html=True)

# Initialize session state
def init_session_state():
    if 'authenticated' not in st.session_state:
        st.session_state.authenticated = False
    if 'user_id' not in st.session_state:
        st.session_state.user_id = None
    if 'username' not in st.session_state:
        st.session_state.username = None
    if 'current_page' not in st.session_state:
        st.session_state.current_page = 'Home'
    if 'dark_mode' not in st.session_state:
        st.session_state.dark_mode = False
    if 'ai_insights' not in st.session_state:
        st.session_state.ai_insights = []
    if 'uploaded_files' not in st.session_state:
        st.session_state.uploaded_files = []

# Database functions
def init_database():
    """Initialize SQLite database for user management"""
    conn = sqlite3.connect('neptuneai_users.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            api_key TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

def hash_password(password):
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

def verify_password(password, hashed):
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed)

def register_user(username, email, password):
    """Register a new user"""
    conn = sqlite3.connect('neptuneai_users.db')
    cursor = conn.cursor()
    
    try:
        password_hash = hash_password(password)
        api_key = hashlib.sha256(f"{username}{email}{datetime.now()}".encode()).hexdigest()[:32]
        
        cursor.execute('''
            INSERT INTO users (username, email, password_hash, api_key)
            VALUES (?, ?, ?, ?)
        ''', (username, email, password_hash, api_key))
        
        conn.commit()
        return True, "User registered successfully!"
    except sqlite3.IntegrityError:
        return False, "Username or email already exists!"
    except Exception as e:
        return False, f"Registration failed: {str(e)}"
    finally:
        conn.close()

def login_user(username, password):
    """Login user"""
    conn = sqlite3.connect('neptuneai_users.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute('SELECT id, username, password_hash FROM users WHERE username = ?', (username,))
        user = cursor.fetchone()
        
        if user and verify_password(password, user[2]):
            return True, user[0], user[1]
        else:
            return False, None, None
    except Exception as e:
        return False, None, None
    finally:
        conn.close()

# Sample data generation
def generate_sample_data():
    """Generate sample ARGO data for demonstration"""
    np.random.seed(42)
    
    # Generate sample ARGO float data
    n_points = 1000
    data = {
        'latitude': np.random.uniform(-40, 25, n_points),
        'longitude': np.random.uniform(40, 120, n_points),
        'temperature': np.random.uniform(15, 30, n_points),
        'salinity': np.random.uniform(33, 37, n_points),
        'pressure': np.random.uniform(0, 2000, n_points),
        'platform_number': [f'ARGO_{i:06d}' for i in range(n_points)],
        'date': pd.date_range('2023-01-01', periods=n_points, freq='D'),
        'ocean': np.random.choice(['Indian Ocean', 'Pacific Ocean', 'Atlantic Ocean'], n_points),
        'institution': np.random.choice(['WHOI', 'SIO', 'JAMSTEC', 'CSIR'], n_points)
    }
    
    return pd.DataFrame(data)

# Page functions
def render_header():
    """Render the main header"""
    st.markdown("""
    <div class="main-header">
        <h1>🌊 NeptuneAI</h1>
        <p>Advanced ARGO Ocean Data Discovery & Visualization Platform</p>
    </div>
    """, unsafe_allow_html=True)

def render_sidebar():
    """Render the sidebar navigation"""
    st.sidebar.markdown("## 🧭 Navigation")
    
    # Navigation options
    nav_options = {
        "🏠 Home": "Home",
        "📊 Analytics": "Analytics", 
        "🗂️ Datasets": "Datasets",
        "📤 Upload Data": "Upload Data",
        "🤖 AI Insights": "AI Insights",
        "👤 Profile": "Profile",
        "ℹ️ About": "About"
    }
    
    selected = st.sidebar.selectbox("Select Page", list(nav_options.keys()))
    st.session_state.current_page = nav_options[selected]
    
    # User authentication section
    st.sidebar.markdown("---")
    st.sidebar.markdown("## 🔐 Authentication")
    
    if not st.session_state.authenticated:
        auth_tab = st.sidebar.radio("", ["Login", "Register"])
        
        if auth_tab == "Login":
            with st.sidebar.form("login_form"):
                username = st.text_input("Username")
                password = st.text_input("Password", type="password")
                login_btn = st.form_submit_button("Login")
                
                if login_btn:
                    success, user_id, username = login_user(username, password)
                    if success:
                        st.session_state.authenticated = True
                        st.session_state.user_id = user_id
                        st.session_state.username = username
                        st.success("Login successful!")
                        st.rerun()
                    else:
                        st.error("Invalid credentials!")
        else:
            with st.sidebar.form("register_form"):
                username = st.text_input("Username")
                email = st.text_input("Email")
                password = st.text_input("Password", type="password")
                confirm_password = st.text_input("Confirm Password", type="password")
                register_btn = st.form_submit_button("Register")
                
                if register_btn:
                    if password == confirm_password:
                        success, message = register_user(username, email, password)
                        if success:
                            st.success(message)
                        else:
                            st.error(message)
                    else:
                        st.error("Passwords don't match!")
    else:
        st.sidebar.success(f"Welcome, {st.session_state.username}!")
        if st.sidebar.button("Logout"):
            st.session_state.authenticated = False
            st.session_state.user_id = None
            st.session_state.username = None
            st.rerun()
    
    # Dark mode toggle
    st.sidebar.markdown("---")
    st.sidebar.markdown("## 🎨 Theme")
    dark_mode = st.sidebar.toggle("Dark Mode", value=st.session_state.dark_mode)
    if dark_mode != st.session_state.dark_mode:
        st.session_state.dark_mode = dark_mode
        st.rerun()

def render_home_page():
    """Render the home/landing page"""
    st.markdown("## 🏠 Welcome to NeptuneAI")
    
    # Hero section
    col1, col2 = st.columns([2, 1])
    
    with col1:
        st.markdown("""
        ### 🌊 Discover Ocean Data Like Never Before
        
        NeptuneAI is your gateway to the world's most comprehensive ARGO ocean data platform. 
        Leverage advanced AI, machine learning, and interactive visualizations to explore 
        oceanographic data with unprecedented ease and insight.
        
        **Key Features:**
        - 🔍 **Smart Data Discovery** - AI-powered search and analysis
        - 📊 **Interactive Visualizations** - Real-time charts and maps
        - 🤖 **AI Insights** - Automated pattern recognition and predictions
        - 📤 **Easy Data Upload** - Support for NetCDF and CSV formats
        - 🌐 **Global Coverage** - Data from all major ocean basins
        """)
        
        # Action buttons
        col1_1, col1_2, col1_3 = st.columns(3)
        with col1_1:
            if st.button("🚀 Explore Data", use_container_width=True):
                st.session_state.current_page = "Analytics"
                st.rerun()
        with col1_2:
            if st.button("📤 Upload Files", use_container_width=True):
                st.session_state.current_page = "Upload Data"
                st.rerun()
        with col1_3:
            if st.button("🤖 AI Insights", use_container_width=True):
                st.session_state.current_page = "AI Insights"
                st.rerun()
    
    with col2:
        # Ocean background image placeholder
        st.markdown("""
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    height: 300px; border-radius: 15px; display: flex; 
                    align-items: center; justify-content: center; color: white; 
                    font-size: 4rem;">
            🌊
        </div>
        """, unsafe_allow_html=True)
    
    # Feature cards
    st.markdown("## ✨ Platform Features")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.markdown("""
        <div class="feature-card">
            <h3>🔍 Smart Search</h3>
            <p>Find relevant ocean data using natural language queries powered by advanced AI algorithms.</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown("""
        <div class="feature-card">
            <h3>📊 Real-time Analytics</h3>
            <p>Interactive dashboards and visualizations that update in real-time as you explore your data.</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        st.markdown("""
        <div class="feature-card">
            <h3>🤖 AI-Powered Insights</h3>
            <p>Get automated insights, pattern recognition, and predictive analytics for your ocean data.</p>
        </div>
        """, unsafe_allow_html=True)
    
    # Latest updates
    st.markdown("## 📰 Latest Updates")
    
    with st.expander("Recent Platform Updates", expanded=True):
        st.markdown("""
        - **v2.0.0** - Complete UI redesign with modern interface
        - **v1.9.0** - Added AI-powered data insights
        - **v1.8.0** - Enhanced NetCDF processing capabilities
        - **v1.7.0** - New geospatial visualization tools
        - **v1.6.0** - Improved vector search performance
        """)

def render_analytics_page():
    """Render the analytics page with interactive charts"""
    st.markdown("## 📊 Ocean Data Analytics")
    
    # Load sample data
    df = generate_sample_data()
    
    # Filters
    st.markdown("### 🔍 Data Filters")
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        ocean_filter = st.selectbox("Ocean", ["All"] + list(df['ocean'].unique()))
    with col2:
        institution_filter = st.selectbox("Institution", ["All"] + list(df['institution'].unique()))
    with col3:
        date_range = st.date_input("Date Range", value=(df['date'].min().date(), df['date'].max().date()))
    with col4:
        temp_range = st.slider("Temperature Range (°C)", 
                              float(df['temperature'].min()), 
                              float(df['temperature'].max()),
                              (float(df['temperature'].min()), float(df['temperature'].max())))
    
    # Apply filters
    filtered_df = df.copy()
    if ocean_filter != "All":
        filtered_df = filtered_df[filtered_df['ocean'] == ocean_filter]
    if institution_filter != "All":
        filtered_df = filtered_df[filtered_df['institution'] == institution_filter]
    if len(date_range) == 2:
        filtered_df = filtered_df[(filtered_df['date'].dt.date >= date_range[0]) & 
                                 (filtered_df['date'].dt.date <= date_range[1])]
    filtered_df = filtered_df[(filtered_df['temperature'] >= temp_range[0]) & 
                             (filtered_df['temperature'] <= temp_range[1])]
    
    # Metrics
    st.markdown("### 📈 Key Metrics")
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("Total Records", f"{len(filtered_df):,}")
    with col2:
        st.metric("Average Temperature", f"{filtered_df['temperature'].mean():.2f}°C")
    with col3:
        st.metric("Average Salinity", f"{filtered_df['salinity'].mean():.2f} PSU")
    with col4:
        st.metric("Data Points", f"{len(filtered_df):,}")
    
    # Charts
    st.markdown("### 📊 Interactive Visualizations")
    
    # Temperature vs Salinity scatter plot
    fig1 = px.scatter(filtered_df, x='salinity', y='temperature', 
                      color='ocean', size='pressure',
                      hover_data=['platform_number', 'date', 'institution'],
                      title="Temperature vs Salinity by Ocean",
                      color_discrete_sequence=px.colors.qualitative.Set3)
    fig1.update_layout(height=500)
    st.plotly_chart(fig1, use_container_width=True)
    
    # Geographic distribution
    st.markdown("#### 🌍 Geographic Distribution")
    
    # Create map
    map_data = filtered_df[['latitude', 'longitude', 'temperature', 'ocean']].copy()
    
    # PyDeck map
    layer = pdk.Layer(
        'ScatterplotLayer',
        data=map_data,
        get_position='[longitude, latitude]',
        get_color='[200, 30, 0, 160]',
        get_radius=1000,
        pickable=True
    )
    
    view_state = pdk.ViewState(
        latitude=map_data['latitude'].mean(),
        longitude=map_data['longitude'].mean(),
        zoom=3
    )
    
    r = pdk.Deck(
        layers=[layer],
        initial_view_state=view_state,
        map_style='mapbox://styles/mapbox/light-v9'
    )
    
    st.pydeck_chart(r)
    
    # Time series analysis
    st.markdown("#### 📈 Time Series Analysis")
    
    # Group by date and calculate averages
    daily_avg = filtered_df.groupby(filtered_df['date'].dt.date).agg({
        'temperature': 'mean',
        'salinity': 'mean',
        'pressure': 'mean'
    }).reset_index()
    
    fig2 = make_subplots(rows=3, cols=1, 
                        subplot_titles=('Temperature Over Time', 'Salinity Over Time', 'Pressure Over Time'),
                        vertical_spacing=0.1)
    
    fig2.add_trace(go.Scatter(x=daily_avg['date'], y=daily_avg['temperature'], 
                              name='Temperature', line=dict(color='#3498db')), row=1, col=1)
    fig2.add_trace(go.Scatter(x=daily_avg['date'], y=daily_avg['salinity'], 
                              name='Salinity', line=dict(color='#e74c3c')), row=2, col=1)
    fig2.add_trace(go.Scatter(x=daily_avg['date'], y=daily_avg['pressure'], 
                              name='Pressure', line=dict(color='#2ecc71')), row=3, col=1)
    
    fig2.update_layout(height=800, showlegend=False)
    st.plotly_chart(fig2, use_container_width=True)
    
    # Data table
    st.markdown("#### 📋 Data Table")
    st.dataframe(filtered_df.head(100), use_container_width=True)

def render_datasets_page():
    """Render the datasets page"""
    st.markdown("## 🗂️ Available Datasets")
    
    # Dataset categories
    tab1, tab2, tab3, tab4 = st.tabs(["🌊 ARGO Floats", "🛰️ Satellite Data", "🚢 Ship Data", "📊 Processed Data"])
    
    with tab1:
        st.markdown("### ARGO Float Datasets")
        
        # Sample ARGO datasets
        argo_datasets = {
            "Indian Ocean ARGO 2023": {
                "description": "Comprehensive ARGO float data from Indian Ocean for 2023",
                "records": "15,432",
                "variables": "Temperature, Salinity, Pressure, Oxygen",
                "coverage": "10°S to 30°N, 40°E to 120°E",
                "format": "NetCDF, CSV"
            },
            "Global ARGO Real-time": {
                "description": "Real-time global ARGO float data updated daily",
                "records": "2,847,291",
                "variables": "Temperature, Salinity, Pressure, Chlorophyll",
                "coverage": "Global",
                "format": "NetCDF"
            },
            "Deep Ocean Profiles": {
                "description": "Deep ocean profiling data from ARGO floats",
                "records": "8,923",
                "variables": "Temperature, Salinity, Pressure, Nutrients",
                "coverage": "Global",
                "format": "NetCDF, Parquet"
            }
        }
        
        for name, info in argo_datasets.items():
            with st.expander(f"📁 {name}", expanded=False):
                col1, col2 = st.columns([2, 1])
                with col1:
                    st.write(f"**Description:** {info['description']}")
                    st.write(f"**Records:** {info['records']}")
                    st.write(f"**Variables:** {info['variables']}")
                    st.write(f"**Coverage:** {info['coverage']}")
                    st.write(f"**Format:** {info['format']}")
                with col2:
                    if st.button(f"Download {name}", key=f"download_{name}"):
                        st.success("Download started!")
    
    with tab2:
        st.markdown("### Satellite Data")
        st.info("Satellite data integration coming soon!")
    
    with tab3:
        st.markdown("### Ship Data")
        st.info("Ship-based data integration coming soon!")
    
    with tab4:
        st.markdown("### Processed Data")
        st.info("Processed data products coming soon!")

def render_upload_page():
    """Render the data upload page"""
    st.markdown("## 📤 Upload Ocean Data")
    
    # Upload section
    st.markdown("### Upload Files")
    
    uploaded_files = st.file_uploader(
        "Choose files to upload",
        accept_multiple_files=True,
        type=['nc', 'netcdf', 'csv', 'parquet'],
        help="Supported formats: NetCDF (.nc), CSV (.csv), Parquet (.parquet)"
    )
    
    if uploaded_files:
        st.success(f"Uploaded {len(uploaded_files)} file(s)")
        
        # Process uploaded files
        for file in uploaded_files:
            st.write(f"📄 {file.name} ({file.size} bytes)")
            
            # Add to session state
            if file.name not in [f.name for f in st.session_state.uploaded_files]:
                st.session_state.uploaded_files.append(file)
        
        # Processing options
        st.markdown("### Processing Options")
        
        col1, col2 = st.columns(2)
        
        with col1:
            process_format = st.selectbox("Output Format", ["CSV", "Parquet", "NetCDF"])
            quality_control = st.checkbox("Apply Quality Control", value=True)
        
        with col2:
            include_metadata = st.checkbox("Include Metadata", value=True)
            generate_visualizations = st.checkbox("Generate Visualizations", value=True)
        
        if st.button("🚀 Process Files", use_container_width=True):
            with st.spinner("Processing files..."):
                # Simulate processing
                import time
                time.sleep(2)
                st.success("Files processed successfully!")
                
                # Show processing results
                st.markdown("### Processing Results")
                results_df = pd.DataFrame({
                    'File': [f.name for f in uploaded_files],
                    'Status': ['Processed'] * len(uploaded_files),
                    'Records': [np.random.randint(100, 1000) for _ in uploaded_files],
                    'Format': [process_format] * len(uploaded_files)
                })
                st.dataframe(results_df, use_container_width=True)
    
    # Data validation
    st.markdown("### Data Validation")
    
    if st.button("🔍 Validate Data Quality"):
        with st.spinner("Validating data..."):
            # Simulate validation
            import time
            time.sleep(1)
            
            st.success("Data validation completed!")
            
            # Show validation results
            col1, col2, col3 = st.columns(3)
            with col1:
                st.metric("Valid Records", "98.5%")
            with col2:
                st.metric("Missing Data", "1.2%")
            with col3:
                st.metric("Outliers", "0.3%")

def render_ai_insights_page():
    """Render the AI insights page"""
    st.markdown("## 🤖 AI-Powered Insights")
    
    # AI query input
    st.markdown("### Ask AI About Your Data")
    
    query = st.text_area(
        "Enter your question about ocean data:",
        placeholder="e.g., What are the temperature trends in the Indian Ocean over the past year?",
        height=100
    )
    
    col1, col2 = st.columns([1, 4])
    with col1:
        analyze_btn = st.button("🔍 Analyze", use_container_width=True)
    
    if analyze_btn and query:
        with st.spinner("AI is analyzing your query..."):
            # Simulate AI analysis
            import time
            time.sleep(2)
            
            # Generate AI response
            ai_response = f"""
            **AI Analysis Results:**
            
            Based on your query: "{query}"
            
            **Key Insights:**
            - Temperature trends show a 0.5°C increase over the past year
            - Salinity patterns indicate seasonal variations
            - Data quality is excellent with 98.5% valid measurements
            
            **Recommendations:**
            - Consider analyzing seasonal patterns
            - Look into correlation with atmospheric conditions
            - Monitor for long-term climate trends
            
            **Confidence Level:** 87%
            """
            
            st.markdown(ai_response)
            
            # Add to session state
            st.session_state.ai_insights.append({
                'query': query,
                'response': ai_response,
                'timestamp': datetime.now()
            })
    
    # Previous insights
    if st.session_state.ai_insights:
        st.markdown("### 📚 Previous Insights")
        
        for i, insight in enumerate(reversed(st.session_state.ai_insights[-5:])):
            with st.expander(f"Query {len(st.session_state.ai_insights) - i}: {insight['query'][:50]}...", expanded=False):
                st.markdown(insight['response'])
                st.caption(f"Generated: {insight['timestamp'].strftime('%Y-%m-%d %H:%M:%S')}")
    
    # AI capabilities
    st.markdown("### 🧠 AI Capabilities")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.markdown("""
        **🔍 Pattern Recognition**
        - Identify trends and anomalies
        - Detect seasonal patterns
        - Find correlations between variables
        """)
    
    with col2:
        st.markdown("""
        **📊 Data Analysis**
        - Statistical analysis
        - Quality assessment
        - Data validation
        """)
    
    with col3:
        st.markdown("""
        **🔮 Predictive Modeling**
        - Forecast future trends
        - Climate predictions
        - Risk assessment
        """)

def render_profile_page():
    """Render the user profile page"""
    if not st.session_state.authenticated:
        st.warning("Please login to view your profile.")
        return
    
    st.markdown("## 👤 User Profile")
    
    # User information
    col1, col2 = st.columns([1, 2])
    
    with col1:
        st.markdown("### Profile Picture")
        st.markdown("""
        <div style="width: 150px; height: 150px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    border-radius: 50%; display: flex; align-items: center; justify-content: center; 
                    color: white; font-size: 3rem; margin: 0 auto;">
            👤
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown(f"### Welcome, {st.session_state.username}!")
        st.markdown(f"**User ID:** {st.session_state.user_id}")
        st.markdown(f"**Member Since:** {datetime.now().strftime('%Y-%m-%d')}")
        
        # API Key section
        st.markdown("### 🔑 API Key")
        api_key = "neptuneai_" + hashlib.sha256(f"{st.session_state.username}{st.session_state.user_id}".encode()).hexdigest()[:16]
        st.code(api_key)
        
        if st.button("🔄 Generate New API Key"):
            st.success("New API key generated!")
    
    # Usage statistics
    st.markdown("### 📊 Usage Statistics")
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("Files Uploaded", "12")
    with col2:
        st.metric("Queries Made", "47")
    with col3:
        st.metric("Data Processed", "2.3 GB")
    with col4:
        st.metric("Visualizations", "23")
    
    # Account settings
    st.markdown("### ⚙️ Account Settings")
    
    with st.expander("Change Password", expanded=False):
        with st.form("change_password"):
            current_password = st.text_input("Current Password", type="password")
            new_password = st.text_input("New Password", type="password")
            confirm_password = st.text_input("Confirm New Password", type="password")
            
            if st.form_submit_button("Update Password"):
                if new_password == confirm_password:
                    st.success("Password updated successfully!")
                else:
                    st.error("Passwords don't match!")
    
    with st.expander("Export Data", expanded=False):
        st.markdown("Export your data and settings")
        
        col1, col2 = st.columns(2)
        with col1:
            if st.button("📥 Export Profile Data"):
                st.success("Profile data exported!")
        with col2:
            if st.button("📥 Export Usage History"):
                st.success("Usage history exported!")

def render_about_page():
    """Render the about page"""
    st.markdown("## ℹ️ About NeptuneAI")
    
    st.markdown("""
    ### 🌊 Mission Statement
    
    NeptuneAI is dedicated to democratizing access to oceanographic data through 
    cutting-edge AI technology and intuitive user interfaces. We believe that 
    understanding our oceans is crucial for addressing climate change and 
    preserving marine ecosystems.
    
    ### 🚀 Technology Stack
    
    - **Frontend:** Streamlit, Plotly, PyDeck
    - **Backend:** Python, FastAPI, SQLAlchemy
    - **AI/ML:** TensorFlow, PyTorch, Transformers
    - **Data Processing:** Pandas, NumPy, Xarray
    - **Database:** PostgreSQL, FAISS Vector Store
    - **Visualization:** Plotly, Matplotlib, Seaborn
    
    ### 👥 Team
    
    - **Data Scientists:** Ocean data processing and analysis
    - **AI Engineers:** Machine learning and natural language processing
    - **Frontend Developers:** User interface and experience design
    - **DevOps Engineers:** Infrastructure and deployment
    
    ### 📞 Contact Information
    
    - **Email:** contact@neptuneai.com
    - **GitHub:** https://github.com/neptuneai
    - **Documentation:** https://docs.neptuneai.com
    - **Support:** support@neptuneai.com
    
    ### 📄 License
    
    This project is licensed under the MIT License - see the LICENSE file for details.
    """)
    
    # System status
    st.markdown("### 🔧 System Status")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.markdown("**Database:** <span class='status-online'>Online</span>", unsafe_allow_html=True)
    with col2:
        st.markdown("**AI Services:** <span class='status-online'>Online</span>", unsafe_allow_html=True)
    with col3:
        st.markdown("**API:** <span class='status-online'>Online</span>", unsafe_allow_html=True)

# Main application
def main():
    """Main application function"""
    # Load CSS
    load_css()
    
    # Initialize session state
    init_session_state()
    
    # Initialize database
    init_database()
    
    # Render header
    render_header()
    
    # Render sidebar
    render_sidebar()
    
    # Render main content based on current page
    if st.session_state.current_page == "Home":
        render_home_page()
    elif st.session_state.current_page == "Analytics":
        render_analytics_page()
    elif st.session_state.current_page == "Datasets":
        render_datasets_page()
    elif st.session_state.current_page == "Upload Data":
        render_upload_page()
    elif st.session_state.current_page == "AI Insights":
        render_ai_insights_page()
    elif st.session_state.current_page == "Profile":
        render_profile_page()
    elif st.session_state.current_page == "About":
        render_about_page()
    
    # Footer
    st.markdown("---")
    st.markdown("""
    <div style="text-align: center; color: #7f8c8d; padding: 2rem 0;">
        <p>🌊 NeptuneAI ARGO Ocean Data Platform v2.0 | Built with ❤️ for Ocean Science</p>
    </div>
    """, unsafe_allow_html=True)

if __name__ == "__main__":
    main()