/**
 * Extracts a user-friendly error message from an API error
 * @param {Error} error - The error object from Axios or other sources
 * @param {string} defaultMessage - Default message to display if extraction fails
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error, defaultMessage = 'An error occurred. Please try again.') => {
  if (!error) {
    return defaultMessage;
  }

  // Handle Axios error response
  if (error.response) {
    // The server responded with a status code outside of 2xx range
    const { data, status } = error.response;
    
    // Check if there's a detail message in the response
    if (data && data.detail) {
      return data.detail;
    }

    // Check if there's a message in the response
    if (data && data.message) {
      return data.message;
    }

    // Return status-based message
    if (status === 401) {
      return 'Authentication failed. Please check your credentials.';
    } else if (status === 403) {
      return 'You do not have permission to perform this action.';
    } else if (status === 404) {
      return 'The requested resource was not found.';
    } else if (status === 500) {
      return 'Server error. Please try again later.';
    }
  }

  // Handle request errors (network errors)
  if (error.request && !error.response) {
    return 'Network error. Please check your internet connection.';
  }

  // Handle explicit error message
  if (error.message) {
    return error.message;
  }

  // Default to the provided message
  return defaultMessage;
};

/**
 * Logs an error with additional context
 * @param {Error} error - The error object
 * @param {string} context - Additional context about where the error occurred
 */
export const logError = (error, context = '') => {
  console.error(`Error ${context ? `in ${context}` : ''}:`, error);
  
  if (error.response) {
    console.error('Response data:', error.response.data);
    console.error('Response status:', error.response.status);
  }
};
