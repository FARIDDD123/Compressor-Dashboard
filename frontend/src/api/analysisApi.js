// src/api/analysisApi.js
import apiClient from './apiClient';

export const getAnalysisData = (params) => {
  // params will be an object like { analysis_type: 'trend', sensor1: 'Vibration', ... }
  return apiClient.post('/analysis/query', params);
};