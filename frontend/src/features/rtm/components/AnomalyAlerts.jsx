import React from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  Chip, 
  Box, 
  Typography, 
  Paper 
} from '@mui/material';
import { 
  Warning as WarningIcon, 
  Error as ErrorIcon, 
  Info as InfoIcon 
} from '@mui/icons-material';

const AlertsList = ({ alerts }) => {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical':
        return '#F44336';
      case 'Warning':
        return '#FF9800';
      case 'Info':
        return '#2196F3';
      default:
        return '#666666';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'Critical':
        return <ErrorIcon sx={{ fontSize: 20 }} />;
      case 'Warning':
        return <WarningIcon sx={{ fontSize: 20 }} />;
      case 'Info':
        return <InfoIcon sx={{ fontSize: 20 }} />;
      default:
        return <InfoIcon sx={{ fontSize: 20 }} />;
    }
  };

  return (
    <Box>
      {alerts.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: 'center', color: '#666666', py: 4 }}>
          No alerts to display.
        </Typography>
      ) : (
        <List sx={{ padding: 0 }}>
          {alerts.map((alert, index) => (
            <Paper
              key={`${alert.id}-${index}`}
              elevation={1}
              sx={{
                mb: 1,
                backgroundColor: alert.severity === 'Critical' ? 'rgba(244, 67, 54, 0.05)' : 
                                alert.severity === 'Warning' ? 'rgba(255, 152, 0, 0.05)' : 
                                'rgba(33, 150, 243, 0.05)',
                border: `1px solid ${getSeverityColor(alert.severity)}`,
                borderLeft: `4px solid ${getSeverityColor(alert.severity)}`,
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: 3,
                  transform: 'translateX(4px)',
                }
              }}
            >
              <ListItem>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mr: 2,
                    color: getSeverityColor(alert.severity)
                  }}
                >
                  {getSeverityIcon(alert.severity)}
                </Box>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#FFFFFF' }}>
                        {alert.message}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                      <Chip 
                        label={alert.severity || 'Info'} 
                        size="small"
                        sx={{ 
                          backgroundColor: getSeverityColor(alert.severity),
                          color: '#FFFFFF',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          height: 22
                        }}
                      />
                      <Chip 
                        label={alert.source || 'System'} 
                        size="small"
                        variant="outlined"
                        sx={{ 
                          borderColor: getSeverityColor(alert.severity),
                          color: '#FFFFFF',
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          fontSize: '0.7rem',
                          height: 22
                        }}
                      />
                      <Typography variant="caption" sx={{ color: '#999999', ml: 'auto', fontSize: '0.75rem' }}>
                        🕒 {alert.display_timestamp || alert.timestamp}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            </Paper>
          ))}
        </List>
      )}
    </Box>
  );
};

export default AlertsList;