import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserMenu from './UserMenu';

/**
 * Layout component that provides consistent page structure and navigation
 */
const Layout = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Navigation items
  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/stories', label: 'User Stories' },
    // Add more navigation items as features are developed
  ];

  // Check if a nav item is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold">Developer Platform</Link>
            
            {/* Main navigation */}
            <nav className="hidden md:flex ml-8 space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive(item.path)
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-100 hover:bg-blue-500 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && <UserMenu />}
          </div>
        </div>
      </header>

      {/* Mobile navigation */}
      <div className="md:hidden bg-blue-500 text-white">
        <div className="container mx-auto px-4 py-2 flex justify-between overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-2 text-sm font-medium whitespace-nowrap ${
                isActive(item.path)
                  ? 'bg-blue-700 rounded-md'
                  : 'text-blue-100'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-gray-100 py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© {new Date().getFullYear()} Developer Platform MVP</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
