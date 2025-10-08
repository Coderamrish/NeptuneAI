import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  Search,
  FilterList,
  Download,
  Refresh,
  Visibility,
  VisibilityOff,
  TrendingUp,
  TrendingDown,
  Water,
  Thermostat,
  Speed,
  LocationOn,
  BarChart,
  TableChart,
  Map,
  Timeline,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Plot from 'react-plotly.js';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const DataExplorer = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    region: 'All',
    year: 'All',
    temperature: [0, 30],
    salinity: [0, 40],
    depth: [0, 5000],
    latitude: [-90, 90],
    longitude: [-180, 180],
  });
  const [viewMode, setViewMode] = useState('table'); // table, chart, map
  const [showFilters, setShowFilters] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [data, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('neptuneai_token');
      
      // Try to fetch from API first
      const response = await fetch('/api/data/explorer', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const result = await response.json();
        const fetchedData = result.data || [];
        setData(fetchedData);
        setFilteredData(fetchedData);
        
        // Update filters with available options
        const regions = [...new Set(fetchedData.map(item => item.region))];
        const years = [...new Set(fetchedData.map(item => item.year))];
        const qualities = [...new Set(fetchedData.map(item => item.quality))];
        
        setFilters(prev => ({
          ...prev,
          regions: regions.sort(),
          years: years.sort(),
          qualities: qualities.sort()
        }));
      } else {
        // Generate enhanced sample data if API fails
        generateSampleData();
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load data');
      generateSampleData();
    } finally {
      setLoading(false);
    }
  };

  const generateSampleData = () => {
    const sampleData = Array.from({ length: 1000 }, (_, i) => ({
      id: i + 1,
      timestamp: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      latitude: -90 + Math.random() * 180,
      longitude: -180 + Math.random() * 360,
      temperature: 10 + Math.random() * 20,
      salinity: 30 + Math.random() * 10,
      pressure: Math.random() * 1000,
      depth: Math.random() * 5000,
      region: ['Atlantic', 'Pacific', 'Indian', 'Arctic', 'Southern'][Math.floor(Math.random() * 5)],
      year: 2020 + Math.floor(Math.random() * 4),
      station_id: `ST${String(i + 1).padStart(4, '0')}`,
      quality: Math.random() > 0.1 ? 'Good' : 'Poor',
    }));
    setData(sampleData);
  };

  const applyFilters = () => {
    let filtered = [...data];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(item => 
        item.station_id.toLowerCase().includes(searchLower) ||
        item.region.toLowerCase().includes(searchLower) ||
        item.quality.toLowerCase().includes(searchLower)
      );
    }

    // Region filter
    if (filters.region !== 'All') {
      filtered = filtered.filter(item => item.region === filters.region);
    }

    // Year filter
    if (filters.year !== 'All') {
      filtered = filtered.filter(item => item.year === parseInt(filters.year));
    }

    // Temperature filter
    filtered = filtered.filter(item => 
      item.temperature >= filters.temperature[0] && 
      item.temperature <= filters.temperature[1]
    );

    // Salinity filter
    filtered = filtered.filter(item => 
      item.salinity >= filters.salinity[0] && 
      item.salinity <= filters.salinity[1]
    );

    // Depth filter
    filtered = filtered.filter(item => 
      item.depth >= filters.depth[0] && 
      item.depth <= filters.depth[1]
    );

    // Latitude filter
    filtered = filtered.filter(item => 
      item.latitude >= filters.latitude[0] && 
      item.latitude <= filters.latitude[1]
    );

    // Longitude filter
    filtered = filtered.filter(item => 
      item.longitude >= filters.longitude[0] && 
      item.longitude <= filters.longitude[1]
    );

    setFilteredData(filtered);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleExport = (format = 'csv') => {
    try {
      if (filteredData.length === 0) {
        toast.warning('No data to export');
        return;
      }

      if (format === 'csv') {
        exportToCSV();
      } else if (format === 'json') {
        exportToJSON();
      } else if (format === 'excel') {
        exportToExcel();
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed. Please try again.');
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Station ID', 'Timestamp', 'Latitude', 'Longitude', 'Temperature', 'Salinity', 'Pressure', 'Depth', 'Region', 'Year', 'Quality'],
      ...filteredData.map(item => [
        item.station_id,
        item.timestamp,
        item.latitude.toFixed(4),
        item.longitude.toFixed(4),
        item.temperature.toFixed(2),
        item.salinity.toFixed(2),
        item.pressure.toFixed(2),
        item.depth.toFixed(2),
        item.region,
        item.year,
        item.quality
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ocean_data_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Data exported as CSV successfully!');
  };

  const exportToJSON = () => {
    const jsonContent = JSON.stringify(filteredData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ocean_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Data exported as JSON successfully!');
  };

  const exportToExcel = () => {
    // For Excel export, we'll create a CSV with .xlsx extension
    // In a real implementation, you'd use a library like xlsx
    const csvContent = [
      ['Station ID', 'Timestamp', 'Latitude', 'Longitude', 'Temperature', 'Salinity', 'Pressure', 'Depth', 'Region', 'Year', 'Quality'],
      ...filteredData.map(item => [
        item.station_id,
        item.timestamp,
        item.latitude.toFixed(4),
        item.longitude.toFixed(4),
        item.temperature.toFixed(2),
        item.salinity.toFixed(2),
        item.pressure.toFixed(2),
        item.depth.toFixed(2),
        item.region,
        item.year,
        item.quality
      ])
    ].map(row => row.join('\t')).join('\n');

    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ocean_data_${new Date().toISOString().split('T')[0]}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Data exported as Excel successfully!');
  };

  const handleRefresh = () => {
    fetchData();
    toast.success('Data refreshed!');
  };

  const TemperatureChart = () => (
    <Card sx={{ height: 400, background: 'linear-gradient(135deg, #ff6b6b15 0%, #ff6b6b05 100%)' }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Thermostat color="primary" />
          Temperature Distribution
        </Typography>
        <Plot
          data={[
            {
              x: filteredData.map(d => d.temperature),
              type: 'histogram',
              name: 'Temperature',
              marker: { color: '#ff6b6b' },
              nbinsx: 20,
            },
          ]}
          layout={{
            xaxis: { title: 'Temperature (°C)' },
            yaxis: { title: 'Frequency' },
            margin: { t: 20, b: 40, l: 40, r: 20 },
            height: 300,
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
          }}
          config={{ displayModeBar: false }}
        />
      </CardContent>
    </Card>
  );

  const SalinityChart = () => (
    <Card sx={{ height: 400, background: 'linear-gradient(135deg, #4ecdc415 0%, #4ecdc405 100%)' }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Water color="primary" />
          Salinity Distribution
        </Typography>
        <Plot
          data={[
            {
              x: filteredData.map(d => d.salinity),
              type: 'histogram',
              name: 'Salinity',
              marker: { color: '#4ecdc4' },
              nbinsx: 20,
            },
          ]}
          layout={{
            xaxis: { title: 'Salinity (PSU)' },
            yaxis: { title: 'Frequency' },
            margin: { t: 20, b: 40, l: 40, r: 20 },
            height: 300,
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
          }}
          config={{ displayModeBar: false }}
        />
      </CardContent>
    </Card>
  );

  const ScatterPlot = () => (
    <Card sx={{ height: 400, background: 'linear-gradient(135deg, #45b7d115 0%, #45b7d105 100%)' }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <BarChart color="primary" />
          Temperature vs Salinity
        </Typography>
        <Plot
          data={[
            {
              x: filteredData.map(d => d.temperature),
              y: filteredData.map(d => d.salinity),
              mode: 'markers',
              type: 'scatter',
              name: 'Data Points',
              marker: {
                size: 8,
                color: filteredData.map(d => d.depth),
                colorscale: 'Viridis',
                showscale: true,
                colorbar: { title: 'Depth (m)' },
              },
              text: filteredData.map(d => `Station: ${d.station_id}<br>Region: ${d.region}<br>Depth: ${d.depth.toFixed(0)}m`),
              hovertemplate: '%{text}<extra></extra>',
            },
          ]}
          layout={{
            xaxis: { title: 'Temperature (°C)' },
            yaxis: { title: 'Salinity (PSU)' },
            margin: { t: 20, b: 40, l: 40, r: 20 },
            height: 300,
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
          }}
          config={{ displayModeBar: false }}
        />
      </CardContent>
    </Card>
  );

  const GeographicMap = () => (
    <Card sx={{ height: 500, background: 'linear-gradient(135deg, #96ceb415 0%, #96ceb405 100%)' }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Map color="primary" />
          Geographic Distribution
        </Typography>
        <Plot
          data={[
            {
              type: 'scattermapbox',
              lat: filteredData.map(d => d.latitude),
              lon: filteredData.map(d => d.longitude),
              mode: 'markers',
              marker: {
                size: 8,
                color: filteredData.map(d => d.temperature),
                colorscale: 'Viridis',
                showscale: true,
                colorbar: { title: 'Temperature (°C)' },
              },
              text: filteredData.map(d => 
                `Station: ${d.station_id}<br>Temp: ${d.temperature.toFixed(1)}°C<br>Salinity: ${d.salinity.toFixed(1)} PSU<br>Region: ${d.region}`
              ),
              hovertemplate: '%{text}<extra></extra>',
            },
          ]}
          layout={{
            mapbox: {
              style: 'open-street-map',
              center: { lat: 0, lon: 0 },
              zoom: 1,
            },
            margin: { t: 0, b: 0, l: 0, r: 0 },
            height: 400,
          }}
          config={{ displayModeBar: false }}
        />
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6">Loading ocean data...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#1976d2' }}>
              Ocean Data Explorer 🔍
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Explore and analyze ocean data with advanced filtering and visualization tools
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh Data">
              <IconButton onClick={handleRefresh} color="primary">
                <Refresh />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export as CSV">
              <IconButton onClick={() => handleExport('csv')} color="primary">
                <Download />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export as JSON">
              <IconButton onClick={() => handleExport('json')} color="primary">
                <Download />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export as Excel">
              <IconButton onClick={() => handleExport('excel')} color="primary">
                <Download />
              </IconButton>
            </Tooltip>
            <Tooltip title="Toggle Filters">
              <IconButton onClick={() => setShowFilters(!showFilters)} color="primary">
                <FilterList />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </motion.div>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{ background: 'linear-gradient(135deg, #1976d215 0%, #1976d205 100%)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ color: '#1976d2', fontSize: '2rem' }}>
                    <BarChart />
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: '#1976d2' }}>
                      {filteredData.length.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Records
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card sx={{ background: 'linear-gradient(135deg, #ff6b6b15 0%, #ff6b6b05 100%)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ color: '#ff6b6b', fontSize: '2rem' }}>
                    <Thermostat />
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: '#ff6b6b' }}>
                      {filteredData.length > 0 ? (filteredData.reduce((sum, d) => sum + d.temperature, 0) / filteredData.length).toFixed(1) : '0.0'}°C
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Temperature
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card sx={{ background: 'linear-gradient(135deg, #4ecdc415 0%, #4ecdc405 100%)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ color: '#4ecdc4', fontSize: '2rem' }}>
                    <Water />
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: '#4ecdc4' }}>
                      {filteredData.length > 0 ? (filteredData.reduce((sum, d) => sum + d.salinity, 0) / filteredData.length).toFixed(1) : '0.0'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Salinity (PSU)
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card sx={{ background: 'linear-gradient(135deg, #45b7d115 0%, #45b7d105 100%)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ color: '#45b7d1', fontSize: '2rem' }}>
                    <Speed />
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: '#45b7d1' }}>
                      {filteredData.length > 0 ? Math.max(...filteredData.map(d => d.depth)).toFixed(0) : '0'}m
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Max Depth
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterList color="primary" />
                Advanced Filters
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Search"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search stations, regions..."
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Region</InputLabel>
                    <Select
                      value={filters.region}
                      onChange={(e) => handleFilterChange('region', e.target.value)}
                    >
                      <MenuItem value="All">All Regions</MenuItem>
                      <MenuItem value="Atlantic">Atlantic</MenuItem>
                      <MenuItem value="Pacific">Pacific</MenuItem>
                      <MenuItem value="Indian">Indian</MenuItem>
                      <MenuItem value="Arctic">Arctic</MenuItem>
                      <MenuItem value="Southern">Southern</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Year</InputLabel>
                    <Select
                      value={filters.year}
                      onChange={(e) => handleFilterChange('year', e.target.value)}
                    >
                      <MenuItem value="All">All Years</MenuItem>
                      <MenuItem value="2023">2023</MenuItem>
                      <MenuItem value="2022">2022</MenuItem>
                      <MenuItem value="2021">2021</MenuItem>
                      <MenuItem value="2020">2020</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Temperature: {filters.temperature[0]}°C - {filters.temperature[1]}°C
                    </Typography>
                    <Slider
                      value={filters.temperature}
                      onChange={(e, value) => handleFilterChange('temperature', value)}
                      valueLabelDisplay="auto"
                      min={0}
                      max={30}
                      sx={{ color: '#ff6b6b' }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Salinity: {filters.salinity[0]} - {filters.salinity[1]} PSU
                    </Typography>
                    <Slider
                      value={filters.salinity}
                      onChange={(e, value) => handleFilterChange('salinity', value)}
                      valueLabelDisplay="auto"
                      min={0}
                      max={40}
                      sx={{ color: '#4ecdc4' }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Depth: {filters.depth[0]} - {filters.depth[1]} m
                    </Typography>
                    <Slider
                      value={filters.depth}
                      onChange={(e, value) => handleFilterChange('depth', value)}
                      valueLabelDisplay="auto"
                      min={0}
                      max={5000}
                      sx={{ color: '#45b7d1' }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* View Mode Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Table View" icon={<TableChart />} />
          <Tab label="Charts" icon={<BarChart />} />
          <Tab label="Map View" icon={<Map />} />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {tabValue === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TableChart color="primary" />
                Data Table ({filteredData.length} records)
              </Typography>
              <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Station ID</TableCell>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Latitude</TableCell>
                      <TableCell>Longitude</TableCell>
                      <TableCell>Temperature</TableCell>
                      <TableCell>Salinity</TableCell>
                      <TableCell>Depth</TableCell>
                      <TableCell>Region</TableCell>
                      <TableCell>Quality</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredData.slice(0, 100).map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.station_id}</TableCell>
                        <TableCell>{new Date(row.timestamp).toLocaleDateString()}</TableCell>
                        <TableCell>{row.latitude.toFixed(4)}</TableCell>
                        <TableCell>{row.longitude.toFixed(4)}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">{row.temperature.toFixed(1)}°C</Typography>
                            <Chip 
                              size="small" 
                              label={row.temperature > 20 ? 'High' : row.temperature > 10 ? 'Medium' : 'Low'}
                              color={row.temperature > 20 ? 'error' : row.temperature > 10 ? 'warning' : 'success'}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">{row.salinity.toFixed(1)} PSU</Typography>
                            <Chip 
                              size="small" 
                              label={row.salinity > 36 ? 'High' : row.salinity > 34 ? 'Normal' : 'Low'}
                              color={row.salinity > 36 ? 'error' : row.salinity > 34 ? 'success' : 'warning'}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>{row.depth.toFixed(0)}m</TableCell>
                        <TableCell>
                          <Chip label={row.region} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={row.quality} 
                            size="small" 
                            color={row.quality === 'Good' ? 'success' : 'error'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TemperatureChart />
          </Grid>
          <Grid item xs={12} md={6}>
            <SalinityChart />
          </Grid>
          <Grid item xs={12}>
            <ScatterPlot />
          </Grid>
        </Grid>
      )}

      {tabValue === 2 && (
        <GeographicMap />
      )}
    </Box>
  );
};

export default DataExplorer;