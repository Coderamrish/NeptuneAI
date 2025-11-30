
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, List, Dict, Any, Tuple
from datetime import datetime
import json
import logging

# Import the maritime routing module
from langchain_maritime_routing import (
    ShipRouteOptimizer,
    MaritimeCalamityDetector,
    CalamityType,
    RouteSafety
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create router
maritime_router = APIRouter(prefix="/api/maritime", tags=["maritime"])

# Global service instances
route_optimizer = None
calamity_detector = None

def initialize_maritime_services():
    """Initialize maritime services on startup"""
    global route_optimizer, calamity_detector
    try:
        route_optimizer = ShipRouteOptimizer()
        calamity_detector = MaritimeCalamityDetector()
        logger.info("✅ Maritime services initialized")
    except Exception as e:
        logger.error(f"❌ Maritime services initialization failed: {e}")


# Pydantic models
class RouteRequest(BaseModel):
    origin_lat: float
    origin_lon: float
    destination_lat: float
    destination_lon: float
    ship_type: Optional[str] = "cargo"
    departure_time: Optional[str] = None


class CalamityCheckRequest(BaseModel):
    latitude: float
    longitude: float
    radius_km: Optional[float] = 500


class RouteAlternativeRequest(BaseModel):
    origin_lat: float
    origin_lon: float
    destination_lat: float
    destination_lon: float
    avoid_hazards: Optional[List[str]] = []
    ship_type: Optional[str] = "cargo"


# Dependency for authentication (from your existing api.py)
async def get_current_user(authorization: str = Header(None)):
    """Get current authenticated user"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Import JWT verification from main api
    import jwt
    from jwt.exceptions import InvalidTokenError
    SECRET_KEY = "b6896c7e48894048a059cbb64604a6e4"
    ALGORITHM = "HS256"
    
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


# API Endpoints

@maritime_router.post("/route/calculate")
async def calculate_ship_route(
    request: RouteRequest,
    user: dict = Depends(get_current_user)
):
    """
    Calculate optimal ship route with safety analysis
    """
    try:
        if not route_optimizer:
            raise HTTPException(status_code=503, detail="Route optimizer not available")
        
        logger.info(f"Calculating route for user {user.get('user_id')}")
        
        # Parse departure time
        departure_time = None
        if request.departure_time:
            try:
                departure_time = datetime.fromisoformat(request.departure_time.replace('Z', '+00:00'))
            except Exception as e:
                logger.warning(f"Invalid departure time format: {e}")
        
        # Calculate route
        route = route_optimizer.calculate_safe_route(
            origin=(request.origin_lat, request.origin_lon),
            destination=(request.destination_lat, request.destination_lon),
            ship_type=request.ship_type,
            departure_time=departure_time
        )
        
        # Convert to response format
        return {
            "success": True,
            "route": {
                "origin": {
                    "latitude": route.origin[0],
                    "longitude": route.origin[1]
                },
                "destination": {
                    "latitude": route.destination[0],
                    "longitude": route.destination[1]
                },
                "waypoints": [
                    {
                        "latitude": wp.latitude,
                        "longitude": wp.longitude,
                        "timestamp": wp.timestamp.isoformat(),
                        "safety_score": wp.safety_score,
                        "hazards": wp.hazards,
                        "weather": wp.weather_conditions
                    }
                    for wp in route.waypoints
                ],
                "total_distance_nm": route.total_distance_nm,
                "estimated_duration_hours": route.estimated_duration_hours,
                "overall_safety": route.overall_safety.value,
                "hazards_detected": route.hazards_detected,
                "recommendations": route.recommendations
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Route calculation error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@maritime_router.post("/calamity/detect")
async def detect_maritime_calamities(
    request: CalamityCheckRequest,
    user: dict = Depends(get_current_user)
):
    """
    Detect maritime calamities in a specific area
    """
    try:
        if not calamity_detector:
            raise HTTPException(status_code=503, detail="Calamity detector not available")
        
        logger.info(f"Detecting calamities at ({request.latitude}, {request.longitude})")
        
        calamities = calamity_detector.detect_calamities(
            lat=request.latitude,
            lon=request.longitude,
            radius_km=request.radius_km
        )
        
        return {
            "success": True,
            "location": {
                "latitude": request.latitude,
                "longitude": request.longitude
            },
            "radius_km": request.radius_km,
            "calamities_detected": len(calamities),
            "calamities": calamities,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Calamity detection error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@maritime_router.get("/route/safety-zones")
async def get_safety_zones(
    region: str,
    user: dict = Depends(get_current_user)
):
    """
    Get current safety zones for a region
    """
    try:
        # Define region boundaries
        region_coords = {
            "indian_ocean": {"lat": 0.0, "lon": 80.0, "radius": 3000},
            "pacific_ocean": {"lat": 0.0, "lon": -140.0, "radius": 5000},
            "atlantic_ocean": {"lat": 30.0, "lon": -40.0, "radius": 3000},
            "bay_of_bengal": {"lat": 15.0, "lon": 88.0, "radius": 1000},
            "arabian_sea": {"lat": 15.0, "lon": 65.0, "radius": 1000}
        }
        
        if region not in region_coords:
            raise HTTPException(status_code=400, detail="Invalid region")
        
        coords = region_coords[region]
        
        if not calamity_detector:
            raise HTTPException(status_code=503, detail="Calamity detector not available")
        
        calamities = calamity_detector.detect_calamities(
            lat=coords["lat"],
            lon=coords["lon"],
            radius_km=coords["radius"]
        )
        
        # Determine safety zones
        safety_zones = {
            "safe": [],
            "moderate": [],
            "dangerous": [],
            "critical": []
        }
        
        for calamity in calamities:
            zone = {
                "type": calamity["type"],
                "location": calamity["location"],
                "description": calamity["description"]
            }
            
            severity = calamity["severity"]
            if severity in safety_zones:
                safety_zones[severity].append(zone)
        
        return {
            "success": True,
            "region": region,
            "center": coords,
            "safety_zones": safety_zones,
            "total_hazards": len(calamities),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Safety zones error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@maritime_router.get("/route/popular")
async def get_popular_routes(user: dict = Depends(get_current_user)):
    """
    Get pre-defined popular shipping routes with current safety status
    """
    try:
        popular_routes = [
            {
                "name": "Mumbai to Singapore",
                "origin": {"lat": 19.0, "lon": 72.8, "name": "Mumbai, India"},
                "destination": {"lat": 1.3, "lon": 103.8, "name": "Singapore"},
                "typical_duration_hours": 240,
                "distance_nm": 3600
            },
            {
                "name": "Shanghai to Los Angeles",
                "origin": {"lat": 31.2, "lon": 121.5, "name": "Shanghai, China"},
                "destination": {"lat": 33.7, "lon": -118.2, "name": "Los Angeles, USA"},
                "typical_duration_hours": 336,
                "distance_nm": 6000
            },
            {
                "name": "Rotterdam to New York",
                "origin": {"lat": 51.9, "lon": 4.5, "name": "Rotterdam, Netherlands"},
                "destination": {"lat": 40.7, "lon": -74.0, "name": "New York, USA"},
                "typical_duration_hours": 168,
                "distance_nm": 3500
            },
            {
                "name": "Dubai to Mumbai",
                "origin": {"lat": 25.3, "lon": 55.3, "name": "Dubai, UAE"},
                "destination": {"lat": 19.0, "lon": 72.8, "name": "Mumbai, India"},
                "typical_duration_hours": 96,
                "distance_nm": 1200
            },
            {
                "name": "Tokyo to San Francisco",
                "origin": {"lat": 35.7, "lon": 139.7, "name": "Tokyo, Japan"},
                "destination": {"lat": 37.8, "lon": -122.4, "name": "San Francisco, USA"},
                "typical_duration_hours": 264,
                "distance_nm": 5000
            }
        ]
        
        # Check current safety for each route
        if calamity_detector:
            for route in popular_routes:
                try:
                    # Check origin
                    origin_calamities = calamity_detector.detect_calamities(
                        route["origin"]["lat"],
                        route["origin"]["lon"],
                        radius_km=500
                    )
                    
                    # Check destination
                    dest_calamities = calamity_detector.detect_calamities(
                        route["destination"]["lat"],
                        route["destination"]["lon"],
                        radius_km=500
                    )
                    
                    # Determine overall safety
                    total_critical = sum(1 for c in origin_calamities + dest_calamities if c["severity"] == "critical")
                    total_dangerous = sum(1 for c in origin_calamities + dest_calamities if c["severity"] == "dangerous")
                    
                    if total_critical > 0:
                        route["current_safety"] = "critical"
                    elif total_dangerous > 0:
                        route["current_safety"] = "dangerous"
                    elif len(origin_calamities) + len(dest_calamities) > 0:
                        route["current_safety"] = "moderate"
                    else:
                        route["current_safety"] = "safe"
                    
                    route["origin_hazards"] = len(origin_calamities)
                    route["destination_hazards"] = len(dest_calamities)
                    
                except Exception as e:
                    logger.error(f"Error checking route safety: {e}")
                    route["current_safety"] = "unknown"
        
        return {
            "success": True,
            "routes": popular_routes,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Popular routes error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@maritime_router.post("/route/alternative")
async def get_alternative_routes(
    request: RouteAlternativeRequest,
    user: dict = Depends(get_current_user)
):
    """
    Get alternative routes avoiding specific hazards
    """
    try:
        if not route_optimizer:
            raise HTTPException(status_code=503, detail="Route optimizer not available")
        
        # Calculate primary route
        primary_route = route_optimizer.calculate_safe_route(
            origin=(request.origin_lat, request.origin_lon),
            destination=(request.destination_lat, request.destination_lon),
            ship_type=request.ship_type
        )
        
        # Generate alternatives (simplified)
        alternatives = []
        
        # Alternative 1: Northern route
        alt1_waypoints = route_optimizer.generate_waypoints(
            origin=(request.origin_lat + 5, request.origin_lon),
            destination=(request.destination_lat + 5, request.destination_lon),
            num_waypoints=15
        )
        
        # Alternative 2: Southern route
        alt2_waypoints = route_optimizer.generate_waypoints(
            origin=(request.origin_lat - 5, request.origin_lon),
            destination=(request.destination_lat - 5, request.destination_lon),
            num_waypoints=15
        )
        
        return {
            "success": True,
            "primary_route": {
                "distance_nm": primary_route.total_distance_nm,
                "duration_hours": primary_route.estimated_duration_hours,
                "safety": primary_route.overall_safety.value,
                "hazards": len(primary_route.hazards_detected)
            },
            "alternative_routes": [
                {
                    "name": "Northern Route",
                    "waypoints": [{"lat": wp[0], "lon": wp[1]} for wp in alt1_waypoints],
                    "estimated_distance_nm": route_optimizer.calculate_distance(
                        request.origin_lat + 5, request.origin_lon,
                        request.destination_lat + 5, request.destination_lon
                    )
                },
                {
                    "name": "Southern Route",
                    "waypoints": [{"lat": wp[0], "lon": wp[1]} for wp in alt2_waypoints],
                    "estimated_distance_nm": route_optimizer.calculate_distance(
                        request.origin_lat - 5, request.origin_lon,
                        request.destination_lat - 5, request.destination_lon
                    )
                }
            ],
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Alternative routes error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@maritime_router.get("/vessel/types")
async def get_vessel_types(user: dict = Depends(get_current_user)):
    """Get supported vessel types and their characteristics"""
    return {
        "success": True,
        "vessel_types": [
            {
                "type": "cargo",
                "name": "Cargo Ship",
                "typical_speed_knots": 15,
                "description": "General cargo vessels"
            },
            {
                "type": "container",
                "name": "Container Ship",
                "typical_speed_knots": 20,
                "description": "Container cargo vessels"
            },
            {
                "type": "tanker",
                "name": "Oil Tanker",
                "typical_speed_knots": 14,
                "description": "Oil and gas tankers"
            },
            {
                "type": "cruise",
                "name": "Cruise Ship",
                "typical_speed_knots": 22,
                "description": "Passenger cruise ships"
            },
            {
                "type": "ferry",
                "name": "Ferry",
                "typical_speed_knots": 18,
                "description": "Passenger and vehicle ferries"
            }
        ]
    }


@maritime_router.get("/health")
async def maritime_health_check():
    """Check maritime service health"""
    return {
        "status": "healthy" if route_optimizer and calamity_detector else "degraded",
        "route_optimizer": route_optimizer is not None,
        "calamity_detector": calamity_detector is not None,
        "timestamp": datetime.now().isoformat()
    }