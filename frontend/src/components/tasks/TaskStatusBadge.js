import React from 'react';
import { getTaskStatusLabel, getTaskStatusColor, getTaskStatusIcon } from '../../utils/taskStatusConfig';

/**
 * Component to display a task status badge with icon and label
 */
const TaskStatusBadge = ({ status, size = 'sm' }) => {
  // Determine size classes
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };
  
  const iconSizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };
  
  // Get icon class
  const iconClass = `${iconSizeClasses[size]} mr-1`;
  
  return (
    <span 
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} ${getTaskStatusColor(status)}`}
    >
      {getTaskStatusIcon(status) && (
        <span className={iconClass}>{getTaskStatusIcon(status)}</span>
      )}
      {getTaskStatusLabel(status)}
    </span>
  );
};

export default TaskStatusBadge;
