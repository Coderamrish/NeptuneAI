import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Chip,
  Avatar,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  Tabs,
  Tab,
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
  const [error, setError] = useState(null);
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
        setSessions(data.sessions);
      }
    } catch (err) {
      console.error('Failed to fetch chat sessions:', err);
    }
  };

  const createNewSession = async () => {
    try {
      const token = localStorage.getItem('neptuneai_token');
      const response = await fetch('/api/chat/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: 'New Chat' })
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentSession(data.session_id);
        setMessages([]);
        fetchChatSessions();
        toast.success('New chat session created');
      }
    } catch (err) {
      toast.error('Failed to create new session');
    }
  };

  const loadSession = async (sessionId) => {
    try {
      const token = localStorage.getItem('neptuneai_token');
      const response = await fetch(`/api/chat/messages/${sessionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
        setCurrentSession(sessionId);
        setShowSessions(false);
      }
    } catch (err) {
      toast.error('Failed to load session');
    }
  };

  const handleSubmit = async () => {
    if (!query.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: query,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('neptuneai_token');
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: query,
          session_id: currentSession
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: data.response,
          plot: data.plot,
          timestamp: data.timestamp
        };
        setMessages(prev => [...prev, aiMessage]);
        toast.success('AI response generated');
      } else {
        throw new Error('Failed to get AI response');
      }
    } catch (err) {
      setError(err.message);
      toast.error('Failed to get AI response');
    } finally {
      setLoading(false);
      setQuery('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setCurrentSession(null);
    toast.success('Chat cleared');
  };

  const quickQuestions = [
    'What are the temperature trends in the Indian Ocean?',
    'Show me salinity patterns by depth',
    'Which regions have the highest data coverage?',
    'Analyze seasonal variations in ocean parameters',
    'What is the relationship between temperature and salinity?',
    'Generate a map of ocean currents'
  ];

  const renderPlot = (plotData) => {
    if (!plotData) return null;

    try {
      const plot = typeof plotData === 'string' ? JSON.parse(plotData) : plotData;
      return (
        <Box sx={{ mt: 2, height: 400 }}>
          <Plot
            data={plot.data || []}
            layout={{
              ...plot.layout,
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(0,0,0,0)',
              font: { color: 'white' }
            }}
            config={{ responsive: true, displayModeBar: false }}
            style={{ width: '100%', height: '100%' }}
          />
        </Box>
      );
    } catch (err) {
      return (
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1 }}>
          Plot data could not be rendered
        </Typography>
      );
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
            AI Ocean Insights
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            Chat with AI to explore ocean data and generate insights
          </Typography>
        </motion.div>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="New Chat">
            <IconButton onClick={createNewSession} sx={{ color: 'white' }}>
              <Add />
            </IconButton>
          </Tooltip>
          <Tooltip title="Chat History">
            <IconButton onClick={() => setShowSessions(!showSessions)} sx={{ color: 'white' }}>
              <Badge badgeContent={sessions.length} color="error">
                <History />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title="Clear Chat">
            <IconButton onClick={clearChat} sx={{ color: 'white' }}>
              <Clear />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Chat Interface */}
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Paper sx={{ 
              p: 3, 
              background: 'rgba(255,255,255,0.1)', 
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              height: '70vh',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Messages Area */}
              <Box sx={{ 
                flexGrow: 1, 
                overflowY: 'auto', 
                mb: 2,
                maxHeight: '50vh',
                '&::-webkit-scrollbar': { width: '6px' },
                '&::-webkit-scrollbar-track': { background: 'rgba(255,255,255,0.1)' },
                '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.3)', borderRadius: '3px' }
              }}>
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Box sx={{ 
                        display: 'flex', 
                        mb: 2,
                        justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
                      }}>
                        <Box sx={{ 
                          maxWidth: '80%',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 1,
                          flexDirection: message.role === 'user' ? 'row-reverse' : 'row'
                        }}>
                          <Avatar sx={{ 
                            bgcolor: message.role === 'user' ? '#4ecdc4' : '#ff6b6b',
                            width: 32,
                            height: 32
                          }}>
                            {message.role === 'user' ? <SmartToy /> : <Psychology />}
                          </Avatar>
                          <Paper sx={{
                            p: 2,
                            background: message.role === 'user' 
                              ? 'rgba(78, 205, 196, 0.2)' 
                              : 'rgba(255, 107, 107, 0.2)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: message.role === 'user' ? '20px 20px 5px 20px' : '20px 20px 20px 5px'
                          }}>
                            <Typography variant="body1" sx={{ color: 'white', mb: 1 }}>
                              {message.content}
                            </Typography>
                            {message.plot && renderPlot(message.plot)}
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </Typography>
                          </Paper>
                        </Box>
                      </Box>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {loading && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#ff6b6b', width: 32, height: 32 }}>
                      <Psychology />
                    </Avatar>
                    <Paper sx={{
                      p: 2,
                      background: 'rgba(255, 107, 107, 0.2)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '20px 20px 20px 5px'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={16} sx={{ color: 'white' }} />
                        <Typography variant="body2" sx={{ color: 'white' }}>
                          AI is thinking...
                        </Typography>
                      </Box>
                    </Paper>
                  </Box>
                )}
                
                <div ref={messagesEndRef} />
              </Box>

              {/* Input Area */}
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  placeholder="Ask about ocean data, temperature trends, salinity patterns..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                      '&.Mui-focused fieldset': { borderColor: 'white' }
                    }
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={!query.trim() || loading}
                  sx={{
                    bgcolor: 'rgba(78, 205, 196, 0.8)',
                    '&:hover': { bgcolor: 'rgba(78, 205, 196, 1)' },
                    minWidth: '60px',
                    height: '56px'
                  }}
                >
                  <Send />
                </Button>
              </Box>

              {/* Error Display */}
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
            </Paper>
          </motion.div>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Paper sx={{ 
              p: 3, 
              background: 'rgba(255,255,255,0.1)', 
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              height: '70vh',
              overflowY: 'auto'
            }}>
              <Tabs
                value={tabValue}
                onChange={(e, newValue) => setTabValue(newValue)}
                sx={{
                  '& .MuiTab-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .Mui-selected': { color: 'white' },
                  '& .MuiTabs-indicator': { backgroundColor: 'white' }
                }}
              >
                <Tab label="Quick Questions" />
                <Tab label="Chat History" />
              </Tabs>

              {tabValue === 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                    Quick Questions
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {quickQuestions.map((question, index) => (
                      <Chip
                        key={index}
                        label={question}
                        onClick={() => setQuery(question)}
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.1)',
                          color: 'white',
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                          textAlign: 'left',
                          height: 'auto',
                          '& .MuiChip-label': { whiteSpace: 'normal' }
                        }}
                      />
                    ))}
                  </Box>

                  <Divider sx={{ my: 3, bgcolor: 'rgba(255,255,255,0.1)' }} />

                  <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                    AI Capabilities
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <Water sx={{ color: '#4ecdc4' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Ocean Data Analysis"
                        secondary="Temperature, salinity, depth analysis"
                        primaryTypographyProps={{ color: 'white', fontSize: '0.9rem' }}
                        secondaryTypographyProps={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TrendingUp sx={{ color: '#ff6b6b' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Trend Analysis"
                        secondary="Identify patterns and trends"
                        primaryTypographyProps={{ color: 'white', fontSize: '0.9rem' }}
                        secondaryTypographyProps={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <LocationOn sx={{ color: '#feca57' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Geographic Insights"
                        secondary="Regional data comparisons"
                        primaryTypographyProps={{ color: 'white', fontSize: '0.9rem' }}
                        secondaryTypographyProps={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Speed sx={{ color: '#a55eea' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Real-time Processing"
                        secondary="Instant data analysis"
                        primaryTypographyProps={{ color: 'white', fontSize: '0.9rem' }}
                        secondaryTypographyProps={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}
                      />
                    </ListItem>
                  </List>
                </Box>
              )}

              {tabValue === 1 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                    Chat History
                  </Typography>
                  {sessions.length === 0 ? (
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      No previous chats found
                    </Typography>
                  ) : (
                    <List dense>
                      {sessions.map((session) => (
                        <ListItem
                          key={session.session_id}
                          button
                          onClick={() => loadSession(session.session_id)}
                          sx={{
                            borderRadius: 1,
                            mb: 1,
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                          }}
                        >
                          <ListItemIcon>
                            <Chat sx={{ color: 'rgba(255,255,255,0.7)' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={session.title}
                            secondary={new Date(session.last_activity).toLocaleDateString()}
                            primaryTypographyProps={{ color: 'white', fontSize: '0.9rem' }}
                            secondaryTypographyProps={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              )}
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AIInsights;