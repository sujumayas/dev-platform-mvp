import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import storyService from '../../services/storyService';
import userService from '../../services/userService';

/**
 * Component for assigning stories to users
 */
const StoryAssign = ({ story, onAssign, onError }) => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(story.assigned_to || story.created_by);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const data = await userService.getUsers();
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        // Set a default users array with at least the creator and assignee
        const defaultUsers = [];
        
        // If we have creator info, add it
        if (story.created_by) {
          defaultUsers.push({
            id: story.created_by,
            name: 'Creator',
            email: 'creator@example.com'
          });
        }
        
        // If we have assignee info and it's different from creator, add it
        if (story.assigned_to && story.assigned_to !== story.created_by) {
          defaultUsers.push({
            id: story.assigned_to,
            name: 'Current Assignee',
            email: 'assignee@example.com'
          });
        }
        
        setUsers(defaultUsers);
        onError('Could not load user list. Using default users.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [onError, story.created_by, story.assigned_to]);

  // Handle assign story
  const handleAssign = async () => {
    if (!selectedUserId) return;

    try {
      setIsSubmitting(true);
      const updatedStory = await storyService.assignStory(story.id, selectedUserId);
      if (onAssign) {
        onAssign(updatedStory);
      }
    } catch (error) {
      console.error('Failed to assign story:', error);
      onError('Failed to assign story. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <h3 className="text-lg font-medium mb-3">Assigned To</h3>
      
      {isLoading ? (
        <div className="py-2 flex items-center text-sm text-gray-500">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading users...
        </div>
      ) : (
        <>
          <div className="mb-4">
            <label htmlFor="user-select" className="block text-sm font-medium text-gray-700 mb-1">
              Select user
            </label>
            <select
              id="user-select"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={selectedUserId || ''}
              onChange={(e) => setSelectedUserId(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name || user.email}
                </option>
              ))}
            </select>
          </div>
          
          <button
            type="button"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            onClick={handleAssign}
            disabled={!selectedUserId || selectedUserId === story.assigned_to || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Assigning...
              </>
            ) : (
              'Assign User'
            )}
          </button>
        </>
      )}
      
      {/* Current assignee display */}
      {story.assigned_to && (
        <div className="mt-3 text-sm text-gray-500">
          <span className="block">Currently assigned to:</span>
          <span className="font-medium text-gray-700">
            {users.find(u => u.id === story.assigned_to)?.name || 
             users.find(u => u.id === story.assigned_to)?.email || 
             'Loading...'}
          </span>
        </div>
      )}
    </div>
  );
};

StoryAssign.propTypes = {
  story: PropTypes.object.isRequired,
  onAssign: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

export default StoryAssign;
