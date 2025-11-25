// src/pages/SystemOverview.jsx (or Overview.jsx)

import React, { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Grid, CircularProgress, Icon, Paper, Typography, Chip } from '@mui/material';
import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/common/StatCard'; // Assuming StatCard exists here

// --- Actions and New Icons ---
import { fetchLatestRul } from '../features/pdm/pdmSlice';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import DangerousIcon from '@mui/icons-material/Dangerous';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SpeedIcon from '@mui/icons-material/Speed';
import ErrorIcon from '@mui/icons-material/Error';

const SystemOverview = () => {
  const dispatch = useDispatch();

  // --- Data fetching logic remains the same ---
  const { liveData, alerts } = useSelector((state) => state.rtm);
  const { data: pdmData, status: pdmStatus } = useSelector((state) => state.pdm);

  useEffect(() => {
    dispatch(fetchLatestRul());
  }, [dispatch]);

  // --- Calculation logic remains the same ---
  const alerts8hCount = useMemo(() => {
    const eightHoursAgo = Date.now() - (8 * 60 * 60 * 1000);
    return alerts.filter(alert => 
      new Date(alert.iso_timestamp).getTime() >= eightHoursAgo
    ).length;
  }, [alerts]);

  const avgEfficiency = useMemo(() => {
    if (!liveData || liveData.length === 0) return { value: 'N/A', unit: '%' };
    const total = liveData.reduce((sum, point) => sum + point.Efficiency, 0);
    return { value: (total / liveData.length).toFixed(1), unit: '%' };
  }, [liveData]);
  
  const systemStatus = useMemo(() => {
    if (pdmStatus !== 'succeeded' || !pdmData) {
      return { text: 'Loading...', icon: <CircularProgress size="large" />, color: 'text.secondary' };
    }
    const rul = pdmData.rul_value;
    if (rul > 30) {
      return { text: 'Normal', icon: <CheckCircleIcon fontSize="large" />, color: 'success.main' };
    }
    if (rul > 7) {
      return { text: 'Warning', icon: <WarningIcon fontSize="large" />, color: 'warning.main' };
    }
    return { text: 'Critical', icon: <DangerousIcon fontSize="large" />, color: 'error.main' };
  }, [pdmData, pdmStatus]);

  const rulValue = useMemo(() => {
    if (pdmStatus !== 'succeeded' || !pdmData) return { value: '...', unit: 'days' };
    return { value: pdmData.rul_value.toFixed(0), unit: 'days' };
  }, [pdmData, pdmStatus]);

  // Database/CSM data
  const databaseConnections = [
    { name: 'InfluxDB', status: 'Connected', records: '2.5M', lastSync: '2 min ago' },
    { name: 'PostgreSQL', status: 'Connected', records: '850K', lastSync: '1 min ago' },
    { name: 'MySQL', status: 'Connected', records: '1.2M', lastSync: '30 sec ago' },
    { name: 'MongoDB', status: 'Warning', records: '450K', lastSync: '5 min ago' },
  ];

  const csmData = [
    { metric: 'CPU Usage', value: '45%', status: 'Normal' },
    { metric: 'Memory Usage', value: '62%', status: 'Normal' },
    { metric: 'Disk I/O', value: '78%', status: 'Warning' },
    { metric: 'Network Latency', value: '12ms', status: 'Normal' },
    { metric: 'Active Connections', value: '234', status: 'Normal' },
    { metric: 'Queue Depth', value: '15', status: 'Normal' },
  ];

  return (
    <Box>
      <PageHeader
        title="System Overview"
        subtitle="A high-level summary of the compressor's current health"
      />
      <Grid container spacing={3}>
        {/* --- Using StatCard with new icons and dynamic data --- */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="System Status"
            value={systemStatus.text}
            icon={systemStatus.icon}
            color={systemStatus.color}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Remaining Useful Life"
            value={rulValue.value}
            unit={rulValue.unit}
            icon={<ScheduleIcon fontSize="large" />}
            color="info.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Avg. Efficiency"
            value={avgEfficiency.value}
            unit={avgEfficiency.unit}
            icon={<SpeedIcon fontSize="large" />}
            color="warning.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Alerts (8h)"
            value={alerts8hCount}
            icon={<ErrorIcon fontSize="large" />}
            color={alerts8hCount > 0 ? 'error.main' : 'text.secondary'}
          />
        </Grid>

        {/* Database Connections */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#8BC34A' }}>
              Database Connections
            </Typography>
            <Box sx={{ mt: 2 }}>
              {databaseConnections.map((db) => (
                <Box key={db.name} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, p: 1, bgcolor: '#1a1a1a', borderRadius: 1 }}>
                  <Box>
                    <Typography variant="body1" sx={{ color: '#FFFFFF', fontWeight: 600 }}>{db.name}</Typography>
                    <Typography variant="caption" sx={{ color: '#B0BEC5' }}>{db.records} records</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" sx={{ color: db.status === 'Connected' ? '#4CAF50' : '#FF9800' }}>
                      {db.status}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#B0BEC5' }}>{db.lastSync}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* CSM Metrics */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#8BC34A' }}>
              CSM System Metrics
            </Typography>
            <Box sx={{ mt: 2 }}>
              {csmData.map((item) => (
                <Box key={item.metric} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, p: 1, bgcolor: '#1a1a1a', borderRadius: 1 }}>
                  <Typography variant="body1" sx={{ color: '#FFFFFF' }}>{item.metric}</Typography>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ color: '#8BC34A', fontWeight: 600 }}>{item.value}</Typography>
                    <Chip
                      label={item.status}
                      size="small"
                      color={item.status === 'Normal' ? 'success' : 'warning'}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SystemOverview;