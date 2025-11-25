// src/pages/Monitoring.jsx

import React, { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Box, Chip, ButtonGroup, Button, Typography, Grid, Paper, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, LineChart, Line, Legend } from 'recharts';
import PageHeader from '../components/common/PageHeader';
// 1. کامپوننت DynamicChart ایمپورت شد
import DynamicChart from '../features/rtm/components/DynamicChart'; 

// Constants for time ranges
const TIME_RANGES = {
  LIVE: 'Live',
  LAST_10M: '10m',
  LAST_1H: '1h',
  LAST_8H: '8h',
};

const Monitoring = () => {
  const { liveData, isConnected } = useSelector((state) => state.rtm);
  const [selectedRange, setSelectedRange] = useState(TIME_RANGES.LIVE);

  // DVR Data Validation Results
  const [dvrData, setDvrData] = useState({
    validationResults: [
      { sensor: 'Pressure_In', status: 'Valid', value: 1.25, threshold: 1.5, timestamp: new Date().toLocaleString() },
      { sensor: 'Temperature_Out', status: 'Valid', value: 720, threshold: 800, timestamp: new Date().toLocaleString() },
      { sensor: 'Vibration', status: 'Warning', value: 15.2, threshold: 15, timestamp: new Date().toLocaleString() },
      { sensor: 'Flow_Rate', status: 'Valid', value: 45.8, threshold: 50, timestamp: new Date().toLocaleString() },
      { sensor: 'Efficiency', status: 'Valid', value: 0.87, threshold: 0.9, timestamp: new Date().toLocaleString() },
      { sensor: 'Power_Consumption', status: 'Valid', value: 850, threshold: 1000, timestamp: new Date().toLocaleString() },
    ],
    dataQuality: {
      completeness: 98.5,
      accuracy: 96.2,
      timeliness: 99.1,
      consistency: 97.8,
    },
    errorStats: [
      { type: 'Out of Range', count: 12, percentage: 2.1 },
      { type: 'Missing Data', count: 5, percentage: 0.9 },
      { type: 'Duplicate', count: 3, percentage: 0.5 },
      { type: 'Invalid Format', count: 2, percentage: 0.4 },
    ],
    sensorStatus: [
      { name: 'Pressure Sensors', status: 'Active', lastUpdate: '2 sec ago', dataPoints: 1250 },
      { name: 'Temperature Sensors', status: 'Active', lastUpdate: '1 sec ago', dataPoints: 1250 },
      { name: 'Vibration Sensors', status: 'Warning', lastUpdate: '3 sec ago', dataPoints: 1248 },
      { name: 'Flow Sensors', status: 'Active', lastUpdate: '2 sec ago', dataPoints: 1250 },
      { name: 'Power Sensors', status: 'Active', lastUpdate: '1 sec ago', dataPoints: 1250 },
    ],
  });

  // Generate simulated chart data
  const [chartData, setChartData] = useState(() => {
    return Array.from({ length: 100 }, (_, i) => ({
      timestamp: new Date(Date.now() - (100 - i) * 30000).toISOString(),
      time: new Date(Date.now() - (100 - i) * 30000).toLocaleTimeString(),
      Pressure_In: 1.2 + Math.sin(i * 0.15) * 0.2 + Math.random() * 0.1,
      Pressure_Out: 4.8 + Math.sin(i * 0.12) * 0.3 + Math.random() * 0.15,
      Flow_Rate: 45 + Math.sin(i * 0.1) * 5 + Math.random() * 2,
      Temperature_In: 25 + Math.sin(i * 0.08) * 3 + Math.random() * 2,
      Temperature_Out: 720 + Math.sin(i * 0.09) * 40 + Math.random() * 15,
      Efficiency: 85 + Math.sin(i * 0.11) * 5 + Math.random() * 2,
      Power_Consumption: 850 + Math.sin(i * 0.13) * 80 + Math.random() * 30,
      Load_Factor: 78 + Math.sin(i * 0.1) * 8 + Math.random() * 3,
      Vibration: 12 + Math.sin(i * 0.2) * 3 + Math.random() * 1.5,
      Frequency: 50 + Math.sin(i * 0.15) * 5 + Math.random() * 2,
      Amplitude: 0.5 + Math.sin(i * 0.18) * 0.2 + Math.random() * 0.1,
      Phase_Angle: 180 + Math.sin(i * 0.12) * 30 + Math.random() * 10,
      vib_std: 1.2 + Math.sin(i * 0.14) * 0.3 + Math.random() * 0.15,
      vib_max: 15 + Math.sin(i * 0.16) * 3 + Math.random() * 1,
      vib_mean: 12 + Math.sin(i * 0.13) * 2 + Math.random() * 0.8,
      vib_rms: 12.5 + Math.sin(i * 0.15) * 2.5 + Math.random() * 0.9,
      Ambient_Temperature: 22 + Math.sin(i * 0.05) * 3 + Math.random() * 1,
      Humidity: 62 + Math.sin(i * 0.07) * 8 + Math.random() * 3,
      Air_Pollution: 35 + Math.sin(i * 0.09) * 10 + Math.random() * 5,
      Density: 1.2 + Math.sin(i * 0.1) * 0.1 + Math.random() * 0.05,
      Viscosity: 0.018 + Math.sin(i * 0.12) * 0.002 + Math.random() * 0.001,
      Fuel_Quality: 95 + Math.sin(i * 0.08) * 3 + Math.random() * 1,
      Velocity: 45 + Math.sin(i * 0.11) * 5 + Math.random() * 2,
      Mass: 5000 + Math.sin(i * 0.06) * 50 + Math.random() * 20,
      Stiffness: 50000 + Math.sin(i * 0.08) * 2000 + Math.random() * 1000,
      Damping: 150 + Math.sin(i * 0.1) * 15 + Math.random() * 5,
      Maintenance_Quality: 92 + Math.sin(i * 0.09) * 4 + Math.random() * 2,
      RPM: 2850 + Math.sin(i * 0.12) * 150 + Math.random() * 50,
      Torque: 65 + Math.sin(i * 0.14) * 8 + Math.random() * 3,
      Emissions_CO2: 420 + Math.sin(i * 0.1) * 50 + Math.random() * 20,
      Emissions_NOx: 85 + Math.sin(i * 0.11) * 15 + Math.random() * 5,
      Oil_Pressure: 4.5 + Math.sin(i * 0.13) * 0.5 + Math.random() * 0.2,
      Coolant_Flow: 120 + Math.sin(i * 0.09) * 15 + Math.random() * 5,
    }));
  });

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setDvrData((prev) => ({
        ...prev,
        validationResults: prev.validationResults.map((result) => ({
          ...result,
          value: result.value + (Math.random() - 0.5) * 0.1 * result.value,
          timestamp: new Date().toLocaleString(),
        })),
      }));

      // Update chart data
      setChartData((prev) => {
        const newPoint = {
          timestamp: new Date().toISOString(),
          time: new Date().toLocaleTimeString(),
          Pressure_In: prev[prev.length - 1].Pressure_In + (Math.random() - 0.5) * 0.05,
          Pressure_Out: prev[prev.length - 1].Pressure_Out + (Math.random() - 0.5) * 0.1,
          Flow_Rate: prev[prev.length - 1].Flow_Rate + (Math.random() - 0.5) * 1,
          Temperature_In: prev[prev.length - 1].Temperature_In + (Math.random() - 0.5) * 0.5,
          Temperature_Out: prev[prev.length - 1].Temperature_Out + (Math.random() - 0.5) * 5,
          Efficiency: prev[prev.length - 1].Efficiency + (Math.random() - 0.5) * 0.5,
          Power_Consumption: prev[prev.length - 1].Power_Consumption + (Math.random() - 0.5) * 10,
          Load_Factor: prev[prev.length - 1].Load_Factor + (Math.random() - 0.5) * 1,
          Vibration: prev[prev.length - 1].Vibration + (Math.random() - 0.5) * 0.3,
          Frequency: prev[prev.length - 1].Frequency + (Math.random() - 0.5) * 0.5,
          Amplitude: prev[prev.length - 1].Amplitude + (Math.random() - 0.5) * 0.02,
          Phase_Angle: prev[prev.length - 1].Phase_Angle + (Math.random() - 0.5) * 2,
          vib_std: prev[prev.length - 1].vib_std + (Math.random() - 0.5) * 0.05,
          vib_max: prev[prev.length - 1].vib_max + (Math.random() - 0.5) * 0.5,
          vib_mean: prev[prev.length - 1].vib_mean + (Math.random() - 0.5) * 0.3,
          vib_rms: prev[prev.length - 1].vib_rms + (Math.random() - 0.5) * 0.3,
          Ambient_Temperature: prev[prev.length - 1].Ambient_Temperature + (Math.random() - 0.5) * 0.2,
          Humidity: prev[prev.length - 1].Humidity + (Math.random() - 0.5) * 0.5,
          Air_Pollution: prev[prev.length - 1].Air_Pollution + (Math.random() - 0.5) * 1,
          Density: prev[prev.length - 1].Density + (Math.random() - 0.5) * 0.01,
          Viscosity: prev[prev.length - 1].Viscosity + (Math.random() - 0.5) * 0.0002,
          Fuel_Quality: prev[prev.length - 1].Fuel_Quality + (Math.random() - 0.5) * 0.3,
          Velocity: prev[prev.length - 1].Velocity + (Math.random() - 0.5) * 0.5,
          Mass: prev[prev.length - 1].Mass + (Math.random() - 0.5) * 5,
          Stiffness: prev[prev.length - 1].Stiffness + (Math.random() - 0.5) * 200,
          Damping: prev[prev.length - 1].Damping + (Math.random() - 0.5) * 2,
          Maintenance_Quality: prev[prev.length - 1].Maintenance_Quality + (Math.random() - 0.5) * 0.5,
          RPM: prev[prev.length - 1].RPM + (Math.random() - 0.5) * 10,
          Torque: prev[prev.length - 1].Torque + (Math.random() - 0.5) * 1,
          Emissions_CO2: prev[prev.length - 1].Emissions_CO2 + (Math.random() - 0.5) * 5,
          Emissions_NOx: prev[prev.length - 1].Emissions_NOx + (Math.random() - 0.5) * 2,
          Oil_Pressure: prev[prev.length - 1].Oil_Pressure + (Math.random() - 0.5) * 0.05,
          Coolant_Flow: prev[prev.length - 1].Coolant_Flow + (Math.random() - 0.5) * 2,
        };
        return [...prev.slice(1), newPoint]; // Keep last 100 points
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const displayData = useMemo(() => {
    const now = Date.now();
    
    // Use chartData instead of liveData
    const dataSource = chartData.length > 0 ? chartData : liveData;
    
    switch (selectedRange) {
      case TIME_RANGES.LAST_10M:
        return dataSource.filter(d => new Date(d.timestamp).getTime() >= (now - 10 * 60 * 1000));
      case TIME_RANGES.LAST_1H:
        return dataSource.filter(d => new Date(d.timestamp).getTime() >= (now - 60 * 60 * 1000));
      case TIME_RANGES.LAST_8H:
        return dataSource.filter(d => new Date(d.timestamp).getTime() >= (now - 8 * 60 * 60 * 1000));
      case TIME_RANGES.LIVE:
      default:
        // Show the latest 75 points for live view performance
        return dataSource.slice(-75);
    }
  }, [chartData, liveData, selectedRange]);

  const histogramData = useMemo(() => {
    const bins = {};
    displayData.forEach(d => {
      // Create bins based on rounded vibration value
      const bin = Math.floor(d.Vibration || 0);
      bins[bin] = (bins[bin] || 0) + 1;
    });
    return Object.keys(bins).map(key => ({ range: key, frequency: bins[key] }));
  }, [displayData]);
  
  // 2. کامپوننت DynamicChart و createAnomalyDotRenderer حذف شدند

  return (
    <Box>
      {/* Page Header and Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <PageHeader 
            title="Data Validation & Reporting (DVR)"
            subtitle="Real-time data validation, quality monitoring, and sensor status"
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
            <ButtonGroup variant="outlined" aria-label="Time range filter">
                <Button onClick={() => setSelectedRange(TIME_RANGES.LIVE)} variant={selectedRange === TIME_RANGES.LIVE ? 'contained' : 'outlined'}>Live</Button>
                <Button onClick={() => setSelectedRange(TIME_RANGES.LAST_10M)} variant={selectedRange === TIME_RANGES.LAST_10M ? 'contained' : 'outlined'}>10m</Button>
                <Button onClick={() => setSelectedRange(TIME_RANGES.LAST_1H)} variant={selectedRange === TIME_RANGES.LAST_1H ? 'contained' : 'outlined'}>1h</Button>
                <Button onClick={() => setSelectedRange(TIME_RANGES.LAST_8H)} variant={selectedRange === TIME_RANGES.LAST_8H ? 'contained' : 'outlined'}>8h</Button>
            </ButtonGroup>
            <Chip 
              label={isConnected ? 'Connected' : 'Disconnected'}
              color={isConnected ? 'success' : 'error'}
              variant="filled"
            />
        </Box>
      </Box>

      {/* DVR Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#8BC34A', mb: 1 }}>
                Data Completeness
              </Typography>
              <Typography variant="h4" sx={{ color: '#FFFFFF' }}>
                {dvrData.dataQuality.completeness}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#8BC34A', mb: 1 }}>
                Data Accuracy
              </Typography>
              <Typography variant="h4" sx={{ color: '#FFFFFF' }}>
                {dvrData.dataQuality.accuracy}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#8BC34A', mb: 1 }}>
                Timeliness
              </Typography>
              <Typography variant="h4" sx={{ color: '#FFFFFF' }}>
                {dvrData.dataQuality.timeliness}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#8BC34A', mb: 1 }}>
                Consistency
              </Typography>
              <Typography variant="h4" sx={{ color: '#FFFFFF' }}>
                {dvrData.dataQuality.consistency}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Validation Results Table */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2 }}>
              Real-Time Validation Results
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#8BC34A' }}>Sensor</TableCell>
                    <TableCell sx={{ color: '#8BC34A' }}>Value</TableCell>
                    <TableCell sx={{ color: '#8BC34A' }}>Status</TableCell>
                    <TableCell sx={{ color: '#8BC34A' }}>Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dvrData.validationResults.map((result) => (
                    <TableRow key={result.sensor}>
                      <TableCell sx={{ color: '#FFFFFF' }}>{result.sensor}</TableCell>
                      <TableCell sx={{ color: '#FFFFFF' }}>{result.value.toFixed(2)}</TableCell>
                      <TableCell>
                        <Chip
                          label={result.status}
                          size="small"
                          color={result.status === 'Valid' ? 'success' : 'warning'}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#B0BEC5', fontSize: '0.75rem' }}>
                        {result.timestamp}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Sensor Status Table */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2 }}>
              Sensor Status
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#8BC34A' }}>Sensor Group</TableCell>
                    <TableCell sx={{ color: '#8BC34A' }}>Status</TableCell>
                    <TableCell sx={{ color: '#8BC34A' }}>Last Update</TableCell>
                    <TableCell sx={{ color: '#8BC34A' }}>Data Points</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dvrData.sensorStatus.map((sensor) => (
                    <TableRow key={sensor.name}>
                      <TableCell sx={{ color: '#FFFFFF' }}>{sensor.name}</TableCell>
                      <TableCell>
                        <Chip
                          label={sensor.status}
                          size="small"
                          color={sensor.status === 'Active' ? 'success' : 'warning'}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#B0BEC5' }}>{sensor.lastUpdate}</TableCell>
                      <TableCell sx={{ color: '#FFFFFF' }}>{sensor.dataPoints}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Error Statistics Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2 }}>
              Error Statistics
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dvrData.errorStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="type" stroke="#8BC34A" />
                <YAxis stroke="#8BC34A" />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #8BC34A' }} />
                <Bar dataKey="count" fill="#F44336" name="Error Count" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Data Quality Trend */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2 }}>
              Data Quality Trend (Last 24 Hours)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={Array.from({ length: 24 }, (_, i) => ({
                hour: i,
                completeness: 98 + Math.sin(i * 0.3) * 1 + Math.random() * 0.5,
                accuracy: 96 + Math.sin(i * 0.25) * 1.5 + Math.random() * 0.5,
                timeliness: 99 + Math.sin(i * 0.2) * 0.5 + Math.random() * 0.3,
                consistency: 97 + Math.sin(i * 0.35) * 1.2 + Math.random() * 0.5,
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="hour" stroke="#8BC34A" />
                <YAxis stroke="#8BC34A" domain={[90, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #8BC34A' }} />
                <Legend />
                <Line type="monotone" dataKey="completeness" stroke="#4CAF50" name="Completeness" strokeWidth={2} />
                <Line type="monotone" dataKey="accuracy" stroke="#2196F3" name="Accuracy" strokeWidth={2} />
                <Line type="monotone" dataKey="timeliness" stroke="#FF9800" name="Timeliness" strokeWidth={2} />
                <Line type="monotone" dataKey="consistency" stroke="#9C27B0" name="Consistency" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Real-Time System Overview */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #2196F3' }}>
            <Typography variant="h6" sx={{ color: '#2196F3', mb: 2 }}>
              Real-Time System Overview (Temperature & Pressure)
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={displayData.slice(-50)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="#2196F3"
                  tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                  interval={9}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  yAxisId="temp"
                  stroke="#FF5722"
                  label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft', fill: '#FF5722' }} 
                />
                <YAxis 
                  yAxisId="pressure"
                  orientation="right"
                  stroke="#2196F3"
                  label={{ value: 'Pressure (bar)', angle: 90, position: 'insideRight', fill: '#2196F3' }} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2196F3', color: '#FFF' }}
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                />
                <Legend />
                <Line yAxisId="temp" type="monotone" dataKey="Temperature_Out" stroke="#FF5722" name="Outlet Temp" strokeWidth={2} dot={false} />
                <Line yAxisId="temp" type="monotone" dataKey="Temperature_In" stroke="#FF9800" name="Inlet Temp" strokeWidth={2} dot={false} />
                <Line yAxisId="pressure" type="monotone" dataKey="Pressure_Out" stroke="#2196F3" name="Outlet Pressure" strokeWidth={2} dot={false} />
                <Line yAxisId="pressure" type="monotone" dataKey="Pressure_In" stroke="#00BCD4" name="Inlet Pressure" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Chart 1: Compressor Core: Pressure & Flow */}
        <DynamicChart 
            title="Compressor Core: Pressure & Flow (Air/Gas)"
            dataKeys={[
                { key: "Pressure_In", name: "Inlet Pressure (bar)", color: "#8884d8", yAxisId: "pressure" },
                { key: "Pressure_Out", name: "Outlet Pressure (bar)", color: "#4C4CA8", yAxisId: "pressure" },
                { key: "Flow_Rate", name: "Flow Rate (kg/s)", color: "#ffc658", yAxisId: "flow", orientation: "right" },
            ]}
            yAxisLabel="Pressure (bar)"
            yAxisId="pressure"
            orientation="left"
            data={displayData} // 3. ارسال داده
        />

        {/* Chart 2: Compressor Core: Temperature */}
        <DynamicChart 
            title="Compressor Core: Temperature (Air/Gas)"
            dataKeys={[
                { key: "Temperature_In", name: "Inlet Temp (°C)", color: "#ff7300" },
                { key: "Temperature_Out", name: "Outlet Temp (°C)", color: "#82ca9d" },
            ]}
            yAxisLabel="Temperature (°C)"
            data={displayData} // 3. ارسال داده
        />

        {/* Chart 3: Key Performance Indicators (KPIs) */}
        <DynamicChart 
            title="Key Performance Indicators (KPIs)"
            dataKeys={[
                { key: "Efficiency", name: "Efficiency (%)", color: "#e91e63" },
                { key: "Power_Consumption", name: "Power Consumption (kW)", color: "#00bcd4", yAxisId: "power", orientation: "right" },
                { key: "Load_Factor", name: "Load Factor (%)", color: "#4caf50", yAxisId: "kpi" },
            ]}
            yAxisLabel="Efficiency (%)"
            yAxisId="kpi"
            orientation="left"
            data={displayData} // 3. ارسال داده
        />
        
        {/* Chart 4: Vibration - Time Domain (Raw) */}
        <DynamicChart 
            title="Vibration - Time Domain (Raw Signal)"
            dataKeys={[
                { key: "Vibration", name: "Vibration (mm/s)", color: "#8884d8" },
            ]}
            yAxisLabel="Vibration Amplitude (mm/s)"
            data={displayData} // 3. ارسال داده
        />

        {/* Chart 5: Vibration - Frequency Domain */}
        <DynamicChart 
            title="Vibration - Frequency Domain"
            dataKeys={[
                { key: "Frequency", name: "Frequency (Hz)", color: "#03a9f4" },
                { key: "Amplitude", name: "Amplitude", color: "#9c27b0" },
                { key: "Phase_Angle", name: "Phase Angle (Deg)", color: "#ff9800" },
            ]}
            yAxisLabel="Value"
            data={displayData} // 3. ارسال داده
        />
        
        {/* Chart 6: Vibration - Statistical Metrics */}
        <DynamicChart 
            title="Vibration - Statistical Metrics (Advanced)"
            dataKeys={[
                { key: "vib_std", name: "Std. Dev.", color: "#00bcd4" },
                { key: "vib_max", name: "Max", color: "#ff5722" },
                { key: "vib_mean", name: "Mean", color: "#4caf50" },
                { key: "vib_rms", name: "RMS", color: "#673ab7" },
            ]}
            yAxisLabel="Vibration Metric (mm/s)"
            data={displayData} // 3. ارسال داده
        />
        
        {/* Chart 7: Ambient Conditions */}
        <DynamicChart 
            title="Ambient Conditions"
            dataKeys={[
                { key: "Ambient_Temperature", name: "Ambient Temp (°C)", color: "#e91e63" },
                { key: "Humidity", name: "Humidity (%)", color: "#03a9f4" },
                { key: "Air_Pollution", name: "Air Pollution", color: "#ff9800" },
            ]}
            yAxisLabel="Value"
            data={displayData} // 3. ارسال داده
        />

        {/* Chart 8: Fluid Characteristics */}
        <DynamicChart 
            title="Fluid Characteristics"
            dataKeys={[
                { key: "Density", name: "Density (kg/m³)", color: "#9c27b0" },
                { key: "Viscosity", name: "Viscosity (Pa·s)", color: "#009688" },
                { key: "Fuel_Quality", name: "Fuel Quality (%)", color: "#795548" },
                { key: "Velocity", name: "Velocity (m/s)", color: "#f44336" },
            ]}
            yAxisLabel="Value"
            data={displayData} // 3. ارسال داده
        />

        {/* Chart 9: Mechanical State & Quality Factors */}
        <DynamicChart 
            title="Mechanical State & Quality Factors"
            dataKeys={[
                { key: "Mass", name: "Mass (kg)", color: "#607d8b" },
                { key: "Stiffness", name: "Stiffness (N/m)", color: "#ffeb3b" },
                { key: "Damping", name: "Damping", color: "#42a5f5" },
                { key: "Maintenance_Quality", name: "Maintenance Quality (%)", color: "#26a69a" },
            ]}
            yAxisLabel="Value"
            data={displayData} // 3. ارسال داده
        />
        
        {/* Chart 10: RPM & Torque */}
        <DynamicChart 
            title="Turbine Speed & Torque"
            dataKeys={[
                { key: "RPM", name: "Rotational Speed (RPM)", color: "#00bcd4", yAxisId: "rpm" },
                { key: "Torque", name: "Torque (kNm)", color: "#ff5722", yAxisId: "torque", orientation: "right" },
            ]}
            yAxisLabel="RPM"
            yAxisId="rpm"
            orientation="left"
            data={displayData}
        />

        {/* Chart 11: Emissions */}
        <DynamicChart 
            title="Emissions Monitoring"
            dataKeys={[
                { key: "Emissions_CO2", name: "CO2 (ppm)", color: "#9e9e9e" },
                { key: "Emissions_NOx", name: "NOx (ppm)", color: "#ff9800" },
            ]}
            yAxisLabel="Emissions (ppm)"
            data={displayData}
        />

        {/* Chart 12: Oil & Coolant Systems */}
        <DynamicChart 
            title="Lubrication & Cooling Systems"
            dataKeys={[
                { key: "Oil_Pressure", name: "Oil Pressure (bar)", color: "#795548", yAxisId: "pressure" },
                { key: "Coolant_Flow", name: "Coolant Flow (L/min)", color: "#03a9f4", yAxisId: "flow", orientation: "right" },
            ]}
            yAxisLabel="Oil Pressure (bar)"
            yAxisId="pressure"
            orientation="left"
            data={displayData}
        />

        {/* Chart 13: Vibration Histogram - Bar Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2 }}>
              Vibration Histogram
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={histogramData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey="range" 
                  stroke="#8BC34A"
                  label={{ value: 'Vibration Range (mm/s)', position: 'insideBottom', offset: -5, fill: '#8BC34A' }}
                />
                <YAxis 
                  stroke="#8BC34A"
                  label={{ value: 'Frequency', angle: -90, position: 'insideLeft', fill: '#8BC34A' }} 
                />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #8BC34A', color: '#FFF' }} />
                <Bar dataKey="frequency" fill="#8BC34A" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>      
      </Grid>
    </Box>
  );
};

export default Monitoring;