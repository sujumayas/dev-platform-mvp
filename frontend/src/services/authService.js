import api from './api';

// Login user and get token
const login = async (email, password) => {
  try {
    // The backend expects username and password as form data
    const params = new URLSearchParams();
    params.append('username', email); // Backend uses username for email
    params.append('password', password);

    // Use application/x-www-form-urlencoded content type with URLSearchParams
    const response = await api.post('/auth/login', params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    console.log('Login response:', response.data);
    
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Logout user
const logout = async () => {
  try {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    // Even if the server call fails, we still want to remove the token
    localStorage.removeItem('token');
    return false;
  }
};

// Get current user profile
const getCurrentUser = async () => {
  try {
    console.log('Getting current user...');
    console.log('Token:', localStorage.getItem('token'));
    
    const response = await api.get('/users/profile');
    console.log('User profile response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Get user error:', error.response || error);
    return null;
  }
};

// Check if user is authenticated
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  console.log('Checking if authenticated, token:', token ? 'exists' : 'missing');
  return Boolean(token);
};

const authService = {
  login,
  logout,
  getCurrentUser,
  isAuthenticated,
};

export default authService;
