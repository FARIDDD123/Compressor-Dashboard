// Ultra-simple version for testing
import React from 'react';
import ReactDOM from 'react-dom/client';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <div style={{
    padding: '20px',
    backgroundColor: '#000000',
    color: '#8BC34A',
    minHeight: '100vh',
    fontSize: '24px'
  }}>
    <h1>✅ React is Working!</h1>
    <p>If you see this, React is rendering correctly.</p>
    <p>Now we can debug the full app.</p>
  </div>
);

