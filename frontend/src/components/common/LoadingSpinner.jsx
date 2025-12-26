// src/components/common/LoadingSpinner.jsx

import React, { memo } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingSpinner = memo(({ message = 'Loading...', size = 40 }) => (
  <Box 
    sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      p: 4,
      gap: 2
    }}
  >
    <CircularProgress size={size} sx={{ color: '#8BC34A' }} />
    {message && (
      <Typography variant="body2" sx={{ color: '#8BC34A' }}>
        {message}
      </Typography>
    )}
  </Box>
));

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;