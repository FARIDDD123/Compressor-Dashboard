// src/pages/Control.jsx

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Paper, Typography, Button, ButtonGroup, Slider, Grid } from '@mui/material';
import PageHeader from '../components/common/PageHeader';
import { fetchControlStatus, postControlUpdate, setLocalParameters } from '../features/control/controlSlice';

// Icons
import SettingsIcon from '@mui/icons-material/Settings';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';

const Control = () => {
  const dispatch = useDispatch();
  const { controlMode, systemState, parameters } = useSelector((state) => state.control);

  useEffect(() => {
    dispatch(fetchControlStatus());
  }, [dispatch]);

  const handleModeChange = (mode) => {
    dispatch(postControlUpdate({ controlMode: mode }));
  };

  const handleSystemStateChange = (state) => {
    dispatch(postControlUpdate({ systemState: state }));
  };

  const handleSliderChange = (param, value) => {
    dispatch(setLocalParameters({ [param]: value }));
  };

  const handleApplySettings = () => {
    dispatch(postControlUpdate({ parameters }));
  };

  return (
    <Box>
      <PageHeader
        title="System Control"
        subtitle="Manage and override compressor operational parameters."
      />
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Operational Mode</Typography>
            <ButtonGroup variant="outlined" sx={{ mb: 4 }}>
              <Button onClick={() => handleModeChange('auto')} variant={controlMode === 'auto' ? 'contained' : 'outlined'}>Auto</Button>
              <Button onClick={() => handleModeChange('manual')} variant={controlMode === 'manual' ? 'contained' : 'outlined'}>Manual</Button>
            </ButtonGroup>

            <Typography variant="h6" gutterBottom>System State</Typography>
            <ButtonGroup variant="outlined" color="secondary" sx={{ mb: 4 }}>
              <Button onClick={() => handleSystemStateChange('running')} startIcon={<PlayArrowIcon />} variant={systemState === 'running' ? 'contained' : 'outlined'}>Run</Button>
              <Button onClick={() => handleSystemStateChange('paused')} startIcon={<PauseIcon />} variant={systemState === 'paused' ? 'contained' : 'outlined'}>Pause</Button>
              <Button onClick={() => handleSystemStateChange('stopped')} startIcon={<StopIcon />} variant={systemState === 'stopped' ? 'contained' : 'outlined'}>Stop</Button>
            </ButtonGroup>

            <Button variant="contained" color="error" startIcon={<PowerSettingsNewIcon />} fullWidth>
              Emergency Stop
            </Button>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Manual Parameters</Typography>

            <Typography id="pressure-slider" gutterBottom>Target Pressure: {parameters.targetPressure} bar</Typography>
            <Slider
              value={parameters.targetPressure}
              onChange={(e, val) => handleSliderChange('targetPressure', val)}
              aria-labelledby="pressure-slider"
              valueLabelDisplay="auto"
              min={50} max={120}
              disabled={controlMode === 'auto'}
            />

            <Typography id="temp-slider" gutterBottom>Target Temperature: {parameters.targetTemperature}°C</Typography>
            <Slider
              value={parameters.targetTemperature}
              onChange={(e, val) => handleSliderChange('targetTemperature', val)}
              aria-labelledby="temp-slider"
              valueLabelDisplay="auto"
              min={40} max={100}
              disabled={controlMode === 'auto'}
            />

            <Button variant="contained" onClick={handleApplySettings} disabled={controlMode === 'auto'} sx={{ mt: 2 }}>
              Apply Manual Settings
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Control;