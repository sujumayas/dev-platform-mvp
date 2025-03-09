import React from 'react';

/**
 * Component to display task assignee information
 */
const TaskAssigneeBadge = ({ assignee, users = [] }) => {
  // If not assigned, show unassigned badge
  if (!assignee) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
        Unassigned
      </span>
    );
  }

  // Find the user in the users array
  const user = users.find(u => u.id === assignee);
  
  // Display name or ID if user not found
  const displayName = user 
    ? (user.name || user.email) 
    : `ID: ${assignee.toString().substring(0, 6)}...`;
  
  // Get first character for avatar
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex items-center">
      <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-xs font-medium mr-2">
        {initial}
      </span>
      <span className="text-sm font-medium">
        {displayName}
      </span>
    </div>
  );
};

export default TaskAssigneeBadge;
