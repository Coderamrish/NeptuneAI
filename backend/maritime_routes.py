
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

# Add this to your maritime_routes.py file

# Update the popular routes endpoint with real India-centric routes

@maritime_router.get("/route/popular")
async def get_popular_routes(user: dict = Depends(get_current_user)):
    """
    Get pre-defined popular shipping routes with current safety status
    Enhanced with India-centric routes
    """
    try:
        popular_routes = [
            # India to Asia
            {
                "name": "Mumbai to Singapore",
                "origin": {"lat": 19.0, "lon": 72.8, "name": "Mumbai (INNSA), India"},
                "destination": {"lat": 1.3, "lon": 103.8, "name": "Singapore (SGSIN)"},
                "typical_duration_hours": 240,
                "distance_nm": 3600,
                "description": "Major Indian Ocean trade route"
            },
            {
                "name": "Chennai to Shanghai",
                "origin": {"lat": 13.1, "lon": 80.3, "name": "Chennai (INMAA), India"},
                "destination": {"lat": 31.2, "lon": 121.5, "name": "Shanghai (CNSHA), China"},
                "typical_duration_hours": 288,
                "distance_nm": 4200,
                "description": "East Coast India to China route"
            },
            {
                "name": "Visakhapatnam to Hong Kong",
                "origin": {"lat": 17.7, "lon": 83.3, "name": "Visakhapatnam (INVTZ), India"},
                "destination": {"lat": 22.3, "lon": 114.2, "name": "Hong Kong (HKHKG)"},
                "typical_duration_hours": 264,
                "distance_nm": 3900,
                "description": "Bay of Bengal to South China Sea"
            },
            
            # India to Middle East
            {
                "name": "Mumbai to Dubai",
                "origin": {"lat": 19.0, "lon": 72.8, "name": "Mumbai (INNSA), India"},
                "destination": {"lat": 25.3, "lon": 55.3, "name": "Dubai (AEDXB), UAE"},
                "typical_duration_hours": 96,
                "distance_nm": 1200,
                "description": "Arabian Sea corridor"
            },
            {
                "name": "Kandla to Jebel Ali",
                "origin": {"lat": 23.0, "lon": 70.2, "name": "Kandla (INKAN), India"},
                "destination": {"lat": 25.0, "lon": 55.0, "name": "Jebel Ali (AEJEA), UAE"},
                "typical_duration_hours": 72,
                "distance_nm": 900,
                "description": "West Coast India to UAE"
            },
            
            # India to Europe via Suez
            {
                "name": "Mumbai to Rotterdam (via Suez)",
                "origin": {"lat": 19.0, "lon": 72.8, "name": "Mumbai (INNSA), India"},
                "destination": {"lat": 51.9, "lon": 4.5, "name": "Rotterdam (NLRTM), Netherlands"},
                "typical_duration_hours": 480,
                "distance_nm": 7200,
                "description": "Major India-Europe trade route"
            },
            {
                "name": "Chennai to Hamburg",
                "origin": {"lat": 13.1, "lon": 80.3, "name": "Chennai (INMAA), India"},
                "destination": {"lat": 53.5, "lon": 9.9, "name": "Hamburg (DEHAM), Germany"},
                "typical_duration_hours": 504,
                "distance_nm": 7500,
                "description": "East Coast India to Northern Europe"
            },
            
            # India to Americas
            {
                "name": "Mumbai to New York (via Suez)",
                "origin": {"lat": 19.0, "lon": 72.8, "name": "Mumbai (INNSA), India"},
                "destination": {"lat": 40.7, "lon": -74.0, "name": "New York (USNYC), USA"},
                "typical_duration_hours": 600,
                "distance_nm": 9000,
                "description": "Trans-Atlantic route from India"
            },
            {
                "name": "Chennai to Los Angeles (via Pacific)",
                "origin": {"lat": 13.1, "lon": 80.3, "name": "Chennai (INMAA), India"},
                "destination": {"lat": 33.7, "lon": -118.2, "name": "Los Angeles (USLAX), USA"},
                "typical_duration_hours": 672,
                "distance_nm": 10000,
                "description": "Trans-Pacific route via Singapore"
            },
            
            # Regional India routes
            {
                "name": "Kolkata to Colombo",
                "origin": {"lat": 22.6, "lon": 88.4, "name": "Kolkata (INCCU), India"},
                "destination": {"lat": 6.9, "lon": 79.8, "name": "Colombo (LKCMB), Sri Lanka"},
                "typical_duration_hours": 96,
                "distance_nm": 1400,
                "description": "Bay of Bengal regional route"
            },
            {
                "name": "Kochi to Port Klang",
                "origin": {"lat": 9.9, "lon": 76.3, "name": "Kochi (INCOK), India"},
                "destination": {"lat": 3.0, "lon": 101.4, "name": "Port Klang (MYPKG), Malaysia"},
                "typical_duration_hours": 168,
                "distance_nm": 2500,
                "description": "West Coast India to Southeast Asia"
            },
            
            # India to East Africa
            {
                "name": "Mumbai to Mombasa",
                "origin": {"lat": 19.0, "lon": 72.8, "name": "Mumbai (INNSA), India"},
                "destination": {"lat": -4.0, "lon": 39.7, "name": "Mombasa, Kenya"},
                "typical_duration_hours": 192,
                "distance_nm": 2800,
                "description": "West Indian Ocean trade route"
            },
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
            "total": len(popular_routes),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Popular routes error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# Add endpoint to get all Indian ports
@maritime_router.get("/ports/india")
async def get_indian_ports(user: dict = Depends(get_current_user)):
    """Get list of major Indian ports"""
    indian_ports = [
        {"name": "Mumbai (INNSA)", "lat": 19.0, "lon": 72.8, "state": "Maharashtra", "coast": "West"},
        {"name": "Chennai (INMAA)", "lat": 13.1, "lon": 80.3, "state": "Tamil Nadu", "coast": "East"},
        {"name": "Kolkata (INCCU)", "lat": 22.6, "lon": 88.4, "state": "West Bengal", "coast": "East"},
        {"name": "Visakhapatnam (INVTZ)", "lat": 17.7, "lon": 83.3, "state": "Andhra Pradesh", "coast": "East"},
        {"name": "Kochi (INCOK)", "lat": 9.9, "lon": 76.3, "state": "Kerala", "coast": "West"},
        {"name": "Kandla (INKAN)", "lat": 23.0, "lon": 70.2, "state": "Gujarat", "coast": "West"},
        {"name": "Tuticorin (INTUT)", "lat": 8.8, "lon": 78.2, "state": "Tamil Nadu", "coast": "East"},
        {"name": "Paradip (INPPT)", "lat": 20.3, "lon": 86.7, "state": "Odisha", "coast": "East"},
        {"name": "New Mangalore (INNMP)", "lat": 12.9, "lon": 74.8, "state": "Karnataka", "coast": "West"},
        {"name": "Ennore (INENR)", "lat": 13.2, "lon": 80.3, "state": "Tamil Nadu", "coast": "East"},
        {"name": "Mormugao (INMRM)", "lat": 15.4, "lon": 73.8, "state": "Goa", "coast": "West"},
        {"name": "Haldia (INHLD)", "lat": 22.0, "lon": 88.1, "state": "West Bengal", "coast": "East"},
    ]
    
    return {
        "success": True,
        "ports": indian_ports,
        "total": len(indian_ports)
    }


# Add endpoint to get international ports
@maritime_router.get("/ports/international")
async def get_international_ports(user: dict = Depends(get_current_user)):
    """Get list of major international ports"""
    international_ports = [
        # Asia-Pacific
        {"name": "Singapore (SGSIN)", "lat": 1.3, "lon": 103.8, "country": "Singapore", "region": "Southeast Asia"},
        {"name": "Shanghai (CNSHA)", "lat": 31.2, "lon": 121.5, "country": "China", "region": "East Asia"},
        {"name": "Hong Kong (HKHKG)", "lat": 22.3, "lon": 114.2, "country": "Hong Kong", "region": "East Asia"},
        {"name": "Busan (KRPUS)", "lat": 35.1, "lon": 129.0, "country": "South Korea", "region": "East Asia"},
        {"name": "Tokyo (JPTYO)", "lat": 35.7, "lon": 139.7, "country": "Japan", "region": "East Asia"},
        {"name": "Port Klang (MYPKG)", "lat": 3.0, "lon": 101.4, "country": "Malaysia", "region": "Southeast Asia"},
        {"name": "Colombo (LKCMB)", "lat": 6.9, "lon": 79.8, "country": "Sri Lanka", "region": "South Asia"},
        
        # Middle East
        {"name": "Dubai (AEDXB)", "lat": 25.3, "lon": 55.3, "country": "UAE", "region": "Middle East"},
        {"name": "Jebel Ali (AEJEA)", "lat": 25.0, "lon": 55.0, "country": "UAE", "region": "Middle East"},
        {"name": "Port Said (EGPSD)", "lat": 31.3, "lon": 32.3, "country": "Egypt", "region": "Middle East"},
        
        # Europe
        {"name": "Rotterdam (NLRTM)", "lat": 51.9, "lon": 4.5, "country": "Netherlands", "region": "Europe"},
        {"name": "Hamburg (DEHAM)", "lat": 53.5, "lon": 9.9, "country": "Germany", "region": "Europe"},
        {"name": "Antwerp (BEANR)", "lat": 51.2, "lon": 4.4, "country": "Belgium", "region": "Europe"},
        {"name": "Felixstowe (GBFXT)", "lat": 51.9, "lon": 1.3, "country": "UK", "region": "Europe"},
        
        # Americas
        {"name": "Los Angeles (USLAX)", "lat": 33.7, "lon": -118.2, "country": "USA", "region": "North America"},
        {"name": "New York (USNYC)", "lat": 40.7, "lon": -74.0, "country": "USA", "region": "North America"},
        {"name": "Long Beach (USLGB)", "lat": 33.8, "lon": -118.2, "country": "USA", "region": "North America"},
        {"name": "Santos (BRSSZ)", "lat": -23.9, "lon": -46.3, "country": "Brazil", "region": "South America"},
    ]
    
    return {
        "success": True,
        "ports": international_ports,
        "total": len(international_ports)
    }

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