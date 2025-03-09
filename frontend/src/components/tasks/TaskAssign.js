import React, { useState, useEffect } from 'react';
import taskService from '../../services/taskService';

/**
 * Component for assigning a task to a user
 */
const TaskAssign = ({ task, users, onAssign, onError }) => {
  const [isAssigning, setIsAssigning] = useState(false);
  const [assigneeId, setAssigneeId] = useState(task?.assignee || '');

  // Update assignee ID when task changes
  useEffect(() => {
    if (task) {
      setAssigneeId(task.assignee || '');
    }
  }, [task]);

  // Handle assignment
  const handleAssign = async () => {
    try {
      setIsAssigning(true);
      const updatedTask = await taskService.assignTask(task.id, assigneeId || null);
      onAssign(updatedTask);
    } catch (error) {
      console.error('Error assigning task:', error);
      onError('Failed to assign task. Please try again.');
    } finally {
      setIsAssigning(false);
    }
  };

  // Render a simplified display if task is not provided
  if (!task) {
    return null;
  }

  return (
    <div className="flex flex-col space-y-4">
      <select
        value={assigneeId || ''}
        onChange={(e) => setAssigneeId(e.target.value)}
        className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        aria-label="Assign to user"
      >
        <option value="">Unassigned</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name || user.email}
          </option>
        ))}
      </select>

      <button
        onClick={handleAssign}
        disabled={isAssigning || assigneeId === task.assignee}
        className={`inline-flex justify-center items-center px-4 py-2 text-sm font-medium rounded-md 
          ${isAssigning || assigneeId === task.assignee
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
      >
        {isAssigning ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Assigning...
          </>
        ) : (
          assigneeId === task.assignee ? 'No Change' : assigneeId ? 'Assign User' : 'Unassign'
        )}
      </button>
    </div>
  );
};

export default TaskAssign;
