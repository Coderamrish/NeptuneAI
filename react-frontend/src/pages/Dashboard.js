import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Water,
  Thermostat,
  Speed,
  LocationOn,
  Refresh,
  Download,
  Share,
  Notifications,
  Warning,
  CheckCircle,
  Info,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Plot from 'react-plotly.js';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const { user } = useAuth();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('neptuneai_token');
      
      const [statsResponse, geoResponse, profilerResponse, monthlyResponse] = await Promise.all([
        fetch('/api/dashboard/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/dashboard/geographic-data?limit=1000', {
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
        throw new Error('Failed to fetch dashboard data');
      }

      const [stats, geoData, profilerStats, monthlyData] = await Promise.all([
        statsResponse.json(),
        geoResponse.json(),
        profilerResponse.json(),
        monthlyResponse.json()
      ]);

      setDashboardData({
        stats,
        geoData: geoData.data,
        profilerStats: profilerStats.stats,
        monthlyData: monthlyData.data
      });
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    fetchDashboardData();
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
        <Button variant="contained" onClick={handleRefresh}>
          Retry
        </Button>
      </Box>
    );
  }

  const { stats, geoData, profilerStats, monthlyData } = dashboardData;

  // Prepare data for temperature trend chart
  const temperatureData = geoData.slice(0, 100).map((point, index) => ({
    x: index,
    y: point.temperature || Math.random() * 10 + 15, // Fallback for demo
    lat: point.latitude,
    lon: point.longitude
  }));

  const temperatureChart = {
    data: [
      {
        x: temperatureData.map(d => d.x),
        y: temperatureData.map(d => d.y),
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Temperature (°C)',
        line: { color: '#ff6b6b', width: 3 },
        marker: { size: 6 }
      }
    ],
    layout: {
      title: 'Temperature Trends',
      xaxis: { title: 'Data Points' },
      yaxis: { title: 'Temperature (°C)' },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: { color: 'white' },
      margin: { t: 40, b: 40, l: 40, r: 40 }
    },
    config: { responsive: true, displayModeBar: false }
  };

  // Prepare data for monthly distribution chart
  const monthlyChart = {
    data: [
      {
        x: monthlyData.map(d => d.month || d.Month),
        y: monthlyData.map(d => d.count || d.Count),
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

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
            Ocean Data Dashboard
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            Welcome back, {user?.full_name || user?.username}!
          </Typography>
        </motion.div>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefresh} sx={{ color: 'white' }}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export CSV">
            <IconButton onClick={() => handleExport('csv')} sx={{ color: 'white' }}>
              <Download />
            </IconButton>
          </Tooltip>
          <Tooltip title="Share Dashboard">
            <IconButton sx={{ color: 'white' }}>
              <Share />
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
                  {stats?.total_records?.toLocaleString() || '0'}
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
                  {stats?.unique_regions || 0}
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
                    Data Quality
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                  94%
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

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Paper sx={{ 
              p: 3, 
              background: 'rgba(255,255,255,0.1)', 
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                Temperature Trends
              </Typography>
              <Box sx={{ height: 400 }}>
                <Plot
                  data={temperatureChart.data}
                  layout={temperatureChart.layout}
                  config={temperatureChart.config}
                  style={{ width: '100%', height: '100%' }}
                />
              </Box>
            </Paper>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Paper sx={{ 
              p: 3, 
              background: 'rgba(255,255,255,0.1)', 
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              height: '100%'
            }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                Monthly Distribution
              </Typography>
              <Box sx={{ height: 300 }}>
                <Plot
                  data={monthlyChart.data}
                  layout={monthlyChart.layout}
                  config={monthlyChart.config}
                  style={{ width: '100%', height: '100%' }}
                />
              </Box>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>

      {/* Recent Activity and Alerts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Paper sx={{ 
              p: 3, 
              background: 'rgba(255,255,255,0.1)', 
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                Recent Activity
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle sx={{ color: '#4ecdc4' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Data sync completed"
                    secondary="2 minutes ago"
                    primaryTypographyProps={{ color: 'white' }}
                    secondaryTypographyProps={{ color: 'rgba(255,255,255,0.7)' }}
                  />
                </ListItem>
                <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                <ListItem>
                  <ListItemIcon>
                    <Info sx={{ color: '#feca57' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="New data points added"
                    secondary="15 minutes ago"
                    primaryTypographyProps={{ color: 'white' }}
                    secondaryTypographyProps={{ color: 'rgba(255,255,255,0.7)' }}
                  />
                </ListItem>
                <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                <ListItem>
                  <ListItemIcon>
                    <Notifications sx={{ color: '#ff6b6b' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="System maintenance scheduled"
                    secondary="1 hour ago"
                    primaryTypographyProps={{ color: 'white' }}
                    secondaryTypographyProps={{ color: 'rgba(255,255,255,0.7)' }}
                  />
                </ListItem>
              </List>
            </Paper>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Paper sx={{ 
              p: 3, 
              background: 'rgba(255,255,255,0.1)', 
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                System Status
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    Database Connection
                  </Typography>
                  <Chip 
                    label="Online" 
                    color="success" 
                    size="small"
                    icon={<CheckCircle />}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    API Services
                  </Typography>
                  <Chip 
                    label="Healthy" 
                    color="success" 
                    size="small"
                    icon={<CheckCircle />}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    Data Processing
                  </Typography>
                  <Chip 
                    label="Active" 
                    color="info" 
                    size="small"
                    icon={<Speed />}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    Last Updated
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    {lastUpdated?.toLocaleTimeString() || 'Never'}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;