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
  List,
  ListItem,
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
  Timeline,
  BarChart,
  Star,
  Comment,
  Work,
  Handshake,
  BugReport,
  YouTube,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    platform: false,
    resources: false,
    company: false,
    support: false
  });

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setNewsletterSuccess(true);
      setEmail('');
    }
  };

  const handleSectionToggle = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };


  const oceanParameters = [
    { name: 'Temperature', icon: <Thermostat />, unit: '°C' },
    { name: 'Salinity', icon: <Water />, unit: 'PSU' },
    { name: 'Pressure', icon: <Speed />, unit: 'dbar' },
    { name: 'Currents', icon: <Timeline />, unit: 'm/s' },
    { name: 'Depth', icon: <TrendingUp />, unit: 'm' },
    { name: 'pH Levels', icon: <Nature />, unit: 'pH' }
  ];

  const quickLinks = [
    { name: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { name: 'Analytics', icon: <Analytics />, path: '/analytics' },
    { name: 'Data Explorer', icon: <DataObject />, path: '/data-explorer' },
    { name: 'AI Insights', icon: <Psychology />, path: '/ai-insights' },
    { name: 'Upload Data', icon: <CloudUpload />, path: '/upload' },
    { name: 'Profile', icon: <Person />, path: '/profile' }
  ];

  const resources = [
    { name: 'Documentation', icon: <Description />, path: '/docs' },
    { name: 'API Reference', icon: <Code />, path: '/api' },
    { name: 'Tutorials', icon: <School />, path: '/tutorials' },
    { name: 'Case Studies', icon: <BarChart />, path: '/cases' },
    { name: 'Research Papers', icon: <Description />, path: '/research' },
    { name: 'Blog', icon: <Comment />, path: '/blog' }
  ];

  const companyInfo = [
    { name: 'About Us', icon: <Info />, path: '/about' },
    { name: 'Our Team', icon: <Person />, path: '/team' },
    { name: 'Careers', icon: <Work />, path: '/careers' },
    { name: 'Press', icon: <Public />, path: '/press' },
    { name: 'Partners', icon: <Handshake />, path: '/partners' },
    { name: 'Investors', icon: <TrendingUp />, path: '/investors' }
  ];

  const supportOptions = [
    { name: 'Help Center', icon: <Support />, path: '/help' },
    { name: 'Contact Support', icon: <Email />, path: '/contact' },
    { name: 'Status Page', icon: <Security />, path: '/status' },
    { name: 'Community', icon: <Public />, path: '/community' },
    { name: 'Bug Reports', icon: <BugReport />, path: '/bugs' },
    { name: 'Feature Requests', icon: <Star />, path: '/features' }
  ];

  return (
    <Box
      component="footer"
      sx={{
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        color: 'white',
        mt: 'auto',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'
        }
      }}
    >
      {/* Main Footer Content */}
      <Box sx={{ maxWidth: '1400px', mx: 'auto', px: 3, py: 6 }}>
        <Grid container spacing={4}>
          {/* Company Info & Newsletter */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center' }}>
                  🌊 NeptuneAI
                  <Chip 
                    label="v2.0" 
                    size="small" 
                    sx={{ 
                      ml: 2, 
                      bgcolor: 'rgba(78, 205, 196, 0.2)', 
                      color: '#4ecdc4',
                      fontWeight: 600
                    }} 
                  />
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
                  Advanced ocean data analytics platform powered by AI. Explore, analyze, and visualize 
                  ocean parameters with cutting-edge technology and real-time insights.
                </Typography>
                
                {/* Newsletter Signup */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Stay Updated
                  </Typography>
                  <form onSubmit={handleNewsletterSubmit}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        size="small"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        sx={{
                          flexGrow: 1,
                          '& .MuiOutlinedInput-root': {
                            color: 'white',
                            '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                            '&.Mui-focused fieldset': { borderColor: 'white' }
                          }
                        }}
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        sx={{
                          bgcolor: 'rgba(78, 205, 196, 0.8)',
                          '&:hover': { bgcolor: 'rgba(78, 205, 196, 1)' },
                          minWidth: 'auto',
                          px: 2
                        }}
                      >
                        <Send />
                      </Button>
                    </Box>
                  </form>
                </Box>

                {/* Social Links */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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
              </Box>
            </motion.div>
          </Grid>

          {/* Platform Features */}
          <Grid item xs={12} md={2}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Accordion 
                expanded={expandedSections.platform} 
                onChange={() => handleSectionToggle('platform')}
                sx={{ 
                  background: 'transparent', 
                  boxShadow: 'none',
                  '&:before': { display: 'none' },
                  '&.Mui-expanded': { margin: 0 }
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore sx={{ color: 'white' }} />}
                  sx={{ minHeight: 48, px: 0 }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
                    Platform
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, px: 0 }}>
                  <List dense>
                    {quickLinks.map((item, index) => (
                      <ListItem key={item.name} disablePadding sx={{ mb: 0.5 }}>
                        <Link 
                          href={item.path} 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1,
                            color: 'rgba(255,255,255,0.8)',
                            textDecoration: 'none',
                            '&:hover': { color: 'white' },
                            transition: 'color 0.2s'
                          }}
                        >
                          <Box sx={{ color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center' }}>
                            {item.icon}
                          </Box>
                          {item.name}
                        </Link>
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            </motion.div>
          </Grid>

          {/* Resources */}
          <Grid item xs={12} md={2}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Accordion 
                expanded={expandedSections.resources} 
                onChange={() => handleSectionToggle('resources')}
                sx={{ 
                  background: 'transparent', 
                  boxShadow: 'none',
                  '&:before': { display: 'none' },
                  '&.Mui-expanded': { margin: 0 }
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore sx={{ color: 'white' }} />}
                  sx={{ minHeight: 48, px: 0 }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
                    Resources
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, px: 0 }}>
                  <List dense>
                    {resources.map((item, index) => (
                      <ListItem key={item.name} disablePadding sx={{ mb: 0.5 }}>
                        <Link 
                          href={item.path} 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1,
                            color: 'rgba(255,255,255,0.8)',
                            textDecoration: 'none',
                            '&:hover': { color: 'white' },
                            transition: 'color 0.2s'
                          }}
                        >
                          <Box sx={{ color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center' }}>
                            {item.icon}
                          </Box>
                          {item.name}
                        </Link>
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            </motion.div>
          </Grid>

          {/* Company */}
          <Grid item xs={12} md={2}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Accordion 
                expanded={expandedSections.company} 
                onChange={() => handleSectionToggle('company')}
                sx={{ 
                  background: 'transparent', 
                  boxShadow: 'none',
                  '&:before': { display: 'none' },
                  '&.Mui-expanded': { margin: 0 }
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore sx={{ color: 'white' }} />}
                  sx={{ minHeight: 48, px: 0 }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
                    Company
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, px: 0 }}>
                  <List dense>
                    {companyInfo.map((item, index) => (
                      <ListItem key={item.name} disablePadding sx={{ mb: 0.5 }}>
                        <Link 
                          href={item.path} 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1,
                            color: 'rgba(255,255,255,0.8)',
                            textDecoration: 'none',
                            '&:hover': { color: 'white' },
                            transition: 'color 0.2s'
                          }}
                        >
                          <Box sx={{ color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center' }}>
                            {item.icon}
                          </Box>
                          {item.name}
                        </Link>
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            </motion.div>
          </Grid>

          {/* Support & Contact */}
          <Grid item xs={12} md={2}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Accordion 
                expanded={expandedSections.support} 
                onChange={() => handleSectionToggle('support')}
                sx={{ 
                  background: 'transparent', 
                  boxShadow: 'none',
                  '&:before': { display: 'none' },
                  '&.Mui-expanded': { margin: 0 }
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore sx={{ color: 'white' }} />}
                  sx={{ minHeight: 48, px: 0 }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
                    Support
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, px: 0 }}>
                  <List dense>
                    {supportOptions.map((item, index) => (
                      <ListItem key={item.name} disablePadding sx={{ mb: 0.5 }}>
                        <Link 
                          href={item.path} 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1,
                            color: 'rgba(255,255,255,0.8)',
                            textDecoration: 'none',
                            '&:hover': { color: 'white' },
                            transition: 'color 0.2s'
                          }}
                        >
                          <Box sx={{ color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center' }}>
                            {item.icon}
                          </Box>
                          {item.name}
                        </Link>
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>

              {/* Contact Info */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Contact Info
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Email sx={{ fontSize: 16, color: 'rgba(255,255,255,0.7)' }} />
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      contact@neptuneai.com
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Phone sx={{ fontSize: 16, color: 'rgba(255,255,255,0.7)' }} />
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      +1 (555) 123-4567
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn sx={{ fontSize: 16, color: 'rgba(255,255,255,0.7)' }} />
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      Ocean Research Center, CA
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </motion.div>
          </Grid>
        </Grid>

        {/* Ocean Parameters Showcase */}
        <Box sx={{ mt: 6, mb: 4 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
              Ocean Parameters We Track
            </Typography>
            <Grid container spacing={2}>
              {oceanParameters.map((param, index) => (
                <Grid item xs={6} sm={4} md={2} key={param.name}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Box sx={{ 
                      p: 2, 
                      textAlign: 'center', 
                      bgcolor: 'rgba(255,255,255,0.05)', 
                      borderRadius: 2,
                      border: '1px solid rgba(255,255,255,0.1)',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.1)',
                        transform: 'translateY(-2px)',
                        transition: 'all 0.2s'
                      }
                    }}>
                      <Box sx={{ color: '#4ecdc4', mb: 1 }}>
                        {param.icon}
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {param.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        {param.unit}
                      </Typography>
                    </Box>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Box>

        <Divider sx={{ my: 4, bgcolor: 'rgba(255,255,255,0.1)' }} />

        {/* Bottom Section */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              © 2024 NeptuneAI. All rights reserved.
            </Typography>
            <Chip 
              label="Made with ❤️ for Ocean Research" 
              size="small" 
              sx={{ 
                bgcolor: 'rgba(78, 205, 196, 0.2)', 
                color: '#4ecdc4',
                fontWeight: 500
              }} 
            />
          </Box>
          
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Link href="/privacy" sx={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.875rem' }}>
              Privacy Policy
            </Link>
            <Link href="/terms" sx={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.875rem' }}>
              Terms of Service
            </Link>
            <Link href="/cookies" sx={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.875rem' }}>
              Cookie Policy
            </Link>
            <Link href="/security" sx={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.875rem' }}>
              Security
            </Link>
          </Box>
        </Box>
      </Box>

      {/* Newsletter Success Snackbar */}
      <Snackbar
        open={newsletterSuccess}
        autoHideDuration={3000}
        onClose={() => setNewsletterSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setNewsletterSuccess(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          Successfully subscribed to newsletter!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Footer;