// src/pages/Maintenance.jsx

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Paper, Typography, Grid, List, ListItem, ListItemIcon, ListItemText, Divider, Chip, CircularProgress } from '@mui/material';
import PageHeader from '../components/common/PageHeader';
import { fetchLatestRul } from '../features/pdm/pdmSlice';

// Icons
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DangerousIcon from '@mui/icons-material/Dangerous';

const Maintenance = () => {
  const dispatch = useDispatch();
  const { data, status, error } = useSelector((state) => state.pdm);

  useEffect(() => {
    dispatch(fetchLatestRul());
  }, [dispatch]);

  const getUrgencyChip = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'high': return { color: 'error', icon: <DangerousIcon /> };
      case 'medium': return { color: 'warning', icon: <WarningAmberIcon /> };
      default: return { color: 'info', icon: <CheckCircleOutlineIcon /> };
    }
  };

  const renderContent = () => {
    if (status === 'loading') {
      return <Box display="flex" justifyContent="center"><CircularProgress /></Box>;
    }
  
    if (status === 'failed' || !data) {
      return <Typography color="error" variant="h6">{error || 'No RUL prediction found'}</Typography>;
    }

    return (
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={3} sx={{ textAlign: 'center', p: 3, height: '100%' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Remaining Useful Life (RUL)
            </Typography>
            <Typography variant="h1" component="div" color="primary" sx={{ fontWeight: 'bold' }}>
              {data.rul_value.toFixed(2)}
            </Typography>
            <Typography variant="h5" color="text.secondary">
              days
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Predicted at: {new Date(data.prediction_time).toLocaleString()}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ p: 1 }}>
              Maintenance Recommendations
            </Typography>
            <List>
              {data.recommendations && data.recommendations.map((rec, index) => {
                const { color, icon } = getUrgencyChip(rec.urgency);
                return (
                  <React.Fragment key={rec.id}>
                    <ListItem>
                      <ListItemIcon><BuildCircleIcon color="action" /></ListItemIcon>
                      <ListItemText primary={rec.component} secondary={rec.action} />
                      <Chip label={rec.urgency} color={color} icon={icon} />
                    </ListItem>
                    {index < data.recommendations.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                );
              })}
            </List>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box>
      <PageHeader
        title="Predictive Maintenance (PdM)"
        subtitle="Forecasts and recommendations for compressor component health."
      />
      {renderContent()}
    </Box>
  );
};

export default Maintenance;