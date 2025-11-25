// src/api/rtoApi.js

import apiClient from './apiClient';

export const getLatestRtoSuggestion = () => {
  return apiClient.get('/rto/suggestion');
};

export const getEfficiencyHistory = () => {
  return apiClient.get('/rto/efficiency_history');
};