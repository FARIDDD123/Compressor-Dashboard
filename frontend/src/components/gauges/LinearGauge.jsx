/**
 * Linear/Vertical Gauge Component
 * Simple circular display with value (same as CircularGauge for consistency)
 */

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const LinearGauge = ({
  value = 0,
  min = 0,
  max = 100,
  label = '',
  unit = '',
  height = 200,
  width = 60,
  warningThreshold = 70,
  criticalThreshold = 90,
}) => {
  const percentage = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);

  const getColor = () => {
    if (percentage >= criticalThreshold) return '#F44336'; // Red
    if (percentage >= warningThreshold) return '#FF9800'; // Orange
    return '#8BC34A'; // Green
  };

  // Use smaller circle for linear gauge
  const circleSize = 100;

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        border: '1px solid #4CAF50',
        borderRadius: '8px',
        minWidth: circleSize + 40,
      }}
    >
      {/* Label */}
      <Typography
        variant="caption"
        sx={{
          color: '#8BC34A',
          fontWeight: 600,
          textAlign: 'center',
          mb: 2,
          fontSize: '0.75rem',
        }}
      >
        {label}
      </Typography>

      {/* Circle with Value */}
      <Box
        sx={{
          width: circleSize,
          height: circleSize,
          borderRadius: '50%',
          border: `4px solid ${getColor()}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          position: 'relative',
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '1.5rem',
            lineHeight: 1,
          }}
        >
          {typeof value === 'number' ? value.toFixed(0) : value}
        </Typography>
        {unit && (
          <Typography
            variant="caption"
            sx={{
              color: '#B0BEC5',
              fontSize: '0.65rem',
              mt: 0.5,
            }}
          >
            {unit}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default LinearGauge;

