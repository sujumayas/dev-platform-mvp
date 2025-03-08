import React, { useState, useEffect } from 'react';

/**
 * Notification component for displaying messages to the user
 * @param {Object} props
 * @param {string} props.type - 'success', 'error', 'warning', or 'info'
 * @param {string} props.message - Message to display
 * @param {number} props.duration - Duration in milliseconds before auto-closing (0 = no auto-close)
 * @param {function} props.onClose - Function to call when notification is closed
 */
const Notification = ({ type = 'info', message, duration = 5000, onClose }) => {
  const [visible, setVisible] = useState(true);

  // Auto-close notification after duration (if > 0)
  useEffect(() => {
    if (duration > 0 && message) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, message, onClose]);

  // If no message or not visible, don't render anything
  if (!message || !visible) {
    return null;
  }

  // Determine styles based on notification type
  const typeStyles = {
    success: 'bg-green-100 text-green-800 border-green-300',
    error: 'bg-red-100 text-red-800 border-red-300',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    info: 'bg-blue-100 text-blue-800 border-blue-300',
  };

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  return (
    <div className={`rounded-md border p-4 mb-4 ${typeStyles[type] || typeStyles.info}`}>
      <div className="flex justify-between items-start">
        <div className="flex-grow">{message}</div>
        <button
          onClick={handleClose}
          className="ml-4 text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label="Close"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default Notification;
