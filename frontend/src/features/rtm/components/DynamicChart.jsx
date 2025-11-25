// frontend/src/features/rtm/components/DynamicChart.jsx

import React, { memo } from 'react';
import { Grid, Paper, Typography } from '@mui/material'; // Correct import for MUI components
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * Creates a custom dot renderer to highlight anomaly points on the line charts.
 * A dot is rendered if the data point's 'anomalyCauses' array includes the line's dataKey.
 * @param {string} dataKey - The key of the data line to check for anomalies.
 * @returns {function} A React component function for the dot.
 */
const createAnomalyDotRenderer = (dataKey) => (props) => {
    const { cx, cy, payload, index } = props;
    // Check if the current data point is an anomaly for this specific data line
    if (payload.anomalyCauses && payload.anomalyCauses.includes(dataKey)) {
      return <circle key={`anomaly-dot-${index}`} cx={cx} cy={cy} r={6} fill="red" stroke="white" strokeWidth={2} />;
    }
    return null;
  };

/**
 * Dynamic Chart Component: A reusable Recharts LineChart wrapped in MUI components.
 * @param {object} props
 * @param {string} props.title - The title of the chart.
 * @param {Array<{key: string, name: string, color: string, yAxisId: string}>} props.dataKeys - Array of data series to plot.
 * @param {string} props.yAxisLabel - Label for the primary Y-axis.
 * @param {string} [props.yAxisId] - ID for the primary Y-axis (defaults to 'left').
 * @param {string} [props.orientation] - Orientation of the primary Y-axis ('left' or 'right', defaults to 'left').
 * @param {Array<object>} props.data - The chart data array.
 */
const DynamicChart = ({ title, dataKeys, yAxisLabel, yAxisId, orientation, data }) => (
    <Grid item xs={12}>
      <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
        <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2 }}>{title}</Typography>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis 
              dataKey="time" 
              stroke="#8BC34A"
              angle={-45}
              textAnchor="end"
              height={80}
              interval={Math.floor(data.length / 10)}
            />
            <YAxis 
                yAxisId={yAxisId || 'left'} 
                orientation={orientation || 'left'} 
                stroke="#8BC34A"
                // Dynamically set label position based on orientation
                label={{ 
                    value: yAxisLabel, 
                    angle: orientation === 'right' ? 90 : -90, 
                    position: orientation === 'right' ? 'insideRight' : 'insideLeft',
                    fill: '#8BC34A'
                }} 
            />
            {/* Add secondary Y-axis if needed */}
            {dataKeys.some(item => item.orientation === 'right') && (
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#FF9800"
                label={{ 
                  value: dataKeys.find(item => item.orientation === 'right')?.name || '',
                  angle: 90,
                  position: 'insideRight',
                  fill: '#FF9800'
                }}
              />
            )}
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1a1a1a', 
                border: '1px solid #8BC34A',
                color: '#FFF'
              }} 
            />
            <Legend wrapperStyle={{ paddingTop: '20px', color: '#FFFFFF' }} />
            {/* Render a line for each item in dataKeys */}
            {dataKeys.map((item) => (
                <Line 
                    key={item.key}
                    yAxisId={item.yAxisId || yAxisId || 'left'} 
                    type="monotone" 
                    dataKey={item.key} 
                    // Use provided color or generate a random one
                    stroke={item.color || `#${(Math.random()*0xFFFFFF<<0).toString(16).padStart(6, '0')}`} 
                    name={item.name} 
                    strokeWidth={2}
                    dot={false}
                    // Apply custom dot renderer for anomalies, except for 'Efficiency'
                    // dot={item.key === 'Efficiency' ? false : createAnomalyDotRenderer(item.key)} 
                    isAnimationActive={false} // Disable animation for performance
                />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Paper>
    </Grid>
  );

// Use React.memo to prevent unnecessary re-renders
export default memo(DynamicChart);