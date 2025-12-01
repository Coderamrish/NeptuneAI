import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Grid,
  Divider,
} from '@mui/material';
import {
  MyLocation,
  Layers,
  Info,
  Warning,
  CheckCircle,
  Navigation as NavigationIcon,
  Sailing,
  WbSunny,
  Air,
  Waves,
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const createCustomIcon = (color, icon) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background: ${color}; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
      <span style="color: white; font-size: 20px;">${icon}</span>
    </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });
};

const originIcon = createCustomIcon('#4caf50', '🚢');
const destinationIcon = createCustomIcon('#f44336', '🏁');
const waypointIcon = createCustomIcon('#2196f3', '📍');
const hazardIcon = createCustomIcon('#ff9800', '⚠️');

// Map controller component
const MapController = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
};

const MaritimeRouteMapView = ({ routeData: externalRouteData, onRouteLoad }) => {
  const [routeData, setRouteData] = useState(externalRouteData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState([20, 70]);
  const [mapZoom, setMapZoom] = useState(5);
  const [selectedWaypoint, setSelectedWaypoint] = useState(null);
  const [showHazards, setShowHazards] = useState(true);
  const [realTimeWeather, setRealTimeWeather] = useState({});

  // Update route when external data changes
  useEffect(() => {
    if (externalRouteData) {
      setRouteData(externalRouteData);
      updateMapView(externalRouteData);
      fetchWeatherForWaypoints(externalRouteData.waypoints);
    }
  }, [externalRouteData]);

  const updateMapView = (route) => {
    if (!route) return;
    
    // Center map on route midpoint
    const midLat = (route.origin.latitude + route.destination.latitude) / 2;
    const midLon = (route.origin.longitude + route.destination.longitude) / 2;
    setMapCenter([midLat, midLon]);
    
    // Calculate appropriate zoom based on distance
    const latDiff = Math.abs(route.origin.latitude - route.destination.latitude);
    const lonDiff = Math.abs(route.origin.longitude - route.destination.longitude);
    const maxDiff = Math.max(latDiff, lonDiff);
    
    let zoom = 5; // default
    if (maxDiff > 50) zoom = 3;
    else if (maxDiff > 30) zoom = 4;
    else if (maxDiff > 20) zoom = 4;
    else if (maxDiff > 10) zoom = 5;
    else if (maxDiff > 5) zoom = 6;
    else zoom = 7;
    
    setMapZoom(zoom);
  };

  const fetchWeatherForWaypoints = async (waypoints) => {
    if (!waypoints || waypoints.length === 0) return;
    
    const token = localStorage.getItem('neptuneai_token');
    if (!token) return;
    
    const weatherData = {};
    
    // Sample every 5th waypoint to avoid too many requests
    const sampledWaypoints = waypoints.filter((_, idx) => idx % 5 === 0);
    
    for (const wp of sampledWaypoints) {
      try {
        const response = await fetch(
          `http://localhost:8000/api/ocean/realtime/marine-weather?lat=${wp.latitude}&lon=${wp.longitude}`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          weatherData[`${wp.latitude},${wp.longitude}`] = data.current_conditions;
        }
      } catch (err) {
        console.error('Weather fetch error:', err);
      }
    }
    
    setRealTimeWeather(weatherData);
  };

  const getSafetyColor = (safety) => {
    const colors = {
      safe: '#4caf50',
      moderate: '#ff9800',
      risky: '#ff9800',
      dangerous: '#f44336',
      critical: '#d32f2f',
    };
    return colors[safety] || '#9e9e9e';
  };

  const getRoutePathColor = (safetyScore) => {
    if (safetyScore > 80) return '#4caf50';
    if (safetyScore > 60) return '#8bc34a';
    if (safetyScore > 40) return '#ff9800';
    if (safetyScore > 20) return '#ff5722';
    return '#f44336';
  };

  if (!routeData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Box textAlign="center">
          <Info sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No route calculated yet
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Use the Route Planner to calculate a maritime route
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header Stats */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent sx={{ py: 2 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <NavigationIcon />
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {routeData.total_distance_nm.toFixed(0)}
                  </Typography>
                  <Typography variant="caption">Nautical Miles</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
            <CardContent sx={{ py: 2 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <Sailing />
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {(routeData.estimated_duration_hours / 24).toFixed(1)}
                  </Typography>
                  <Typography variant="caption">Days</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: getSafetyColor(routeData.overall_safety) }}>
            <CardContent sx={{ py: 2 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <CheckCircle sx={{ color: 'white' }} />
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="white">
                    {routeData.overall_safety.toUpperCase()}
                  </Typography>
                  <Typography variant="caption" color="white">
                    Safety Level
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.light' }}>
            <CardContent sx={{ py: 2 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <Warning />
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {routeData.hazards_detected.length}
                  </Typography>
                  <Typography variant="caption">Hazards</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Map */}
      <Paper elevation={3} sx={{ height: '600px', position: 'relative', overflow: 'hidden' }}>
        {error && (
          <Alert severity="error" sx={{ position: 'absolute', top: 16, left: 16, right: 16, zIndex: 1000 }}>
            {error}
          </Alert>
        )}
        
        {/* Map Controls */}
        <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1000 }}>
          <Tooltip title={showHazards ? 'Hide Hazards' : 'Show Hazards'}>
            <IconButton
              onClick={() => setShowHazards(!showHazards)}
              sx={{ bgcolor: 'white', mb: 1, '&:hover': { bgcolor: 'grey.100' } }}
            >
              <Warning color={showHazards ? 'warning' : 'disabled'} />
            </IconButton>
          </Tooltip>
        </Box>

        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <MapController center={mapCenter} zoom={mapZoom} />
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {routeData && (
            <>
              {/* Origin Marker */}
              <Marker
                position={[routeData.origin.latitude, routeData.origin.longitude]}
                icon={originIcon}
              >
                <Popup>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold" color="success.main">
                      🚢 Origin
                    </Typography>
                    <Typography variant="caption" display="block">
                      Lat: {routeData.origin.latitude.toFixed(4)}°
                    </Typography>
                    <Typography variant="caption" display="block">
                      Lon: {routeData.origin.longitude.toFixed(4)}°
                    </Typography>
                  </Box>
                </Popup>
              </Marker>

              {/* Destination Marker */}
              <Marker
                position={[routeData.destination.latitude, routeData.destination.longitude]}
                icon={destinationIcon}
              >
                <Popup>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold" color="error.main">
                      🏁 Destination
                    </Typography>
                    <Typography variant="caption" display="block">
                      Lat: {routeData.destination.latitude.toFixed(4)}°
                    </Typography>
                    <Typography variant="caption" display="block">
                      Lon: {routeData.destination.longitude.toFixed(4)}°
                    </Typography>
                  </Box>
                </Popup>
              </Marker>

              {/* Route Path - Color-coded by safety */}
              {routeData.waypoints.map((wp, idx) => {
                if (idx === 0) return null;
                const prevWp = routeData.waypoints[idx - 1];
                const avgSafety = (wp.safety_score + prevWp.safety_score) / 2;
                
                return (
                  <Polyline
                    key={idx}
                    positions={[
                      [prevWp.latitude, prevWp.longitude],
                      [wp.latitude, wp.longitude]
                    ]}
                    color={getRoutePathColor(avgSafety)}
                    weight={4}
                    opacity={0.8}
                  />
                );
              })}

              {/* Waypoint Markers (every 5th waypoint) */}
              {routeData.waypoints
                .filter((_, idx) => idx % 5 === 0 && idx !== 0 && idx !== routeData.waypoints.length - 1)
                .map((wp, idx) => {
                  const weatherKey = `${wp.latitude},${wp.longitude}`;
                  const weather = realTimeWeather[weatherKey];
                  
                  return (
                    <Marker
                      key={idx}
                      position={[wp.latitude, wp.longitude]}
                      icon={waypointIcon}
                      eventHandlers={{
                        click: () => setSelectedWaypoint(wp)
                      }}
                    >
                      <Popup>
                        <Box sx={{ minWidth: 200 }}>
                          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                            📍 Waypoint
                          </Typography>
                          
                          <Divider sx={{ my: 1 }} />
                          
                          <Box display="flex" justifyContent="space-between" mb={0.5}>
                            <Typography variant="caption">Location:</Typography>
                            <Typography variant="caption" fontWeight="bold">
                              {wp.latitude.toFixed(2)}°, {wp.longitude.toFixed(2)}°
                            </Typography>
                          </Box>
                          
                          <Box display="flex" justifyContent="space-between" mb={0.5}>
                            <Typography variant="caption">Safety Score:</Typography>
                            <Chip
                              label={`${wp.safety_score.toFixed(0)}/100`}
                              size="small"
                              color={wp.safety_score > 60 ? 'success' : 'warning'}
                              sx={{ height: 18, fontSize: '0.65rem' }}
                            />
                          </Box>
                          
                          {wp.hazards && wp.hazards.length > 0 && (
                            <>
                              <Divider sx={{ my: 1 }} />
                              <Typography variant="caption" color="warning.main" fontWeight="bold">
                                ⚠️ Hazards:
                              </Typography>
                              {wp.hazards.map((h, i) => (
                                <Typography key={i} variant="caption" display="block" ml={1}>
                                  • {h}
                                </Typography>
                              ))}
                            </>
                          )}
                          
                          {weather && (
                            <>
                              <Divider sx={{ my: 1 }} />
                              <Typography variant="caption" fontWeight="bold" gutterBottom>
                                🌊 Current Conditions:
                              </Typography>
                              {weather.wave_height_m && (
                                <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                                  <Waves sx={{ fontSize: 14 }} />
                                  <Typography variant="caption">
                                    Waves: {weather.wave_height_m.toFixed(1)}m
                                  </Typography>
                                </Box>
                              )}
                              {weather.current_velocity_ms && (
                                <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                                  <Air sx={{ fontSize: 14 }} />
                                  <Typography variant="caption">
                                    Current: {weather.current_velocity_ms.toFixed(1)} m/s
                                  </Typography>
                                </Box>
                              )}
                            </>
                          )}
                        </Box>
                      </Popup>
                    </Marker>
                  );
                })}

              {/* Hazard Zones */}
              {showHazards && routeData.hazards_detected.map((hazard, idx) => (
                <Circle
                  key={idx}
                  center={[hazard.location?.lat || 0, hazard.location?.lon || 0]}
                  radius={50000} // 50km radius
                  pathOptions={{
                    color: '#f44336',
                    fillColor: '#f44336',
                    fillOpacity: 0.2,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold" color="error">
                        ⚠️ {hazard.type.toUpperCase()}
                      </Typography>
                      <Typography variant="caption" display="block">
                        {hazard.description}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        Severity: {hazard.severity}
                      </Typography>
                    </Box>
                  </Popup>
                </Circle>
              ))}
            </>
          )}
        </MapContainer>
      </Paper>

      {/* AI Recommendations */}
      {routeData && routeData.recommendations && (
        <Paper elevation={2} sx={{ p: 3, mt: 2, bgcolor: 'info.lighter' }}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <Info color="info" />
            <Typography variant="h6" fontWeight="bold">
              AI Route Recommendations
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
            {routeData.recommendations}
          </Typography>
        </Paper>
      )}

      {/* Legend */}
      <Paper elevation={2} sx={{ p: 2, mt: 2 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          Map Legend
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ width: 20, height: 4, bgcolor: '#4caf50', borderRadius: 1 }} />
              <Typography variant="caption">Safe Route (80-100)</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ width: 20, height: 4, bgcolor: '#8bc34a', borderRadius: 1 }} />
              <Typography variant="caption">Good Route (60-80)</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ width: 20, height: 4, bgcolor: '#ff9800', borderRadius: 1 }} />
              <Typography variant="caption">Moderate Route (40-60)</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ width: 20, height: 4, bgcolor: '#f44336', borderRadius: 1 }} />
              <Typography variant="caption">Risky Route (0-40)</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default MaritimeRouteMapView;