import React, { useState } from 'react';
import PropTypes from 'prop-types';
import DesignUpload from './DesignUpload';
import storyService from '../../services/storyService';

/**
 * Form component for creating or editing user stories
 */
const StoryForm = ({ onSubmit, initialData = {}, isSubmitting = false, isEditing = false }) => {
  // Form state
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    design_url: initialData.design_url || ''
  });

  // State for handling design analysis
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Validation state
  const [errors, setErrors] = useState({});

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // Handle design URL update
  const handleDesignUpload = (designUrl) => {
    setFormData({ ...formData, design_url: designUrl });
  };

  // Handle description generation from design
  const handleAnalyzeDesign = async () => {
    if (!formData.design_url) return;
    
    try {
      setIsAnalyzing(true);
      
      // First, we need to save the design URL to the story if it's a new design URL
      const storyId = initialData.id;
      
      if (storyId) {
        // If the design URL has changed, update it first
        if (initialData.design_url !== formData.design_url) {
          console.log('Updating design URL before analysis:', formData.design_url);
          await storyService.updateStoryDesign(storyId, formData.design_url);
        }
        
        console.log('Calling API to analyze design for story ID:', storyId);
        // Now analyze the design
        const response = await storyService.analyzeDesign(storyId);
        console.log('Received analysis response:', response);
        
        if (response && response.generated_description) {
          console.log('Setting description from API response');
          setFormData({ ...formData, description: response.generated_description });
        } else {
          console.warn('No generated description in response');
        }
      } else {
        // For new stories (no storyId yet), we'll create a temporary story, 
        // add the design, analyze it, then delete it
        console.log('Creating temporary story for design analysis');
        
        try {
          // Create a temporary story
          const tempStory = await storyService.createStory({
            title: 'Temporary Design Analysis Story',
            description: 'This is a temporary story for design analysis.',
            design_url: formData.design_url
          });
          
          console.log('Temporary story created:', tempStory);
          
          // Analyze the design
          const response = await storyService.analyzeDesign(tempStory.id);
          console.log('Analysis response:', response);
          
          if (response && response.generated_description) {
            setFormData({ ...formData, description: response.generated_description });
          }
          
          // Delete the temporary story
          await storyService.deleteStory(tempStory.id);
          console.log('Temporary story deleted');
        } catch (error) {
          console.error('Error with temporary story workflow:', error);
          // Fallback to a generic description
          const fallbackDescription = `Interface for a web application with navigation and interactive elements. Users can perform actions and view content through this interface.`;
          setFormData({ ...formData, description: fallbackDescription });
        }
      }
    } catch (error) {
      console.error('Error analyzing design:', error);
      alert('Failed to analyze design. Please check console for details.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title field */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter user story title"
          className={`mt-1 block w-full rounded-md shadow-sm ${
            errors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          } sm:text-sm`}
          disabled={isSubmitting}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>
      
      {/* Description field */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={5}
          placeholder="Enter user story description"
          className={`mt-1 block w-full rounded-md shadow-sm ${
            errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          } sm:text-sm`}
          disabled={isSubmitting}
        />
        <p className="mt-1 text-xs text-gray-500">
          Describe the user story with sufficient context. It will be automatically converted to Gherkin format when ready for refinement.
        </p>
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>
      
      {/* Design Upload Component */}
      <DesignUpload 
        designUrl={formData.design_url} 
        onUpload={handleDesignUpload} 
        onAnalyze={handleAnalyzeDesign}
        isAnalyzing={isAnalyzing}
      />
      
      {/* Submit button */}
      <div className="pt-2">
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            isEditing ? 'Update User Story' : 'Create User Story'
          )}
        </button>
      </div>
    </form>
  );
};

StoryForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  isSubmitting: PropTypes.bool,
  isEditing: PropTypes.bool,
};

export default StoryForm;
