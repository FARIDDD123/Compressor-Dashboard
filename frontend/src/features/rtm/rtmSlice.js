// src/features/rtm/rtmSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getHistoricalData } from '../../api/rtmApi';

// Async thunk to fetch historical data
export const fetchHistoricalData = createAsyncThunk(
  'rtm/fetchHistoricalData',
  async (timeRange, { rejectWithValue }) => {
    try {
      const response = await getHistoricalData(timeRange);
      // Convert the flat API data structure to a suitable format for Recharts
      const pivotedData = response.data.reduce((acc, point) => {
        let entry = acc.find(item => item.time === point.time);
        if (!entry) {
          entry = { time: point.time, time_id: point.time };
          acc.push(entry);
        }
        entry[point.field] = point.value;
        return acc;
      }, []);
      return pivotedData;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch data');
    }
  }
);

// Generate sample live data for DVR/Monitoring
const generateSampleLiveData = () => {
  const now = Date.now();
  const data = [];
  for (let i = 0; i < 100; i++) {
    const timestamp = new Date(now - (100 - i) * 2000); // 2 second intervals
    data.push({
      time_id: `T${i + 1}`,
      timestamp: timestamp.toISOString(),
      time: timestamp.toLocaleTimeString(),
      Pressure_In: 1.2 + Math.sin(i * 0.1) * 0.2 + Math.random() * 0.1,
      Pressure_Out: 8.5 + Math.sin(i * 0.08) * 0.5 + Math.random() * 0.2,
      Flow_Rate: 45 + Math.sin(i * 0.12) * 5 + Math.random() * 2,
      Temperature_In: 420 + Math.sin(i * 0.15) * 20 + Math.random() * 5,
      Temperature_Out: 720 + Math.sin(i * 0.1) * 30 + Math.random() * 10,
      Efficiency: 0.85 + Math.sin(i * 0.05) * 0.05 + Math.random() * 0.02,
      Power_Consumption: 850 + Math.sin(i * 0.1) * 50 + Math.random() * 20,
      Load_Factor: 0.75 + Math.sin(i * 0.08) * 0.1 + Math.random() * 0.05,
      Vibration: 12 + Math.sin(i * 0.2) * 3 + Math.random() * 1,
      Frequency: 50 + Math.sin(i * 0.1) * 2 + Math.random() * 0.5,
      Amplitude: 0.5 + Math.sin(i * 0.15) * 0.2 + Math.random() * 0.1,
      Phase_Angle: 45 + Math.sin(i * 0.12) * 10 + Math.random() * 5,
      vib_std: 2.5 + Math.sin(i * 0.1) * 0.5 + Math.random() * 0.2,
      vib_max: 18 + Math.sin(i * 0.15) * 4 + Math.random() * 1,
      vib_mean: 12 + Math.sin(i * 0.1) * 2 + Math.random() * 0.5,
      vib_rms: 14 + Math.sin(i * 0.12) * 3 + Math.random() * 1,
      Ambient_Temperature: 25 + Math.sin(i * 0.05) * 3 + Math.random() * 1,
      Humidity: 45 + Math.sin(i * 0.08) * 10 + Math.random() * 3,
      Air_Pollution: 0.05 + Math.sin(i * 0.1) * 0.02 + Math.random() * 0.01,
      Density: 1.2 + Math.sin(i * 0.1) * 0.1 + Math.random() * 0.05,
      Viscosity: 0.018 + Math.sin(i * 0.12) * 0.003 + Math.random() * 0.001,
      Fuel_Quality: 0.92 + Math.sin(i * 0.05) * 0.03 + Math.random() * 0.01,
      Velocity: 120 + Math.sin(i * 0.1) * 15 + Math.random() * 5,
      Mass: 1500 + Math.sin(i * 0.05) * 50 + Math.random() * 10,
      Stiffness: 50000 + Math.sin(i * 0.08) * 5000 + Math.random() * 1000,
      Damping: 0.15 + Math.sin(i * 0.1) * 0.02 + Math.random() * 0.01,
      Maintenance_Quality: 0.88 + Math.sin(i * 0.06) * 0.05 + Math.random() * 0.02,
    });
  }
  return data;
};

// Generate comprehensive alerts data
const generateAlerts = () => {
  const alertMessages = [
    'High vibration detected in compressor stage 2 - Immediate inspection required',
    'Temperature exceeding normal range in turbine inlet (920°C measured)',
    'Pressure drop detected in filter system - 15% below normal',
    'Abnormal fuel consumption rate detected - 8% increase over baseline',
    'Bearing temperature above threshold in turbine section (95°C)',
    'Turbine speed deviation from optimal range - ±150 RPM fluctuation',
    'Exhaust temperature spike detected - 680°C peak recorded',
    'Lubrication oil pressure low warning - 2.1 bar (normal: 3.5 bar)',
    'Compressor discharge pressure anomaly - Unstable readings',
    'Cooling system efficiency reduced by 12% - Check heat exchanger',
    'Generator output voltage fluctuation - ±5V variation detected',
    'Fuel flow rate inconsistency - Injector #3 malfunction suspected',
    'Air filter differential pressure high - 450 Pa (limit: 400 Pa)',
    'Rotor imbalance detected - Vibration analysis shows 0.15mm displacement',
    'Combustion chamber temperature alert - Hot spot in zone C',
    'Gearbox oil temperature warning - 78°C approaching limit',
    'Inlet guide vane position error - Actuator #2 not responding',
    'Starting air pressure insufficient - 18 bar (required: 25 bar)',
    'Control system communication timeout - PLC connection lost',
    'Emergency shutdown system armed - Manual reset required',
    'Alternator bearing temperature high - 88°C on bearing #4',
    'Fuel pump discharge pressure low - Primary pump degradation',
    'Compressor surge detected - Anti-surge valve activated',
    'Turbine blade temperature uneven - 45°C difference between stages',
    'Hydraulic system pressure drop - Possible leak in valve circuit',
    'Cooling water flow rate reduced - 12% below nominal',
    'Emissions level exceeding limits - NOx: 85 ppm (limit: 75 ppm)',
    'Power output below expected range - 15 MW vs 18 MW rated',
    'Governor control malfunction - Speed regulation error',
    'Shaft alignment deviation detected - 0.08mm lateral offset',
    'Oil contamination detected - Particle count elevated',
    'Seal leakage in compressor section - Visible oil trace',
    'Thermal expansion exceeding design limits - Casing #2',
    'Electrical fault in excitation system - Voltage regulator issue',
    'Hydraulic actuator response time delayed - Valve #7',
    'Sensor drift detected - Temperature sensor T-14 calibration needed',
    'Fuel quality degradation - Cetane number below specification',
    'Air intake restriction - Foreign object detection system triggered',
    'Compressor blade erosion indicated - Performance degradation 3%',
    'Turbine clearance loss - Tip rub marks on casing inspection',
    'Bearing wear detected - Increased metal particles in oil analysis',
    'Control valve sticking - Position feedback mismatch',
    'Ignition system deterioration - Spark plug replacement needed',
    'Exhaust system restriction - Back pressure 8% above normal',
    'Fuel system contamination - Water detected in fuel line',
    'Load rejection event - Overspeed protection activated',
    'Cooling fan belt tension low - Slippage detected',
    'Pneumatic system leak - Compressor runtime increased 20%',
    'Emergency lubrication pump activated - Main pump failure',
    'Flame detector signal weak - Cleaning or replacement required',
  ];

  const alerts = [];
  const now = Date.now();
  
  const severityWeights = [
    { severity: 'Critical', weight: 0.2 },
    { severity: 'Warning', weight: 0.5 },
    { severity: 'Info', weight: 0.3 }
  ];
  
  const sources = ['Compressor', 'Turbine', 'Generator', 'Control System', 'Fuel System', 'Lubrication', 'Cooling System'];
  
  // Generate 50 alerts over the last 8 hours
  for (let i = 0; i < 50; i++) {
    const timeOffset = Math.floor(Math.random() * 8 * 60 * 60 * 1000); // Random time within 8 hours
    const timestamp = new Date(now - timeOffset);
    
    // Weighted random severity selection
    const rand = Math.random();
    let severity = 'Info';
    let cumWeight = 0;
    for (const sw of severityWeights) {
      cumWeight += sw.weight;
      if (rand <= cumWeight) {
        severity = sw.severity;
        break;
      }
    }
    
    alerts.push({
      id: `alert-${i + 1}`,
      iso_timestamp: timestamp.toISOString(),
      display_timestamp: timestamp.toLocaleString(),
      message: alertMessages[i % alertMessages.length],
      severity: severity,
      source: sources[Math.floor(Math.random() * sources.length)],
    });
  }
  
  // Sort by timestamp (most recent first)
  return alerts.sort((a, b) => new Date(b.iso_timestamp) - new Date(a.iso_timestamp));
};

const initialState = {
  liveData: generateSampleLiveData(),
  alerts: generateAlerts(),
  historicalData: [],
  // Holds anomalies that arrive before their corresponding data point
  unmatchedAnomalies: {},
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  maxDataPoints: 500,
  isConnected: false,
  anomalyCauseCounts: {
    'High_Vibration': 156,
    'Temperature_Anomaly': 143,
    'Pressure_Drop': 98,
    'Flow_Rate_Deviation': 112,
    'Efficiency_Loss': 87,
    'Bearing_Wear': 134,
    'Fuel_Quality_Issue': 76,
    'Combustion_Instability': 105,
    'Rotor_Imbalance': 92,
    'Lubrication_System_Fault': 68,
    'Compressor_Surge': 54,
    'Turbine_Blade_Damage': 41,
    'Generator_Fault': 83,
    'Control_System_Error': 95,
    'Cooling_System_Failure': 62,
    'Exhaust_System_Blockage': 45,
    'Air_Filter_Clogging': 118,
    'Fuel_Pump_Malfunction': 71,
    'Seal_Leakage': 89,
    'Sensor_Drift': 108,
    'Oil_Contamination': 79,
    'Valve_Malfunction': 56,
    'Thermal_Expansion_Issue': 48,
    'Electrical_Fault': 64,
    'Hydraulic_System_Leak': 52,
  },
};

export const rtmSlice = createSlice({
  name: 'rtm',
  initialState,
  reducers: {
    // Updates the WebSocket connection status
    setConnectionStatus: (state, action) => {
      state.isConnected = action.payload;
    },
    addDataPoint: (state, action) => {
      const newPoint = { ...action.payload };
      const isExisting = state.liveData.some(point => point.time_id === newPoint.time_id);

      if (!isExisting) {
        // Check if an anomaly alert for this point arrived early
        if (state.unmatchedAnomalies && state.unmatchedAnomalies[newPoint.time_id]) {
          newPoint.anomalyCauses = state.unmatchedAnomalies[newPoint.time_id];
          // Clean up the matched anomaly
          delete state.unmatchedAnomalies[newPoint.time_id];
        }

        let updatedLiveData = [...state.liveData, newPoint];
        
        // If the array exceeds the max length, trim the oldest points
        if (updatedLiveData.length > state.maxDataPoints) {
          updatedLiveData = updatedLiveData.slice(-state.maxDataPoints);
        }
        
        state.liveData = updatedLiveData;
      }
    },
    addAlert: (state, action) => {
      const lastAlert = state.alerts[0];
      if (lastAlert && lastAlert.message === action.payload.message) {
        return;
      }
      state.alerts.unshift(action.payload);
    },
    markAsAnomaly: (state, action) => {
      const { time_id, causes } = action.payload;
      
      // Iterate over the causes and increment their count
      if (causes && causes.length > 0) {
        causes.forEach(cause => {
          if (state.anomalyCauseCounts[cause]) {
            state.anomalyCauseCounts[cause] += 1;
          } else {
            state.anomalyCauseCounts[cause] = 1;
          }
        });
      }
      
      const pointIndex = state.liveData.findIndex(p => p.time_id === time_id);

      if (pointIndex !== -1) {
        // If the data point already exists, mark it as an anomaly
        state.liveData[pointIndex].anomalyCauses = causes;
      } else {
        // If the data point hasn't arrived yet, store the anomaly to match it later
        state.unmatchedAnomalies[time_id] = causes;
      }
    },
    clearHistoricalData: (state) => {
        state.historicalData = [];
        state.status = 'idle';
    },
    // New reducer to clear live data for performance (KEEP ONLY THE LATEST 75 POINTS)
    clearLiveData: (state) => {
      if (state.liveData.length > 75) {
        state.liveData = state.liveData.slice(-75);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHistoricalData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchHistoricalData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.historicalData = action.payload;
      })
      .addCase(fetchHistoricalData.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export const { 
  addDataPoint, 
  addAlert, 
  markAsAnomaly, 
  clearHistoricalData, 
  setConnectionStatus,
  clearLiveData
} = rtmSlice.actions;

export default rtmSlice.reducer;