/**
 * Test Charts Page - برای دیباگ
 * صفحه ساده برای تست نمودارها
 */

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// داده‌های ساده تست
const testData = [
  { name: 'A', value: 10 },
  { name: 'B', value: 30 },
  { name: 'C', value: 20 },
  { name: 'D', value: 40 },
  { name: 'E', value: 25 },
];

const TestChartsPage = () => {
  console.log('TestChartsPage rendered');
  console.log('Test Data:', testData);

  return (
    <Box sx={{ p: 3, backgroundColor: '#000000', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ color: '#8BC34A', mb: 3 }}>
        🧪 Test Charts Page
      </Typography>

      {/* تست 1: Line Chart ساده */}
      <Paper sx={{ p: 2, mb: 3, backgroundColor: '#1a1a1a' }}>
        <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 2 }}>
          ✅ Test 1: Simple Line Chart
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={testData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" stroke="#8BC34A" />
            <YAxis stroke="#8BC34A" />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#8BC34A" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      {/* تست 2: Bar Chart ساده */}
      <Paper sx={{ p: 2, mb: 3, backgroundColor: '#1a1a1a' }}>
        <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 2 }}>
          ✅ Test 2: Simple Bar Chart
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={testData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" stroke="#8BC34A" />
            <YAxis stroke="#8BC34A" />
            <Tooltip />
            <Bar dataKey="value" fill="#8BC34A" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      {/* نتیجه */}
      <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
        <Typography variant="body1" sx={{ color: '#FFFFFF' }}>
          ✅ اگر نمودارها را می‌بینید → recharts کار می‌کند!
        </Typography>
        <Typography variant="body1" sx={{ color: '#FFFFFF', mt: 1 }}>
          ❌ اگر نمودارها نیستند → Console را چک کنید (F12)
        </Typography>
      </Paper>
    </Box>
  );
};

export default TestChartsPage;

