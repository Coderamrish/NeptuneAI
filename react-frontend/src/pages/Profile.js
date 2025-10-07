import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Avatar,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import { Person, Email, Settings, History, Download } from '@mui/icons-material';

const Profile = () => {
  const user = {
    name: 'Ocean Researcher',
    email: 'researcher@neptuneai.com',
    role: 'Data Scientist',
    joinDate: 'January 2024',
    totalQueries: 156,
    datasetsAccessed: 23,
  };

  const recentActivity = [
    { action: 'Analyzed temperature trends', time: '2 hours ago' },
    { action: 'Downloaded Indian Ocean dataset', time: '1 day ago' },
    { action: 'Generated salinity report', time: '3 days ago' },
    { action: 'Uploaded new NetCDF file', time: '1 week ago' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'white', mb: 4 }}>
        User Profile
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'rgba(52, 152, 219, 0.8)',
                  fontSize: '2rem',
                }}
              >
                <Person />
              </Avatar>
              <Typography variant="h5" sx={{ color: 'white', mb: 1 }}>
                {user.name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                {user.role}
              </Typography>
            </Box>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', mb: 2 }} />

            <Box sx={{ color: 'rgba(255,255,255,0.8)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Email sx={{ mr: 2, fontSize: 20 }} />
                <Typography variant="body2">{user.email}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <History sx={{ mr: 2, fontSize: 20 }} />
                <Typography variant="body2">Joined {user.joinDate}</Typography>
              </Box>
            </Box>

            <Button
              variant="outlined"
              fullWidth
              startIcon={<Settings />}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.3)',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              Edit Profile
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                  Usage Statistics
                </Typography>
                <Box sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Total Queries</Typography>
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                      {user.totalQueries}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Datasets Accessed</Typography>
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                      {user.datasetsAccessed}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Data Downloaded</Typography>
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                      2.3 GB
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Download />}
                    sx={{
                      color: 'white',
                      borderColor: 'rgba(255,255,255,0.3)',
                      justifyContent: 'flex-start',
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    Download Data
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<History />}
                    sx={{
                      color: 'white',
                      borderColor: 'rgba(255,255,255,0.3)',
                      justifyContent: 'flex-start',
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    View History
                  </Button>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                  Recent Activity
                </Typography>
                <List>
                  {recentActivity.map((activity, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemIcon>
                        <History sx={{ color: 'rgba(255,255,255,0.7)' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.action}
                        secondary={activity.time}
                        sx={{
                          '& .MuiListItemText-primary': {
                            color: 'white',
                          },
                          '& .MuiListItemText-secondary': {
                            color: 'rgba(255,255,255,0.7)',
                          },
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
