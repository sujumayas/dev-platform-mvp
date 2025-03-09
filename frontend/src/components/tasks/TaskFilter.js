import React, { useState } from 'react';
import { getTaskStatusLabel } from '../../utils/taskStatusConfig';

/**
 * Component for filtering tasks
 */
const TaskFilter = ({ users, onFilter }) => {
  const [statusFilter, setStatusFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Handle filter changes
  const handleFilterChange = (type, value) => {
    switch (type) {
      case 'status':
        setStatusFilter(value);
        break;
      case 'assignee':
        setAssigneeFilter(value);
        break;
      case 'search':
        setSearchQuery(value);
        break;
      default:
        break;
    }
    
    // Apply filters
    onFilter({
      status: type === 'status' ? value : statusFilter,
      assignee: type === 'assignee' ? value : assigneeFilter,
      search: type === 'search' ? value : searchQuery
    });
  };
  
  // Reset all filters
  const resetFilters = () => {
    setStatusFilter('');
    setAssigneeFilter('');
    setSearchQuery('');
    onFilter({ status: '', assignee: '', search: '' });
  };
  
  // Check if any filters are active
  const hasActiveFilters = statusFilter || assigneeFilter || searchQuery;
  
  return (
    <div className="bg-gray-50 p-4 rounded-md shadow-sm mb-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status filter */}
        <div>
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="TODO">{getTaskStatusLabel('TODO')}</option>
            <option value="DEVELOPMENT">{getTaskStatusLabel('DEVELOPMENT')}</option>
            <option value="COMPLETE">{getTaskStatusLabel('COMPLETE')}</option>
          </select>
        </div>
        
        {/* Assignee filter */}
        <div>
          <label htmlFor="assignee-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Assigned To
          </label>
          <select
            id="assignee-filter"
            value={assigneeFilter}
            onChange={(e) => handleFilterChange('assignee', e.target.value)}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name || user.email}
              </option>
            ))}
          </select>
        </div>
        
        {/* Search filter */}
        <div>
          <label htmlFor="search-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <div className="relative rounded-md shadow-sm">
            <input
              type="text"
              id="search-filter"
              value={searchQuery}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search title or description"
              className="block w-full border-gray-300 rounded-md pr-10 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Reset filters button */}
      {hasActiveFilters && (
        <div className="mt-3 flex justify-end">
          <button
            onClick={resetFilters}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskFilter;
