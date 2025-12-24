import React, { useEffect, useRef, useState } from 'react';
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
  Paper,
  IconButton,
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
  School,
  Timeline,
  BarChart,
  Map,
  CheckCircle,
  Star,
  Group,
  Science,
  Eco,
  Waves,
  NavigationOutlined,
  Explore,
  TrendingUp,
  Anchor,
  GitHub,
  LinkedIn,
  Email,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const About = () => {
  const canvasRef = useRef(null);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 100 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 1,
    }));

    const animate = () => {
      ctx.fillStyle = 'rgba(10, 25, 47, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(6, 182, 212, 0.6)';
        ctx.fill();

        particles.forEach((p2, j) => {
          if (i !== j) {
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 100) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(6, 182, 212, ${0.2 * (1 - dist / 100)})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  const features = [
    {
      icon: <Analytics />,
      title: 'Real-time Analytics',
      description: 'Monitor ocean data in real-time with advanced analytics and machine learning algorithms.',
      color: '#06b6d4',
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)'
    },
    {
      icon: <Psychology />,
      title: 'AI-Powered Insights',
      description: 'Get intelligent insights and predictions using cutting-edge artificial intelligence.',
      color: '#ec4899',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)'
    },
    {
      icon: <DataObject />,
      title: 'Data Explorer',
      description: 'Explore vast ocean datasets with powerful filtering and search capabilities.',
      color: '#14b8a6',
      gradient: 'linear-gradient(135deg, #14b8a6 0%, #10b981 100%)'
    },
    {
      icon: <CloudUpload />,
      title: 'Data Upload',
      description: 'Upload and manage your own ocean data with our secure platform.',
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)'
    },
    {
      icon: <Map />,
      title: 'Interactive Maps',
      description: 'Visualize ocean data on interactive maps with multiple layers and overlays.',
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)'
    },
    {
      icon: <Security />,
      title: 'Secure Platform',
      description: 'Enterprise-grade security with encrypted data transmission and storage.',
      color: '#ef4444',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
    }
  ];

  const team = [
    {
      name: 'Amrish Kumar Tiwary',
      role: 'Founder & Lead AI Engineer',
      bio: 'Designed and built the Neptune AI platform, leading the project\'s architecture, development, and technical direction.',
      avatar: 'AT',
      color: '#06b6d4',
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)'
    },
    {
      name: 'Vitesh Kumar',
      role: 'Research Support',
      bio: 'Assisted with research tasks, dataset exploration, and initial data validation throughout the project.',
      avatar: 'VK',
      color: '#14b8a6',
      gradient: 'linear-gradient(135deg, #14b8a6 0%, #10b981 100%)'
    },
    {
      name: 'Amrendra Kumar',
      role: 'Documentation',
      bio: 'Contributed to documentation, workflow organization, and coordination project development.',
      avatar: 'AK',
      color: '#ec4899',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)'
    },
    {
      name: 'Rajarshi Basu',
      role: 'Review & Ideation Support',
      bio: 'Provided project feedback, usability suggestions, and helped refine early concepts and ideas.',
      avatar: 'RB',
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)'
    }
  ];

  const stats = [
    { number: '1M+', label: 'Data Points', icon: <BarChart />, color: '#06b6d4' },
    { number: '50K+', label: 'Users', icon: <Group />, color: '#14b8a6' },
    { number: '100+', label: 'Research Institutions', icon: <School />, color: '#ec4899' },
    { number: '24/7', label: 'Monitoring', icon: <Timeline />, color: '#f59e0b' },
  ];

  const technologies = [
    'React & Material-UI',
    'Python & FastAPI',
    'PostgreSQL & SQLite',
    'Plotly.js & D3.js',
    'Docker & Kubernetes',
    'AWS & Google Cloud',
    'Machine Learning',
    'Data Visualization',
    'RESTful APIs',
    'LLM Integration',
    'Langchain',
    'Transformers',
    'Real-time Processing',
    'JWT Authentication',
    'State Management',
    'MCP Integration',
    'Geospatial Analysis',
    'GIS Systems',
  ];

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Animated Background */}
      <canvas 
        ref={canvasRef} 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        }}
      />

      {/* Content */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Box sx={{ textAlign: 'center', mb: 10 }}>
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Waves sx={{ fontSize: 100, color: '#06b6d4', mb: 3 }} />
              </motion.div>
              
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 800,
                  mb: 3,
                  background: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '2.5rem', md: '4rem' },
                  textShadow: '0 0 60px rgba(6, 182, 212, 0.5)',
                }}
              >
                About NeptuneAI
              </Typography>
              
              <Typography
                variant="h5"
                sx={{
                  color: '#cbd5e1',
                  mb: 4,
                  fontSize: { xs: '1.2rem', md: '1.8rem' },
                  maxWidth: '900px',
                  mx: 'auto',
                  lineHeight: 1.6,
                  fontWeight: 300,
                }}
              >
                Revolutionizing Ocean Data Analysis Through Artificial Intelligence
              </Typography>
              
              <Typography
                variant="body1"
                sx={{
                  color: '#94a3b8',
                  mb: 5,
                  fontSize: '1.1rem',
                  maxWidth: '800px',
                  mx: 'auto',
                  lineHeight: 1.8,
                }}
              >
                NeptuneAI is a cutting-edge platform that combines advanced oceanographic data with 
                artificial intelligence to provide unprecedented insights into our oceans. Our mission 
                is to make ocean data accessible, understandable, and actionable for researchers, 
                policymakers, and ocean enthusiasts worldwide.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="contained"
                    size="large"
                    sx={{
                      background: 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      borderRadius: 3,
                      boxShadow: '0 8px 24px rgba(6, 182, 212, 0.4)',
                      '&:hover': {
                        boxShadow: '0 12px 32px rgba(6, 182, 212, 0.6)',
                      },
                    }}
                  >
                    Explore Platform
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: '#06b6d4',
                      color: '#06b6d4',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      borderRadius: 3,
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2,
                        borderColor: '#0ea5e9',
                        background: 'rgba(6, 182, 212, 0.1)',
                      },
                    }}
                  >
                    View Documentation
                  </Button>
                </motion.div>
              </Box>
            </Box>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Grid container spacing={3} sx={{ mb: 10 }}>
              {stats.map((stat, index) => (
                <Grid item xs={6} md={3} key={index}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <Card sx={{ 
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 4,
                      textAlign: 'center',
                      p: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        border: `1px solid ${stat.color}`,
                        boxShadow: `0 8px 32px ${stat.color}40`,
                      }
                    }}>
                      <Box sx={{ 
                        color: stat.color, 
                        fontSize: '3rem', 
                        mb: 2,
                        filter: 'drop-shadow(0 0 10px currentColor)'
                      }}>
                        {stat.icon}
                      </Box>
                      <Typography variant="h3" sx={{ 
                        fontWeight: 800, 
                        color: stat.color, 
                        mb: 1,
                        textShadow: `0 0 20px ${stat.color}80`
                      }}>
                        {stat.number}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#cbd5e1', fontWeight: 500 }}>
                        {stat.label}
                      </Typography>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Typography
              variant="h3"
              sx={{
                textAlign: 'center',
                mb: 6,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '2rem', md: '3rem' }
              }}
            >
              Platform Features
            </Typography>
            
            <Grid container spacing={4}>
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                    whileHover={{ y: -10 }}
                    onHoverStart={() => setActiveFeature(index)}
                  >
                    <Card
                      sx={{
                        height: '100%',
                        background: activeFeature === index 
                          ? `${feature.gradient}, rgba(255, 255, 255, 0.05)`
                          : 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 4,
                        transition: 'all 0.4s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '4px',
                          background: feature.gradient,
                        },
                        '&:hover': {
                          border: `1px solid ${feature.color}`,
                          boxShadow: `0 12px 40px ${feature.color}40`,
                        }
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center', p: 4 }}>
                        <motion.div
                          animate={activeFeature === index ? { 
                            rotate: [0, -10, 10, -10, 0],
                            scale: [1, 1.1, 1]
                          } : {}}
                          transition={{ duration: 0.5 }}
                        >
                          <Box
                            sx={{
                              color: feature.color,
                              fontSize: '4rem',
                              mb: 3,
                              display: 'flex',
                              justifyContent: 'center',
                              filter: `drop-shadow(0 0 20px ${feature.color}80)`
                            }}
                          >
                            {feature.icon}
                          </Box>
                        </motion.div>
                        
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 700,
                            mb: 2,
                            color: '#e2e8f0'
                          }}
                        >
                          {feature.title}
                        </Typography>
                        
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#94a3b8',
                            lineHeight: 1.7,
                            fontSize: '1rem'
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

          {/* Mission & Vision */}
          <Grid container spacing={4} sx={{ my: 10 }}>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card sx={{ 
                  height: '100%', 
                  background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(6, 182, 212, 0.05) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  borderRadius: 4,
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <Box sx={{
                    position: 'absolute',
                    top: -100,
                    right: -100,
                    width: 300,
                    height: 300,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, transparent 70%)',
                  }} />
                  
                  <CardContent sx={{ p: 5, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                      <Avatar sx={{ 
                        bgcolor: '#06b6d4', 
                        width: 64, 
                        height: 64,
                        boxShadow: '0 8px 24px rgba(6, 182, 212, 0.5)'
                      }}>
                        <Water sx={{ fontSize: 36 }} />
                      </Avatar>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#06b6d4' }}>
                        Our Mission
                      </Typography>
                    </Box>
                    
                    <Typography variant="body1" sx={{ color: '#cbd5e1', lineHeight: 1.8, mb: 3, fontSize: '1.05rem' }}>
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
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + index * 0.1 }}
                        >
                          <ListItem sx={{ px: 0, py: 1 }}>
                            <ListItemIcon>
                              <CheckCircle sx={{ color: '#14b8a6', fontSize: 28 }} />
                            </ListItemIcon>
                            <ListItemText 
                              primary={item} 
                              sx={{ 
                                '& .MuiListItemText-primary': { 
                                  color: '#e2e8f0',
                                  fontSize: '1rem',
                                  fontWeight: 500
                                } 
                              }}
                            />
                          </ListItem>
                        </motion.div>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card sx={{ 
                  height: '100%', 
                  background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(20, 184, 166, 0.05) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(20, 184, 166, 0.3)',
                  borderRadius: 4,
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <Box sx={{
                    position: 'absolute',
                    top: -100,
                    left: -100,
                    width: 300,
                    height: 300,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(20, 184, 166, 0.2) 0%, transparent 70%)',
                  }} />
                  
                  <CardContent sx={{ p: 5, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                      <Avatar sx={{ 
                        bgcolor: '#14b8a6', 
                        width: 64, 
                        height: 64,
                        boxShadow: '0 8px 24px rgba(20, 184, 166, 0.5)'
                      }}>
                        <Science sx={{ fontSize: 36 }} />
                      </Avatar>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#14b8a6' }}>
                        Our Vision
                      </Typography>
                    </Box>
                    
                    <Typography variant="body1" sx={{ color: '#cbd5e1', lineHeight: 1.8, mb: 3, fontSize: '1.05rem' }}>
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
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.9 + index * 0.1 }}
                        >
                          <ListItem sx={{ px: 0, py: 1 }}>
                            <ListItemIcon>
                              <Star sx={{ color: '#f59e0b', fontSize: 28 }} />
                            </ListItemIcon>
                            <ListItemText 
                              primary={item} 
                              sx={{ 
                                '& .MuiListItemText-primary': { 
                                  color: '#e2e8f0',
                                  fontSize: '1rem',
                                  fontWeight: 500
                                } 
                              }}
                            />
                          </ListItem>
                        </motion.div>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>

          {/* Team Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Typography
              variant="h3"
              sx={{
                textAlign: 'center',
                mb: 6,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '2rem', md: '3rem' }
              }}
            >
              Meet Our Team
            </Typography>
            
            <Grid container spacing={4}>
              {team.map((member, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                    whileHover={{ y: -10, scale: 1.02 }}
                  >
                    <Card sx={{ 
                      textAlign: 'center', 
                      p: 3,
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 4,
                      height: '100%',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        border: `1px solid ${member.color}`,
                        boxShadow: `0 12px 40px ${member.color}40`,
                      }
                    }}>
                      <CardContent>
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Avatar
                            sx={{
                              width: 100,
                              height: 100,
                              fontSize: '2.5rem',
                              fontWeight: 700,
                              background: member.gradient,
                              mb: 2,
                              mx: 'auto',
                              boxShadow: `0 8px 24px ${member.color}60`,
                            }}
                          >
                            {member.avatar}
                          </Avatar>
                        </motion.div>
                        
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#e2e8f0', mb: 1 }}>
                          {member.name}
                        </Typography>
                        
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: member.color, 
                            mb: 2, 
                            fontWeight: 600,
                            fontSize: '0.95rem'
                          }}
                        >
                          {member.role}
                        </Typography>
                        
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#94a3b8', 
                            lineHeight: 1.7,
                            fontSize: '0.9rem'
                          }}
                        >
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
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            <Box sx={{ mt: 10, mb: 8 }}>
              <Typography
                variant="h3"
                sx={{
                  textAlign: 'center',
                  mb: 6,
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '2rem', md: '3rem' }
                }}
              >
                Technology Stack
              </Typography>
              
              <Paper sx={{ 
                p: 5, 
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 4,
              }}>
                <Grid container spacing={2}>
                  {technologies.map((tech, index) => (
                    <Grid item xs={6} sm={4} md={3} key={index}>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 1.1 + index * 0.03 }}
                        whileHover={{ scale: 1.05, y: -3 }}
                      >
                        <Chip
                          label={tech}
                          sx={{
                            width: '100%',
                            height: 48,
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)',
                            color: '#a78bfa',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(139, 92, 246, 0.15) 100%)',
                              border: '1px solid rgba(139, 92, 246, 0.5)',
                              boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)',
                            }
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
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <Box
              sx={{
                textAlign: 'center',
                p: 8,
                background: 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 50%, #22d3ee 100%)',
                borderRadius: 4,
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(6, 182, 212, 0.4)',
              }}
            >
              <Box sx={{
                position: 'absolute',
                top: -150,
                right: -150,
                width: 400,
                height: 400,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%)',
              }} />
              
              <Box sx={{
                position: 'absolute',
                bottom: -100,
                left: -100,
                width: 300,
                height: 300,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%)',
              }} />
              
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Explore sx={{ fontSize: 80, mb: 3, filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.5))' }} />
                </motion.div>
                
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    mb: 3,
                    fontSize: { xs: '2rem', md: '3rem' },
                    textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  Join the Ocean Data Revolution
                </Typography>
                
                <Typography
                  variant="h6"
                  sx={{
                    mb: 5,
                    opacity: 0.95,
                    fontSize: { xs: '1.1rem', md: '1.4rem' },
                    maxWidth: '800px',
                    mx: 'auto',
                    fontWeight: 400,
                  }}
                >
                  Be part of the global community working to understand and protect our oceans through advanced data analytics and artificial intelligence
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<NavigationOutlined />}
                      sx={{
                        bgcolor: 'white',
                        color: '#06b6d4',
                        px: 5,
                        py: 2,
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        borderRadius: 3,
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.95)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.3)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Get Started Today
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<School />}
                      sx={{
                        borderColor: 'white',
                        color: 'white',
                        px: 5,
                        py: 2,
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        borderRadius: 3,
                        borderWidth: 2,
                        '&:hover': {
                          borderWidth: 2,
                          borderColor: 'white',
                          bgcolor: 'rgba(255,255,255,0.15)',
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Learn More
                    </Button>
                  </motion.div>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 5 }}>
                  {[
                    { icon: <GitHub />, label: 'GitHub' },
                    { icon: <LinkedIn />, label: 'LinkedIn' },
                    { icon: <Email />, label: 'Email' },
                  ].map((social, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <IconButton
                        sx={{
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          width: 50,
                          height: 50,
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.3)',
                          }
                        }}
                      >
                        {social.icon}
                      </IconButton>
                    </motion.div>
                  ))}
                </Box>
              </Box>
            </Box>
          </motion.div>

          {/* Footer Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.4 }}
          >
            <Box sx={{ 
              textAlign: 'center', 
              mt: 8, 
              pb: 4,
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              pt: 4
            }}>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                © 2024 NeptuneAI. All rights reserved.
              </Typography>
              <Typography variant="caption" sx={{ color: '#475569' }}>
                Building the future of ocean data analytics, one wave at a time 🌊
              </Typography>
            </Box>
          </motion.div>
        </Container>
      </Box>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </Box>
  );
};

export default About