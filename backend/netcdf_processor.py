import os
import sys
import xarray as xr
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import logging
from pathlib import Path
import netCDF4 as nc4

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ARGONetCDFProcessor:
    """
    Processes ARGO NetCDF files and converts them to structured formats
    """
    
    def __init__(self, output_dir: str = "processed_data"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        # ARGO variable mappings
        self.argo_variables = {
            'TEMP': 'temperature',
            'PSAL': 'salinity', 
            'PRES': 'pressure',
            'LATITUDE': 'latitude',
            'LONGITUDE': 'longitude',
            'JULD': 'julian_day',
            'PLATFORM_NUMBER': 'platform_number',
            'CYCLE_NUMBER': 'cycle_number',
            'DIRECTION': 'direction',
            'DATA_MODE': 'data_mode',
            'POSITION_QC': 'position_qc',
            'TEMP_QC': 'temperature_qc',
            'PSAL_QC': 'salinity_qc',
            'PRES_QC': 'pressure_qc'
        }
        
        # Quality control flags
        self.qc_flags = {
            0: 'no_qc',
            1: 'good_data',
            2: 'probably_good_data', 
            3: 'probably_bad_data',
            4: 'bad_data',
            5: 'changed',
            6: 'not_used',
            7: 'estimated',
            8: 'missing',
            9: 'missing'
        }
    
    def process_netcdf_file(self, file_path: str) -> Dict:
        """
        Process a single ARGO NetCDF file
        
        Args:
            file_path: Path to the NetCDF file
            
        Returns:
            Dictionary containing processed data and metadata
        """
        try:
            logger.info(f"Processing NetCDF file: {file_path}")
            
            # Open NetCDF file
            with xr.open_dataset(file_path) as ds:
                # Extract metadata
                metadata = self._extract_metadata(ds)
                
                # Extract profile data
                profile_data = self._extract_profile_data(ds)
                
                # Extract trajectory data
                trajectory_data = self._extract_trajectory_data(ds)
                
                # Quality control filtering
                clean_data = self._apply_quality_control(profile_data)
                
                return {
                    'metadata': metadata,
                    'profile_data': clean_data,
                    'trajectory_data': trajectory_data,
                    'file_path': file_path,
                    'processing_time': datetime.now().isoformat()
                }
                
        except Exception as e:
            logger.error(f"Error processing {file_path}: {str(e)}")
            return None
    
    def _extract_metadata(self, ds: xr.Dataset) -> Dict:
        """Extract metadata from NetCDF dataset"""
        metadata = {}
        
        # Global attributes
        for attr in ds.attrs:
            metadata[attr.lower()] = ds.attrs[attr]
        
        # Platform information
        if 'PLATFORM_NUMBER' in ds.variables:
            platform_num = ds['PLATFORM_NUMBER'].values
            if platform_num.size > 0:
                metadata['platform_number'] = str(platform_num[0]).zfill(9)
        
        # Date information
        if 'JULD' in ds.variables:
            julian_days = ds['JULD'].values
            if julian_days.size > 0:
                # Convert Julian day to datetime
                ref_date = datetime(1950, 1, 1)
                dates = [ref_date + timedelta(days=float(jd)) for jd in julian_days if not np.isnan(jd)]
                metadata['date_range'] = {
                    'start': min(dates).isoformat() if dates else None,
                    'end': max(dates).isoformat() if dates else None
                }
        
        # Geographic bounds
        if 'LATITUDE' in ds.variables and 'LONGITUDE' in ds.variables:
            lat = ds['LATITUDE'].values
            lon = ds['LONGITUDE'].values
            
            valid_lat = lat[~np.isnan(lat)]
            valid_lon = lon[~np.isnan(lon)]
            
            if len(valid_lat) > 0 and len(valid_lon) > 0:
                metadata['geographic_bounds'] = {
                    'min_latitude': float(np.min(valid_lat)),
                    'max_latitude': float(np.max(valid_lat)),
                    'min_longitude': float(np.min(valid_lon)),
                    'max_longitude': float(np.max(valid_lon))
                }
        
        return metadata
    
    def _extract_profile_data(self, ds: xr.Dataset) -> pd.DataFrame:
        """Extract profile data from NetCDF dataset"""
        profile_data = []
        
        # Get dimensions
        n_profiles = ds.dims.get('N_PROF', 0)
        n_levels = ds.dims.get('N_LEVELS', 0)
        
        if n_profiles == 0 or n_levels == 0:
            return pd.DataFrame()
        
        # Extract variables
        for prof_idx in range(n_profiles):
            profile = {}
            
            # Basic info
            profile['profile_index'] = prof_idx
            
            # Position
            if 'LATITUDE' in ds.variables:
                lat = ds['LATITUDE'].values[prof_idx]
                profile['latitude'] = float(lat) if not np.isnan(lat) else None
            
            if 'LONGITUDE' in ds.variables:
                lon = ds['LONGITUDE'].values[prof_idx]
                profile['longitude'] = float(lon) if not np.isnan(lon) else None
            
            # Date
            if 'JULD' in ds.variables:
                julian_day = ds['JULD'].values[prof_idx]
                if not np.isnan(julian_day):
                    ref_date = datetime(1950, 1, 1)
                    profile['date'] = (ref_date + timedelta(days=float(julian_day))).isoformat()
            
            # Platform info
            if 'PLATFORM_NUMBER' in ds.variables:
                platform = ds['PLATFORM_NUMBER'].values[prof_idx]
                profile['platform_number'] = str(platform).zfill(9) if not np.isnan(platform) else None
            
            if 'CYCLE_NUMBER' in ds.variables:
                cycle = ds['CYCLE_NUMBER'].values[prof_idx]
                profile['cycle_number'] = int(cycle) if not np.isnan(cycle) else None
            
            # Oceanographic variables
            for var_name, standard_name in self.argo_variables.items():
                if var_name in ds.variables:
                    var_data = ds[var_name].values
                    if var_data.ndim > 1: # Profile data
                        profile_values = var_data[prof_idx, :]
                        # Take first valid value for summary
                        valid_values = profile_values[~np.isnan(profile_values)]
                        if len(valid_values) > 0:
                            profile[standard_name] = float(valid_values[0])
                    else: # Single value per profile
                        value = var_data[prof_idx] if prof_idx < len(var_data) else None
                        if value is not None and not np.isnan(value):
                            profile[standard_name] = float(value)
            
            # Quality control
            for qc_var in ['POSITION_QC', 'TEMP_QC', 'PSAL_QC', 'PRES_QC']:
                if qc_var in ds.variables:
                    qc_data = ds[qc_var].values
                    if qc_data.ndim > 1:
                        qc_values = qc_data[prof_idx, :]
                        valid_qc = qc_values[~np.isnan(qc_values)]
                        if len(valid_qc) > 0:
                            profile[qc_var.lower()] = int(valid_qc[0])
                    else:
                        if prof_idx < len(qc_data) and not np.isnan(qc_data[prof_idx]):
                            profile[qc_var.lower()] = int(qc_data[prof_idx])
            
            profile_data.append(profile)
        
        return pd.DataFrame(profile_data)
    
    def _extract_trajectory_data(self, ds: xr.Dataset) -> pd.DataFrame:
        """Extract trajectory data for mapping"""
        trajectory_data = []
        
        if 'LATITUDE' in ds.variables and 'LONGITUDE' in ds.variables:
            lats = ds['LATITUDE'].values
            lons = ds['LONGITUDE'].values
            
            for i, (lat, lon) in enumerate(zip(lats, lons)):
                if not np.isnan(lat) and not np.isnan(lon):
                    point = {
                        'point_index': i,
                        'latitude': float(lat),
                        'longitude': float(lon)
                    }
                    
                    # Add date if available
                    if 'JULD' in ds.variables:
                        julian_day = ds['JULD'].values[i]
                        if not np.isnan(julian_day):
                            ref_date = datetime(1950, 1, 1)
                            point['date'] = (ref_date + timedelta(days=float(julian_day))).isoformat()
                    
                    trajectory_data.append(point)
        
        return pd.DataFrame(trajectory_data)
    
    def _apply_quality_control(self, df: pd.DataFrame) -> pd.DataFrame:
        """Apply quality control filtering to the data"""
        if df.empty:
            return df
        
        # Filter out bad quality data
        qc_columns = [col for col in df.columns if col.endswith('_qc')]
        
        for qc_col in qc_columns:
            if qc_col in df.columns:
                # Keep only good and probably good data (QC flags 1 and 2)
                df = df[df[qc_col].isin([1, 2, np.nan])]
        
        # Remove rows with missing essential data
        essential_cols = ['latitude', 'longitude']
        for col in essential_cols:
            if col in df.columns:
                df = df[df[col].notna()]
        
        return df
    
    def convert_to_parquet(self, processed_data: Dict, output_filename: str = None) -> str:
        """Convert processed data to Parquet format"""
        if not processed_data or 'profile_data' not in processed_data:
            return None
        
        if output_filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_filename = f"argo_data_{timestamp}.parquet"
        
        output_path = self.output_dir / output_filename
        
        try:
            # Convert profile data to Parquet
            df = processed_data['profile_data']
            df.to_parquet(output_path, index=False)
            
            logger.info(f"Data saved to Parquet: {output_path}")
            return str(output_path)
            
        except Exception as e:
            logger.error(f"Error saving to Parquet: {str(e)}")
            return None
    
    def convert_to_csv(self, processed_data: Dict, output_filename: str = None) -> str:
        """Convert processed data to CSV format"""
        if not processed_data or 'profile_data' not in processed_data:
            return None
        
        if output_filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_filename = f"argo_data_{timestamp}.csv"
        
        output_path = self.output_dir / output_filename
        
        try:
            # Convert profile data to CSV
            df = processed_data['profile_data']
            df.to_csv(output_path, index=False)
            
            logger.info(f"Data saved to CSV: {output_path}")
            return str(output_path)
            
        except Exception as e:
            logger.error(f"Error saving to CSV: {str(e)}")
            return None
    
    def process_directory(self, directory_path: str, pattern: str = "*.nc") -> List[Dict]:
        """Process all NetCDF files in a directory"""
        directory = Path(directory_path)
        netcdf_files = list(directory.glob(pattern))
        
        processed_files = []
        
        for file_path in netcdf_files:
            logger.info(f"Processing: {file_path.name}")
            result = self.process_netcdf_file(str(file_path))
            if result:
                processed_files.append(result)
        
        return processed_files
    
    def create_summary_report(self, processed_files: List[Dict]) -> Dict:
        """Create a summary report of processed files"""
        if not processed_files:
            return {}
        
        total_profiles = sum(len(f['profile_data']) for f in processed_files)
        total_trajectory_points = sum(len(f['trajectory_data']) for f in processed_files)
        
        # Geographic coverage
        all_lats = []
        all_lons = []
        
        for file_data in processed_files:
            if 'profile_data' in file_data and not file_data['profile_data'].empty:
                df = file_data['profile_data']
                if 'latitude' in df.columns:
                    all_lats.extend(df['latitude'].dropna().tolist())
                if 'longitude' in df.columns:
                    all_lons.extend(df['longitude'].dropna().tolist())
        
        summary = {
            'total_files_processed': len(processed_files),
            'total_profiles': total_profiles,
            'total_trajectory_points': total_trajectory_points,
            'geographic_coverage': {
                'min_latitude': min(all_lats) if all_lats else None,
                'max_latitude': max(all_lats) if all_lats else None,
                'min_longitude': min(all_lons) if all_lons else None,
                'max_longitude': max(all_lons) if all_lons else None
            },
            'processing_timestamp': datetime.now().isoformat()
        }
        
        return summary
def main():
    """Example usage of the NetCDF processor"""
    processor = ARGONetCDFProcessor() 
   #  Example: Process a single file
   #  result = processor.process_netcdf_file("path/to/argo_file.nc")
    # if result:
     #    processor.convert_to_parquet(result)
      #   processor.convert_to_csv(result)
    
     #Example: Process a directory
   # results = processor.process_directory("path/to/netcdf/files/")
     #summary = processor.create_summary_report(results)
     #print(f"Processed {summary['total_files_processed']} files")
    print(" ARGO NetCDF Processor initialized")
    print(" Output directory:", processor.output_dir)
    print(" Ready to process NetCDF files")

if __name__ == "__main__":
    main()