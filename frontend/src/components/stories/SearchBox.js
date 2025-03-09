import React, { useState } from 'react';

/**
 * SearchBox component for filtering user stories by keyword
 * This is a placeholder for future functionality - not currently active
 * @param {Object} props - Component props
 * @param {Function} props.onSearch - Function to call when search is submitted
 * @param {boolean} props.disabled - Whether the search is disabled
 */
const SearchBox = ({ onSearch, disabled = false }) => {
  const [keyword, setKeyword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch && keyword.trim()) {
      onSearch(keyword.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        placeholder="Search stories..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        disabled={disabled}
        className={`w-full py-2 pl-10 pr-4 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 ${
          disabled ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      />
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg
          className="h-5 w-5 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <button
        type="submit"
        disabled={disabled || !keyword.trim()}
        className="hidden"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBox;
