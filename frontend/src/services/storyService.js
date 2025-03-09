import api from './api';

/**
 * Service for managing user stories
 */
const storyService = {
  /**
   * Create a new user story
   * @param {Object} storyData - Story data with title and description
   * @returns {Promise} - Promise resolving to the created story
   */
  createStory: async (storyData) => {
    try {
      console.log('Creating story with data:', storyData);
      const response = await api.post('/stories/', storyData);
      console.log('Story created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating story:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get all stories with optional filters
   * @param {Object} filters - Optional filters (status, keyword, assignee)
   * @returns {Promise} - Promise resolving to array of stories
   */
  getStories: async (filters = {}) => {
    try {
      const response = await api.get('/stories/', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching stories:', error);
      throw error;
    }
  },

  /**
   * Update story status
   * @param {string} storyId - ID of the story to update
   * @param {string} status - New status
   * @returns {Promise} - Promise resolving to updated story
   */
  updateStoryStatus: async (storyId, status) => {
    try {
      const response = await api.put(`/stories/${storyId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating story status:', error);
      throw error;
    }
  }
};

export default storyService;
