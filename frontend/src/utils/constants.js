/**
 * Application constants
 */

// API base URL - change according to your environment
export const API_URL = 'http://localhost:8000';

// Pagination default settings
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE = 1;

// User story statuses
export const STORY_STATUSES = {
  BACKLOG: 'backlog',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  DONE: 'done'
};

// Local storage keys
export const TOKEN_KEY = 'auth_token';
export const USER_KEY = 'user_info';
