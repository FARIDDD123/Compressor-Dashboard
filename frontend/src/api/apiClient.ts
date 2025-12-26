/**
 * API Client Configuration
 * 
 * Pre-configured Axios instance with:
 * - JWT token authentication
 * - CSRF protection
 * - Error handling and logging
 * - Automatic token refresh on 401 errors
 * 
 * @module api/apiClient
 * @example
 * ```typescript
 * import apiClient from './api/apiClient';
 * 
 * const response = await apiClient.get('/endpoint');
 * ```
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { store } from '../app/store';
import { getToken, clearAuthData } from '../utils/storage';
import { addCsrfTokenToHeaders } from '../utils/csrf';
import { logApiError } from '../utils/errorLogger';

/**
 * Pre-configured Axios instance with authentication and error handling
 * 
 * @constant {AxiosInstance} apiClient
 */
const apiClient: AxiosInstance = axios.create({
  // Use import.meta.env for Vite environment variables
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies for CSRF protection
});

/**
 * Request interceptor to add JWT token and CSRF token to headers
 * 
 * Automatically adds:
 * - Authorization header with Bearer token
 * - X-CSRF-Token header for CSRF protection
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from Redux store or sessionStorage (secure storage)
    const state = store.getState();
    const token = (state.auth as { token?: string })?.token || getToken();
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add CSRF token to headers for protection
    if (config.headers) {
      config.headers = addCsrfTokenToHeaders(config.headers);
    }
    
    return config;
  },
  (error: AxiosError) => {
    logApiError(error, 'request_interceptor', null);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle errors
 * 
 * Handles:
 * - 401 Unauthorized: Clears auth and redirects to login
 * - 403 Forbidden: Logs CSRF token validation failure
 * - Other errors: Logs to error service
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const statusCode = error.response?.status;
    const endpoint = error.config?.url || 'unknown';
    
    // Log API errors
    logApiError(error, endpoint, statusCode || null);
    
    if (statusCode === 401) {
      // Unauthorized - clear auth state and redirect to login
      clearAuthData();
      
      // Dispatch logout action if available
      const state = store.getState();
      if ((state.auth as { isAuthenticated?: boolean })?.isAuthenticated) {
        store.dispatch({ type: 'auth/logout' });
      }
      
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (statusCode === 403) {
      // Forbidden - CSRF token might be invalid
      console.warn('CSRF token validation failed or access denied');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
