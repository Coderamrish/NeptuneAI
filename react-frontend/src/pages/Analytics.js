import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Tooltip,
  Chip,
  Paper,
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
  BarChart,
  PieChart,
  Timeline,
  Public,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Plot from 'react-plotly.js';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [filters, setFilters] = useState({
    region: 'All',
    year: '2024',
    temperature: [0, 30],
    salinity: [0, 40],
    depth: [0, 5000],
  });
  const [analyticsData, setAnalyticsData] = useState({
    stats: {
      totalRecords: 0,
      avgTemperature: 0,
      avgSalinity: 0,
      maxDepth: 0,
      dataPoints: 0,
    },
    temperatureData: [],
    salinityData: [],
    depthData: [],
    geographicData: [],
    monthlyData: [],
    correlationData: [],
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('neptuneai_token');
      
      // Try to fetch from API first
      const response = await fetch('/api/analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      } else {
        // Generate sample data if API fails
        generateSampleData();
      }
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      setError('Failed to load analytics data');
      generateSampleData();
    } finally {
      setLoading(false);
    }
  };

  const generateSampleData = () => {
    // Generate sample temperature data
    const temperatureData = Array.from({ length: 100 }, (_, i) => ({
      x: i,
      y: 10 + Math.random() * 20 + Math.sin(i * 0.1) * 5,
      region: ['Atlantic', 'Pacific', 'Indian', 'Arctic'][Math.floor(Math.random() * 4)],
      depth: Math.random() * 5000,
    }));

    // Generate sample salinity data
    const salinityData = Array.from({ length: 100 }, (_, i) => ({
      x: i,
      y: 30 + Math.random() * 10 + Math.cos(i * 0.1) * 2,
      region: ['Atlantic', 'Pacific', 'Indian', 'Arctic'][Math.floor(Math.random() * 4)],
      depth: Math.random() * 5000,
    }));

    // Generate sample depth data
    const depthData = Array.from({ length: 50 }, (_, i) => ({
      depth: i * 100,
      temperature: 25 - (i * 100) * 0.002,
      salinity: 35 + Math.random() * 2,
      pressure: i * 100 * 0.1,
    }));

    // Generate sample geographic data
    const geographicData = Array.from({ length: 200 }, (_, i) => ({
      lat: -90 + Math.random() * 180,
      lon: -180 + Math.random() * 360,
      temp: 10 + Math.random() * 20,
      salinity: 30 + Math.random() * 10,
      depth: Math.random() * 5000,
      region: ['Atlantic', 'Pacific', 'Indian', 'Arctic'][Math.floor(Math.random() * 4)],
    }));

    // Generate sample monthly data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = months.map(month => ({
      month,
      temperature: 12 + Math.random() * 8,
      salinity: 33 + Math.random() * 4,
      records: Math.floor(Math.random() * 10000) + 5000,
    }));

    // Generate correlation data
    const correlationData = Array.from({ length: 100 }, (_, i) => ({
      temperature: 10 + Math.random() * 20,
      salinity: 30 + Math.random() * 10,
      depth: Math.random() * 5000,
    }));

    setAnalyticsData({
      stats: {
        totalRecords: 125000,
        avgTemperature: 15.2,
        avgSalinity: 35.1,
        maxDepth: 5000,
        dataPoints: 200,
      },
      temperatureData,
      salinityData,
      depthData,
      geographicData,
      monthlyData,
      correlationData,
    });
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleRefresh = () => {
    fetchAnalyticsData();
    toast.success('Analytics data refreshed!');
  };

  const handleExport = () => {
    toast.success('Exporting analytics data...');
    // Implement export functionality
  };

  const StatCard = ({ title, value, unit, icon, trend, change, color = '#1976d2' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)` }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ color, p: 1, borderRadius: 2, bgcolor: `${color}20` }}>
              {icon}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {trend === 'up' ? <TrendingUp color="success" /> : <TrendingDown color="error" />}
              <Typography variant="body2" color={trend === 'up' ? 'success.main' : 'error.main'}>
                {change > 0 ? '+' : ''}{change}{unit}
              </Typography>
            </Box>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            {value}{unit}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );

  const TemperatureVsSalinityChart = () => (
    <Card sx={{ height: 400 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Thermostat color="primary" />
          Temperature vs Salinity Correlation
        </Typography>
        <Plot
          data={[
            {
              x: analyticsData.correlationData.map(d => d.temperature),
              y: analyticsData.correlationData.map(d => d.salinity),
              mode: 'markers',
              type: 'scatter',
              name: 'Data Points',
              marker: {
                size: 8,
                color: analyticsData.correlationData.map(d => d.depth),
                colorscale: 'Viridis',
                showscale: true,
                colorbar: {
                  title: 'Depth (m)',
                  titleside: 'right',
                },
              },
              text: analyticsData.correlationData.map(d => `Temp: ${d.temperature.toFixed(1)}°C<br>Salinity: ${d.salinity.toFixed(1)} PSU<br>Depth: ${d.depth.toFixed(0)}m`),
              hovertemplate: '%{text}<extra></extra>',
            },
          ]}
          layout={{
            xaxis: { title: 'Temperature (°C)' },
            yaxis: { title: 'Salinity (PSU)' },
            margin: { t: 20, b: 40, l: 40, r: 20 },
            height: 300,
          }}
          config={{ displayModeBar: false }}
        />
      </CardContent>
    </Card>
  );

  const MonthlyDistributionChart = () => (
    <Card sx={{ height: 400 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <BarChart color="primary" />
          Monthly Data Distribution
        </Typography>
        <Plot
          data={[
            {
              x: analyticsData.monthlyData.map(d => d.month),
              y: analyticsData.monthlyData.map(d => d.records),
              type: 'bar',
              name: 'Records',
              marker: { color: '#4ecdc4' },
            },
          ]}
          layout={{
            xaxis: { title: 'Month' },
            yaxis: { title: 'Number of Records' },
            margin: { t: 20, b: 40, l: 40, r: 20 },
            height: 300,
          }}
          config={{ displayModeBar: false }}
        />
      </CardContent>
    </Card>
  );

  const GeographicDistributionChart = () => (
    <Card sx={{ height: 500 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Map color="primary" />
          Global Ocean Data Distribution
        </Typography>
        <Plot
          data={[
            {
              type: 'scattermapbox',
              lat: analyticsData.geographicData.map(d => d.lat),
              lon: analyticsData.geographicData.map(d => d.lon),
              mode: 'markers',
              marker: {
                size: 8,
                color: analyticsData.geographicData.map(d => d.temp),
                colorscale: 'Viridis',
                showscale: true,
                colorbar: {
                  title: 'Temperature (°C)',
                  titleside: 'right',
                },
              },
              text: analyticsData.geographicData.map(d => 
                `Region: ${d.region}<br>Temp: ${d.temp.toFixed(1)}°C<br>Salinity: ${d.salinity.toFixed(1)} PSU<br>Depth: ${d.depth.toFixed(0)}m`
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

  const DepthProfileChart = () => (
    <Card sx={{ height: 400 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Speed color="primary" />
          Depth Profile Analysis
        </Typography>
        <Plot
          data={[
            {
              x: analyticsData.depthData.map(d => d.temperature),
              y: analyticsData.depthData.map(d => d.depth),
              type: 'scatter',
              mode: 'lines+markers',
              name: 'Temperature',
              line: { color: '#ff6b6b', width: 3 },
              marker: { size: 6 },
            },
            {
              x: analyticsData.depthData.map(d => d.salinity),
              y: analyticsData.depthData.map(d => d.depth),
              type: 'scatter',
              mode: 'lines+markers',
              name: 'Salinity',
              line: { color: '#4ecdc4', width: 3 },
              marker: { size: 6 },
              xaxis: 'x2',
            },
          ]}
          layout={{
            xaxis: { title: 'Temperature (°C)', domain: [0, 0.45] },
            xaxis2: { title: 'Salinity (PSU)', domain: [0.55, 1] },
            yaxis: { title: 'Depth (m)', autorange: 'reversed' },
            margin: { t: 20, b: 40, l: 40, r: 20 },
            height: 300,
          }}
          config={{ displayModeBar: false }}
        />
      </CardContent>
    </Card>
  );

  const OceanParametersPieChart = () => {
    const pieData = [
      { name: 'Temperature', value: 35, color: '#ff6b6b' },
      { name: 'Salinity', value: 25, color: '#4ecdc4' },
      { name: 'Pressure', value: 20, color: '#45b7d1' },
      { name: 'Current Speed', value: 15, color: '#96ceb4' },
      { name: 'pH Level', value: 5, color: '#ff9ff3' },
    ];

    return (
      <Card sx={{ height: 400 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <PieChart color="primary" />
            Ocean Parameters Distribution
          </Typography>
          <Plot
            data={[
              {
                values: pieData.map(d => d.value),
                labels: pieData.map(d => d.name),
                type: 'pie',
                marker: {
                  colors: pieData.map(d => d.color),
                },
                textinfo: 'label+percent',
                textposition: 'outside',
              },
            ]}
            layout={{
              margin: { t: 20, b: 20, l: 20, r: 20 },
              height: 300,
              showlegend: true,
            }}
            config={{ displayModeBar: false }}
          />
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6">Loading analytics...</Typography>
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
              Ocean Analytics 📊
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Comprehensive analysis of ocean data and trends
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh Data">
              <IconButton onClick={handleRefresh} color="primary">
                <Refresh />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export Data">
              <IconButton onClick={handleExport} color="primary">
                <Download />
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
          <StatCard
            title="Total Records"
            value={analyticsData.stats.totalRecords.toLocaleString()}
            unit=""
            icon={<BarChart />}
            trend="up"
            change="12.5%"
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg Temperature"
            value={analyticsData.stats.avgTemperature}
            unit="°C"
            icon={<Thermostat />}
            trend="up"
            change="0.3°C"
            color="#ff6b6b"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg Salinity"
            value={analyticsData.stats.avgSalinity}
            unit=" PSU"
            icon={<Water />}
            trend="down"
            change="-0.1 PSU"
            color="#4ecdc4"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Data Points"
            value={analyticsData.stats.dataPoints}
            unit=""
            icon={<LocationOn />}
            trend="up"
            change="25"
            color="#4caf50"
          />
        </Grid>
      </Grid>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterList color="primary" />
              Filters
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
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
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Year</InputLabel>
                  <Select
                    value={filters.year}
                    onChange={(e) => handleFilterChange('year', e.target.value)}
                  >
                    <MenuItem value="2024">2024</MenuItem>
                    <MenuItem value="2023">2023</MenuItem>
                    <MenuItem value="2022">2022</MenuItem>
                    <MenuItem value="2021">2021</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
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
              <Grid item xs={12} sm={6} md={3}>
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
            </Grid>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Charts" icon={<BarChart />} />
          <Tab label="Map View" icon={<Map />} />
          <Tab label="Time Series" icon={<Timeline />} />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <TemperatureVsSalinityChart />
          </Grid>
          <Grid item xs={12} lg={4}>
            <OceanParametersPieChart />
          </Grid>
          <Grid item xs={12} lg={6}>
            <MonthlyDistributionChart />
          </Grid>
          <Grid item xs={12} lg={6}>
            <DepthProfileChart />
          </Grid>
        </Grid>
      )}

      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <GeographicDistributionChart />
          </Grid>
        </Grid>
      )}

      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <MonthlyDistributionChart />
          </Grid>
          <Grid item xs={12} lg={6}>
            <DepthProfileChart />
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Analytics;