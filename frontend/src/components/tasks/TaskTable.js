import React from 'react';
import { getTaskStatusLabel, getNextAvailableStatuses } from '../../utils/taskStatusConfig';
import TaskStatusBadge from './TaskStatusBadge';
import TaskStatusSelector from './TaskStatusSelector';
import TaskAssigneeBadge from './TaskAssigneeBadge';

/**
 * Component for displaying tasks in a table
 */
const TaskTable = ({ tasks, users = [], onEditTask, onDeleteTask, onStatusChange, onAssignTask }) => {
  // Return message if no tasks
  if (!tasks || tasks.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 text-center border border-gray-200">
        <p className="text-gray-500">No tasks have been added to this story yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow w-full">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
              Title
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/6">
              Description
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
              Assigned To
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tasks.map((task) => (
            <tr key={task.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {task.title}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 max-w-sm truncate">
                {task.description}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <TaskStatusSelector
                  taskId={task.id}
                  currentStatus={task.status}
                  onStatusChange={onStatusChange}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <div className="flex items-center justify-between">
                  <TaskAssigneeBadge assignee={task.assignee} users={users} />
                  
                  <button
                    onClick={() => onAssignTask(task.id)}
                    className="text-xs text-blue-600 hover:text-blue-800 ml-2"
                  >
                    {task.assignee ? 'Reassign' : 'Assign'}
                  </button>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => onEditTask(task)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskTable;
