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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  Grid,
  Chip,
  Button,
  Avatar,
  Fade,
  Zoom,
} from '@mui/material';
import {
  Psychology,
  Send,
  History,
  Clear,
  SmartToy,
  Chat,
  Add,
  WaterDrop,
  Waves,
  Thermostat,
  Insights,
  AutoAwesome,
  Science,
  TrendingUp,
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
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  
  const quickQuestions = [
    "What's the current ocean temperature?",
    "Show me salinity data",
    "Create a depth profile chart",
    "Generate an ocean map",
    "Analyze temperature trends",
    "What's the pressure at 1000m depth?"
  ];
  
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
        } else {
          createNewSession();
        }
      } else {
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
        const newSession = {
          session_id: data.session_id,
          title: data.title || 'New Chat',
          created_at: data.created_at || new Date().toISOString(),
          last_activity: data.last_activity || new Date().toISOString()
        };
        
        setSessions(prev => [newSession, ...prev]);
        setCurrentSession(newSession);
        setMessages([]);
        toast.success('New chat session created!', {
          icon: '🌊',
          style: {
            borderRadius: '10px',
            background: '#1976d2',
            color: '#fff',
          },
        });
      } else {
        throw new Error('Failed to create session');
      }
    } catch (error) {
      console.error('Failed to create new session:', error);
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

    const userQuery = query.trim();
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: userQuery,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setLoading(true);
    setIsTyping(true);
    setError(null);

    try {
      const token = localStorage.getItem('neptuneai_token');
      console.log('Sending message to backend:', userQuery);
      
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          session_id: currentSession?.session_id || null,
          message: userQuery
        })
      });

      console.log('Backend response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Backend response data:', data);
        
        // Extract the response text from backend
        // Backend sends: { summary: "...", plot: {...}, data: [...] }
        const responseText = data.summary || data.response || data.content || 'I apologize, but I could not generate a response.';
        
        // Extract plots from backend response
        const plots = [];
        if (data.plot) {
          plots.push(data.plot);
        }
        if (data.plots && Array.isArray(data.plots)) {
          plots.push(...data.plots);
        }
        
        const aiMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: responseText,
          timestamp: new Date().toISOString(),
          plots: plots,
          data: data.data || null
        };
        
        setTimeout(() => {
          setMessages(prev => [...prev, aiMessage]);
          setIsTyping(false);
          toast.success('AI response received!', {
            icon: '🤖',
            style: {
              borderRadius: '10px',
              background: '#10b981',
              color: '#fff',
            },
          });
        }, 500);
      } else {
        const errorText = await response.text();
        console.error('Backend error:', response.status, errorText);
        throw new Error(`Backend error: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to connect to the server. Please try again.');
      setIsTyping(false);
      toast.error('Connection error. Please try again.', {
        icon: '❌',
        style: {
          borderRadius: '10px',
          background: '#ef4444',
          color: '#fff',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearMessages = () => {
    setMessages([]);
    toast.success('Chat cleared!', {
      icon: '🧹',
      style: {
        borderRadius: '10px',
        background: '#ef4444',
        color: '#fff',
      },
    });
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
        pointerEvents: 'none',
      }
    }}>
      <Box sx={{ position: 'relative', zIndex: 1, p: 3 }}>
        {/* Animated Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 4,
            p: 3,
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ 
                width: 56, 
                height: 56, 
                bgcolor: 'primary.main',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
              }}>
                <Psychology sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ 
                  fontWeight: 800, 
                  color: 'white',
                  textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                  letterSpacing: '-0.5px',
                }}>
                  NeptuneAI
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Advanced Ocean Data Intelligence
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="New Chat" arrow>
                <IconButton 
                  onClick={createNewSession}
                  sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    '&:hover': { 
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.3s',
                  }}
                >
                  <Add />
                </IconButton>
              </Tooltip>
              <Tooltip title="Clear Chat" arrow>
                <IconButton 
                  onClick={clearMessages}
                  sx={{ 
                    bgcolor: 'rgba(239, 68, 68, 0.2)',
                    color: '#ef4444',
                    '&:hover': { 
                      bgcolor: 'rgba(239, 68, 68, 0.3)',
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.3s',
                  }}
                >
                  <Clear />
                </IconButton>
              </Tooltip>
              <Tooltip title="Chat History" arrow>
                <IconButton 
                  onClick={() => setShowSessions(!showSessions)}
                  sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    '&:hover': { 
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.3s',
                  }}
                >
                  <Badge badgeContent={sessions.length} color="error">
                    <History />
                  </Badge>
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: 'white',
                }} 
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <Grid container spacing={3}>
          {/* Main Chat Interface */}
          <Grid item xs={12} lg={8}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Paper sx={{ 
                height: '75vh', 
                display: 'flex', 
                flexDirection: 'column',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 4,
                overflow: 'hidden',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
              }}>
                {/* Messages Container */}
                <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
                  {messages.length === 0 ? (
                    <Box sx={{ 
                      textAlign: 'center', 
                      mt: 8,
                      animation: 'fadeIn 0.6s ease-in',
                    }}>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ 
                          type: "spring",
                          stiffness: 260,
                          damping: 20,
                          delay: 0.3
                        }}
                      >
                        <Avatar sx={{ 
                          width: 100, 
                          height: 100, 
                          margin: '0 auto',
                          mb: 3,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          boxShadow: '0 10px 40px rgba(102, 126, 234, 0.4)',
                        }}>
                          <SmartToy sx={{ fontSize: 50 }} />
                        </Avatar>
                      </motion.div>
                      
                      <Typography variant="h4" sx={{ 
                        color: 'white',
                        fontWeight: 700,
                        mb: 2,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}>
                        Welcome to NeptuneAI
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 4 }}>
                        Your intelligent companion for ocean data analysis
                      </Typography>
                      
                      {/* Quick Questions Grid */}
                      <Box sx={{ 
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: 2,
                        maxWidth: 800,
                        margin: '0 auto',
                        mt: 4,
                      }}>
                        {quickQuestions.map((question, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                          >
                            <Paper
                              onClick={() => setQuery(question)}
                              sx={{ 
                                p: 2,
                                cursor: 'pointer',
                                background: 'rgba(255, 255, 255, 0.05)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                transition: 'all 0.3s',
                                '&:hover': {
                                  background: 'rgba(255, 255, 255, 0.1)',
                                  transform: 'translateY(-4px)',
                                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
                                },
                              }}
                            >
                              <Typography variant="body2" sx={{ color: 'white', textAlign: 'left' }}>
                                {question}
                              </Typography>
                            </Paper>
                          </motion.div>
                        ))}
                      </Box>
                    </Box>
                  ) : (
                    <List sx={{ pb: 2 }}>
                      <AnimatePresence>
                        {messages.map((message, index) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                          >
                            <ListItem sx={{ 
                              flexDirection: 'column', 
                              alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
                              mb: 3,
                              px: 0,
                            }}>
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1.5, 
                                mb: 1,
                              }}>
                                {message.role === 'assistant' && (
                                  <Avatar sx={{ 
                                    width: 32, 
                                    height: 32,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  }}>
                                    <SmartToy sx={{ fontSize: 18 }} />
                                  </Avatar>
                                )}
                                <Typography variant="caption" sx={{ 
                                  color: 'rgba(255, 255, 255, 0.6)',
                                  fontWeight: 600,
                                }}>
                                  {message.role === 'user' ? 'You' : 'NeptuneAI'}
                                </Typography>
                                {message.role === 'user' && (
                                  <Avatar sx={{ 
                                    width: 32, 
                                    height: 32,
                                    bgcolor: 'primary.main',
                                  }}>
                                    <Chat sx={{ fontSize: 18 }} />
                                  </Avatar>
                                )}
                              </Box>
                              
                              <Paper sx={{ 
                                p: 2.5, 
                                maxWidth: '85%',
                                background: message.role === 'user' 
                                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                  : 'rgba(255, 255, 255, 0.08)',
                                backdropFilter: 'blur(10px)',
                                border: message.role === 'user' 
                                  ? 'none'
                                  : '1px solid rgba(255, 255, 255, 0.1)',
                                color: 'white',
                                borderRadius: 3,
                                boxShadow: message.role === 'user'
                                  ? '0 4px 20px rgba(102, 126, 234, 0.3)'
                                  : '0 4px 20px rgba(0, 0, 0, 0.2)',
                              }}>
                                <Typography variant="body1" sx={{ 
                                  whiteSpace: 'pre-wrap',
                                  lineHeight: 1.7,
                                }}>
                                  {message.content}
                                </Typography>
                                
                                {/* Render plots from backend */}
                                {message.plots && message.plots.length > 0 && (
                                  <Box sx={{ mt: 3 }}>
                                    {message.plots.map((plot, plotIndex) => (
                                      <Box 
                                        key={plotIndex}
                                        sx={{ 
                                          mb: 2,
                                          borderRadius: 2,
                                          overflow: 'hidden',
                                          background: 'rgba(0, 0, 0, 0.2)',
                                        }}
                                      >
                                        <Plot
                                          data={plot.data}
                                          layout={{
                                            ...plot.layout,
                                            paper_bgcolor: 'rgba(0,0,0,0)',
                                            plot_bgcolor: 'rgba(0,0,0,0)',
                                            font: { color: 'white' },
                                          }}
                                          config={{ displayModeBar: false }}
                                          style={{ width: '100%' }}
                                        />
                                      </Box>
                                    ))}
                                  </Box>
                                )}
                              </Paper>
                            </ListItem>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      
                      {/* Typing Indicator */}
                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <ListItem sx={{ px: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar sx={{ 
                                width: 32, 
                                height: 32,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              }}>
                                <SmartToy sx={{ fontSize: 18 }} />
                              </Avatar>
                              <Paper sx={{
                                p: 2,
                                background: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: 3,
                              }}>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                  <Box sx={{ 
                                    width: 8, 
                                    height: 8, 
                                    borderRadius: '50%',
                                    bgcolor: 'primary.main',
                                    animation: 'pulse 1.5s ease-in-out infinite',
                                  }} />
                                  <Box sx={{ 
                                    width: 8, 
                                    height: 8, 
                                    borderRadius: '50%',
                                    bgcolor: 'primary.main',
                                    animation: 'pulse 1.5s ease-in-out 0.2s infinite',
                                  }} />
                                  <Box sx={{ 
                                    width: 8, 
                                    height: 8, 
                                    borderRadius: '50%',
                                    bgcolor: 'primary.main',
                                    animation: 'pulse 1.5s ease-in-out 0.4s infinite',
                                  }} />
                                  <Typography variant="caption" sx={{ ml: 1, color: 'rgba(255, 255, 255, 0.7)' }}>
                                    Analyzing...
                                  </Typography>
                                </Box>
                              </Paper>
                            </Box>
                          </ListItem>
                        </motion.div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </List>
                  )}
                </Box>

                {/* Enhanced Input Area */}
                <Box sx={{ 
                  p: 3, 
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(0, 0, 0, 0.2)',
                }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                    <TextField
                      fullWidth
                      placeholder="Ask me anything about ocean data..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={loading}
                      multiline
                      maxRows={4}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          color: 'white',
                          borderRadius: 3,
                          background: 'rgba(255, 255, 255, 0.05)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          '& fieldset': {
                            border: 'none',
                          },
                          '&:hover': {
                            background: 'rgba(255, 255, 255, 0.08)',
                          },
                          '&.Mui-focused': {
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(102, 126, 234, 0.5)',
                          },
                        },
                        '& .MuiInputBase-input::placeholder': {
                          color: 'rgba(255, 255, 255, 0.5)',
                        },
                      }}
                    />
                    <IconButton
                      onClick={sendMessage}
                      disabled={!query.trim() || loading}
                      sx={{ 
                        width: 56,
                        height: 56,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                        '&:hover': { 
                          background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                          transform: 'scale(1.05)',
                        },
                        '&:disabled': { 
                          background: 'rgba(255, 255, 255, 0.1)',
                          color: 'rgba(255, 255, 255, 0.3)',
                        },
                        transition: 'all 0.3s',
                      }}
                    >
                      {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : <Send />}
                    </IconButton>
                  </Box>
                </Box>
              </Paper>
            </motion.div>
          </Grid>

          {/* Enhanced Sidebar */}
          <Grid item xs={12} lg={4}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Paper sx={{ 
                p: 3, 
                height: '75vh', 
                overflow: 'auto',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 4,
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgba(255, 255, 255, 0.05)',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '4px',
                },
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <AutoAwesome sx={{ color: '#fbbf24' }} />
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                    AI Capabilities
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Waves sx={{ color: '#3b82f6', fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
                      Ocean Parameters
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {['Temperature', 'Salinity', 'Pressure', 'Depth', 'Currents', 'pH'].map((param) => (
                      <Chip 
                        key={param} 
                        label={param} 
                        size="small"
                        sx={{
                          background: 'rgba(59, 130, 246, 0.2)',
                          color: '#60a5fa',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          '&:hover': {
                            background: 'rgba(59, 130, 246, 0.3)',
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Insights sx={{ color: '#8b5cf6', fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
                      Visualizations
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {['Maps', 'Charts', 'Graphs', 'Profiles', 'Correlations'].map((viz) => (
                      <Chip 
                        key={viz} 
                        label={viz} 
                        size="small"
                        sx={{
                          background: 'rgba(139, 92, 246, 0.2)',
                          color: '#a78bfa',
                          border: '1px solid rgba(139, 92, 246, 0.3)',
                          '&:hover': {
                            background: 'rgba(139, 92, 246, 0.3)',
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <TrendingUp sx={{ color: '#10b981', fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
                      Analysis Types
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {['Trends', 'Correlations', 'Distributions', 'Anomalies', 'Predictions'].map((analysis) => (
                      <Chip 
                        key={analysis} 
                        label={analysis} 
                        size="small"
                        sx={{
                          background: 'rgba(16, 185, 129, 0.2)',
                          color: '#34d399',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          '&:hover': {
                            background: 'rgba(16, 185, 129, 0.3)',
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <WaterDrop sx={{ color: '#06b6d4', fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
                      Ocean Regions
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {['Atlantic', 'Pacific', 'Indian', 'Arctic', 'Southern'].map((region) => (
                      <Chip 
                        key={region} 
                        label={region} 
                        size="small"
                        sx={{
                          background: 'rgba(6, 182, 212, 0.2)',
                          color: '#22d3ee',
                          border: '1px solid rgba(6, 182, 212, 0.3)',
                          '&:hover': {
                            background: 'rgba(6, 182, 212, 0.3)',
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Box>

                <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Science sx={{ color: '#f59e0b', fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
                    Example Questions
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {quickQuestions.map((question, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <Button
                        variant="text"
                        onClick={() => setQuery(question)}
                        sx={{ 
                          textAlign: 'left', 
                          justifyContent: 'flex-start',
                          textTransform: 'none',
                          p: 1.5,
                          borderRadius: 2,
                          color: 'rgba(255, 255, 255, 0.8)',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          '&:hover': {
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            transform: 'translateX(4px)',
                          },
                          transition: 'all 0.3s',
                        }}
                      >
                        <Typography variant="body2">
                          {question}
                        </Typography>
                      </Button>
                    </motion.div>
                  ))}
                </Box>

                {/* Stats Section */}
                <Box sx={{ mt: 4, p: 2, borderRadius: 2, background: 'rgba(102, 126, 234, 0.1)', border: '1px solid rgba(102, 126, 234, 0.2)' }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 1, display: 'block' }}>
                    Session Stats
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                        {messages.length}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                        Messages
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                        {sessions.length}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                        Sessions
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>

        {/* Chat History Dialog */}
        <Dialog 
          open={showSessions} 
          onClose={() => setShowSessions(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 3,
              color: 'white',
            }
          }}
        >
          <DialogTitle sx={{ 
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}>
            <History />
            Chat History
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <List>
              {sessions.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <SmartToy sx={{ fontSize: 48, color: 'rgba(255, 255, 255, 0.3)', mb: 2 }} />
                  <Typography variant="body2" color="rgba(255, 255, 255, 0.6)">
                    No chat history yet. Start a conversation!
                  </Typography>
                </Box>
              ) : (
                sessions.map((session) => (
                  <ListItem
                    key={session.session_id}
                    button
                    onClick={() => {
                      setCurrentSession(session);
                      fetchMessages(session.session_id);
                      setShowSessions(false);
                      toast.success('Session loaded!', {
                        icon: '📂',
                        style: {
                          borderRadius: '10px',
                          background: '#1976d2',
                          color: '#fff',
                        },
                      });
                    }}
                    selected={currentSession?.session_id === session.session_id}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      background: currentSession?.session_id === session.session_id 
                        ? 'rgba(102, 126, 234, 0.2)' 
                        : 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid',
                      borderColor: currentSession?.session_id === session.session_id
                        ? 'rgba(102, 126, 234, 0.5)'
                        : 'rgba(255, 255, 255, 0.1)',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.08)',
                      },
                    }}
                  >
                    <ListItemIcon>
                      <Chat sx={{ color: 'white' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={session.title}
                      secondary={new Date(session.created_at).toLocaleDateString()}
                      primaryTypographyProps={{ sx: { color: 'white' } }}
                      secondaryTypographyProps={{ sx: { color: 'rgba(255, 255, 255, 0.6)' } }}
                    />
                  </ListItem>
                ))
              )}
            </List>
          </DialogContent>
          <DialogActions sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', p: 2 }}>
            <Button 
              onClick={() => setShowSessions(false)}
              sx={{ 
                color: 'white',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add keyframe animations */}
        <style>
          {`
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            @keyframes pulse {
              0%, 100% {
                opacity: 0.4;
                transform: scale(1);
              }
              50% {
                opacity: 1;
                transform: scale(1.2);
              }
            }
          `}
        </style>
      </Box>
    </Box>
  );
};

export default AIInsights;