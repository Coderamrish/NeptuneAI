import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications,
  AccountCircle,
  DarkMode,
  LightMode,
  Settings,
  Logout,
  Person,
  Email,
  Phone,
  LocationOn,
  Edit,
  Save,
  Cancel,
  CheckCircle,
  Warning,
  Info,
  Error,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onMenuClick, darkMode, onToggleDarkMode }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [profileDialog, setProfileDialog] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
  });
  const [editMode, setEditMode] = useState(false);
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('neptuneai_token');
      const response = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchor(null);
  };

  const handleProfileDialogOpen = () => {
    setProfileDialog(true);
    handleMenuClose();
  };

  const handleProfileDialogClose = () => {
    setProfileDialog(false);
    setEditMode(false);
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      const result = await updateProfile(profileData);
      if (result.success) {
        setEditMode(false);
      }
    } catch (err) {
      console.error('Profile update failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('neptuneai_token');
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle sx={{ color: '#4ecdc4' }} />;
      case 'warning': return <Warning sx={{ color: '#feca57' }} />;
      case 'error': return <Error sx={{ color: '#ff6b6b' }} />;
      default: return <Info sx={{ color: '#4ecdc4' }} />;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          background: 'linear-gradient(90deg, #1e3c72 0%, #2a5298 100%)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          zIndex: 1300,
        }}
      >
        <Toolbar>
          {/* Menu Button */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={onMenuClick}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo and Title */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                flexGrow: 1,
                fontWeight: 700,
                fontSize: '1.5rem',
                background: 'linear-gradient(45deg, #ffffff, #85c1e9)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              🌊 NeptuneAI
            </Typography>
          </motion.div>

          <Box sx={{ flexGrow: 1 }} />

          {/* Right side items */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Dark Mode Toggle */}
            <FormControlLabel
              control={
                <Switch
                  checked={darkMode}
                  onChange={onToggleDarkMode}
                  icon={<LightMode />}
                  checkedIcon={<DarkMode />}
                  sx={{
                    '& .MuiSwitch-thumb': {
                      background: 'linear-gradient(45deg, #f39c12, #e67e22)',
                    },
                  }}
                />
              }
              label=""
              sx={{ m: 0 }}
            />

            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton color="inherit" onClick={handleNotificationMenuOpen}>
                <Badge badgeContent={unreadCount} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Profile Menu */}
            <Tooltip title="Profile">
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-controls="primary-search-account-menu"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : <AccountCircle />}
                </Avatar>
              </IconButton>
            </Tooltip>

            {/* Profile Menu */}
            <Menu
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleProfileDialogOpen}>
                <ListItemIcon>
                  <Person />
                </ListItemIcon>
                Profile
              </MenuItem>
              <MenuItem onClick={() => navigate('/settings')}>
                <ListItemIcon>
                  <Settings />
                </ListItemIcon>
                Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>

            {/* Notifications Menu */}
            <Menu
              anchorEl={notificationAnchor}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(notificationAnchor)}
              onClose={handleNotificationMenuClose}
              PaperProps={{
                sx: { width: 350, maxHeight: 400 }
              }}
            >
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">Notifications</Typography>
              </Box>
              <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                {notifications.length === 0 ? (
                  <ListItem>
                    <ListItemText 
                      primary="No notifications" 
                      sx={{ textAlign: 'center', color: 'text.secondary' }}
                    />
                  </ListItem>
                ) : (
                  notifications.map((notification) => (
                    <ListItem
                      key={notification.id}
                      button
                      onClick={() => markNotificationAsRead(notification.id)}
                      sx={{
                        bgcolor: notification.is_read ? 'transparent' : 'rgba(78, 205, 196, 0.1)',
                        borderLeft: notification.is_read ? 'none' : '3px solid #4ecdc4'
                      }}
                    >
                      <ListItemIcon>
                        {getNotificationIcon(notification.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={notification.title}
                        secondary={notification.message}
                        primaryTypographyProps={{ fontSize: '0.9rem' }}
                        secondaryTypographyProps={{ fontSize: '0.8rem' }}
                      />
                    </ListItem>
                  ))
                )}
              </List>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Dialog */}
      <Dialog open={profileDialog} onClose={handleProfileDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Person />
            User Profile
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Full Name"
              value={profileData.full_name}
              onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
              disabled={!editMode}
            />
            <TextField
              fullWidth
              label="Email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              disabled={!editMode}
            />
            <TextField
              fullWidth
              label="Username"
              value={user?.username || ''}
              disabled
              helperText="Username cannot be changed"
            />
            <TextField
              fullWidth
              label="Role"
              value={user?.role || ''}
              disabled
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleProfileDialogClose}>
            Cancel
          </Button>
          {editMode ? (
            <>
              <Button onClick={() => setEditMode(false)}>
                Cancel Edit
              </Button>
              <Button 
                onClick={handleProfileUpdate} 
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Save />}
              >
                Save
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditMode(true)} startIcon={<Edit />}>
              Edit Profile
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Navbar;
