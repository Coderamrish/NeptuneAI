import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Slider,
  Switch,
  FormControlLabel,
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
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Plot from 'react-plotly.js';
import { useAuth } from '../contexts/AuthContext';

const DataExplorer = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(20);
  const [tabValue, setTabValue] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    region: '',
    year: '',
    month: '',
    temperatureRange: [0, 30],
    salinityRange: [0, 40],
    depthRange: [0, 1000],
    searchTerm: ''
  });

  // Available regions and years
  const [regions, setRegions] = useState([]);
  const [years, setYears] = useState([]);
  const [months] = useState([
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ]);

  const { user } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('neptuneai_token');
      
      const response = await fetch('/api/dashboard/geographic-data?limit=5000', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const result = await response.json();
      setData(result.data);
      setFilteredData(result.data);
      
      // Extract unique regions and years
      const uniqueRegions = [...new Set(result.data.map(item => item.region).filter(Boolean))];
      const uniqueYears = [...new Set(result.data.map(item => item.year).filter(Boolean))].sort((a, b) => b - a);
      
      setRegions(uniqueRegions);
      setYears(uniqueYears);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, data]);

  const applyFilters = () => {
    let filtered = [...data];

    // Text search
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        Object.values(item).some(value => 
          value && value.toString().toLowerCase().includes(searchLower)
        )
      );
    }

    // Region filter
    if (filters.region) {
      filtered = filtered.filter(item => item.region === filters.region);
    }

    // Year filter
    if (filters.year) {
      filtered = filtered.filter(item => item.year === parseInt(filters.year));
    }

    // Month filter
    if (filters.month) {
      filtered = filtered.filter(item => item.month === parseInt(filters.month));
    }

    // Temperature range filter
    filtered = filtered.filter(item => 
      item.temperature >= filters.temperatureRange[0] && 
      item.temperature <= filters.temperatureRange[1]
    );

    // Salinity range filter
    filtered = filtered.filter(item => 
      item.salinity >= filters.salinityRange[0] && 
      item.salinity <= filters.salinityRange[1]
    );

    // Depth range filter
    filtered = filtered.filter(item => 
      item.depth >= filters.depthRange[0] && 
      item.depth <= filters.depthRange[1]
    );

    setFilteredData(filtered);
    setPage(1);
  };

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
      depthRange: [0, 1000],
      searchTerm: ''
    });
  };

  const handleExport = (format) => {
    const token = localStorage.getItem('neptuneai_token');
    const url = `/api/export/${format}`;
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ocean_data.${format}`);
    link.setAttribute('Authorization', `Bearer ${token}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pagination
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  // Prepare data for visualizations
  const prepareChartData = () => {
    const sampleData = filteredData.slice(0, 1000); // Limit for performance
    
    return {
      temperature: sampleData.map(item => item.temperature).filter(Boolean),
      salinity: sampleData.map(item => item.salinity).filter(Boolean),
      depth: sampleData.map(item => item.depth).filter(Boolean),
      latitude: sampleData.map(item => item.latitude).filter(Boolean),
      longitude: sampleData.map(item => item.longitude).filter(Boolean)
    };
  };

  const chartData = prepareChartData();

  const temperatureChart = {
    data: [
      {
        x: chartData.latitude,
        y: chartData.longitude,
        z: chartData.temperature,
        type: 'scatter3d',
        mode: 'markers',
        marker: {
          size: 3,
          color: chartData.temperature,
          colorscale: 'Viridis',
          showscale: true
        },
        name: 'Temperature'
      }
    ],
    layout: {
      title: 'Temperature Distribution',
      scene: {
        xaxis: { title: 'Latitude' },
        yaxis: { title: 'Longitude' },
        zaxis: { title: 'Temperature (°C)' }
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: { color: 'white' }
    },
    config: { responsive: true, displayModeBar: false }
  };

  const salinityChart = {
    data: [
      {
        x: chartData.temperature,
        y: chartData.salinity,
        type: 'scatter',
        mode: 'markers',
        marker: {
          size: 6,
          color: chartData.depth,
          colorscale: 'Blues',
          showscale: true
        },
        name: 'Salinity vs Temperature'
      }
    ],
    layout: {
      title: 'Salinity vs Temperature',
      xaxis: { title: 'Temperature (°C)' },
      yaxis: { title: 'Salinity (PSU)' },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: { color: 'white' }
    },
    config: { responsive: true, displayModeBar: false }
  };

  if (loading && data.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress size={60} sx={{ color: 'white' }} />
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
            Data Explorer
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            Explore and analyze ocean data with advanced filtering
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
            <IconButton onClick={fetchData} sx={{ color: 'white' }}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export CSV">
            <IconButton onClick={() => handleExport('csv')} sx={{ color: 'white' }}>
              <Download />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Search and Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Paper sx={{ 
              p: 2, 
              background: 'rgba(255,255,255,0.1)', 
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <TextField
                fullWidth
                placeholder="Search data by any field..."
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ color: 'rgba(255,255,255,0.7)', mr: 1 }} />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                    '&.Mui-focused fieldset': { borderColor: 'white' }
                  }
                }}
              />
            </Paper>
          </motion.div>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Paper sx={{ 
              p: 2, 
              background: 'rgba(255,255,255,0.1)', 
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <Typography variant="h6" sx={{ color: 'white', textAlign: 'center' }}>
                {filteredData.length.toLocaleString()} Records
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
                Showing {startIndex + 1}-{Math.min(endIndex, filteredData.length)} of {data.length.toLocaleString()}
              </Typography>
            </Paper>
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
              Advanced Filters
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
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', height: '100%' }}>
                  <Button 
                    variant="outlined" 
                    onClick={clearFilters}
                    sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
                  >
                    Clear All
                  </Button>
                </Box>
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

      {/* Tabs for different views */}
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
          <Tab label="Data Table" />
          <Tab label="Temperature Map" />
          <Tab label="Salinity Analysis" />
        </Tabs>

        {/* Tab Content */}
        <Box sx={{ p: 3 }}>
          {tabValue === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Latitude</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Longitude</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Temperature</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Salinity</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Depth</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Region</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Year</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedData.map((row, index) => (
                      <TableRow key={index} hover>
                        <TableCell sx={{ color: 'white' }}>{row.latitude?.toFixed(4)}</TableCell>
                        <TableCell sx={{ color: 'white' }}>{row.longitude?.toFixed(4)}</TableCell>
                        <TableCell sx={{ color: 'white' }}>{row.temperature?.toFixed(2)}°C</TableCell>
                        <TableCell sx={{ color: 'white' }}>{row.salinity?.toFixed(2)} PSU</TableCell>
                        <TableCell sx={{ color: 'white' }}>{row.depth?.toFixed(0)}m</TableCell>
                        <TableCell sx={{ color: 'white' }}>{row.region}</TableCell>
                        <TableCell sx={{ color: 'white' }}>{row.year}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {/* Pagination */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(e, value) => setPage(value)}
                  color="primary"
                  sx={{
                    '& .MuiPaginationItem-root': { color: 'white' },
                    '& .Mui-selected': { backgroundColor: 'rgba(255,255,255,0.2)' }
                  }}
                />
              </Box>
            </motion.div>
          )}

          {tabValue === 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Box sx={{ height: 500 }}>
                <Plot
                  data={temperatureChart.data}
                  layout={temperatureChart.layout}
                  config={temperatureChart.config}
                  style={{ width: '100%', height: '100%' }}
                />
              </Box>
            </motion.div>
          )}

          {tabValue === 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Box sx={{ height: 500 }}>
                <Plot
                  data={salinityChart.data}
                  layout={salinityChart.layout}
                  config={salinityChart.config}
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

export default DataExplorer;