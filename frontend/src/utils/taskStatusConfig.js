/**
 * Utility functions for task status display and management
 */

/**
 * Get a human-readable label for a task status
 * @param {string} status - The status enum value
 * @returns {string} - The human-readable label
 */
export const getTaskStatusLabel = (status) => {
  switch (status) {
    case 'TODO':
      return 'To Do';
    case 'DEVELOPMENT':
      return 'In Development';
    case 'COMPLETE':
      return 'Complete';
    default:
      return status ? status.replace('_', ' ') : 'Unknown';
  }
};

/**
 * Get CSS classes for styling based on status
 * @param {string} status - The status enum value
 * @returns {string} - CSS classes for styling
 */
export const getTaskStatusColor = (status) => {
  switch (status) {
    case 'TODO':
      return 'bg-gray-100 text-gray-800';
    case 'DEVELOPMENT':
      return 'bg-blue-100 text-blue-800';
    case 'COMPLETE':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Get an icon component for the status
 * @param {string} status - The status enum value
 * @returns {JSX.Element} - Icon component
 */
export const getTaskStatusIcon = (status) => {
  switch (status) {
    case 'TODO':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      );
    case 'DEVELOPMENT':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      );
    case 'COMPLETE':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    default:
      return null;
  }
};

/**
 * Get next available statuses based on current status
 * @param {string} currentStatus - The current status
 * @returns {Array} - Array of available next statuses
 */
export const getNextAvailableStatuses = (currentStatus) => {
  switch (currentStatus) {
    case 'TODO':
      return ['DEVELOPMENT'];
    case 'DEVELOPMENT':
      return ['TODO', 'COMPLETE'];
    case 'COMPLETE':
      return ['DEVELOPMENT'];
    default:
      return ['TODO', 'DEVELOPMENT', 'COMPLETE'];
  }
};
