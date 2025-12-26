/**
 * Secure Storage Utility
 * 
 * Manages tokens and user data using sessionStorage for enhanced security.
 * sessionStorage is automatically cleared when the browser tab is closed,
 * reducing the window of opportunity for XSS attacks.
 * 
 * @module utils/storage
 * @example
 * ```javascript
 * import { setToken, getToken, clearAuthData } from './utils/storage';
 * 
 * // Set token
 * setToken('jwt-token-here');
 * 
 * // Get token
 * const token = getToken();
 * 
 * // Clear all auth data
 * clearAuthData();
 * ```
 */

/**
 * Storage keys used for sessionStorage
 * @constant {Object} STORAGE_KEYS
 */

const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  CSRF_TOKEN: 'csrf_token',
};

/**
 * Get token from sessionStorage
 * @returns {string|null} Token or null if not found
 */
export const getToken = () => {
  try {
    return sessionStorage.getItem(STORAGE_KEYS.TOKEN);
  } catch (error) {
    console.error('Error getting token from storage:', error);
    return null;
  }
};

/**
 * Set token in sessionStorage
 * @param {string} token - JWT token
 */
export const setToken = (token) => {
  try {
    if (token) {
      sessionStorage.setItem(STORAGE_KEYS.TOKEN, token);
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
    }
  } catch (error) {
    console.error('Error setting token in storage:', error);
  }
};

/**
 * Remove token from sessionStorage
 */
export const removeToken = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
  } catch (error) {
    console.error('Error removing token from storage:', error);
  }
};

/**
 * Get user data from sessionStorage
 * @returns {Object|null} User object or null if not found
 */
export const getUser = () => {
  try {
    const userStr = sessionStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error getting user from storage:', error);
    return null;
  }
};

/**
 * Set user data in sessionStorage
 * @param {Object} user - User object
 */
export const setUser = (user) => {
  try {
    if (user) {
      sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.USER);
    }
  } catch (error) {
    console.error('Error setting user in storage:', error);
  }
};

/**
 * Remove user data from sessionStorage
 */
export const removeUser = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.USER);
  } catch (error) {
    console.error('Error removing user from storage:', error);
  }
};

/**
 * Clear all authentication data from sessionStorage
 */
export const clearAuthData = () => {
  removeToken();
  removeUser();
  removeCsrfToken();
};

/**
 * Get CSRF token from sessionStorage
 * @returns {string|null} CSRF token or null if not found
 */
export const getCsrfToken = () => {
  try {
    return sessionStorage.getItem(STORAGE_KEYS.CSRF_TOKEN);
  } catch (error) {
    console.error('Error getting CSRF token from storage:', error);
    return null;
  }
};

/**
 * Set CSRF token in sessionStorage
 * @param {string} token - CSRF token
 */
export const setCsrfToken = (token) => {
  try {
    if (token) {
      sessionStorage.setItem(STORAGE_KEYS.CSRF_TOKEN, token);
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.CSRF_TOKEN);
    }
  } catch (error) {
    console.error('Error setting CSRF token in storage:', error);
  }
};

/**
 * Remove CSRF token from sessionStorage
 */
export const removeCsrfToken = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.CSRF_TOKEN);
  } catch (error) {
    console.error('Error removing CSRF token from storage:', error);
  }
};

/**
 * Check if user is authenticated (has token)
 * @returns {boolean} True if authenticated
 */
export const isAuthenticated = () => {
  return !!getToken();
};

