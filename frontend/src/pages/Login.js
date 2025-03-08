import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import Notification from '../components/Notification';
import { getErrorMessage, logError } from '../utils/errorHandler';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notification, setNotification] = useState({ type: '', message: '' });
  const { login, isAuthenticated, loading, error } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect to home
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification({ type: '', message: '' });

    // Simple form validation
    if (!email.trim()) {
      setNotification({ type: 'error', message: 'Email is required' });
      return;
    }
    if (!password.trim()) {
      setNotification({ type: 'error', message: 'Password is required' });
      return;
    }

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      } else {
        setNotification({ 
          type: 'error', 
          message: 'Login failed. Please check your credentials.' 
        });
      }
    } catch (err) {
      logError(err, 'login');
      setNotification({ 
        type: 'error', 
        message: getErrorMessage(err, 'Login failed. Please check your credentials.') 
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Developer Platform</h1>
          <p className="text-gray-600 mb-6">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          {(notification.message || error) && (
            <Notification 
              type={notification.type || 'error'}
              message={notification.message || error}
              onClose={() => setNotification({ type: '', message: '' })}
            />
          )}

          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-b-transparent rounded-full"></div>
                Signing In...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
