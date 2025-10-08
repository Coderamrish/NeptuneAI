import React, { useState, useEffect } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  IconButton,
  Chip,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  ChevronLeft,
  Dashboard,
  Analytics,
  DataObject,
  Psychology,
  CloudUpload,
  Person,
  Info,
  ExpandMore,
  Water,
  Thermostat,
  Speed,
  LocationOn,
  TrendingUp,
  Map,
  BarChart,
  FilterList,
  Settings,
  Notifications,
  Timeline,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const drawerWidth = 280;

const Sidebar = ({ open, onClose }) => {
  const [expandedSections, setExpandedSections] = useState({
    navigation: true,
    parameters: false,
    filters: false,
    tools: false
  });
  const [regions, setRegions] = useState([]);
  const [oceanParameters, setOceanParameters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    region: '',
    year: '',
    temperature: [0, 30],
    salinity: [0, 40],
    depth: [0, 5000],
    latitude: [-90, 90],
    longitude: [-180, 180],
  });
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard', badge: null },
    { text: 'Analytics', icon: <Analytics />, path: '/analytics', badge: null },
    { text: 'Data Explorer', icon: <DataObject />, path: '/data-explorer', badge: null },
    { text: 'AI Insights', icon: <Psychology />, path: '/ai-insights', badge: 'New' },
    { text: 'Upload Data', icon: <CloudUpload />, path: '/upload', badge: null },
    { text: 'Profile', icon: <Person />, path: '/profile', badge: null },
    { text: 'About', icon: <Info />, path: '/about', badge: null },
  ];

  const oceanParams = [
    { name: 'Temperature', icon: <Thermostat />, unit: '°C', range: [0, 30], color: '#ff6b6b', value: 15.2 },
    { name: 'Salinity', icon: <Water />, unit: 'PSU', range: [0, 40], color: '#4ecdc4', value: 35.1 },
    { name: 'Pressure', icon: <Speed />, unit: 'dbar', range: [0, 1000], color: '#45b7d1', value: 250.5 },
    { name: 'Depth', icon: <TrendingUp />, unit: 'm', range: [0, 5000], color: '#96ceb4', value: 1200.0 },
    { name: 'Current Speed', icon: <Timeline />, unit: 'm/s', range: [0, 5], color: '#feca57', value: 1.8 },
    { name: 'pH Level', icon: <Water />, unit: 'pH', range: [6, 9], color: '#ff9ff3', value: 8.1 },
  ];

  const quickActions = [
    { name: 'Generate Report', icon: <BarChart />, action: 'report' },
    { name: 'Export Data', icon: <DataObject />, action: 'export' },
    { name: 'Create Map', icon: <Map />, action: 'map' },
    { name: 'AI Analysis', icon: <Psychology />, action: 'ai' },
  ];

  useEffect(() => {
    if (open) {
      fetchRegions();
      fetchOceanParameters();
    }
  }, [open]);

  const fetchRegions = async () => {
    try {
      const token = localStorage.getItem('neptuneai_token');
      const response = await fetch('/api/dashboard/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setRegions(data.regions || ['Atlantic', 'Pacific', 'Indian', 'Arctic', 'Southern']);
      }
    } catch (error) {
      console.error('Failed to fetch regions:', error);
      setRegions(['Atlantic', 'Pacific', 'Indian', 'Arctic', 'Southern']);
    }
  };

  const fetchOceanParameters = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('neptuneai_token');
      const response = await fetch('/api/ocean/parameters', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setOceanParameters(data.parameters || oceanParams);
      } else {
        setOceanParameters(oceanParams);
      }
    } catch (err) {
      console.error('Failed to fetch ocean parameters:', err);
      setOceanParameters(oceanParams);
    } finally {
      setLoading(false);
    }
  };

  const handleSectionToggle = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'report':
        toast.success('Generating ocean data report...');
        navigate('/analytics');
        break;
      case 'export':
        toast.success('Preparing data export...');
        navigate('/data-explorer');
        break;
      case 'map':
        toast.success('Creating ocean map...');
        navigate('/analytics');
        break;
      case 'ai':
        toast.success('Starting AI analysis...');
        navigate('/ai-insights');
        break;
      default:
        break;
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true,
      }}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, #1e3c72 0%, #2a5298 100%)',
          color: 'white',
          overflowY: 'auto',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
            🌊 Ocean Data
          </Typography>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <ChevronLeft />
          </IconButton>
        </Box>

        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 2 }} />

        {/* Navigation */}
        <Accordion 
          expanded={expandedSections.navigation} 
          onChange={() => handleSectionToggle('navigation')}
          sx={{ 
            bgcolor: 'transparent', 
            boxShadow: 'none',
            '&:before': { display: 'none' },
            '&.Mui-expanded': { margin: 0 }
          }}
        >
          <AccordionSummary expandIcon={<ExpandMore sx={{ color: 'white' }} />}>
            <Typography sx={{ color: 'white', fontWeight: 600 }}>Navigation</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <List>
              {menuItems.map((item) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    onClick={() => {
                      navigate(item.path);
                      onClose();
                    }}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      bgcolor: isActive(item.path) ? 'rgba(255,255,255,0.1)' : 'transparent',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.05)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text} 
                      sx={{ 
                        '& .MuiListItemText-primary': { 
                          color: 'white',
                          fontWeight: isActive(item.path) ? 600 : 400,
                        }
                      }} 
                    />
                    {item.badge && (
                      <Chip 
                        label={item.badge} 
                        size="small" 
                        sx={{ 
                          bgcolor: '#ff6b6b', 
                          color: 'white',
                          fontSize: '0.7rem',
                          height: 20
                        }} 
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>

        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', my: 2 }} />

        {/* Ocean Parameters */}
        <Accordion 
          expanded={expandedSections.parameters} 
          onChange={() => handleSectionToggle('parameters')}
          sx={{ 
            bgcolor: 'transparent', 
            boxShadow: 'none',
            '&:before': { display: 'none' },
            '&.Mui-expanded': { margin: 0 }
          }}
        >
          <AccordionSummary expandIcon={<ExpandMore sx={{ color: 'white' }} />}>
            <Typography sx={{ color: 'white', fontWeight: 600 }}>Ocean Parameters</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {oceanParams.map((param, index) => (
                <Card key={param.name} sx={{ bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Box sx={{ color: param.color }}>{param.icon}</Box>
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                        {param.name}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" sx={{ color: 'white' }}>
                        {param.value} {param.unit}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        {param.range[0]}-{param.range[1]} {param.unit}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(param.value / param.range[1]) * 100}
                      sx={{
                        mt: 1,
                        height: 4,
                        borderRadius: 2,
                        bgcolor: 'rgba(255,255,255,0.1)',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: param.color,
                        },
                      }}
                    />
                  </CardContent>
                </Card>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>

        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', my: 2 }} />

        {/* Quick Filters */}
        <Accordion 
          expanded={expandedSections.filters} 
          onChange={() => handleSectionToggle('filters')}
          sx={{ 
            bgcolor: 'transparent', 
            boxShadow: 'none',
            '&:before': { display: 'none' },
            '&.Mui-expanded': { margin: 0 }
          }}
        >
          <AccordionSummary expandIcon={<ExpandMore sx={{ color: 'white' }} />}>
            <Typography sx={{ color: 'white', fontWeight: 600 }}>Quick Filters</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ color: 'white' }}>Region</InputLabel>
                <Select
                  value={filters.region}
                  onChange={(e) => handleFilterChange('region', e.target.value)}
                  sx={{ 
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                  }}
                >
                  {regions.map((region) => (
                    <MenuItem key={region} value={region}>{region}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel sx={{ color: 'white' }}>Year</InputLabel>
                <Select
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                  sx={{ 
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                  }}
                >
                  <MenuItem value="2024">2024</MenuItem>
                  <MenuItem value="2023">2023</MenuItem>
                  <MenuItem value="2022">2022</MenuItem>
                  <MenuItem value="2021">2021</MenuItem>
                </Select>
              </FormControl>

              <Box>
                <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                  Temperature: {filters.temperature[0]}°C - {filters.temperature[1]}°C
                </Typography>
                <Slider
                  value={filters.temperature}
                  onChange={(e, value) => handleFilterChange('temperature', value)}
                  valueLabelDisplay="auto"
                  min={0}
                  max={30}
                  sx={{
                    color: '#ff6b6b',
                    '& .MuiSlider-thumb': { bgcolor: '#ff6b6b' },
                    '& .MuiSlider-track': { bgcolor: '#ff6b6b' },
                  }}
                />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                  Salinity: {filters.salinity[0]} - {filters.salinity[1]} PSU
                </Typography>
                <Slider
                  value={filters.salinity}
                  onChange={(e, value) => handleFilterChange('salinity', value)}
                  valueLabelDisplay="auto"
                  min={0}
                  max={40}
                  sx={{
                    color: '#4ecdc4',
                    '& .MuiSlider-thumb': { bgcolor: '#4ecdc4' },
                    '& .MuiSlider-track': { bgcolor: '#4ecdc4' },
                  }}
                />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                  Depth: {filters.depth[0]} - {filters.depth[1]} m
                </Typography>
                <Slider
                  value={filters.depth}
                  onChange={(e, value) => handleFilterChange('depth', value)}
                  valueLabelDisplay="auto"
                  min={0}
                  max={5000}
                  sx={{
                    color: '#96ceb4',
                    '& .MuiSlider-thumb': { bgcolor: '#96ceb4' },
                    '& .MuiSlider-track': { bgcolor: '#96ceb4' },
                  }}
                />
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>

        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', my: 2 }} />

        {/* Quick Tools */}
        <Accordion 
          expanded={expandedSections.tools} 
          onChange={() => handleSectionToggle('tools')}
          sx={{ 
            bgcolor: 'transparent', 
            boxShadow: 'none',
            '&:before': { display: 'none' },
            '&.Mui-expanded': { margin: 0 }
          }}
        >
          <AccordionSummary expandIcon={<ExpandMore sx={{ color: 'white' }} />}>
            <Typography sx={{ color: 'white', fontWeight: 600 }}>Quick Tools</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {quickActions.map((action) => (
                <Tooltip key={action.name} title={action.name}>
                  <Chip
                    icon={action.icon}
                    label={action.name}
                    onClick={() => handleQuickAction(action.action)}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.2)',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.2)',
                      },
                    }}
                  />
                </Tooltip>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Drawer>
  );
};

export default Sidebar;