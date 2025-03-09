import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import StoryForm from '../components/stories/StoryForm';
import Loading from '../components/Loading';
import Notification from '../components/Notification';
import storyService from '../services/storyService';

/**
 * Stories page component
 * Displays a list of stories and a form to create new ones
 */
const Stories = () => {
  const { user, loading } = useAuth();
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Fetch stories on component mount
  useEffect(() => {
    const fetchStories = async () => {
      try {
        setIsLoading(true);
        const data = await storyService.getStories();
        setStories(data);
      } catch (error) {
        console.error('Failed to fetch stories:', error);
        setNotification({
          type: 'error',
          message: 'Failed to load user stories. Please try again later.'
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchStories();
    }
  }, [user]);

  // Handle form submission
  const handleCreateStory = async (formData) => {
    try {
      setIsSubmitting(true);
      const newStory = await storyService.createStory(formData);
      
      // Add new story to state
      setStories([newStory, ...stories]);
      
      // Show success notification
      setNotification({
        type: 'success',
        message: 'User story created successfully!'
      });
      
      // Reset form display
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create story:', error);
      setNotification({
        type: 'error',
        message: 'Failed to create user story. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear notification
  const clearNotification = () => {
    setNotification(null);
  };

  if (loading) {
    return <Loading fullScreen={true} />;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Stories</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {showForm ? 'Cancel' : 'Create New Story'}
        </button>
      </div>

      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={clearNotification}
        />
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New User Story</h2>
          <StoryForm
            onSubmit={handleCreateStory}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {isLoading ? (
        <Loading />
      ) : stories.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-12 gap-4 bg-gray-100 p-4 font-medium text-gray-700">
            <div className="col-span-3">Title</div>
            <div className="col-span-5">Description</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Created</div>
          </div>
          <div className="divide-y divide-gray-200">
            {stories.map((story) => (
              <div key={story.id} className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50">
                <div className="col-span-3 font-medium text-blue-600">{story.title}</div>
                <div className="col-span-5">{story.description.substring(0, 100)}...</div>
                <div className="col-span-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {story.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="col-span-2 text-sm text-gray-500">
                  {new Date(story.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 mb-4">No user stories found.</p>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Create your first user story
            </button>
          )}
        </div>
      )}
    </div>
    </Layout>
  );
};

export default Stories;
