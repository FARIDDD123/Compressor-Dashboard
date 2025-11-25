/**
 * Graph Analysis Page
 * Shows Noise Signal chart and Histogram
 */

import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Paper, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
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
  Legend,
} from 'recharts';

const GraphAnalysisPage = () => {
  const [selectedGauge, setSelectedGauge] = useState('Gauge');
  const [selectedSensor, setSelectedSensor] = useState('SENSOR');
  const [selectedRealTime, setSelectedRealTime] = useState('REAL_TIME_M');

  // Generate sample data for all sensors
  const [sensorData, setSensorData] = useState([]);

  useEffect(() => {
    // Generate comprehensive sensor data
    const generateSensorData = () => {
      const data = [];
      const now = Date.now();
      
      for (let i = 0; i <= 100; i++) {
        const time = i / 10; // 0 to 10 seconds
        data.push({
          time: time.toFixed(1),
          // Temperature sensors
          ambientTemp: 25 + Math.sin(i / 10) * 3 + Math.random() * 1,
          inletTemp: 420 + Math.sin(i / 8) * 15 + Math.random() * 5,
          outletTemp: 580 + Math.sin(i / 7) * 20 + Math.random() * 5,
          exhaustTemp: 650 + Math.sin(i / 9) * 25 + Math.random() * 8,
          
          // Pressure sensors
          filterDiff: 15 + Math.sin(i / 6) * 3 + Math.random() * 1,
          turbineExhaust: 850 + Math.sin(i / 12) * 30 + Math.random() * 5,
          compressorDischarge: 920 + Math.sin(i / 11) * 35 + Math.random() * 8,
          absolutePressure: 680 + Math.sin(i / 10) * 25 + Math.random() * 5,
          staticPressure: 720 + Math.sin(i / 9) * 30 + Math.random() * 6,
          dynamicPressure: 420 + Math.sin(i / 8) * 20 + Math.random() * 5,
          
          // RPM & Vibration
          turbineSpeed: 3050 + Math.sin(i / 15) * 100 + Math.random() * 20,
          vibration: 12 + Math.sin(i / 5) * 2 + Math.random() * 0.5,
          
          // Torque
          shaftTorque: 65 + Math.sin(i / 13) * 8 + Math.random() * 2,
          propellerTorque: 58 + Math.sin(i / 14) * 7 + Math.random() * 1.5,
          
          // Power
          inputPower: 850 + Math.sin(i / 16) * 40 + Math.random() * 10,
          loadDemand: 780 + Math.sin(i / 14) * 35 + Math.random() * 8,
          energyYield: 920 + Math.sin(i / 15) * 45 + Math.random() * 10,
          
          // Control parameters
          efficiency: 88 + Math.sin(i / 20) * 3 + Math.random() * 1,
          fuelFlow: 320 + Math.sin(i / 12) * 15 + Math.random() * 3,
          humidity: 45 + Math.sin(i / 18) * 5 + Math.random() * 2,
          
          // Emissions
          co2: 420 + Math.sin(i / 11) * 30 + Math.random() * 8,
          co: 85 + Math.sin(i / 9) * 10 + Math.random() * 3,
          
          // Viscosity
          viscosity: 42 + Math.sin(i / 17) * 4 + Math.random() * 1,
          
          // Frequency/Noise
          amplitude: Math.random() * 4 - 2 + Math.sin(i / 5) * 1.5,
          frequency: 520 + Math.sin(i / 8) * 30 + Math.random() * 10,
        });
      }
      return data;
    };

    setSensorData(generateSensorData());

    // Update data periodically
    const interval = setInterval(() => {
      setSensorData(generateSensorData());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      {/* Top Controls */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 3,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel sx={{ color: '#8BC34A' }}>Gauge</InputLabel>
          <Select
            value={selectedGauge}
            label="Gauge"
            onChange={(e) => setSelectedGauge(e.target.value)}
            sx={{
              color: '#FFFFFF',
              '.MuiOutlinedInput-notchedOutline': { borderColor: '#4CAF50' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#8BC34A' },
            }}
          >
            <MenuItem value="Gauge">Gauge</MenuItem>
            <MenuItem value="Gauge_1">Gauge_1</MenuItem>
            <MenuItem value="Gauge_2">Gauge_2</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel sx={{ color: '#8BC34A' }}>SENSOR</InputLabel>
          <Select
            value={selectedSensor}
            label="SENSOR"
            onChange={(e) => setSelectedSensor(e.target.value)}
            sx={{
              color: '#FFFFFF',
              '.MuiOutlinedInput-notchedOutline': { borderColor: '#4CAF50' },
            }}
          >
            <MenuItem value="SENSOR">SENSOR</MenuItem>
            <MenuItem value="SENSOR_1">SENSOR_1</MenuItem>
            <MenuItem value="SENSOR_2">SENSOR_2</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel sx={{ color: '#8BC34A' }}>REAL_TIME_M</InputLabel>
          <Select
            value={selectedRealTime}
            label="REAL_TIME_M"
            onChange={(e) => setSelectedRealTime(e.target.value)}
            sx={{
              color: '#FFFFFF',
              '.MuiOutlinedInput-notchedOutline': { borderColor: '#4CAF50' },
            }}
          >
            <MenuItem value="REAL_TIME_M">REAL_TIME_M</MenuItem>
            <MenuItem value="REAL_TIME_H">REAL_TIME_H</MenuItem>
            <MenuItem value="REAL_TIME_D">REAL_TIME_D</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Title */}
      <Paper
        sx={{
          p: 1,
          mb: 2,
          backgroundColor: '#D3D3D3',
          textAlign: 'center',
        }}
      >
        <Typography variant="h6" sx={{ color: '#000000', fontWeight: 600, fontStyle: 'italic' }}>
          Graph
        </Typography>
      </Paper>

      {/* Charts */}
      <Grid container spacing={2}>
        {/* Temperature Sensors Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 2, fontWeight: 600 }}>
              Temperature Sensors
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={sensorData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                <XAxis dataKey="time" stroke="#8BC34A" label={{ value: 'Time (s)', position: 'insideBottom', offset: -5, fill: '#8BC34A' }} />
                <YAxis stroke="#8BC34A" label={{ value: 'Temp (°C)', angle: -90, position: 'insideLeft', fill: '#8BC34A' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #8BC34A', color: '#FFFFFF' }} />
                <Legend />
                <Line type="monotone" dataKey="ambientTemp" stroke="#2196F3" name="Ambient" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="inletTemp" stroke="#4CAF50" name="Inlet" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="outletTemp" stroke="#FF9800" name="Outlet" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="exhaustTemp" stroke="#F44336" name="Exhaust" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Pressure Sensors Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 2, fontWeight: 600 }}>
              Pressure Sensors
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={sensorData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                <XAxis dataKey="time" stroke="#8BC34A" label={{ value: 'Time (s)', position: 'insideBottom', offset: -5, fill: '#8BC34A' }} />
                <YAxis stroke="#8BC34A" label={{ value: 'Pressure (bar)', angle: -90, position: 'insideLeft', fill: '#8BC34A' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #8BC34A', color: '#FFFFFF' }} />
                <Legend />
                <Line type="monotone" dataKey="absolutePressure" stroke="#9C27B0" name="Absolute" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="staticPressure" stroke="#00BCD4" name="Static" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="dynamicPressure" stroke="#FF5722" name="Dynamic" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* RPM & Vibration Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 2, fontWeight: 600 }}>
              RPM & Vibration
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={sensorData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                <XAxis dataKey="time" stroke="#8BC34A" label={{ value: 'Time (s)', position: 'insideBottom', offset: -5, fill: '#8BC34A' }} />
                <YAxis yAxisId="left" stroke="#8BC34A" label={{ value: 'RPM', angle: -90, position: 'insideLeft', fill: '#8BC34A' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#FF9800" label={{ value: 'Vibration (mm/s)', angle: 90, position: 'insideRight', fill: '#FF9800' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #8BC34A', color: '#FFFFFF' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="turbineSpeed" stroke="#8BC34A" name="Turbine Speed" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="vibration" stroke="#FF9800" name="Vibration" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Torque Sensors Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 2, fontWeight: 600 }}>
              Torque Sensors
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={sensorData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                <XAxis dataKey="time" stroke="#8BC34A" label={{ value: 'Time (s)', position: 'insideBottom', offset: -5, fill: '#8BC34A' }} />
                <YAxis stroke="#8BC34A" label={{ value: 'Torque (%)', angle: -90, position: 'insideLeft', fill: '#8BC34A' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #8BC34A', color: '#FFFFFF' }} />
                <Legend />
                <Line type="monotone" dataKey="shaftTorque" stroke="#E91E63" name="Shaft" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="propellerTorque" stroke="#3F51B5" name="Propeller" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Power Sensors Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 2, fontWeight: 600 }}>
              Power Sensors
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={sensorData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                <XAxis dataKey="time" stroke="#8BC34A" label={{ value: 'Time (s)', position: 'insideBottom', offset: -5, fill: '#8BC34A' }} />
                <YAxis stroke="#8BC34A" label={{ value: 'Power (kW)', angle: -90, position: 'insideLeft', fill: '#8BC34A' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #8BC34A', color: '#FFFFFF' }} />
                <Legend />
                <Line type="monotone" dataKey="inputPower" stroke="#FFC107" name="Input" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="loadDemand" stroke="#673AB7" name="Load Demand" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="energyYield" stroke="#009688" name="Energy Yield" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Control Parameters Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 2, fontWeight: 600 }}>
              Control Parameters
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={sensorData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                <XAxis dataKey="time" stroke="#8BC34A" label={{ value: 'Time (s)', position: 'insideBottom', offset: -5, fill: '#8BC34A' }} />
                <YAxis yAxisId="left" stroke="#8BC34A" label={{ value: 'Efficiency (%)', angle: -90, position: 'insideLeft', fill: '#8BC34A' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#FF5722" label={{ value: 'Fuel Flow (L/h)', angle: 90, position: 'insideRight', fill: '#FF5722' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #8BC34A', color: '#FFFFFF' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="efficiency" stroke="#4CAF50" name="Efficiency" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="fuelFlow" stroke="#FF5722" name="Fuel Flow" strokeWidth={2} dot={false} />
                <Line yAxisId="left" type="monotone" dataKey="humidity" stroke="#2196F3" name="Humidity" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Emissions Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 2, fontWeight: 600 }}>
              Emissions Sensors
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={sensorData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                <XAxis dataKey="time" stroke="#8BC34A" label={{ value: 'Time (s)', position: 'insideBottom', offset: -5, fill: '#8BC34A' }} />
                <YAxis stroke="#8BC34A" label={{ value: 'Emissions (ppm)', angle: -90, position: 'insideLeft', fill: '#8BC34A' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #8BC34A', color: '#FFFFFF' }} />
                <Legend />
                <Line type="monotone" dataKey="co2" stroke="#F44336" name="CO₂" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="co" stroke="#FF9800" name="CO" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Viscosity & Frequency Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 2, fontWeight: 600 }}>
              Viscosity & Frequency
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={sensorData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                <XAxis dataKey="time" stroke="#8BC34A" label={{ value: 'Time (s)', position: 'insideBottom', offset: -5, fill: '#8BC34A' }} />
                <YAxis yAxisId="left" stroke="#8BC34A" label={{ value: 'Viscosity (cSt)', angle: -90, position: 'insideLeft', fill: '#8BC34A' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#9C27B0" label={{ value: 'Frequency (Hz)', angle: 90, position: 'insideRight', fill: '#9C27B0' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #8BC34A', color: '#FFFFFF' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="viscosity" stroke="#795548" name="Viscosity" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="frequency" stroke="#9C27B0" name="Frequency" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Noise Signal Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 2, fontWeight: 600 }}>
              Noise Signal
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={sensorData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                <XAxis dataKey="time" stroke="#8BC34A" label={{ value: 'Time (s)', position: 'insideBottom', offset: -5, fill: '#8BC34A' }} />
                <YAxis stroke="#8BC34A" label={{ value: 'Amplitude', angle: -90, position: 'insideLeft', fill: '#8BC34A' }} domain={[-4, 4]} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #8BC34A', color: '#FFFFFF' }} />
                <Legend />
                <Line type="monotone" dataKey="amplitude" stroke="#8BC34A" name="Amplitude" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GraphAnalysisPage;

