/**
 * Main application component that sets up routing and authentication context
 */import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Home from './pages/Home';
import Stories from './pages/Stories';
import Dashboard from './pages/Dashboard';
import TestDesignFeature from './pages/TestDesignFeature';

function App() {
  return (
    <AuthProvider>
      {/* Set up routing */}
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes that require authentication */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/stories" element={<Stories />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/test-design" element={<TestDesignFeature />} />
            {/* Add more protected routes here */}
          </Route>
          
          {/* Redirect any unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
