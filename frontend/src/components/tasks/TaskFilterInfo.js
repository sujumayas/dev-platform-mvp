import React from 'react';
import { getTaskStatusLabel } from '../../utils/taskStatusConfig';

/**
 * Component to display information about the current task filtering
 */
const TaskFilterInfo = ({ filteredCount, totalCount, filters, users }) => {
  if (filteredCount === totalCount && !filters.status && !filters.assignee && !filters.search) {
    return null; // No active filters, don't show anything
  }
  
  // Build filter description
  const filterDescriptions = [];
  
  if (filters.status) {
    filterDescriptions.push(`status "${getTaskStatusLabel(filters.status)}"`);
  }
  
  if (filters.assignee) {
    if (filters.assignee === 'unassigned') {
      filterDescriptions.push('unassigned tasks');
    } else {
      const user = users.find(u => u.id === filters.assignee);
      const userName = user ? (user.name || user.email) : 'selected user';
      filterDescriptions.push(`assigned to ${userName}`);
    }
  }
  
  if (filters.search) {
    filterDescriptions.push(`matching "${filters.search}"`);
  }
  
  const filterText = filterDescriptions.length > 0
    ? `filtered by ${filterDescriptions.join(' and ')}`
    : '';
  
  return (
    <div className="text-sm text-gray-500 mb-3">
      Showing {filteredCount} of {totalCount} tasks {filterText}
    </div>
  );
};

export default TaskFilterInfo;
