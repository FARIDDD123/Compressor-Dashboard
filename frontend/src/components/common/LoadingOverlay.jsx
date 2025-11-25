// src/components/common/LoadingOverlay.jsx

import React from 'react';
import { Box, CircularProgress, Typography, Backdrop } from '@mui/material';

/**
 * Loading Overlay Component
 * Shows a full-screen loading indicator
 */
const LoadingOverlay = ({ open = false, message = 'Loading...' }) => {
  return (
    <Backdrop
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        flexDirection: 'column',
        gap: 2,
      }}
      open={open}
    >
      <CircularProgress color="inherit" size={60} />
      <Typography variant="h6">{message}</Typography>
    </Backdrop>
  );
};

export default LoadingOverlay;

