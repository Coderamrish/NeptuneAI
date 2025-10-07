import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Slider,
} from '@mui/material';
import {
  Download,
  Refresh,
  FilterList,
  Map,
  Water,
  Thermostat,
  Speed,
  LocationOn,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Plot from 'react-plotly.js';
import { useAuth } from '../contexts/AuthContext';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    region: '',
    year: '',
    month: '',
    temperatureRange: [0, 30],
    salinityRange: [0, 40],
    depthRange: [0, 1000]
  });

  const [regions, setRegions] = useState([]);
  const [years, setYears] = useState([]);
  const [months] = useState([
    { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
    { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
    { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' }
  ]);

  const { user } = useAuth();

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('neptuneai_token');
      
      const [statsResponse, geoResponse, profilerResponse, monthlyResponse] = await Promise.all([
        fetch('/api/dashboard/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/dashboard/geographic-data?limit=2000', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/dashboard/profiler-stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/dashboard/monthly-distribution', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!statsResponse.ok || !geoResponse.ok || !profilerResponse.ok || !monthlyResponse.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const [stats, geoData, profilerStats, monthlyData] = await Promise.all([
        statsResponse.json(),
        geoResponse.json(),
        profilerResponse.json(),
        monthlyResponse.json()
      ]);

      setData({
        stats,
        geoData: geoData.data,
        profilerStats: profilerStats.stats,
        monthlyData: monthlyData.data
      });
      setLastUpdated(new Date());
      
      // Extract unique regions and years
      const uniqueRegions = [...new Set(geoData.data.map(item => item.region).filter(Boolean))];
      const uniqueYears = [...new Set(geoData.data.map(item => item.year).filter(Boolean))].sort((a, b) => b - a);
      
      setRegions(uniqueRegions);
      setYears(uniqueYears);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      region: '',
      year: '',
      month: '',
      temperatureRange: [0, 30],
      salinityRange: [0, 40],
      depthRange: [0, 1000]
    });
  };

  const handleExport = (format) => {
    const token = localStorage.getItem('neptuneai_token');
    const url = `/api/export/${format}`;
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ocean_analytics.${format}`);
    link.setAttribute('Authorization', `Bearer ${token}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Prepare filtered data
  const getFilteredData = () => {
    if (!data) return [];
    
    let filtered = [...data.geoData];
    
    if (filters.region) {
      filtered = filtered.filter(item => item.region === filters.region);
    }
    if (filters.year) {
      filtered = filtered.filter(item => item.year === parseInt(filters.year));
    }
    if (filters.month) {
      filtered = filtered.filter(item => item.month === parseInt(filters.month));
    }
    if (filters.temperatureRange) {
      filtered = filtered.filter(item => 
        item.temperature >= filters.temperatureRange[0] && 
        item.temperature <= filters.temperatureRange[1]
      );
    }
    if (filters.salinityRange) {
      filtered = filtered.filter(item => 
        item.salinity >= filters.salinityRange[0] && 
        item.salinity <= filters.salinityRange[1]
      );
    }
    if (filters.depthRange) {
      filtered = filtered.filter(item => 
        item.depth >= filters.depthRange[0] && 
        item.depth <= filters.depthRange[1]
      );
    }
    
    return filtered;
  };

  const filteredData = getFilteredData();

  // Prepare chart data
  const prepareMapData = () => {
    const sampleData = filteredData.slice(0, 1000);
    return {
      lat: sampleData.map(item => item.latitude).filter(Boolean),
      lon: sampleData.map(item => item.longitude).filter(Boolean),
      temp: sampleData.map(item => item.temperature).filter(Boolean),
      sal: sampleData.map(item => item.salinity).filter(Boolean),
      depth: sampleData.map(item => item.depth).filter(Boolean)
    };
  };

  const mapData = prepareMapData();

  // Ocean Map Chart
  const oceanMapChart = {
    data: [
      {
        type: 'scattermapbox',
        lat: mapData.lat,
        lon: mapData.lon,
        mode: 'markers',
        marker: {
          size: 8,
          color: mapData.temp,
          colorscale: 'Viridis',
          showscale: true,
          colorbar: {
            title: 'Temperature (°C)',
            titleside: 'right'
          }
        },
        text: mapData.temp.map((temp, i) => 
          `Temp: ${temp?.toFixed(2)}°C<br>Sal: ${mapData.sal[i]?.toFixed(2)} PSU<br>Depth: ${mapData.depth[i]?.toFixed(0)}m`
        ),
        hovertemplate: '%{text}<extra></extra>',
        name: 'Ocean Data Points'
      }
    ],
    layout: {
      mapbox: {
        style: 'open-street-map',
        center: { lat: 0, lon: 0 },
        zoom: 1
      },
      title: 'Global Ocean Data Distribution',
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: { color: 'white' },
      margin: { t: 40, b: 40, l: 40, r: 40 }
    },
    config: { 
      responsive: true, 
      displayModeBar: true,
      mapboxAccessToken: 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'
    }
  };

  // Temperature vs Salinity Scatter
  const tempSalinityChart = {
    data: [
      {
        x: mapData.temp,
        y: mapData.sal,
        type: 'scatter',
        mode: 'markers',
        marker: {
          size: 6,
          color: mapData.depth,
          colorscale: 'Blues',
          showscale: true,
          colorbar: {
            title: 'Depth (m)',
            titleside: 'right'
          }
        },
        name: 'Temperature vs Salinity'
      }
    ],
    layout: {
      title: 'Temperature vs Salinity Relationship',
      xaxis: { title: 'Temperature (°C)' },
      yaxis: { title: 'Salinity (PSU)' },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: { color: 'white' },
      margin: { t: 40, b: 40, l: 40, r: 40 }
    },
    config: { responsive: true, displayModeBar: false }
  };

  // Monthly Distribution
  const monthlyChart = {
    data: [
      {
        x: data?.monthlyData?.map(d => d.month || d.Month) || [],
        y: data?.monthlyData?.map(d => d.count || d.Count) || [],
        type: 'bar',
        name: 'Data Points',
        marker: { color: '#4ecdc4' }
      }
    ],
    layout: {
      title: 'Monthly Data Distribution',
      xaxis: { title: 'Month' },
      yaxis: { title: 'Number of Records' },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: { color: 'white' },
      margin: { t: 40, b: 40, l: 40, r: 40 }
    },
    config: { responsive: true, displayModeBar: false }
  };

  // Depth Profile
  const depthProfileChart = {
    data: [
      {
        x: mapData.depth,
        y: mapData.temp,
        type: 'scatter',
        mode: 'markers',
        marker: {
          size: 6,
          color: mapData.sal,
          colorscale: 'Viridis',
          showscale: true,
          colorbar: {
            title: 'Salinity (PSU)',
            titleside: 'right'
          }
        },
        name: 'Depth Profile'
      }
    ],
    layout: {
      title: 'Temperature vs Depth Profile',
      xaxis: { title: 'Depth (m)', autorange: 'reversed' },
      yaxis: { title: 'Temperature (°C)' },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: { color: 'white' },
      margin: { t: 40, b: 40, l: 40, r: 40 }
    },
    config: { responsive: true, displayModeBar: false }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress size={60} sx={{ color: 'white' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchAnalyticsData}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
            Ocean Data Analytics
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            Interactive analysis and visualization of ocean parameters
          </Typography>
        </motion.div>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Toggle Filters">
            <IconButton 
              onClick={() => setShowFilters(!showFilters)} 
              sx={{ color: 'white' }}
            >
              <FilterList />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh Data">
            <IconButton onClick={fetchAnalyticsData} sx={{ color: 'white' }}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export Data">
            <IconButton onClick={() => handleExport('csv')} sx={{ color: 'white' }}>
              <Download />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card sx={{ 
              background: 'rgba(255,255,255,0.1)', 
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Water sx={{ color: '#4ecdc4', mr: 1 }} />
                  <Typography variant="h6" sx={{ color: 'white' }}>
                    Total Records
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                  {data?.stats?.total_records?.toLocaleString() || '0'}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={75} 
                  sx={{ 
                    mt: 1, 
                    bgcolor: 'rgba(255,255,255,0.2)',
                    '& .MuiLinearProgress-bar': { bgcolor: '#4ecdc4' }
                  }}
                />
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card sx={{ 
              background: 'rgba(255,255,255,0.1)', 
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationOn sx={{ color: '#ff6b6b', mr: 1 }} />
                  <Typography variant="h6" sx={{ color: 'white' }}>
                    Regions
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                  {data?.stats?.unique_regions || 0}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={60} 
                  sx={{ 
                    mt: 1, 
                    bgcolor: 'rgba(255,255,255,0.2)',
                    '& .MuiLinearProgress-bar': { bgcolor: '#ff6b6b' }
                  }}
                />
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card sx={{ 
              background: 'rgba(255,255,255,0.1)', 
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Thermostat sx={{ color: '#feca57', mr: 1 }} />
                  <Typography variant="h6" sx={{ color: 'white' }}>
                    Avg Temp
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                  18.5°C
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={85} 
                  sx={{ 
                    mt: 1, 
                    bgcolor: 'rgba(255,255,255,0.2)',
                    '& .MuiLinearProgress-bar': { bgcolor: '#feca57' }
                  }}
                />
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card sx={{ 
              background: 'rgba(255,255,255,0.1)', 
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Speed sx={{ color: '#a55eea', mr: 1 }} />
                  <Typography variant="h6" sx={{ color: 'white' }}>
                    Filtered
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                  {filteredData.length.toLocaleString()}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={94} 
                  sx={{ 
                    mt: 1, 
                    bgcolor: 'rgba(255,255,255,0.2)',
                    '& .MuiLinearProgress-bar': { bgcolor: '#a55eea' }
                  }}
                />
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Paper sx={{ 
            p: 3, 
            mb: 3,
            background: 'rgba(255,255,255,0.1)', 
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
              Filter Data
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'white' }}>Region</InputLabel>
                  <Select
                    value={filters.region}
                    onChange={(e) => handleFilterChange('region', e.target.value)}
                    sx={{ color: 'white' }}
                  >
                    <MenuItem value="">All Regions</MenuItem>
                    {regions.map(region => (
                      <MenuItem key={region} value={region}>{region}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'white' }}>Year</InputLabel>
                  <Select
                    value={filters.year}
                    onChange={(e) => handleFilterChange('year', e.target.value)}
                    sx={{ color: 'white' }}
                  >
                    <MenuItem value="">All Years</MenuItem>
                    {years.map(year => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'white' }}>Month</InputLabel>
                  <Select
                    value={filters.month}
                    onChange={(e) => handleFilterChange('month', e.target.value)}
                    sx={{ color: 'white' }}
                  >
                    <MenuItem value="">All Months</MenuItem>
                    {months.map(month => (
                      <MenuItem key={month.value} value={month.value}>{month.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Button 
                  variant="outlined" 
                  onClick={clearFilters}
                  sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
                >
                  Clear All
                </Button>
              </Grid>
            </Grid>
            
            {/* Range Sliders */}
            <Box sx={{ mt: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                    Temperature: {filters.temperatureRange[0]}°C - {filters.temperatureRange[1]}°C
                  </Typography>
                  <Slider
                    value={filters.temperatureRange}
                    onChange={(e, newValue) => handleFilterChange('temperatureRange', newValue)}
                    valueLabelDisplay="auto"
                    min={0}
                    max={30}
                    sx={{ color: '#ff6b6b' }}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                    Salinity: {filters.salinityRange[0]} - {filters.salinityRange[1]} PSU
                  </Typography>
                  <Slider
                    value={filters.salinityRange}
                    onChange={(e, newValue) => handleFilterChange('salinityRange', newValue)}
                    valueLabelDisplay="auto"
                    min={0}
                    max={40}
                    sx={{ color: '#4ecdc4' }}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                    Depth: {filters.depthRange[0]} - {filters.depthRange[1]} m
                  </Typography>
                  <Slider
                    value={filters.depthRange}
                    onChange={(e, newValue) => handleFilterChange('depthRange', newValue)}
                    valueLabelDisplay="auto"
                    min={0}
                    max={1000}
                    sx={{ color: '#a55eea' }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </motion.div>
      )}

      {/* Analytics Tabs */}
      <Paper sx={{ 
        background: 'rgba(255,255,255,0.1)', 
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{
            '& .MuiTab-root': { color: 'rgba(255,255,255,0.7)' },
            '& .Mui-selected': { color: 'white' },
            '& .MuiTabs-indicator': { backgroundColor: 'white' }
          }}
        >
          <Tab label="Ocean Map" icon={<Map />} />
          <Tab label="Temperature Analysis" icon={<Thermostat />} />
          <Tab label="Salinity Analysis" icon={<Water />} />
          <Tab label="Depth Profiles" icon={<Speed />} />
        </Tabs>

        {/* Tab Content */}
        <Box sx={{ p: 3 }}>
          {tabValue === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Box sx={{ height: 600 }}>
                <Plot
                  data={oceanMapChart.data}
                  layout={oceanMapChart.layout}
                  config={oceanMapChart.config}
                  style={{ width: '100%', height: '100%' }}
                />
              </Box>
            </motion.div>
          )}

          {tabValue === 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ height: 400 }}>
                    <Plot
                      data={tempSalinityChart.data}
                      layout={tempSalinityChart.layout}
                      config={tempSalinityChart.config}
                      style={{ width: '100%', height: '100%' }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ height: 400 }}>
                    <Plot
                      data={monthlyChart.data}
                      layout={monthlyChart.layout}
                      config={monthlyChart.config}
                      style={{ width: '100%', height: '100%' }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </motion.div>
          )}

          {tabValue === 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Box sx={{ height: 500 }}>
                <Plot
                  data={tempSalinityChart.data}
                  layout={{
                    ...tempSalinityChart.layout,
                    title: 'Salinity Distribution Analysis'
                  }}
                  config={tempSalinityChart.config}
                  style={{ width: '100%', height: '100%' }}
                />
              </Box>
            </motion.div>
          )}

          {tabValue === 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Box sx={{ height: 500 }}>
                <Plot
                  data={depthProfileChart.data}
                  layout={depthProfileChart.layout}
                  config={depthProfileChart.config}
                  style={{ width: '100%', height: '100%' }}
                />
              </Box>
            </motion.div>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Analytics;