import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';
import { 
  Science, 
  DataUsage, 
  Psychology, 
  CloudUpload, 
  Analytics,
  Support 
} from '@mui/icons-material';

const About = () => {
  const features = [
    {
      icon: <Science />,
      title: 'Advanced Ocean Data Processing',
      description: 'Process NetCDF files with state-of-the-art algorithms for temperature, salinity, and current analysis.',
    },
    {
      icon: <DataUsage />,
      title: 'Vector Database Integration',
      description: 'Efficient storage and retrieval using FAISS vector database for semantic search capabilities.',
    },
    {
      icon: <Psychology />,
      title: 'AI-Powered Insights',
      description: 'Leverage LLMs and RAG pipelines to generate intelligent insights from oceanographic data.',
    },
    {
      icon: <CloudUpload />,
      title: 'Easy Data Upload',
      description: 'Simple drag-and-drop interface for uploading and processing ARGO NetCDF files.',
    },
    {
      icon: <Analytics />,
      title: 'Interactive Visualizations',
      description: 'Create stunning charts, maps, and dashboards to explore ocean data patterns.',
    },
    {
      icon: <Support />,
      title: 'Model Context Protocol',
      description: 'Structured communication protocol for seamless AI integration and query processing.',
    },
  ];

  const team = [
    { name: 'Dr. Ocean Researcher', role: 'Lead Data Scientist', expertise: 'Oceanography' },
    { name: 'AI Engineer', role: 'ML Engineer', expertise: 'Machine Learning' },
    { name: 'Data Architect', role: 'Backend Developer', expertise: 'Database Systems' },
    { name: 'UI/UX Designer', role: 'Frontend Developer', expertise: 'User Experience' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'white', mb: 4 }}>
        About NeptuneAI
      </Typography>

      <Grid container spacing={3}>
        {/* Mission Statement */}
        <Grid item xs={12}>
          <Paper sx={{ p: 4, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
            <Typography variant="h5" sx={{ color: 'white', mb: 3, textAlign: 'center' }}>
              Mission Statement
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', textAlign: 'center', fontSize: '1.1rem', lineHeight: 1.6 }}>
              NeptuneAI is dedicated to democratizing access to oceanographic data through cutting-edge AI technology. 
              Our platform transforms complex ARGO float data into actionable insights, enabling researchers, 
              policymakers, and environmentalists to understand and protect our oceans.
            </Typography>
          </Paper>
        </Grid>

        {/* Features */}
        <Grid item xs={12}>
          <Typography variant="h5" sx={{ color: 'white', mb: 3 }}>
            Key Features
          </Typography>
          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card sx={{ 
                  background: 'rgba(255,255,255,0.1)', 
                  backdropFilter: 'blur(10px)',
                  height: '100%',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.15)',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease',
                  }
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ 
                        bgcolor: 'rgba(52, 152, 219, 0.8)', 
                        mr: 2,
                        width: 48,
                        height: 48
                      }}>
                        {feature.icon}
                      </Avatar>
                      <Typography variant="h6" sx={{ color: 'white' }}>
                        {feature.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Technology Stack */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
              Technology Stack
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip label="Python" sx={{ bgcolor: 'rgba(52, 152, 219, 0.2)', color: 'white' }} />
              <Chip label="React" sx={{ bgcolor: 'rgba(52, 152, 219, 0.2)', color: 'white' }} />
              <Chip label="Material-UI" sx={{ bgcolor: 'rgba(52, 152, 219, 0.2)', color: 'white' }} />
              <Chip label="PostgreSQL" sx={{ bgcolor: 'rgba(52, 152, 219, 0.2)', color: 'white' }} />
              <Chip label="FAISS" sx={{ bgcolor: 'rgba(52, 152, 219, 0.2)', color: 'white' }} />
              <Chip label="Streamlit" sx={{ bgcolor: 'rgba(52, 152, 219, 0.2)', color: 'white' }} />
              <Chip label="NetCDF" sx={{ bgcolor: 'rgba(52, 152, 219, 0.2)', color: 'white' }} />
              <Chip label="LLM" sx={{ bgcolor: 'rgba(52, 152, 219, 0.2)', color: 'white' }} />
            </Box>
          </Paper>
        </Grid>

        {/* Team */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
              Our Team
            </Typography>
            <List>
              {team.map((member, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'rgba(52, 152, 219, 0.8)', width: 32, height: 32 }}>
                      {member.name.charAt(0)}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={member.name}
                    secondary={`${member.role} • ${member.expertise}`}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: 'white',
                        fontSize: '0.9rem',
                      },
                      '& .MuiListItemText-secondary': {
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: '0.8rem',
                      },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Contact */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
              Contact Information
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              For questions, support, or collaboration opportunities, please contact us at:
            </Typography>
            <Typography variant="body2" sx={{ color: 'white', mt: 1 }}>
              Email: contact@neptuneai.com
            </Typography>
            <Typography variant="body2" sx={{ color: 'white' }}>
              GitHub: github.com/neptuneai
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default About;
