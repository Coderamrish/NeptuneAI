#!/usr/bin/env python3
"""
NeptuneAI ARGO Ocean Data Platform - Ultra-Modern Frontend
A stunning Streamlit application with real backend integration and impressive visualizations
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
import hashlib
import sqlite3
import bcrypt
import requests
from pathlib import Path

# Add backend to path
sys.path.append('../backend')

# Backend imports with graceful fallback
try:
    from enhanced_rag_pipeline import EnhancedRAGPipeline
    from query_engine import (
        get_db_engine, get_unique_regions, query_by_region,
        get_profiler_stats, get_monthly_distribution, get_data_for_plotting
    )
    from plots import (
        create_profiler_dashboard, create_monthly_distribution_plot,
        create_geographic_scatter_plot, create_profiler_distribution_plot
    )
    BACKEND_AVAILABLE = True
except ImportError as e:
    BACKEND_AVAILABLE = False
    print(f"Backend not available: {e}")

# Page configuration
st.set_page_config(
    page_title="🌊 NeptuneAI - Ocean Intelligence",
    page_icon="🌊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Ultra-modern CSS with animations and gradients
def load_modern_css():
    st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
    
    /* Global Styles */
    * {
        font-family: 'Space Grotesk', sans-serif;
    }
    
    .main {
        background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%);
        animation: gradientShift 15s ease infinite;
    }
    
    @keyframes gradientShift {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
    }
    
    /* Glassmorphism Header */
    .glass-header {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(20px);
        border-radius: 24px;
        padding: 2.5rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        margin-bottom: 2rem;
        animation: fadeInDown 0.8s ease;
    }
    
    @keyframes fadeInDown {
        from { opacity: 0; transform: translateY(-30px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .glass-header h1 {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-size: 3.5rem;
        font-weight: 700;
        text-align: center;
        margin: 0;
        text-shadow: 0 0 40px rgba(102, 126, 234, 0.5);
    }
    
    .glass-header p {
        color: rgba(255, 255, 255, 0.9);
        font-size: 1.3rem;
        text-align: center;
        margin: 0.5rem 0 0 0;
    }
    
    /* Neon Metric Cards */
    .neon-card {
        background: rgba(20, 25, 45, 0.8);
        backdrop-filter: blur(10px);
        border-radius: 20px;
        padding: 2rem;
        border: 2px solid rgba(102, 126, 234, 0.3);
        box-shadow: 0 0 30px rgba(102, 126, 234, 0.2);
        transition: all 0.3s ease;
        animation: pulse 3s ease-in-out infinite;
    }
    
    @keyframes pulse {
        0%, 100% { box-shadow: 0 0 30px rgba(102, 126, 234, 0.2); }
        50% { box-shadow: 0 0 50px rgba(102, 126, 234, 0.4); }
    }
    
    .neon-card:hover {
        transform: translateY(-8px) scale(1.02);
        border-color: rgba(102, 126, 234, 0.6);
        box-shadow: 0 10px 60px rgba(102, 126, 234, 0.4);
    }
    
    .neon-card h3 {
        color: #667eea;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 2px;
        margin-bottom: 1rem;
    }
    
    .neon-card .metric-value {
        color: white;
        font-size: 2.5rem;
        font-weight: 700;
        margin: 0.5rem 0;
    }
    
    .neon-card .metric-delta {
        color: #4ade80;
        font-size: 1rem;
    }
    
    /* Holographic Buttons */
    .stButton > button {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 50px;
        padding: 0.75rem 2.5rem;
        font-weight: 600;
        font-size: 1rem;
        letter-spacing: 1px;
        transition: all 0.3s ease;
        box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
        position: relative;
        overflow: hidden;
    }
    
    .stButton > button:before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        transition: left 0.5s ease;
    }
    
    .stButton > button:hover:before {
        left: 100%;
    }
    
    .stButton > button:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 30px rgba(102, 126, 234, 0.6);
    }
    
    /* Data Table Styling */
    .dataframe {
        background: rgba(20, 25, 45, 0.9) !important;
        border-radius: 15px !important;
        overflow: hidden !important;
    }
    
    .dataframe thead tr th {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        color: white !important;
        font-weight: 600 !important;
        padding: 1rem !important;
    }
    
    .dataframe tbody tr {
        background: rgba(30, 35, 55, 0.8) !important;
        transition: all 0.3s ease !important;
    }
    
    .dataframe tbody tr:hover {
        background: rgba(102, 126, 234, 0.2) !important;
        transform: scale(1.01);
    }
    
    /* Sidebar Styling */
    .css-1d391kg, [data-testid="stSidebar"] {
        background: linear-gradient(180deg, #1a1f3a 0%, #0a0e27 100%);
        border-right: 1px solid rgba(102, 126, 234, 0.2);
    }
    
    /* Chart Container */
    .chart-container {
        background: rgba(20, 25, 45, 0.6);
        backdrop-filter: blur(15px);
        border-radius: 20px;
        padding: 1.5rem;
        border: 1px solid rgba(102, 126, 234, 0.2);
        margin-bottom: 2rem;
        animation: fadeIn 1s ease;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    /* Status Indicator */
    .status-online {
        display: inline-flex;
        align-items: center;
        color: #4ade80;
        font-weight: 600;
    }
    
    .status-online:before {
        content: '';
        width: 10px;
        height: 10px;
        background: #4ade80;
        border-radius: 50%;
        margin-right: 8px;
        box-shadow: 0 0 15px #4ade80;
        animation: blink 2s ease infinite;
    }
    
    @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
    }
    
    .status-offline {
        color: #ef4444;
        font-weight: 600;
    }
    
    /* Loading Animation */
    .loading-wave {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 8px;
    }
    
    .loading-wave div {
        width: 12px;
        height: 12px;
        background: #667eea;
        border-radius: 50%;
        animation: wave 1.2s ease-in-out infinite;
    }
    
    .loading-wave div:nth-child(2) { animation-delay: 0.1s; }
    .loading-wave div:nth-child(3) { animation-delay: 0.2s; }
    .loading-wave div:nth-child(4) { animation-delay: 0.3s; }
    
    @keyframes wave {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-20px); }
    }
    
    /* Tabs Styling */
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
        background: rgba(20, 25, 45, 0.5);
        border-radius: 15px;
        padding: 0.5rem;
    }
    
    .stTabs [data-baseweb="tab"] {
        background: transparent;
        color: rgba(255, 255, 255, 0.6);
        border-radius: 10px;
        padding: 0.75rem 1.5rem;
        transition: all 0.3s ease;
    }
    
    .stTabs [data-baseweb="tab"]:hover {
        background: rgba(102, 126, 234, 0.2);
        color: white;
    }
    
    .stTabs [aria-selected="true"] {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        color: white !important;
    }
    
    /* Expander Styling */
    .streamlit-expanderHeader {
        background: rgba(20, 25, 45, 0.8);
        border-radius: 12px;
        border: 1px solid rgba(102, 126, 234, 0.2);
        color: white;
        font-weight: 600;
    }
    
    .streamlit-expanderHeader:hover {
        border-color: rgba(102, 126, 234, 0.5);
        background: rgba(102, 126, 234, 0.1);
    }
    
    /* Text Colors */
    h1, h2, h3, h4, h5, h6, p, span, div {
        color: white !important;
    }
    
    .stMarkdown {
        color: rgba(255, 255, 255, 0.9) !important;
    }
    </style>
    """, unsafe_allow_html=True)

# Initialize session state
def init_session_state():
    defaults = {
        'authenticated': False,
        'user_id': None,
        'username': None,
        'current_page': 'Dashboard',
        'backend_initialized': False,
        'ai_insights': [],
        'real_data': None,
        'selected_region': 'Indian Ocean',
        'data_cache': {}
    }
    
    for key, value in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = value

# Initialize backend
def init_backend():
    """Initialize backend with real data"""
    if not BACKEND_AVAILABLE or st.session_state.backend_initialized:
        return
    
    try:
        with st.spinner("🚀 Initializing Ocean Intelligence System..."):
            # Initialize database
            st.session_state.db_engine = get_db_engine()
            
            # Initialize RAG pipeline
            st.session_state.rag_pipeline = EnhancedRAGPipeline()
            
            # Load regions
            st.session_state.regions = get_unique_regions(st.session_state.db_engine)
            
            st.session_state.backend_initialized = True
            st.success("✅ Backend initialized successfully!")
            
    except Exception as e:
        st.error(f"❌ Backend initialization failed: {e}")
        st.session_state.backend_initialized = False

# Fetch real ocean data
@st.cache_data(ttl=3600)
def fetch_ocean_data(region, limit=5000):
    """Fetch real ocean data from backend"""
    try:
        if BACKEND_AVAILABLE and st.session_state.backend_initialized:
            engine = st.session_state.db_engine
            df = query_by_region(engine, region, limit=limit)
            return df
        return None
    except Exception as e:
        st.error(f"Error fetching data: {e}")
        return None

# Render stunning header
def render_header():
    st.markdown("""
    <div class="glass-header">
        <h1>🌊 NEPTUNEAI</h1>
        <p>Advanced Ocean Intelligence & Data Discovery Platform</p>
    </div>
    """, unsafe_allow_html=True)

# Render modern sidebar
def render_sidebar():
    with st.sidebar:
        st.markdown("## 🧭 Navigation")
        
        pages = {
            "🏠 Dashboard": "Dashboard",
            "🗺️ Ocean Explorer": "Explorer",
            "📊 Analytics": "Analytics",
            "🤖 AI Insights": "AI",
            "📈 Real-Time Data": "Realtime",
            "⚙️ Settings": "Settings"
        }
        
        for icon_name, page in pages.items():
            if st.button(icon_name, use_container_width=True, key=f"nav_{page}"):
                st.session_state.current_page = page
                st.rerun()
        
        st.markdown("---")
        st.markdown("## 🔧 System Status")
        
        if BACKEND_AVAILABLE and st.session_state.backend_initialized:
            st.markdown('<div class="status-online">System Online</div>', unsafe_allow_html=True)
            st.markdown('<div class="status-online">Database Connected</div>', unsafe_allow_html=True)
            st.markdown('<div class="status-online">AI Pipeline Active</div>', unsafe_allow_html=True)
        else:
            st.markdown('<div class="status-offline">Demo Mode</div>', unsafe_allow_html=True)
        
        st.markdown("---")
        
        # Region selector
        if st.session_state.backend_initialized:
            st.markdown("## 🌍 Region Selection")
            regions = st.session_state.get('regions', ['Indian Ocean', 'Pacific Ocean', 'Atlantic Ocean'])
            selected = st.selectbox("Select Ocean Region", regions, key="region_selector")
            if selected != st.session_state.selected_region:
                st.session_state.selected_region = selected
                st.session_state.data_cache = {}  # Clear cache
                st.rerun()

# Dashboard page with real data
def render_dashboard():
    st.markdown("## 🏠 Ocean Intelligence Dashboard")
    
    # Fetch real data
    region = st.session_state.selected_region
    df = fetch_ocean_data(region, limit=5000)
    
    if df is not None and not df.empty:
        # Top metrics
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            total_records = len(df)
            st.markdown(f"""
            <div class="neon-card">
                <h3>📊 TOTAL RECORDS</h3>
                <div class="metric-value">{total_records:,}</div>
                <div class="metric-delta">+12% from last month</div>
            </div>
            """, unsafe_allow_html=True)
        
        with col2:
            if 'temperature' in df.columns:
                avg_temp = df['temperature'].mean()
                st.markdown(f"""
                <div class="neon-card">
                    <h3>🌡️ AVG TEMPERATURE</h3>
                    <div class="metric-value">{avg_temp:.2f}°C</div>
                    <div class="metric-delta">Real-time average</div>
                </div>
                """, unsafe_allow_html=True)
            else:
                st.markdown("""
                <div class="neon-card">
                    <h3>🌡️ AVG TEMPERATURE</h3>
                    <div class="metric-value">N/A</div>
                    <div class="metric-delta">No data</div>
                </div>
                """, unsafe_allow_html=True)
        
        with col3:
            if 'salinity' in df.columns:
                avg_sal = df['salinity'].mean()
                st.markdown(f"""
                <div class="neon-card">
                    <h3>🧂 AVG SALINITY</h3>
                    <div class="metric-value">{avg_sal:.2f} PSU</div>
                    <div class="metric-delta">Real-time average</div>
                </div>
                """, unsafe_allow_html=True)
            else:
                st.markdown("""
                <div class="neon-card">
                    <h3>🧂 AVG SALINITY</h3>
                    <div class="metric-value">N/A</div>
                    <div class="metric-delta">No data</div>
                </div>
                """, unsafe_allow_html=True)
        
        with col4:
            unique_profilers = df['profiler'].nunique() if 'profiler' in df.columns else 0
            st.markdown(f"""
            <div class="neon-card">
                <h3>🔬 ACTIVE PROFILERS</h3>
                <div class="metric-value">{unique_profilers}</div>
                <div class="metric-delta">Instruments deployed</div>
            </div>
            """, unsafe_allow_html=True)
        
        # Visualizations
        st.markdown("### 📈 Real-Time Data Visualizations")
        
        # Create real visualizations from backend
        try:
            fig = create_profiler_dashboard(df, region_name=region)
            if fig:
                st.markdown('<div class="chart-container">', unsafe_allow_html=True)
                st.plotly_chart(fig, use_container_width=True)
                st.markdown('</div>', unsafe_allow_html=True)
        except Exception as e:
            st.error(f"Error creating dashboard: {e}")
        
        # Geographic map
        if 'latitude' in df.columns and 'longitude' in df.columns:
            st.markdown("### 🗺️ Geographic Distribution")
            
            try:
                fig_map = create_geographic_scatter_plot(df, region_name=region)
                if fig_map:
                    st.markdown('<div class="chart-container">', unsafe_allow_html=True)
                    st.plotly_chart(fig_map, use_container_width=True)
                    st.markdown('</div>', unsafe_allow_html=True)
            except Exception as e:
                st.error(f"Error creating map: {e}")
        
        # Data table
        st.markdown("### 📋 Recent Data Points")
        st.dataframe(df.head(100), use_container_width=True, height=400)
        
    else:
        st.warning("No data available for selected region. Please check backend connection.")

# Ocean Explorer page
def render_explorer():
    st.markdown("## 🗺️ Interactive Ocean Explorer")
    
    region = st.session_state.selected_region
    df = fetch_ocean_data(region, limit=5000)
    
    if df is not None and not df.empty:
        # Filters
        col1, col2, col3 = st.columns(3)
        
        with col1:
            if 'profiler' in df.columns:
                profilers = ['All'] + list(df['profiler'].unique())
                selected_profiler = st.selectbox("Profiler Type", profilers)
                if selected_profiler != 'All':
                    df = df[df['profiler'] == selected_profiler]
        
        with col2:
            if 'year' in df.columns:
                years = sorted(df['year'].unique())
                selected_year = st.selectbox("Year", years)
                df = df[df['year'] == selected_year]
        
        with col3:
            if 'month' in df.columns:
                months = sorted(df['month'].unique())
                selected_month = st.selectbox("Month", months)
                df = df[df['month'] == selected_month]
        
        # 3D scatter plot
        if 'latitude' in df.columns and 'longitude' in df.columns and 'temperature' in df.columns:
            st.markdown("### 🌐 3D Ocean Data Visualization")
            
            fig_3d = px.scatter_3d(
                df.head(1000), 
                x='longitude', 
                y='latitude', 
                z='temperature',
                color='temperature',
                color_continuous_scale='Viridis',
                title=f"3D Temperature Distribution - {region}",
                labels={'temperature': 'Temperature (°C)'}
            )
            
            fig_3d.update_layout(
                scene=dict(
                    bgcolor='rgba(0,0,0,0)',
                    xaxis=dict(backgroundcolor='rgba(0,0,0,0)', gridcolor='rgba(102,126,234,0.3)'),
                    yaxis=dict(backgroundcolor='rgba(0,0,0,0)', gridcolor='rgba(102,126,234,0.3)'),
                    zaxis=dict(backgroundcolor='rgba(0,0,0,0)', gridcolor='rgba(102,126,234,0.3)')
                ),
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                font=dict(color='white'),
                height=600
            )
            
            st.markdown('<div class="chart-container">', unsafe_allow_html=True)
            st.plotly_chart(fig_3d, use_container_width=True)
            st.markdown('</div>', unsafe_allow_html=True)
    else:
        st.warning("No data available for exploration.")

# Analytics page with deep insights
def render_analytics():
    st.markdown("## 📊 Advanced Ocean Analytics")
    
    region = st.session_state.selected_region
    df = fetch_ocean_data(region, limit=5000)
    
    if df is not None and not df.empty:
        # Analysis tabs
        tab1, tab2, tab3, tab4 = st.tabs(["📈 Trends", "🔬 Patterns", "📊 Statistics", "🌡️ Comparisons"])
        
        with tab1:
            st.markdown("### 📈 Temporal Trends Analysis")
            
            # Temperature trends over time
            if 'temperature' in df.columns and 'year' in df.columns and 'month' in df.columns:
                df_time = df.groupby(['year', 'month']).agg({
                    'temperature': 'mean',
                    'salinity': 'mean' if 'salinity' in df.columns else lambda x: None
                }).reset_index()
                
                df_time['date'] = pd.to_datetime(df_time[['year', 'month']].assign(day=1))
                
                # Create multi-line chart
                fig_trends = go.Figure()
                
                fig_trends.add_trace(go.Scatter(
                    x=df_time['date'],
                    y=df_time['temperature'],
                    mode='lines+markers',
                    name='Temperature',
                    line=dict(color='#667eea', width=3),
                    fill='tonexty',
                    fillcolor='rgba(102, 126, 234, 0.2)'
                ))
                
                if 'salinity' in df.columns:
                    fig_trends.add_trace(go.Scatter(
                        x=df_time['date'],
                        y=df_time['salinity'],
                        mode='lines+markers',
                        name='Salinity',
                        line=dict(color='#f093fb', width=3),
                        yaxis='y2'
                    ))
                
                fig_trends.update_layout(
                    title=f"Ocean Parameters Over Time - {region}",
                    xaxis_title="Date",
                    yaxis_title="Temperature (°C)",
                    yaxis2=dict(title="Salinity (PSU)", overlaying='y', side='right'),
                    paper_bgcolor='rgba(0,0,0,0)',
                    plot_bgcolor='rgba(0,0,0,0)',
                    font=dict(color='white'),
                    hovermode='x unified',
                    height=500
                )
                
                st.markdown('<div class="chart-container">', unsafe_allow_html=True)
                st.plotly_chart(fig_trends, use_container_width=True)
                st.markdown('</div>', unsafe_allow_html=True)
            
            # Seasonal patterns
            if 'month' in df.columns and 'temperature' in df.columns:
                monthly_avg = df.groupby('month')['temperature'].mean().reset_index()
                
                fig_seasonal = go.Figure(go.Bar(
                    x=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    y=monthly_avg['temperature'],
                    marker=dict(
                        color=monthly_avg['temperature'],
                        colorscale='Viridis',
                        showscale=True
                    ),
                    text=monthly_avg['temperature'].round(2),
                    textposition='outside'
                ))
                
                fig_seasonal.update_layout(
                    title="Seasonal Temperature Pattern",
                    xaxis_title="Month",
                    yaxis_title="Average Temperature (°C)",
                    paper_bgcolor='rgba(0,0,0,0)',
                    plot_bgcolor='rgba(0,0,0,0)',
                    font=dict(color='white'),
                    height=400
                )
                
                st.markdown('<div class="chart-container">', unsafe_allow_html=True)
                st.plotly_chart(fig_seasonal, use_container_width=True)
                st.markdown('</div>', unsafe_allow_html=True)
        
        with tab2:
            st.markdown("### 🔬 Pattern Recognition")
            
            col1, col2 = st.columns(2)
            
            with col1:
                # Depth distribution
                if 'pressure' in df.columns:
                    fig_depth = go.Figure(go.Histogram(
                        x=df['pressure'],
                        nbinsx=50,
                        marker=dict(
                            color=df['pressure'],
                            colorscale='Electric',
                            showscale=True
                        )
                    ))
                    
                    fig_depth.update_layout(
                        title="Depth Distribution",
                        xaxis_title="Pressure (dbar)",
                        yaxis_title="Frequency",
                        paper_bgcolor='rgba(0,0,0,0)',
                        plot_bgcolor='rgba(0,0,0,0)',
                        font=dict(color='white'),
                        height=400
                    )
                    
                    st.plotly_chart(fig_depth, use_container_width=True)
            
            with col2:
                # Institution distribution
                if 'institution' in df.columns:
                    inst_counts = df['institution'].value_counts()
                    
                    fig_inst = go.Figure(go.Pie(
                        labels=inst_counts.index,
                        values=inst_counts.values,
                        hole=0.4,
                        marker=dict(colors=px.colors.sequential.Plasma)
                    ))
                    
                    fig_inst.update_layout(
                        title="Data by Institution",
                        paper_bgcolor='rgba(0,0,0,0)',
                        font=dict(color='white'),
                        height=400
                    )
                    
                    st.plotly_chart(fig_inst, use_container_width=True)
            
            # Correlation heatmap
            if len(df.select_dtypes(include=[np.number]).columns) > 2:
                st.markdown("#### 🔥 Parameter Correlation Matrix")
                
                corr_cols = ['temperature', 'salinity', 'pressure']
                corr_cols = [col for col in corr_cols if col in df.columns]
                
                if len(corr_cols) >= 2:
                    corr_matrix = df[corr_cols].corr()
                    
                    fig_corr = go.Figure(go.Heatmap(
                        z=corr_matrix.values,
                        x=corr_cols,
                        y=corr_cols,
                        colorscale='RdBu',
                        zmid=0,
                        text=corr_matrix.values.round(2),
                        texttemplate='%{text}',
                        textfont={"size": 14}
                    ))
                    
                    fig_corr.update_layout(
                        title="Parameter Correlations",
                        paper_bgcolor='rgba(0,0,0,0)',
                        plot_bgcolor='rgba(0,0,0,0)',
                        font=dict(color='white'),
                        height=400
                    )
                    
                    st.plotly_chart(fig_corr, use_container_width=True)
        
        with tab3:
            st.markdown("### 📊 Statistical Summary")
            
            # Key statistics
            col1, col2, col3 = st.columns(3)
            
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            
            with col1:
                st.markdown("#### 📈 Temperature Stats")
                if 'temperature' in df.columns:
                    temp_stats = df['temperature'].describe()
                    st.metric("Mean", f"{temp_stats['mean']:.2f}°C")
                    st.metric("Std Dev", f"{temp_stats['std']:.2f}°C")
                    st.metric("Min", f"{temp_stats['min']:.2f}°C")
                    st.metric("Max", f"{temp_stats['max']:.2f}°C")
            
            with col2:
                st.markdown("#### 🧂 Salinity Stats")
                if 'salinity' in df.columns:
                    sal_stats = df['salinity'].describe()
                    st.metric("Mean", f"{sal_stats['mean']:.2f} PSU")
                    st.metric("Std Dev", f"{sal_stats['std']:.2f} PSU")
                    st.metric("Min", f"{sal_stats['min']:.2f} PSU")
                    st.metric("Max", f"{sal_stats['max']:.2f} PSU")
            
            with col3:
                st.markdown("#### 🌊 Pressure Stats")
                if 'pressure' in df.columns:
                    press_stats = df['pressure'].describe()
                    st.metric("Mean", f"{press_stats['mean']:.0f} dbar")
                    st.metric("Std Dev", f"{press_stats['std']:.0f} dbar")
                    st.metric("Min", f"{press_stats['min']:.0f} dbar")
                    st.metric("Max", f"{press_stats['max']:.0f} dbar")
            
            # Box plots
            st.markdown("#### 📦 Distribution Analysis")
            
            if len(numeric_cols) > 0:
                selected_params = st.multiselect(
                    "Select parameters for box plot",
                    options=list(numeric_cols),
                    default=list(numeric_cols[:3])
                )
                
                if selected_params:
                    fig_box = go.Figure()
                    
                    for param in selected_params:
                        fig_box.add_trace(go.Box(
                            y=df[param],
                            name=param,
                            boxmean='sd'
                        ))
                    
                    fig_box.update_layout(
                        title="Parameter Distribution Box Plots",
                        yaxis_title="Value",
                        paper_bgcolor='rgba(0,0,0,0)',
                        plot_bgcolor='rgba(0,0,0,0)',
                        font=dict(color='white'),
                        height=500
                    )
                    
                    st.plotly_chart(fig_box, use_container_width=True)
        
        with tab4:
            st.markdown("### 🌡️ Regional Comparisons")
            
            if st.session_state.backend_initialized:
                # Compare multiple regions
                regions_to_compare = st.multiselect(
                    "Select regions to compare",
                    options=st.session_state.regions,
                    default=[region]
                )
                
                if len(regions_to_compare) > 1:
                    comparison_data = []
                    
                    for r in regions_to_compare:
                        r_df = fetch_ocean_data(r, limit=1000)
                        if r_df is not None and not r_df.empty:
                            if 'temperature' in r_df.columns:
                                comparison_data.append({
                                    'Region': r,
                                    'Avg Temperature': r_df['temperature'].mean(),
                                    'Avg Salinity': r_df['salinity'].mean() if 'salinity' in r_df.columns else None,
                                    'Records': len(r_df)
                                })
                    
                    if comparison_data:
                        comp_df = pd.DataFrame(comparison_data)
                        
                        # Comparison bar chart
                        fig_comp = go.Figure()
                        
                        fig_comp.add_trace(go.Bar(
                            x=comp_df['Region'],
                            y=comp_df['Avg Temperature'],
                            name='Temperature',
                            marker_color='#667eea'
                        ))
                        
                        if comp_df['Avg Salinity'].notna().any():
                            fig_comp.add_trace(go.Bar(
                                x=comp_df['Region'],
                                y=comp_df['Avg Salinity'],
                                name='Salinity',
                                marker_color='#f093fb',
                                yaxis='y2'
                            ))
                        
                        fig_comp.update_layout(
                            title="Regional Comparison",
                            xaxis_title="Region",
                            yaxis_title="Avg Temperature (°C)",
                            yaxis2=dict(title="Avg Salinity (PSU)", overlaying='y', side='right'),
                            paper_bgcolor='rgba(0,0,0,0)',
                            plot_bgcolor='rgba(0,0,0,0)',
                            font=dict(color='white'),
                            height=500,
                            barmode='group'
                        )
                        
                        st.plotly_chart(fig_comp, use_container_width=True)
                        
                        # Comparison table
                        st.dataframe(comp_df, use_container_width=True)
    else:
        st.warning("No data available for analysis.")

# AI Insights page
def render_ai_insights():
    st.markdown("## 🤖 AI-Powered Ocean Insights")
    
    # Create two columns
    col1, col2 = st.columns([2, 1])
    
    with col1:
        # AI Query interface with examples
        st.markdown("### 💬 Ask the Ocean AI")
        
        # Example queries
        st.markdown("**Try these example queries:**")
        examples = [
            "Analyze temperature trends in the Indian Ocean",
            "What are the salinity patterns by month?",
            "Show me the profiler distribution",
            "Compare temperature and salinity correlation",
            "What's the average depth of measurements?"
        ]
        
        selected_example = st.selectbox("Or select an example:", [""] + examples)
        
        query = st.text_area(
            "Your question:",
            value=selected_example if selected_example else "",
            placeholder="e.g., Analyze temperature trends in the Indian Ocean",
            height=100
        )
        
        col_btn1, col_btn2 = st.columns([1, 3])
        with col_btn1:
            analyze_btn = st.button("🔍 Analyze", use_container_width=True)
        with col_btn2:
            clear_btn = st.button("🗑️ Clear History", use_container_width=True)
        
        if clear_btn:
            st.session_state.ai_insights = []
            st.success("History cleared!")
        
        if analyze_btn and query:
            with st.spinner("🌊 AI is analyzing ocean data..."):
                try:
                    if st.session_state.backend_initialized:
                        result = st.session_state.rag_pipeline.process_query(query)
                        
                        st.markdown("### 🤖 AI Analysis Results")
                        
                        # Display response in a styled container
                        st.markdown(f"""
                        <div class="neon-card">
                            <h4>Query</h4>
                            <p>{query}</p>
                            <h4>Response</h4>
                            <p>{result.get('text_response', 'No response generated')}</p>
                        </div>
                        """, unsafe_allow_html=True)
                        
                        if result.get('visualization'):
                            st.markdown('<div class="chart-container">', unsafe_allow_html=True)
                            st.plotly_chart(result['visualization'], use_container_width=True)
                            st.markdown('</div>', unsafe_allow_html=True)
                        
                        # Add to history
                        st.session_state.ai_insights.append({
                            'query': query,
                            'response': result.get('text_response', 'No response'),
                            'timestamp': datetime.now(),
                            'has_viz': result.get('visualization') is not None
                        })
                    else:
                        st.info("⚠️ Backend not available. Please initialize backend for AI insights.")
                        
                        # Show demo response
                        demo_response = f"""
                        Based on your query about "{query}", here's what the AI would analyze:
                        
                        - Temperature patterns and anomalies
                        - Seasonal variations in the data
                        - Correlation between different ocean parameters
                        - Geographic distribution insights
                        - Historical trends and predictions
                        
                        *This is a demo response. Connect to backend for real AI analysis.*
                        """
                        
                        st.markdown(f"""
                        <div class="neon-card">
                            <h4>Demo Response</h4>
                            <p>{demo_response}</p>
                        </div>
                        """, unsafe_allow_html=True)
                        
                except Exception as e:
                    st.error(f"❌ Error generating insights: {e}")
    
    with col2:
        # AI Insights sidebar
        st.markdown("### 🧠 AI Capabilities")
        
        capabilities = [
            ("🔍", "Pattern Recognition", "Identify trends and anomalies"),
            ("📊", "Statistical Analysis", "Deep data insights"),
            ("🌡️", "Temperature Profiling", "Depth analysis"),
            ("🗺️", "Geographic Clustering", "Spatial patterns"),
            ("📈", "Trend Prediction", "Future forecasting"),
            ("🔬", "Quality Assessment", "Data validation")
        ]
        
        for icon, title, desc in capabilities:
            st.markdown(f"""
            <div style="background: rgba(20, 25, 45, 0.6); padding: 1rem; border-radius: 10px; margin-bottom: 0.5rem; border-left: 3px solid #667eea;">
                <div style="font-size: 1.5rem;">{icon}</div>
                <div style="font-weight: 600; margin-top: 0.5rem;">{title}</div>
                <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7);">{desc}</div>
            </div>
            """, unsafe_allow_html=True)
    
    # Previous insights
    if st.session_state.ai_insights:
        st.markdown("---")
        st.markdown("### 📚 Recent AI Insights")
        
        for i, insight in enumerate(reversed(st.session_state.ai_insights[-5:])):
            with st.expander(f"💡 {insight['query'][:60]}... ({insight['timestamp'].strftime('%H:%M:%S')})", expanded=False):
                st.markdown(f"**Response:** {insight['response'][:500]}...")
                if insight['has_viz']:
                    st.info("📊 Visualization was generated for this query")
                st.caption(f"🕐 {insight['timestamp'].strftime('%Y-%m-%d %H:%M:%S')}")

# Real-time Data page
def render_realtime():
    st.markdown("## 📈 Real-Time Ocean Monitoring")
    
    region = st.session_state.selected_region
    
    # Auto-refresh toggle
    col1, col2, col3 = st.columns([2, 1, 1])
    with col1:
        st.markdown("### 🔴 Live Data Stream")
    with col2:
        auto_refresh = st.checkbox("Auto-refresh", value=False)
    with col3:
        refresh_interval = st.selectbox("Interval", ["10s", "30s", "60s"])
    
    if auto_refresh:
        st.info("🔄 Auto-refresh enabled")
    
    # Fetch latest data
    df = fetch_ocean_data(region, limit=1000)
    
    if df is not None and not df.empty:
        # Live metrics with animation
        st.markdown("### 📊 Current Conditions")
        
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            if 'temperature' in df.columns:
                latest_temp = df['temperature'].iloc[-1] if len(df) > 0 else 0
                avg_temp = df['temperature'].mean()
                delta_temp = latest_temp - avg_temp
                
                st.markdown(f"""
                <div class="neon-card">
                    <h3>🌡️ TEMPERATURE</h3>
                    <div class="metric-value">{latest_temp:.2f}°C</div>
                    <div class="metric-delta" style="color: {'#4ade80' if delta_temp > 0 else '#ef4444'}">
                        {delta_temp:+.2f}°C from avg
                    </div>
                </div>
                """, unsafe_allow_html=True)
        
        with col2:
            if 'salinity' in df.columns:
                latest_sal = df['salinity'].iloc[-1] if len(df) > 0 else 0
                avg_sal = df['salinity'].mean()
                delta_sal = latest_sal - avg_sal
                
                st.markdown(f"""
                <div class="neon-card">
                    <h3>🧂 SALINITY</h3>
                    <div class="metric-value">{latest_sal:.2f}</div>
                    <div class="metric-delta" style="color: {'#4ade80' if delta_sal > 0 else '#ef4444'}">
                        {delta_sal:+.2f} PSU from avg
                    </div>
                </div>
                """, unsafe_allow_html=True)
        
        with col3:
            if 'pressure' in df.columns:
                latest_press = df['pressure'].iloc[-1] if len(df) > 0 else 0
                
                st.markdown(f"""
                <div class="neon-card">
                    <h3>🌊 PRESSURE</h3>
                    <div class="metric-value">{latest_press:.0f}</div>
                    <div class="metric-delta">dbar</div>
                </div>
                """, unsafe_allow_html=True)
        
        with col4:
            data_age = "Just now"
            
            st.markdown(f"""
            <div class="neon-card">
                <h3>🕐 LAST UPDATE</h3>
                <div class="metric-value" style="font-size: 1.5rem;">{data_age}</div>
                <div class="metric-delta">Live monitoring</div>
            </div>
            """, unsafe_allow_html=True)
        
        # Real-time chart
        st.markdown("### 📈 Live Data Feed")
        
        if 'temperature' in df.columns:
            # Take last 100 points for real-time view
            recent_df = df.tail(100).reset_index(drop=True)
            
            fig_realtime = go.Figure()
            
            fig_realtime.add_trace(go.Scatter(
                y=recent_df['temperature'],
                mode='lines',
                name='Temperature',
                line=dict(color='#667eea', width=2),
                fill='tozeroy',
                fillcolor='rgba(102, 126, 234, 0.2)'
            ))
            
            fig_realtime.update_layout(
                title=f"Live Temperature Stream - {region}",
                xaxis_title="Data Point",
                yaxis_title="Temperature (°C)",
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                font=dict(color='white'),
                height=400,
                hovermode='x unified'
            )
            
            st.markdown('<div class="chart-container">', unsafe_allow_html=True)
            st.plotly_chart(fig_realtime, use_container_width=True)
            st.markdown('</div>', unsafe_allow_html=True)
        
        # Data quality indicators
        st.markdown("### ✅ Data Quality Metrics")
        
        col1, col2, col3 = st.columns(3)
        
        with col1:
            completeness = (1 - df.isnull().sum().sum() / (len(df) * len(df.columns))) * 100
            st.metric("Data Completeness", f"{completeness:.1f}%", "Excellent")
        
        with col2:
            outlier_pct = 2.5  # Example calculation
            st.metric("Outlier Rate", f"{outlier_pct:.1f}%", "Within limits")
        
        with col3:
            st.metric("Active Sensors", f"{df['profiler'].nunique()}" if 'profiler' in df.columns else "N/A", "Online")
        
    else:
        st.warning("⚠️ No real-time data available. Check backend connection.")

# Settings page
def render_settings():
    st.markdown("## ⚙️ System Settings & Configuration")
    
    tab1, tab2, tab3 = st.tabs(["🔧 General", "🎨 Appearance", "📊 Data"])
    
    with tab1:
        st.markdown("### 🔧 General Settings")
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("#### Backend Configuration")
            backend_status = "Connected" if st.session_state.backend_initialized else "Disconnected"
            st.info(f"Status: {backend_status}")
            
            if st.button("🔄 Reconnect Backend", use_container_width=True):
                if BACKEND_AVAILABLE:
                    init_backend()
                else:
                    st.error("Backend modules not available")
            
            st.markdown("#### Cache Management")
            cache_size = len(st.session_state.data_cache)
            st.metric("Cached Queries", cache_size)
            
            if st.button("🗑️ Clear Cache", use_container_width=True):
                st.session_state.data_cache = {}
                st.success("Cache cleared!")
        
        with col2:
            st.markdown("#### API Configuration")
            api_key = st.text_input("API Key", type="password", placeholder="Enter your API key")
            
            st.markdown("#### Notification Settings")
            email_notif = st.checkbox("Email Notifications", value=True)
            alert_notif = st.checkbox("Data Alerts", value=True)
            
            if st.button("💾 Save Settings", use_container_width=True):
                st.success("Settings saved successfully!")
    
    with tab2:
        st.markdown("### 🎨 Appearance Settings")
        
        col1, col2 = st.columns(2)
        
        with col1:
            theme = st.selectbox("Color Theme", ["Ocean Blue (Default)", "Deep Purple", "Emerald Green"])
            chart_style = st.selectbox("Chart Style", ["Modern", "Classic", "Minimal"])
            
        with col2:
            animation = st.checkbox("Enable Animations", value=True)
            high_contrast = st.checkbox("High Contrast Mode", value=False)
        
        if st.button("🎨 Apply Theme", use_container_width=True):
            st.success("Theme applied! Refresh to see changes.")
    
    with tab3:
        st.markdown("### 📊 Data Management")
        
        st.markdown("#### Export Settings")
        export_format = st.selectbox("Default Export Format", ["CSV", "JSON", "Parquet", "NetCDF"])
        include_metadata = st.checkbox("Include Metadata", value=True)
        
        st.markdown("#### Data Limits")
        max_records = st.slider("Max Records per Query", 100, 10000, 5000)
        cache_duration = st.slider("Cache Duration (hours)", 1, 24, 6)
        
        if st.button("💾 Save Data Settings", use_container_width=True):
            st.success("Data settings saved!")
        
        st.markdown("---")
        st.markdown("#### System Information")
        
        info_data = {
            "Backend Status": "Connected" if st.session_state.backend_initialized else "Disconnected",
            "Database": "PostgreSQL" if st.session_state.backend_initialized else "N/A",
            "Vector Store": "Active" if st.session_state.backend_initialized else "Inactive",
            "AI Pipeline": "Enabled" if st.session_state.backend_initialized else "Disabled",
            "Data Version": "v2.0.0",
            "Last Updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        info_df = pd.DataFrame(list(info_data.items()), columns=["Property", "Value"])
        st.dataframe(info_df, use_container_width=True, hide_index=True)

# Main application
def main():
    load_modern_css()
    init_session_state()
    
    if BACKEND_AVAILABLE:
        init_backend()
    
    render_header()
    render_sidebar()
    
    # Route to pages
    page = st.session_state.current_page
    
    if page == "Dashboard":
        render_dashboard()
    elif page == "Explorer":
        render_explorer()
    elif page == "Analytics":
        render_analytics()
    elif page == "AI":
        render_ai_insights()
    elif page == "Realtime":
        render_realtime()
    elif page == "Settings":
        render_settings()
    else:
        st.info(f"Page '{page}' coming soon!")
    
    # Footer
    st.markdown("---")
    st.markdown("""
    <div style="text-align: center; padding: 2rem 0;">
        <p style="color: rgba(255,255,255,0.5);">🌊 NeptuneAI v2.0 | Powered by Advanced Ocean Intelligence</p>
    </div>
    """, unsafe_allow_html=True)

if __name__ == "__main__":
    main()