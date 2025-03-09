import api from './api';

/**
 * Service for managing tasks
 */
const taskService = {
  /**
   * Create a new task
   * @param {Object} taskData - Task data with title, description, and story_id
   * @returns {Promise} - Promise resolving to the created task
   * @throws {ValidationError} - When validation fails
   */
  createTask: async (taskData) => {
    try {
      console.log('Creating task with data:', taskData);
      const response = await api.post('/tasks/', taskData);
      console.log('Task created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error.response?.data || error.message);
      
      // Format validation errors
      if (error.response?.status === 422 && error.response?.data?.detail) {
        const validationErrors = {};
        error.response.data.detail.forEach(err => {
          const field = err.loc[err.loc.length - 1];
          validationErrors[field] = err.msg;
        });
        
        const validationError = new Error('Validation failed');
        validationError.validationErrors = validationErrors;
        throw validationError;
      }
      
      throw error;
    }
  },

  /**
   * Get tasks for a specific story
   * @param {string} storyId - ID of the story to get tasks for
   * @returns {Promise} - Promise resolving to array of tasks
   */
  getTasksByStory: async (storyId) => {
    try {
      const response = await api.get(`/tasks/story/${storyId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  /**
   * Update task status
   * @param {string} taskId - ID of the task to update
   * @param {string} status - New status (TODO, DEVELOPMENT, COMPLETE)
   * @returns {Promise} - Promise resolving to updated task
   */
  updateTaskStatus: async (taskId, status) => {
    try {
      const response = await api.put(`/tasks/${taskId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  },
  
  /**
   * Update task details (title, description)
   * @param {string} taskId - ID of the task to update
   * @param {Object} taskData - Data to update (title, description)
   * @returns {Promise} - Promise resolving to updated task
   * @throws {ValidationError} - When validation fails
   */
  updateTask: async (taskId, taskData) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, taskData);
      return response.data;
    } catch (error) {
      console.error('Error updating task:', error);
      
      // Format validation errors
      if (error.response?.status === 422 && error.response?.data?.detail) {
        const validationErrors = {};
        error.response.data.detail.forEach(err => {
          const field = err.loc[err.loc.length - 1];
          validationErrors[field] = err.msg;
        });
        
        const validationError = new Error('Validation failed');
        validationError.validationErrors = validationErrors;
        throw validationError;
      }
      
      throw error;
    }
  },
  
  /**
   * Assign a task to a user
   * @param {string} taskId - ID of the task to assign
   * @param {string} userId - ID of the user to assign to (null to unassign)
   * @returns {Promise} - Promise resolving to updated task
   */
  assignTask: async (taskId, userId) => {
    try {
      const response = await api.put(`/tasks/${taskId}/assign`, { assignee_id: userId });
      return response.data;
    } catch (error) {
      console.error('Error assigning task:', error);
      throw error;
    }
  },
  
  /**
   * Delete a task
   * @param {string} taskId - ID of the task to delete
   * @returns {Promise} - Promise resolving when task is deleted
   */
  deleteTask: async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }
};

export default taskService;
