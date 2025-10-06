import React from 'react';
import { Box, Typography, Container, Grid, Link, IconButton } from '@mui/material';
import { GitHub, Twitter, LinkedIn, Email } from '@mui/icons-material';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        background: 'linear-gradient(90deg, #2c3e50 0%, #34495e 100%)',
        color: 'white',
        py: 4,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Brand Section */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                🌊 NeptuneAI
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                Advanced ARGO Ocean Data Discovery & Visualization Platform
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton 
                  size="small" 
                  sx={{ color: 'rgba(255,255,255,0.7)' }}
                  href="https://github.com/neptuneai"
                  target="_blank"
                >
                  <GitHub />
                </IconButton>
                <IconButton 
                  size="small" 
                  sx={{ color: 'rgba(255,255,255,0.7)' }}
                  href="https://twitter.com/neptuneai"
                  target="_blank"
                >
                  <Twitter />
                </IconButton>
                <IconButton 
                  size="small" 
                  sx={{ color: 'rgba(255,255,255,0.7)' }}
                  href="https://linkedin.com/company/neptuneai"
                  target="_blank"
                >
                  <LinkedIn />
                </IconButton>
                <IconButton 
                  size="small" 
                  sx={{ color: 'rgba(255,255,255,0.7)' }}
                  href="mailto:contact@neptuneai.com"
                >
                  <Email />
                </IconButton>
              </Box>
            </motion.div>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} md={2}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Quick Links
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Link href="/analytics" color="inherit" sx={{ textDecoration: 'none' }}>
                  Analytics
                </Link>
                <Link href="/datasets" color="inherit" sx={{ textDecoration: 'none' }}>
                  Datasets
                </Link>
                <Link href="/upload" color="inherit" sx={{ textDecoration: 'none' }}>
                  Upload Data
                </Link>
                <Link href="/ai-insights" color="inherit" sx={{ textDecoration: 'none' }}>
                  AI Insights
                </Link>
              </Box>
            </motion.div>
          </Grid>

          {/* Resources */}
          <Grid item xs={12} md={2}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Resources
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Link href="/docs" color="inherit" sx={{ textDecoration: 'none' }}>
                  Documentation
                </Link>
                <Link href="/api" color="inherit" sx={{ textDecoration: 'none' }}>
                  API Reference
                </Link>
                <Link href="/tutorials" color="inherit" sx={{ textDecoration: 'none' }}>
                  Tutorials
                </Link>
                <Link href="/support" color="inherit" sx={{ textDecoration: 'none' }}>
                  Support
                </Link>
              </Box>
            </motion.div>
          </Grid>

          {/* Contact */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Contact
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  📧 contact@neptuneai.com
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  🌐 www.neptuneai.com
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  📍 Ocean Science Center, CA
                </Typography>
              </Box>
            </motion.div>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 3 }} />

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              © {currentYear} NeptuneAI ARGO Ocean Data Platform v2.0 | Built with ❤️ for Ocean Science
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Footer;