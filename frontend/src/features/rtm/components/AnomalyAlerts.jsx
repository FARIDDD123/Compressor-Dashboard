import React, { useMemo, memo } from 'react';
import { FixedSizeList } from 'react-window';
import { 
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

// Memoized helper functions
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

// Memoized Alert Item Component
const AlertItem = memo(({ index, style, data }) => {
  const alert = data[index];
  const severityColor = getSeverityColor(alert.severity);

  return (
    <div style={style}>
      <Paper
        elevation={1}
        sx={{
          mb: 1,
          mx: 1,
          backgroundColor: alert.severity === 'Critical' ? 'rgba(244, 67, 54, 0.05)' : 
                          alert.severity === 'Warning' ? 'rgba(255, 152, 0, 0.05)' : 
                          'rgba(33, 150, 243, 0.05)',
          border: `1px solid ${severityColor}`,
          borderLeft: `4px solid ${severityColor}`,
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
              color: severityColor
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
                    backgroundColor: severityColor,
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
                    borderColor: severityColor,
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
    </div>
  );
});

AlertItem.displayName = 'AlertItem';

// Main AlertsList Component with Virtualization
const AlertsList = ({ alerts, height = 400 }) => {
  // Use virtualization for lists with more than 20 items
  const shouldVirtualize = alerts.length > 20;
  const itemHeight = 120; // Estimated height per item

  const itemData = useMemo(() => alerts, [alerts]);

  if (alerts.length === 0) {
    return (
      <Box sx={{ py: 4 }}>
        <Typography variant="body1" sx={{ textAlign: 'center', color: '#666666' }}>
          No alerts to display.
        </Typography>
      </Box>
    );
  }

  // Use virtualization for large lists
  if (shouldVirtualize) {
    return (
      <FixedSizeList
        height={height}
        itemCount={alerts.length}
        itemSize={itemHeight}
        itemData={itemData}
        width="100%"
        overscanCount={5} // Render 5 extra items for smoother scrolling
      >
        {AlertItem}
      </FixedSizeList>
    );
  }

  // Render small lists normally
  return (
    <Box>
      {alerts.map((alert, index) => (
        <AlertItem
          key={`${alert.id}-${index}`}
          index={index}
          style={{}}
          data={itemData}
        />
      ))}
    </Box>
  );
};

export default memo(AlertsList);