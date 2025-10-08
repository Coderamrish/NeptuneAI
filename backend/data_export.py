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
# The 'netCDF4' library is used by xarray's engine, so it's good to have it imported
# but not directly used in this class. You could also handle it as an optional dependency.
import netCDF4 as nc4 

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ARGODataExporter:
    """
    Comprehensive data exporter for ARGO ocean data.
    Supports multiple output formats including NetCDF, ASCII, CSV, JSON, and Parquet.
    """

    def __init__(self, output_dir: str = "exports"):
        """
        Initialize the data exporter.

        Args:
            output_dir: Directory to save exported files.
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
                     include_metadata: bool = True) -> Optional[str]:
        """
        Export DataFrame to CSV format.

        Args:
            df: DataFrame to export.
            filename: Output filename (optional).
            include_metadata: Include metadata header.

        Returns:
            Path to the exported file, or None if an error occurs.
        """
        if df.empty:
            logger.warning("Empty DataFrame provided for CSV export. No file created.")
            return None

        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"argo_data_{timestamp}.csv"

        output_path = self.output_dir / filename

        try:
            export_df = df.copy()

            # Convert datetime columns to string for consistent CSV output
            for col in export_df.select_dtypes(include=['datetime64[ns]']).columns:
                export_df[col] = export_df[col].dt.strftime('%Y-%m-%d %H:%M:%S')

            with open(output_path, 'w', newline='', encoding='utf-8') as f:
                if include_metadata:
                    f.write("# ARGO Ocean Data Export\n")
                    f.write(f"# Generated: {datetime.now().isoformat()}\n")
                    f.write(f"# Total Records: {len(export_df)}\n")
                    f.write(f"# Columns: {', '.join(export_df.columns)}\n")
                    f.write("#\n")

                export_df.to_csv(f, index=False)

            logger.info(f"Data successfully exported to CSV: {output_path}")
            return str(output_path)

        except Exception as e:
            logger.error(f"Failed to export to CSV: {e}")
            return None

    def export_to_ascii(self,
                       df: pd.DataFrame,
                       filename: str = None,
                       format_type: str = 'space_delimited') -> Optional[str]:
        """
        Export DataFrame to a human-readable ASCII format.

        Args:
            df: DataFrame to export.
            filename: Output filename (optional).
            format_type: ASCII format ('space_delimited', 'comma_delimited', 'fixed_width').

        Returns:
            Path to the exported file, or None if an error occurs.
        """
        if df.empty:
            logger.warning("Empty DataFrame provided for ASCII export. No file created.")
            return None

        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"argo_data_{timestamp}.txt"

        output_path = self.output_dir / filename

        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                # Write metadata header
                f.write("ARGO Ocean Data Export\n")
                f.write(f"Generated: {datetime.now().isoformat()}\n")
                f.write(f"Total Records: {len(df)}\n")
                f.write(f"Columns: {', '.join(df.columns)}\n")
                f.write("=" * 80 + "\n\n")

                # Export data
                if format_type == 'space_delimited':
                    f.write(df.to_string(index=False))
                elif format_type == 'comma_delimited':
                    f.write(df.to_csv(index=False))
                elif format_type == 'fixed_width':
                    # A more robust way to handle fixed-width
                    df_str = df.astype(str)
                    col_widths = {col: max(len(col), df_str[col].str.len().max()) for col in df_str.columns}
                    header = "".join([f"{col:{width}} " for col, width in col_widths.items()])
                    f.write(header + "\n")
                    f.write("".join(["-" * width + " " for width in col_widths.values()]) + "\n")
                    for _, row in df_str.iterrows():
                        f.write("".join([f"{row[col]:{col_widths[col]}} " for col in df_str.columns]) + "\n")
                else:
                    raise ValueError(f"Unsupported ASCII format_type: {format_type}")


            logger.info(f"Data successfully exported to ASCII: {output_path}")
            return str(output_path)

        except Exception as e:
            logger.error(f"Failed to export to ASCII: {e}")
            return None

    def export_to_netcdf(self,
                        df: pd.DataFrame,
                        filename: str = None,
                        metadata: Dict = None) -> Optional[str]:
        """
        Export DataFrame to NetCDF format following ARGO standards.

        Args:
            df: DataFrame to export.
            filename: Output filename (optional).
            metadata: Additional global attributes to include.

        Returns:
            Path to the exported file, or None if an error occurs.
        """
        if df.empty:
            logger.warning("Empty DataFrame provided for NetCDF export. No file created.")
            return None

        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"argo_data_{timestamp}.nc"

        output_path = self.output_dir / filename

        try:
            # Create an xarray Dataset from the pandas DataFrame
            # Using the index for the 'N_PROF' dimension
            ds = xr.Dataset.from_dataframe(df.set_index(pd.Index(range(len(df)), name='N_PROF')))

            # Add global attributes
            ds.attrs.update({
                'title': 'ARGO Ocean Data Export',
                'institution': 'NeptuneAI Ocean Intelligence Platform',
                'source': 'ARGO profiling floats',
                'history': f'Created on {datetime.now().isoformat()}',
                'Conventions': 'CF-1.6',
                'featureType': 'trajectoryProfile'
            })

            if metadata:
                ds.attrs.update(metadata)

            # Save to NetCDF file
            ds.to_netcdf(output_path, engine='netcdf4')

            logger.info(f"Data successfully exported to NetCDF: {output_path}")
            return str(output_path)

        except Exception as e:
            logger.error(f"Failed to export to NetCDF: {e}")
            return None

    def export_to_json(self,
                      df: pd.DataFrame,
                      filename: str = None,
                      include_metadata: bool = True) -> Optional[str]:
        """
        Export DataFrame to JSON format.

        Args:
            df: DataFrame to export.
            filename: Output filename (optional).
            include_metadata: Include metadata in the JSON structure.

        Returns:
            Path to the exported file, or None if an error occurs.
        """
        if df.empty:
            logger.warning("Empty DataFrame provided for JSON export. No file created.")
            return None

        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"argo_data_{timestamp}.json"

        output_path = self.output_dir / filename

        try:
            export_dict = {}
            if include_metadata:
                export_dict['metadata'] = {
                    'export_timestamp': datetime.now().isoformat(),
                    'total_records': len(df),
                    'columns': list(df.columns),
                }
            
            # Use pandas built-in orient='records' for efficiency
            export_dict['data'] = df.to_dict(orient='records')

            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(export_dict, f, indent=4, default=str)

            logger.info(f"Data successfully exported to JSON: {output_path}")
            return str(output_path)

        except Exception as e:
            logger.error(f"Failed to export to JSON: {e}")
            return None

    def export_to_parquet(self,
                         df: pd.DataFrame,
                         filename: str = None) -> Optional[str]:
        """
        Export DataFrame to Parquet format.

        Args:
            df: DataFrame to export.
            filename: Output filename (optional).

        Returns:
            Path to the exported file, or None if an error occurs.
        """
        if df.empty:
            logger.warning("Empty DataFrame provided for Parquet export. No file created.")
            return None

        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"argo_data_{timestamp}.parquet"

        output_path = self.output_dir / filename

        try:
            df.to_parquet(output_path, index=False, engine='pyarrow')
            logger.info(f"Data successfully exported to Parquet: {output_path}")
            return str(output_path)

        except Exception as e:
            logger.error(f"Failed to export to Parquet: {e}")
            return None

    def export_visualization_data(self,
                                fig,
                                filename: str = None,
                                format_type: str = 'html') -> Optional[str]:
        """
        Export a Plotly figure to various formats.

        Args:
            fig: Plotly figure object.
            filename: Output filename (optional).
            format_type: Export format ('html', 'png', 'pdf', 'svg').

        Returns:
            Path to the exported file, or None if an error occurs.
        """
        if fig is None:
            logger.warning("No figure object provided for export. No file created.")
            return None

        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"argo_visualization_{timestamp}.{format_type}"

        output_path = self.output_dir / filename

        try:
            if format_type == 'html':
                fig.write_html(str(output_path))
            elif format_type in ['png', 'pdf', 'svg']:
                fig.write_image(str(output_path))
            else:
                raise ValueError(f"Unsupported format: {format_type}. Supported formats are 'html', 'png', 'pdf', 'svg'.")

            logger.info(f"Visualization successfully exported to {format_type.upper()}: {output_path}")
            return str(output_path)

        except Exception as e:
            logger.error(f"Failed to export visualization: {e}")
            return None

    def create_export_package(self,
                            df: pd.DataFrame,
                            visualizations: Optional[List[Any]] = None,
                            package_name: str = None) -> Optional[str]:
        """
        Create a comprehensive export package with data and visualizations.

        Args:
            df: DataFrame to export.
            visualizations: List of Plotly figures to include.
            package_name: Name for the export package directory.

        Returns:
            Path to the export package directory, or None if an error occurs.
        """
        if package_name is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            package_name = f"argo_export_{timestamp}"

        package_dir = self.output_dir / package_name
        package_dir.mkdir(exist_ok=True)

        try:
            logger.info(f"Creating export package in: {package_dir}")
            # Export data in multiple formats
            self.export_to_csv(df, package_dir / "data.csv")
            self.export_to_json(df, package_dir / "data.json")
            self.export_to_parquet(df, package_dir / "data.parquet")
            self.export_to_netcdf(df, package_dir / "data.nc")

            # Export visualizations
            if visualizations:
                for i, fig in enumerate(visualizations):
                    if fig is not None:
                        self.export_visualization_data(
                            fig,
                            package_dir / f"visualization_{i+1}.html"
                        )

            # Create a README file
            readme_path = package_dir / "README.md"
            with open(readme_path, 'w', encoding='utf-8') as f:
                f.write(f"# ARGO Ocean Data Export Package\n\n")
                f.write(f"**Generated**: {datetime.now().isoformat()}\n")
                f.write(f"**Total Records**: {len(df)}\n")
                f.write(f"**Columns**: `{', '.join(df.columns)}`\n\n")
                f.write("## Files Included:\n")
                f.write("- `data.csv`: Comma-Separated Values format.\n")
                f.write("- `data.json`: JSON format.\n")
                f.write("- `data.parquet`: Apache Parquet format.\n")
                f.write("- `data.nc`: NetCDF format.\n")
                if visualizations:
                    f.write("- `visualization_*.html`: Interactive HTML visualizations.\n")

            logger.info(f"Export package created successfully: {package_dir}")
            return str(package_dir)

        except Exception as e:
            logger.error(f"Failed to create export package: {e}")
            return None

    def get_export_stats(self) -> Dict[str, Any]:
        """Get statistics about the files in the export directory."""
        files = list(self.output_dir.glob("**/*.*")) # Use glob to get files in subdirectories too

        stats = {
            'total_files': len(files),
            'total_size_mb': round(sum(f.stat().st_size for f in files if f.is_file()) / (1024 * 1024), 4),
            'file_types': {},
            'recent_exports': []
        }

        # Count file types
        for file in files:
            if file.is_file():
                ext = file.suffix.lower()
                stats['file_types'][ext] = stats['file_types'].get(ext, 0) + 1

        # Get 10 most recent exports
        recent_files = sorted([f for f in files if f.is_file()], key=lambda x: x.stat().st_mtime, reverse=True)[:10]
        stats['recent_exports'] = [
            {
                'filename': str(f.relative_to(self.output_dir)),
                'size_mb': round(f.stat().st_size / (1024 * 1024), 6),
                'modified': datetime.fromtimestamp(f.stat().st_mtime).isoformat()
            }
            for f in recent_files
        ]

        return stats

def main():
    """Example usage of the data exporter."""
    print("🌊 ARGO Data Exporter initialized")
    exporter = ARGODataExporter(output_dir="argo_exports")
    print(f"📁 Output directory set to: {exporter.output_dir.resolve()}")
    print("🔧 Supported formats: CSV, ASCII, JSON, NetCDF, Parquet, HTML")
    
    # Create sample data
    print("\nGenerating sample data...")
    sample_data = {
        'latitude': np.random.uniform(-40, 25, 50),
        'longitude': np.random.uniform(40, 120, 50),
        'temperature': np.random.uniform(15, 30, 50),
        'salinity': np.random.uniform(33, 37, 50),
        'pressure': np.random.uniform(0, 2000, 50),
        'platform_number': [f'ARGO_{i:06d}' for i in range(50)],
        'date': pd.to_datetime(pd.date_range('2023-01-01', periods=50, freq='D'))
    }
    df = pd.DataFrame(sample_data)
    print(f"Sample data created with {len(df)} records.")

    # --- Example 1: Export to individual formats ---
    print("\n--- Exporting to individual formats ---")
    exporter.export_to_csv(df)
    exporter.export_to_ascii(df)
    exporter.export_to_json(df)
    exporter.export_to_netcdf(df)
    exporter.export_to_parquet(df)

    # --- Example 2: Create a complete package ---
    # For this example, we create a dummy Plotly figure
    try:
        import plotly.express as px
        print("\n--- Creating a comprehensive export package ---")
        fig1 = px.scatter(df, x='longitude', y='latitude', color='temperature', title='Temperature Profile')
        exporter.create_export_package(df, visualizations=[fig1])
    except ImportError:
        logger.warning("Plotly is not installed. Skipping visualization export.")
        print("\n--- Creating a data-only export package ---")
        exporter.create_export_package(df)
    
    # --- Example 3: Get export statistics ---
    print("\n--- Displaying export statistics ---")
    stats = exporter.get_export_stats()
    print(json.dumps(stats, indent=2))
    print("\n✅ All examples executed.")


if __name__ == "__main__":
    main()