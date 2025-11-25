// src/App.jsx

import React, { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import AppRouter from './routes/AppRouter';
import Notifier from './components/common/Notifier';
import useWebSocket from './hooks/useWebSocket'; 
import industrialTheme from './theme/industrialTheme';
import { 
  addDataPoint, 
  addAlert, 
  markAsAnomaly,
  setConnectionStatus
} from './features/rtm/rtmSlice';
import { updateRtoSuggestion } from './features/rto/rtoSlice';

function App() {
  const dispatch = useDispatch();

  // Callbacks for RTM data
  const handleNewData = useCallback((dataPoint) => {
    // Use the Spread operator to automatically include all incoming fields
    // (all sensors + feature engineering) into the Redux state.
    const newPointForChart = {
      ...dataPoint, 
      
      // Overrides/Calculations:
      time_id: dataPoint.Time, // Set Time_ID from the original Time field
      // timestamp: dataPoint.Timestamp is included via spread, no need to restate unless changing it.
      time: new Date(dataPoint.Timestamp).toLocaleTimeString(), // Human-readable format for chart X-axis
      Efficiency: dataPoint.Efficiency * 100, // Apply necessary scaling (0-1 to 0-100)
    };
    dispatch(addDataPoint(newPointForChart));
  }, [dispatch]);

  const handleNewAlert = useCallback((alertData) => {
    const newAlert = {
      id: `${Date.now()}-${Math.random()}`,
      iso_timestamp: alertData.timestamp,
      display_timestamp: new Date(alertData.timestamp).toLocaleString(),
      message: alertData.details,
    };
    dispatch(addAlert(newAlert));

    if (alertData.time_id && alertData.causes) {
      dispatch(markAsAnomaly({ time_id: alertData.time_id, causes: alertData.causes }));
    }
  }, [dispatch]);

  // Callback for RTO suggestions
  const handleNewRtoSuggestion = useCallback((suggestionData) => {
    dispatch(updateRtoSuggestion(suggestionData));
  }, [dispatch]);

  // Central WebSocket hook
  const { isConnected } = useWebSocket({
    'new_data': handleNewData,
    'new_alert': handleNewAlert,
    'new_rto_suggestion': handleNewRtoSuggestion, 
  });

  // Syncs connection status to the Redux store
  useEffect(() => {
    dispatch(setConnectionStatus(isConnected));
  }, [isConnected, dispatch]);

  return (
    <ThemeProvider theme={industrialTheme}>
      <CssBaseline />
      <AppRouter />
      <Notifier /> 
    </ThemeProvider>
  );
}

export default App;