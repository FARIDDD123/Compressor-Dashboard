// src/components/common/PageHeader.jsx

import React from 'react';
// --- THIS IS THE FIX: Add 'Box' to the import statement ---
import { Typography, Box } from '@mui/material';

const PageHeader = ({ title, subtitle }) => (
  <Box sx={{ mb: 4 }}>
    <Typography variant="h4" component="h1" gutterBottom>
      {title}
    </Typography>
    {subtitle && (
      <Typography variant="subtitle1" color="text.secondary">
        {subtitle}
      </Typography>
    )}
  </Box>
);

export default PageHeader;