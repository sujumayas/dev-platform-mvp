/**
 * Configuration for story status display
 * Maps status enum values to display labels and styles
 */
const STATUS_CONFIG = {
  DRAFT: { 
    label: 'Draft', 
    color: 'bg-gray-100 text-gray-800',
    description: 'Initial creation phase'
  },
  READY_FOR_REFINEMENT: { 
    label: 'Ready for Refinement', 
    color: 'bg-blue-100 text-blue-800',
    description: 'Ready to be refined with more details'
  },
  REFINED: { 
    label: 'Refined', 
    color: 'bg-indigo-100 text-indigo-800',
    description: 'Fully specified with acceptance criteria'
  },
  DEVELOPMENT: { 
    label: 'Development', 
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Currently being implemented'
  },
  READY_FOR_TESTING: { 
    label: 'Ready for Testing', 
    color: 'bg-orange-100 text-orange-800',
    description: 'Implementation complete, ready for QA'
  },
  READY_FOR_PRODUCTION: { 
    label: 'Ready for Production', 
    color: 'bg-green-100 text-green-800',
    description: 'Tested and ready for deployment'
  },
};

/**
 * Get a formatted status label
 * @param {string} status - Status enum value
 * @returns {string} Formatted status label
 */
export const getStatusLabel = (status) => {
  return STATUS_CONFIG[status]?.label || status?.replace(/_/g, ' ') || 'Unknown';
};

/**
 * Get the CSS class for a status
 * @param {string} status - Status enum value
 * @returns {string} CSS class for the status
 */
export const getStatusColor = (status) => {
  return STATUS_CONFIG[status]?.color || 'bg-gray-100 text-gray-800';
};

/**
 * Get all status options as an array
 * @returns {Array} Array of status objects with value, label, and color
 */
export const getStatusOptions = () => {
  return Object.entries(STATUS_CONFIG).map(([value, config]) => ({
    value,
    label: config.label,
    color: config.color,
    description: config.description
  }));
};

export default STATUS_CONFIG;
