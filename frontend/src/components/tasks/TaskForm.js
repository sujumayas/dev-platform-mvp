import React, { useState, useEffect } from 'react';

/**
 * Task form component for creating and editing tasks
 */
const TaskForm = ({ storyId, onSubmit, onCancel, isSubmitting, initialData = null, isEditing = false }) => {
  // Default state for a single task
  const defaultTask = {
    title: '',
    description: '',
  };

  // State for the tasks being created (array when creating multiple)
  const [tasks, setTasks] = useState([{ ...defaultTask }]);
  
  // State for validation errors
  const [errors, setErrors] = useState({});

  // Initialize form with initial data (for editing)
  useEffect(() => {
    if (initialData && isEditing) {
      setTasks([initialData]);
    }
  }, [initialData, isEditing]);

  // Validate a single task
  const validateTask = (task, index) => {
    const taskErrors = {};
    
    if (!task.title || task.title.trim() === '') {
      taskErrors.title = 'Title is required';
    } else if (task.title.length > 100) {
      taskErrors.title = 'Title cannot exceed 100 characters';
    }
    
    if (!task.description || task.description.trim() === '') {
      taskErrors.description = 'Description is required';
    } else if (task.description.length > 500) {
      taskErrors.description = 'Description cannot exceed 500 characters';
    }
    
    return taskErrors;
  };
  
  // Validate all tasks
  const validateAllTasks = () => {
    const newErrors = {};
    let isValid = true;
    
    tasks.forEach((task, index) => {
      const taskErrors = validateTask(task, index);
      if (Object.keys(taskErrors).length > 0) {
        newErrors[index] = taskErrors;
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Clear error for a specific field
  const clearError = (index, field) => {
    if (errors[index] && errors[index][field]) {
      const newErrors = { ...errors };
      delete newErrors[index][field];
      if (Object.keys(newErrors[index]).length === 0) {
        delete newErrors[index];
      }
      setErrors(newErrors);
    }
  };

  // Add a new task field
  const addTask = () => {
    setTasks([...tasks, { ...defaultTask }]);
  };

  // Remove a task field
  const removeTask = (index) => {
    const updatedTasks = [...tasks];
    updatedTasks.splice(index, 1);
    setTasks(updatedTasks);
    
    // Also remove any errors for this task
    if (errors[index]) {
      const newErrors = { ...errors };
      delete newErrors[index];
      
      // Adjust error indices for tasks after the removed one
      Object.keys(newErrors).forEach(key => {
        const errorIndex = parseInt(key);
        if (errorIndex > index) {
          newErrors[errorIndex - 1] = newErrors[errorIndex];
          delete newErrors[errorIndex];
        }
      });
      
      setErrors(newErrors);
    }
  };

  // Handle input changes for a specific task
  const handleInputChange = (index, field, value) => {
    const updatedTasks = [...tasks];
    updatedTasks[index] = { ...updatedTasks[index], [field]: value };
    setTasks(updatedTasks);
    
    // Clear error for this field if it exists
    clearError(index, field);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all tasks before submission
    if (!validateAllTasks()) {
      return;
    }
    
    if (isEditing) {
      // When editing, we're only dealing with a single task
      onSubmit({ ...tasks[0] });
    } else {
      // When creating, prepare each task with the story ID
      const tasksToSubmit = tasks.map(task => ({
        ...task,
        story_id: storyId
      }));
      
      onSubmit(tasksToSubmit);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {tasks.map((task, index) => (
        <div key={index} className="bg-gray-50 p-4 rounded-md mb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-md font-medium">
              {isEditing ? 'Edit Task' : `Task ${index + 1}`}
            </h3>
            
            {!isEditing && tasks.length > 1 && (
              <button
                type="button"
                onClick={() => removeTask(index)}
                className="text-red-500 hover:text-red-700"
                aria-label="Remove task"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
          
          <div className="mb-3">
            <label htmlFor={`title-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              id={`title-${index}`}
              type="text"
              value={task.title}
              onChange={(e) => handleInputChange(index, 'title', e.target.value)}
              className={`w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors[index]?.title ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="Enter task title"
            />
            {errors[index]?.title && (
              <p className="mt-1 text-sm text-red-600">{errors[index].title}</p>
            )}
          </div>
          
          <div className="mb-3">
            <label htmlFor={`description-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id={`description-${index}`}
              value={task.description}
              onChange={(e) => handleInputChange(index, 'description', e.target.value)}
              className={`w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors[index]?.description ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="Enter task description"
              rows="3"
            />
            {errors[index]?.description && (
              <p className="mt-1 text-sm text-red-600">{errors[index].description}</p>
            )}
          </div>
        </div>
      ))}
      
      {!isEditing && (
        <button
          type="button"
          onClick={addTask}
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
          Add Another Task
        </button>
      )}
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isEditing ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            isEditing ? 'Update Task' : 'Create Tasks'
          )}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
