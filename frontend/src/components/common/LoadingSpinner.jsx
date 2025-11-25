// src/components/common/LoadingSpinner.jsx

import React from 'react';
import { Box, CircularProgress } from '@mui/material';

const LoadingSpinner = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
    <CircularProgress />
  </Box>
);

export default LoadingSpinner;