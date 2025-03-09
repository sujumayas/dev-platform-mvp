import React, { useState, useEffect } from 'react';
import TaskForm from './TaskForm';
import TaskTable from './TaskTable';
import TaskAssign from './TaskAssign';
import TaskAssigneeBadge from './TaskAssigneeBadge';
import TaskFilter from './TaskFilter';
import TaskFilterInfo from './TaskFilterInfo';
import taskService from '../../services/taskService';
import userService from '../../services/userService';

/**
 * Component for managing tasks within a story
 */
const TaskSection = ({ storyId, onError }) => {
  const [allTasks, setAllTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(null);
  const [filters, setFilters] = useState({ status: '', assignee: '', search: '' });

  // Fetch tasks when component mounts or story ID changes
  useEffect(() => {
    const fetchTasks = async () => {
      if (!storyId) return;
      
      try {
        setIsLoading(true);
        const fetchedTasks = await taskService.getTasksByStory(storyId);
        setAllTasks(fetchedTasks);
        setFilteredTasks(fetchedTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        onError('Failed to load tasks. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [storyId, onError]);

  // Apply filters when tasks or filters change
  useEffect(() => {
    if (!allTasks.length) return;
    
    let result = [...allTasks];
    
    // Apply status filter
    if (filters.status) {
      result = result.filter(task => task.status === filters.status);
    }
    
    // Apply assignee filter
    if (filters.assignee) {
      if (filters.assignee === 'unassigned') {
        result = result.filter(task => !task.assignee);
      } else {
        result = result.filter(task => task.assignee === filters.assignee);
      }
    }
    
    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(task => 
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredTasks(result);
  }, [allTasks, filters]);

  // Fetch users for assignment
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const fetchedUsers = await userService.getUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        onError('Failed to load users for assignment. Please try again.');
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [onError]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Handle creating multiple tasks
  const handleCreateTasks = async (tasksData) => {
    try {
      setIsSubmitting(true);
      
      // Create each task one by one
      const createdTasks = [];
      for (const taskData of tasksData) {
        try {
          const newTask = await taskService.createTask(taskData);
          createdTasks.push(newTask);
        } catch (error) {
          // Handle validation errors
          if (error.validationErrors) {
            onError(`Validation error: ${Object.values(error.validationErrors).join(', ')}`);
          } else {
            throw error; // Re-throw if it's not a validation error
          }
        }
      }
      
      if (createdTasks.length > 0) {
        // Update state with new tasks
        const updatedTasks = [...allTasks, ...createdTasks];
        setAllTasks(updatedTasks);
        
        // Hide form and reset
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error creating tasks:', error);
      onError('Failed to create tasks. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle updating a task
  const handleUpdateTask = async (taskData) => {
    if (!taskToEdit) return;
    
    try {
      setIsSubmitting(true);
      
      const updatedTask = await taskService.updateTask(taskToEdit.id, taskData);
      
      // Update state
      const updatedTasks = allTasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      );
      setAllTasks(updatedTasks);
      
      // Reset edit state
      setTaskToEdit(null);
    } catch (error) {
      // Handle validation errors
      if (error.validationErrors) {
        onError(`Validation error: ${Object.values(error.validationErrors).join(', ')}`);
      } else {
        console.error('Error updating task:', error);
        onError('Failed to update task. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle task status change
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const updatedTask = await taskService.updateTaskStatus(taskId, newStatus);
      
      // Update state
      const updatedTasks = allTasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      );
      setAllTasks(updatedTasks);
    } catch (error) {
      console.error('Error updating task status:', error);
      onError('Failed to update task status. Please try again.');
    }
  };

  // Handle task assignment
  const handleTaskAssignment = async (updatedTask) => {
    // Update state
    const updatedTasks = allTasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    );
    setAllTasks(updatedTasks);
    
    // Hide the assign modal
    setShowAssignModal(null);
  };

  // Handle deleting a task
  const handleDeleteTask = async (taskId) => {
    try {
      await taskService.deleteTask(taskId);
      
      // Update state
      const updatedTasks = allTasks.filter(task => task.id !== taskId);
      setAllTasks(updatedTasks);
      
      // Reset delete confirmation
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting task:', error);
      onError('Failed to delete task. Please try again.');
    }
  };

  // Toggle add form visibility
  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
    
    // If we're hiding the form, also reset the task to edit
    if (showAddForm) {
      setTaskToEdit(null);
    }
  };

  // Handle edit task
  const handleEditTask = (task) => {
    setTaskToEdit(task);
    setShowAddForm(true);
  };

  // Handle cancel form
  const handleCancelForm = () => {
    setShowAddForm(false);
    setTaskToEdit(null);
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Tasks</h3>
        <button
          onClick={toggleAddForm}
          className="text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-md"
        >
          {showAddForm ? 'Cancel' : taskToEdit ? 'Edit Task' : 'Add Tasks'}
        </button>
      </div>

      {/* Task Filter */}
      <TaskFilter 
        users={users} 
        onFilter={handleFilterChange} 
      />

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="mb-6 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h4 className="text-lg font-medium mb-4">
            {taskToEdit ? 'Edit Task' : 'Add Tasks'}
          </h4>
          <TaskForm
            storyId={storyId}
            onSubmit={taskToEdit ? handleUpdateTask : handleCreateTasks}
            onCancel={handleCancelForm}
            isSubmitting={isSubmitting}
            initialData={taskToEdit}
            isEditing={!!taskToEdit}
          />
        </div>
      )}

      {/* Task Filter Info */}
      {!isLoading && (
        <TaskFilterInfo
          filteredCount={filteredTasks.length}
          totalCount={allTasks.length}
          filters={filters}
          users={users}
        />
      )}

      {isLoading ? (
        <div className="py-10 text-center">
          <svg className="animate-spin mx-auto h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-gray-500">Loading tasks...</p>
        </div>
      ) : (
        <TaskTable
          tasks={filteredTasks}
          users={users}
          onEditTask={handleEditTask}
          onDeleteTask={(taskId) => setShowDeleteConfirm(taskId)}
          onStatusChange={handleStatusChange}
          onAssignTask={(taskId) => setShowAssignModal(taskId)}
        />
      )}

      {/* Assignment modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-lg max-w-md w-full my-8 mx-auto">
            <h3 className="text-lg font-medium mb-4">Assign Task</h3>
            
            {/* Task info */}
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <p className="font-medium">{allTasks.find(t => t.id === showAssignModal)?.title}</p>
              <p className="text-sm text-gray-600 mt-1 truncate">
                {allTasks.find(t => t.id === showAssignModal)?.description}
              </p>
            </div>

            {isLoadingUsers ? (
              <div className="py-4 text-center">
                <svg className="animate-spin mx-auto h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-2 text-sm text-gray-500">Loading users...</p>
              </div>
            ) : (
              <TaskAssign
                task={allTasks.find(t => t.id === showAssignModal)}
                users={users}
                onAssign={handleTaskAssignment}
                onError={onError}
              />
            )}

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowAssignModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-lg max-w-md w-full my-8 mx-auto">
            <h3 className="text-lg font-medium mb-3 text-red-600">Confirm Delete</h3>
            <p className="mb-4">Are you sure you want to delete this task? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                onClick={() => handleDeleteTask(showDeleteConfirm)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskSection;
