// src/pages/ThermovisionPage.jsx
// Thermal Imaging and Analysis Page

import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Card, CardContent, Slider, Button, IconButton,
  Select, MenuItem, FormControl, InputLabel, ToggleButton, ToggleButtonGroup,
  Alert
} from '@mui/material';
import {
  Thermostat, Camera, Warning, Error as ErrorIcon, CheckCircle, TrendingUp,
  CameraAlt, Refresh, Download, Settings, ZoomIn, ZoomOut, Fullscreen
} from '@mui/icons-material';
import PageHeader from '../components/common/PageHeader';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area, ScatterChart, Scatter, ZAxis
} from 'recharts';

const ThermovisionPage = () => {
  const [selectedCamera, setSelectedCamera] = useState('Camera 1');
  const [temperatureRange, setTemperatureRange] = useState([0, 800]);
  const [colorPalette, setColorPalette] = useState('ironbow');
  const [viewMode, setViewMode] = useState('thermal');

  const [cameras, setCameras] = useState([
    { id: 1, name: 'Camera 1', location: 'Compressor Inlet', status: 'Active', maxTemp: 785, minTemp: 25, avgTemp: 420, resolution: '640x480', fps: 30 },
    { id: 2, name: 'Camera 2', location: 'Turbine Blades', status: 'Active', maxTemp: 1150, minTemp: 180, avgTemp: 720, resolution: '640x480', fps: 30 },
    { id: 3, name: 'Camera 3', location: 'Combustion Chamber', status: 'Active', maxTemp: 1350, minTemp: 420, avgTemp: 980, resolution: '640x480', fps: 30 },
    { id: 4, name: 'Camera 4', location: 'Exhaust Outlet', status: 'Active', maxTemp: 850, minTemp: 120, avgTemp: 550, resolution: '640x480', fps: 30 },
    { id: 5, name: 'Camera 5', location: 'Bearing Housing', status: 'Active', maxTemp: 95, minTemp: 35, avgTemp: 68, resolution: '640x480', fps: 30 },
    { id: 6, name: 'Camera 6', location: 'Generator Stator', status: 'Active', maxTemp: 125, minTemp: 45, avgTemp: 85, resolution: '640x480', fps: 30 },
    { id: 7, name: 'Camera 7', location: 'Fuel System', status: 'Active', maxTemp: 180, minTemp: 20, avgTemp: 95, resolution: '640x480', fps: 30 },
    { id: 8, name: 'Camera 8', location: 'Lubrication System', status: 'Warning', maxTemp: 115, minTemp: 55, avgTemp: 88, resolution: '640x480', fps: 15 },
  ]);

  const [hotspots, setHotspots] = useState([
    { id: 1, location: 'Turbine Blade #3', temperature: 1150, threshold: 1100, severity: 'Critical', timestamp: new Date(Date.now() - 2 * 60000).toLocaleString() },
    { id: 2, location: 'Combustion Zone B', temperature: 1320, threshold: 1300, severity: 'Warning', timestamp: new Date(Date.now() - 5 * 60000).toLocaleString() },
    { id: 3, location: 'Exhaust Pipe Section 2', temperature: 830, threshold: 800, severity: 'Warning', timestamp: new Date(Date.now() - 8 * 60000).toLocaleString() },
    { id: 4, location: 'Bearing #2', temperature: 92, threshold: 90, severity: 'Warning', timestamp: new Date(Date.now() - 12 * 60000).toLocaleString() },
    { id: 5, location: 'Generator Winding', temperature: 118, threshold: 115, severity: 'Warning', timestamp: new Date(Date.now() - 18 * 60000).toLocaleString() },
  ]);

  // Temperature trends over time (last 60 minutes)
  const [temperatureTrends, setTemperatureTrends] = useState(
    Array.from({ length: 60 }, (_, i) => ({
      time: new Date(Date.now() - (60 - i) * 60000).toLocaleTimeString(),
      compressor: 400 + Math.sin(i * 0.15) * 50 + Math.random() * 30,
      turbine: 700 + Math.sin(i * 0.12) * 80 + Math.random() * 40,
      combustion: 950 + Math.sin(i * 0.1) * 100 + Math.random() * 50,
      exhaust: 530 + Math.sin(i * 0.18) * 70 + Math.random() * 35,
      bearing: 65 + Math.sin(i * 0.2) * 8 + Math.random() * 4,
      generator: 82 + Math.sin(i * 0.16) * 10 + Math.random() * 5,
    }))
  );

  // Heat distribution map data (simulated thermal image pixels)
  const [heatMapData, setHeatMapData] = useState(
    Array.from({ length: 100 }, () => ({
      x: Math.random() * 640,
      y: Math.random() * 480,
      temp: Math.random() * 800 + 200,
    }))
  );

  // Thermal statistics
  const [thermalStats, setThermalStats] = useState({
    totalHotspots: 5,
    criticalAlerts: 1,
    warningAlerts: 4,
    avgSystemTemp: 485,
    maxSystemTemp: 1350,
    tempIncreaseRate: 2.3,
    coolingEfficiency: 87,
  });

  // Temperature zones
  const temperatureZones = [
    { zone: 'Compressor Stage', minTemp: 20, maxTemp: 450, currentAvg: 420, status: 'Normal', trend: 'Stable' },
    { zone: 'Combustion Chamber', minTemp: 800, maxTemp: 1400, currentAvg: 980, status: 'Normal', trend: 'Increasing' },
    { zone: 'Turbine Section', minTemp: 500, maxTemp: 1200, currentAvg: 720, status: 'Normal', trend: 'Stable' },
    { zone: 'Exhaust System', minTemp: 300, maxTemp: 900, currentAvg: 550, status: 'Normal', trend: 'Decreasing' },
    { zone: 'Bearings', minTemp: 40, maxTemp: 95, currentAvg: 68, status: 'Normal', trend: 'Stable' },
    { zone: 'Generator', minTemp: 50, maxTemp: 130, currentAvg: 85, status: 'Normal', trend: 'Stable' },
    { zone: 'Lubrication', minTemp: 55, maxTemp: 120, currentAvg: 88, status: 'Warning', trend: 'Increasing' },
  ];

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update temperature trends
      setTemperatureTrends(prev => {
        const newData = [...prev.slice(1), {
          time: new Date().toLocaleTimeString(),
          compressor: Math.max(0, prev[prev.length - 1].compressor + (Math.random() - 0.5) * 10),
          turbine: Math.max(0, prev[prev.length - 1].turbine + (Math.random() - 0.5) * 15),
          combustion: Math.max(0, prev[prev.length - 1].combustion + (Math.random() - 0.5) * 20),
          exhaust: Math.max(0, prev[prev.length - 1].exhaust + (Math.random() - 0.5) * 12),
          bearing: Math.max(0, prev[prev.length - 1].bearing + (Math.random() - 0.5) * 2),
          generator: Math.max(0, prev[prev.length - 1].generator + (Math.random() - 0.5) * 3),
        }];
        return newData;
      });

      // Update cameras
      setCameras(prev => prev.map(cam => ({
        ...cam,
        maxTemp: Math.max(0, cam.maxTemp + (Math.random() - 0.5) * 5),
        avgTemp: Math.max(0, cam.avgTemp + (Math.random() - 0.5) * 3),
      })));

      // Update thermal stats
      setThermalStats(prev => ({
        ...prev,
        avgSystemTemp: Math.max(0, prev.avgSystemTemp + (Math.random() - 0.5) * 5),
        maxSystemTemp: Math.max(0, prev.maxSystemTemp + (Math.random() - 0.5) * 10),
        tempIncreaseRate: Math.max(0, prev.tempIncreaseRate + (Math.random() - 0.5) * 0.5),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical':
        return 'error';
      case 'Warning':
        return 'warning';
      default:
        return 'success';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'Increasing':
        return <TrendingUp sx={{ color: '#F44336', fontSize: 16 }} />;
      case 'Decreasing':
        return <TrendingUp sx={{ color: '#4CAF50', fontSize: 16, transform: 'rotate(180deg)' }} />;
      default:
        return <CheckCircle sx={{ color: '#8BC34A', fontSize: 16 }} />;
    }
  };

  return (
    <Box>
      <PageHeader
        title="Thermovision Monitoring"
        subtitle="Real-time thermal imaging and temperature analysis"
      />

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#1a1a1a', border: '2px solid #FF5722' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Thermostat sx={{ color: '#FF5722', mr: 1 }} />
                <Typography variant="h6" sx={{ color: '#FF5722', fontSize: '0.9rem' }}>
                  Avg System Temp
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ color: '#FFFFFF' }}>
                {thermalStats.avgSystemTemp.toFixed(0)}°C
              </Typography>
              <Typography variant="caption" sx={{ color: '#B0BEC5' }}>
                +{thermalStats.tempIncreaseRate.toFixed(1)}°C/hour
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#1a1a1a', border: '2px solid #F44336' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Warning sx={{ color: '#F44336', mr: 1 }} />
                <Typography variant="h6" sx={{ color: '#F44336', fontSize: '0.9rem' }}>
                  Max Temperature
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ color: '#FFFFFF' }}>
                {thermalStats.maxSystemTemp.toFixed(0)}°C
              </Typography>
              <Typography variant="caption" sx={{ color: '#B0BEC5' }}>
                Combustion Chamber
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#1a1a1a', border: '2px solid #FF9800' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ErrorIcon sx={{ color: '#FF9800', mr: 1 }} />
                <Typography variant="h6" sx={{ color: '#FF9800', fontSize: '0.9rem' }}>
                  Active Hotspots
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ color: '#FFFFFF' }}>
                {thermalStats.totalHotspots}
              </Typography>
              <Typography variant="caption" sx={{ color: '#B0BEC5' }}>
                {thermalStats.criticalAlerts} Critical, {thermalStats.warningAlerts} Warning
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Camera sx={{ color: '#8BC34A', mr: 1 }} />
                <Typography variant="h6" sx={{ color: '#8BC34A', fontSize: '0.9rem' }}>
                  Active Cameras
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ color: '#FFFFFF' }}>
                {cameras.filter(c => c.status === 'Active').length}/{cameras.length}
              </Typography>
              <Typography variant="caption" sx={{ color: '#B0BEC5' }}>
                Cooling Efficiency: {thermalStats.coolingEfficiency}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Temperature Trends Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #FF5722' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: '#FF5722' }}>
                Temperature Trends (Last 60 Minutes)
              </Typography>
              <IconButton sx={{ color: '#FF5722' }}>
                <Refresh />
              </IconButton>
            </Box>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={temperatureTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="time" stroke="#FF5722" interval={9} angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#FF5722" label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft', fill: '#FF5722' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #FF5722', color: '#FFF' }} />
                <Legend />
                <Line type="monotone" dataKey="compressor" stroke="#8BC34A" name="Compressor" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="turbine" stroke="#FF9800" name="Turbine" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="combustion" stroke="#F44336" name="Combustion" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="exhaust" stroke="#9C27B0" name="Exhaust" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="bearing" stroke="#2196F3" name="Bearing" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="generator" stroke="#00BCD4" name="Generator" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Camera Controls & View */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #2196F3', height: '100%' }}>
            <Typography variant="h6" sx={{ color: '#2196F3', mb: 2 }}>
              Thermal Camera View
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel sx={{ color: '#2196F3' }}>Select Camera</InputLabel>
              <Select
                value={selectedCamera}
                onChange={(e) => setSelectedCamera(e.target.value)}
                label="Select Camera"
                sx={{ color: '#FFFFFF' }}
              >
                {cameras.map((cam) => (
                  <MenuItem key={cam.id} value={cam.name}>
                    {cam.name} - {cam.location}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Simulated Thermal View */}
            <Box
              sx={{
                width: '100%',
                height: 200,
                background: 'linear-gradient(45deg, #000000 0%, #FF5722 50%, #FFEB3B 100%)',
                border: '2px solid #FF5722',
                borderRadius: 1,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <CameraAlt sx={{ fontSize: 60, color: 'rgba(255,255,255,0.3)' }} />
              <Typography
                sx={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  color: '#FFF',
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  px: 1,
                  borderRadius: 1,
                  fontSize: '0.8rem',
                }}
              >
                {selectedCamera}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ color: '#B0BEC5', mb: 1 }}>
                Color Palette
              </Typography>
              <ToggleButtonGroup
                value={colorPalette}
                exclusive
                onChange={(e, val) => val && setColorPalette(val)}
                size="small"
                fullWidth
              >
                <ToggleButton value="ironbow" sx={{ color: '#FF5722' }}>Ironbow</ToggleButton>
                <ToggleButton value="rainbow" sx={{ color: '#2196F3' }}>Rainbow</ToggleButton>
                <ToggleButton value="grayscale" sx={{ color: '#B0BEC5' }}>Gray</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ color: '#B0BEC5', mb: 1 }}>
                Temperature Range: {temperatureRange[0]}°C - {temperatureRange[1]}°C
              </Typography>
              <Slider
                value={temperatureRange}
                onChange={(e, val) => setTemperatureRange(val)}
                valueLabelDisplay="auto"
                min={0}
                max={1500}
                sx={{ color: '#FF5722' }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" startIcon={<ZoomIn />} size="small" sx={{ color: '#8BC34A', borderColor: '#8BC34A' }}>
                Zoom
              </Button>
              <Button variant="outlined" startIcon={<Download />} size="small" sx={{ color: '#2196F3', borderColor: '#2196F3' }}>
                Export
              </Button>
              <Button variant="outlined" startIcon={<Fullscreen />} size="small" sx={{ color: '#FF9800', borderColor: '#FF9800' }}>
                Full
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Hotspots Table */}
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #F44336' }}>
            <Typography variant="h6" sx={{ color: '#F44336', mb: 2 }}>
              Active Temperature Hotspots
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#F44336', backgroundColor: '#0a0a0a' }}>Location</TableCell>
                    <TableCell sx={{ color: '#F44336', backgroundColor: '#0a0a0a' }}>Temperature</TableCell>
                    <TableCell sx={{ color: '#F44336', backgroundColor: '#0a0a0a' }}>Threshold</TableCell>
                    <TableCell sx={{ color: '#F44336', backgroundColor: '#0a0a0a' }}>Severity</TableCell>
                    <TableCell sx={{ color: '#F44336', backgroundColor: '#0a0a0a' }}>Timestamp</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {hotspots.map((spot) => (
                    <TableRow key={spot.id} hover>
                      <TableCell sx={{ color: '#FFFFFF' }}>{spot.location}</TableCell>
                      <TableCell sx={{ color: '#FF5722', fontWeight: 'bold' }}>{spot.temperature}°C</TableCell>
                      <TableCell sx={{ color: '#B0BEC5' }}>{spot.threshold}°C</TableCell>
                      <TableCell>
                        <Chip
                          label={spot.severity}
                          size="small"
                          color={getSeverityColor(spot.severity)}
                          sx={{ fontSize: '0.7rem' }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#B0BEC5', fontSize: '0.85rem' }}>{spot.timestamp}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Temperature Zones */}
        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #FF9800' }}>
            <Typography variant="h6" sx={{ color: '#FF9800', mb: 2 }}>
              Temperature Zones Status
            </Typography>
            <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
              {temperatureZones.map((zone, index) => (
                <Box
                  key={index}
                  sx={{
                    mb: 2,
                    p: 1.5,
                    backgroundColor: '#0a0a0a',
                    borderRadius: 1,
                    border: `1px solid ${zone.status === 'Warning' ? '#FF9800' : '#333'}`,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body1" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                      {zone.zone}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {getTrendIcon(zone.trend)}
                      <Chip
                        label={zone.status}
                        size="small"
                        color={zone.status === 'Normal' ? 'success' : 'warning'}
                        sx={{ fontSize: '0.65rem', height: 20 }}
                      />
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#FF5722', mb: 0.5 }}>
                    Current Avg: <strong>{zone.currentAvg}°C</strong>
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#B0BEC5' }}>
                    Range: {zone.minTemp}°C - {zone.maxTemp}°C • Trend: {zone.trend}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Camera Status Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2 }}>
              Thermal Camera Status
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#8BC34A', backgroundColor: '#0a0a0a' }}>Camera</TableCell>
                    <TableCell sx={{ color: '#8BC34A', backgroundColor: '#0a0a0a' }}>Location</TableCell>
                    <TableCell sx={{ color: '#8BC34A', backgroundColor: '#0a0a0a' }}>Status</TableCell>
                    <TableCell sx={{ color: '#8BC34A', backgroundColor: '#0a0a0a' }}>Max Temp</TableCell>
                    <TableCell sx={{ color: '#8BC34A', backgroundColor: '#0a0a0a' }}>Min Temp</TableCell>
                    <TableCell sx={{ color: '#8BC34A', backgroundColor: '#0a0a0a' }}>Avg Temp</TableCell>
                    <TableCell sx={{ color: '#8BC34A', backgroundColor: '#0a0a0a' }}>Resolution</TableCell>
                    <TableCell sx={{ color: '#8BC34A', backgroundColor: '#0a0a0a' }}>FPS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cameras.map((cam) => (
                    <TableRow key={cam.id} hover>
                      <TableCell sx={{ color: '#FFFFFF' }}>{cam.name}</TableCell>
                      <TableCell sx={{ color: '#B0BEC5' }}>{cam.location}</TableCell>
                      <TableCell>
                        <Chip
                          label={cam.status}
                          size="small"
                          color={cam.status === 'Active' ? 'success' : 'warning'}
                          sx={{ fontSize: '0.7rem' }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#F44336', fontWeight: 'bold' }}>{cam.maxTemp.toFixed(0)}°C</TableCell>
                      <TableCell sx={{ color: '#2196F3' }}>{cam.minTemp.toFixed(0)}°C</TableCell>
                      <TableCell sx={{ color: '#FF9800' }}>{cam.avgTemp.toFixed(0)}°C</TableCell>
                      <TableCell sx={{ color: '#B0BEC5' }}>{cam.resolution}</TableCell>
                      <TableCell sx={{ color: cam.fps < 30 ? '#FF9800' : '#8BC34A' }}>{cam.fps}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ThermovisionPage;

