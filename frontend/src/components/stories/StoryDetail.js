import React, { useEffect, useState } from 'react';
import { getStatusLabel, getStatusColor } from '../../utils/statusConfig';
import StatusTransition from './StatusTransition';
import GherkinDisplay from './GherkinDisplay';
import StoryForm from './StoryForm';
import StoryAssign from './StoryAssign';
import storyService from '../../services/storyService';

/**
 * Component for displaying a detailed view of a user story
 */
const StoryDetail = ({ story, onStatusChange, onClose, onError, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentStory, setCurrentStory] = useState(story);
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Log story details when component mounts or updates
  useEffect(() => {
    console.log('StoryDetail - Current story data:', story);
    console.log('Gherkin content available:', story.gherkin_description ? 'Yes' : 'No');
    if (story.gherkin_description) {
      console.log('Gherkin first 100 chars:', story.gherkin_description.substring(0, 100));
    }
    setCurrentStory(story);
  }, [story]);
  
  // Handle story update
  const handleUpdateStory = async (formData) => {
    try {
      setIsSubmitting(true);
      const updatedStory = await storyService.updateStory(currentStory.id, formData);
      setCurrentStory(updatedStory);
      setIsEditing(false);
      if (onUpdate) {
        onUpdate(updatedStory);
      }
    } catch (error) {
      onError("Failed to update story. Please try again.");
      console.error("Update story error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle story delete
  const handleDeleteStory = async () => {
    try {
      setIsSubmitting(true);
      await storyService.deleteStory(currentStory.id);
      if (onDelete) {
        onDelete(currentStory.id);
      }
      onClose();
    } catch (error) {
      onError("Failed to delete story. Please try again.");
      console.error("Delete story error:", error);
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center bg-gray-50 p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">{currentStory.title}</h2>
        
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(currentStory.status)}`}>
            {getStatusLabel(currentStory.status)}
          </span>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
            aria-label="Close"
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Story details */}
          <div className="md:col-span-2">
            {isEditing ? (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Edit Story</h3>
                <StoryForm 
                  initialData={currentStory}
                  onSubmit={handleUpdateStory}
                  isSubmitting={isSubmitting}
                  isEditing={true}
                />
                <button
                  onClick={() => setIsEditing(false)}
                  className="mt-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {currentStory.description}
                </div>
              </div>
            )}
            
            {/* Gherkin Display */}
            {!isEditing && <GherkinDisplay gherkin={currentStory.gherkin_description} />}
            
            {/* Metadata */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-medium mb-3">Story Details</h3>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                  <dt className="text-gray-500">Created</dt>
                  <dd>{formatDate(currentStory.created_at)}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Last Updated</dt>
                  <dd>{formatDate(currentStory.updated_at)}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-gray-500">Story ID</dt>
                  <dd className="font-mono text-xs">{currentStory.id}</dd>
                </div>
              </dl>
            </div>
          </div>
          
          {/* Right column - Actions */}
          <div className="md:col-span-1">
            {/* Status Transition */}
            <StatusTransition 
              story={currentStory} 
              onStatusChange={onStatusChange}
              onError={onError} 
            />
            
            {/* Assignee */}
            <StoryAssign
              story={currentStory}
              onAssign={(updatedStory) => {
                setCurrentStory(updatedStory);
                onUpdate(updatedStory);
              }}
              onError={onError}
            />
            
            {/* Additional actions could go here */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-medium mb-3">Actions</h3>
              <div className="space-y-2">
                {!isEditing && (
                  <button
                    className="w-full text-left px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Story
                  </button>
                )}
                
                <button
                  className="w-full text-left px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => console.log('Add Task - Not implemented')}
                >
                  Add Task
                </button>
                
                <button
                  className="w-full text-left px-4 py-2 border border-gray-300 rounded-md text-sm text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isSubmitting}
                >
                  Delete Story
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-3 text-red-600">Confirm Delete</h3>
            <p className="mb-4">Are you sure you want to delete this story? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                onClick={handleDeleteStory}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryDetail;
