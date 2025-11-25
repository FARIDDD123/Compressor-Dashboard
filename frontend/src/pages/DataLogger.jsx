// src/pages/DataLogger.jsx

import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Card, CardContent, Button, IconButton, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import PageHeader from '../components/common/PageHeader';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

const DataLogger = () => {
  const [loggers, setLoggers] = useState([
    {
      id: 1,
      name: 'Pressure Logger',
      type: 'Pressure Sensors',
      status: 'Active',
      samplingRate: '10 Hz',
      dataPoints: 125000,
      fileSize: '2.5 MB',
      lastRecord: new Date().toLocaleString(),
      location: 'Compressor Stage 1',
      format: 'CSV',
      bufferUsage: '65%',
      errors: 0,
      warnings: 2,
    },
    {
      id: 2,
      name: 'Temperature Logger',
      type: 'Temperature Sensors',
      status: 'Active',
      samplingRate: '5 Hz',
      dataPoints: 62500,
      fileSize: '1.2 MB',
      lastRecord: new Date(Date.now() - 2000).toLocaleString(),
      location: 'Turbine Inlet',
      format: 'CSV',
      bufferUsage: '42%',
      errors: 0,
      warnings: 0,
    },
    {
      id: 3,
      name: 'Vibration Logger',
      type: 'Vibration Sensors',
      status: 'Active',
      samplingRate: '100 Hz',
      dataPoints: 1250000,
      fileSize: '15.8 MB',
      lastRecord: new Date(Date.now() - 1000).toLocaleString(),
      location: 'Bearing Assembly',
      format: 'Binary',
      bufferUsage: '88%',
      errors: 0,
      warnings: 5,
    },
    {
      id: 4,
      name: 'Flow Logger',
      type: 'Flow Meters',
      status: 'Active',
      samplingRate: '1 Hz',
      dataPoints: 12500,
      fileSize: '0.3 MB',
      lastRecord: new Date(Date.now() - 3000).toLocaleString(),
      location: 'Inlet Duct',
      format: 'CSV',
      bufferUsage: '28%',
      errors: 0,
      warnings: 1,
    },
    {
      id: 5,
      name: 'Power Logger',
      type: 'Power Meters',
      status: 'Active',
      samplingRate: '2 Hz',
      dataPoints: 25000,
      fileSize: '0.6 MB',
      lastRecord: new Date(Date.now() - 2000).toLocaleString(),
      location: 'Control Panel',
      format: 'CSV',
      bufferUsage: '35%',
      errors: 0,
      warnings: 0,
    },
    {
      id: 6,
      name: 'Efficiency Logger',
      type: 'Calculated',
      status: 'Paused',
      samplingRate: '0.5 Hz',
      dataPoints: 6250,
      fileSize: '0.15 MB',
      lastRecord: new Date(Date.now() - 60000).toLocaleString(),
      location: 'System Level',
      format: 'JSON',
      bufferUsage: '12%',
      errors: 1,
      warnings: 3,
    },
    {
      id: 7,
      name: 'Emissions Logger',
      type: 'Gas Analyzers',
      status: 'Active',
      samplingRate: '0.1 Hz',
      dataPoints: 1250,
      fileSize: '0.08 MB',
      lastRecord: new Date(Date.now() - 10000).toLocaleString(),
      location: 'Exhaust Stack',
      format: 'CSV',
      bufferUsage: '15%',
      errors: 0,
      warnings: 1,
    },
    {
      id: 8,
      name: 'Control Logger',
      type: 'Control Signals',
      status: 'Active',
      samplingRate: '20 Hz',
      dataPoints: 250000,
      fileSize: '5.2 MB',
      lastRecord: new Date().toLocaleString(),
      location: 'Control System',
      format: 'Binary',
      bufferUsage: '72%',
      errors: 0,
      warnings: 0,
    },
    {
      id: 9,
      name: 'Acoustic Logger',
      type: 'Sound Sensors',
      status: 'Active',
      samplingRate: '50 Hz',
      dataPoints: 625000,
      fileSize: '8.5 MB',
      lastRecord: new Date(Date.now() - 1500).toLocaleString(),
      location: 'Combustion Chamber',
      format: 'Binary',
      bufferUsage: '55%',
      errors: 0,
      warnings: 2,
    },
    {
      id: 10,
      name: 'Torque Logger',
      type: 'Torque Sensors',
      status: 'Active',
      samplingRate: '10 Hz',
      dataPoints: 125000,
      fileSize: '2.8 MB',
      lastRecord: new Date(Date.now() - 500).toLocaleString(),
      location: 'Main Shaft',
      format: 'CSV',
      bufferUsage: '48%',
      errors: 0,
      warnings: 1,
    },
    {
      id: 11,
      name: 'Speed Logger',
      type: 'RPM Sensors',
      status: 'Active',
      samplingRate: '5 Hz',
      dataPoints: 62500,
      fileSize: '1.5 MB',
      lastRecord: new Date(Date.now() - 800).toLocaleString(),
      location: 'Turbine Rotor',
      format: 'CSV',
      bufferUsage: '38%',
      errors: 0,
      warnings: 0,
    },
    {
      id: 12,
      name: 'Fuel Logger',
      type: 'Fuel System',
      status: 'Active',
      samplingRate: '1 Hz',
      dataPoints: 12500,
      fileSize: '0.4 MB',
      lastRecord: new Date(Date.now() - 2500).toLocaleString(),
      location: 'Fuel Line',
      format: 'CSV',
      bufferUsage: '22%',
      errors: 0,
      warnings: 0,
    },
    {
      id: 13,
      name: 'Lubrication Logger',
      type: 'Oil System',
      status: 'Active',
      samplingRate: '0.5 Hz',
      dataPoints: 6250,
      fileSize: '0.2 MB',
      lastRecord: new Date(Date.now() - 5000).toLocaleString(),
      location: 'Lube Oil Tank',
      format: 'JSON',
      bufferUsage: '18%',
      errors: 0,
      warnings: 1,
    },
    {
      id: 14,
      name: 'Cooling Logger',
      type: 'Cooling System',
      status: 'Active',
      samplingRate: '2 Hz',
      dataPoints: 25000,
      fileSize: '0.7 MB',
      lastRecord: new Date(Date.now() - 1200).toLocaleString(),
      location: 'Heat Exchanger',
      format: 'CSV',
      bufferUsage: '32%',
      errors: 0,
      warnings: 0,
    },
    {
      id: 15,
      name: 'Event Logger',
      type: 'System Events',
      status: 'Active',
      samplingRate: 'On Event',
      dataPoints: 8750,
      fileSize: '0.5 MB',
      lastRecord: new Date(Date.now() - 3500).toLocaleString(),
      location: 'System Wide',
      format: 'JSON',
      bufferUsage: '25%',
      errors: 2,
      warnings: 8,
    },
  ]);

  const [selectedLogger, setSelectedLogger] = useState(null);
  const [loggingStats, setLoggingStats] = useState({
    totalDataPoints: 2625000,
    totalFileSize: '42.3 MB',
    activeLoggers: 14,
    dataRate: '3.8 MB/hour',
    storageUsed: '62%',
    storageAvailable: '38%',
    totalErrors: 3,
    totalWarnings: 24,
    avgBufferUsage: '41%',
  });

  // Sample logged data for visualization
  const loggedData = Array.from({ length: 60 }, (_, i) => ({
    timestamp: new Date(Date.now() - (60 - i) * 60000).toLocaleTimeString(),
    pressure: 680 + Math.sin(i * 0.2) * 50 + Math.random() * 20,
    temperature: 720 + Math.sin(i * 0.15) * 40 + Math.random() * 15,
    vibration: 12 + Math.sin(i * 0.25) * 4 + Math.random() * 2,
    flow: 45 + Math.sin(i * 0.18) * 8 + Math.random() * 3,
    rpm: 2800 + Math.sin(i * 0.12) * 200 + Math.random() * 50,
    power: 850 + Math.sin(i * 0.16) * 100 + Math.random() * 30,
    torque: 65 + Math.sin(i * 0.14) * 10 + Math.random() * 3,
    efficiency: 88 + Math.sin(i * 0.1) * 5 + Math.random() * 2,
  }));

  const dataRateHistory = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    rate: 3.2 + Math.sin(i * 0.3) * 0.8 + Math.random() * 0.4,
    points: 150000 + Math.sin(i * 0.25) * 30000 + Math.random() * 15000,
  }));

  // Buffer usage history
  const bufferHistory = Array.from({ length: 20 }, (_, i) => ({
    time: new Date(Date.now() - (20 - i) * 300000).toLocaleTimeString(),
    vibration: 88 - i * 2 + Math.random() * 5,
    control: 72 - i * 1.5 + Math.random() * 4,
    pressure: 65 - i * 1.2 + Math.random() * 3,
    acoustic: 55 - i * 1 + Math.random() * 3,
  }));

  const handleToggleLogger = (loggerId) => {
    setLoggers((prev) =>
      prev.map((logger) =>
        logger.id === loggerId
          ? { ...logger, status: logger.status === 'Active' ? 'Paused' : 'Active' }
          : logger
      )
    );
  };

  const handleDownload = (loggerId) => {
    const logger = loggers.find((l) => l.id === loggerId);
    console.log(`Downloading data from ${logger?.name}`);
    // TODO: Implement download functionality
  };

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLoggers((prev) =>
        prev.map((logger) => {
          if (logger.status === 'Active') {
            return {
              ...logger,
              dataPoints: logger.dataPoints + Math.floor(Math.random() * 10),
              lastRecord: new Date().toLocaleString(),
            };
          }
          return logger;
        })
      );
      setLoggingStats((prev) => ({
        ...prev,
        totalDataPoints: prev.totalDataPoints + Math.floor(Math.random() * 50),
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box>
      <PageHeader
        title="Data Loggers"
        subtitle="Monitor and manage data logging systems"
      />

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#8BC34A', mb: 1, fontSize: '0.9rem' }}>
                Active Loggers
              </Typography>
              <Typography variant="h4" sx={{ color: '#FFFFFF' }}>
                {loggingStats.activeLoggers}/{loggers.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ backgroundColor: '#1a1a1a', border: '2px solid #2196F3' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#2196F3', mb: 1, fontSize: '0.9rem' }}>
                Total Data Points
              </Typography>
              <Typography variant="h4" sx={{ color: '#FFFFFF' }}>
                {(loggingStats.totalDataPoints / 1000000).toFixed(2)}M
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ backgroundColor: '#1a1a1a', border: '2px solid #FF9800' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#FF9800', mb: 1, fontSize: '0.9rem' }}>
                Total File Size
              </Typography>
              <Typography variant="h4" sx={{ color: '#FFFFFF' }}>
                {loggingStats.totalFileSize}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ backgroundColor: '#1a1a1a', border: '2px solid #9C27B0' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#9C27B0', mb: 1, fontSize: '0.9rem' }}>
                Data Rate
              </Typography>
              <Typography variant="h4" sx={{ color: '#FFFFFF' }}>
                {loggingStats.dataRate}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ backgroundColor: '#1a1a1a', border: '2px solid #F44336' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#F44336', mb: 1, fontSize: '0.9rem' }}>
                Errors / Warnings
              </Typography>
              <Typography variant="h4" sx={{ color: '#FFFFFF' }}>
                {loggingStats.totalErrors} / {loggingStats.totalWarnings}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Loggers Table */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: '#8BC34A' }}>
                Data Loggers
              </Typography>
              <IconButton sx={{ color: '#8BC34A' }}>
                <RefreshIcon />
              </IconButton>
            </Box>
            <TableContainer sx={{ maxHeight: '600px', overflowY: 'auto' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#8BC34A', backgroundColor: '#0a0a0a' }}>Name</TableCell>
                    <TableCell sx={{ color: '#8BC34A', backgroundColor: '#0a0a0a' }}>Type</TableCell>
                    <TableCell sx={{ color: '#8BC34A', backgroundColor: '#0a0a0a' }}>Status</TableCell>
                    <TableCell sx={{ color: '#8BC34A', backgroundColor: '#0a0a0a' }}>Rate</TableCell>
                    <TableCell sx={{ color: '#8BC34A', backgroundColor: '#0a0a0a' }}>Data Points</TableCell>
                    <TableCell sx={{ color: '#8BC34A', backgroundColor: '#0a0a0a' }}>File Size</TableCell>
                    <TableCell sx={{ color: '#8BC34A', backgroundColor: '#0a0a0a' }}>Buffer</TableCell>
                    <TableCell sx={{ color: '#8BC34A', backgroundColor: '#0a0a0a' }}>E/W</TableCell>
                    <TableCell sx={{ color: '#8BC34A', backgroundColor: '#0a0a0a' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loggers.map((logger) => (
                    <TableRow key={logger.id} hover>
                      <TableCell sx={{ color: '#FFFFFF' }}>{logger.name}</TableCell>
                      <TableCell sx={{ color: '#B0BEC5', fontSize: '0.8rem' }}>{logger.type}</TableCell>
                      <TableCell>
                        <Chip
                          icon={logger.status === 'Active' ? <CheckCircleIcon /> : <ErrorIcon />}
                          label={logger.status}
                          size="small"
                          color={logger.status === 'Active' ? 'success' : 'default'}
                          sx={{ fontSize: '0.7rem' }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#FFFFFF', fontSize: '0.85rem' }}>{logger.samplingRate}</TableCell>
                      <TableCell sx={{ color: '#B0BEC5', fontSize: '0.85rem' }}>{logger.dataPoints.toLocaleString()}</TableCell>
                      <TableCell sx={{ color: '#B0BEC5', fontSize: '0.85rem' }}>{logger.fileSize}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Box
                            sx={{
                              width: 40,
                              height: 8,
                              backgroundColor: '#333',
                              borderRadius: 1,
                              overflow: 'hidden',
                            }}
                          >
                            <Box
                              sx={{
                                width: logger.bufferUsage,
                                height: '100%',
                                backgroundColor: parseInt(logger.bufferUsage) > 80 ? '#F44336' : parseInt(logger.bufferUsage) > 60 ? '#FF9800' : '#8BC34A',
                              }}
                            />
                          </Box>
                          <Typography sx={{ color: '#B0BEC5', fontSize: '0.75rem' }}>{logger.bufferUsage}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {logger.errors > 0 && (
                            <Chip label={logger.errors} size="small" sx={{ backgroundColor: '#F44336', color: '#FFF', fontSize: '0.65rem', height: 18, minWidth: 24 }} />
                          )}
                          {logger.warnings > 0 && (
                            <Chip label={logger.warnings} size="small" sx={{ backgroundColor: '#FF9800', color: '#FFF', fontSize: '0.65rem', height: 18, minWidth: 24 }} />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleLogger(logger.id)}
                            sx={{ color: logger.status === 'Active' ? '#FF9800' : '#4CAF50' }}
                          >
                            {logger.status === 'Active' ? <StopIcon /> : <PlayArrowIcon />}
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDownload(logger.id)}
                            sx={{ color: '#8BC34A' }}
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Logger Details & Controls */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #8BC34A', mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2 }}>
              Logger Configuration
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel sx={{ color: '#8BC34A' }}>Select Logger</InputLabel>
              <Select
                value={selectedLogger || ''}
                onChange={(e) => setSelectedLogger(e.target.value)}
                label="Select Logger"
                sx={{ color: '#FFFFFF' }}
              >
                {loggers.map((logger) => (
                  <MenuItem key={logger.id} value={logger.id}>
                    {logger.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {selectedLogger && (
              <Box>
                {(() => {
                  const logger = loggers.find((l) => l.id === selectedLogger);
                  return logger ? (
                    <Box sx={{ p: 2, backgroundColor: '#0a0a0a', borderRadius: 1, border: '1px solid #333' }}>
                      <Typography variant="body2" sx={{ color: '#8BC34A', mb: 1, fontWeight: 'bold' }}>
                        {logger.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#B0BEC5', mb: 0.5, fontSize: '0.85rem' }}>
                        <strong>Type:</strong> {logger.type}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#B0BEC5', mb: 0.5, fontSize: '0.85rem' }}>
                        <strong>Location:</strong> {logger.location}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#B0BEC5', mb: 0.5, fontSize: '0.85rem' }}>
                        <strong>Format:</strong> {logger.format}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#B0BEC5', mb: 0.5, fontSize: '0.85rem' }}>
                        <strong>Sampling Rate:</strong> {logger.samplingRate}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#B0BEC5', mb: 0.5, fontSize: '0.85rem' }}>
                        <strong>Data Points:</strong> {logger.dataPoints.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#B0BEC5', mb: 0.5, fontSize: '0.85rem' }}>
                        <strong>File Size:</strong> {logger.fileSize}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#B0BEC5', mb: 0.5, fontSize: '0.85rem' }}>
                        <strong>Buffer Usage:</strong> {logger.bufferUsage}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#B0BEC5', mb: 0.5, fontSize: '0.85rem' }}>
                        <strong>Errors:</strong> <span style={{ color: logger.errors > 0 ? '#F44336' : '#4CAF50' }}>{logger.errors}</span>
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#B0BEC5', mb: 0.5, fontSize: '0.85rem' }}>
                        <strong>Warnings:</strong> <span style={{ color: logger.warnings > 0 ? '#FF9800' : '#4CAF50' }}>{logger.warnings}</span>
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#B0BEC5', mb: 0.5, fontSize: '0.85rem' }}>
                        <strong>Last Record:</strong> {logger.lastRecord}
                      </Typography>
                      <Typography variant="body2" sx={{ color: logger.status === 'Active' ? '#4CAF50' : '#FF9800', mt: 1, fontWeight: 'bold' }}>
                        Status: {logger.status}
                      </Typography>
                    </Box>
                  ) : null;
                })()}
              </Box>
            )}
          </Paper>

          {/* Storage Information */}
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2 }}>
              Storage Information
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#B0BEC5' }}>Used</Typography>
                <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                  {loggingStats.storageUsed}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: '100%',
                  height: 20,
                  backgroundColor: '#333',
                  borderRadius: 1,
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    width: loggingStats.storageUsed,
                    height: '100%',
                    backgroundColor: '#8BC34A',
                  }}
                />
              </Box>
            </Box>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#B0BEC5' }}>Available</Typography>
                <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                  {loggingStats.storageAvailable}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Logged Data Chart - Pressure & Temperature */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2 }}>
              Pressure & Temperature Data (Last 60 Minutes)
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={loggedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="timestamp" stroke="#8BC34A" angle={-45} textAnchor="end" height={80} interval={9} />
                <YAxis yAxisId="left" stroke="#2196F3" label={{ value: 'Pressure (bar)', angle: -90, position: 'insideLeft', fill: '#2196F3' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#FF5722" label={{ value: 'Temperature (°C)', angle: 90, position: 'insideRight', fill: '#FF5722' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #8BC34A', color: '#FFF' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="pressure" stroke="#2196F3" name="Pressure (bar)" dot={false} strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="temperature" stroke="#FF5722" name="Temperature (°C)" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Vibration & Flow Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #9C27B0' }}>
            <Typography variant="h6" sx={{ color: '#9C27B0', mb: 2 }}>
              Vibration & Flow Data (Last 60 Minutes)
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={loggedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="timestamp" stroke="#9C27B0" angle={-45} textAnchor="end" height={80} interval={9} />
                <YAxis yAxisId="left" stroke="#4CAF50" label={{ value: 'Vibration (mm/s)', angle: -90, position: 'insideLeft', fill: '#4CAF50' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#FF9800" label={{ value: 'Flow (kg/s)', angle: 90, position: 'insideRight', fill: '#FF9800' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #9C27B0', color: '#FFF' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="vibration" stroke="#4CAF50" name="Vibration (mm/s)" dot={false} strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="flow" stroke="#FF9800" name="Flow (kg/s)" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* RPM, Power, Torque Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #FF9800' }}>
            <Typography variant="h6" sx={{ color: '#FF9800', mb: 2 }}>
              RPM, Power & Torque Data (Last 60 Minutes)
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={loggedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="timestamp" stroke="#FF9800" angle={-45} textAnchor="end" height={80} interval={9} />
                <YAxis yAxisId="left" stroke="#00BCD4" label={{ value: 'RPM', angle: -90, position: 'insideLeft', fill: '#00BCD4' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#9C27B0" label={{ value: 'Power (kW) / Torque (kNm)', angle: 90, position: 'insideRight', fill: '#9C27B0' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #FF9800', color: '#FFF' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="rpm" stroke="#00BCD4" name="RPM" dot={false} strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="power" stroke="#9C27B0" name="Power (kW)" dot={false} strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="torque" stroke="#E91E63" name="Torque (kNm)" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Buffer Usage History */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #F44336' }}>
            <Typography variant="h6" sx={{ color: '#F44336', mb: 2 }}>
              Buffer Usage History (Last 100 Minutes)
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={bufferHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="time" stroke="#F44336" angle={-45} textAnchor="end" height={80} interval={2} />
                <YAxis stroke="#F44336" label={{ value: 'Buffer Usage (%)', angle: -90, position: 'insideLeft', fill: '#F44336' }} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #F44336', color: '#FFF' }} />
                <Legend />
                <Line type="monotone" dataKey="vibration" stroke="#F44336" name="Vibration Logger" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="control" stroke="#FF9800" name="Control Logger" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="pressure" stroke="#8BC34A" name="Pressure Logger" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="acoustic" stroke="#2196F3" name="Acoustic Logger" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Data Rate Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2 }}>
              Data Logging Rate & Points (Last 24 Hours)
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={dataRateHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="hour" stroke="#8BC34A" label={{ value: 'Time', position: 'insideBottom', offset: -5, fill: '#8BC34A' }} />
                <YAxis yAxisId="left" stroke="#8BC34A" label={{ value: 'Rate (MB/h)', angle: -90, position: 'insideLeft', fill: '#8BC34A' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#FF9800" label={{ value: 'Data Points', angle: 90, position: 'insideRight', fill: '#FF9800' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #8BC34A', color: '#FFF' }} />
                <Legend />
                <Bar yAxisId="left" dataKey="rate" fill="#8BC34A" name="Data Rate (MB/h)" />
                <Line yAxisId="right" type="monotone" dataKey="points" stroke="#FF9800" name="Data Points" strokeWidth={3} dot={{ r: 4 }} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DataLogger;

