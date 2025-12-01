import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    loadPopularRoutes();
  }, []);

  const loadPopularRoutes = async () => {
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
  };

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
        setActiveTab(4); 
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #1976d2 0%, #00bcd4 100%)' }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', p: 2, borderRadius: 2 }}>
            <DirectionsBoat sx={{ fontSize: 40, color: 'white' }} />
          </Box>
          <Box>
            <Typography variant="h3" fontWeight="bold" color="white">
              Maritime Route Planning
            </Typography>
            <Typography variant="body1" color="rgba(255,255,255,0.9)">
              AI-Powered Safe Navigation - India to Global Ports
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} variant="fullWidth">
          <Tab label="Planner" icon={<NavigationIcon />} />
          <Tab label="Popular Routes" icon={<TrendingUp />} />
          <Tab label="Calamities" icon={<Warning />} />
          <Tab label="Results" icon={<CheckCircle />} disabled={!routeData} />
          <Tab label="Map View" icon={<MapIcon />} disabled={!routeData} />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <Paper elevation={2} sx={{ p: 4 }}>
        {/* Planner Tab */}
        {activeTab === 0 && (
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Plan Your Route
            </Typography>
            
            <Grid container spacing={3} sx={{ mt: 2 }}>
              {/* Origin Port Selection */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  <Place sx={{ verticalAlign: 'middle', color: 'success.main' }} /> Origin Port
                </Typography>
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
                      placeholder="Search for a port..."
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Box>
                        <Typography variant="body2">{option.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.lat.toFixed(2)}°, {option.lon.toFixed(2)}°
                        </Typography>
                      </Box>
                    </li>
                  )}
                />
                {origin && (
                  <Box mt={2} p={2} bgcolor="success.lighter" borderRadius={1}>
                    <Typography variant="body2" fontWeight="bold">
                      Selected: {origin.name}
                    </Typography>
                    <Typography variant="caption">
                      Coordinates: {origin.lat.toFixed(4)}°, {origin.lon.toFixed(4)}°
                    </Typography>
                  </Box>
                )}
              </Grid>

              {/* Destination Port Selection */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  <Place sx={{ verticalAlign: 'middle', color: 'error.main' }} /> Destination Port
                </Typography>
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
                      placeholder="Search for a port..."
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Box>
                        <Typography variant="body2">{option.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.lat.toFixed(2)}°, {option.lon.toFixed(2)}°
                        </Typography>
                      </Box>
                    </li>
                  )}
                />
                {destination && (
                  <Box mt={2} p={2} bgcolor="error.lighter" borderRadius={1}>
                    <Typography variant="body2" fontWeight="bold">
                      Selected: {destination.name}
                    </Typography>
                    <Typography variant="caption">
                      Coordinates: {destination.lat.toFixed(4)}°, {destination.lon.toFixed(4)}°
                    </Typography>
                  </Box>
                )}
              </Grid>

              {/* Ship Type & Departure */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Ship Type</InputLabel>
                  <Select
                    value={shipType}
                    label="Ship Type"
                    onChange={(e) => setShipType(e.target.value)}
                  >
                    <MenuItem value="cargo">Cargo Ship (15 knots)</MenuItem>
                    <MenuItem value="container">Container Ship (20 knots)</MenuItem>
                    <MenuItem value="tanker">Oil Tanker (14 knots)</MenuItem>
                    <MenuItem value="cruise">Cruise Ship (22 knots)</MenuItem>
                    <MenuItem value="ferry">Ferry (18 knots)</MenuItem>
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
                />
              </Grid>

              {/* Quick Port Suggestions */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Popular Routes from India:
                </Typography>
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
                        size="small"
                        variant="outlined"
                      />
                    ))
                  ))}
                </Box>
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Box display="flex" gap={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={calculateRoute}
                    disabled={loading || !origin || !destination}
                    startIcon={loading ? <CircularProgress size={20} /> : <NavigationIcon />}
                  >
                    {loading ? 'Calculating...' : 'Calculate Safe Route'}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    color="warning"
                    onClick={() => checkCalamities(origin)}
                    disabled={loading || !origin}
                    startIcon={<Warning />}
                  >
                    Check Origin Hazards
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Popular Routes Tab */}
        {activeTab === 1 && (
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Popular Shipping Routes
            </Typography>
            
            {popularRoutes.length === 0 ? (
              <Box textAlign="center" py={6}>
                <CircularProgress />
                <Typography variant="body1" color="text.secondary" mt={2}>
                  Loading routes...
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3} sx={{ mt: 1 }}>
                {popularRoutes.map((route, idx) => (
                  <Grid item xs={12} md={6} key={idx}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                          <Box>
                            <Typography variant="h6" fontWeight="bold">
                              {route.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {route.origin.name} → {route.destination.name}
                            </Typography>
                          </Box>
                          {route.current_safety && (
                            <Chip
                              icon={getSafetyIcon(route.current_safety)}
                              label={route.current_safety.toUpperCase()}
                              color={getSafetyColor(route.current_safety)}
                              size="small"
                            />
                          )}
                        </Box>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">Distance:</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {route.distance_nm.toFixed(0)} nm
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" mb={2}>
                          <Typography variant="body2">Duration:</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {(route.typical_duration_hours / 24).toFixed(1)} days
                          </Typography>
                        </Box>
                        
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={() => usePopularRoute(route)}
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
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Maritime Calamities
            </Typography>
            
            {calamities.length === 0 ? (
              <Box textAlign="center" py={6}>
                <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" fontWeight="bold">
                  No Calamities Detected
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Area appears safe
                </Typography>
              </Box>
            ) : (
              <Box sx={{ mt: 2 }}>
                {calamities.map((c, idx) => (
                  <Alert
                    key={idx}
                    severity={c.severity === 'critical' ? 'error' : c.severity === 'dangerous' ? 'warning' : 'info'}
                    sx={{ mb: 2 }}
                  >
                    <Typography variant="subtitle1" fontWeight="bold">
                      {c.type.replace('_', ' ').toUpperCase()}
                    </Typography>
                    <Typography variant="body2">{c.description}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Location: {c.location.lat.toFixed(2)}°, {c.location.lon.toFixed(2)}°
                    </Typography>
                  </Alert>
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* Results Tab */}
        {activeTab === 3 && routeData && (
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Route Analysis
            </Typography>
            
            <Grid container spacing={3} sx={{ mt: 1, mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                  <CardContent>
                    <NavigationIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold">
                      {routeData.total_distance_nm.toFixed(0)}
                    </Typography>
                    <Typography variant="body2">Nautical Miles</Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
                  <CardContent>
                    <Schedule sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold">
                      {(routeData.estimated_duration_hours / 24).toFixed(1)}
                    </Typography>
                    <Typography variant="body2">Days</Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'warning.light' }}>
                  <CardContent>
                    <Warning sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold">
                      {routeData.hazards_detected.length}
                    </Typography>
                    <Typography variant="body2">Hazards</Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'success.light' }}>
                  <CardContent>
                    <CheckCircle sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold">
                      {routeData.waypoints.length}
                    </Typography>
                    <Typography variant="body2">Waypoints</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
<Paper
  elevation={4}
  sx={{
    p: 3,
    mb: 3,
    borderRadius: 4,
    background: 'linear-gradient(135deg, #E3F2FD 0%, #E8F5E9 100%)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
    },
  }}
>
  <Typography
    variant="h6"
    fontWeight="bold"
    gutterBottom
    sx={{
      display: 'flex',
      alignItems: 'center',
      color: 'primary.dark',
      mb: 2,
    }}
  >
    <DirectionsBoat
      sx={{
        fontSize: 30,
        mr: 1,
        color: 'primary.main',
      }}
    />
    AI Recommendations
  </Typography>

  <Typography
    variant="body1"
    sx={{
      whiteSpace: 'pre-line',
      lineHeight: 1.7,
      color: 'text.secondary',
      fontSize: '1rem',
      borderLeft: '4px solid #1976D2',
      pl: 2,
      py: 1,
    }}
  >
    {routeData.recommendations}
  </Typography>
</Paper>

           
            {routeData.hazards_detected.length > 0 && (
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Detected Hazards
                </Typography>
                {routeData.hazards_detected.slice(0, 5).map((h, idx) => (
                  <Alert key={idx} severity="warning" sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {h.type.toUpperCase()}
                    </Typography>
                    <Typography variant="body2">{h.description}</Typography>
                  </Alert>
                ))}
              </Box>
            )}

            <Box mt={3}>
              <Button
                variant="contained"
                startIcon={<MapIcon />}
                onClick={() => setActiveTab(4)}
                fullWidth
                size="large"
              >
                View Interactive Map
              </Button>
            </Box>
          </Box>
        )}

        {/* Map View Tab */}
        {activeTab === 4 && (
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Interactive Route Map
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Route: {origin?.name} → {destination?.name}
            </Typography>
            <MaritimeRouteMapView routeData={routeData} />
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default MaritimeRoutePlanning;