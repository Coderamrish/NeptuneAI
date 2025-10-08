import React, { useEffect } from 'react';
import { Box, Typography, Button, Container, Grid, Card, CardContent, CardActions } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Water,
  Thermostat,
  Speed,
  LocationOn,
  Psychology,
  Analytics,
  DataObject,
  CloudUpload,
} from '@mui/icons-material';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard if user is authenticated, otherwise to auth
    const token = localStorage.getItem('neptuneai_token');
    if (token) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  }, [navigate]);

  const features = [
    {
      icon: <Analytics />,
      title: 'Real-time Analytics',
      description: 'Monitor ocean data in real-time with advanced analytics and visualizations.',
      color: '#1976d2'
    },
    {
      icon: <Psychology />,
      title: 'AI-Powered Insights',
      description: 'Get intelligent insights and predictions using machine learning algorithms.',
      color: '#9c27b0'
    },
    {
      icon: <DataObject />,
      title: 'Data Explorer',
      description: 'Explore vast ocean datasets with powerful filtering and search capabilities.',
      color: '#4caf50'
    },
    {
      icon: <CloudUpload />,
      title: 'Data Upload',
      description: 'Upload and manage your own ocean data with our secure platform.',
      color: '#ff9800'
    },
    {
      icon: <Water />,
      title: 'Ocean Parameters',
      description: 'Track temperature, salinity, pressure, and other critical ocean parameters.',
      color: '#00bcd4'
    },
    {
      icon: <LocationOn />,
      title: 'Global Coverage',
      description: 'Access data from all major oceans and seas worldwide.',
      color: '#f44336'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                color: 'white',
                mb: 3,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              🌊 NeptuneAI
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: 'rgba(255,255,255,0.9)',
                mb: 4,
                fontSize: { xs: '1.2rem', md: '1.5rem' },
                maxWidth: '600px',
                mx: 'auto'
              }}
            >
              Advanced Ocean Data Platform Powered by AI
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255,255,255,0.8)',
                mb: 4,
                fontSize: '1.1rem',
                maxWidth: '500px',
                mx: 'auto'
              }}
            >
              Monitor, analyze, and understand our oceans like never before. 
              Get real-time insights, create visualizations, and make data-driven decisions.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/auth')}
                sx={{
                  bgcolor: 'white',
                  color: '#1976d2',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.9)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/about')}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Learn More
              </Button>
            </Box>
          </Box>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Typography
            variant="h3"
            sx={{
              textAlign: 'center',
              color: 'white',
              mb: 6,
              fontWeight: 600,
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            Powerful Features
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  whileHover={{ y: -5 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      background: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: 'white',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.15)',
                        transform: 'translateY(-5px)',
                      }
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <Box
                        sx={{
                          color: feature.color,
                          fontSize: '3rem',
                          mb: 2,
                          display: 'flex',
                          justifyContent: 'center'
                        }}
                      >
                        {feature.icon}
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          mb: 2,
                          color: 'white'
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255,255,255,0.8)',
                          lineHeight: 1.6
                        }}
                      >
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Box
            sx={{
              textAlign: 'center',
              mt: 8,
              p: 4,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: 3,
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            <Typography
              variant="h4"
              sx={{
                color: 'white',
                mb: 2,
                fontWeight: 600
              }}
            >
              Ready to Explore the Oceans?
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255,255,255,0.8)',
                mb: 3,
                fontSize: '1.1rem'
              }}
            >
              Join thousands of researchers, scientists, and ocean enthusiasts 
              who are already using NeptuneAI to unlock the secrets of our oceans.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/auth')}
              sx={{
                bgcolor: 'white',
                color: '#1976d2',
                px: 6,
                py: 2,
                fontSize: '1.2rem',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.9)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Start Your Journey
            </Button>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Home;