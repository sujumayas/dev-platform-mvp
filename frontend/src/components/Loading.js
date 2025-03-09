import React from 'react';

const Loading = ({ size = 'medium', fullScreen = false }) => {
  // Size variants
  const sizeClasses = {
    small: 'h-6 w-6 border-2',
    medium: 'h-12 w-12 border-3',
    large: 'h-16 w-16 border-4',
  };
  
  // Border colors
  const borderColors = 'border-gray-200 border-t-blue-600';

  // Container classes
  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50'
    : 'flex items-center justify-center p-4';

  return (
    <div className={containerClasses}>
      <div
        className={`animate-spin rounded-full ${sizeClasses[size]} ${borderColors}`}
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
      {fullScreen && <p className="mt-4 text-sm text-gray-600 font-medium">Loading...</p>}
    </div>
  );
};

export default Loading;
