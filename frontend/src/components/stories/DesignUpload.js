import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Component for uploading and displaying a design image for a user story
 */
const DesignUpload = ({ designUrl, onUpload, readonly = false, onAnalyze, isAnalyzing = false }) => {
  const [imageUrl, setImageUrl] = useState(designUrl || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle URL input change
  const handleUrlChange = (e) => {
    setImageUrl(e.target.value);
    setError('');
  };

  // Validate the image URL
  const validateUrl = (url) => {
    // Basic URL validation
    const urlPattern = /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})(\/\S*)?$/i;
    if (!urlPattern.test(url)) {
      return false;
    }
    
    // Check if it's likely an image URL
    const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i;
    if (!imageExtensions.test(url)) {
      // Allow URLs without extensions, but warn that they should be direct image links
      console.warn('URL does not have an image extension. Ensure it points directly to an image.');
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate URL
    if (!imageUrl.trim()) {
      setError('Please enter an image URL');
      return;
    }
    
    if (!validateUrl(imageUrl.trim())) {
      setError('Please enter a valid image URL');
      return;
    }
    
    try {
      setIsLoading(true);
      await onUpload(imageUrl.trim());
    } catch (error) {
      console.error('Design upload error:', error);
      setError('Failed to upload design. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle analyze button click
  const handleAnalyze = async () => {
    try {
      await onAnalyze();
    } catch (error) {
      console.error('Design analysis error:', error);
      setError('Failed to analyze design. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <h3 className="text-lg font-medium mb-3">Design</h3>
      
      {/* Display image if URL exists */}
      {designUrl && (
        <div className="mb-4">
          <img 
            src={designUrl} 
            alt="User Story Design" 
            className="w-full max-h-80 object-contain object-center border rounded"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/400x300?text=Image+Load+Error';
              setError('Failed to load the image. Please check the URL.');
            }}
          />
        </div>
      )}
      
      {/* Image URL form */}
      {!readonly && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Design Image URL
            </label>
            <input
              type="text"
              id="imageUrl"
              value={imageUrl}
              onChange={handleUrlChange}
              placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              disabled={isLoading}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
          
          <div className="flex space-x-2">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Design URL'
              )}
            </button>
            
            {/* Only show Analyze button if we have a design URL and onAnalyze function */}
            {designUrl && onAnalyze && (
              <button
                type="button"
                onClick={handleAnalyze}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  'Generate Description'
                )}
              </button>
            )}
          </div>
        </form>
      )}
      
      {/* Info text about design usage */}
      <p className="mt-3 text-xs text-gray-500">
        Add a design image URL to help Claude generate a description of your user story. 
        The design should clearly show the UI/UX elements that will be implemented.
      </p>
    </div>
  );
};

DesignUpload.propTypes = {
  designUrl: PropTypes.string,
  onUpload: PropTypes.func.isRequired,
  readonly: PropTypes.bool,
  onAnalyze: PropTypes.func,
  isAnalyzing: PropTypes.bool,
};

export default DesignUpload;
