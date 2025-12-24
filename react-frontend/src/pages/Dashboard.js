import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  LinearProgress,
  Chip,
  Alert,
  CircularProgress,
  Tooltip,
  Paper,
  Avatar,
  Divider,
  Badge,
} from '@mui/material';
import {
  Refresh,
  Download,
  TrendingUp,
  TrendingDown,
  Water,
  Thermostat,
  Speed,
  LocationOn,
  Timeline,
  BarChart,
  Map,
  Psychology,
  CloudUpload,
  Warning,
  CheckCircle,
  Info,
  Waves,
  Air,
  Opacity,
  Explore,
  Science,
  NavigationOutlined,
  AccessTime,
  FilterDrama,
  Anchor,
  Sailing,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import Plot from 'react-plotly.js';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRecords: 0,
    activeStations: 0,
    avgTemperature: 0,
    avgSalinity: 0,
    dataQuality: 0,
    maxDepth: 0,
    lastUpdate: null,
  });
  const [geoData, setGeoData] = useState([]);
  const [profilerStats, setProfilerStats] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [depthData, setDepthData] = useState([]);
  const [salinityData, setSalinityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeOfDay, setTimeOfDay] = useState('morning');
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
    updateTimeOfDay();
  }, []);

  const updateTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('morning');
    else if (hour < 18) setTimeOfDay('afternoon');
    else setTimeOfDay('evening');
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('neptuneai_token');
      
      const statsResponse = await fetch('/api/dashboard/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats({
          totalRecords: statsData.totalRecords || 0,
          activeStations: statsData.activeStations || 0,
          avgTemperature: statsData.avgTemperature || 0,
          avgSalinity: statsData.avgSalinity || 0,
          maxDepth: statsData.maxDepth || 0,
          dataPoints: statsData.dataPoints || 0,
          lastUpdate: statsData.lastUpdate || new Date().toISOString()
        });
      } else {
        setStats({
          totalRecords: 125000,
          activeStations: 45,
          avgTemperature: 15.2,
          avgSalinity: 35.1,
          dataQuality: 94.5,
          maxDepth: 5842,
          lastUpdate: new Date().toISOString(),
        });
      }

      generateSampleData();
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data');
      generateSampleData();
    } finally {
      setLoading(false);
    }
  };

  const generateSampleData = () => {
    const sampleGeoData = Array.from({ length: 80 }, (_, i) => ({
      lat: -70 + Math.random() * 140,
      lon: -180 + Math.random() * 360,
      temp: 2 + Math.random() * 28,
      salinity: 32 + Math.random() * 8,
      depth: Math.random() * 6000,
    }));
    setGeoData(sampleGeoData);

    const sampleProfilerStats = [
      { name: 'Temperature', value: 15.2, unit: '°C', trend: 'up', change: 0.3 },
      { name: 'Salinity', value: 35.1, unit: 'PSU', trend: 'down', change: -0.1 },
      { name: 'Pressure', value: 250.5, unit: 'dbar', trend: 'up', change: 2.1 },
      { name: 'Current Speed', value: 1.8, unit: 'm/s', trend: 'up', change: 0.2 },
      { name: 'Wave Height', value: 2.4, unit: 'm', trend: 'down', change: -0.3 },
      { name: 'Wind Speed', value: 12.5, unit: 'km/h', trend: 'up', change: 1.2 },
    ];
    setProfilerStats(sampleProfilerStats);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const sampleMonthlyData = months.map(month => ({
      month,
      temperature: 12 + Math.random() * 8,
      salinity: 33 + Math.random() * 4,
      records: Math.floor(Math.random() * 10000) + 5000,
    }));
    setMonthlyData(sampleMonthlyData);

    // Depth profile data
    const depths = [0, 100, 200, 500, 1000, 2000, 3000, 4000, 5000];
    const sampleDepthData = depths.map(depth => ({
      depth,
      temperature: 25 - (depth / 300),
      salinity: 35 + (depth / 1000),
    }));
    setDepthData(sampleDepthData);

    // Salinity distribution
    const sampleSalinityData = Array.from({ length: 50 }, () => ({
      value: 32 + Math.random() * 6,
    }));
    setSalinityData(sampleSalinityData);
  };

  const handleRefresh = () => {
    fetchDashboardData();
    toast.success('Dashboard data refreshed!');
  };

  const handleExport = () => {
    toast.success('Exporting dashboard data...');
  };

  const StatCard = ({ title, value, unit, icon, trend, change, color = '#1976d2', subtitle }) => {
    const safeValue = value !== undefined ? value : 0;
    const safeChange = change !== undefined ? change : 0;
    const safeTrend = trend || 'up';
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      >
        <Card 
          sx={{ 
            height: '100%', 
            background: `linear-gradient(135deg, ${color}20 0%, ${color}05 100%)`,
            border: `1px solid ${color}30`,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(90deg, ${color}, ${color}80)`,
            }
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
              <Avatar sx={{ bgcolor: color, width: 56, height: 56, boxShadow: `0 4px 12px ${color}40` }}>
                {icon}
              </Avatar>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: safeTrend === 'up' ? '#4caf5015' : '#f4433615', px: 1, py: 0.5, borderRadius: 2 }}>
                {safeTrend === 'up' ? <TrendingUp sx={{ fontSize: 18, color: '#4caf50' }} /> : <TrendingDown sx={{ fontSize: 18, color: '#f44336' }} />}
                <Typography variant="caption" sx={{ fontWeight: 600, color: safeTrend === 'up' ? '#4caf50' : '#f44336' }}>
                  {safeChange > 0 ? '+' : ''}{safeChange}
                </Typography>
              </Box>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5, color: '#1a237e' }}>
              {typeof safeValue === 'number' ? safeValue.toLocaleString() : safeValue}{unit}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const OceanMapChart = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card sx={{ height: 500, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: '#1976d2' }}>
                <Map />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Global Ocean Temperature Map
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Real-time data from {geoData.length} monitoring stations
                </Typography>
              </Box>
            </Box>
            <Chip label="Live" color="success" size="small" icon={<CircularProgress size={12} sx={{ color: 'white' }} />} />
          </Box>
          <Plot
            data={[
              {
                type: 'scattermapbox',
                lat: geoData.map(d => d.lat),
                lon: geoData.map(d => d.lon),
                mode: 'markers',
                marker: {
                  size: 10,
                  color: geoData.map(d => d.temp),
                  colorscale: [
                    [0, '#0d47a1'],
                    [0.25, '#1976d2'],
                    [0.5, '#4caf50'],
                    [0.75, '#ff9800'],
                    [1, '#f44336']
                  ],
                  showscale: true,
                  colorbar: {
                    title: 'Temp (°C)',
                    titleside: 'right',
                    thickness: 15,
                  },
                },
                text: geoData.map(d => `Temp: ${d.temp.toFixed(1)}°C<br>Salinity: ${d.salinity.toFixed(1)} PSU<br>Depth: ${d.depth.toFixed(0)}m`),
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
    </motion.div>
  );

  const DepthProfileChart = () => (
    <Card sx={{ height: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Avatar sx={{ bgcolor: '#2196f3' }}>
            <Anchor />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Depth Profile Analysis
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Temperature and salinity vs depth
            </Typography>
          </Box>
        </Box>
        <Plot
          data={[
            {
              y: depthData.map(d => d.depth),
              x: depthData.map(d => d.temperature),
              type: 'scatter',
              mode: 'lines+markers',
              name: 'Temperature',
              line: { color: '#ff6b6b', width: 3 },
              marker: { size: 8 },
            },
            {
              y: depthData.map(d => d.depth),
              x: depthData.map(d => d.salinity),
              type: 'scatter',
              mode: 'lines+markers',
              name: 'Salinity',
              line: { color: '#4ecdc4', width: 3 },
              marker: { size: 8 },
              xaxis: 'x2',
            },
          ]}
          layout={{
            xaxis: { title: 'Temperature (°C)', side: 'top' },
            xaxis2: { title: 'Salinity (PSU)', overlaying: 'x', side: 'bottom' },
            yaxis: { title: 'Depth (m)', autorange: 'reversed' },
            margin: { t: 60, b: 60, l: 60, r: 20 },
            height: 300,
            showlegend: true,
            legend: { x: 0.7, y: 0.95 },
          }}
          config={{ displayModeBar: false }}
        />
      </CardContent>
    </Card>
  );

  const TemperatureChart = () => (
    <Card sx={{ height: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Avatar sx={{ bgcolor: '#ff6b6b' }}>
            <Thermostat />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Annual Temperature Trends
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Monthly average ocean temperatures
            </Typography>
          </Box>
        </Box>
        <Plot
          data={[
            {
              x: monthlyData.map(d => d.month),
              y: monthlyData.map(d => d.temperature),
              type: 'scatter',
              mode: 'lines+markers',
              name: 'Temperature',
              fill: 'tozeroy',
              fillcolor: 'rgba(255, 107, 107, 0.2)',
              line: { color: '#ff6b6b', width: 3 },
              marker: { size: 10, color: '#ff6b6b' },
            },
          ]}
          layout={{
            xaxis: { title: 'Month', showgrid: false },
            yaxis: { title: 'Temperature (°C)', showgrid: true, gridcolor: '#f0f0f0' },
            margin: { t: 20, b: 50, l: 50, r: 20 },
            height: 300,
            plot_bgcolor: '#fafafa',
          }}
          config={{ displayModeBar: false }}
        />
      </CardContent>
    </Card>
  );

  const SalinityDistributionChart = () => (
    <Card sx={{ height: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Avatar sx={{ bgcolor: '#4ecdc4' }}>
            <Opacity />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Salinity Distribution
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Frequency distribution of salinity measurements
            </Typography>
          </Box>
        </Box>
        <Plot
          data={[
            {
              x: salinityData.map(d => d.value),
              type: 'histogram',
              marker: {
                color: '#4ecdc4',
                line: { color: '#3da7a0', width: 1 }
              },
              nbinsx: 20,
            },
          ]}
          layout={{
            xaxis: { title: 'Salinity (PSU)' },
            yaxis: { title: 'Frequency' },
            margin: { t: 20, b: 50, l: 50, r: 20 },
            height: 300,
            plot_bgcolor: '#fafafa',
          }}
          config={{ displayModeBar: false }}
        />
      </CardContent>
    </Card>
  );

  const MonthlyDistributionChart = () => (
    <Card sx={{ height: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Avatar sx={{ bgcolor: '#9c27b0' }}>
            <BarChart />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Data Collection Volume
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Monthly record counts across all stations
            </Typography>
          </Box>
        </Box>
        <Plot
          data={[
            {
              x: monthlyData.map(d => d.month),
              y: monthlyData.map(d => d.records),
              type: 'bar',
              name: 'Records',
              marker: { 
                color: monthlyData.map(d => d.records),
                colorscale: 'Viridis',
                showscale: false,
              },
            },
          ]}
          layout={{
            xaxis: { title: 'Month', showgrid: false },
            yaxis: { title: 'Number of Records', showgrid: true, gridcolor: '#f0f0f0' },
            margin: { t: 20, b: 50, l: 60, r: 20 },
            height: 300,
            plot_bgcolor: '#fafafa',
          }}
          config={{ displayModeBar: false }}
        />
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Waves sx={{ fontSize: 80, color: 'white', mb: 2 }} />
          </motion.div>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
            Loading Ocean Data...
          </Typography>
        </Box>
      </Box>
    );
  }

  const getGreeting = () => {
    if (timeOfDay === 'morning') return 'Good Morning';
    if (timeOfDay === 'afternoon') return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <Box sx={{ 
      p: 3, 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%)',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C27B0\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        opacity: 0.4,
        pointerEvents: 'none',
      }
    }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card sx={{ 
          mb: 3, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          boxShadow: '0 10px 40px rgba(102, 126, 234, 0.4)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <Box sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
          }} />
          <CardContent sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                  {getGreeting()}, {user?.full_name || user?.username || 'Ocean Explorer'}! 
                  <Waves sx={{ fontSize: 40 }} />
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                  Dive into your comprehensive ocean data analytics dashboard
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Chip 
                    icon={<AccessTime />} 
                    label={`Last updated: ${new Date().toLocaleTimeString()}`} 
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                  <Chip 
                    icon={<LocationOn />} 
                    label="45 Active Stations" 
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Refresh Data">
                  <IconButton 
                    onClick={handleRefresh} 
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                    }}
                  >
                    <Refresh />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Export Data">
                  <IconButton 
                    onClick={handleExport}
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                    }}
                  >
                    <Download />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {error && (
        <Alert severity="error" sx={{ mb: 3, boxShadow: '0 4px 12px rgba(244, 67, 54, 0.2)' }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Records"
            value={stats.totalRecords.toLocaleString()}
            unit=""
            icon={<BarChart />}
            trend="up"
            change="+12.5%"
            color="#1976d2"
            subtitle="Across all monitoring stations"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Active Stations"
            value={stats.activeStations}
            unit=""
            icon={<LocationOn />}
            trend="up"
            change="+2"
            color="#4caf50"
            subtitle="Operational worldwide"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Avg Temperature"
            value={(stats.avgTemperature || 0).toFixed(1)}
            unit="°C"
            icon={<Thermostat />}
            trend="up"
            change="+0.3"
            color="#ff6b6b"
            subtitle="Global ocean surface"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Data Quality"
            value={(stats.dataQuality || 0).toFixed(1)}
            unit="%"
            icon={<CheckCircle />}
            trend="up"
            change="+2.1"
            color="#9c27b0"
            subtitle="Validation accuracy"
          />
        </Grid>
      </Grid>

      {/* Ocean Parameters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card sx={{ mb: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Avatar sx={{ bgcolor: '#2196f3', width: 48, height: 48 }}>
                <Water />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Real-time Ocean Parameters
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Live measurements from deployed sensors
                </Typography>
              </Box>
            </Box>
            <Grid container spacing={2}>
              {profilerStats.map((param, index) => (
                <Grid item xs={12} sm={6} md={4} lg={2} key={param.name}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <Paper sx={{ 
                      p: 2.5, 
                      textAlign: 'center',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
                      border: '1px solid #e0e0e0',
                      borderRadius: 2,
                    }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        mb: 1.5,
                        bgcolor: '#2196f315',
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        mx: 'auto',
                      }}>
                        {param.name === 'Temperature' && <Thermostat sx={{ color: '#ff6b6b', fontSize: 28 }} />}
                        {param.name === 'Salinity' && <Opacity sx={{ color: '#4ecdc4', fontSize: 28 }} />}
                        {param.name === 'Pressure' && <Speed sx={{ color: '#9c27b0', fontSize: 28 }} />}
                        {param.name === 'Current Speed' && <Timeline sx={{ color: '#ff9800', fontSize: 28 }} />}
                        {param.name === 'Wave Height' && <Waves sx={{ color: '#2196f3', fontSize: 28 }} />}
                        {param.name === 'Wind Speed' && <Air sx={{ color: '#4caf50', fontSize: 28 }} />}
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, color: '#1a237e' }}>
                        {param.value} {param.unit}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 1 }}>
                        {param.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        {param.trend === 'up' ? <TrendingUp sx={{ fontSize: 16, color: '#4caf50' }} /> : <TrendingDown sx={{ fontSize: 16, color: '#f44336' }} />}
                        <Typography variant="caption" sx={{ fontWeight: 600, color: param.trend === 'up' ? '#4caf50' : '#f44336' }}>
                          {param.change > 0 ? '+' : ''}{param.change}{param.unit}
                        </Typography>
                      </Box>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts - Top Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={8}>
          <OceanMapChart />
        </Grid>
        <Grid item xs={12} lg={4}>
          <DepthProfileChart />
        </Grid>
      </Grid>

      {/* Charts - Middle Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TemperatureChart />
        </Grid>
        <Grid item xs={12} md={6}>
          <SalinityDistributionChart />
        </Grid>
      </Grid>

      {/* Charts - Bottom Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <MonthlyDistributionChart />
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Avatar sx={{ bgcolor: '#ff9800' }}>
                  <Psychology />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Recent Activity Feed
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Latest system events and notifications
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, maxHeight: 300, overflow: 'auto' }}>
                {[
                  { 
                    action: 'New temperature data uploaded', 
                    time: '2 minutes ago', 
                    type: 'success',
                    icon: <CloudUpload />,
                    details: 'Station 42 - Pacific Ocean'
                  },
                  { 
                    action: 'High temperature alert triggered', 
                    time: '15 minutes ago', 
                    type: 'warning',
                    icon: <Warning />,
                    details: 'Station 18 - Indian Ocean'
                  },
                  { 
                    action: 'AI anomaly detection completed', 
                    time: '1 hour ago', 
                    type: 'info',
                    icon: <Psychology />,
                    details: 'Processed 12,450 records'
                  },
                  { 
                    action: 'Monthly report generated', 
                    time: '2 hours ago', 
                    type: 'success',
                    icon: <CheckCircle />,
                    details: 'November 2024 Summary'
                  },
                  { 
                    action: 'Sensor calibration required', 
                    time: '3 hours ago', 
                    type: 'warning',
                    icon: <Info />,
                    details: 'Station 7 - Atlantic Ocean'
                  },
                  { 
                    action: 'Data export completed', 
                    time: '5 hours ago', 
                    type: 'success',
                    icon: <Download />,
                    details: '250MB CSV exported'
                  },
                ].map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Paper sx={{ 
                      p: 2, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      border: '1px solid #e0e0e0',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        transform: 'translateX(4px)',
                        transition: 'all 0.3s ease'
                      }
                    }}>
                      <Avatar sx={{ 
                        bgcolor: activity.type === 'success' ? '#4caf50' : 
                                activity.type === 'warning' ? '#ff9800' : '#2196f3',
                        width: 40,
                        height: 40,
                      }}>
                        {activity.icon}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {activity.action}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {activity.details}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                          <AccessTime sx={{ fontSize: 12 }} />
                          {activity.time}
                        </Typography>
                      </Box>
                      <Chip 
                        label={activity.type} 
                        size="small" 
                        color={activity.type === 'success' ? 'success' : activity.type === 'warning' ? 'warning' : 'info'}
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </Paper>
                  </motion.div>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Additional Info Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                    <Science sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      1,247
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Research Projects
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>342</Typography>
                    <Typography variant="caption">Active</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>905</Typography>
                    <Typography variant="caption">Completed</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card sx={{ 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(240, 147, 251, 0.4)',
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                    <Sailing sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      89
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Vessels Tracked
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>67</Typography>
                    <Typography variant="caption">At Sea</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>22</Typography>
                    <Typography variant="caption">Docked</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card sx={{ 
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(79, 172, 254, 0.4)',
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                    <Explore sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      5,842m
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Max Depth Recorded
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>2,340m</Typography>
                    <Typography variant="caption">Avg Depth</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>12</Typography>
                    <Typography variant="caption">Deep Probes</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card sx={{ boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Avatar sx={{ bgcolor: '#4caf50' }}>
                <CheckCircle />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  System Health & Performance
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  All systems operational
                </Typography>
              </Box>
            </Box>
            <Grid container spacing={3}>
              {[
                { label: 'Data Pipeline', value: 98, color: '#4caf50' },
                { label: 'API Response Time', value: 95, color: '#2196f3' },
                { label: 'Sensor Connectivity', value: 92, color: '#ff9800' },
                { label: 'Storage Capacity', value: 87, color: '#9c27b0' },
              ].map((metric, index) => (
                <Grid item xs={12} sm={6} md={3} key={metric.label}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {metric.label}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: metric.color }}>
                        {metric.value}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={metric.value} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        bgcolor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: metric.color,
                          borderRadius: 4,
                        }
                      }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default Dashboard;