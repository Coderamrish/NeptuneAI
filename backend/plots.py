import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import pandas as pd

def create_temperature_boxplot(df: pd.DataFrame, region_name: str = None):
    """
    Since there's no temperature data, create a profiler distribution analysis instead.
    This maintains backward compatibility with your RAG pipeline.

    Args:
        df (pd.DataFrame): DataFrame containing oceanographic profiler data.
        region_name (str, optional): The name of the region for the plot title.

    Returns:
        plotly.graph_objs._figure.Figure: A Plotly figure object showing profiler analysis.
    """
    if df.empty:
        return None

    return create_profiler_dashboard(df, region_name)

def create_profiler_distribution_plot(df: pd.DataFrame, region_name: str = None):
    """
    Creates an interactive bar plot of profiler types distribution.

    Args:
        df (pd.DataFrame): DataFrame containing 'profiler' column.
        region_name (str, optional): The name of the region for the plot title.

    Returns:
        plotly.graph_objs._figure.Figure: A Plotly figure object.
    """
    if df.empty or 'profiler' not in df.columns:
        return None

    
    profiler_counts = df['profiler'].value_counts().head(15)
    
   
    profiler_labels = [label[:40] + '...' if len(label) > 40 else label 
                      for label in profiler_counts.index]

    title = "Profiler Types Distribution"
    if region_name:
        title += f" in {region_name}"

    fig = px.bar(
        x=profiler_counts.values,
        y=profiler_labels,
        orientation='h',
        title=title,
        labels={"x": "Number of Deployments", "y": "Profiler Type"},
        template="plotly_dark",
        color=profiler_counts.values,
        color_continuous_scale="viridis"
    )
    
    fig.update_layout(
        yaxis_title="Profiler Type",
        xaxis_title="Number of Deployments",
        showlegend=False,
        height=max(400, len(profiler_counts) * 30) 
    )
    
    return fig

def create_monthly_distribution_plot(df: pd.DataFrame, region_name: str = None):
    """
    Creates an interactive bar plot of monthly measurement distribution.

    Args:
        df (pd.DataFrame): DataFrame containing 'Month' column.
        region_name (str, optional): The name of the region for the plot title.

    Returns:
        plotly.graph_objs._figure.Figure: A Plotly figure object.
    """
    if df.empty or 'Month' not in df.columns:
        return None

    
    month_order = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
    ]
    
    monthly_counts = df['Month'].value_counts()
   
    monthly_counts = monthly_counts.reindex([m for m in month_order if m in monthly_counts.index])

    title = "Monthly Distribution of Profiler Deployments"
    if region_name:
        title += f" in {region_name}"

    fig = px.bar(
        x=monthly_counts.index,
        y=monthly_counts.values,
        title=title,
        labels={"x": "Month", "y": "Number of Deployments"},
        template="plotly_dark",
        color=monthly_counts.values,
        color_continuous_scale="blues"
    )
    
    fig.update_layout(
        xaxis_title="Month",
        yaxis_title="Number of Deployments",
        showlegend=False
    )
    
    return fig

def create_geographic_scatter_plot(df: pd.DataFrame, region_name: str = None):
    """
    Creates an interactive scatter plot showing geographic distribution of profiler deployments.

    Args:
        df (pd.DataFrame): DataFrame containing 'latitude' and 'longitude' columns.
        region_name (str, optional): The name of the region for the plot title.

    Returns:
        plotly.graph_objs._figure.Figure: A Plotly figure object.
    """
    if df.empty or 'latitude' not in df.columns or 'longitude' not in df.columns:
        return None

    title = "Geographic Distribution of Profiler Deployments"
    if region_name:
        title += f" in {region_name}"
    color_col = 'profiler' if 'profiler' in df.columns else None
    hover_data = ['profiler', 'institution'] if all(col in df.columns for col in ['profiler', 'institution']) else None

    fig = px.scatter(
        df,
        x="longitude",
        y="latitude",
        title=title,
        labels={"longitude": "Longitude", "latitude": "Latitude"},
        template="plotly_dark",
        color=color_col,
        hover_data=hover_data,
        opacity=0.7
    )
    
    fig.update_layout(
        xaxis_title="Longitude",
        yaxis_title="Latitude",
    )
    
    return fig

def create_institution_pie_chart(df: pd.DataFrame, region_name: str = None):
    """
    Creates an interactive pie chart showing the distribution of deployments by institution.

    Args:
        df (pd.DataFrame): DataFrame containing 'institution' column.
        region_name (str, optional): The name of the region for the plot title.

    Returns:
        plotly.graph_objs._figure.Figure: A Plotly figure object.
    """
    if df.empty or 'institution' not in df.columns:
        return None

    institution_counts = df['institution'].value_counts().head(10)

    title = "Profiler Deployments by Institution"
    if region_name:
        title += f" in {region_name}"

    fig = px.pie(
        values=institution_counts.values,
        names=institution_counts.index,
        title=title,
        template="plotly_dark"
    )
    
    fig.update_traces(textposition='inside', textinfo='percent+label')
    
    return fig

def create_time_series_plot(df: pd.DataFrame, region_name: str = None):
    """
    Creates a time series plot showing profiler deployment frequency over time.

    Args:
        df (pd.DataFrame): DataFrame containing 'date' column.
        region_name (str, optional): The name of the region for the plot title.

    Returns:
        plotly.graph_objs._figure.Figure: A Plotly figure object.
    """
    if df.empty or 'date' not in df.columns:
        return None

    df_copy = df.copy()
    df_copy['date'] = pd.to_datetime(df_copy['date'], errors='coerce')
    df_copy = df_copy.dropna(subset=['date'])
    
    if df_copy.empty:
        return None

    df_copy['year_month'] = df_copy['date'].dt.to_period('M').astype(str)
    monthly_counts = df_copy['year_month'].value_counts().sort_index()

    title = "Profiler Deployment Frequency Over Time"
    if region_name:
        title += f" in {region_name}"

    fig = px.line(
        x=monthly_counts.index,
        y=monthly_counts.values,
        title=title,
        labels={"x": "Date (Year-Month)", "y": "Number of Deployments"},
        template="plotly_dark"
    )
    
    fig.update_layout(
        xaxis_title="Date (Year-Month)",
        yaxis_title="Number of Deployments",
        xaxis_tickangle=45
    )
    
    return fig

def create_profiler_dashboard(df: pd.DataFrame, region_name: str = None):
    """
    Creates a comprehensive dashboard with multiple visualizations.

    Args:
        df (pd.DataFrame): DataFrame containing oceanographic profiler data.
        region_name (str, optional): The name of the region for the plot title.

    Returns:
        plotly.graph_objs._figure.Figure: A Plotly figure object with subplots.
    """
    if df.empty:
        return None

    fig = make_subplots(
        rows=2, cols=2,
        subplot_titles=('Profiler Types', 'Monthly Distribution', 'Geographic Distribution', 'Institution Distribution'),
        specs=[[{"type": "bar"}, {"type": "bar"}],
               [{"type": "scatter"}, {"type": "pie"}]],
        vertical_spacing=0.12,
        horizontal_spacing=0.1
    )

    if 'profiler' in df.columns:
        profiler_counts = df['profiler'].value_counts().head(8)
        profiler_labels = [label[:20] + '...' if len(label) > 20 else label 
                          for label in profiler_counts.index]
        
        fig.add_trace(
            go.Bar(x=profiler_counts.values, y=profiler_labels, 
                   orientation='h', name="Profilers",
                   marker_color='lightblue'),
            row=1, col=1
        )
    if 'Month' in df.columns:
        month_order = ["January", "February", "March", "April", "May", "June", 
                       "July", "August", "September", "October", "November", "December"]
        monthly_counts = df['Month'].value_counts()
        monthly_counts = monthly_counts.reindex([m for m in month_order if m in monthly_counts.index])
        
        fig.add_trace(
            go.Bar(x=monthly_counts.index, y=monthly_counts.values,
                   name="Monthly", marker_color='lightgreen'),
            row=1, col=2
        )
    
    if 'latitude' in df.columns and 'longitude' in df.columns:
        fig.add_trace(
            go.Scatter(x=df['longitude'], y=df['latitude'],
                      mode='markers', name="Locations",
                      marker=dict(size=4, opacity=0.6, color='orange')),
            row=2, col=1
        )

    if 'institution' in df.columns:
        institution_counts = df['institution'].value_counts().head(6)
        
        fig.add_trace(
            go.Pie(values=institution_counts.values, labels=institution_counts.index,
                   name="Institutions"),
            row=2, col=2
        )

    title = "Oceanographic Profiler Data Dashboard"
    if region_name:
        title += f" - {region_name}"
        
    fig.update_layout(
        title_text=title,
        showlegend=False,
        template="plotly_dark",
        height=800
    )

    return fig

if __name__ == '__main__':
    print("🌊 Plotly Oceanographic Profiler Visualization Module")
    print("=" * 50)
    print(" Available plotting functions:")
    print("• create_profiler_distribution_plot()")
    print("• create_monthly_distribution_plot()")
    print("• create_geographic_scatter_plot()")
    print("• create_institution_pie_chart()")
    print("• create_time_series_plot()")
    print("• create_profiler_dashboard()")
    print("• create_temperature_boxplot() [alias for dashboard]")
    
    sample_data = {
        'Month': ['January', 'February', 'March', 'January', 'February', 'March'],
        'profiler': ['Teledyne Webb Research float', 'APEX float', 'Teledyne Webb Research float', 
                    'APEX float', 'Teledyne Webb Research float', 'APEX float'],
        'latitude': [-30.5, -31.2, -29.8, -30.1, -31.5, -29.2],
        'longitude': [85.3, 86.1, 84.7, 85.8, 86.3, 84.2],
        'institution': ['AOML, USA', 'CSIRO, Australia', 'AOML, USA', 'CSIRO, Australia', 'AOML, USA', 'CSIRO, Australia'],
        'regions': ['Indian Ocean'] * 6
    }
    sample_df = pd.DataFrame(sample_data)
    
    print(f"\n Module loaded successfully with sample data ({len(sample_df)} records)")
    print(" To test: call any plotting function with the sample_df")