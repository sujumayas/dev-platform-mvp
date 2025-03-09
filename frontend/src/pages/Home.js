import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import UserMenu from '../components/UserMenu';
import Loading from '../components/Loading';

const Home = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log('Home component mounted, user:', user);
  }, [user]);

  if (loading) {
    return <Loading fullScreen={true} />;
  }

  return (
    <Layout>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Welcome to the Developer Platform</h2>
          <p className="text-gray-600 mb-4">
            This is an internal tool for managing user stories, tasks, and documentation.
          </p>
          <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mb-6">
            <p className="text-blue-800">
              You are now logged in. Use the navigation to explore different sections of the platform.
            </p>
          </div>
          
          <h3 className="text-xl font-semibold mb-4">Quick Access</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/stories" className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              <h4 className="text-lg font-medium text-blue-600 mb-2">User Stories</h4>
              <p className="text-gray-600">Create and manage user stories for your project.</p>
            </Link>
            
            {/* Add more quick access cards here as features are implemented */}
          </div>
        </div>
      </main>

    </Layout>
  );
};

export default Home;
