import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing session on app load
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('neptuneai_token');
        if (token) {
          // Validate token with backend
          const response = await fetch('/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setAuthenticated(true);
          } else {
            localStorage.removeItem('neptuneai_token');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('neptuneai_token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('neptuneai_token', data.token);
        setUser(data.user);
        setAuthenticated(true);
        toast.success('Login successful!');
        navigate('/analytics');
        return { success: true };
      } else {
        const error = await response.json();
        toast.error(error.message || 'Login failed');
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      return { success: false, error: 'Network error' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password) => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Registration successful! Please login.');
        return { success: true };
      } else {
        const error = await response.json();
        toast.error(error.message || 'Registration failed');
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
      return { success: false, error: 'Network error' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('neptuneai_token');
    setUser(null);
    setAuthenticated(false);
    toast.success('Logged out successfully');
    navigate('/');
  };

  const updateProfile = async (profileData) => {
    try {
      const token = localStorage.getItem('neptuneai_token');
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        toast.success('Profile updated successfully');
        return { success: true };
      } else {
        const error = await response.json();
        toast.error(error.message || 'Profile update failed');
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Profile update failed. Please try again.');
      return { success: false, error: 'Network error' };
    }
  };

  const value = {
    user,
    authenticated,
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
