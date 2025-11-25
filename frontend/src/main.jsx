// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Add comprehensive error logging
window.addEventListener('error', (event) => {
  console.error('🚨 Global error:', event.error);
  console.error('Error message:', event.message);
  console.error('Error filename:', event.filename);
  console.error('Error lineno:', event.lineno);
  console.error('Error colno:', event.colno);
  if (event.error?.stack) {
    console.error('Error stack:', event.error.stack);
  }
  
  // Show error on page
  const rootEl = document.getElementById('root');
  if (rootEl) {
    rootEl.innerHTML = `
      <div style="padding: 20px; color: red; background: #000; min-height: 100vh;">
        <h1>🚨 JavaScript Error Detected</h1>
        <p><strong>Message:</strong> ${event.message}</p>
        <p><strong>File:</strong> ${event.filename}:${event.lineno}:${event.colno}</p>
        <pre style="background: #1a1a1a; padding: 10px; overflow: auto;">${event.error?.stack || event.error?.toString() || 'No stack trace'}</pre>
        <p>Check the browser console (F12) for more details.</p>
      </div>
    `;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled promise rejection:', event.reason);
  if (event.reason?.stack) {
    console.error('Rejection stack:', event.reason.stack);
  }
});

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
    
    // Render a simple test first
    root.render(
      <div style={{
        padding: '20px',
        backgroundColor: '#000000',
        color: '#8BC34A',
        minHeight: '100vh',
        fontSize: '18px'
      }}>
        <h1 style={{ color: '#8BC34A' }}>✅ React is Working!</h1>
        <p>Loading full application...</p>
        <p style={{ fontSize: '14px', color: '#888' }}>Check console for errors</p>
      </div>
    );
    
    // Now try to load the full app
    console.log('Loading App component...');
    Promise.all([
      import('./App.jsx'),
      import('react-redux'),
      import('redux-persist/integration/react'),
      import('./app/store.js'),
      import('./components/common/ErrorBoundary.jsx'),
      import('@mui/material')
    ]).then(([
      { default: App },
      { Provider },
      { PersistGate },
      { store, persistor },
      { default: ErrorBoundary },
      { Box, CircularProgress, Typography }
    ]) => {
      console.log('✅ All modules loaded successfully');
      
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

      console.log('Rendering full application...');
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
    }).catch((err) => {
      console.error('❌ Error loading application modules:', err);
      root.render(
        <div style={{
          padding: '20px',
          color: 'red',
          backgroundColor: '#000',
          minHeight: '100vh'
        }}>
          <h1>❌ Error Loading Application</h1>
          <p><strong>Error:</strong> {err.message || err.toString()}</p>
          <pre style={{
            background: '#1a1a1a',
            padding: '10px',
            overflow: 'auto',
            color: '#ff6b6b'
          }}>
            {err.stack || err.toString()}
          </pre>
          <p>Please check the browser console (F12) for more details.</p>
        </div>
      );
    });
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