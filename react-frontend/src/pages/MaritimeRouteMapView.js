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
  Stack,
  alpha,
  Button,
  Collapse,
  Badge,
  LinearProgress,
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
  ThermostatAuto,
  Speed,
  Visibility,
  LocationOn,
  ZoomIn,
  ZoomOut,
  CenterFocusStrong,
  ExpandMore,
  ExpandLess,
  Map as MapIcon,
  Timeline,
  Security,
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

// Enhanced custom icons with animations
const createCustomIcon = (color, icon, size = 50) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: ${color}; 
        width: ${size}px; 
        height: ${size}px; 
        border-radius: 50%; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        border: 4px solid white; 
        box-shadow: 0 4px 16px rgba(0,0,0,0.4);
        animation: pulse 2s infinite;
      ">
        <span style="color: white; font-size: ${size * 0.5}px;">${icon}</span>
      </div>
      <style>
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      </style>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
  });
};

const originIcon = createCustomIcon('linear-gradient(135deg, #4caf50 0%, #81c784 100%)', '🚢', 50);
const destinationIcon = createCustomIcon('linear-gradient(135deg, #f44336 0%, #e57373 100%)', '🏁', 50);
const waypointIcon = createCustomIcon('linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)', '📍', 40);
const hazardIcon = createCustomIcon('linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)', '⚠️', 45);

// Map controller component
const MapController = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom, { animate: true, duration: 1 });
    }
  }, [center, zoom, map]);
  
  return null;
};

const MaritimeRouteMapView = ({ routeData: externalRouteData }) => {
  const [routeData, setRouteData] = useState(externalRouteData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState([20, 70]);
  const [mapZoom, setMapZoom] = useState(5);
  const [selectedWaypoint, setSelectedWaypoint] = useState(null);
  const [showHazards, setShowHazards] = useState(true);
  const [showWaypoints, setShowWaypoints] = useState(true);
  const [realTimeWeather, setRealTimeWeather] = useState({});
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [expandedStats, setExpandedStats] = useState(true);
  const [mapStyle, setMapStyle] = useState('street');
  const mapRef = useRef(null);

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
    
    let zoom = 5;
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
    
    setWeatherLoading(true);
    const token = localStorage.getItem('neptuneai_token');
    if (!token) {
      setWeatherLoading(false);
      return;
    }
    
    const weatherData = {};
    const sampledWaypoints = waypoints.filter((_, idx) => idx % 5 === 0);
    
    try {
      for (const wp of sampledWaypoints.slice(0, 10)) {
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
      }
      setRealTimeWeather(weatherData);
    } catch (err) {
      console.error('Weather fetch error:', err);
    } finally {
      setWeatherLoading(false);
    }
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

  const getSafetyGradient = (safety) => {
    const gradients = {
      safe: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
      moderate: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
      risky: 'linear-gradient(135deg, #ff5722 0%, #ff8a65 100%)',
      dangerous: 'linear-gradient(135deg, #f44336 0%, #e57373 100%)',
      critical: 'linear-gradient(135deg, #d32f2f 0%, #ef5350 100%)',
    };
    return gradients[safety] || 'linear-gradient(135deg, #9e9e9e 0%, #bdbdbd 100%)';
  };

  const recenterMap = () => {
    if (routeData) {
      updateMapView(routeData);
    }
  };

  const zoomIn = () => {
    setMapZoom(prev => Math.min(prev + 1, 18));
  };

  const zoomOut = () => {
    setMapZoom(prev => Math.max(prev - 1, 2));
  };

  const getTileLayerUrl = () => {
    const layers = {
      street: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ocean: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    };
    return layers[mapStyle];
  };

  if (!routeData) {
    return (
      <Paper
        elevation={0}
        sx={{
          minHeight: '600px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}
        />
        <Box textAlign="center" position="relative" zIndex={1}>
          <MapIcon sx={{ fontSize: 100, color: 'white', mb: 3, opacity: 0.9 }} />
          <Typography variant="h4" fontWeight="700" color="white" gutterBottom>
            No Route Calculated
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 3 }}>
            Use the Route Planner to calculate a maritime route and visualize it here
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<NavigationIcon />}
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              fontWeight: 700,
              px: 4,
              py: 1.5,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.9)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Go to Route Planner
          </Button>
        </Box>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Enhanced Stats Cards */}
      <Box mb={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h5" fontWeight="700" gutterBottom>
              Route Overview
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Real-time maritime intelligence and navigation data
            </Typography>
          </Box>
          <IconButton
            onClick={() => setExpandedStats(!expandedStats)}
            sx={{
              bgcolor: alpha('#667eea', 0.1),
              '&:hover': { bgcolor: alpha('#667eea', 0.2) },
            }}
          >
            {expandedStats ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>

        <Collapse in={expandedStats}>
          <Grid container spacing={2}>
            {/* Distance Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 30px rgba(102, 126, 234, 0.4)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.1)',
                  }
                }}
              >
                <Box position="relative" zIndex={1}>
                  <NavigationIcon sx={{ fontSize: 36, color: 'white', mb: 1.5, opacity: 0.9 }} />
                  <Typography variant="h3" fontWeight="800" color="white" gutterBottom>
                    {routeData.total_distance_nm.toFixed(0)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                    Nautical Miles
                  </Typography>
                  <Box mt={2}>
                    <LinearProgress 
                      variant="determinate" 
                      value={100} 
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.2)',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: 'white',
                        }
                      }} 
                    />
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Duration Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 30px rgba(240, 147, 251, 0.4)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.1)',
                  }
                }}
              >
                <Box position="relative" zIndex={1}>
                  <Sailing sx={{ fontSize: 36, color: 'white', mb: 1.5, opacity: 0.9 }} />
                  <Typography variant="h3" fontWeight="800" color="white" gutterBottom>
                    {(routeData.estimated_duration_hours / 24).toFixed(1)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                    Days Duration
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', display: 'block', mt: 1 }}>
                    ≈ {routeData.estimated_duration_hours.toFixed(0)} hours
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Safety Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: getSafetyGradient(routeData.overall_safety),
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 12px 30px ${alpha(getSafetyColor(routeData.overall_safety), 0.4)}`,
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.1)',
                  }
                }}
              >
                <Box position="relative" zIndex={1}>
                  <Security sx={{ fontSize: 36, color: 'white', mb: 1.5, opacity: 0.9 }} />
                  <Typography variant="h4" fontWeight="800" color="white" gutterBottom sx={{ textTransform: 'uppercase' }}>
                    {routeData.overall_safety}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                    Safety Level
                  </Typography>
                  <Chip
                    icon={<CheckCircle sx={{ color: 'white !important' }} />}
                    label="Verified"
                    size="small"
                    sx={{
                      mt: 1.5,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Paper>
            </Grid>

            {/* Hazards Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 30px rgba(250, 112, 154, 0.4)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.1)',
                  }
                }}
              >
                <Box position="relative" zIndex={1}>
                  <Badge badgeContent={routeData.hazards_detected.length} color="error">
                    <Warning sx={{ fontSize: 36, color: 'white', mb: 1.5, opacity: 0.9 }} />
                  </Badge>
                  <Typography variant="h3" fontWeight="800" color="white" gutterBottom>
                    {routeData.hazards_detected.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                    Hazards Detected
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', display: 'block', mt: 1 }}>
                    {routeData.hazards_detected.length === 0 ? 'Clear route' : 'Caution advised'}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Collapse>
      </Box>

      {/* Weather Loading Indicator */}
      {weatherLoading && (
        <Alert 
          severity="info" 
          icon={<CircularProgress size={20} />}
          sx={{ mb: 2, borderRadius: 2 }}
        >
          Loading real-time weather data for waypoints...
        </Alert>
      )}

      {/* Enhanced Map Container */}
      <Paper 
        elevation={0}
        sx={{ 
          height: '700px', 
          position: 'relative', 
          overflow: 'hidden',
          borderRadius: 4,
          border: '4px solid',
          borderColor: 'divider',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
        }}
      >
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              position: 'absolute', 
              top: 16, 
              left: 16, 
              right: 16, 
              zIndex: 1000,
              borderRadius: 2,
            }}
          >
            {error}
          </Alert>
        )}
        
        {/* Enhanced Map Controls */}
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 1000,
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Stack spacing={0}>
            {/* Zoom Controls */}
            <Tooltip title="Zoom In" placement="left">
              <IconButton
                onClick={zoomIn}
                sx={{
                  borderRadius: 0,
                  '&:hover': { bgcolor: alpha('#667eea', 0.1) },
                }}
              >
                <ZoomIn />
              </IconButton>
            </Tooltip>
            
            <Divider />
            
            <Tooltip title="Zoom Out" placement="left">
              <IconButton
                onClick={zoomOut}
                sx={{
                  borderRadius: 0,
                  '&:hover': { bgcolor: alpha('#667eea', 0.1) },
                }}
              >
                <ZoomOut />
              </IconButton>
            </Tooltip>
            
            <Divider />
            
            <Tooltip title="Recenter Map" placement="left">
              <IconButton
                onClick={recenterMap}
                sx={{
                  borderRadius: 0,
                  '&:hover': { bgcolor: alpha('#667eea', 0.1) },
                }}
              >
                <CenterFocusStrong />
              </IconButton>
            </Tooltip>
            
            <Divider />
            
            <Tooltip title={showHazards ? 'Hide Hazards' : 'Show Hazards'} placement="left">
              <IconButton
                onClick={() => setShowHazards(!showHazards)}
                sx={{
                  borderRadius: 0,
                  bgcolor: showHazards ? alpha('#ff9800', 0.1) : 'transparent',
                  '&:hover': { bgcolor: alpha('#ff9800', 0.2) },
                }}
              >
                <Warning color={showHazards ? 'warning' : 'disabled'} />
              </IconButton>
            </Tooltip>
            
            <Divider />
            
            <Tooltip title={showWaypoints ? 'Hide Waypoints' : 'Show Waypoints'} placement="left">
              <IconButton
                onClick={() => setShowWaypoints(!showWaypoints)}
                sx={{
                  borderRadius: 0,
                  bgcolor: showWaypoints ? alpha('#2196f3', 0.1) : 'transparent',
                  '&:hover': { bgcolor: alpha('#2196f3', 0.2) },
                }}
              >
                <LocationOn color={showWaypoints ? 'primary' : 'disabled'} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Paper>

        {/* Map Style Selector */}
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            zIndex: 1000,
            borderRadius: 2,
            bgcolor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            p: 1,
          }}
        >
          <Stack direction="row" spacing={1}>
            <Chip
              label="Street"
              onClick={() => setMapStyle('street')}
              color={mapStyle === 'street' ? 'primary' : 'default'}
              sx={{ fontWeight: 600 }}
            />
            <Chip
              label="Satellite"
              onClick={() => setMapStyle('satellite')}
              color={mapStyle === 'satellite' ? 'primary' : 'default'}
              sx={{ fontWeight: 600 }}
            />
            <Chip
              label="Ocean"
              onClick={() => setMapStyle('ocean')}
              color={mapStyle === 'ocean' ? 'primary' : 'default'}
              sx={{ fontWeight: 600 }}
            />
          </Stack>
        </Paper>

        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
          ref={mapRef}
        >
          <MapController center={mapCenter} zoom={mapZoom} />
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url={getTileLayerUrl()}
          />

          {routeData && (
            <>
              {/* Origin Marker */}
              <Marker
                position={[routeData.origin.latitude, routeData.origin.longitude]}
                icon={originIcon}
              >
                <Popup maxWidth={300}>
                  <Box sx={{ p: 1 }}>
                    <Typography variant="h6" fontWeight="700" color="success.main" gutterBottom>
                      🚢 Origin Port
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Stack spacing={0.5}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="caption" fontWeight="600">Latitude:</Typography>
                        <Typography variant="caption">{routeData.origin.latitude.toFixed(4)}°</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="caption" fontWeight="600">Longitude:</Typography>
                        <Typography variant="caption">{routeData.origin.longitude.toFixed(4)}°</Typography>
                      </Box>
                    </Stack>
                    <Chip
                      label="Departure Point"
                      size="small"
                      color="success"
                      sx={{ mt: 1, fontWeight: 600 }}
                    />
                  </Box>
                </Popup>
              </Marker>

              {/* Destination Marker */}
              <Marker
                position={[routeData.destination.latitude, routeData.destination.longitude]}
                icon={destinationIcon}
              >
                <Popup maxWidth={300}>
                  <Box sx={{ p: 1 }}>
                    <Typography variant="h6" fontWeight="700" color="error.main" gutterBottom>
                      🏁 Destination Port
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Stack spacing={0.5}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="caption" fontWeight="600">Latitude:</Typography>
                        <Typography variant="caption">{routeData.destination.latitude.toFixed(4)}°</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="caption" fontWeight="600">Longitude:</Typography>
                        <Typography variant="caption">{routeData.destination.longitude.toFixed(4)}°</Typography>
                      </Box>
                    </Stack>
                    <Chip
                      label="Arrival Point"
                      size="small"
                      color="error"
                      sx={{ mt: 1, fontWeight: 600 }}
                    />
                  </Box>
                </Popup>
              </Marker>

              {/* Enhanced Route Path */}
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
                    weight={5}
                    opacity={0.8}
                    dashArray={avgSafety < 40 ? '10, 10' : null}
                  />
                );
              })}

              {/* Enhanced Waypoint Markers */}
              {showWaypoints && routeData.waypoints
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
                      <Popup maxWidth={350}>
                        <Box sx={{ p: 1.5 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                            <Typography variant="h6" fontWeight="700" color="primary.main">
                              📍 Waypoint #{idx + 1}
                            </Typography>
                            <Chip
                              label={`${wp.safety_score.toFixed(0)}%`}
                              size="small"
                              color={wp.safety_score > 70 ? 'success' : wp.safety_score > 40 ? 'warning' : 'error'}
                              sx={{ fontWeight: 700 }}
                            />
                          </Box>
                          
                          <Divider sx={{ my: 1.5 }} />
                          
                          {/* Location Info */}
                          <Box mb={2}>
                            <Typography variant="caption" color="text.secondary" fontWeight="600" display="block" mb={0.5}>
                              COORDINATES
                            </Typography>
                            <Stack spacing={0.5}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <LocationOn sx={{ fontSize: 16, color: 'primary.main' }} />
                                <Typography variant="body2">
                                  {wp.latitude.toFixed(4)}°, {wp.longitude.toFixed(4)}°
                                </Typography>
                              </Box>
                            </Stack>
                          </Box>
                          
                          {/* Safety Score Bar */}
                          <Box mb={2}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                              <Typography variant="caption" fontWeight="600" color="text.secondary">
                                SAFETY SCORE
                              </Typography>
                              <Typography variant="caption" fontWeight="700">
                                {wp.safety_score.toFixed(0)}/100
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={wp.safety_score}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                bgcolor: alpha('#000', 0.1),
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: getRoutePathColor(wp.safety_score),
                                  borderRadius: 4,
                                }
                              }}
                            />
                          </Box>
                          
                          {/* Hazards */}
                          {wp.hazards && wp.hazards.length > 0 && (
                            <Box mb={2}>
                              <Typography variant="caption" color="warning.main" fontWeight="700" display="block" mb={1}>
                                ⚠️ DETECTED HAZARDS
                              </Typography>
                              <Stack spacing={0.5}>
                                {wp.hazards.slice(0, 3).map((h, i) => (
                                  <Chip
                                    key={i}
                                    label={h}
                                    size="small"
                                    color="warning"
                                    variant="outlined"
                                    sx={{ 
                                      justifyContent: 'flex-start',
                                      '& .MuiChip-label': { fontSize: '0.7rem' }
                                    }}
                                  />
                                ))}
                              </Stack>
                            </Box>
                          )}
                          
                          {/* Weather Data */}
                          {weather && (
                            <Box>
                              <Typography variant="caption" color="info.main" fontWeight="700" display="block" mb={1}>
                                🌊 REAL-TIME CONDITIONS
                              </Typography>
                              <Grid container spacing={1}>
                                {weather.wave_height_m !== undefined && (
                                  <Grid item xs={6}>
                                    <Paper elevation={0} sx={{ p: 1, bgcolor: alpha('#2196f3', 0.05), borderRadius: 1 }}>
                                      <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                                        <Waves sx={{ fontSize: 16, color: 'info.main' }} />
                                        <Typography variant="caption" fontWeight="600">Waves</Typography>
                                      </Box>
                                      <Typography variant="body2" fontWeight="700">
                                        {weather.wave_height_m.toFixed(1)}m
                                      </Typography>
                                    </Paper>
                                  </Grid>
                                )}
                                {weather.current_velocity_ms !== undefined && (
                                  <Grid item xs={6}>
                                    <Paper elevation={0} sx={{ p: 1, bgcolor: alpha('#2196f3', 0.05), borderRadius: 1 }}>
                                      <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                                        <Air sx={{ fontSize: 16, color: 'info.main' }} />
                                        <Typography variant="caption" fontWeight="600">Current</Typography>
                                      </Box>
                                      <Typography variant="body2" fontWeight="700">
                                        {weather.current_velocity_ms.toFixed(1)} m/s
                                      </Typography>
                                    </Paper>
                                  </Grid>
                                )}
                                {weather.sea_temperature_c !== undefined && (
                                  <Grid item xs={6}>
                                    <Paper elevation={0} sx={{ p: 1, bgcolor: alpha('#2196f3', 0.05), borderRadius: 1 }}>
                                      <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                                        <ThermostatAuto sx={{ fontSize: 16, color: 'info.main' }} />
                                        <Typography variant="caption" fontWeight="600">Sea Temp</Typography>
                                      </Box>
                                      <Typography variant="body2" fontWeight="700">
                                        {weather.sea_temperature_c.toFixed(1)}°C
                                      </Typography>
                                    </Paper>
                                  </Grid>
                                )}
                                {weather.wind_speed_ms !== undefined && (
                                  <Grid item xs={6}>
                                    <Paper elevation={0} sx={{ p: 1, bgcolor: alpha('#2196f3', 0.05), borderRadius: 1 }}>
                                      <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                                        <Speed sx={{ fontSize: 16, color: 'info.main' }} />
                                        <Typography variant="caption" fontWeight="600">Wind</Typography>
                                      </Box>
                                      <Typography variant="body2" fontWeight="700">
                                        {weather.wind_speed_ms.toFixed(1)} m/s
                                      </Typography>
                                    </Paper>
                                  </Grid>
                                )}
                              </Grid>
                            </Box>
                          )}
                        </Box>
                      </Popup>
                    </Marker>
                  );
                })}

              {/* Enhanced Hazard Zones */}
              {showHazards && routeData.hazards_detected.map((hazard, idx) => (
                <Circle
                  key={idx}
                  center={[hazard.location?.lat || 0, hazard.location?.lon || 0]}
                  radius={hazard.radius_km ? hazard.radius_km * 1000 : 50000}
                  pathOptions={{
                    color: '#f44336',
                    fillColor: '#f44336',
                    fillOpacity: 0.15,
                    weight: 3,
                    dashArray: '5, 10',
                  }}
                >
                  <Popup maxWidth={300}>
                    <Box sx={{ p: 1.5 }}>
                      <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                        <Warning sx={{ color: 'error.main', fontSize: 24 }} />
                        <Typography variant="h6" fontWeight="700" color="error.main">
                          {hazard.type.replace('_', ' ').toUpperCase()}
                        </Typography>
                      </Box>
                      
                      <Divider sx={{ my: 1.5 }} />
                      
                      <Typography variant="body2" mb={2}>
                        {hazard.description}
                      </Typography>
                      
                      <Stack spacing={1}>
                        <Chip
                          icon={<Warning />}
                          label={`Severity: ${hazard.severity.toUpperCase()}`}
                          color="error"
                          size="small"
                          sx={{ fontWeight: 700 }}
                        />
                        {hazard.location && (
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {hazard.location.lat.toFixed(2)}°, {hazard.location.lon.toFixed(2)}°
                            </Typography>
                          </Box>
                        )}
                        {hazard.radius_km && (
                          <Typography variant="caption" color="text.secondary">
                            Radius: {hazard.radius_km} km
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  </Popup>
                </Circle>
              ))}
            </>
          )}
        </MapContainer>
      </Paper>

      {/* AI Recommendations Section */}
      {routeData && routeData.recommendations && (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mt: 3,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #E3F2FD 0%, #E8F5E9 100%)',
            border: '2px solid',
            borderColor: alpha('#1976d2', 0.2),
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 5,
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
            }
          }}
        >
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              }}
            >
              <Info sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="800" color="primary.dark">
                AI-Powered Route Intelligence
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Smart recommendations for optimal voyage planning
              </Typography>
            </Box>
          </Box>
          
          <Typography
            variant="body1"
            sx={{
              whiteSpace: 'pre-line',
              lineHeight: 1.8,
              color: 'text.primary',
              fontSize: '1.05rem',
              pl: 2,
              borderLeft: '4px solid',
              borderColor: 'primary.main',
              fontWeight: 500,
            }}
          >
            {routeData.recommendations}
          </Typography>
        </Paper>
      )}

      {/* Enhanced Map Legend */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mt: 3,
          borderRadius: 3,
          border: '2px solid',
          borderColor: 'divider',
        }}
      >
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <Timeline sx={{ color: 'primary.main', fontSize: 28 }} />
          <Typography variant="h6" fontWeight="700">
            Route Safety Legend
          </Typography>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha('#4caf50', 0.05),
                border: '2px solid',
                borderColor: alpha('#4caf50', 0.3),
              }}
            >
              <Box display="flex" alignItems="center" gap={1.5}>
                <Box
                  sx={{
                    width: 30,
                    height: 6,
                    bgcolor: '#4caf50',
                    borderRadius: 1,
                  }}
                />
                <Box>
                  <Typography variant="body2" fontWeight="700">
                    Very Safe
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    80-100 Safety Score
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha('#8bc34a', 0.05),
                border: '2px solid',
                borderColor: alpha('#8bc34a', 0.3),
              }}
            >
              <Box display="flex" alignItems="center" gap={1.5}>
                <Box
                  sx={{
                    width: 30,
                    height: 6,
                    bgcolor: '#8bc34a',
                    borderRadius: 1,
                  }}
                />
                <Box>
                  <Typography variant="body2" fontWeight="700">
                    Safe
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    60-80 Safety Score
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha('#ff9800', 0.05),
                border: '2px solid',
                borderColor: alpha('#ff9800', 0.3),
              }}
            >
              <Box display="flex" alignItems="center" gap={1.5}>
                <Box
                  sx={{
                    width: 30,
                    height: 6,
                    bgcolor: '#ff9800',
                    borderRadius: 1,
                  }}
                />
                <Box>
                  <Typography variant="body2" fontWeight="700">
                    Moderate
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    40-60 Safety Score
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha('#f44336', 0.05),
                border: '2px solid',
                borderColor: alpha('#f44336', 0.3),
              }}
            >
              <Box display="flex" alignItems="center" gap={1.5}>
                <Box
                  sx={{
                    width: 30,
                    height: 6,
                    bgcolor: '#f44336',
                    borderRadius: 1,
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,.3) 5px, rgba(255,255,255,.3) 10px)',
                  }}
                />
                <Box>
                  <Typography variant="body2" fontWeight="700">
                    Risky
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    0-40 Safety Score
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Map Icons Legend */}
        <Typography variant="subtitle2" fontWeight="700" gutterBottom mb={2}>
          Map Markers
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={4} md={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography sx={{ fontSize: 24 }}>🚢</Typography>
              <Typography variant="caption" fontWeight="600">Origin Port</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={4} md={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography sx={{ fontSize: 24 }}>🏁</Typography>
              <Typography variant="caption" fontWeight="600">Destination Port</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={4} md={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography sx={{ fontSize: 24 }}>📍</Typography>
              <Typography variant="caption" fontWeight="600">Waypoint</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={4} md={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography sx={{ fontSize: 24 }}>⚠️</Typography>
              <Typography variant="caption" fontWeight="600">Hazard Zone</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Route Statistics Summary */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mt: 3,
          borderRadius: 3,
          border: '2px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" fontWeight="700" gutterBottom mb={3}>
          Route Statistics
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box textAlign="center" p={2}>
              <NavigationIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="700" color="primary.main">
                {routeData.waypoints.length}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight="600">
                Total Waypoints
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box textAlign="center" p={2}>
              <Speed sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="700" color="secondary.main">
                {(routeData.total_distance_nm / (routeData.estimated_duration_hours / 24)).toFixed(1)}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight="600">
                Avg. Speed (nm/day)
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box textAlign="center" p={2}>
              <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="700" color="success.main">
                {routeData.waypoints.filter(w => w.safety_score > 70).length}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight="600">
                Safe Waypoints
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default MaritimeRouteMapView;