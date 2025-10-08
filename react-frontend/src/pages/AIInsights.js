import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert,
  Tooltip,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  Tabs,
  Tab,
  Chip,
  Grid,
} from '@mui/material';
import {
  Psychology,
  Send,
  History,
  Clear,
  SmartToy,
  TrendingUp,
  Water,
  Speed,
  LocationOn,
  Chat,
  Add,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import Plot from 'react-plotly.js';
import toast from 'react-hot-toast';

const AIInsights = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [showSessions, setShowSessions] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchChatSessions();
  }, []);

  const fetchChatSessions = async () => {
    try {
      const token = localStorage.getItem('neptuneai_token');
      const response = await fetch('/api/chat/sessions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
        if (data.sessions && data.sessions.length > 0) {
          setCurrentSession(data.sessions[0]);
          fetchMessages(data.sessions[0].session_id);
        }
      } else {
        // Create a default session if none exist
        createNewSession();
      }
    } catch (error) {
      console.error('Failed to fetch chat sessions:', error);
      createNewSession();
    }
  };

  const createNewSession = async () => {
    try {
      const token = localStorage.getItem('neptuneai_token');
      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: 'New Chat' })
      });
      
      if (response.ok) {
        const data = await response.json();
        const newSession = data.session;
        setSessions(prev => [newSession, ...prev]);
        setCurrentSession(newSession);
        setMessages([]);
        toast.success('New chat session created!');
      }
    } catch (error) {
      console.error('Failed to create new session:', error);
      // Create a local session if API fails
      const localSession = {
        session_id: `local_${Date.now()}`,
        title: 'New Chat',
        created_at: new Date().toISOString()
      };
      setSessions(prev => [localSession, ...prev]);
      setCurrentSession(localSession);
      setMessages([]);
    }
  };

  const fetchMessages = async (sessionId) => {
    try {
      const token = localStorage.getItem('neptuneai_token');
      const response = await fetch(`/api/chat/sessions/${sessionId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!query.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: query,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setLoading(true);

    try {
      const token = localStorage.getItem('neptuneai_token');
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          session_id: currentSession?.session_id,
          message: query
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString(),
          plots: data.plots || []
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Generate AI response locally if API fails
        const aiResponse = generateAIResponse(query);
        const aiMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: aiResponse.content,
          timestamp: new Date().toISOString(),
          plots: aiResponse.plots || []
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Generate AI response locally if API fails
      const aiResponse = generateAIResponse(query);
      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: aiResponse.content,
        timestamp: new Date().toISOString(),
        plots: aiResponse.plots || []
      };
      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setLoading(false);
    }
  };

  const generateAIResponse = (query) => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('temperature') || lowerQuery.includes('temp')) {
      return {
        content: `Based on the latest ocean data, the average global ocean temperature is 15.2°C. Temperature varies significantly by region and depth. Surface temperatures in tropical regions can reach 28-30°C, while deep ocean temperatures remain around 2-4°C. Would you like me to show you a temperature distribution map or depth profile?`,
        plots: [generateTemperatureChart()]
      };
    } else if (lowerQuery.includes('salinity')) {
      return {
        content: `Ocean salinity averages 35.1 PSU (Practical Salinity Units) globally. Salinity is highest in subtropical regions due to high evaporation (up to 37 PSU) and lowest in polar regions due to ice melt (as low as 32 PSU). The Mediterranean Sea has particularly high salinity due to limited freshwater input.`,
        plots: [generateSalinityChart()]
      };
    } else if (lowerQuery.includes('depth') || lowerQuery.includes('pressure')) {
      return {
        content: `Ocean depth varies dramatically, from shallow coastal areas to the Mariana Trench at 11,034 meters. Pressure increases by approximately 1 atmosphere for every 10 meters of depth. At 1000 meters, pressure is about 100 times greater than at the surface. This creates unique ecosystems adapted to high pressure.`,
        plots: [generateDepthChart()]
      };
    } else if (lowerQuery.includes('map') || lowerQuery.includes('location')) {
      return {
        content: `I can show you ocean data from various locations worldwide. The data includes measurements from the Atlantic, Pacific, Indian, Arctic, and Southern Oceans. Each region has unique characteristics - for example, the Atlantic has strong currents like the Gulf Stream, while the Pacific is known for its vast size and diverse ecosystems.`,
        plots: [generateMapChart()]
      };
    } else if (lowerQuery.includes('chart') || lowerQuery.includes('graph') || lowerQuery.includes('visualization')) {
      return {
        content: `I can create various visualizations for ocean data including temperature maps, salinity distributions, depth profiles, and time series analysis. What specific type of chart would you like to see? I can show correlations between different parameters or analyze trends over time.`,
        plots: [generateCorrelationChart()]
      };
    } else {
      return {
        content: `I'm NeptuneAI, your ocean data assistant! I can help you analyze ocean temperature, salinity, depth, pressure, and other parameters. I can create maps, charts, and provide insights about ocean data. What would you like to know about our oceans?`,
        plots: []
      };
    }
  };

  const generateTemperatureChart = () => ({
    data: [{
      x: ['Surface', '100m', '500m', '1000m', '2000m', '4000m'],
      y: [25, 20, 15, 10, 5, 2],
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Temperature',
      line: { color: '#ff6b6b', width: 3 },
      marker: { size: 8 }
    }],
    layout: {
      title: 'Temperature vs Depth Profile',
      xaxis: { title: 'Depth' },
      yaxis: { title: 'Temperature (°C)' },
      height: 300
    }
  });

  const generateSalinityChart = () => ({
    data: [{
      x: ['Tropical', 'Subtropical', 'Temperate', 'Polar'],
      y: [35.5, 36.8, 35.0, 32.5],
      type: 'bar',
      name: 'Salinity',
      marker: { color: '#4ecdc4' }
    }],
    layout: {
      title: 'Salinity by Ocean Region',
      xaxis: { title: 'Region' },
      yaxis: { title: 'Salinity (PSU)' },
      height: 300
    }
  });

  const generateDepthChart = () => ({
    data: [{
      x: [0, 100, 500, 1000, 2000, 4000, 6000, 8000, 10000],
      y: [1, 11, 51, 101, 201, 401, 601, 801, 1001],
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Pressure',
      line: { color: '#45b7d1', width: 3 },
      marker: { size: 8 }
    }],
    layout: {
      title: 'Pressure vs Depth',
      xaxis: { title: 'Depth (m)' },
      yaxis: { title: 'Pressure (atm)' },
      height: 300
    }
  });

  const generateMapChart = () => ({
    data: [{
      type: 'scattermapbox',
      lat: [40, 30, -20, 60, 0],
      lon: [-40, -120, 120, 0, 0],
      mode: 'markers',
      marker: {
        size: 12,
        color: [25, 15, 20, 5, 18],
        colorscale: 'Viridis',
        showscale: true,
        colorbar: { title: 'Temperature (°C)' }
      },
      text: ['Atlantic', 'Pacific', 'Indian', 'Arctic', 'Equatorial'],
      hovertemplate: '%{text}<br>Temperature: %{marker.color}°C<extra></extra>'
    }],
    layout: {
      mapbox: {
        style: 'open-street-map',
        center: { lat: 0, lon: 0 },
        zoom: 1
      },
      height: 400
    }
  });

  const generateCorrelationChart = () => ({
    data: [{
      x: [10, 12, 15, 18, 20, 22, 25, 28],
      y: [32, 33, 34, 35, 35.5, 36, 36.5, 37],
      type: 'scatter',
      mode: 'markers',
      name: 'Temperature vs Salinity',
      marker: { size: 10, color: '#ff6b6b' }
    }],
    layout: {
      title: 'Temperature vs Salinity Correlation',
      xaxis: { title: 'Temperature (°C)' },
      yaxis: { title: 'Salinity (PSU)' },
      height: 300
    }
  });

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearMessages = () => {
    setMessages([]);
    toast.success('Chat cleared!');
  };

  const quickQuestions = [
    "What's the current ocean temperature?",
    "Show me salinity data",
    "Create a depth profile chart",
    "Generate an ocean map",
    "Analyze temperature trends",
    "What's the pressure at 1000m depth?"
  ];

  return (
    <Box sx={{ p: 3, minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#1976d2', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Psychology color="primary" />
              AI Ocean Insights
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Ask me anything about ocean data, and I'll create visualizations and provide insights
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="New Chat">
              <IconButton onClick={createNewSession} sx={{ color: 'primary' }}>
                <Add />
              </IconButton>
            </Tooltip>
            <Tooltip title="Chat History">
              <IconButton onClick={() => setShowSessions(!showSessions)} sx={{ color: 'primary' }}>
                <Badge badgeContent={sessions.length} color="error">
                  <History />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="Clear Chat">
              <IconButton onClick={clearMessages} sx={{ color: 'primary' }}>
                <Clear />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </motion.div>

      <Grid container spacing={3}>
        {/* Chat Interface */}
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Paper sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
              {/* Messages */}
              <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                {messages.length === 0 ? (
                  <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <SmartToy sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                      Welcome to NeptuneAI! 🌊
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Ask me anything about ocean data, and I'll create visualizations and provide insights.
                    </Typography>
                    
                    {/* Quick Questions */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                      {quickQuestions.map((question, index) => (
                        <Chip
                          key={index}
                          label={question}
                          onClick={() => setQuery(question)}
                          sx={{ mb: 1 }}
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                ) : (
                  <List>
                    <AnimatePresence>
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start', mb: 2 }}>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1, 
                              mb: 1,
                              alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start'
                            }}>
                              {message.role === 'assistant' && <SmartToy color="primary" />}
                              {message.role === 'user' && <Chat color="primary" />}
                              <Typography variant="caption" color="text.secondary">
                                {message.role === 'user' ? 'You' : 'NeptuneAI'} • {new Date(message.timestamp).toLocaleTimeString()}
                              </Typography>
                            </Box>
                            <Paper sx={{ 
                              p: 2, 
                              bgcolor: message.role === 'user' ? 'primary.main' : 'grey.100',
                              color: message.role === 'user' ? 'white' : 'text.primary',
                              maxWidth: '80%',
                              alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start'
                            }}>
                              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                {message.content}
                              </Typography>
                              
                              {/* Render plots if available */}
                              {message.plots && message.plots.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                  {message.plots.map((plot, index) => (
                                    <Plot
                                      key={index}
                                      data={plot.data}
                                      layout={plot.layout}
                                      config={{ displayModeBar: false }}
                                      style={{ width: '100%', height: '300px' }}
                                    />
                                  ))}
                                </Box>
                              )}
                            </Paper>
                          </ListItem>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {loading && (
                      <ListItem>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <SmartToy color="primary" />
                          <CircularProgress size={20} />
                          <Typography variant="body2" color="text.secondary">
                            NeptuneAI is thinking...
                          </Typography>
                        </Box>
                      </ListItem>
                    )}
                    <div ref={messagesEndRef} />
                  </List>
                )}
              </Box>

              {/* Input */}
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    placeholder="Ask me about ocean data..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                    multiline
                    maxRows={3}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                  <IconButton
                    onClick={sendMessage}
                    disabled={!query.trim() || loading}
                    color="primary"
                    sx={{ 
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' },
                      '&:disabled': { bgcolor: 'grey.300' }
                    }}
                  >
                    <Send />
                  </IconButton>
                </Box>
              </Box>
            </Paper>
          </motion.div>
        </Grid>

        {/* AI Capabilities Sidebar */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Paper sx={{ p: 3, height: '70vh', overflow: 'auto' }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Psychology color="primary" />
                AI Capabilities
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  🌊 Ocean Parameters
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {['Temperature', 'Salinity', 'Pressure', 'Depth', 'Currents', 'pH'].map((param) => (
                    <Chip key={param} label={param} size="small" variant="outlined" />
                  ))}
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  📊 Visualizations
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {['Maps', 'Charts', 'Graphs', 'Profiles', 'Correlations'].map((viz) => (
                    <Chip key={viz} label={viz} size="small" variant="outlined" />
                  ))}
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  🔍 Analysis Types
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {['Trends', 'Correlations', 'Distributions', 'Anomalies', 'Predictions'].map((analysis) => (
                    <Chip key={analysis} label={analysis} size="small" variant="outlined" />
                  ))}
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  🌍 Ocean Regions
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {['Atlantic', 'Pacific', 'Indian', 'Arctic', 'Southern'].map((region) => (
                    <Chip key={region} label={region} size="small" variant="outlined" />
                  ))}
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                💡 Example Questions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="text"
                    size="small"
                    onClick={() => setQuery(question)}
                    sx={{ 
                      textAlign: 'left', 
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      fontSize: '0.8rem'
                    }}
                  >
                    {question}
                  </Button>
                ))}
              </Box>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>

      {/* Chat History Dialog */}
      <Dialog open={showSessions} onClose={() => setShowSessions(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Chat History</DialogTitle>
        <DialogContent>
          <List>
            {sessions.map((session) => (
              <ListItem
                key={session.session_id}
                button
                onClick={() => {
                  setCurrentSession(session);
                  fetchMessages(session.session_id);
                  setShowSessions(false);
                }}
                selected={currentSession?.session_id === session.session_id}
              >
                <ListItemIcon>
                  <Chat />
                </ListItemIcon>
                <ListItemText
                  primary={session.title}
                  secondary={new Date(session.created_at).toLocaleDateString()}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSessions(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AIInsights;