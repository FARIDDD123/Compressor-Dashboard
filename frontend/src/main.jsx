// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './app/store';
import ErrorBoundary from './components/common/ErrorBoundary';
import App from './App.jsx';
import { Box, CircularProgress, Typography } from '@mui/material';
import { initializeErrorLogging } from './utils/errorLogger';
import { initializeCsrfToken } from './utils/csrf';
import performanceMonitor from './utils/performanceMonitor';

// Initialize error logging service
initializeErrorLogging();

// Initialize CSRF token protection
initializeCsrfToken();

// Initialize performance monitoring
performanceMonitor.init();

// Loading screen component
const LoadingScreen = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#000000',
      gap: 2,
    }}
  >
    <CircularProgress sx={{ color: '#8BC34A' }} size={60} />
    <Typography variant="body1" sx={{ color: '#8BC34A' }}>
      Loading Dashboard...
    </Typography>
  </Box>
);

// Check if root element exists
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Root element not found!');
  document.body.innerHTML = '<h1 style="color: red;">Root element not found!</h1>';
} else {
  console.log('✅ Root element found');
  
  try {
    const root = ReactDOM.createRoot(rootElement);
    console.log('✅ ReactDOM root created');
    
    console.log('Rendering application...');
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <Provider store={store}>
            <PersistGate loading={<LoadingScreen />} persistor={persistor}>
              <App />
            </PersistGate>
          </Provider>
        </ErrorBoundary>
      </React.StrictMode>
    );
    console.log('✅ Application rendered');
  } catch (error) {
    console.error('❌ Fatal error in main.jsx:', error);
    rootElement.innerHTML = `
      <div style="padding: 20px; color: red; background: #000; min-height: 100vh;">
        <h1>❌ Fatal Error</h1>
        <p><strong>Error:</strong> ${error.message || error.toString()}</p>
        <pre style="background: #1a1a1a; padding: 10px; overflow: auto;">${error.stack || error.toString()}</pre>
        <p>Please check the browser console (F12) for more details.</p>
      </div>
    `;
  }
}
