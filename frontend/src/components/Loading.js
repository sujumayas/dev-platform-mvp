import React from 'react';

const Loading = ({ size = 'medium', fullScreen = false }) => {
  // Size variants
  const sizeClasses = {
    small: 'h-6 w-6 border-2',
    medium: 'h-12 w-12 border-2',
    large: 'h-16 w-16 border-3',
  };

  // Container classes
  const containerClasses = fullScreen
    ? 'flex items-center justify-center min-h-screen'
    : 'flex items-center justify-center p-4';

  return (
    <div className={containerClasses}>
      <div
        className={`animate-spin rounded-full ${sizeClasses[size]} border-b-2 border-blue-500`}
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default Loading;
