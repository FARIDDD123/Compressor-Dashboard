// src/pages/Optimization.jsx

import React, { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Paper, Typography, Button, CircularProgress } from '@mui/material';
import PageHeader from '../components/common/PageHeader';
import { fetchEfficiencyHistory } from '../features/rto/rtoSlice';
import { showSnackbar } from '../features/ui/uiSlice';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BoltIcon from '@mui/icons-material/Bolt';

// Custom component for Tooltip (remains the same)
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <Paper elevation={3} sx={{ padding: '10px', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {`Time: ${new Date(label).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                </Typography>
                <Typography variant="body2" color="primary">
                    {`Efficiency: ${payload[0].value.toFixed(2)}%`}
                </Typography>
            </Paper>
        );
    }
    return null;
};

// Suggestion Card Component (remains the same)
const SuggestionCard = () => {
    const dispatch = useDispatch();
    const { suggestion, status, error } = useSelector((state) => state.rto);

    const handleApply = () => {
        dispatch(showSnackbar({ 
          message: "Suggestion Sent to Control System!", 
          severity: "success" 
        }));
    };

    if (status === 'loading' && !suggestion) return <CircularProgress />;
    if (status === 'failed' || !suggestion) {
        return (
            <Paper elevation={3} sx={{ p: 3, backgroundColor: 'error.light' }}>
                <Typography color="error.contrastText">{error?.suggestion_text || 'Awaiting new RTO suggestion.'}</Typography>
            </Paper>
        );
    }
    return (
        <Paper elevation={3} sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3,
                                     backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
            <BoltIcon sx={{ fontSize: 60 }} />
            <Box>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                    Optimization Suggestion
                </Typography>
                <Typography variant="body1">{suggestion.suggestion_text}</Typography>
            </Box>
            <Button 
                variant="contained" 
                color="secondary" 
                startIcon={<CheckCircleIcon />}
                sx={{ ml: 'auto', whiteSpace: 'nowrap' }}
                onClick={handleApply}
            >
                Apply Suggestion
            </Button>
        </Paper>
    );
};

// Main page component
const Optimization = () => {
  const dispatch = useDispatch();
  const { history, historyStatus } = useSelector((state) => state.rto);

  useEffect(() => {
    // Fetch initial data immediately on load
    dispatch(fetchEfficiencyHistory());

    // Set up an interval to refetch the history every 10 seconds
    const interval = setInterval(() => {
        dispatch(fetchEfficiencyHistory());
    }, 10000); // Fetches new data every 10 seconds

    // Clean up the interval when the component is unmounted
    return () => clearInterval(interval);
  }, [dispatch]);
  
  // Processing historical data to remove duplicates
  const processedHistory = useMemo(() => {
    if (!history || history.length === 0) return [];
    const uniqueTimePoints = new Map();
    history.forEach(point => {
      uniqueTimePoints.set(point.time, point);
    });
    return Array.from(uniqueTimePoints.values());
  }, [history]);

  return (
    <Box>
      <PageHeader
        title="Real-Time Optimization (RTO)"
        subtitle="Live recommendations to improve operational efficiency."
      />
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* SuggestionCard now updates automatically via WebSocket and Redux */}
        <SuggestionCard />

        {/* The chart section remains the same */}
        <Paper elevation={3} sx={{ p: 3, height: '400px', width: '100%' }}>
            <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                <TrendingUpIcon color="action" sx={{mr: 1}}/>
                <Typography variant="h6">Efficiency Trend (Last 24 Hours)</Typography>
            </Box>
            {historyStatus === 'loading' ? <CircularProgress /> : (
                <ResponsiveContainer width="100%" height="90%">
                    <LineChart 
                        data={processedHistory} 
                        margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" tickFormatter={(timeStr) => new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
                        <YAxis 
                            domain={[0, 100]} 
                            label={{ value: 'Efficiency (%)', angle: -90, position: 'insideLeft', offset: -15, style: { textAnchor: 'middle' } }}
                            tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line type="monotone" dataKey="efficiency" stroke="#8884d8" name="Efficiency" activeDot={{ r: 8 }} isAnimationActive={false} />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </Paper>
      </Box>
    </Box>
  );
};

export default Optimization;