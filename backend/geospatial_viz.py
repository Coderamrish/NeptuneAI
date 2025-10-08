"""
Enhanced Geospatial Visualizations for ARGO Ocean Data
Implements interactive maps, trajectory plotting, and advanced oceanographic visualizations
"""

import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple, Any
import logging
from datetime import datetime, timedelta
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ARGOGeospatialVisualizer:
    """
    Advanced geospatial visualization for ARGO ocean data
    """
    
    def __init__(self):
        self.ocean_bounds = {
            'Indian Ocean': {'lat': [-40, 25], 'lon': [40, 120]},
            'Pacific Ocean': {'lat': [-60, 60], 'lon': [120, 280]},
            'Atlantic Ocean': {'lat': [-60, 60], 'lon': [-80, 20]},
            'Arctic Ocean': {'lat': [60, 90], 'lon': [-180, 180]},
            'Southern Ocean': {'lat': [-80, -40], 'lon': [-180, 180]}
        }
        
        # Ocean color scheme
        self.ocean_colors = {
            'temperature': 'thermal',
            'salinity': 'haline', 
            'pressure': 'deep',
            'depth': 'viridis'
        }
    
    def create_interactive_world_map(self, 
                                     df: pd.DataFrame,
                                     color_by: str = 'temperature',
                                     size_by: str = 'depth',
                                     region: str = None) -> go.Figure:
        """
        Create an interactive world map with ARGO data
        
        Args:
            df: DataFrame with latitude, longitude, and measurement data
            color_by: Column to use for color mapping
            size_by: Column to use for size mapping
            region: Ocean region to highlight
            
        Returns:
            Plotly figure with interactive world map
        """
        if df.empty or 'latitude' not in df.columns or 'longitude' not in df.columns:
            logger.warning("Insufficient data for world map")
            return None
        
        # Filter data for region if specified
        if region and region in self.ocean_bounds:
            bounds = self.ocean_bounds[region]
            df = df[
                (df['latitude'] >= bounds['lat'][0]) & 
                (df['latitude'] <= bounds['lat'][1]) &
                (df['longitude'] >= bounds['lon'][0]) & 
                (df['longitude'] <= bounds['lon'][1])
            ]
        
        # Create base map
        fig = go.Figure()
        
        # Add ocean background
        fig.add_trace(go.Scattermapbox(
            mode="markers",
            marker=dict(size=1, color='rgba(0,100,200,0.1)'),
            showlegend=False,
            hoverinfo='skip'
        ))
        
        # Add ARGO data points
        if color_by in df.columns and size_by in df.columns:
            # Handle potential NaN values
            size_data = df[size_by].fillna(df[size_by].mean())
            color_data = df[color_by].fillna(df[color_by].mean())
            
            fig.add_trace(go.Scattermapbox(
                lat=df['latitude'],
                lon=df['longitude'],
                mode='markers',
                marker=dict(
                    size=size_data / size_data.max() * 20 + 5,
                    color=color_data,
                    colorscale=self.ocean_colors.get(color_by, 'viridis'),
                    colorbar=dict(
                        title=f"{color_by.title()}",
                        x=1.02
                    ),
                    opacity=0.7,
                    line=dict(width=0.5, color='white')
                ),
                text=df.apply(lambda row: f"""
                <b>Location:</b> {row['latitude']:.2f}°N, {row['longitude']:.2f}°E<br>
                <b>{color_by.title()}:</b> {row.get(color_by, 'N/A'):.2f}<br>
                <b>{size_by.title()}:</b> {row.get(size_by, 'N/A'):.2f}<br>
                <b>Platform:</b> {row.get('platform_number', 'N/A')}<br>
                <b>Date:</b> {row.get('date', 'N/A')}
                """, axis=1),
                hovertemplate='%{text}<extra></extra>',
                name='ARGO Profilers'
            ))
        
        # Set map layout
        center_lat = df['latitude'].mean() if not df.empty else 0
        center_lon = df['longitude'].mean() if not df.empty else 0
        
        fig.update_layout(
            title=f"ARGO Profiler Deployments - {region or 'Global'}" if region else "ARGO Profiler Deployments - Global",
            mapbox=dict(
                style="carto-darkmatter",
                center=dict(lat=center_lat, lon=center_lon),
                zoom=2 if not region else 4
            ),
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            font=dict(color='white'),
            height=600,
            margin=dict(r=0, t=40, l=0, b=0)
        )
        
        return fig
    
    def create_trajectory_map(self, 
                              df: pd.DataFrame,
                              platform_col: str = 'platform_number',
                              time_col: str = 'date') -> go.Figure:
        """
        Create trajectory map showing float paths
        
        Args:
            df: DataFrame with trajectory data
            platform_col: Column containing platform identifiers
            time_col: Column containing timestamps
            
        Returns:
            Plotly figure with trajectory map
        """
        if df.empty or platform_col not in df.columns:
            logger.warning("Insufficient data for trajectory map")
            return None
        
        fig = go.Figure()
        
        # Group by platform to create trajectories
        for platform, group in df.groupby(platform_col):
            if len(group) > 1:
                # Sort by time if available
                if time_col in group.columns:
                    group = group.sort_values(time_col)
                
                # Add trajectory line
                fig.add_trace(go.Scattermapbox(
                    lat=group['latitude'],
                    lon=group['longitude'],
                    mode='lines+markers',
                    line=dict(width=2, color='rgba(255,255,255,0.6)'),
                    marker=dict(size=4, color='rgba(255,255,255,0.8)'),
                    name=f'Platform {platform}',
                    hovertemplate=f'<b>Platform:</b> {platform}<br>' +
                                  '<b>Lat:</b> %{lat:.2f}°N<br>' +
                                  '<b>Lon:</b> %{lon:.2f}°E<br>' +
                                  '<extra></extra>',
                    showlegend=True
                ))
        
        # Set map layout
        center_lat = df['latitude'].mean() if not df.empty else 0
        center_lon = df['longitude'].mean() if not df.empty else 0
        
        fig.update_layout(
            title="ARGO Float Trajectories",
            mapbox=dict(
                style="carto-darkmatter",
                center=dict(lat=center_lat, lon=center_lon),
                zoom=3
            ),
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            font=dict(color='white'),
            height=600,
            margin=dict(r=0, t=40, l=0, b=0)
        )
        
        return fig
    
    def create_depth_profile_plot(self, 
                                  df: pd.DataFrame,
                                  platform_id: str = None,
                                  variables: List[str] = ['temperature', 'salinity']) -> go.Figure:
        """
        Create depth profile plot for oceanographic variables
        
        Args:
            df: DataFrame with profile data
            platform_id: Specific platform to plot
            variables: List of variables to plot
            
        Returns:
            Plotly figure with depth profiles
        """
        if df.empty:
            logger.warning("No data for depth profile")
            return None
        
        # Filter by platform if specified
        if platform_id and 'platform_number' in df.columns:
            df = df[df['platform_number'] == platform_id]
        
        if df.empty:
            logger.warning(f"No data found for platform {platform_id}")
            return None
        
        # Create subplots
        fig = make_subplots(
            rows=1, cols=len(variables),
            subplot_titles=[var.title() for var in variables],
            horizontal_spacing=0.1
        )
        
        for i, var in enumerate(variables):
            if var in df.columns and 'pressure' in df.columns:
                # Plot variable vs pressure (depth proxy)
                fig.add_trace(
                    go.Scatter(
                        x=df[var],
                        y=df['pressure'],
                        mode='markers+lines',
                        name=var.title(),
                        line=dict(width=2),
                        marker=dict(size=4)
                    ),
                    row=1, col=i+1
                )
        
        # Update layout
        fig.update_layout(
            title=f"Depth Profiles - Platform {platform_id}" if platform_id else "Depth Profiles",
            height=400,
            showlegend=False,
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            font=dict(color='white')
        )
        
        # Update axes
        for i in range(len(variables)):
            fig.update_xaxes(title_text=variables[i].title(), row=1, col=i+1)
            fig.update_yaxes(title_text="Pressure (dbar)", row=1, col=i+1)
        
        return fig
    
    def create_heatmap_plot(self, 
                            df: pd.DataFrame,
                            x_col: str = 'longitude',
                            y_col: str = 'latitude',
                            z_col: str = 'temperature',
                            region: str = None) -> go.Figure:
        """
        Create heatmap plot for oceanographic data
        
        Args:
            df: DataFrame with coordinate and measurement data
            x_col: X-axis column (typically longitude)
            y_col: Y-axis column (typically latitude)
            z_col: Z-axis column (measurement to visualize)
            region: Ocean region to focus on
            
        Returns:
            Plotly figure with heatmap
        """
        if df.empty or any(col not in df.columns for col in [x_col, y_col, z_col]):
            logger.warning("Insufficient data for heatmap")
            return None
        
        # Filter by region if specified
        if region and region in self.ocean_bounds:
            bounds = self.ocean_bounds[region]
            df = df[
                (df[y_col] >= bounds['lat'][0]) & 
                (df[y_col] <= bounds['lat'][1]) &
                (df[x_col] >= bounds['lon'][0]) & 
                (df[x_col] <= bounds['lon'][1])
            ]
        
        # Create heatmap
        fig = go.Figure(data=go.Heatmap(
            x=df[x_col],
            y=df[y_col],
            z=df[z_col],
            colorscale=self.ocean_colors.get(z_col, 'viridis'),
            colorbar=dict(title=f"{z_col.title()}"),
            hovertemplate=f'<b>{x_col.title()}:</b> %{{x:.2f}}<br>' +
                          f'<b>{y_col.title()}:</b> %{{y:.2f}}<br>' +
                          f'<b>{z_col.title()}:</b> %{{z:.2f}}<br>' +
                          '<extra></extra>'
        ))
        
        fig.update_layout(
            title=f"{z_col.title()} Heatmap - {region or 'Global'}",
            xaxis_title=x_col.title(),
            yaxis_title=y_col.title(),
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            font=dict(color='white'),
            height=500
        )
        
        return fig
    
    def create_time_series_map(self, 
                               df: pd.DataFrame,
                               time_col: str = 'date',
                               value_col: str = 'temperature',
                               region: str = None) -> go.Figure:
        """
        Create animated time series map
        
        Args:
            df: DataFrame with time series data
            time_col: Column containing timestamps
            value_col: Column containing values to animate
            region: Ocean region to focus on
            
        Returns:
            Plotly figure with animated map
        """
        if df.empty or time_col not in df.columns or value_col not in df.columns:
            logger.warning("Insufficient data for time series map")
            return None
        
        # Convert time column to datetime
        df[time_col] = pd.to_datetime(df[time_col], errors='coerce')
        df = df.dropna(subset=[time_col])
        
        if df.empty:
            logger.warning("No valid time data found")
            return None
        
        # Filter by region if specified
        if region and region in self.ocean_bounds:
            bounds = self.ocean_bounds[region]
            df = df[
                (df['latitude'] >= bounds['lat'][0]) & 
                (df['latitude'] <= bounds['lat'][1]) &
                (df['longitude'] >= bounds['lon'][0]) & 
                (df['longitude'] <= bounds['lon'][1])
            ]
        
        # Create animated scatter plot
        fig = px.scatter_mapbox(
            df,
            lat='latitude',
            lon='longitude',
            color=value_col,
            size=value_col,
            animation_frame=time_col,
            color_continuous_scale=self.ocean_colors.get(value_col, 'viridis'),
            mapbox_style="carto-darkmatter",
            title=f"Animated {value_col.title()} Map - {region or 'Global'}",
            hover_data=[value_col, 'platform_number'] if 'platform_number' in df.columns else [value_col]
        )
        
        fig.update_layout(
            paper_bgcolor='rgba(0,0,0,0)',
            font=dict(color='white'),
            height=600,
            margin=dict(r=0, t=40, l=0, b=0)
        )
        
        return fig
    
    def create_comprehensive_dashboard(self, 
                                       df: pd.DataFrame,
                                       region: str = None) -> go.Figure:
        """
        Create comprehensive dashboard with multiple visualizations
        
        Args:
            df: DataFrame with oceanographic data
            region: Ocean region to focus on
            
        Returns:
            Plotly figure with dashboard
        """
        if df.empty:
            logger.warning("No data for dashboard")
            return None
        
        # Create subplots
        fig = make_subplots(
            rows=2, cols=2,
            subplot_titles=[
                'Geographic Distribution',
                'Temperature vs Salinity',
                'Depth Profiles',
                'Monthly Distribution'
            ],
            specs=[
                [{"type": "scattermapbox"}, {"type": "scatter"}],
                [{"type": "scatter"}, {"type": "bar"}]
            ],
            vertical_spacing=0.1,
            horizontal_spacing=0.1
        )
        
        # 1. Geographic distribution
        if 'latitude' in df.columns and 'longitude' in df.columns:
            fig.add_trace(
                go.Scattermapbox(
                    lat=df['latitude'],
                    lon=df['longitude'],
                    mode='markers',
                    marker=dict(
                        size=6,
                        color=df.get('temperature', 20),
                        colorscale='thermal',
                        opacity=0.7
                    ),
                    name='Profiler Locations',
                    showlegend=False
                ),
                row=1, col=1
            )
        
        # 2. Temperature vs Salinity
        if 'temperature' in df.columns and 'salinity' in df.columns:
            fig.add_trace(
                go.Scatter(
                    x=df['salinity'],
                    y=df['temperature'],
                    mode='markers',
                    marker=dict(
                        size=4,
                        color=df.get('pressure', 1000),
                        colorscale='viridis',
                        opacity=0.6
                    ),
                    name='T-S Diagram',
                    showlegend=False
                ),
                row=1, col=2
            )
        
        # 3. Depth profiles (sample)
        if 'pressure' in df.columns and 'temperature' in df.columns:
            sample_data = df.sample(min(100, len(df)))
            fig.add_trace(
                go.Scatter(
                    x=sample_data['temperature'],
                    y=sample_data['pressure'],
                    mode='markers',
                    marker=dict(size=3, opacity=0.5),
                    name='Depth Profiles',
                    showlegend=False
                ),
                row=2, col=1
            )
        
        # 4. Monthly distribution
        if 'Month' in df.columns:
            monthly_counts = df['Month'].value_counts()
            month_order = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ]
            monthly_counts = monthly_counts.reindex([m for m in month_order if m in monthly_counts.index])
            
            fig.add_trace(
                go.Bar(
                    x=monthly_counts.index,
                    y=monthly_counts.values,
                    name='Monthly Distribution',
                    showlegend=False
                ),
                row=2, col=2
            )
        
        # Update layout
        title = f"ARGO Ocean Data Dashboard - {region}" if region else "ARGO Ocean Data Dashboard"
        fig.update_layout(
            title=title,
            height=800,
            paper_bgcolor='rgba(0,0,0,0)',
            plot_bgcolor='rgba(0,0,0,0)',
            font=dict(color='white'),
            showlegend=False
        )
        
        # Update mapbox
        if 'latitude' in df.columns and 'longitude' in df.columns:
            center_lat = df['latitude'].mean()
            center_lon = df['longitude'].mean()
            fig.update_layout(
                mapbox=dict(
                    style="carto-darkmatter",
                    center=dict(lat=center_lat, lon=center_lon),
                    zoom=2
                )
            )
        
        return fig

def main():
    """Example usage of geospatial visualizer"""
    visualizer = ARGOGeospatialVisualizer()
    
    # Create sample data
    sample_data = {
        'latitude': np.random.uniform(-40, 25, 100),
        'longitude': np.random.uniform(40, 120, 100),
        'temperature': np.random.uniform(15, 30, 100),
        'salinity': np.random.uniform(33, 37, 100),
        'pressure': np.random.uniform(0, 2000, 100),
        'platform_number': [f'ARGO_{i:06d}' for i in range(100)],
        'date': pd.date_range('2023-01-01', periods=100, freq='D').strftime('%Y-%m-%d')
    }
    
    df = pd.DataFrame(sample_data)
    
    # Create visualizations
    world_map = visualizer.create_interactive_world_map(df, region='Indian Ocean')
    trajectory_map = visualizer.create_trajectory_map(df)
    heatmap = visualizer.create_heatmap_plot(df)
    dashboard = visualizer.create_comprehensive_dashboard(df, region='Indian Ocean')
    
    print("🌊 ARGO Geospatial Visualizer initialized")
    print("🗺️ Available visualizations:")
    print("  • Interactive world maps")
    print("  • Trajectory mapping")
    print("  • Depth profile plots")
    print("  • Heatmap visualizations")
    print("  • Time series animations")
    print("  • Comprehensive dashboards")

if __name__ == "__main__":
    main()