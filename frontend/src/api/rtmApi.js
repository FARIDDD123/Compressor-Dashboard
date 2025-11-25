// src/api/rtmApi.js

import apiClient from './apiClient';

export const getSystemStatus = () => {
  return apiClient.get('/status/overview');
};

// Fetches historical data from InfluxDB via our backend API
export const getHistoricalData = (timeRange) => {
  // timeRange can be "-10m", "-1h", "-24h", etc.
  return apiClient.get('/data/get_live_data', {
    params: {
      start: timeRange,
    },
  });
};