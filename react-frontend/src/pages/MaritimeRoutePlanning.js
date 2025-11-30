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
} from '@mui/icons-material';

const API_BASE_URL = 'http://localhost:8000';

const MaritimeRoutePlanning = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [routeData, setRouteData] = useState(null);
  const [calamities, setCalamities] = useState([]);
  const [popularRoutes, setPopularRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [origin, setOrigin] = useState({ lat: '', lon: '', name: '' });
  const [destination, setDestination] = useState({ lat: '', lon: '', name: '' });
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
    if (!origin.lat || !origin.lon || !destination.lat || !destination.lon) {
      setError('Please enter valid origin and destination coordinates');
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
        setActiveTab(3); // Switch to results tab
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

  const checkCalamities = async (lat, lon) => {
    if (!lat || !lon) {
      setError('Please enter valid coordinates');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/maritime/calamity/detect`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          radius_km: 500
        })
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.success) {
        setCalamities(data.calamities || []);
        setActiveTab(2); // Switch to calamities tab
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
      lat: route.origin.lat.toString(), 
      lon: route.origin.lon.toString(),
      name: route.origin.name 
    });
    setDestination({ 
      lat: route.destination.lat.toString(), 
      lon: route.destination.lon.toString(),
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
              AI-Powered Safe Navigation & Calamity Detection
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
          {routeData && <Tab label="Results" icon={<CheckCircle />} />}
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
              {/* Origin */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  <Place sx={{ verticalAlign: 'middle', color: 'success.main' }} /> Origin
                </Typography>
                <TextField
                  fullWidth
                  label="Location Name"
                  value={origin.name}
                  onChange={(e) => setOrigin({ ...origin, name: e.target.value })}
                  sx={{ mb: 2 }}
                />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Latitude"
                      value={origin.lat}
                      onChange={(e) => setOrigin({ ...origin, lat: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Longitude"
                      value={origin.lon}
                      onChange={(e) => setOrigin({ ...origin, lon: e.target.value })}
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Destination */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  <Place sx={{ verticalAlign: 'middle', color: 'error.main' }} /> Destination
                </Typography>
                <TextField
                  fullWidth
                  label="Location Name"
                  value={destination.name}
                  onChange={(e) => setDestination({ ...destination, name: e.target.value })}
                  sx={{ mb: 2 }}
                />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Latitude"
                      value={destination.lat}
                      onChange={(e) => setDestination({ ...destination, lat: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Longitude"
                      value={destination.lon}
                      onChange={(e) => setDestination({ ...destination, lon: e.target.value })}
                    />
                  </Grid>
                </Grid>
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
                  label="Departure Time"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Box display="flex" gap={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={calculateRoute}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <NavigationIcon />}
                  >
                    {loading ? 'Calculating...' : 'Calculate Safe Route'}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    color="warning"
                    onClick={() => checkCalamities(origin.lat, origin.lon)}
                    disabled={loading || !origin.lat || !origin.lon}
                    startIcon={<Warning />}
                  >
                    Check Hazards
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

            <Paper elevation={1} sx={{ p: 3, bgcolor: 'info.lighter' }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                <DirectionsBoat sx={{ verticalAlign: 'middle', mr: 1 }} />
                AI Recommendations
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                {routeData.recommendations}
              </Typography>
            </Paper>

            {routeData.hazards_detected.length > 0 && (
              <Box sx={{ mt: 3 }}>
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
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default MaritimeRoutePlanning;