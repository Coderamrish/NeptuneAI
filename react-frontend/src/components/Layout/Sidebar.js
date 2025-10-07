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
} from '@mui/material';
import {
  ChevronLeft,
  Dashboard,
  Analytics,
  DataObject,
  CloudUpload,
  Psychology,
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
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ open, onClose }) => {
  const [expandedSections, setExpandedSections] = useState({
    navigation: true,
    parameters: false,
    filters: false,
    tools: false
  });
  const [regions, setRegions] = useState([]);
  const { user } = useAuth();

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
    { name: 'Temperature', icon: <Thermostat />, unit: '°C', range: [0, 30], color: '#ff6b6b' },
    { name: 'Salinity', icon: <Water />, unit: 'PSU', range: [0, 40], color: '#4ecdc4' },
    { name: 'Pressure', icon: <Speed />, unit: 'dbar', range: [0, 1000], color: '#a55eea' },
    { name: 'Depth', icon: <TrendingUp />, unit: 'm', range: [0, 2000], color: '#feca57' },
    { name: 'Latitude', icon: <LocationOn />, unit: '°', range: [-90, 90], color: '#ff9ff3' },
    { name: 'Longitude', icon: <LocationOn />, unit: '°', range: [-180, 180], color: '#54a0ff' },
  ];

  const quickTools = [
    { name: 'Generate Map', icon: <Map />, action: 'map' },
    { name: 'Create Chart', icon: <BarChart />, action: 'chart' },
    { name: 'Export Data', icon: <CloudUpload />, action: 'export' },
    { name: 'AI Analysis', icon: <Psychology />, action: 'ai' },
  ];

  useEffect(() => {
    if (open) {
      fetchRegions();
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
        setRegions(data.regions || []);
      }
    } catch (err) {
      console.error('Failed to fetch regions:', err);
    }
  };

  const handleSectionToggle = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleParameterChange = (paramName, value) => {
    // This would typically update a global filter state
    console.log(`Parameter ${paramName} changed to:`, value);
  };

  const handleToolAction = (action) => {
    // This would trigger different actions based on the tool
    console.log(`Tool action: ${action}`);
  };

  return (
    <Drawer
      variant="temporary"
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 320,
          background: 'linear-gradient(180deg, #1e3c72 0%, #2a5298 100%)',
          color: 'white',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          overflowY: 'auto',
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-track': { background: 'rgba(255,255,255,0.1)' },
          '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.3)', borderRadius: '3px' }
        },
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
            🌊 NeptuneAI
          </Typography>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <ChevronLeft />
          </IconButton>
        </Box>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1 }}>
          Ocean Data Platform
        </Typography>
      </Box>

      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />

      {/* Navigation Section */}
      <Accordion 
        expanded={expandedSections.navigation} 
        onChange={() => handleSectionToggle('navigation')}
        sx={{ 
          background: 'transparent', 
          boxShadow: 'none',
          '&:before': { display: 'none' },
          '&.Mui-expanded': { margin: 0 }
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMore sx={{ color: 'white' }} />}
          sx={{ minHeight: 48, '&.Mui-expanded': { minHeight: 48 } }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'white' }}>
            Navigation
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          <List dense>
            {menuItems.map((item, index) => (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    sx={{
                      borderRadius: 1,
                      py: 1,
                      '&:hover': {
                        background: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: 'white', minWidth: 36 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text}
                      primaryTypographyProps={{ fontSize: '0.9rem' }}
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
              </motion.div>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', my: 1 }} />

      {/* Ocean Parameters Section */}
      <Accordion 
        expanded={expandedSections.parameters} 
        onChange={() => handleSectionToggle('parameters')}
        sx={{ 
          background: 'transparent', 
          boxShadow: 'none',
          '&:before': { display: 'none' },
          '&.Mui-expanded': { margin: 0 }
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMore sx={{ color: 'white' }} />}
          sx={{ minHeight: 48, '&.Mui-expanded': { minHeight: 48 } }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'white' }}>
            Ocean Parameters
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {oceanParams.map((param, index) => (
              <motion.div
                key={param.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ color: param.color, mr: 1 }}>
                      {param.icon}
                    </Box>
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                      {param.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', ml: 1 }}>
                      ({param.unit})
                    </Typography>
                  </Box>
                  <Slider
                    size="small"
                    value={param.range}
                    min={param.range[0]}
                    max={param.range[1]}
                    onChange={(e, newValue) => handleParameterChange(param.name, newValue)}
                    sx={{
                      color: param.color,
                      '& .MuiSlider-thumb': { width: 12, height: 12 },
                      '& .MuiSlider-track': { height: 4 },
                      '& .MuiSlider-rail': { height: 4, bgcolor: 'rgba(255,255,255,0.2)' }
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      {param.range[0]}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      {param.range[1]}
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', my: 1 }} />

      {/* Filters Section */}
      <Accordion 
        expanded={expandedSections.filters} 
        onChange={() => handleSectionToggle('filters')}
        sx={{ 
          background: 'transparent', 
          boxShadow: 'none',
          '&:before': { display: 'none' },
          '&.Mui-expanded': { margin: 0 }
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMore sx={{ color: 'white' }} />}
          sx={{ minHeight: 48, '&.Mui-expanded': { minHeight: 48 } }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'white' }}>
            Quick Filters
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl size="small" fullWidth>
              <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Region</InputLabel>
              <Select
                value=""
                onChange={(e) => handleParameterChange('region', e.target.value)}
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' }
                }}
              >
                <MenuItem value="">All Regions</MenuItem>
                {regions.map(region => (
                  <MenuItem key={region} value={region}>{region}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Year</InputLabel>
              <Select
                value=""
                onChange={(e) => handleParameterChange('year', e.target.value)}
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' }
                }}
              >
                <MenuItem value="">All Years</MenuItem>
                <MenuItem value="2023">2023</MenuItem>
                <MenuItem value="2022">2022</MenuItem>
                <MenuItem value="2021">2021</MenuItem>
              </Select>
            </FormControl>

          </Box>
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', my: 1 }} />

      {/* Quick Tools Section */}
      <Accordion 
        expanded={expandedSections.tools} 
        onChange={() => handleSectionToggle('tools')}
        sx={{ 
          background: 'transparent', 
          boxShadow: 'none',
          '&:before': { display: 'none' },
          '&.Mui-expanded': { margin: 0 }
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMore sx={{ color: 'white' }} />}
          sx={{ minHeight: 48, '&.Mui-expanded': { minHeight: 48 } }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'white' }}>
            Quick Tools
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {quickTools.map((tool, index) => (
              <motion.div
                key={tool.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => handleToolAction(tool.action)}
                    sx={{
                      borderRadius: 1,
                      py: 1,
                      '&:hover': {
                        background: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: 'white', minWidth: 36 }}>
                      {tool.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={tool.name}
                      primaryTypographyProps={{ fontSize: '0.9rem' }}
                    />
                  </ListItemButton>
                </ListItem>
              </motion.div>
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', my: 1 }} />

      {/* User Info */}
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Box sx={{ 
          p: 2, 
          bgcolor: 'rgba(255,255,255,0.05)', 
          borderRadius: 1,
          textAlign: 'center'
        }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Welcome back,
          </Typography>
          <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
            {user?.full_name || user?.username || 'User'}
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;