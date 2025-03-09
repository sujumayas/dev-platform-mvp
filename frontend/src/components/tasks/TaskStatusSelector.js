import React, { useState, useRef, useEffect } from 'react';
import { getTaskStatusLabel, getNextAvailableStatuses } from '../../utils/taskStatusConfig';
import TaskStatusBadge from './TaskStatusBadge';

/**
 * Component for selecting a task status
 */
const TaskStatusSelector = ({ taskId, currentStatus, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Available statuses
  const availableStatuses = getNextAvailableStatuses(currentStatus);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle status change
  const handleStatusChange = (newStatus) => {
    if (newStatus !== currentStatus) {
      onStatusChange(taskId, newStatus);
    }
    setIsOpen(false);
  };
  
  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div>
        <button
          type="button"
          className="inline-flex items-center text-sm focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <TaskStatusBadge status={currentStatus} />
          
          <svg className="ml-1 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {availableStatuses.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`block w-full px-4 py-2 text-left text-sm ${currentStatus === status ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                role="menuitem"
              >
                <TaskStatusBadge status={status} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskStatusSelector;
