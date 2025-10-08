import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Button,
  Container,
  Divider,
  Paper,
} from '@mui/material';
import {
  Water,
  Thermostat,
  Speed,
  LocationOn,
  Psychology,
  Analytics,
  DataObject,
  CloudUpload,
  Security,
  Support,
  School,
  Public,
  Timeline,
  BarChart,
  Map,
  CheckCircle,
  Star,
  Group,
  Science,
  Eco,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const About = () => {
  const features = [
    {
      icon: <Analytics />,
      title: 'Real-time Analytics',
      description: 'Monitor ocean data in real-time with advanced analytics and machine learning algorithms.',
      color: '#1976d2'
    },
    {
      icon: <Psychology />,
      title: 'AI-Powered Insights',
      description: 'Get intelligent insights and predictions using cutting-edge artificial intelligence.',
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
      icon: <Map />,
      title: 'Interactive Maps',
      description: 'Visualize ocean data on interactive maps with multiple layers and overlays.',
      color: '#00bcd4'
    },
    {
      icon: <Security />,
      title: 'Secure Platform',
      description: 'Enterprise-grade security with encrypted data transmission and storage.',
      color: '#f44336'
    }
  ];

  const team = [
    {
      name: 'Dr. Sarah Chen',
      role: 'Chief Oceanographer',
      bio: 'Leading expert in marine science with 15+ years of experience in ocean data analysis.',
      avatar: 'SC',
      color: '#1976d2'
    },
    {
      name: 'Prof. Michael Rodriguez',
      role: 'AI Research Director',
      bio: 'Pioneer in machine learning applications for environmental data analysis.',
      avatar: 'MR',
      color: '#4caf50'
    },
    {
      name: 'Dr. Emily Watson',
      role: 'Data Science Lead',
      bio: 'Specialist in big data analytics and visualization for oceanographic research.',
      avatar: 'EW',
      color: '#9c27b0'
    },
    {
      name: 'James Thompson',
      role: 'Platform Architect',
      bio: 'Full-stack developer focused on scalable cloud infrastructure and user experience.',
      avatar: 'JT',
      color: '#ff9800'
    }
  ];

  const stats = [
    { number: '1M+', label: 'Data Points', icon: <BarChart />, color: '#1976d2' },
    { number: '50K+', label: 'Users', icon: <Group />, color: '#4caf50' },
    { number: '100+', label: 'Research Institutions', icon: <School />, color: '#9c27b0' },
    { number: '24/7', label: 'Monitoring', icon: <Timeline />, color: '#ff9800' },
  ];

  const technologies = [
    'React & Material-UI',
    'Python & FastAPI',
    'PostgreSQL & SQLite',
    'Plotly.js & D3.js',
    'Docker & Kubernetes',
    'AWS & Google Cloud',
    'Machine Learning',
    'Geographic Information Systems',
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
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
                mb: 3,
                color: '#1976d2',
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              🌊 About NeptuneAI
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: '#333',
                mb: 4,
                fontSize: { xs: '1.2rem', md: '1.5rem' },
                maxWidth: '800px',
                mx: 'auto',
                lineHeight: 1.6
              }}
            >
              Revolutionizing Ocean Data Analysis Through Artificial Intelligence
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#666',
                mb: 4,
                fontSize: '1.1rem',
                maxWidth: '700px',
                mx: 'auto',
                lineHeight: 1.8
              }}
            >
              NeptuneAI is a cutting-edge platform that combines advanced oceanographic data with 
              artificial intelligence to provide unprecedented insights into our oceans. Our mission 
              is to make ocean data accessible, understandable, and actionable for researchers, 
              policymakers, and ocean enthusiasts worldwide.
            </Typography>
          </Box>
        </motion.div>

        {/* Mission & Vision */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #1976d215 0%, #1976d205 100%)' }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Water sx={{ fontSize: '2.5rem', color: '#1976d2' }} />
                    <Typography variant="h4" sx={{ fontWeight: 600, color: '#1976d2' }}>
                      Our Mission
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ color: '#333', lineHeight: 1.8, mb: 3 }}>
                    To democratize access to ocean data and provide powerful tools for understanding 
                    our planet's most critical ecosystem. We believe that by making ocean data 
                    accessible and intelligible, we can drive better conservation efforts, 
                    scientific research, and environmental policy decisions.
                  </Typography>
                  <List>
                    {[
                      'Make ocean data accessible to everyone',
                      'Advance scientific research through AI',
                      'Protect marine ecosystems',
                      'Educate the next generation of ocean scientists'
                    ].map((item, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <CheckCircle sx={{ color: '#4caf50' }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={item} 
                          sx={{ '& .MuiListItemText-primary': { color: '#333' } }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #4caf5015 0%, #4caf5005 100%)' }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Science sx={{ fontSize: '2.5rem', color: '#4caf50' }} />
                    <Typography variant="h4" sx={{ fontWeight: 600, color: '#4caf50' }}>
                      Our Vision
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ color: '#333', lineHeight: 1.8, mb: 3 }}>
                    To become the world's leading platform for ocean data analysis, empowering 
                    scientists, policymakers, and citizens to make informed decisions about 
                    our oceans. We envision a future where ocean data drives conservation 
                    action and sustainable marine resource management.
                  </Typography>
                  <List>
                    {[
                      'Global ocean data network',
                      'AI-powered conservation strategies',
                      'Real-time environmental monitoring',
                      'Sustainable ocean management'
                    ].map((item, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Star sx={{ color: '#ff9800' }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={item} 
                          sx={{ '& .MuiListItemText-primary': { color: '#333' } }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Typography
            variant="h3"
            sx={{
              textAlign: 'center',
              mb: 6,
              fontWeight: 600,
              color: '#1976d2',
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            Platform Features
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
                      background: 'rgba(255,255,255,0.9)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
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
                          color: '#333'
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#666',
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

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Box sx={{ mt: 8, mb: 8 }}>
            <Typography
              variant="h3"
              sx={{
                textAlign: 'center',
                mb: 6,
                fontWeight: 600,
                color: '#1976d2',
                fontSize: { xs: '2rem', md: '2.5rem' }
              }}
            >
              Platform Impact
            </Typography>
            <Grid container spacing={3}>
              {stats.map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                  >
                    <Card sx={{ textAlign: 'center', p: 3, background: 'rgba(255,255,255,0.9)' }}>
                      <CardContent>
                        <Box sx={{ color: stat.color, fontSize: '2.5rem', mb: 2 }}>
                          {stat.icon}
                        </Box>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: stat.color, mb: 1 }}>
                          {stat.number}
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#333' }}>
                          {stat.label}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>
        </motion.div>

        {/* Team */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <Typography
            variant="h3"
            sx={{
              textAlign: 'center',
              mb: 6,
              fontWeight: 600,
              color: '#1976d2',
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            Our Team
          </Typography>
          <Grid container spacing={4}>
            {team.map((member, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <Card sx={{ textAlign: 'center', p: 3, background: 'rgba(255,255,255,0.9)' }}>
                    <CardContent>
                      <Avatar
                        sx={{
                          width: 80,
                          height: 80,
                          fontSize: '2rem',
                          bgcolor: member.color,
                          mb: 2,
                          mx: 'auto',
                        }}
                      >
                        {member.avatar}
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', mb: 1 }}>
                        {member.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: member.color, mb: 2, fontWeight: 500 }}>
                        {member.role}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.6 }}>
                        {member.bio}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Technology Stack */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <Box sx={{ mt: 8, mb: 8 }}>
            <Typography
              variant="h3"
              sx={{
                textAlign: 'center',
                mb: 6,
                fontWeight: 600,
                color: '#1976d2',
                fontSize: { xs: '2rem', md: '2.5rem' }
              }}
            >
              Technology Stack
            </Typography>
            <Paper sx={{ p: 4, background: 'rgba(255,255,255,0.9)' }}>
              <Grid container spacing={2}>
                {technologies.map((tech, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.05 * index }}
                    >
                      <Chip
                        label={tech}
                        sx={{
                          width: '100%',
                          height: 40,
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          background: 'linear-gradient(135deg, #1976d215 0%, #1976d205 100%)',
                          color: '#1976d2',
                          border: '1px solid #1976d2',
                        }}
                      />
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Box>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
        >
          <Box
            sx={{
              textAlign: 'center',
              p: 6,
              background: 'linear-gradient(135deg, #1976d2 0%, #00bcd4 100%)',
              borderRadius: 3,
              color: 'white',
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 3,
                fontSize: { xs: '2rem', md: '2.5rem' }
              }}
            >
              Join the Ocean Data Revolution
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: 4,
                opacity: 0.9,
                fontSize: { xs: '1.1rem', md: '1.3rem' }
              }}
            >
              Be part of the global community working to understand and protect our oceans
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
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
                Get Started Today
              </Button>
              <Button
                variant="outlined"
                size="large"
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
      </Container>
    </Box>
  );
};

export default About;