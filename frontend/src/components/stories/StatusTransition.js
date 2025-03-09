import React, { useState } from 'react';
import { getStatusOptions, getStatusLabel, getStatusColor } from '../../utils/statusConfig';
import storyService from '../../services/storyService';

/**
 * Component for transitioning a user story from one status to another
 */
const StatusTransition = ({ story, onStatusChange, onError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(story.status);
  
  const statusOptions = getStatusOptions();
  
  // Get the current status index to determine available next steps
  const currentStatusIndex = statusOptions.findIndex(
    option => option.value === story.status
  );
  
  // Determine allowed next statuses (current status and next status)
  // For simplicity in MVP, we allow moving to current or next status only
  const allowedStatuses = statusOptions.filter((option, index) => {
    return index === currentStatusIndex || index === currentStatusIndex + 1;
  });
  
  // Handle selecting a new status
  const handleStatusSelect = (e) => {
    setSelectedStatus(e.target.value);
  };
  
  // Handle submitting the status change
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Don't do anything if status didn't change
    if (selectedStatus === story.status) {
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('StatusTransition - Starting status transition from', story.status, 'to', selectedStatus);
      
      // Special case: If transitioning from DRAFT to READY_FOR_REFINEMENT, show warning
      const isDraftToRefinement = 
        story.status === 'DRAFT' && 
        selectedStatus === 'READY_FOR_REFINEMENT';
      
      if (isDraftToRefinement) {
        console.log('StatusTransition - Detected DRAFT to READY_FOR_REFINEMENT transition');
        // Just a friendly reminder about the Gherkin conversion
        const confirmTransition = window.confirm(
          'Transitioning to "Ready for Refinement" will generate Gherkin format automatically. Continue?'
        );
        
        if (!confirmTransition) {
          setIsLoading(false);
          return;
        }
      }
      
      console.log('StatusTransition - Calling API to update status');
      // Call API to update status
      const updatedStory = await storyService.updateStoryStatus(
        story.id, 
        selectedStatus
      );
      console.log('StatusTransition - API returned updated story:', updatedStory);
      
      // If transitioning from DRAFT to READY_FOR_REFINEMENT, fetch the updated story
      // to ensure we get the Gherkin content
      if (isDraftToRefinement) {
        try {
          console.log('StatusTransition - Fetching refreshed story data');
          // Fetch the updated story to get the fresh Gherkin content
          const refreshedStory = await storyService.getStoryById(story.id);
          console.log('StatusTransition - Refreshed story data:', refreshedStory);
          console.log('StatusTransition - Gherkin content available:', refreshedStory.gherkin_description ? 'Yes' : 'No');
          
          // Notify parent component of the change
          if (onStatusChange) {
            onStatusChange(refreshedStory);
          }
        } catch (refreshError) {
          console.error('Error fetching updated story:', refreshError);
          // Fall back to using the original updated story
          if (onStatusChange) {
            onStatusChange(updatedStory);
          }
        }
      } else {
        // For other transitions, just use the returned story
        if (onStatusChange) {
          onStatusChange(updatedStory);
        }
      }
    } catch (error) {
      console.error('Error updating story status:', error);
      if (onError) {
        onError('Failed to update story status. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <h3 className="text-lg font-medium mb-3">Update Status</h3>
      
      <div className="mb-3">
        <span className="text-sm text-gray-500 block mb-1">Current Status:</span>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(story.status)}`}>
          {getStatusLabel(story.status)}
        </span>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
        <div>
          <label htmlFor="status-select" className="block text-sm font-medium text-gray-700 mb-1">
            Transition to:
          </label>
          
          <select
            id="status-select"
            value={selectedStatus}
            onChange={handleStatusSelect}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            disabled={isLoading}
          >
            {allowedStatuses.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          {selectedStatus !== story.status && (
            <p className="mt-1 text-sm text-gray-500">
              {statusOptions.find(s => s.value === selectedStatus)?.description}
            </p>
          )}
        </div>
        
        <div className="flex items-center justify-end">
          <button
            type="submit"
            className={`
              inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm 
              text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}
              ${selectedStatus === story.status ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            disabled={isLoading || selectedStatus === story.status}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Update Status'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StatusTransition;
