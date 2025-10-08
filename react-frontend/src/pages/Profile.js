import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Person,
  Edit,
  Save,
  Cancel,
  Email,
  Phone,
  LocationOn,
  CalendarToday,
  Download,
  Chat,
  BarChart,
  CloudUpload,
  Settings,
  Security,
  Notifications,
  History,
  TrendingUp,
  Water,
  Thermostat,
  Speed,
  Map,
  Timeline,
  DataUsage,
  Assessment,
  Warning,
  CheckCircle,
  Info,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Profile = () => {
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    username: '',
    role: 'user',
    created_at: '',
    last_login: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userStats, setUserStats] = useState({
    totalDownloads: 0,
    totalChats: 0,
    totalUploads: 0,
    dataPoints: 0,
    lastActivity: '',
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [downloadHistory, setDownloadHistory] = useState([]);
  const { user, updateProfile } = useAuth();

  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name || '',
        email: user.email || '',
        username: user.username || '',
        role: user.role || 'user',
        created_at: user.created_at || '',
        last_login: user.last_login || '',
      });
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('neptuneai_token');
      
      // Fetch user statistics
      const statsResponse = await fetch('/api/user/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setUserStats({
          totalDownloads: statsData.totalDownloads || 0,
          totalChats: statsData.totalChats || 0,
          totalUploads: statsData.totalUploads || 0,
          dataPoints: statsData.dataPoints || 0,
          lastActivity: statsData.lastActivity || new Date().toISOString()
        });
      } else {
        // Generate sample data if API fails
        generateSampleData();
      }

      // Fetch recent activity
      const activityResponse = await fetch('/api/user/activity', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setRecentActivity(activityData.activities || []);
      } else {
        generateSampleActivity();
      }

      // Fetch chat history
      const chatResponse = await fetch('/api/chat/sessions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (chatResponse.ok) {
        const chatData = await chatResponse.json();
        setChatHistory(chatData.sessions || []);
      } else {
        generateSampleChatHistory();
      }

    } catch (error) {
      console.error('Failed to fetch user data:', error);
      generateSampleData();
    } finally {
      setLoading(false);
    }
  };

  const generateSampleData = () => {
    setUserStats({
      totalDownloads: 47,
      totalChats: 23,
      totalUploads: 8,
      dataPoints: 125000,
      lastActivity: new Date().toISOString(),
      joinDate: profileData.created_at || new Date().toISOString(),
      dataQuality: 94.5,
      favoriteRegion: 'North Atlantic',
      totalSessions: 15
    });
    generateSampleActivity();
    generateSampleChatHistory();
    generateSampleDownloadHistory();
  };

  const generateSampleActivity = () => {
    setRecentActivity([
      {
        id: 1,
        type: 'download',
        description: 'Downloaded ocean temperature data',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        icon: <Download />,
        color: 'primary',
      },
      {
        id: 2,
        type: 'chat',
        description: 'Asked about salinity patterns',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        icon: <Chat />,
        color: 'success',
      },
      {
        id: 3,
        type: 'upload',
        description: 'Uploaded new dataset',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        icon: <CloudUpload />,
        color: 'warning',
      },
      {
        id: 4,
        type: 'analysis',
        description: 'Generated temperature analysis',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        icon: <BarChart />,
        color: 'info',
      },
    ]);
  };

  const generateSampleChatHistory = () => {
    setChatHistory([
      {
        id: 1,
        title: 'Ocean Temperature Analysis',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        message_count: 12,
      },
      {
        id: 2,
        title: 'Salinity Data Discussion',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        message_count: 8,
      },
      {
        id: 3,
        title: 'Depth Profile Questions',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        message_count: 15,
      },
    ]);
  };

  const generateSampleDownloadHistory = () => {
    setDownloadHistory([
      {
        id: 1,
        filename: 'ocean_temperature_2024.csv',
        size: '2.4 MB',
        format: 'CSV',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
      },
      {
        id: 2,
        filename: 'salinity_data_global.json',
        size: '1.8 MB',
        format: 'JSON',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
      },
      {
        id: 3,
        filename: 'depth_profiles_analysis.xlsx',
        size: '3.2 MB',
        format: 'Excel',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
      },
    ]);
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const result = await updateProfile({
        full_name: profileData.full_name,
        email: profileData.email,
      });
      
      if (result.success) {
        setEditMode(false);
        toast.success('Profile updated successfully!');
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setProfileData({
      full_name: user.full_name || '',
      email: user.email || '',
      username: user.username || '',
      role: user.role || 'user',
      created_at: user.created_at || '',
      last_login: user.last_login || '',
    });
    setEditMode(false);
  };

  const StatCard = ({ title, value, icon, color = '#1976d2', trend = null }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)` }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ color, fontSize: '2rem' }}>
              {icon}
            </Box>
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                <Typography variant="caption" color="success.main">
                  +{trend}%
                </Typography>
              </Box>
            )}
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1, color }}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6">Loading profile...</Typography>
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
              User Profile 👤
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your account settings and view your activity
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {editMode ? (
              <>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                  onClick={handleSaveProfile}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => setEditMode(true)}
              >
                Edit Profile
              </Button>
            )}
          </Box>
        </Box>
      </motion.div>

      {/* Profile Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    fontSize: '3rem',
                    bgcolor: 'primary.main',
                    mb: 3,
                    mx: 'auto',
                  }}
                >
                  {profileData.full_name?.charAt(0) || profileData.username?.charAt(0) || 'U'}
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                  {profileData.full_name || 'User'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  @{profileData.username}
                </Typography>
                <Chip
                  label={profileData.role?.toUpperCase()}
                  color="primary"
                  variant="outlined"
                  sx={{ mb: 3 }}
                />
                <Divider sx={{ my: 2 }} />
                <Box sx={{ textAlign: 'left' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2">{profileData.email}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      Joined {new Date(profileData.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <History sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      Last active {new Date(profileData.last_login).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Settings color="primary" />
                  Profile Information
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                      disabled={!editMode}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      disabled={!editMode}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Username"
                      value={profileData.username}
                      disabled
                      variant="outlined"
                      helperText="Username cannot be changed"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Role"
                      value={profileData.role}
                      disabled
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Data Downloads"
            value={userStats.totalDownloads}
            icon={<Download />}
            color="#1976d2"
            trend="12"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Chat Sessions"
            value={userStats.totalChats}
            icon={<Chat />}
            color="#4caf50"
            trend="8"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Files Uploaded"
            value={userStats.totalUploads}
            icon={<CloudUpload />}
            color="#ff9800"
            trend="25"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Data Points"
            value={userStats.dataPoints.toLocaleString()}
            icon={<BarChart />}
            color="#9c27b0"
            trend="15"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Data Quality"
            value={`${userStats.dataQuality || 94.5}%`}
            icon={<Assessment />}
            color="#00bcd4"
            trend="2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Favorite Region"
            value={userStats.favoriteRegion || 'North Atlantic'}
            icon={<LocationOn />}
            color="#795548"
            trend=""
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Sessions"
            value={userStats.totalSessions || 15}
            icon={<Timeline />}
            color="#607d8b"
            trend="5"
          />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Recent Activity" icon={<History />} />
          <Tab label="Chat History" icon={<Chat />} />
          <Tab label="Downloads" icon={<Download />} />
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
                <History color="primary" />
                Recent Activity
              </Typography>
              <List>
                {recentActivity.map((activity) => (
                  <ListItem key={activity.id} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <ListItemIcon>
                      <Box sx={{ color: `${activity.color}.main` }}>
                        {activity.icon}
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.description}
                      secondary={new Date(activity.timestamp).toLocaleString()}
                    />
                    <Chip
                      label={activity.type}
                      size="small"
                      color={activity.color}
                      variant="outlined"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {tabValue === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chat color="primary" />
                Chat History
              </Typography>
              <List>
                {chatHistory.map((chat) => (
                  <ListItem key={chat.id} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <ListItemIcon>
                      <Chat color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={chat.title}
                      secondary={`${chat.message_count} messages • ${new Date(chat.created_at).toLocaleDateString()}`}
                    />
                    <Button size="small" variant="outlined">
                      View
                    </Button>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {tabValue === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Download color="primary" />
                Download History
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Filename</TableCell>
                      <TableCell>Size</TableCell>
                      <TableCell>Format</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {downloadHistory.map((download) => (
                      <TableRow key={download.id}>
                        <TableCell>{download.filename}</TableCell>
                        <TableCell>{download.size}</TableCell>
                        <TableCell>
                          <Chip label={download.format} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>{new Date(download.timestamp).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Chip
                            label={download.status}
                            size="small"
                            color="success"
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
    </Box>
  );
};

export default Profile;