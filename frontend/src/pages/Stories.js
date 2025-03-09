import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import StoryForm from '../components/stories/StoryForm';
import Loading from '../components/Loading';
import Notification from '../components/Notification';
import StatusFilter from '../components/stories/StatusFilter';
import Pagination from '../components/Pagination';
import SearchBox from '../components/stories/SearchBox';
import storyService from '../services/storyService';
import { getStatusLabel, getStatusColor } from '../utils/statusConfig';

/**
 * Stories page component
 * Displays a list of stories with pagination and filtering
 */
const Stories = () => {
  const { user, loading } = useAuth();
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState("");
  
  // Pagination and filtering dependent stories
  const [displayedStories, setDisplayedStories] = useState([]);
  
  // Additional state for tracking loading state when filtering
  const [isFilterLoading, setIsFilterLoading] = useState(false);

  // Fetch stories on component mount or when filters change
  useEffect(() => {
    const fetchStories = async () => {
      try {
        setIsLoading(true);
        setIsFilterLoading(true);
        
        // Get stories with filter
        const filters = {};
        if (statusFilter) {
          filters.status = statusFilter;
        }
        
        const data = await storyService.getStories(filters);
        setStories(data);
        
        // Calculate total pages
        setTotalPages(Math.ceil(data.length / itemsPerPage));
        
        // Reset to first page when filter changes
        if (page !== 1) {
          setPage(1);
        }
      } catch (error) {
        console.error('Failed to fetch stories:', error);
        setNotification({
          type: 'error',
          message: 'Failed to load user stories. Please try again later.'
        });
      } finally {
        setIsLoading(false);
        setIsFilterLoading(false);
      }
    };

    if (user) {
      fetchStories();
    }
  }, [user, statusFilter]);
  
  // Update displayed stories when page or all stories change
  useEffect(() => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayedStories(stories.slice(startIndex, endIndex));
  }, [page, stories, itemsPerPage]);

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
  
  // Handle status filter change
  const handleStatusChange = (status) => {
    setStatusFilter(status);
  };
  
  // Handle page change
  const handlePageChange = (newPage) => {
    setPage(newPage);
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
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">User Stories</h1>
            {!isLoading && (
              <p className="text-sm text-gray-500 mt-1">
                {stories.length} {stories.length === 1 ? 'story' : 'stories'}
                {statusFilter && ` with status "${getStatusLabel(statusFilter)}"`}
              </p>
            )}
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-3 md:mt-0"
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
        
        {/* Filter Bar */}
        <div className="bg-gray-50 p-4 rounded-md shadow-sm mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
            {/* Future search box - not currently functional */}
            <div className="w-full md:w-1/3 opacity-60 cursor-not-allowed">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search stories... (coming soon)"
                  disabled
                  className="w-full py-2 pl-10 pr-4 rounded-md border-gray-300 shadow-sm bg-gray-100"
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
              </div>
            </div>
            
            <StatusFilter 
              selectedStatus={statusFilter} 
              onChange={handleStatusChange} 
              disabled={isFilterLoading}
            />
          </div>
          
          <div className="flex justify-end items-center">
            {statusFilter && (
              <button
                onClick={() => setStatusFilter('')}
                className="text-sm text-blue-600 hover:text-blue-800 mr-3 flex items-center"
                disabled={isFilterLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear Filters
              </button>
            )}
            
            {isFilterLoading && (
              <div className="flex items-center text-sm text-gray-500">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading stories...
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <Loading />
        ) : displayedStories.length > 0 ? (
          <>
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="grid grid-cols-12 gap-4 bg-gray-100 p-4 font-medium text-gray-700 border-b border-gray-200 sticky top-0">
                <div className="col-span-3">Title</div>
                <div className="col-span-5">Description</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Created</div>
              </div>
              <div className="divide-y divide-gray-200">
                {displayedStories.map((story, index) => (
                  <div 
                    key={story.id} 
                    className={`grid grid-cols-12 gap-4 p-4 hover:bg-blue-50 transition-colors duration-150 cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    onClick={() => console.log('Story clicked:', story.id)}
                  >
                    <div className="col-span-3 font-medium text-blue-600">{story.title}</div>
                    <div className="col-span-5">{story.description.substring(0, 100)}...</div>
                    <div className="col-span-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(story.status)}`}>
                        {getStatusLabel(story.status)}
                      </span>
                    </div>
                    <div className="col-span-2 text-sm text-gray-500">
                      {new Date(story.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Pagination */}
            <Pagination 
              currentPage={page} 
              totalPages={totalPages} 
              onPageChange={handlePageChange} 
            />
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 mb-4">
              {statusFilter 
                ? `No user stories found with status "${getStatusLabel(statusFilter)}"` 
                : 'No user stories found.'}
            </p>
            {!showForm && !statusFilter && (
              <button
                onClick={() => setShowForm(true)}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Create your first user story
              </button>
            )}
            {statusFilter && (
              <button
                onClick={() => setStatusFilter('')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear filter
              </button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Stories;
