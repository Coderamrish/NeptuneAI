import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import { AnimatePresence } from 'framer-motion';

// Components
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Footer from './components/Layout/Footer';
import AuthWrapper from './components/Auth/AuthWrapper';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Analytics from './pages/Analytics';
import Datasets from './pages/Datasets';
import Upload from './pages/Upload';
import AIInsights from './pages/AIInsights';
import Profile from './pages/Profile';
import About from './pages/About';
import Dashboard from './pages/Dashboard';
import DataExplorer from './pages/DataExplorer';

// Context
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Main App Content Component
const AppContent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
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
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/data-explorer" element={
              <ProtectedRoute>
                <DataExplorer />
              </ProtectedRoute>
            } />
            <Route path="/datasets" element={
              <ProtectedRoute>
                <Datasets />
              </ProtectedRoute>
            } />
            <Route path="/upload" element={
              <ProtectedRoute>
                <Upload />
              </ProtectedRoute>
            } />
            <Route path="/ai-insights" element={
              <ProtectedRoute>
                <AIInsights />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/about" element={<About />} />
            <Route path="/auth" element={<AuthWrapper />} />
          </Routes>
        </AnimatePresence>
      </Box>
      
      {/* Footer */}
      <Footer />
    </Box>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
