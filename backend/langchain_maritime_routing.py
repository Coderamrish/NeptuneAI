"""
LangChain-powered Maritime Route Planning with Calamity Detection
Integrates ocean data, weather patterns, and AI reasoning for safe ship routing
"""

import os
import logging
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime, timedelta
import numpy as np
import pandas as pd
from dataclasses import dataclass
from enum import Enum

# LangChain imports - Updated to avoid deprecation warnings
try:
    from langchain_community.chat_models import ChatOpenAI
except ImportError:
    from langchain.chat_models import ChatOpenAI

from langchain.prompts import ChatPromptTemplate, PromptTemplate
from langchain.chains import LLMChain
from langchain.agents import AgentType, initialize_agent, Tool
from langchain.memory import ConversationBufferMemory
from langchain.schema import HumanMessage, SystemMessage, AIMessage

try:
    from langchain_community.callbacks import get_openai_callback
except ImportError:
    from langchain.callbacks import get_openai_callback

# Local imports
from realtime_ocean_api import RealTimeOceanDataAPI
from query_engine import get_db_engine, query_by_region, get_data_for_plotting

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class CalamityType(Enum):
    """Types of maritime calamities"""
    CYCLONE = "cyclone"
    TSUNAMI = "tsunami"
    STORM = "storm"
    HIGH_WAVES = "high_waves"
    FOG = "fog"
    ICE = "ice"
    PIRACY = "piracy"
    EARTHQUAKE = "earthquake"


class RouteSafety(Enum):
    """Route safety levels"""
    SAFE = "safe"
    MODERATE = "moderate"
    RISKY = "risky"
    DANGEROUS = "dangerous"
    CRITICAL = "critical"


@dataclass
class Waypoint:
    """A waypoint in the ship route"""
    latitude: float
    longitude: float
    timestamp: datetime
    safety_score: float
    hazards: List[str]
    weather_conditions: Dict[str, Any]


@dataclass
class ShipRoute:
    """Complete ship route with safety information"""
    origin: Tuple[float, float]
    destination: Tuple[float, float]
    waypoints: List[Waypoint]
    total_distance_nm: float
    estimated_duration_hours: float
    overall_safety: RouteSafety
    hazards_detected: List[Dict[str, Any]]
    alternative_routes: List['ShipRoute']
    recommendations: str


class MaritimeCalamityDetector:
    """Detects and analyzes maritime calamities using LangChain and ocean data"""
    
    def __init__(self, api_key: str = None):
        """
        Initialize the calamity detector
        
        Args:
            api_key: OpenAI API key (or use GROQ_API_KEY from env)
        """
        self.api_key = api_key or os.getenv("GROQ_API_KEY") or os.getenv("OPENAI_API_KEY")
        
        # Initialize LangChain LLM
        try:
            # Use Groq if available, otherwise OpenAI
            if os.getenv("GROQ_API_KEY"):
                from groq import Groq
                self.groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
                self.use_groq = True
                logger.info("✅ Using Groq LLM")
            else:
                self.llm = ChatOpenAI(
                    temperature=0.3,
                    model="gpt-4",
                    openai_api_key=self.api_key
                )
                self.use_groq = False
                logger.info("✅ Using OpenAI LLM")
        except Exception as e:
            logger.error(f"❌ LLM initialization failed: {e}")
            self.llm = None
            self.use_groq = False
        
        # Initialize ocean API
        self.ocean_api = RealTimeOceanDataAPI()
        
        # Initialize database
        try:
            self.db_engine = get_db_engine()
        except Exception as e:
            logger.warning(f"⚠️ Database not available: {e}")
            self.db_engine = None
        
        # Calamity detection thresholds
        self.thresholds = {
            "wave_height_critical": 8.0,  # meters
            "wave_height_dangerous": 5.0,
            "wind_speed_critical": 25.0,  # m/s
            "wind_speed_dangerous": 15.0,
            "visibility_poor": 2.0,  # km
            "pressure_drop_rapid": 5.0,  # hPa in 3 hours
        }
        
        logger.info("🌊 Maritime Calamity Detector initialized")
    
    def _call_llm(self, system_prompt: str, user_prompt: str) -> str:
        """Call LLM with fallback to Groq"""
        try:
            if self.use_groq:
                response = self.groq_client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=0.3,
                    max_tokens=1000
                )
                return response.choices[0].message.content
            elif self.llm:
                messages = [
                    SystemMessage(content=system_prompt),
                    HumanMessage(content=user_prompt)
                ]
                response = self.llm(messages)
                return response.content
            else:
                return "LLM not available"
        except Exception as e:
            logger.error(f"LLM call failed: {e}")
            return f"Error: {str(e)}"
    
    def detect_calamities(self, lat: float, lon: float, 
                         radius_km: float = 500) -> List[Dict[str, Any]]:
        """
        Detect potential maritime calamities in the area
        
        Args:
            lat: Latitude
            lon: Longitude
            radius_km: Detection radius in kilometers
            
        Returns:
            List of detected calamities with severity and details
        """
        calamities = []
        
        try:
            # Get real-time ocean data
            logger.info(f"🔍 Detecting calamities near ({lat:.2f}, {lon:.2f})")
            
            ocean_data = self.ocean_api.get_marine_weather(lat, lon)
            
            if ocean_data.get("status") == "success":
                conditions = ocean_data.get("current_conditions", {})
                
                # Check wave height
                wave_height = conditions.get("wave_height_m")
                if wave_height:
                    if wave_height > self.thresholds["wave_height_critical"]:
                        calamities.append({
                            "type": CalamityType.HIGH_WAVES.value,
                            "severity": "critical",
                            "value": wave_height,
                            "description": f"Extremely high waves: {wave_height:.1f}m",
                            "location": {"lat": lat, "lon": lon},
                            "timestamp": datetime.now().isoformat()
                        })
                    elif wave_height > self.thresholds["wave_height_dangerous"]:
                        calamities.append({
                            "type": CalamityType.HIGH_WAVES.value,
                            "severity": "dangerous",
                            "value": wave_height,
                            "description": f"High waves detected: {wave_height:.1f}m",
                            "location": {"lat": lat, "lon": lon},
                            "timestamp": datetime.now().isoformat()
                        })
                
                # Check wind/current
                current_velocity = conditions.get("current_velocity_ms")
                if current_velocity and current_velocity > self.thresholds["wind_speed_dangerous"]:
                    calamities.append({
                        "type": CalamityType.STORM.value,
                        "severity": "dangerous" if current_velocity > self.thresholds["wind_speed_critical"] else "moderate",
                        "value": current_velocity,
                        "description": f"Strong currents: {current_velocity:.1f} m/s",
                        "location": {"lat": lat, "lon": lon},
                        "timestamp": datetime.now().isoformat()
                    })
            
            # Get buoy data if available
            try:
                buoy_id = self.ocean_api._find_nearest_buoy(lat, lon)
                if buoy_id:
                    buoy_data = self.ocean_api.get_noaa_buoy_data(buoy_id)
                    if buoy_data.get("status") == "success":
                        data = buoy_data.get("data", {})
                        
                        # Check air pressure for storms
                        pressure = data.get("air_pressure")
                        if pressure and pressure < 1000:  # Low pressure system
                            calamities.append({
                                "type": CalamityType.STORM.value,
                                "severity": "moderate",
                                "value": pressure,
                                "description": f"Low pressure system: {pressure:.1f} hPa",
                                "location": {"lat": lat, "lon": lon},
                                "timestamp": datetime.now().isoformat()
                            })
            except Exception as e:
                logger.warning(f"Buoy data check failed: {e}")
            
            # Use LLM for advanced calamity analysis
            if calamities and self.llm:
                analysis = self._analyze_calamities_with_llm(calamities, lat, lon)
                for calamity in calamities:
                    calamity["ai_analysis"] = analysis
            
            logger.info(f"✅ Detected {len(calamities)} calamities")
            
        except Exception as e:
            logger.error(f"❌ Calamity detection failed: {e}")
        
        return calamities
    
    def _analyze_calamities_with_llm(self, calamities: List[Dict], 
                                    lat: float, lon: float) -> str:
        """Use LLM to analyze detected calamities"""
        system_prompt = """You are a maritime safety expert analyzing ocean hazards. 
        Provide concise, actionable safety advice for ship captains."""
        
        calamity_summary = "\n".join([
            f"- {c['type']}: {c['description']} (Severity: {c['severity']})"
            for c in calamities
        ])
        
        user_prompt = f"""Location: ({lat:.2f}°, {lon:.2f}°)

Detected Hazards:
{calamity_summary}

Provide:
1. Overall risk assessment
2. Immediate safety recommendations
3. Alternative routing suggestions"""
        
        return self._call_llm(system_prompt, user_prompt)


class ShipRouteOptimizer:
    """Optimizes ship routes using LangChain and ocean data"""
    
    def __init__(self, api_key: str = None):
        """Initialize the route optimizer"""
        self.calamity_detector = MaritimeCalamityDetector(api_key)
        self.ocean_api = RealTimeOceanDataAPI()
        
        # Ship speed assumptions (knots)
        self.typical_speeds = {
            "cargo": 15,
            "container": 20,
            "tanker": 14,
            "cruise": 22,
            "ferry": 18
        }
        
        logger.info("🚢 Ship Route Optimizer initialized")
    
    def calculate_distance(self, lat1: float, lon1: float, 
                          lat2: float, lon2: float) -> float:
        """
        Calculate great circle distance in nautical miles
        
        Args:
            lat1, lon1: Origin coordinates
            lat2, lon2: Destination coordinates
            
        Returns:
            Distance in nautical miles
        """
        # Haversine formula
        R = 3440.065  # Earth radius in nautical miles
        
        lat1_rad = np.radians(lat1)
        lat2_rad = np.radians(lat2)
        delta_lat = np.radians(lat2 - lat1)
        delta_lon = np.radians(lon2 - lon1)
        
        a = np.sin(delta_lat/2)**2 + np.cos(lat1_rad) * np.cos(lat2_rad) * np.sin(delta_lon/2)**2
        c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1-a))
        
        distance = R * c
        return distance
    
    def generate_waypoints(self, origin: Tuple[float, float], 
                          destination: Tuple[float, float],
                          num_waypoints: int = 10) -> List[Tuple[float, float]]:
        """
        Generate intermediate waypoints between origin and destination
        
        Args:
            origin: (lat, lon) tuple
            destination: (lat, lon) tuple
            num_waypoints: Number of waypoints to generate
            
        Returns:
            List of (lat, lon) waypoints
        """
        lat1, lon1 = origin
        lat2, lon2 = destination
        
        waypoints = []
        for i in range(num_waypoints + 1):
            fraction = i / num_waypoints
            
            # Linear interpolation (simplified - can use great circle interpolation)
            lat = lat1 + (lat2 - lat1) * fraction
            lon = lon1 + (lon2 - lon1) * fraction
            
            waypoints.append((lat, lon))
        
        return waypoints
    
    def calculate_safe_route(self, 
                            origin: Tuple[float, float],
                            destination: Tuple[float, float],
                            ship_type: str = "cargo",
                            departure_time: datetime = None) -> ShipRoute:
        """
        Calculate the safest route considering ocean conditions and calamities
        
        Args:
            origin: Origin coordinates (lat, lon)
            destination: Destination coordinates (lat, lon)
            ship_type: Type of ship (affects speed)
            departure_time: Planned departure time
            
        Returns:
            ShipRoute object with complete routing information
        """
        logger.info(f"🗺️ Calculating route from {origin} to {destination}")
        
        if departure_time is None:
            departure_time = datetime.now()
        
        # Generate waypoints
        raw_waypoints = self.generate_waypoints(origin, destination, num_waypoints=20)
        
        # Analyze each waypoint for safety
        route_waypoints = []
        all_hazards = []
        overall_safety_scores = []
        
        ship_speed = self.typical_speeds.get(ship_type, 15)  # knots
        current_time = departure_time
        
        for i, (lat, lon) in enumerate(raw_waypoints):
            # Check for calamities at this waypoint
            calamities = self.calamity_detector.detect_calamities(lat, lon, radius_km=200)
            
            # Get ocean conditions
            ocean_data = self.ocean_api.get_marine_weather(lat, lon)
            weather_conditions = ocean_data.get("current_conditions", {})
            
            # Calculate safety score (0-100)
            safety_score = self._calculate_safety_score(calamities, weather_conditions)
            overall_safety_scores.append(safety_score)
            
            # Extract hazards
            hazards = [c["type"] for c in calamities]
            all_hazards.extend(calamities)
            
            # Calculate distance and time to this waypoint
            if i > 0:
                prev_lat, prev_lon = raw_waypoints[i-1]
                segment_distance = self.calculate_distance(prev_lat, prev_lon, lat, lon)
                segment_time = segment_distance / ship_speed  # hours
                current_time += timedelta(hours=segment_time)
            
            waypoint = Waypoint(
                latitude=lat,
                longitude=lon,
                timestamp=current_time,
                safety_score=safety_score,
                hazards=hazards,
                weather_conditions=weather_conditions
            )
            
            route_waypoints.append(waypoint)
        
        # Calculate total distance
        total_distance = self.calculate_distance(*origin, *destination)
        estimated_duration = total_distance / ship_speed
        
        # Determine overall safety
        avg_safety = np.mean(overall_safety_scores)
        if avg_safety > 80:
            overall_safety = RouteSafety.SAFE
        elif avg_safety > 60:
            overall_safety = RouteSafety.MODERATE
        elif avg_safety > 40:
            overall_safety = RouteSafety.RISKY
        elif avg_safety > 20:
            overall_safety = RouteSafety.DANGEROUS
        else:
            overall_safety = RouteSafety.CRITICAL
        
        # Generate AI recommendations
        recommendations = self._generate_route_recommendations(
            origin, destination, all_hazards, overall_safety, route_waypoints
        )
        
        route = ShipRoute(
            origin=origin,
            destination=destination,
            waypoints=route_waypoints,
            total_distance_nm=total_distance,
            estimated_duration_hours=estimated_duration,
            overall_safety=overall_safety,
            hazards_detected=all_hazards,
            alternative_routes=[],  # Can be populated with alternative routes
            recommendations=recommendations
        )
        
        logger.info(f"✅ Route calculated: {total_distance:.1f} nm, {estimated_duration:.1f} hours, Safety: {overall_safety.value}")
        
        return route
    
    def _calculate_safety_score(self, calamities: List[Dict], 
                               weather: Dict[str, Any]) -> float:
        """Calculate a safety score (0-100) based on conditions"""
        score = 100.0
        
        # Penalize based on calamities
        for calamity in calamities:
            if calamity["severity"] == "critical":
                score -= 40
            elif calamity["severity"] == "dangerous":
                score -= 25
            elif calamity["severity"] == "moderate":
                score -= 15
        
        # Penalize based on wave height (handle None values)
        wave_height = weather.get("wave_height_m")
        if wave_height is not None:
            if wave_height > 8:
                score -= 30
            elif wave_height > 5:
                score -= 20
            elif wave_height > 3:
                score -= 10
        
        return max(0, min(100, score))
    
    def _generate_route_recommendations(self, origin, destination, hazards, 
                                       safety: RouteSafety, waypoints) -> str:
        """Generate AI-powered route recommendations"""
        system_prompt = """You are an experienced ship captain and maritime safety advisor. 
        Provide clear, actionable routing recommendations based on ocean conditions."""
        
        hazard_summary = "\n".join([
            f"- {h['type']}: {h['description']} at ({h['location']['lat']:.2f}, {h['location']['lon']:.2f})"
            for h in hazards[:5]  # Top 5 hazards
        ])
        
        user_prompt = f"""Route Analysis:
Origin: {origin}
Destination: {destination}
Overall Safety: {safety.value}
Distance: {self.calculate_distance(*origin, *destination):.1f} nm

Detected Hazards:
{hazard_summary if hazard_summary else "None detected"}

Provide:
1. Safety assessment
2. Recommended precautions
3. Alternative routing suggestions if safety is below MODERATE"""
        
        return self.calamity_detector._call_llm(system_prompt, user_prompt)


def main():
    """Example usage"""
    # Initialize optimizer
    optimizer = ShipRouteOptimizer()
    
    # Example route: Mumbai to Singapore
    origin = (19.0, 72.8)  # Mumbai
    destination = (1.3, 103.8)  # Singapore
    
    print("\n🚢 MARITIME ROUTE OPTIMIZATION")
    print("=" * 60)
    
    # Calculate route
    route = optimizer.calculate_safe_route(
        origin=origin,
        destination=destination,
        ship_type="container"
    )
    
    print(f"\n📍 Origin: {origin}")
    print(f"📍 Destination: {destination}")
    print(f"📏 Distance: {route.total_distance_nm:.1f} nautical miles")
    print(f"⏱️  Duration: {route.estimated_duration_hours:.1f} hours")
    print(f"🛡️  Safety: {route.overall_safety.value.upper()}")
    print(f"⚠️  Hazards Detected: {len(route.hazards_detected)}")
    
    print("\n🎯 RECOMMENDATIONS:")
    print(route.recommendations)
    
    print("\n📊 WAYPOINT ANALYSIS:")
    for i, wp in enumerate(route.waypoints[::5]):  # Every 5th waypoint
        print(f"  Waypoint {i*5}: ({wp.latitude:.2f}, {wp.longitude:.2f})")
        print(f"    Safety Score: {wp.safety_score:.1f}/100")
        print(f"    Hazards: {', '.join(wp.hazards) if wp.hazards else 'None'}")
    
    print("\n✅ Route optimization complete!")


if __name__ == "__main__":
    main()