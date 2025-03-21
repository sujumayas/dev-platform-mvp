import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import dashboardService from '../services/dashboardService';
import Loading from '../components/Loading';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getDashboardSummary();
        setDashboardData(data.data);
        setError(null);
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        if (err.response && err.response.status === 401) {
          setError('Authentication error. Please try logging in again.');
        } else {
          setError('Failed to load dashboard data. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Developer Platform Dashboard</h1>
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Developer Platform Dashboard</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Developer Platform Dashboard</h1>
        <div className="text-sm text-gray-500 mb-6">Welcome, {user?.username || 'User'}</div>
        
        {/* Show data loading info */}
        {dashboardData ? (
          <div className="text-sm text-gray-500 mb-4">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
              Data last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        ) : null}
        
        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* User Story Status Summary */}
          <div className="bg-white p-6 rounded-lg shadow-md col-span-1">
            <h2 className="text-xl font-semibold mb-4">Story Status Summary</h2>
            <div className="h-64 flex flex-col justify-center">
              {dashboardData?.status_summary ? (
                <div className="space-y-4">
                  {Object.entries(dashboardData.status_summary).map(([status, count]) => (
                    <div key={status} className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div 
                          className={`h-4 rounded-full ${
                            status === 'backlog' ? 'bg-blue-500' :
                            status === 'in_progress' ? 'bg-yellow-500' :
                            status === 'review' ? 'bg-purple-500' :
                            'bg-green-500'
                          }`}
                          style={{
                            width: `${Math.max(
                              5, // Minimum width for visibility
                              Math.round(
                                (count / Object.values(dashboardData.status_summary).reduce((a, b) => a + b, 0)) * 100
                              )
                            )}%`
                          }}
                        ></div>
                      </div>
                      <div className="ml-4 w-24 flex justify-between">
                        <span className="capitalize text-sm">{status.replace('_', ' ')}</span>
                        <span className="font-semibold">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center border border-dashed border-gray-300 rounded-md h-full">
                  <p className="text-gray-500 text-sm">No status data available</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Team Performance */}
          <div className="bg-white p-6 rounded-lg shadow-md col-span-1">
            <h2 className="text-xl font-semibold mb-4">Team Performance</h2>
            <div className="h-64 overflow-y-auto">
              {dashboardData?.team_performance && dashboardData.team_performance.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.team_performance.map((member) => (
                    <div key={member.id} className="border-b border-gray-100 pb-3">
                      <div className="font-medium mb-1">{member.name}</div>
                      <div className="text-xs text-gray-500 mb-2">{member.email}</div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Assigned:</span>
                          <span className="ml-1 font-semibold">{member.assigned}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Completed:</span>
                          <span className="ml-1 font-semibold">{member.completed}</span>
                        </div>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-green-500"
                          style={{
                            width: member.assigned > 0 
                              ? `${(member.completed / member.assigned) * 100}%` 
                              : '0%'
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center border border-dashed border-gray-300 rounded-md">
                  <p className="text-gray-500 text-sm">No team data available</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-lg shadow-md col-span-1">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="h-64 overflow-y-auto p-2">
              {dashboardData?.recent_activity && dashboardData.recent_activity.length > 0 ? (
                <ul className="space-y-3">
                  {dashboardData.recent_activity.map((activity) => (
                    <li key={activity.id} className="border-b border-gray-100 pb-3">
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${
                          activity.status === 'DRAFT' ? 'bg-blue-500' :
                          activity.status === 'DEVELOPMENT' ? 'bg-yellow-500' :
                          activity.status === 'READY_FOR_TESTING' ? 'bg-purple-500' :
                          activity.status === 'READY_FOR_PRODUCTION' ? 'bg-green-500' :
                          'bg-gray-500'
                        } mr-2`}></div>
                        <div>
                          <Link to={`/stories/${activity.id}`} className="font-medium hover:text-blue-600 transition">
                            {activity.title}
                          </Link>
                          <div className="text-xs text-gray-500 mt-1 flex justify-between">
                            <span>{activity.status.replace('_', ' ').toLowerCase()}</span>
                            <span>{new Date(activity.updated_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="h-full flex items-center justify-center border border-dashed border-gray-300 rounded-md">
                  <p className="text-gray-500 text-sm">No recent activity</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Deadline Tracker - Wider component spanning 2 columns */}
          <div className="bg-white p-6 rounded-lg shadow-md col-span-1 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Upcoming Deadlines</h2>
            <div className="h-48 flex items-center justify-center border border-dashed border-gray-300 rounded-md">
              {/* This will show a timeline of approaching deadlines */}
              <p className="text-gray-500 text-sm">
                {/* Timeline visualization for upcoming deadlines */}
                Deadline tracker coming soon
              </p>
            </div>
          </div>
          
          {/* Gherkin Generation Stats */}
          <div className="bg-white p-6 rounded-lg shadow-md col-span-1">
            <h2 className="text-xl font-semibold mb-4">Gherkin Coverage</h2>
            {dashboardData?.gherkin_coverage ? (
              <div className="h-48 flex flex-col justify-center">
                <div className="text-center mb-2">
                  <span className="text-4xl font-bold text-blue-600">
                    {dashboardData.gherkin_coverage.coverage_percentage}%
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                  <div 
                    className="h-4 rounded-full bg-blue-600"
                    style={{
                      width: `${dashboardData.gherkin_coverage.coverage_percentage}%`
                    }}
                  ></div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center mt-4">
                  <div>
                    <p className="text-sm text-gray-500">With Specs</p>
                    <p className="text-lg font-semibold">{dashboardData.gherkin_coverage.with_gherkin}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Without Specs</p>
                    <p className="text-lg font-semibold">{dashboardData.gherkin_coverage.without_gherkin}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center border border-dashed border-gray-300 rounded-md">
                <p className="text-gray-500 text-sm">No Gherkin coverage data available</p>
              </div>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow-md col-span-1 md:col-span-3 lg:col-span-3">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-4 justify-center">
              {/* This will contain buttons for common actions */}
              <Link to="/stories/new" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                Create Story
              </Link>
              <Link to="/stories" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
                Manage Stories
              </Link>
              <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition">
                Generate Gherkin
              </button>
              <button className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition">
                View Reports
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
