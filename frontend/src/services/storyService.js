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
  },
  
  /**
   * Update story details (title, description, etc.)
   * @param {string} storyId - ID of the story to update
   * @param {Object} storyData - Data to update (title, description, etc.)
   * @returns {Promise} - Promise resolving to updated story
   */
  updateStory: async (storyId, storyData) => {
    try {
      const response = await api.put(`/stories/${storyId}`, storyData);
      return response.data;
    } catch (error) {
      console.error('Error updating story:', error);
      throw error;
    }
  },
  
  /**
   * Assign a story to a user
   * @param {string} storyId - ID of the story to assign
   * @param {string} userId - ID of the user to assign to
   * @returns {Promise} - Promise resolving to updated story
   */
  assignStory: async (storyId, userId) => {
    try {
      const response = await api.put(`/stories/${storyId}/assign`, { assigned_to: userId });
      return response.data;
    } catch (error) {
      console.error('Error assigning story:', error);
      throw error;
    }
  },
  
  /**
   * Delete a story
   * @param {string} storyId - ID of the story to delete
   * @returns {Promise} - Promise resolving when story is deleted
   */
  deleteStory: async (storyId) => {
    try {
      await api.delete(`/stories/${storyId}`);
      return true;
    } catch (error) {
      console.error('Error deleting story:', error);
      throw error;
    }
  },
  
  /**
   * Get a single story by ID
   * @param {string} storyId - ID of the story to retrieve
   * @returns {Promise} - Promise resolving to the story
   */
  getStoryById: async (storyId) => {
    try {
      const response = await api.get(`/stories/${storyId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching story:', error);
      throw error;
    }
  },

  /**
   * Update a story with a design image URL
   * @param {string} storyId - ID of the story to update
   * @param {string} designUrl - URL of the design image
   * @returns {Promise} - Promise resolving to updated story
   */
  updateStoryDesign: async (storyId, designUrl) => {
    try {
      console.log(`Updating story ${storyId} with design URL:`, designUrl);
      const response = await api.put(`/stories/${storyId}/design`, { design_url: designUrl });
      console.log('Story design updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating story design:', error);
      throw error;
    }
  },

  /**
   * Generate a description from a story's design image using Claude
   * @param {string} storyId - ID of the story with the design to analyze
   * @returns {Promise} - Promise resolving to the generated description
   */
  analyzeDesign: async (storyId) => {
    try {
      console.log(`Analyzing design for story ID: ${storyId}`);
      const response = await api.post(`/stories/${storyId}/analyze-design`);
      console.log('Design analysis response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error analyzing design:', error);
      throw error;
    }
  }
};

export default storyService;