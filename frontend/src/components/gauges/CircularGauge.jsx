/**
 * Circular Gauge Component
 * Simple circular display with value
 */

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const CircularGauge = ({
  value = 0,
  min = 0,
  max = 100,
  label = '',
  unit = '',
  width = 150,
  height = 150,
  warningThreshold = 70,
  criticalThreshold = 90,
}) => {
  // Determine color based on value
  const getColor = () => {
    const percentage = ((value - min) / (max - min)) * 100;
    if (percentage >= criticalThreshold) return '#F44336'; // Red
    if (percentage >= warningThreshold) return '#FF9800'; // Orange
    return '#8BC34A'; // Green
  };

  const circleSize = Math.min(width, height) - 20;

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
        minWidth: width,
      }}
    >
      {/* Label */}
      <Typography
        variant="h6"
        sx={{
          color: '#8BC34A',
          fontWeight: 600,
          textAlign: 'center',
          mb: 1,
          fontSize: '0.875rem',
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
          variant="h4"
          sx={{
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: circleSize > 100 ? '1.8rem' : '1.3rem',
            lineHeight: 1,
          }}
        >
          {typeof value === 'number' ? value.toFixed(1) : value}
        </Typography>
        {unit && (
          <Typography
            variant="caption"
            sx={{
              color: '#B0BEC5',
              fontSize: '0.7rem',
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

export default CircularGauge;

