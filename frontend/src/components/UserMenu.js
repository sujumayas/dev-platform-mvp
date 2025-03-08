import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const UserMenu = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const handleLogout = async () => {
    await logout();
  };
  
  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={toggleMenu}
        className="flex items-center space-x-2 text-white hover:text-gray-200 focus:outline-none"
      >
        <span>{user?.name || user?.email || 'User'}</span>
        <svg 
          className={`w-4 h-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      
      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-md shadow-xl z-50">
          <div className="px-4 py-2 text-xs text-gray-500 border-b">
            Signed in as<br />
            <span className="font-medium text-gray-800">{user?.email}</span>
          </div>
          
          <a href="#profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            Your profile
          </a>
          
          <button 
            onClick={handleLogout}
            className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
