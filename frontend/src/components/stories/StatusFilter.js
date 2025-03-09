import React from 'react';
import STATUS_CONFIG, { getStatusOptions, getStatusLabel, getStatusColor } from '../../utils/statusConfig';

/**
 * Status filter component for user stories
 * @param {Object} props - Component props
 * @param {string} props.selectedStatus - Currently selected status
 * @param {Function} props.onChange - Handler for status change
 * @param {boolean} props.disabled - Whether the filter is disabled
 */
const StatusFilter = ({ selectedStatus, onChange, disabled = false }) => {
  // Status options based on the backend enum
  const statusOptions = [
    { value: '', label: 'All Statuses', color: '' },
    ...getStatusOptions()
  ];

  return (
    <div className="flex items-center">
      <label htmlFor="status-filter" className="mr-2 font-medium text-gray-700">
        Filter by Status:
      </label>
      <select
        id="status-filter"
        value={selectedStatus}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`form-select rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Current filter badge - shown only when a filter is active */}
      {selectedStatus && (
        <div className="ml-2 flex items-center">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedStatus)}`}>
            {getStatusLabel(selectedStatus)}
          </span>
          <button 
            onClick={() => onChange('')}
            className="ml-1 text-gray-400 hover:text-gray-600"
            title="Clear filter"
            disabled={disabled}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default StatusFilter;
