#!/usr/bin/env python3
"""
NeptuneAI Frontend Demo Script
Demonstrates key features of the modern Streamlit frontend
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime
import sys
from pathlib import Path

# Add frontend to path
sys.path.append('frontend')

def demo_analytics():
    """Demo the analytics page features"""
    st.markdown("## 📊 Analytics Demo")
    
    # Generate sample data
    np.random.seed(42)
    n_points = 500
    
    data = {
        'latitude': np.random.uniform(-40, 25, n_points),
        'longitude': np.random.uniform(40, 120, n_points),
        'temperature': np.random.uniform(15, 30, n_points),
        'salinity': np.random.uniform(33, 37, n_points),
        'pressure': np.random.uniform(0, 2000, n_points),
        'platform_number': [f'ARGO_{i:06d}' for i in range(n_points)],
        'date': pd.date_range('2023-01-01', periods=n_points, freq='D'),
        'ocean': np.random.choice(['Indian Ocean', 'Pacific Ocean', 'Atlantic Ocean'], n_points)
    }
    
    df = pd.DataFrame(data)
    
    # Show metrics
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("Total Records", f"{len(df):,}")
    with col2:
        st.metric("Avg Temperature", f"{df['temperature'].mean():.2f}°C")
    with col3:
        st.metric("Avg Salinity", f"{df['salinity'].mean():.2f} PSU")
    with col4:
        st.metric("Oceans", len(df['ocean'].unique()))
    
    # Interactive scatter plot
    fig = px.scatter(df, x='salinity', y='temperature', 
                     color='ocean', size='pressure',
                     hover_data=['platform_number', 'date'],
                     title="Temperature vs Salinity by Ocean")
    st.plotly_chart(fig, use_container_width=True)
    
    # Time series
    daily_avg = df.groupby(df['date'].dt.date).agg({
        'temperature': 'mean',
        'salinity': 'mean'
    }).reset_index()
    
    fig2 = go.Figure()
    fig2.add_trace(go.Scatter(x=daily_avg['date'], y=daily_avg['temperature'], 
                              name='Temperature', line=dict(color='#3498db')))
    fig2.add_trace(go.Scatter(x=daily_avg['date'], y=daily_avg['salinity'], 
                              name='Salinity', line=dict(color='#e74c3c')))
    fig2.update_layout(title="Daily Average Temperature and Salinity", height=400)
    st.plotly_chart(fig2, use_container_width=True)

def demo_ai_insights():
    """Demo the AI insights features"""
    st.markdown("## 🤖 AI Insights Demo")
    
    # Sample AI responses
    sample_queries = [
        "What are the temperature trends in the Indian Ocean?",
        "Show me salinity patterns by season",
        "Identify any anomalies in the data",
        "Predict future ocean conditions"
    ]
    
    st.markdown("### Sample AI Queries")
    
    for i, query in enumerate(sample_queries):
        with st.expander(f"Query {i+1}: {query}", expanded=False):
            if query == "What are the temperature trends in the Indian Ocean?":
                st.markdown("""
                **AI Analysis:**
                - Temperature shows a 0.3°C increase over the past year
                - Seasonal variation of ±2°C observed
                - Strong correlation with monsoon patterns
                - Confidence: 89%
                """)
            elif query == "Show me salinity patterns by season":
                st.markdown("""
                **AI Analysis:**
                - Salinity peaks during winter months
                - Minimum values in summer due to rainfall
                - Spatial variation of 2-3 PSU across regions
                - Confidence: 92%
                """)
            elif query == "Identify any anomalies in the data":
                st.markdown("""
                **AI Analysis:**
                - 3 temperature anomalies detected (>3σ from mean)
                - 1 salinity spike in March 2023
                - Possible sensor malfunction in ARGO_123456
                - Confidence: 95%
                """)
            else:
                st.markdown("""
                **AI Analysis:**
                - Temperature expected to rise 0.5°C by 2024
                - Salinity patterns will remain stable
                - Increased variability in monsoon season
                - Confidence: 78%
                """)

def demo_upload():
    """Demo the upload features"""
    st.markdown("## 📤 Upload Demo")
    
    # Simulate file upload
    st.markdown("### Simulated File Upload")
    
    # Create sample files
    sample_files = [
        "argo_float_001.nc (2.3 MB)",
        "indian_ocean_data.csv (1.8 MB)",
        "temperature_profiles.parquet (3.1 MB)"
    ]
    
    st.markdown("**Uploaded Files:**")
    for file in sample_files:
        st.write(f"📄 {file}")
    
    # Processing options
    st.markdown("### Processing Options")
    
    col1, col2 = st.columns(2)
    with col1:
        st.selectbox("Output Format", ["CSV", "Parquet", "NetCDF"])
        st.checkbox("Apply Quality Control", value=True)
    with col2:
        st.checkbox("Include Metadata", value=True)
        st.checkbox("Generate Visualizations", value=True)
    
    if st.button("🚀 Process Files"):
        with st.spinner("Processing files..."):
            import time
            time.sleep(2)
            st.success("Files processed successfully!")
            
            # Show results
            results = pd.DataFrame({
                'File': [f.split(' ')[0] for f in sample_files],
                'Status': ['Processed'] * len(sample_files),
                'Records': [1500, 2300, 1800],
                'Quality': ['98.5%', '97.2%', '99.1%']
            })
            st.dataframe(results, use_container_width=True)

def main():
    """Main demo function"""
    st.set_page_config(
        page_title="NeptuneAI Frontend Demo",
        page_icon="🌊",
        layout="wide"
    )
    
    st.markdown("""
    <div style="background: linear-gradient(90deg, #1e3c72 0%, #2a5298 100%); 
                padding: 2rem; border-radius: 15px; margin-bottom: 2rem;">
        <h1 style="color: white; text-align: center; margin: 0;">🌊 NeptuneAI Frontend Demo</h1>
        <p style="color: rgba(255,255,255,0.9); text-align: center; margin: 0.5rem 0 0 0;">
            Interactive demonstration of key features
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    # Demo sections
    tab1, tab2, tab3 = st.tabs(["📊 Analytics", "🤖 AI Insights", "📤 Upload"])
    
    with tab1:
        demo_analytics()
    
    with tab2:
        demo_ai_insights()
    
    with tab3:
        demo_upload()
    
    # Instructions
    st.markdown("---")
    st.markdown("""
    ### 🚀 How to Run the Full Frontend
    
    1. **Quick Start:**
       ```bash
       python3 launch_frontend.py
       ```
    
    2. **Manual Launch:**
       ```bash
       cd frontend
       streamlit run app.py
       ```
    
    3. **Access the application at:** http://localhost:8501
    
    ### ✨ Features Available
    
    - **🏠 Home Page** - Welcome and feature overview
    - **📊 Analytics** - Interactive data visualization
    - **🗂️ Datasets** - Data management and download
    - **📤 Upload** - File upload and processing
    - **🤖 AI Insights** - AI-powered data analysis
    - **👤 Profile** - User management and settings
    - **ℹ️ About** - Platform information and status
    """)

if __name__ == "__main__":
    main()