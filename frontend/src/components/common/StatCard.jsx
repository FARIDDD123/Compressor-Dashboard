// src/components/common/StatCard.jsx

import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const StatCard = ({ title, value, unit, icon, color = 'text.primary' }) => {
  return (
    <Card sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
      <Box sx={{ mr: 2, color: color }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h5" component="div" fontWeight="bold">
          {value}
          {unit && <Typography variant="caption" sx={{ ml: 0.5 }}>{unit}</Typography>}
        </Typography>
      </Box>
    </Card>
  );
};

export default StatCard;