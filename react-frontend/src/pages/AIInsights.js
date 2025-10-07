import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Chip,
  Avatar,
  Grid,
} from '@mui/material';
import { Psychology, Send } from '@mui/icons-material';

const AIInsights = () => {
  const [query, setQuery] = useState('');
  const [insights, setInsights] = useState([]);

  const handleSubmit = () => {
    if (query.trim()) {
      const newInsight = {
        id: Date.now(),
        query: query,
        response: `Based on the ocean data analysis, here's what I found regarding "${query}". The temperature patterns show significant variations in the Indian Ocean region, with salinity levels indicating seasonal changes. This data suggests potential climate impacts on marine ecosystems.`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setInsights([newInsight, ...insights]);
      setQuery('');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'white', mb: 4 }}>
        AI-Powered Ocean Insights
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 3,
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              mb: 3,
            }}
          >
            <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
              Ask AI About Ocean Data
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                placeholder="Ask about temperature trends, salinity patterns, or ocean currents..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255,255,255,0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255,255,255,0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'white',
                    },
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!query.trim()}
                sx={{
                  bgcolor: 'rgba(52, 152, 219, 0.8)',
                  '&:hover': { bgcolor: 'rgba(52, 152, 219, 1)' },
                  minWidth: '100px',
                }}
              >
                <Send sx={{ mr: 1 }} />
                Ask
              </Button>
            </Box>

            {/* Quick Suggestion Chips */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {['Temperature trends', 'Salinity patterns', 'Ocean currents'].map(
                (label) => (
                  <Chip
                    key={label}
                    label={label}
                    onClick={() => setQuery(label)}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                    }}
                  />
                )
              )}
            </Box>
          </Paper>

          {/* AI Responses Section */}
          <Box sx={{ maxHeight: '500px', overflowY: 'auto' }}>
            {insights.map((insight) => (
              <Paper
                key={insight.id}
                sx={{
                  p: 3,
                  mb: 2,
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'rgba(52, 152, 219, 0.8)', mr: 2 }}>
                    <Psychology />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: 'white' }}>
                      AI Assistant
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'rgba(255,255,255,0.7)' }}
                    >
                      {insight.timestamp}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 1 }}>
                  <strong>Query:</strong> {insight.query}
                </Typography>
                <Typography variant="body1" sx={{ color: 'white' }}>
                  {insight.response}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Grid>

        {/* Sidebar: AI Capabilities */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
              AI Capabilities
            </Typography>
            <Box sx={{ color: 'rgba(255,255,255,0.8)' }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                • Natural language queries about ocean data
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                • Pattern recognition in temperature and salinity
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                • Predictive analysis of ocean trends
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                • Correlation analysis between variables
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                • Climate impact assessments
              </Typography>
              <Typography variant="body2">
                • Automated data insights generation
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AIInsights;
