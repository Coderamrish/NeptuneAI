import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Avatar,
} from '@mui/material';
import {
  Analytics,
  CloudUpload,
  Psychology,
  Ocean,
  TrendingUp,
  Public,
  Speed,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Analytics sx={{ fontSize: 40, color: '#3498db' }} />,
      title: 'Smart Data Discovery',
      description: 'Find relevant ocean data using natural language queries powered by advanced AI algorithms.',
      color: '#3498db',
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40, color: '#2ecc71' }} />,
      title: 'Real-time Analytics',
      description: 'Interactive dashboards and visualizations that update in real-time as you explore your data.',
      color: '#2ecc71',
    },
    {
      icon: <Psychology sx={{ fontSize: 40, color: '#e74c3c' }} />,
      title: 'AI-Powered Insights',
      description: 'Get automated insights, pattern recognition, and predictive analytics for your ocean data.',
      color: '#e74c3c',
    },
    {
      icon: <CloudUpload sx={{ fontSize: 40, color: '#f39c12' }} />,
      title: 'Easy Data Upload',
      description: 'Support for NetCDF and CSV formats with automated processing and quality control.',
      color: '#f39c12',
    },
    {
      icon: <Public sx={{ fontSize: 40, color: '#9b59b6' }} />,
      title: 'Global Coverage',
      description: 'Data from all major ocean basins with comprehensive geographic coverage.',
      color: '#9b59b6',
    },
    {
      icon: <Speed sx={{ fontSize: 40, color: '#1abc9c' }} />,
      title: 'High Performance',
      description: 'Optimized for large datasets with fast processing and efficient visualization.',
      color: '#1abc9c',
    },
  ];

  const stats = [
    { label: 'Data Points', value: '2.8M+', color: '#3498db' },
    { label: 'Oceans Covered', value: '5', color: '#2ecc71' },
    { label: 'AI Models', value: '12+', color: '#e74c3c' },
    { label: 'Users', value: '1.2K+', color: '#f39c12' },
  ];

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%)',
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background Animation */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            animation: 'wave 20s linear infinite',
          }}
        />
        
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', md: '4rem' },
                    fontWeight: 700,
                    color: 'white',
                    mb: 2,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                  }}
                >
                  🌊 NeptuneAI
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    color: 'rgba(255,255,255,0.9)',
                    mb: 3,
                    fontWeight: 400,
                  }}
                >
                  Discover Ocean Data Like Never Before
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: 'rgba(255,255,255,0.8)',
                    mb: 4,
                    lineHeight: 1.6,
                  }}
                >
                  Leverage advanced AI, machine learning, and interactive visualizations 
                  to explore oceanographic data with unprecedented ease and insight.
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/analytics')}
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      background: 'linear-gradient(45deg, #3498db, #2980b9)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #2980b9, #1e3c72)',
                      },
                    }}
                  >
                    🚀 Explore Data
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/upload')}
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      borderColor: 'white',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    📤 Upload Files
                  </Button>
                </Box>
              </motion.div>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 400,
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: 4,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  <Avatar
                    sx={{
                      width: 200,
                      height: 200,
                      background: 'linear-gradient(45deg, #3498db, #2980b9)',
                      animation: 'float 3s ease-in-out infinite',
                    }}
                  >
                    <Ocean sx={{ fontSize: 100 }} />
                  </Avatar>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Card
                  sx={{
                    textAlign: 'center',
                    p: 3,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      color: stat.color,
                      mb: 1,
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'white' }}>
                    {stat.label}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="h2"
            sx={{
              textAlign: 'center',
              mb: 6,
              color: 'white',
              fontWeight: 700,
            }}
          >
            ✨ Platform Features
          </Typography>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card
                    className="card-hover"
                    sx={{
                      height: '100%',
                      p: 3,
                      background: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <CardContent>
                      <Box sx={{ textAlign: 'center', mb: 2 }}>
                        {feature.icon}
                      </Box>
                      <Typography
                        variant="h5"
                        sx={{
                          textAlign: 'center',
                          mb: 2,
                          fontWeight: 600,
                          color: feature.color,
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          textAlign: 'center',
                          color: 'text.secondary',
                          lineHeight: 1.6,
                        }}
                      >
                        {feature.description}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'center' }}>
                      <Chip
                        label="Learn More"
                        size="small"
                        sx={{
                          background: feature.color,
                          color: 'white',
                          '&:hover': {
                            background: feature.color,
                            opacity: 0.8,
                          },
                        }}
                      />
                    </CardActions>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(90deg, #1e3c72 0%, #2a5298 100%)',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h3"
              sx={{
                color: 'white',
                mb: 3,
                fontWeight: 700,
              }}
            >
              Ready to Dive In?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255,255,255,0.8)',
                mb: 4,
              }}
            >
              Start exploring ocean data with NeptuneAI today
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/analytics')}
              sx={{
                px: 6,
                py: 2,
                fontSize: '1.2rem',
                background: 'linear-gradient(45deg, #2ecc71, #27ae60)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #27ae60, #229954)',
                },
              }}
            >
              Get Started Now
            </Button>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;