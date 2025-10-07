import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Chip,
  Avatar,
} from '@mui/material';
import {
  Home,
  Analytics,
  Folder,
  CloudUpload,
  Psychology,
  Person,
  Info,
  Waves,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const drawerWidth = 280;

const menuItems = [
  { text: 'Home', icon: <Home />, path: '/' },
  { text: 'Analytics', icon: <Analytics />, path: '/analytics' },
  { text: 'Datasets', icon: <Folder />, path: '/datasets' },
  { text: 'Upload Data', icon: <CloudUpload />, path: '/upload' },
  { text: 'AI Insights', icon: <Psychology />, path: '/ai-insights' },
  { text: 'Profile', icon: <Person />, path: '/profile' },
  { text: 'About', icon: <Info />, path: '/about' },
];

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const drawer = (
    <Box sx={{ height: '100%', background: 'linear-gradient(180deg, #2c3e50 0%, #34495e 100%)' }}>
      {/* Header */}
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Avatar
            sx={{
              width: 60,
              height: 60,
              mx: 'auto',
              mb: 2,
              background: 'linear-gradient(45deg, #3498db, #2980b9)',
            }}
          >
            <Waves sx={{ fontSize: 30 }} />
          </Avatar>
        </motion.div>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
          NeptuneAI
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          Ocean Data Platform
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Navigation */}
      <List sx={{ px: 2, py: 1 }}>
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <motion.div
              key={item.text}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 2,
                    background: isActive 
                      ? 'linear-gradient(45deg, #3498db, #2980b9)' 
                      : 'transparent',
                    '&:hover': {
                      background: isActive 
                        ? 'linear-gradient(45deg, #2980b9, #1e3c72)' 
                        : 'rgba(255,255,255,0.1)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <ListItemIcon sx={{ color: isActive ? 'white' : 'rgba(255,255,255,0.7)' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    sx={{ 
                      color: isActive ? 'white' : 'rgba(255,255,255,0.9)',
                      '& .MuiListItemText-primary': {
                        fontWeight: isActive ? 600 : 400,
                      },
                    }}
                  />
                  {isActive && (
                    <Chip 
                      label="Active" 
                      size="small" 
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontSize: '0.7rem',
                      }} 
                    />
                  )}
                </ListItemButton>
              </ListItem>
            </motion.div>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 2 }} />

      {/* System Status */}
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
          System Status
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              Backend
            </Typography>
            <Chip 
              label="Online" 
              size="small" 
              sx={{ 
                bgcolor: '#27ae60',
                color: 'white',
                fontSize: '0.7rem',
              }} 
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              AI Pipeline
            </Typography>
            <Chip 
              label="Active" 
              size="small" 
              sx={{ 
                bgcolor: '#27ae60',
                color: 'white',
                fontSize: '0.7rem',
              }} 
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              Vector Store
            </Typography>
            <Chip 
              label="Ready" 
              size="small" 
              sx={{ 
                bgcolor: '#27ae60',
                color: 'white',
                fontSize: '0.7rem',
              }} 
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
      sx={{
        display: { xs: 'block', sm: 'none' },
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: drawerWidth,
        },
      }}
    >
      {drawer}
    </Drawer>
  );
};

export default Sidebar;
