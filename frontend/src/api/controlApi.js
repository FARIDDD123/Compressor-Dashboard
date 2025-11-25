// src/api/controlApi.js

import apiClient from './apiClient';

// Fetches the initial state of the control panel
export const getControlStatus = () => {
  return apiClient.get('/control/status');
};

// Sends updates to the backend
export const updateControlSettings = (settings) => {
  return apiClient.post('/control/settings', settings);
};