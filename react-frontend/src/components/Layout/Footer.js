import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Link,
  IconButton,
  Divider,
  TextField,
  Button,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  LinkedIn,
  GitHub,
  Email,
  Phone,
  LocationOn,
  ExpandMore,
  Send,
  TrendingUp,
  Water,
  Thermostat,
  Speed,
  Psychology,
  DataObject,
  CloudUpload,
  Dashboard,
  Analytics,
  Info,
  Person,
  Security,
  Support,
  Description,
  Code,
  School,
  Public,
  Nature,
  BarChart,
  Star,
  Comment,
  Work,
  Handshake,
  BugReport,
  YouTube,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const [expandedSections, setExpandedSections] = useState({
    company: false,
    platform: false,
    resources: false,
    support: false,
  });
  const [email, setEmail] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const navigate = useNavigate();

  const handleSectionToggle = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSnackbar({ open: true, message: 'Thank you for subscribing to our newsletter!' });
      setEmail('');
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const oceanParameters = [
    { name: 'Temperature', icon: <Thermostat />, unit: '°C' },
    { name: 'Salinity', icon: <Water />, unit: 'PSU' },
    { name: 'Pressure', icon: <Speed />, unit: 'dbar' },
    { name: 'Currents', icon: <TrendingUp />, unit: 'm/s' },
    { name: 'Depth', icon: <TrendingUp />, unit: 'm' },
    { name: 'pH Levels', icon: <Nature />, unit: 'pH' }
  ];

  const quickLinks = [
    { name: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { name: 'Analytics', icon: <Analytics />, path: '/analytics' },
    { name: 'Data Explorer', icon: <DataObject />, path: '/data-explorer' },
    { name: 'AI Insights', icon: <Psychology />, path: '/ai-insights' },
    { name: 'Upload Data', icon: <CloudUpload />, path: '/upload' },
    { name: 'Profile', icon: <Person />, path: '/profile' },
  ];

  const platformFeatures = [
    { name: 'Real-time Analytics', icon: <TrendingUp />, description: 'Live ocean data monitoring' },
    { name: 'AI-Powered Insights', icon: <Psychology />, description: 'Machine learning analysis' },
    { name: 'Interactive Maps', icon: <Public />, description: 'Global ocean visualization' },
    { name: 'Data Export', icon: <DataObject />, description: 'Multiple format support' },
    { name: 'Custom Dashboards', icon: <Dashboard />, description: 'Personalized views' },
    { name: 'Collaborative Tools', icon: <Work />, description: 'Team sharing features' }
  ];

  const resources = [
    { name: 'Documentation', icon: <Description />, path: '/docs' },
    { name: 'API Reference', icon: <Code />, path: '/api-docs' },
    { name: 'Tutorials', icon: <School />, path: '/tutorials' },
    { name: 'Blog', icon: <Comment />, path: '/blog' },
    { name: 'Case Studies', icon: <BarChart />, path: '/case-studies' },
    { name: 'Research Papers', icon: <Description />, path: '/research' },
  ];

  const supportLinks = [
    { name: 'Help Center', icon: <Support />, path: '/help' },
    { name: 'Contact Us', icon: <Email />, path: '/contact' },
    { name: 'Bug Reports', icon: <BugReport />, path: '/bugs' },
    { name: 'Feature Requests', icon: <Star />, path: '/features' },
    { name: 'Community', icon: <Handshake />, path: '/community' },
    { name: 'Status Page', icon: <TrendingUp />, path: '/status' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        color: 'white',
        mt: 'auto',
        py: 4,
      }}
    >
      <Box sx={{ maxWidth: '1200px', mx: 'auto', px: 2 }}>
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Box sx={{ mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  🌊 NeptuneAI
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
                  Advanced ocean data platform powered by AI. Monitor, analyze, and understand our oceans like never before.
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <IconButton sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                  <Facebook />
                </IconButton>
                <IconButton sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                  <Twitter />
                </IconButton>
                <IconButton sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                  <LinkedIn />
                </IconButton>
                <IconButton sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                  <GitHub />
                </IconButton>
                <IconButton sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                  <YouTube />
                </IconButton>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Email sx={{ fontSize: 16 }} />
                <Typography variant="body2">contact@neptuneai.com</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Phone sx={{ fontSize: 16 }} />
                <Typography variant="body2">+1 (555) 123-4567</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn sx={{ fontSize: 16 }} />
                <Typography variant="body2">San Francisco, CA</Typography>
              </Box>
            </motion.div>
          </Grid>

          {/* Platform Features */}
          <Grid item xs={12} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Platform Features
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {platformFeatures.map((feature) => (
                  <Box key={feature.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ color: '#4ecdc4' }}>{feature.icon}</Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {feature.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        {feature.description}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </motion.div>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Quick Links
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {quickLinks.map((link) => (
                  <Link
                    key={link.name}
                    component="button"
                    onClick={() => handleNavigation(link.path)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      color: 'rgba(255,255,255,0.8)',
                      textDecoration: 'none',
                      '&:hover': {
                        color: 'white',
                        textDecoration: 'none',
                      },
                      textAlign: 'left',
                      p: 0,
                    }}
                  >
                    <Box sx={{ color: '#4ecdc4' }}>{link.icon}</Box>
                    {link.name}
                  </Link>
                ))}
              </Box>
            </motion.div>
          </Grid>

          {/* Resources & Support */}
          <Grid item xs={12} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Resources & Support
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                {resources.slice(0, 3).map((resource) => (
                  <Link
                    key={resource.name}
                    component="button"
                    onClick={() => handleNavigation(resource.path)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      color: 'rgba(255,255,255,0.8)',
                      textDecoration: 'none',
                      '&:hover': {
                        color: 'white',
                        textDecoration: 'none',
                      },
                      textAlign: 'left',
                      p: 0,
                    }}
                  >
                    <Box sx={{ color: '#4ecdc4' }}>{resource.icon}</Box>
                    {resource.name}
                  </Link>
                ))}
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {supportLinks.slice(0, 3).map((support) => (
                  <Link
                    key={support.name}
                    component="button"
                    onClick={() => handleNavigation(support.path)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      color: 'rgba(255,255,255,0.8)',
                      textDecoration: 'none',
                      '&:hover': {
                        color: 'white',
                        textDecoration: 'none',
                      },
                      textAlign: 'left',
                      p: 0,
                    }}
                  >
                    <Box sx={{ color: '#4ecdc4' }}>{support.icon}</Box>
                    {support.name}
                  </Link>
                ))}
              </Box>
            </motion.div>
          </Grid>
        </Grid>

        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', my: 3 }} />

        {/* Newsletter Subscription */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Stay Updated with Ocean Science
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
              Subscribe to our newsletter for the latest ocean data insights and platform updates.
            </Typography>
            <Box
              component="form"
              onSubmit={handleNewsletterSubmit}
              sx={{ display: 'flex', gap: 1, maxWidth: 400, mx: 'auto' }}
            >
              <TextField
                size="small"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                  flexGrow: 1,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                    '&.Mui-focused fieldset': { borderColor: 'white' },
                  },
                  '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.7)' },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                startIcon={<Send />}
                sx={{
                  bgcolor: '#4ecdc4',
                  '&:hover': { bgcolor: '#45b7d1' },
                }}
              >
                Subscribe
              </Button>
            </Box>
          </Box>
        </motion.div>

        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', my: 3 }} />

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              © 2024 NeptuneAI. All rights reserved. | Protecting our oceans through data science.
            </Typography>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Link href="/privacy" sx={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', '&:hover': { color: 'white' } }}>
                Privacy Policy
              </Link>
              <Link href="/terms" sx={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', '&:hover': { color: 'white' } }}>
                Terms of Service
              </Link>
              <Link href="/cookies" sx={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', '&:hover': { color: 'white' } }}>
                Cookie Policy
              </Link>
            </Box>
          </Box>
        </motion.div>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
};

export default Footer;