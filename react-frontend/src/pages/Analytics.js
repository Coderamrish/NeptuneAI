import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  LinearProgress,
} from '@mui/material';

const Analytics = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'white', mb: 4 }}>
        Ocean Data Analytics
      </Typography>

      <Grid container spacing={3}>
        {/* Data Overview Cards */}
        <Grid item xs={12} md={3}>
          <Card sx={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Profiles
              </Typography>
              <Typography variant="h4" sx={{ color: 'white' }}>
                12,847
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={75} 
                sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.2)' }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Floats
              </Typography>
              <Typography variant="h4" sx={{ color: 'white' }}>
                342
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={60} 
                sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.2)' }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Data Points
              </Typography>
              <Typography variant="h4" sx={{ color: 'white' }}>
                2.4M
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={85} 
                sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.2)' }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Coverage
              </Typography>
              <Typography variant="h4" sx={{ color: 'white' }}>
                78%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={78} 
                sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.2)' }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Placeholder for charts */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
              Analytics Dashboard
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Interactive charts and visualizations will be displayed here.
              This includes temperature trends, salinity profiles, and ocean current patterns.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;
