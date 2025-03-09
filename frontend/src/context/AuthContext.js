/**
 * Authentication Context
 * 
 * Provides authentication state and methods throughout the application.
 * Handles user authentication, loading states, and errors.
 */
import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

// Create context
const AuthContext = createContext(null);

/**
 * Auth Provider Component
 * 
 * Wraps the application to provide authentication context to all children.
 * Manages user state, loading state, and authentication methods.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user data on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      try {
        if (authService.isAuthenticated()) {
          const userData = await authService.getCurrentUser();
          if (userData) {
            setUser(userData);
          } else {
            // If we couldn't get user data despite having a token, clear the token
            localStorage.removeItem('token');
          }
        }
      } catch (err) {
        setError('Failed to load user data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const success = await authService.login(email, password);
      console.log('Login success:', success);
      if (success) {
        const userData = await authService.getCurrentUser();
        console.log('User data:', userData);
        setUser(userData);
        return true;
      }
      return false;
    } catch (err) {
      setError('Invalid email or password');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } catch (err) {
      setError('Failed to logout');
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: authService.isAuthenticated(), // Use direct check from authService
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use the authentication context
 * Makes it easier to access auth context values in components
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
