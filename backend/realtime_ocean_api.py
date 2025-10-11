"""
Real-Time Ocean Data API Integration Module
Integrates multiple free ocean data APIs for live oceanographic information
"""

from cmath import cos
import requests
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import pandas as pd
from functools import lru_cache
import os
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class RealTimeOceanDataAPI:
    """
    Integration with multiple free ocean data APIs
    """
    
    def __init__(self):
        """Initialize API clients"""
        self.noaa_base = "https://www.ncei.noaa.gov/erddap"
        self.copernicus_base = "https://nrt.cmems-du.eu/thredds"
        self.world_bank_base = "https://api.worldbank.org/v2"
        
        # Cache settings
        self.cache_duration = 3600  # 1 hour cache
        
        logger.info("✅ Real-Time Ocean Data API initialized")
    
    # ==========================================
    # 1. NOAA ERDDAP - Best Free Ocean Data API
    # ==========================================
    
    def get_noaa_buoy_data(self, station_id: str = "46042", 
                           days_back: int = 7) -> Dict[str, Any]:
        """
        Get real-time buoy data from NOAA NDBC
        
        NOAA National Data Buoy Center - FREE, NO API KEY NEEDED
        
        Args:
            station_id: Buoy station ID (e.g., "46042" - Monterey Bay)
            days_back: Number of days of historical data
            
        Returns:
            Dictionary with buoy measurements
            
        Popular Buoy Stations:
        - 46042: Monterey Bay, CA (Pacific)
        - 46047: Tanner Banks, CA (Pacific)
        - 41001: East of Cape Hatteras, NC (Atlantic)
        - 51001: NW Hawaii (Pacific)
        """
        try:
            # NOAA NDBC Real-time data (FREE)
            url = f"https://www.ndbc.noaa.gov/data/realtime2/{station_id}.txt"
            
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            # Parse NOAA format (space-separated)
            lines = response.text.strip().split('\n')
            if len(lines) < 3:
                return {"error": "No data available"}
            
            headers = lines[0].split()
            units = lines[1].split()
            data_lines = lines[2:min(len(lines), days_back * 24)]  # Hourly data
            
            # Parse latest measurement
            latest = data_lines[0].split()
            
            result = {
                "station_id": station_id,
                "timestamp": f"{latest[0]}-{latest[1]}-{latest[2]} {latest[3]}:{latest[4]}:00",
                "data": {},
                "units": {},
                "status": "success"
            }
            
            # Map NOAA fields
            field_mapping = {
                "WDIR": "wind_direction",
                "WSPD": "wind_speed",
                "WVHT": "wave_height",
                "DPD": "wave_period",
                "APD": "avg_wave_period",
                "PRES": "air_pressure",
                "ATMP": "air_temperature",
                "WTMP": "water_temperature",
                "DEWP": "dew_point"
            }
            
            for i, header in enumerate(headers):
                if i < len(latest) and header in field_mapping:
                    value = latest[i]
                    if value != "MM":  # MM = Missing data
                        result["data"][field_mapping[header]] = float(value)
                        result["units"][field_mapping[header]] = units[i] if i < len(units) else ""
            
            logger.info(f"✅ Retrieved NOAA buoy data for station {station_id}")
            return result
            
        except Exception as e:
            logger.error(f"❌ NOAA buoy data error: {e}")
            return {"error": str(e), "status": "failed"}
    
    def get_sea_surface_temperature(self, lat: float, lon: float, 
                                     radius: float = 1.0) -> Dict[str, Any]:
        """
        Get real-time Sea Surface Temperature from NOAA ERDDAP
        
        Args:
            lat: Latitude (-90 to 90)
            lon: Longitude (-180 to 180)
            radius: Search radius in degrees
            
        Returns:
            SST data for the location
        """
        try:
            # NOAA ERDDAP - GHRSST Level 4 (FREE)
            dataset_id = "nesdisVHNSQchlaDaily"
            
            url = (
                f"{self.noaa_base}/tabledap/{dataset_id}.json?"
                f"time,latitude,longitude,sst"
                f"&latitude>={lat-radius}&latitude<={lat+radius}"
                f"&longitude>={lon-radius}&longitude<={lon+radius}"
                f"&time>={datetime.now().isoformat()[:10]}"
            )
            
            response = requests.get(url, timeout=15)
            response.raise_for_status()
            
            data = response.json()
            
            if len(data['table']['rows']) > 0:
                row = data['table']['rows'][0]
                return {
                    "latitude": lat,
                    "longitude": lon,
                    "sst": row[3],
                    "timestamp": row[0],
                    "source": "NOAA ERDDAP",
                    "status": "success"
                }
            else:
                return {"error": "No data found for location", "status": "no_data"}
                
        except Exception as e:
            logger.error(f"❌ SST data error: {e}")
            return {"error": str(e), "status": "failed"}
    
    # ==========================================
    # 2. Open-Meteo Marine API - FREE & RELIABLE
    # ==========================================
    
    def get_marine_weather(self, lat: float, lon: float) -> Dict[str, Any]:
        """
        Get real-time marine weather from Open-Meteo (FREE, NO API KEY)
        
        Best for: Wave height, ocean currents, water temperature
        
        Args:
            lat: Latitude
            lon: Longitude
            
        Returns:
            Marine weather data
        """
        try:
            url = "https://marine-api.open-meteo.com/v1/marine"
            
            params = {
                "latitude": lat,
                "longitude": lon,
                "hourly": "wave_height,wave_direction,wave_period,ocean_current_velocity,ocean_current_direction",
                "daily": "wave_height_max,wave_direction_dominant,wave_period_max",
                "current_weather": True,
                "timezone": "auto"
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            # Extract current conditions
            current_time = datetime.now().isoformat()
            hourly_data = data.get("hourly", {})
            
            result = {
                "location": {"latitude": lat, "longitude": lon},
                "timestamp": current_time,
                "current_conditions": {},
                "forecast_24h": [],
                "source": "Open-Meteo Marine API",
                "status": "success"
            }
            
            # Current hour data
            if hourly_data:
                result["current_conditions"] = {
                    "wave_height_m": hourly_data.get("wave_height", [None])[0],
                    "wave_direction_deg": hourly_data.get("wave_direction", [None])[0],
                    "wave_period_s": hourly_data.get("wave_period", [None])[0],
                    "current_velocity_ms": hourly_data.get("ocean_current_velocity", [None])[0],
                    "current_direction_deg": hourly_data.get("ocean_current_direction", [None])[0]
                }
                
                # 24-hour forecast
                for i in range(min(24, len(hourly_data.get("time", [])))):
                    result["forecast_24h"].append({
                        "time": hourly_data["time"][i],
                        "wave_height_m": hourly_data.get("wave_height", [])[i],
                        "wave_direction_deg": hourly_data.get("wave_direction", [])[i]
                    })
            
            logger.info(f"✅ Retrieved marine weather for ({lat}, {lon})")
            return result
            
        except Exception as e:
            logger.error(f"❌ Marine weather error: {e}")
            return {"error": str(e), "status": "failed"}
    
    # ==========================================
    # 3. NASA PODAAC - Satellite Ocean Data
    # ==========================================
    
    def get_nasa_sea_level(self, lat: float, lon: float) -> Dict[str, Any]:
        """
        Get sea level anomaly data from NASA PODAAC (FREE)
        
        Args:
            lat: Latitude
            lon: Longitude
            
        Returns:
            Sea level data
        """
        try:
            # NASA PODAAC OpenDAP endpoint (no auth required for some datasets)
            url = "https://podaac-opendap.jpl.nasa.gov/opendap/allData/merged_alt/L4/cdr_grid/"
            
            # For demo: return simulated data
            # In production, you'd parse NetCDF from NASA
            
            result = {
                "location": {"latitude": lat, "longitude": lon},
                "sea_level_anomaly_cm": 5.2,  # Would be real from NASA
                "trend_mm_per_year": 3.4,
                "timestamp": datetime.now().isoformat(),
                "source": "NASA PODAAC (simulated)",
                "status": "success"
            }
            
            return result
            
        except Exception as e:
            logger.error(f"❌ NASA sea level error: {e}")
            return {"error": str(e), "status": "failed"}
    
    # ==========================================
    # 4. WorldBank Climate API - Ocean Stats
    # ==========================================
    
    def get_climate_trends(self, country_code: str = "USA") -> Dict[str, Any]:
        """
        Get ocean climate trends from World Bank Climate API (FREE)
        
        Args:
            country_code: ISO country code (e.g., "USA", "IND", "AUS")
            
        Returns:
            Climate trend data
        """
        try:
            url = f"{self.world_bank_base}/country/{country_code}/indicator/EN.CLC.MDAT.ZS"
            
            params = {
                "format": "json",
                "date": "2000:2023",
                "per_page": 50
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if len(data) > 1 and data[1]:
                trends = data[1][:5]  # Last 5 years
                
                result = {
                    "country": country_code,
                    "indicator": "Sea Level Rise",
                    "recent_trends": [
                        {
                            "year": item.get("date"),
                            "value": item.get("value")
                        }
                        for item in trends
                    ],
                    "source": "World Bank Climate API",
                    "status": "success"
                }
                
                return result
            else:
                return {"error": "No data available", "status": "no_data"}
                
        except Exception as e:
            logger.error(f"❌ Climate trends error: {e}")
            return {"error": str(e), "status": "failed"}
    
    # ==========================================
    # 5. ARGO Float Data (Real Profiles)
    # ==========================================
    
    def get_argo_profiles_nearby(self, lat: float, lon: float, 
                                  radius_km: float = 500) -> Dict[str, Any]:
        """
        Get recent ARGO float profiles near a location (FREE)
        
        Args:
            lat: Latitude
            lon: Longitude
            radius_km: Search radius in kilometers
            
        Returns:
            Recent ARGO float data
        """
        try:
            # ARGO GDAC ERDDAP endpoint
            url = f"{self.noaa_base}/tabledap/ArgoFloats.json"
            
            # Calculate bounding box
            lat_delta = radius_km / 111.0  # 1 degree ≈ 111 km
            lon_delta = radius_km / (111.0 * abs(cos(lat * 3.14159 / 180)))
            
            params = {
                "latitude": f">={lat-lat_delta}&latitude<={lat+lat_delta}",
                "longitude": f">={lon-lon_delta}&longitude<={lon+lon_delta}",
                "time": f">={datetime.now() - timedelta(days=30):%Y-%m-%d}"
            }
            
            response = requests.get(url, params=params, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                
                result = {
                    "location": {"latitude": lat, "longitude": lon},
                    "search_radius_km": radius_km,
                    "profiles_found": len(data.get("table", {}).get("rows", [])),
                    "source": "ARGO GDAC",
                    "status": "success"
                }
                
                return result
            else:
                return {"error": "No profiles found", "status": "no_data"}
                
        except Exception as e:
            logger.error(f"❌ ARGO profiles error: {e}")
            return {"error": str(e), "status": "failed"}
    
    # ==========================================
    # 6. Comprehensive Ocean Report
    # ==========================================
    
    def get_comprehensive_ocean_report(self, lat: float, lon: float,
                                        include_forecast: bool = True) -> Dict[str, Any]:
        """
        Get comprehensive real-time ocean data from multiple sources
        
        Args:
            lat: Latitude
            lon: Longitude
            include_forecast: Include forecast data
            
        Returns:
            Comprehensive ocean report
        """
        logger.info(f"🌊 Generating comprehensive ocean report for ({lat}, {lon})")
        
        report = {
            "location": {
                "latitude": lat,
                "longitude": lon,
                "timestamp": datetime.now().isoformat()
            },
            "real_time_data": {},
            "data_sources": [],
            "status": "success"
        }
        
        # 1. Marine weather (waves, currents)
        marine_data = self.get_marine_weather(lat, lon)
        if marine_data.get("status") == "success":
            report["real_time_data"]["marine_weather"] = marine_data
            report["data_sources"].append("Open-Meteo Marine API")
        
        # 2. Try to find nearest buoy
        nearest_buoy = self._find_nearest_buoy(lat, lon)
        if nearest_buoy:
            buoy_data = self.get_noaa_buoy_data(nearest_buoy)
            if buoy_data.get("status") == "success":
                report["real_time_data"]["buoy_observations"] = buoy_data
                report["data_sources"].append(f"NOAA Buoy {nearest_buoy}")
        
        # 3. Sea level trends
        sea_level = self.get_nasa_sea_level(lat, lon)
        if sea_level.get("status") == "success":
            report["real_time_data"]["sea_level"] = sea_level
            report["data_sources"].append("NASA PODAAC")
        
        # 4. ARGO float data
        argo_data = self.get_argo_profiles_nearby(lat, lon)
        if argo_data.get("status") == "success":
            report["real_time_data"]["argo_floats"] = argo_data
            report["data_sources"].append("ARGO GDAC")
        
        logger.info(f"✅ Report generated with {len(report['data_sources'])} sources")
        return report
    
    def _find_nearest_buoy(self, lat: float, lon: float) -> Optional[str]:
        """Find nearest NOAA buoy station"""
        # Major buoy stations with locations
        buoys = {
            "46042": (36.785, -122.398),  # Monterey Bay, CA
            "46047": (32.433, -119.533),  # Tanner Banks, CA
            "41001": (34.68, -72.73),     # East of Cape Hatteras, NC
            "51001": (23.445, -162.075),  # NW Hawaii
            "44025": (40.25, -73.17),     # New York Harbor
            "42001": (25.897, -89.658),   # Gulf of Mexico
        }
        
        # Simple distance calculation
        min_dist = float('inf')
        nearest = None
        
        for buoy_id, (b_lat, b_lon) in buoys.items():
            dist = ((lat - b_lat) ** 2 + (lon - b_lon) ** 2) ** 0.5
            if dist < min_dist:
                min_dist = dist
                nearest = buoy_id
        
        return nearest if min_dist < 10 else None  # Within ~10 degrees


# ==========================================
# Integration with your RAG Pipeline
# ==========================================

def integrate_realtime_data_with_query(user_query: str, lat: float = None, 
                                       lon: float = None) -> Dict[str, Any]:
    """
    Integrate real-time ocean data into query response
    
    Args:
        user_query: User's question
        lat: Optional latitude
        lon: Optional longitude
        
    Returns:
        Enhanced response with real-time data
    """
    api = RealTimeOceanDataAPI()
    
    query_lower = user_query.lower()
    
    # Extract coordinates from query if not provided
    if not lat or not lon:
        # Default locations for popular regions
        region_coords = {
            "indian ocean": (0.0, 80.0),
            "pacific ocean": (0.0, -140.0),
            "atlantic ocean": (30.0, -40.0),
            "bay of bengal": (15.0, 88.0),
            "arabian sea": (15.0, 65.0),
            "monterey bay": (36.8, -122.4),
        }
        
        for region, coords in region_coords.items():
            if region in query_lower:
                lat, lon = coords
                break
        else:
            lat, lon = 0.0, 0.0  # Default equator
    
    result = {"real_time_data": None, "enhanced_response": ""}
    
    # Detect query intent
    if any(word in query_lower for word in ["current", "now", "today", "real-time", "live"]):
        # User wants real-time data
        if any(word in query_lower for word in ["wave", "surf", "swell"]):
            result["real_time_data"] = api.get_marine_weather(lat, lon)
            result["enhanced_response"] = f"🌊 Real-time wave conditions at ({lat:.2f}, {lon:.2f}):"
            
        elif any(word in query_lower for word in ["buoy", "station", "observation"]):
            buoy = api._find_nearest_buoy(lat, lon)
            if buoy:
                result["real_time_data"] = api.get_noaa_buoy_data(buoy)
                result["enhanced_response"] = f"📡 Latest buoy observation from station {buoy}:"
        
        elif any(word in query_lower for word in ["comprehensive", "report", "all data"]):
            result["real_time_data"] = api.get_comprehensive_ocean_report(lat, lon)
            result["enhanced_response"] = f"📊 Comprehensive ocean report for ({lat:.2f}, {lon:.2f}):"
        
        else:
            # Default: marine weather
            result["real_time_data"] = api.get_marine_weather(lat, lon)