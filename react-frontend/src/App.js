import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Footer from './components/Layout/Footer';

// Pages
import Home from './pages/Home';
import Analytics from './pages/Analytics';
import Datasets from './pages/Datasets';
import Upload from './pages/Upload';
import AIInsights from './pages/AIInsights';
import Profile from './pages/Profile';
import About from './pages/About';

// Context
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Hooks
import { useAuth } from './hooks/useAuth';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <AuthProvider>
      <ThemeProvider>
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          <CssBaseline />
          
          {/* Navbar */}
          <Navbar 
            onMenuClick={toggleSidebar}
            darkMode={darkMode}
            onToggleDarkMode={toggleDarkMode}
          />
          
          {/* Sidebar */}
          <Sidebar 
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
          
          {/* Main Content */}
          <Box 
            component="main" 
            sx={{ 
              flexGrow: 1, 
              pt: 8, // Account for navbar height
              minHeight: '100vh',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/datasets" element={<Datasets />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/ai-insights" element={<AIInsights />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/about" element={<About />} />
              </Routes>
            </AnimatePresence>
          </Box>
          
          {/* Footer */}
          <Footer />
        </Box>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;