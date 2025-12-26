// src/utils/csrf.js

/**
 * CSRF Protection Utility
 * Implements Double Submit Cookie pattern for CSRF protection
 */

import { getCsrfToken, setCsrfToken, removeCsrfToken } from './storage';

/**
 * Generate a random CSRF token
 * @returns {string} Random token
 */
const generateCsrfToken = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Initialize CSRF token if not exists
 * Should be called on app initialization
 */
export const initializeCsrfToken = () => {
  let token = getCsrfToken();
  
  if (!token) {
    token = generateCsrfToken();
    setCsrfToken(token);
  }
  
  return token;
};

/**
 * Get current CSRF token
 * @returns {string|null} CSRF token or null
 */
export const getCurrentCsrfToken = () => {
  return getCsrfToken() || initializeCsrfToken();
};

/**
 * Validate CSRF token
 * @param {string} token - Token to validate
 * @returns {boolean} True if valid
 */
export const validateCsrfToken = (token) => {
  const storedToken = getCsrfToken();
  return storedToken !== null && storedToken === token;
};

/**
 * Clear CSRF token (on logout)
 */
export const clearCsrfToken = () => {
  removeCsrfToken();
};

/**
 * Add CSRF token to request headers
 * @param {Object} headers - Request headers object
 * @returns {Object} Headers with CSRF token
 */
export const addCsrfTokenToHeaders = (headers = {}) => {
  const token = getCurrentCsrfToken();
  if (token) {
    headers['X-CSRF-Token'] = token;
  }
  return headers;
};

