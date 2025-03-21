import api from './api';

/**
 * Service for fetching dashboard-related data from the API
 */
const dashboardService = {
  /**
   * Retry a dashboard API call with a fresh auth token
   * @param {Function} apiCall - Function to retry
   * @returns {Promise} - Promise resolving to the API response
   */
  retryWithAuth: async (apiCall) => {
    try {
      // First try the original call
      return await apiCall();
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // If unauthorized, try to refresh auth by forcing a new user profile fetch
        try {
          // Import here to avoid circular dependencies
          const authService = await import('./authService');
          if (authService.default.isAuthenticated()) {
            const userData = await authService.default.getCurrentUser();
            if (userData) {
              // If we got user data, retry the original API call
              return await apiCall();
            }
          }
        } catch (refreshError) {
          console.error('Failed to refresh authentication:', refreshError);
        }
      }
      throw error;
    }
  },
  /**
   * Get overall dashboard summary data
   * @returns {Promise} Promise object with dashboard summary data
   */
  getDashboardSummary: async () => {
    const apiCall = async () => {
      const response = await api.get('/api/dashboard/summary');
      return response.data;
    };
    
    try {
      return await dashboardService.retryWithAuth(apiCall);
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      throw error;
    }
  },

  /**
   * Get story status counts 
   * @returns {Promise} Promise object with story counts by status
   */
  getStatusCounts: async () => {
    try {
      const response = await api.get('/api/dashboard/status-counts');
      return response.data;
    } catch (error) {
      console.error('Error fetching status counts:', error);
      throw error;
    }
  },

  /**
   * Get team performance metrics
   * @returns {Promise} Promise object with team performance data
   */
  getTeamMetrics: async () => {
    try {
      const response = await api.get('/api/dashboard/team-metrics');
      return response.data;
    } catch (error) {
      console.error('Error fetching team metrics:', error);
      throw error;
    }
  },

  /**
   * Get recent activity feed
   * @returns {Promise} Promise object with recent activities
   */
  getRecentActivity: async () => {
    try {
      const response = await api.get('/api/dashboard/recent-activity');
      return response.data;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  },

  /**
   * Get upcoming deadlines
   * @returns {Promise} Promise object with upcoming deadline data
   */
  getUpcomingDeadlines: async () => {
    try {
      const response = await api.get('/api/dashboard/deadlines');
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming deadlines:', error);
      throw error;
    }
  },

  /**
   * Get Gherkin specification coverage statistics
   * @returns {Promise} Promise object with Gherkin coverage data
   */
  getGherkinCoverage: async () => {
    try {
      const response = await api.get('/api/dashboard/gherkin-coverage');
      return response.data;
    } catch (error) {
      console.error('Error fetching Gherkin coverage:', error);
      throw error;
    }
  }
};

export default dashboardService;
