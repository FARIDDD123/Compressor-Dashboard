// Simple version of App for debugging
import React from 'react';

function AppSimple() {
  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#000000',
      color: '#8BC34A',
      minHeight: '100vh',
      fontSize: '18px'
    }}>
      <h1 style={{ color: '#8BC34A' }}>✅ React is Working!</h1>
      <p>If you see this, React is rendering correctly.</p>
      <p>Now we need to check why the full app isn't working.</p>
    </div>
  );
}

export default AppSimple;

