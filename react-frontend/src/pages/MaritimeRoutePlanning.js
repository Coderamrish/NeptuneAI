import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Tabs,
  Tab,
  Alert,
  Chip,
  Paper,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Autocomplete,
  LinearProgress,
  Stack,
  alpha,
  IconButton,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  DirectionsBoat,
  Warning,
  Navigation as NavigationIcon,
  Place,
  Schedule,
  TrendingUp,
  CheckCircle,
  Cancel,
  ErrorOutline,
  Map as MapIcon,
  Speed,
  LocalShipping,
  WbSunny,
  Air,
  Waves,
  LocationOn,
  SwapHoriz,
  Refresh,
  Info,
} from '@mui/icons-material';
import MaritimeRouteMapView from './MaritimeRouteMapView';

const API_BASE_URL = 'http://localhost:8000';

// Major ports in India and worldwide
const MAJOR_PORTS = {
  india: [
    { name: 'Mumbai (INNSA)', lat: 19.0, lon: 72.8, country: 'India' },
    { name: 'Chennai (INMAA)', lat: 13.1, lon: 80.3, country: 'India' },
    { name: 'Kolkata (INCCU)', lat: 22.6, lon: 88.4, country: 'India' },
    { name: 'Visakhapatnam (INVTZ)', lat: 17.7, lon: 83.3, country: 'India' },
    { name: 'Kochi (INCOK)', lat: 9.9, lon: 76.3, country: 'India' },
    { name: 'Kandla (INKAN)', lat: 23.0, lon: 70.2, country: 'India' },
    { name: 'Tuticorin (INTUT)', lat: 8.8, lon: 78.2, country: 'India' },
    { name: 'Paradip (INPPT)', lat: 20.3, lon: 86.7, country: 'India' },
    { name: 'New Mangalore (INNMP)', lat: 12.9, lon: 74.8, country: 'India' },
    { name: 'Ennore (INENR)', lat: 13.2, lon: 80.3, country: 'India' },
  ],
  international: [
    { name: 'Singapore (SGSIN)', lat: 1.3, lon: 103.8, country: 'Singapore' },
    { name: 'Shanghai (CNSHA)', lat: 31.2, lon: 121.5, country: 'China' },
    { name: 'Dubai (AEDXB)', lat: 25.3, lon: 55.3, country: 'UAE' },
    { name: 'Rotterdam (NLRTM)', lat: 51.9, lon: 4.5, country: 'Netherlands' },
    { name: 'New York (USNYC)', lat: 40.7, lon: -74.0, country: 'USA' },
    { name: 'Los Angeles (USLAX)', lat: 33.7, lon: -118.2, country: 'USA' },
    { name: 'Tokyo (JPTYO)', lat: 35.7, lon: 139.7, country: 'Japan' },
    { name: 'Hong Kong (HKHKG)', lat: 22.3, lon: 114.2, country: 'Hong Kong' },
    { name: 'Busan (KRPUS)', lat: 35.1, lon: 129.0, country: 'South Korea' },
    { name: 'Hamburg (DEHAM)', lat: 53.5, lon: 9.9, country: 'Germany' },
    { name: 'Antwerp (BEANR)', lat: 51.2, lon: 4.4, country: 'Belgium' },
    { name: 'Port Said (EGPSD)', lat: 31.3, lon: 32.3, country: 'Egypt' },
    { name: 'Colombo (LKCMB)', lat: 6.9, lon: 79.8, country: 'Sri Lanka' },
    { name: 'Port Klang (MYPKG)', lat: 3.0, lon: 101.4, country: 'Malaysia' },
    { name: 'Jebel Ali (AEJEA)', lat: 25.0, lon: 55.0, country: 'UAE' },
  ]
};

const ALL_PORTS = [...MAJOR_PORTS.india, ...MAJOR_PORTS.international];

const SHIP_TYPES = [
  { value: 'cargo', label: 'Cargo Ship', speed: '15 knots', icon: '🚢' },
  { value: 'container', label: 'Container Ship', speed: '20 knots', icon: '📦' },
  { value: 'tanker', label: 'Oil Tanker', speed: '14 knots', icon: '🛢️' },
  { value: 'cruise', label: 'Cruise Ship', speed: '22 knots', icon: '🛳️' },
  { value: 'ferry', label: 'Ferry', speed: '18 knots', icon: '⛴️' },
];

const MaritimeRoutePlanning = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [routeData, setRouteData] = useState(null);
  const [calamities, setCalamities] = useState([]);
  const [popularRoutes, setPopularRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [shipType, setShipType] = useState('cargo');
  const [departureTime, setDepartureTime] = useState('');

  const getAuthHeaders = () => {
    const token = localStorage.getItem('neptuneai_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const loadPopularRoutes = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/maritime/route/popular`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.success) {
        setPopularRoutes(data.routes || []);
      }
    } catch (error) {
      console.error('Error loading popular routes:', error);
      setError('Failed to load popular routes. Please try again.');
    }
  }, []);

  useEffect(() => {
    loadPopularRoutes();
  }, [loadPopularRoutes]);

  const calculateRoute = async () => {
    if (!origin || !destination) {
      setError('Please select both origin and destination ports');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/maritime/route/calculate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          origin_lat: parseFloat(origin.lat),
          origin_lon: parseFloat(origin.lon),
          destination_lat: parseFloat(destination.lat),
          destination_lon: parseFloat(destination.lon),
          ship_type: shipType,
          departure_time: departureTime || null
        })
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.success) {
        setRouteData(data.route);
        setActiveTab(3); 
      } else {
        setError(data.detail || 'Failed to calculate route');
      }
    } catch (error) {
      console.error('Route calculation error:', error);
      setError('Failed to calculate route. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const checkCalamities = async (port) => {
    if (!port) {
      setError('Please select a port');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/maritime/calamity/detect`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          latitude: parseFloat(port.lat),
          longitude: parseFloat(port.lon),
          radius_km: 500
        })
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.success) {
        setCalamities(data.calamities || []);
        setActiveTab(2);
      }
    } catch (error) {
      console.error('Calamity detection error:', error);
      setError('Failed to check calamities. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const usePopularRoute = (route) => {
    setOrigin({ 
      lat: route.origin.lat, 
      lon: route.origin.lon,
      name: route.origin.name 
    });
    setDestination({ 
      lat: route.destination.lat, 
      lon: route.destination.lon,
      name: route.destination.name 
    });
    setActiveTab(0);
  };

  const swapPorts = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const getSafetyColor = (safety) => {
    const colors = {
      safe: 'success',
      moderate: 'warning',
      risky: 'warning',
      dangerous: 'error',
      critical: 'error',
      unknown: 'default'
    };
    return colors[safety] || 'default';
  };

  const getSafetyIcon = (safety) => {
    switch(safety) {
      case 'safe': return <CheckCircle />;
      case 'moderate': return <ErrorOutline />;
      case 'dangerous': return <Cancel />;
      case 'critical': return <Warning />;
      default: return <ErrorOutline />;
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0A1929 0%, #1A2332 50%, #0A1929 100%)',
      pb: 6
    }}>
      <Container maxWidth="xl" sx={{ pt: 4 }}>
        {/* Stunning Header */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            mb: 4, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            }
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between" position="relative" zIndex={1}>
            <Box display="flex" alignItems="center" gap={3}>
              <Box 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.25)', 
                  p: 2.5, 
                  borderRadius: 3,
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                }}
              >
                <DirectionsBoat sx={{ fontSize: 48, color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h2" fontWeight="800" color="white" sx={{ 
                  letterSpacing: '-0.02em',
                  textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                }}>
                  Neptune AI
                </Typography>
                <Typography variant="h6" color="rgba(255,255,255,0.95)" sx={{ mt: 0.5 }}>
                  Intelligent Maritime Route Planning & Safety Analysis
                </Typography>
              </Box>
            </Box>
            <Box>
              <Chip 
                icon={<Waves sx={{ color: 'white !important' }} />}
                label="Real-time Weather Data" 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  fontWeight: 600,
                  backdropFilter: 'blur(10px)',
                  mb: 1
                }} 
              />
              <Chip 
                icon={<CheckCircle sx={{ color: 'white !important' }} />}
                label="AI-Powered Analysis" 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  fontWeight: 600,
                  backdropFilter: 'blur(10px)',
                  ml: 1
                }} 
              />
            </Box>
          </Box>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            onClose={() => setError(null)} 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              boxShadow: 3
            }}
          >
            {error}
          </Alert>
        )}

        {/* Enhanced Tabs */}
        <Paper 
          elevation={0} 
          sx={{ 
            mb: 3,
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Tabs 
            value={activeTab} 
            onChange={(e, val) => setActiveTab(val)} 
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                py: 2.5,
                fontSize: '0.95rem',
                fontWeight: 600,
                textTransform: 'none',
                minHeight: 72
              },
              '& .Mui-selected': {
                color: '#667eea !important'
              },
              '& .MuiTabs-indicator': {
                height: 4,
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
              }
            }}
          >
            <Tab label="Route Planner" icon={<NavigationIcon />} iconPosition="start" />
            <Tab label="Popular Routes" icon={<TrendingUp />} iconPosition="start" />
            <Tab label="Hazard Alerts" icon={<Warning />} iconPosition="start" />
            <Tab label="Route Analysis" icon={<CheckCircle />} iconPosition="start" disabled={!routeData} />
            <Tab label="Map View" icon={<MapIcon />} iconPosition="start" disabled={!routeData} />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            borderRadius: 3,
            bgcolor: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
          }}
        >
          {/* Planner Tab */}
          {activeTab === 0 && (
            <Box>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
                <Box>
                  <Typography variant="h4" fontWeight="700" color="primary.main" gutterBottom>
                    Plan Your Maritime Route
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Select origin and destination ports to calculate the safest and most efficient route
                  </Typography>
                </Box>
                <IconButton 
                  onClick={loadPopularRoutes}
                  sx={{ 
                    bgcolor: alpha('#667eea', 0.1),
                    '&:hover': { bgcolor: alpha('#667eea', 0.2) }
                  }}
                >
                  <Refresh />
                </IconButton>
              </Box>
              
              <Grid container spacing={3}>
                {/* Origin Port */}
                <Grid item xs={12} md={5.5}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3, 
                      borderRadius: 2,
                      border: '2px solid',
                      borderColor: origin ? 'success.main' : 'divider',
                      bgcolor: origin ? alpha('#4caf50', 0.05) : 'background.paper',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <LocationOn sx={{ color: 'success.main', fontSize: 28 }} />
                      <Typography variant="h6" fontWeight="700">
                        Origin Port
                      </Typography>
                    </Box>
                    <Autocomplete
                      options={ALL_PORTS}
                      groupBy={(option) => option.country}
                      getOptionLabel={(option) => option.name}
                      value={origin}
                      onChange={(event, newValue) => setOrigin(newValue)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Origin Port"
                          placeholder="Search ports..."
                          variant="outlined"
                        />
                      )}
                      renderOption={(props, option) => (
                        <li {...props}>
                          <Box>
                            <Typography variant="body1" fontWeight="600">{option.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {option.lat.toFixed(2)}°, {option.lon.toFixed(2)}°
                            </Typography>
                          </Box>
                        </li>
                      )}
                    />
                    {origin && (
                      <Box 
                        mt={2} 
                        p={2} 
                        sx={{ 
                          bgcolor: alpha('#4caf50', 0.1),
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: alpha('#4caf50', 0.3)
                        }}
                      >
                        <Typography variant="body2" fontWeight="700" color="success.dark">
                          ✓ {origin.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {origin.lat.toFixed(4)}°, {origin.lon.toFixed(4)}°
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>

                {/* Swap Button */}
                <Grid item xs={12} md={1} display="flex" alignItems="center" justifyContent="center">
                  <Tooltip title="Swap ports">
                    <IconButton 
                      onClick={swapPorts}
                      disabled={!origin && !destination}
                      sx={{ 
                        bgcolor: alpha('#667eea', 0.1),
                        '&:hover': { 
                          bgcolor: alpha('#667eea', 0.2),
                          transform: 'rotate(180deg)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <SwapHoriz />
                    </IconButton>
                  </Tooltip>
                </Grid>

                {/* Destination Port */}
                <Grid item xs={12} md={5.5}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3, 
                      borderRadius: 2,
                      border: '2px solid',
                      borderColor: destination ? 'error.main' : 'divider',
                      bgcolor: destination ? alpha('#f44336', 0.05) : 'background.paper',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <Place sx={{ color: 'error.main', fontSize: 28 }} />
                      <Typography variant="h6" fontWeight="700">
                        Destination Port
                      </Typography>
                    </Box>
                    <Autocomplete
                      options={ALL_PORTS}
                      groupBy={(option) => option.country}
                      getOptionLabel={(option) => option.name}
                      value={destination}
                      onChange={(event, newValue) => setDestination(newValue)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Destination Port"
                          placeholder="Search ports..."
                          variant="outlined"
                        />
                      )}
                      renderOption={(props, option) => (
                        <li {...props}>
                          <Box>
                            <Typography variant="body1" fontWeight="600">{option.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {option.lat.toFixed(2)}°, {option.lon.toFixed(2)}°
                            </Typography>
                          </Box>
                        </li>
                      )}
                    />
                    {destination && (
                      <Box 
                        mt={2} 
                        p={2} 
                        sx={{ 
                          bgcolor: alpha('#f44336', 0.1),
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: alpha('#f44336', 0.3)
                        }}
                      >
                        <Typography variant="body2" fontWeight="700" color="error.dark">
                          ✓ {destination.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {destination.lat.toFixed(4)}°, {destination.lon.toFixed(4)}°
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>

                {/* Ship Configuration */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Ship Type</InputLabel>
                    <Select
                      value={shipType}
                      label="Ship Type"
                      onChange={(e) => setShipType(e.target.value)}
                      sx={{ 
                        bgcolor: 'background.paper',
                        '& .MuiSelect-select': {
                          py: 2
                        }
                      }}
                    >
                      {SHIP_TYPES.map(ship => (
                        <MenuItem key={ship.value} value={ship.value}>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Typography sx={{ fontSize: 24 }}>{ship.icon}</Typography>
                            <Box>
                              <Typography variant="body1" fontWeight="600">
                                {ship.label}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Average Speed: {ship.speed}
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="datetime-local"
                    label="Departure Time (Optional)"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ 
                      bgcolor: 'background.paper',
                      '& .MuiInputBase-root': {
                        py: 1
                      }
                    }}
                  />
                </Grid>

                {/* Quick Suggestions */}
                <Grid item xs={12}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3, 
                      borderRadius: 2,
                      bgcolor: alpha('#667eea', 0.05),
                      border: '1px solid',
                      borderColor: alpha('#667eea', 0.2)
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <Info sx={{ color: 'primary.main' }} />
                      <Typography variant="subtitle1" fontWeight="700">
                        Quick Route Suggestions
                      </Typography>
                    </Box>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {MAJOR_PORTS.india.slice(0, 3).map((indiaPort) => (
                        MAJOR_PORTS.international.slice(0, 3).map((intlPort) => (
                          <Chip
                            key={`${indiaPort.name}-${intlPort.name}`}
                            label={`${indiaPort.name.split(' ')[0]} → ${intlPort.name.split(' ')[0]}`}
                            onClick={() => {
                              setOrigin(indiaPort);
                              setDestination(intlPort);
                            }}
                            variant="outlined"
                            sx={{ 
                              fontWeight: 600,
                              '&:hover': {
                                bgcolor: alpha('#667eea', 0.1),
                                borderColor: 'primary.main'
                              }
                            }}
                          />
                        ))
                      ))}
                    </Box>
                  </Paper>
                </Grid>

                {/* Action Buttons */}
                <Grid item xs={12}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={calculateRoute}
                      disabled={loading || !origin || !destination}
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <NavigationIcon />}
                      sx={{ 
                        py: 2,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                        '&:hover': {
                          boxShadow: '0 6px 25px rgba(102, 126, 234, 0.5)',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {loading ? 'Calculating Route...' : 'Calculate Optimal Route'}
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      color="warning"
                      onClick={() => checkCalamities(origin)}
                      disabled={loading || !origin}
                      startIcon={<Warning />}
                      sx={{ 
                        py: 2,
                        fontWeight: 700,
                        borderWidth: 2,
                        '&:hover': {
                          borderWidth: 2,
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Check Hazards
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Popular Routes Tab */}
          {activeTab === 1 && (
            <Box>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
                <Box>
                  <Typography variant="h4" fontWeight="700" color="primary.main" gutterBottom>
                    Popular Shipping Routes
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Most frequently used maritime corridors with real-time safety status
                  </Typography>
                </Box>
                <Badge badgeContent={popularRoutes.length} color="primary">
                  <TrendingUp sx={{ fontSize: 40, color: 'primary.main' }} />
                </Badge>
              </Box>
              
              {popularRoutes.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <CircularProgress size={60} thickness={4} />
                  <Typography variant="h6" color="text.secondary" mt={3}>
                    Loading popular routes...
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {popularRoutes.map((route, idx) => (
                    <Grid item xs={12} md={6} lg={4} key={idx}>
                      <Card 
                        variant="outlined"
                        sx={{ 
                          height: '100%',
                          borderRadius: 3,
                          border: '2px solid',
                          borderColor: 'divider',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: 'primary.main',
                            transform: 'translateY(-8px)',
                            boxShadow: '0 12px 30px rgba(102, 126, 234, 0.2)'
                          }
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                            <Box>
                              <Typography variant="h6" fontWeight="700" gutterBottom>
                                {route.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                                <LocationOn sx={{ fontSize: 16 }} />
                                {route.origin.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                                <Place sx={{ fontSize: 16 }} />
                                {route.destination.name}
                              </Typography>
                            </Box>
                            {route.current_safety && (
                              <Chip
                                icon={getSafetyIcon(route.current_safety)}
                                label={route.current_safety.toUpperCase()}
                                color={getSafetyColor(route.current_safety)}
                                size="small"
                                sx={{ fontWeight: 700 }}
                              />
                            )}
                          </Box>
                          
                          <Divider sx={{ my: 2 }} />
                          
                          <Stack spacing={1.5}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Box display="flex" alignItems="center" gap={1}>
                                <NavigationIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                                <Typography variant="body2" color="text.secondary">Distance:</Typography>
                              </Box>
                              <Typography variant="body2" fontWeight="700">
                                {route.distance_nm.toFixed(0)} nm
                              </Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Box display="flex" alignItems="center" gap={1}>
                                <Schedule sx={{ fontSize: 18, color: 'primary.main' }} />
                                <Typography variant="body2" color="text.secondary">Duration:</Typography>
                              </Box>
                              <Typography variant="body2" fontWeight="700">
                                {(route.typical_duration_hours / 24).toFixed(1)} days
                              </Typography>
                            </Box>
                          </Stack>
                          
                          <Button
                            fullWidth
                            variant="contained"
                            onClick={() => usePopularRoute(route)}
                            sx={{ 
                              mt: 3,
                              py: 1.5,
                              fontWeight: 700,
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              '&:hover': {
                                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                              }
                            }}
                          >
                            Use This Route
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

          {/* Calamities Tab */}
          {activeTab === 2 && (
            <Box>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
                <Box>
                  <Typography variant="h4" fontWeight="700" color="primary.main" gutterBottom>
                    Maritime Hazard Alerts
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Real-time detection of storms, piracy zones, and other maritime dangers
                  </Typography>
                </Box>
                <Badge badgeContent={calamities.length} color="error">
                  <Warning sx={{ fontSize: 40, color: 'error.main' }} />
                </Badge>
              </Box>
              
              {calamities.length === 0 ? (
                <Paper 
                  elevation={0}
                  sx={{ 
                    textAlign: 'center', 
                    py: 8,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)'
                  }}
                >
                  <CheckCircle sx={{ fontSize: 100, color: 'success.main', mb: 3 }} />
                  <Typography variant="h4" fontWeight="700" color="success.dark" gutterBottom>
                    All Clear!
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    No hazards detected in the selected area
                  </Typography>
                </Paper>
              ) : (
                <Grid container spacing={3}>
                  {calamities.map((c, idx) => (
                    <Grid item xs={12} key={idx}>
                      <Alert
                        severity={c.severity === 'critical' ? 'error' : c.severity === 'dangerous' ? 'warning' : 'info'}
                        sx={{ 
                          borderRadius: 2,
                          border: '2px solid',
                          borderColor: c.severity === 'critical' ? 'error.main' : c.severity === 'dangerous' ? 'warning.main' : 'info.main',
                          '& .MuiAlert-message': {
                            width: '100%'
                          }
                        }}
                        icon={<Warning sx={{ fontSize: 28 }} />}
                      >
                        <Box>
                          <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                            <Typography variant="h6" fontWeight="700">
                              {c.type.replace('_', ' ').toUpperCase()}
                            </Typography>
                            <Chip 
                              label={c.severity.toUpperCase()} 
                              size="small"
                              color={c.severity === 'critical' ? 'error' : c.severity === 'dangerous' ? 'warning' : 'info'}
                              sx={{ fontWeight: 700 }}
                            />
                          </Box>
                          <Typography variant="body1" sx={{ mb: 2 }}>
                            {c.description}
                          </Typography>
                          <Box display="flex" gap={3}>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <LocationOn sx={{ fontSize: 18 }} />
                              <Typography variant="caption" fontWeight="600">
                                Location: {c.location.lat.toFixed(2)}°, {c.location.lon.toFixed(2)}°
                              </Typography>
                            </Box>
                            {c.radius_km && (
                              <Typography variant="caption" fontWeight="600">
                                Radius: {c.radius_km} km
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Alert>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

          {/* Results Tab */}
          {activeTab === 3 && routeData && (
            <Box>
              <Box mb={4}>
                <Typography variant="h4" fontWeight="700" color="primary.main" gutterBottom>
                  Route Analysis & Recommendations
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {origin?.name} → {destination?.name}
                </Typography>
              </Box>
              
              {/* Stats Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: -50,
                        right: -50,
                        width: 150,
                        height: 150,
                        borderRadius: '50%',
                        bgcolor: 'rgba(255,255,255,0.1)'
                      }
                    }}
                  >
                    <NavigationIcon sx={{ fontSize: 40, mb: 2, opacity: 0.9 }} />
                    <Typography variant="h3" fontWeight="800" sx={{ mb: 0.5 }}>
                      {routeData.total_distance_nm.toFixed(0)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 600 }}>
                      Nautical Miles
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      color: 'white',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: -50,
                        right: -50,
                        width: 150,
                        height: 150,
                        borderRadius: '50%',
                        bgcolor: 'rgba(255,255,255,0.1)'
                      }
                    }}
                  >
                    <Schedule sx={{ fontSize: 40, mb: 2, opacity: 0.9 }} />
                    <Typography variant="h3" fontWeight="800" sx={{ mb: 0.5 }}>
                      {(routeData.estimated_duration_hours / 24).toFixed(1)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 600 }}>
                      Days
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                      color: 'white',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: -50,
                        right: -50,
                        width: 150,
                        height: 150,
                        borderRadius: '50%',
                        bgcolor: 'rgba(255,255,255,0.1)'
                      }
                    }}
                  >
                    <Warning sx={{ fontSize: 40, mb: 2, opacity: 0.9 }} />
                    <Typography variant="h3" fontWeight="800" sx={{ mb: 0.5 }}>
                      {routeData.hazards_detected.length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 600 }}>
                      Hazards Detected
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
                      color: 'white',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: -50,
                        right: -50,
                        width: 150,
                        height: 150,
                        borderRadius: '50%',
                        bgcolor: 'rgba(255,255,255,0.1)'
                      }
                    }}
                  >
                    <CheckCircle sx={{ fontSize: 40, mb: 2, opacity: 0.9 }} />
                    <Typography variant="h3" fontWeight="800" sx={{ mb: 0.5 }}>
                      {routeData.waypoints.length}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 600 }}>
                      Waypoints
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* AI Recommendations */}
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  mb: 4,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #E3F2FD 0%, #E8F5E9 100%)',
                  border: '2px solid',
                  borderColor: alpha('#1976d2', 0.2),
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '" "',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
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
                      justifyContent: 'center'
                    }}
                  >
                    <DirectionsBoat sx={{ fontSize: 32, color: 'white' }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight="800" color="primary.dark">
                      AI-Powered Recommendations
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Smart insights for optimal voyage planning
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
                    fontWeight: 500
                  }}
                >
                  {routeData.recommendations}
                </Typography>
              </Paper>
           
              {/* Hazards Section */}
              {routeData.hazards_detected.length > 0 && (
                <Box>
                  <Typography variant="h5" fontWeight="700" gutterBottom sx={{ mb: 3 }}>
                    Detected Hazards Along Route
                  </Typography>
                  <Grid container spacing={2}>
                    {routeData.hazards_detected.slice(0, 6).map((h, idx) => (
                      <Grid item xs={12} md={6} key={idx}>
                        <Alert 
                          severity="warning" 
                          sx={{ 
                            borderRadius: 2,
                            border: '2px solid',
                            borderColor: 'warning.main',
                            '& .MuiAlert-icon': {
                              fontSize: 28
                            }
                          }}
                        >
                          <Typography variant="subtitle1" fontWeight="700" gutterBottom>
                            {h.type.toUpperCase()}
                          </Typography>
                          <Typography variant="body2">
                            {h.description}
                          </Typography>
                          {h.location && (
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                              Location: {h.location.lat?.toFixed(2)}°, {h.location.lon?.toFixed(2)}°
                            </Typography>
                          )}
                        </Alert>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              <Box mt={4}>
                <Button
                  variant="contained"
                  startIcon={<MapIcon />}
                  onClick={() => setActiveTab(4)}
                  fullWidth
                  size="large"
                  sx={{ 
                    py: 2,
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                    '&:hover': {
                      boxShadow: '0 6px 25px rgba(102, 126, 234, 0.5)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  View Interactive Map
                </Button>
              </Box>
            </Box>
          )}

          {/* Map View Tab */}
          {activeTab === 4 && routeData && (
            <MaritimeRouteMapView routeData={routeData} />
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default MaritimeRoutePlanning;