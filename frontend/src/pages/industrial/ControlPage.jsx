/**
 * Control Page
 * Detailed turbine control with multiple gauges
 */

import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Paper, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import CircularGauge from '../../components/gauges/CircularGauge';

const ControlPage = () => {
  const [selectedGauge, setSelectedGauge] = useState('Gauge');
  const [selectedSensor, setSelectedSensor] = useState('SENSOR');
  const [selectedRealTime, setSelectedRealTime] = useState('REAL_TIME_M');

  const [controlData, setControlData] = useState({
    temperature: {
      ambient: 25,
      inlet: 420,
      outlet: 580,
    },
    pressure: {
      filterDiff: 15,
      turbineExhaust: 850,
      compressorDischarge: 920,
      tempData: 720,
      pressureData: 680,
    },
    rpm: {
      turbineSpeed: 28,
      rateOfRevolutions: 3050,
      vibrationData: 12,
    },
    torque: {
      shaft: 65,
      propeller: 58,
      starboard: 52,
    },
    power: {
      input: 850,
      loadDemand: 780,
      energyYield: 920,
    },
    control: {
      injectionControl: 75,
      efficiency: 88,
      humidity: 45,
      fuelFlow: 320,
      decayState: 5,
    },
    emissions: {
      dioxide: 420,
      monoxide: 85,
    },
    viscosity: 42,
  });

  useEffect(() => {
    // Simulate real-time data updates for all parameters
    const interval = setInterval(() => {
      setControlData((prev) => ({
        ...prev,
        temperature: {
          ambient: Math.max(20, Math.min(30, prev.temperature.ambient + (Math.random() - 0.5) * 1)),
          inlet: Math.max(400, Math.min(450, prev.temperature.inlet + (Math.random() - 0.5) * 5)),
          outlet: Math.max(570, Math.min(590, prev.temperature.outlet + (Math.random() - 0.5) * 5)),
        },
        pressure: {
          ...prev.pressure,
          filterDiff: Math.max(10, Math.min(20, prev.pressure.filterDiff + (Math.random() - 0.5) * 1)),
          turbineExhaust: Math.max(840, Math.min(860, prev.pressure.turbineExhaust + (Math.random() - 0.5) * 3)),
          compressorDischarge: Math.max(910, Math.min(930, prev.pressure.compressorDischarge + (Math.random() - 0.5) * 3)),
          tempData: Math.max(710, Math.min(730, prev.pressure.tempData + (Math.random() - 0.5) * 2)),
          pressureData: Math.max(670, Math.min(690, prev.pressure.pressureData + (Math.random() - 0.5) * 2)),
        },
        rpm: {
          ...prev.rpm,
          turbineSpeed: Math.max(25, Math.min(31, prev.rpm.turbineSpeed + (Math.random() - 0.5) * 1)),
          rateOfRevolutions: Math.max(3000, Math.min(3100, prev.rpm.rateOfRevolutions + (Math.random() - 0.5) * 10)),
          vibrationData: Math.max(10, Math.min(15, prev.rpm.vibrationData + (Math.random() - 0.5) * 0.5)),
        },
        torque: {
          shaft: Math.max(60, Math.min(70, prev.torque.shaft + (Math.random() - 0.5) * 1)),
          propeller: Math.max(55, Math.min(62, prev.torque.propeller + (Math.random() - 0.5) * 1)),
          starboard: Math.max(50, Math.min(55, prev.torque.starboard + (Math.random() - 0.5) * 1)),
        },
        power: {
          input: Math.max(840, Math.min(860, prev.power.input + (Math.random() - 0.5) * 5)),
          loadDemand: Math.max(770, Math.min(790, prev.power.loadDemand + (Math.random() - 0.5) * 5)),
          energyYield: Math.max(910, Math.min(930, prev.power.energyYield + (Math.random() - 0.5) * 5)),
        },
        control: {
          ...prev.control,
          injectionControl: Math.max(70, Math.min(80, prev.control.injectionControl + (Math.random() - 0.5) * 1)),
          efficiency: Math.max(85, Math.min(92, prev.control.efficiency + (Math.random() - 0.5) * 1)),
          humidity: Math.max(40, Math.min(50, prev.control.humidity + (Math.random() - 0.5) * 1)),
          fuelFlow: Math.max(310, Math.min(330, prev.control.fuelFlow + (Math.random() - 0.5) * 2)),
          decayState: Math.max(3, Math.min(7, prev.control.decayState + (Math.random() - 0.5) * 0.2)),
        },
        emissions: {
          dioxide: Math.max(410, Math.min(430, prev.emissions.dioxide + (Math.random() - 0.5) * 3)),
          monoxide: Math.max(80, Math.min(90, prev.emissions.monoxide + (Math.random() - 0.5) * 2)),
        },
        viscosity: Math.max(40, Math.min(45, prev.viscosity + (Math.random() - 0.5) * 0.5)),
      }));
    }, 2000);

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
            }}
          >
            <MenuItem value="Gauge">Gauge</MenuItem>
            <MenuItem value="Gauge_1">Gauge_1</MenuItem>
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
          </Select>
        </FormControl>
      </Box>

      {/* Dashboard Grid */}
      <Grid container spacing={2}>
        {/* T/C Section */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, backgroundColor: '#0a0a0a', border: '2px solid #8BC34A' }}>
            <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2, fontWeight: 600 }}>
              T/C
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <CircularGauge
                  value={controlData.temperature.ambient}
                  min={0}
                  max={50}
                  label="Am Temp"
                  unit="°C"
                  width={120}
                  height={120}
                />
              </Grid>
              <Grid item xs={6}>
                <CircularGauge
                  value={controlData.temperature.inlet}
                  min={0}
                  max={1000}
                  label="In Temp"
                  unit="°C"
                  width={120}
                  height={120}
                />
              </Grid>
              <Grid item xs={6}>
                <CircularGauge
                  value={controlData.temperature.outlet}
                  min={0}
                  max={1000}
                  label="Out Temp"
                  unit="°C"
                  width={120}
                  height={120}
                />
              </Grid>
              <Grid item xs={6}>
                <CircularGauge
                  value={controlData.pressure.tempData}
                  min={0}
                  max={1000}
                  label="Tempe Data"
                  unit="°C"
                  width={120}
                  height={120}
                />
              </Grid>
              <Grid item xs={12}>
                <CircularGauge
                  value={controlData.pressure.pressureData}
                  min={0}
                  max={1000}
                  label="Pressure Data"
                  unit="bar"
                  width={120}
                  height={120}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* m/bar Section */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, backgroundColor: '#0a0a0a', border: '2px solid #8BC34A' }}>
            <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2, fontWeight: 600 }}>
              m/bar
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <CircularGauge
                  value={controlData.pressure.filterDiff}
                  min={0}
                  max={100}
                  label="Filter Difference"
                  unit="mbar"
                  width={120}
                  height={120}
                />
              </Grid>
              <Grid item xs={6}>
                <CircularGauge
                  value={controlData.pressure.turbineExhaust}
                  min={0}
                  max={1000}
                  label="Turbine Exhaust"
                  unit="mbar"
                  width={120}
                  height={120}
                />
              </Grid>
              <Grid item xs={12}>
                <CircularGauge
                  value={controlData.pressure.compressorDischarge}
                  min={0}
                  max={1000}
                  label="Compressor Discharge"
                  unit="mbar"
                  width={120}
                  height={120}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* RPM Section */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, backgroundColor: '#0a0a0a', border: '2px solid #8BC34A' }}>
            <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2, fontWeight: 600 }}>
              RPM
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <CircularGauge
                  value={controlData.rpm.turbineSpeed}
                  min={0}
                  max={50}
                  label="Turbine Speed"
                  unit="rpm"
                  width={120}
                  height={120}
                />
              </Grid>
              <Grid item xs={6}>
                <CircularGauge
                  value={controlData.rpm.rateOfRevolutions}
                  min={0}
                  max={5000}
                  label="rate of revolutions"
                  unit="rpm"
                  width={120}
                  height={120}
                />
              </Grid>
              <Grid item xs={12}>
                <CircularGauge
                  value={controlData.rpm.vibrationData}
                  min={0}
                  max={100}
                  label="Vibration Data"
                  unit="mm/s"
                  width={120}
                  height={120}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Torque & Power Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, backgroundColor: '#0a0a0a', border: '2px solid #8BC34A' }}>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <CircularGauge
                  value={controlData.torque.shaft}
                  min={0}
                  max={100}
                  label="shaft torque"
                  unit="%"
                  width={110}
                  height={110}
                />
              </Grid>
              <Grid item xs={6}>
                <CircularGauge
                  value={controlData.torque.propeller}
                  min={0}
                  max={100}
                  label="Propeller Torque"
                  unit="%"
                  width={110}
                  height={110}
                />
              </Grid>
              <Grid item xs={6}>
                <CircularGauge
                  value={controlData.torque.starboard}
                  min={0}
                  max={100}
                  label="Starboard Propeller"
                  unit="%"
                  width={110}
                  height={110}
                />
              </Grid>
              <Grid item xs={6}>
                <CircularGauge
                  value={controlData.power.input}
                  min={0}
                  max={1000}
                  label="Input Power"
                  unit="kW"
                  width={110}
                  height={110}
                />
              </Grid>
              <Grid item xs={6}>
                <CircularGauge
                  value={controlData.power.loadDemand}
                  min={0}
                  max={1000}
                  label="Load Demand"
                  unit="kW"
                  width={110}
                  height={110}
                />
              </Grid>
              <Grid item xs={6}>
                <CircularGauge
                  value={controlData.power.energyYield}
                  min={0}
                  max={1000}
                  label="Energy Yield"
                  unit="kWh"
                  width={110}
                  height={110}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Control & Emissions Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, backgroundColor: '#0a0a0a', border: '2px solid #8BC34A' }}>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <CircularGauge
                  value={controlData.control.injectionControl}
                  min={0}
                  max={100}
                  label="Injecton Control"
                  unit="%"
                  width={110}
                  height={110}
                />
              </Grid>
              <Grid item xs={6}>
                <CircularGauge
                  value={controlData.control.efficiency}
                  min={0}
                  max={100}
                  label="Efficiency"
                  unit="%"
                  width={110}
                  height={110}
                />
              </Grid>
              <Grid item xs={6}>
                <CircularGauge
                  value={controlData.control.humidity}
                  min={0}
                  max={100}
                  label="Humidity"
                  unit="%"
                  width={110}
                  height={110}
                />
              </Grid>
              <Grid item xs={6}>
                <CircularGauge
                  value={controlData.control.fuelFlow}
                  min={0}
                  max={1000}
                  label="Fuel Flow"
                  unit="L/h"
                  width={110}
                  height={110}
                />
              </Grid>
              <Grid item xs={4}>
                <CircularGauge
                  value={controlData.emissions.dioxide}
                  min={0}
                  max={600}
                  label="Dioxide"
                  unit="ppm"
                  width={100}
                  height={100}
                />
              </Grid>
              <Grid item xs={4}>
                <CircularGauge
                  value={controlData.emissions.monoxide}
                  min={0}
                  max={150}
                  label="Monoxide"
                  unit="ppm"
                  width={100}
                  height={100}
                />
              </Grid>
              <Grid item xs={4}>
                <CircularGauge
                  value={controlData.viscosity}
                  min={0}
                  max={100}
                  label="viscosity"
                  unit="cSt"
                  width={100}
                  height={100}
                />
              </Grid>
              <Grid item xs={12}>
                <CircularGauge
                  value={controlData.control.decayState}
                  min={0}
                  max={10}
                  label="Decay State"
                  unit="%"
                  width={110}
                  height={110}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ControlPage;

