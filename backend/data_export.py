"""
Data Export Module for ARGO Ocean Data
Supports export to ASCII, NetCDF, CSV, JSON, and other formats
"""

import os
import json
import csv
import pandas as pd
import numpy as np
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any, Union
import logging
import xarray as xr
import netCDF4 as nc4

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ARGODataExporter:
    """
    Comprehensive data exporter for ARGO ocean data
    Supports multiple output formats including NetCDF, ASCII, CSV, JSON
    """
    
    def __init__(self, output_dir: str = "exports"):
        """
        Initialize the data exporter
        
        Args:
            output_dir: Directory to save exported files
        """
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        # ARGO variable mappings for NetCDF export
        self.argo_variables = {
            'temperature': 'TEMP',
            'salinity': 'PSAL',
            'pressure': 'PRES',
            'latitude': 'LATITUDE',
            'longitude': 'LONGITUDE',
            'platform_number': 'PLATFORM_NUMBER',
            'cycle_number': 'CYCLE_NUMBER',
            'date': 'JULD'
        }
        
        # Quality control mappings
        self.qc_mappings = {
            'position_qc': 'POSITION_QC',
            'temperature_qc': 'TEMP_QC',
            'salinity_qc': 'PSAL_QC',
            'pressure_qc': 'PRES_QC'
        }
    
    def export_to_csv(self, 
                     df: pd.DataFrame, 
                     filename: str = None,
                     include_metadata: bool = True) -> str:
        """
        Export DataFrame to CSV format
        
        Args:
            df: DataFrame to export
            filename: Output filename (optional)
            include_metadata: Include metadata header
            
        Returns:
            Path to exported file
        """
        if df.empty:
            logger.warning("Empty DataFrame provided for CSV export")
            return None
        
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"argo_data_{timestamp}.csv"
        
        output_path = self.output_dir / filename
        
        try:
            # Prepare data for export
            export_df = df.copy()
            
            # Convert datetime columns to string
            for col in export_df.columns:
                if export_df[col].dtype == 'datetime64[ns]':
                    export_df[col] = export_df[col].dt.strftime('%Y-%m-%d %H:%M:%S')
                elif 'datetime' in str(export_df[col].dtype):
                    export_df[col] = export_df[col].astype(str)
            
            # Write CSV with metadata header if requested
            with open(output_path, 'w', newline='', encoding='utf-8') as f:
                if include_metadata:
                    # Write metadata header
                    f.write(f"# ARGO Ocean Data Export\n")
                    f.write(f"# Generated: {datetime.now().isoformat()}\n")
                    f.write(f"# Total Records: {len(export_df)}\n")
                    f.write(f"# Columns: {', '.join(export_df.columns)}\n")
                    f.write(f"#\n")
                
                # Write data
                export_df.to_csv(f, index=False)
            
            logger.info(f"Data exported to CSV: {output_path}")
            return str(output_path)
            
        except Exception as e:
            logger.error(f"Error exporting to CSV: {e}")
            return None
    
    def export_to_ascii(self, 
                       df: pd.DataFrame, 
                       filename: str = None,
                       format_type: str = 'space_delimited') -> str:
        """
        Export DataFrame to ASCII format
        
        Args:
            df: DataFrame to export
            filename: Output filename (optional)
            format_type: ASCII format ('space_delimited', 'comma_delimited', 'fixed_width')
            
        Returns:
            Path to exported file
        """
        if df.empty:
            logger.warning("Empty DataFrame provided for ASCII export")
            return None
        
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"argo_data_{timestamp}.txt"
        
        output_path = self.output_dir / filename
        
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                # Write header
                f.write(f"ARGO Ocean Data Export\n")
                f.write(f"Generated: {datetime.now().isoformat()}\n")
                f.write(f"Total Records: {len(df)}\n")
                f.write(f"Columns: {', '.join(df.columns)}\n")
                f.write("=" * 80 + "\n\n")
                
                # Write column headers
                if format_type == 'space_delimited':
                    f.write(" ".join(f"{col:>12}" for col in df.columns) + "\n")
                    f.write(" ".join("-" * 12 for _ in df.columns) + "\n")
                elif format_type == 'comma_delimited':
                    f.write(",".join(df.columns) + "\n")
                elif format_type == 'fixed_width':
                    # Calculate column widths
                    col_widths = {}
                    for col in df.columns:
                        col_widths[col] = max(len(str(col)), df[col].astype(str).str.len().max())
                    
                    # Write headers
                    f.write("".join(f"{col:>{col_widths[col]}} " for col in df.columns) + "\n")
                    f.write("".join("-" * col_widths[col] + " " for col in df.columns) + "\n")
                
                # Write data rows
                for _, row in df.iterrows():
                    if format_type == 'space_delimited':
                        f.write(" ".join(f"{str(val):>12}" for val in row.values) + "\n")
                    elif format_type == 'comma_delimited':
                        f.write(",".join(str(val) for val in row.values) + "\n")
                    elif format_type == 'fixed_width':
                        f.write("".join(f"{str(val):>{col_widths[col]}} " 
                                      for col, val in zip(df.columns, row.values)) + "\n")
            
            logger.info(f"Data exported to ASCII: {output_path}")
            return str(output_path)
            
        except Exception as e:
            logger.error(f"Error exporting to ASCII: {e}")
            return None
    
    def export_to_netcdf(self, 
                        df: pd.DataFrame, 
                        filename: str = None,
                        metadata: Dict = None) -> str:
        """
        Export DataFrame to NetCDF format following ARGO standards
        
        Args:
            df: DataFrame to export
            filename: Output filename (optional)
            metadata: Additional metadata to include
            
        Returns:
            Path to exported file
        """
        if df.empty:
            logger.warning("Empty DataFrame provided for NetCDF export")
            return None
        
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"argo_data_{timestamp}.nc"
        
        output_path = self.output_dir / filename
        
        try:
            # Create xarray Dataset
            ds = xr.Dataset()
            
            # Add dimensions
            n_profiles = len(df)
            n_levels = 1  # For now, single level per profile
            
            ds = ds.expand_dims({'N_PROF': n_profiles, 'N_LEVELS': n_levels})
            
            # Add variables
            for col, argo_var in self.argo_variables.items():
                if col in df.columns:
                    data = df[col].values
                    
                    # Handle different data types
                    if col == 'date':
                        # Convert to Julian days
                        dates = pd.to_datetime(data)
                        ref_date = datetime(1950, 1, 1)
                        julian_days = [(d - ref_date).days + (d - ref_date).seconds / 86400 
                                     for d in dates]
                        data = np.array(julian_days)
                    
                    # Add to dataset
                    if col in ['latitude', 'longitude', 'platform_number', 'cycle_number', 'date']:
                        # Single value per profile
                        ds[argo_var] = (['N_PROF'], data.reshape(-1, 1)[:, 0])
                    else:
                        # Profile data (expand to N_LEVELS)
                        data_2d = np.tile(data.reshape(-1, 1), (1, n_levels))
                        ds[argo_var] = (['N_PROF', 'N_LEVELS'], data_2d)
            
            # Add quality control variables
            for col, qc_var in self.qc_mappings.items():
                if col in df.columns:
                    data = df[col].values
                    data_2d = np.tile(data.reshape(-1, 1), (1, n_levels))
                    ds[qc_var] = (['N_PROF', 'N_LEVELS'], data_2d)
            
            # Add global attributes
            ds.attrs.update({
                'title': 'ARGO Ocean Data Export',
                'institution': 'NeptuneAI Ocean Intelligence Platform',
                'source': 'ARGO profiling floats',
                'history': f'Created by NeptuneAI on {datetime.now().isoformat()}',
                'Conventions': 'CF-1.6',
                'featureType': 'trajectoryProfile'
            })
            
            # Add custom metadata
            if metadata:
                ds.attrs.update(metadata)
            
            # Save to NetCDF
            ds.to_netcdf(output_path)
            
            logger.info(f"Data exported to NetCDF: {output_path}")
            return str(output_path)
            
        except Exception as e:
            logger.error(f"Error exporting to NetCDF: {e}")
            return None
    
    def export_to_json(self, 
                      df: pd.DataFrame, 
                      filename: str = None,
                      include_metadata: bool = True) -> str:
        """
        Export DataFrame to JSON format
        
        Args:
            df: DataFrame to export
            filename: Output filename (optional)
            include_metadata: Include metadata in export
            
        Returns:
            Path to exported file
        """
        if df.empty:
            logger.warning("Empty DataFrame provided for JSON export")
            return None
        
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"argo_data_{timestamp}.json"
        
        output_path = self.output_dir / filename
        
        try:
            # Prepare data
            export_data = {
                'metadata': {
                    'export_timestamp': datetime.now().isoformat(),
                    'total_records': len(df),
                    'columns': list(df.columns),
                    'data_types': {col: str(dtype) for col, dtype in df.dtypes.items()}
                } if include_metadata else {},
                'data': df.to_dict('records')
            }
            
            # Write JSON
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(export_data, f, indent=2, default=str)
            
            logger.info(f"Data exported to JSON: {output_path}")
            return str(output_path)
            
        except Exception as e:
            logger.error(f"Error exporting to JSON: {e}")
            return None
    
    def export_to_parquet(self, 
                         df: pd.DataFrame, 
                         filename: str = None) -> str:
        """
        Export DataFrame to Parquet format
        
        Args:
            df: DataFrame to export
            filename: Output filename (optional)
            
        Returns:
            Path to exported file
        """
        if df.empty:
            logger.warning("Empty DataFrame provided for Parquet export")
            return None
        
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"argo_data_{timestamp}.parquet"
        
        output_path = self.output_dir / filename
        
        try:
            df.to_parquet(output_path, index=False)
            logger.info(f"Data exported to Parquet: {output_path}")
            return str(output_path)
            
        except Exception as e:
            logger.error(f"Error exporting to Parquet: {e}")
            return None
    
    def export_visualization_data(self, 
                                fig, 
                                filename: str = None,
                                format_type: str = 'html') -> str:
        """
        Export Plotly figure to various formats
        
        Args:
            fig: Plotly figure object
            filename: Output filename (optional)
            format_type: Export format ('html', 'png', 'pdf', 'svg')
            
        Returns:
            Path to exported file
        """
        if fig is None:
            logger.warning("No figure provided for export")
            return None
        
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"argo_visualization_{timestamp}.{format_type}"
        
        output_path = self.output_dir / filename
        
        try:
            if format_type == 'html':
                fig.write_html(str(output_path))
            elif format_type == 'png':
                fig.write_image(str(output_path))
            elif format_type == 'pdf':
                fig.write_image(str(output_path))
            elif format_type == 'svg':
                fig.write_image(str(output_path))
            else:
                raise ValueError(f"Unsupported format: {format_type}")
            
            logger.info(f"Visualization exported to {format_type.upper()}: {output_path}")
            return str(output_path)
            
        except Exception as e:
            logger.error(f"Error exporting visualization: {e}")
            return None
    
    def create_export_package(self, 
                            df: pd.DataFrame,
                            visualizations: List[Any] = None,
                            package_name: str = None) -> str:
        """
        Create a comprehensive export package with data and visualizations
        
        Args:
            df: DataFrame to export
            visualizations: List of Plotly figures
            package_name: Name for the export package
            
        Returns:
            Path to the export package directory
        """
        if package_name is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            package_name = f"argo_export_{timestamp}"
        
        package_dir = self.output_dir / package_name
        package_dir.mkdir(exist_ok=True)
        
        try:
            # Export data in multiple formats
            self.export_to_csv(df, str(package_dir / "data.csv"))
            self.export_to_ascii(df, str(package_dir / "data.txt"))
            self.export_to_json(df, str(package_dir / "data.json"))
            self.export_to_parquet(df, str(package_dir / "data.parquet"))
            self.export_to_netcdf(df, str(package_dir / "data.nc"))
            
            # Export visualizations
            if visualizations:
                for i, fig in enumerate(visualizations):
                    if fig is not None:
                        self.export_visualization_data(
                            fig, 
                            str(package_dir / f"visualization_{i+1}.html")
                        )
            
            # Create README
            readme_path = package_dir / "README.txt"
            with open(readme_path, 'w') as f:
                f.write("ARGO Ocean Data Export Package\n")
                f.write("=" * 40 + "\n\n")
                f.write(f"Generated: {datetime.now().isoformat()}\n")
                f.write(f"Total Records: {len(df)}\n")
                f.write(f"Columns: {', '.join(df.columns)}\n\n")
                f.write("Files included:\n")
                f.write("- data.csv: CSV format data\n")
                f.write("- data.txt: ASCII format data\n")
                f.write("- data.json: JSON format data\n")
                f.write("- data.parquet: Parquet format data\n")
                f.write("- data.nc: NetCDF format data\n")
                if visualizations:
                    f.write(f"- visualization_*.html: Interactive visualizations\n")
            
            logger.info(f"Export package created: {package_dir}")
            return str(package_dir)
            
        except Exception as e:
            logger.error(f"Error creating export package: {e}")
            return None
    
    def get_export_stats(self) -> Dict[str, Any]:
        """Get statistics about exported files"""
        files = list(self.output_dir.glob("*"))
        
        stats = {
            'total_files': len(files),
            'total_size_mb': sum(f.stat().st_size for f in files) / (1024 * 1024),
            'file_types': {},
            'recent_exports': []
        }
        
        # Count file types
        for file in files:
            ext = file.suffix.lower()
            stats['file_types'][ext] = stats['file_types'].get(ext, 0) + 1
        
        # Get recent exports
        recent_files = sorted(files, key=lambda x: x.stat().st_mtime, reverse=True)[:10]
        stats['recent_exports'] = [
            {
                'filename': f.name,
                'size_mb': f.stat().st_size / (1024 * 1024),
                'modified': datetime.fromtimestamp(f.stat().st_mtime).isoformat()
            }
            for f in recent_files
        ]
        
        return stats

def main():
    """Example usage of the data exporter"""
    exporter = ARGODataExporter()
    
    # Create sample data
    sample_data = {
        'latitude': np.random.uniform(-40, 25, 50),
        'longitude': np.random.uniform(40, 120, 50),
        'temperature': np.random.uniform(15, 30, 50),
        'salinity': np.random.uniform(33, 37, 50),
        'pressure': np.random.uniform(0, 2000, 50),
        'platform_number': [f'ARGO_{i:06d}' for i in range(50)],
        'date': pd.date_range('2023-01-01', periods=50, freq='D').strftime('%Y-%m-%d')
    }
    
    df = pd.DataFrame(sample_data)
    
    # Export in different formats
    csv_path = exporter.export_to_csv(df)
    ascii_path = exporter.export_to_ascii(df)
    json_path = exporter.export_to_json(df)
    netcdf_path = exporter.export_to_netcdf(df)
    
    # Get export statistics
    stats = exporter.get_export_stats()
    print(f"Export statistics: {stats}")
    
    print("🌊 ARGO Data Exporter initialized")
    print("📁 Output directory:", exporter.output_dir)
    print("🔧 Supported formats: CSV, ASCII, JSON, NetCDF, Parquet, HTML")

if __name__ == "__main__":
    main()