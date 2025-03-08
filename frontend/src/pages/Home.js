import React from 'react';
import { useAuth } from '../context/AuthContext';
import UserMenu from '../components/UserMenu';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Developer Platform</h1>
          <div className="flex items-center space-x-4">
            {user && <UserMenu />}
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Welcome to the Developer Platform</h2>
          <p className="text-gray-600 mb-4">
            This is an internal tool for managing user stories, tasks, and documentation.
          </p>
          <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
            <p className="text-blue-800">
              You are now logged in. Use the navigation to explore different sections of the platform.
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-gray-100 py-4">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© {new Date().getFullYear()} Developer Platform MVP</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
