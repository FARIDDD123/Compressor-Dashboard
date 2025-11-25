/**
 * PDM (Predictive Maintenance) Page
 * Shows threshold gauges and control panel
 */

import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Card, CardContent, Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel, Alert, List, ListItem, ListItemText, Divider } from '@mui/material';
import { SmartToy, AutoAwesome, CheckCircle, Warning } from '@mui/icons-material';
import LinearGauge from '../../components/gauges/LinearGauge';
import CircularGauge from '../../components/gauges/CircularGauge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import PageHeader from '../../components/common/PageHeader';

const PDMPage = () => {
  // Dynamic thresholds based on selected sensor
  const getThresholds = () => {
    const sensorParams = sensorsData[selectedSensor].parameters;
    const paramKeys = Object.keys(sensorParams);
    
    return {
      threshold1: {
        name: paramKeys[0] || 'Parameter 1',
        value: sensorParams[paramKeys[0]]?.value || 0,
        max: sensorParams[paramKeys[0]]?.max || 100,
        unit: sensorParams[paramKeys[0]]?.unit || '',
        warningLevel: (sensorParams[paramKeys[0]]?.max || 100) * 0.8,
        criticalLevel: (sensorParams[paramKeys[0]]?.max || 100) * 0.95,
      },
      threshold2: {
        name: paramKeys[1] || 'Parameter 2',
        value: sensorParams[paramKeys[1]]?.value || 0,
        max: sensorParams[paramKeys[1]]?.max || 100,
        unit: sensorParams[paramKeys[1]]?.unit || '',
        warningLevel: (sensorParams[paramKeys[1]]?.max || 100) * 0.8,
        criticalLevel: (sensorParams[paramKeys[1]]?.max || 100) * 0.95,
      },
      threshold3: {
        name: paramKeys[2] || 'Parameter 3',
        value: sensorParams[paramKeys[2]]?.value || 0,
        max: sensorParams[paramKeys[2]]?.max || 100,
        unit: sensorParams[paramKeys[2]]?.unit || '',
        warningLevel: (sensorParams[paramKeys[2]]?.max || 100) * 0.8,
        criticalLevel: (sensorParams[paramKeys[2]]?.max || 100) * 0.95,
      },
      threshold4: {
        name: paramKeys[3] || 'Parameter 4',
        value: sensorParams[paramKeys[3]]?.value || 0,
        max: sensorParams[paramKeys[3]]?.max || 100,
        unit: sensorParams[paramKeys[3]]?.unit || '',
        warningLevel: (sensorParams[paramKeys[3]]?.max || 100) * 0.8,
        criticalLevel: (sensorParams[paramKeys[3]]?.max || 100) * 0.95,
      },
    };
  };

  // PDM Data
  const [pdmData, setPdmData] = useState({
    rul: 45, // Remaining Useful Life in days
    healthScore: 87,
    maintenanceSchedule: [
      { 
        component: 'Turbine Blades (Stage 1)', 
        daysUntil: 8, 
        priority: 'High', 
        status: 'Critical',
        maintenanceType: 'Replacement',
        partNumber: 'TB-S1-4582',
        currentHours: 28500,
        maxHours: 30000,
        timeToOverhaul: '8 days',
        timeToExchange: '8 days (Critical)',
        lastMaintenance: '2023-05-15',
        estimatedCost: '$125,000',
        details: 'Critical wear detected. Immediate replacement required to prevent catastrophic failure.'
      },
      { 
        component: 'Compressor Blades (Stages 1-3)', 
        daysUntil: 12, 
        priority: 'High', 
        status: 'Warning',
        maintenanceType: 'Overhaul',
        partNumber: 'CB-123-7890',
        currentHours: 22000,
        maxHours: 25000,
        timeToOverhaul: '12 days',
        timeToExchange: '45 days',
        lastMaintenance: '2023-08-10',
        estimatedCost: '$85,000',
        details: 'Erosion and fouling detected. Cleaning and inspection required.'
      },
      { 
        component: 'Main Bearing Assembly', 
        daysUntil: 28, 
        priority: 'Medium', 
        status: 'Normal',
        maintenanceType: 'Inspection & Lubrication',
        partNumber: 'MBA-2250',
        currentHours: 18000,
        maxHours: 40000,
        timeToOverhaul: '28 days',
        timeToExchange: '180 days',
        lastMaintenance: '2024-09-20',
        estimatedCost: '$15,000',
        details: 'Scheduled bearing inspection and oil analysis. Vibration levels normal.'
      },
      { 
        component: 'Fuel Injectors (Set of 16)', 
        daysUntil: 35, 
        priority: 'Low', 
        status: 'Normal',
        maintenanceType: 'Cleaning & Testing',
        partNumber: 'FI-16X-3340',
        currentHours: 15000,
        maxHours: 20000,
        timeToOverhaul: '35 days',
        timeToExchange: '90 days',
        lastMaintenance: '2024-08-05',
        estimatedCost: '$22,000',
        details: 'Routine cleaning and flow testing. Minor carbon buildup detected.'
      },
      { 
        component: 'Combustion Chamber Liner', 
        daysUntil: 42, 
        priority: 'Low', 
        status: 'Normal',
        maintenanceType: 'Inspection',
        partNumber: 'CCL-8900',
        currentHours: 12000,
        maxHours: 35000,
        timeToOverhaul: '42 days',
        timeToExchange: '220 days',
        lastMaintenance: '2024-07-12',
        estimatedCost: '$8,500',
        details: 'Thermal imaging inspection scheduled. No anomalies detected.'
      },
      { 
        component: 'Turbine Blades (Stage 2)', 
        daysUntil: 18, 
        priority: 'High', 
        status: 'Warning',
        maintenanceType: 'Overhaul',
        partNumber: 'TB-S2-4583',
        currentHours: 26000,
        maxHours: 30000,
        timeToOverhaul: '18 days',
        timeToExchange: '65 days',
        lastMaintenance: '2023-06-22',
        estimatedCost: '$105,000',
        details: 'Surface coating degradation. Recoating and balancing required.'
      },
      { 
        component: 'Generator Rotor Windings', 
        daysUntil: 55, 
        priority: 'Medium', 
        status: 'Normal',
        maintenanceType: 'Testing',
        partNumber: 'GRW-7750',
        currentHours: 32000,
        maxHours: 50000,
        timeToOverhaul: '55 days',
        timeToExchange: '280 days',
        lastMaintenance: '2024-06-15',
        estimatedCost: '$12,000',
        details: 'Insulation resistance testing and thermal analysis.'
      },
      { 
        component: 'Cooling System Heat Exchanger', 
        daysUntil: 62, 
        priority: 'Low', 
        status: 'Normal',
        maintenanceType: 'Cleaning',
        partNumber: 'HEX-5520',
        currentHours: 28000,
        maxHours: 60000,
        timeToOverhaul: '62 days',
        timeToExchange: '350 days',
        lastMaintenance: '2024-05-18',
        estimatedCost: '$6,500',
        details: 'Scheduled cleaning and pressure test. Flow rates normal.'
      },
      { 
        component: 'Lubrication Oil Pump', 
        daysUntil: 48, 
        priority: 'Medium', 
        status: 'Normal',
        maintenanceType: 'Overhaul',
        partNumber: 'LOP-3380',
        currentHours: 16000,
        maxHours: 25000,
        timeToOverhaul: '48 days',
        timeToExchange: '120 days',
        lastMaintenance: '2024-07-08',
        estimatedCost: '$18,500',
        details: 'Seal replacement and impeller inspection.'
      },
      { 
        component: 'Thrust Bearing', 
        daysUntil: 75, 
        priority: 'Low', 
        status: 'Normal',
        maintenanceType: 'Inspection',
        partNumber: 'TB-9920',
        currentHours: 20000,
        maxHours: 45000,
        timeToOverhaul: '75 days',
        timeToExchange: '320 days',
        lastMaintenance: '2024-04-10',
        estimatedCost: '$9,800',
        details: 'Clearance measurement and wear analysis.'
      },
      { 
        component: 'Inlet Guide Vanes', 
        daysUntil: 22, 
        priority: 'Medium', 
        status: 'Warning',
        maintenanceType: 'Calibration',
        partNumber: 'IGV-6670',
        currentHours: 24000,
        maxHours: 30000,
        timeToOverhaul: '22 days',
        timeToExchange: '95 days',
        lastMaintenance: '2024-08-25',
        estimatedCost: '$14,200',
        details: 'Actuator calibration and vane alignment check.'
      },
      { 
        component: 'Exhaust Diffuser', 
        daysUntil: 88, 
        priority: 'Low', 
        status: 'Normal',
        maintenanceType: 'Inspection',
        partNumber: 'ED-4410',
        currentHours: 30000,
        maxHours: 70000,
        timeToOverhaul: '88 days',
        timeToExchange: '480 days',
        lastMaintenance: '2024-03-05',
        estimatedCost: '$5,200',
        details: 'Visual inspection and thickness measurement.'
      },
      { 
        component: 'Control Valves (Primary)', 
        daysUntil: 38, 
        priority: 'Medium', 
        status: 'Normal',
        maintenanceType: 'Overhaul',
        partNumber: 'CV-P-8850',
        currentHours: 14000,
        maxHours: 20000,
        timeToOverhaul: '38 days',
        timeToExchange: '110 days',
        lastMaintenance: '2024-07-28',
        estimatedCost: '$16,800',
        details: 'Seat grinding and actuator overhaul.'
      },
      { 
        component: 'Vibration Sensors (Set of 8)', 
        daysUntil: 65, 
        priority: 'Low', 
        status: 'Normal',
        maintenanceType: 'Calibration',
        partNumber: 'VS-8X-2210',
        currentHours: 36000,
        maxHours: 50000,
        timeToOverhaul: '65 days',
        timeToExchange: '240 days',
        lastMaintenance: '2024-04-20',
        estimatedCost: '$4,800',
        details: 'Factory calibration and mounting verification.'
      },
      { 
        component: 'Turbine Shaft', 
        daysUntil: 95, 
        priority: 'Low', 
        status: 'Normal',
        maintenanceType: 'Inspection',
        partNumber: 'TS-MAIN-1100',
        currentHours: 28000,
        maxHours: 80000,
        timeToOverhaul: '95 days',
        timeToExchange: '850 days',
        lastMaintenance: '2024-02-15',
        estimatedCost: '$7,500',
        details: 'NDT inspection and runout measurement.'
      },
    ],
    componentHealth: [
      { name: 'Compressor', health: 82, trend: 'down' },
      { name: 'Turbine', health: 75, trend: 'down' },
      { name: 'Combustion', health: 91, trend: 'up' },
      { name: 'Bearing', health: 88, trend: 'stable' },
      { name: 'Cooling', health: 94, trend: 'up' },
    ],
    rulHistory: Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      rul: 60 - i * 0.5 + Math.sin(i * 0.2) * 3,
    })),
    failureProbability: [
      { component: 'Compressor', probability: 15, risk: 'Medium' },
      { component: 'Turbine', probability: 22, risk: 'High' },
      { component: 'Bearing', probability: 8, risk: 'Low' },
      { component: 'Fuel System', probability: 12, risk: 'Medium' },
      { component: 'Cooling', probability: 5, risk: 'Low' },
    ],
  });


  // Sensor data
  const [selectedSensor, setSelectedSensor] = useState('Sensor_2');
  const [selectedGaugeParameter, setSelectedGaugeParameter] = useState('Vibration');
  const [selectedSensorParameter, setSelectedSensorParameter] = useState('Temperature');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  
  // AI Control System
  const [aiControlEnabled, setAiControlEnabled] = useState(false);
  const [aiStatus, setAiStatus] = useState({
    status: 'Idle',
    lastAction: 'None',
    actionCount: 0,
    confidence: 0,
  });
  const [aiDecisions, setAiDecisions] = useState([]);
  const [aiRecommendations, setAiRecommendations] = useState([]);

  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    // Simulate analysis
    setTimeout(() => {
      const sensorParams = sensorsData[selectedSensor].parameters;
      const paramKeys = Object.keys(sensorParams);
      
      // Calculate health score
      let healthScore = 100;
      const issues = [];
      
      paramKeys.forEach(key => {
        const param = sensorParams[key];
        const percentage = (param.value / param.max) * 100;
        
        if (percentage > 95) {
          healthScore -= 15;
          issues.push(`${key}: Critical level (${param.value.toFixed(1)} ${param.unit})`);
        } else if (percentage > 80) {
          healthScore -= 5;
          issues.push(`${key}: Warning level (${param.value.toFixed(1)} ${param.unit})`);
        }
      });
      
      setAnalysisResult({
        healthScore: Math.max(healthScore, 0),
        status: healthScore >= 90 ? 'Excellent' : healthScore >= 75 ? 'Good' : healthScore >= 60 ? 'Fair' : 'Poor',
        issues: issues,
        timestamp: new Date().toLocaleString(),
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  const sensorsData = {
    'Sensor_1': {
      name: 'Compressor Inlet Sensor',
      location: 'Compressor Stage 1',
      status: 'Active',
      parameters: {
        'Temperature': { value: 25.5, unit: '°C', min: 0, max: 50, status: 'Normal' },
        'Pressure': { value: 101.3, unit: 'kPa', min: 90, max: 110, status: 'Normal' },
        'Flow Rate': { value: 45.2, unit: 'kg/s', min: 40, max: 55, status: 'Normal' },
        'Humidity': { value: 62.5, unit: '%', min: 30, max: 80, status: 'Normal' },
      },
      gauges: {
        'Vibration': { value: 2.5, unit: 'mm/s', min: 0, max: 10 },
        'Noise': { value: 65, unit: 'dB', min: 0, max: 100 },
        'Efficiency': { value: 94, unit: '%', min: 0, max: 100 },
      }
    },
    'Sensor_2': {
      name: 'Turbine Monitoring Sensor',
      location: 'Turbine Section',
      status: 'Active',
      parameters: {
        'Temperature': { value: 720.5, unit: '°C', min: 500, max: 1200, status: 'Normal' },
        'Pressure': { value: 850.2, unit: 'kPa', min: 600, max: 1000, status: 'Normal' },
        'Rotational Speed': { value: 2850, unit: 'RPM', min: 2500, max: 3200, status: 'Normal' },
        'Torque': { value: 65.8, unit: 'kNm', min: 50, max: 80, status: 'Normal' },
      },
      gauges: {
        'Vibration': { value: 4.2, unit: 'mm/s', min: 0, max: 10 },
        'Noise': { value: 82, unit: 'dB', min: 0, max: 100 },
        'Efficiency': { value: 88, unit: '%', min: 0, max: 100 },
      }
    },
    'Sensor_3': {
      name: 'Combustion Chamber Sensor',
      location: 'Combustion Zone',
      status: 'Active',
      parameters: {
        'Temperature': { value: 980.3, unit: '°C', min: 800, max: 1400, status: 'Normal' },
        'Pressure': { value: 1250.8, unit: 'kPa', min: 1000, max: 1500, status: 'Normal' },
        'Fuel Flow': { value: 12.5, unit: 'kg/s', min: 8, max: 18, status: 'Normal' },
        'Air Flow': { value: 158.2, unit: 'kg/s', min: 120, max: 200, status: 'Normal' },
      },
      gauges: {
        'Vibration': { value: 3.8, unit: 'mm/s', min: 0, max: 10 },
        'Noise': { value: 95, unit: 'dB', min: 0, max: 100 },
        'Efficiency': { value: 91, unit: '%', min: 0, max: 100 },
      }
    },
    'Sensor_4': {
      name: 'Exhaust System Sensor',
      location: 'Exhaust Outlet',
      status: 'Active',
      parameters: {
        'Temperature': { value: 550.8, unit: '°C', min: 300, max: 900, status: 'Normal' },
        'Pressure': { value: 105.5, unit: 'kPa', min: 95, max: 120, status: 'Normal' },
        'Flow Rate': { value: 165.5, unit: 'kg/s', min: 140, max: 200, status: 'Normal' },
        'Emissions CO2': { value: 420, unit: 'ppm', min: 0, max: 600, status: 'Normal' },
      },
      gauges: {
        'Vibration': { value: 1.8, unit: 'mm/s', min: 0, max: 10 },
        'Noise': { value: 78, unit: 'dB', min: 0, max: 100 },
        'Efficiency': { value: 86, unit: '%', min: 0, max: 100 },
      }
    },
    'Sensor_5': {
      name: 'Bearing Condition Sensor',
      location: 'Main Bearing Assembly',
      status: 'Active',
      parameters: {
        'Temperature': { value: 68.5, unit: '°C', min: 40, max: 95, status: 'Normal' },
        'Vibration X-Axis': { value: 3.2, unit: 'mm/s', min: 0, max: 8, status: 'Normal' },
        'Vibration Y-Axis': { value: 2.8, unit: 'mm/s', min: 0, max: 8, status: 'Normal' },
        'Oil Pressure': { value: 4.5, unit: 'bar', min: 3, max: 6, status: 'Normal' },
      },
      gauges: {
        'Vibration': { value: 3.5, unit: 'mm/s', min: 0, max: 10 },
        'Noise': { value: 55, unit: 'dB', min: 0, max: 100 },
        'Efficiency': { value: 96, unit: '%', min: 0, max: 100 },
      }
    },
    'Sensor_6': {
      name: 'Generator Monitoring Sensor',
      location: 'Generator Section',
      status: 'Active',
      parameters: {
        'Temperature': { value: 85.2, unit: '°C', min: 50, max: 130, status: 'Normal' },
        'Power Output': { value: 920, unit: 'kW', min: 500, max: 1200, status: 'Normal' },
        'Voltage': { value: 13.8, unit: 'kV', min: 11, max: 15, status: 'Normal' },
        'Current': { value: 42.5, unit: 'A', min: 30, max: 60, status: 'Normal' },
      },
      gauges: {
        'Vibration': { value: 2.2, unit: 'mm/s', min: 0, max: 10 },
        'Noise': { value: 68, unit: 'dB', min: 0, max: 100 },
        'Efficiency': { value: 93, unit: '%', min: 0, max: 100 },
      }
    },
  };


  // Update selected parameters when sensor changes
  useEffect(() => {
    const sensorGauges = Object.keys(sensorsData[selectedSensor].gauges);
    const sensorParams = Object.keys(sensorsData[selectedSensor].parameters);
    
    if (!sensorGauges.includes(selectedGaugeParameter)) {
      setSelectedGaugeParameter(sensorGauges[0]);
    }
    
    if (!sensorParams.includes(selectedSensorParameter)) {
      setSelectedSensorParameter(sensorParams[0]);
    }
  }, [selectedSensor]);

  // AI Control System - Automatic Monitoring and Decision Making
  useEffect(() => {
    if (!aiControlEnabled) {
      setAiStatus({
        status: 'Idle',
        lastAction: 'None',
        actionCount: 0,
        confidence: 0,
      });
      return;
    }

    setAiStatus(prev => ({
      ...prev,
      status: 'Active',
      confidence: 85 + Math.random() * 10,
    }));

    const aiInterval = setInterval(() => {
      // AI monitors all sensors and parameters
      const sensorParams = sensorsData[selectedSensor].parameters;
      const paramKeys = Object.keys(sensorParams);
      
      const criticalIssues = [];
      const warnings = [];
      const recommendations = [];
      
      // Analyze each parameter
      paramKeys.forEach(key => {
        const param = sensorParams[key];
        const percentage = (param.value / param.max) * 100;
        
        if (percentage > 95) {
          criticalIssues.push({
            sensor: selectedSensor,
            parameter: key,
            value: param.value,
            unit: param.unit,
            severity: 'Critical',
            action: 'Immediate shutdown recommended',
          });
          recommendations.push(`CRITICAL: ${key} at ${param.value.toFixed(1)}${param.unit} - Reduce load immediately`);
        } else if (percentage > 85) {
          warnings.push({
            sensor: selectedSensor,
            parameter: key,
            value: param.value,
            unit: param.unit,
            severity: 'Warning',
            action: 'Monitor closely',
          });
          recommendations.push(`WARNING: ${key} at ${param.value.toFixed(1)}${param.unit} - Consider reducing load`);
        } else if (percentage > 75) {
          recommendations.push(`INFO: ${key} at ${param.value.toFixed(1)}${param.unit} - Operating within safe range`);
        }
      });

      // AI makes decisions
      if (criticalIssues.length > 0 || warnings.length > 0) {
        const decision = {
          timestamp: new Date().toLocaleTimeString(),
          sensor: selectedSensor,
          action: criticalIssues.length > 0 ? 'Emergency Protocol Activated' : 'Preventive Measures Applied',
          details: criticalIssues.length > 0 
            ? `Critical: ${criticalIssues.map(i => i.parameter).join(', ')}`
            : `Warnings: ${warnings.map(w => w.parameter).join(', ')}`,
          confidence: 85 + Math.random() * 10,
          severity: criticalIssues.length > 0 ? 'Critical' : 'Warning',
        };

        setAiDecisions(prev => [decision, ...prev.slice(0, 9)]); // Keep last 10 decisions
        
        setAiStatus(prev => ({
          ...prev,
          lastAction: decision.action,
          actionCount: prev.actionCount + 1,
          confidence: decision.confidence,
        }));
      } else {
        setAiStatus(prev => ({
          ...prev,
          lastAction: 'System Normal - Monitoring',
          confidence: 92 + Math.random() * 5,
        }));
      }

      setAiRecommendations(recommendations.slice(0, 5)); // Keep top 5 recommendations
    }, 5000); // Check every 5 seconds

    return () => clearInterval(aiInterval);
  }, [aiControlEnabled, selectedSensor]);


  return (
    <Box sx={{ width: '100%', height: '100%', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <PageHeader
          title="Predictive Maintenance (PDM)"
          subtitle="Monitor component health and predict maintenance needs"
        />
        
        {/* AI Control Toggle */}
        <Card sx={{ 
          backgroundColor: aiControlEnabled ? 'rgba(139, 195, 74, 0.1)' : '#1a1a1a', 
          border: `2px solid ${aiControlEnabled ? '#8BC34A' : '#666'}`,
          minWidth: 280,
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SmartToy sx={{ color: aiControlEnabled ? '#8BC34A' : '#666', fontSize: 28 }} />
                <Typography variant="h6" sx={{ color: aiControlEnabled ? '#8BC34A' : '#B0BEC5', fontWeight: 700 }}>
                  AI Control
                </Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={aiControlEnabled}
                    onChange={(e) => setAiControlEnabled(e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#8BC34A',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#8BC34A',
                      },
                    }}
                  />
                }
                label=""
                sx={{ m: 0 }}
              />
            </Box>
            
            {aiControlEnabled && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#B0BEC5' }}>Status:</Typography>
                  <Chip 
                    label={aiStatus.status} 
                    size="small" 
                    color="success"
                    icon={<AutoAwesome />}
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#B0BEC5' }}>Confidence:</Typography>
                  <Typography variant="caption" sx={{ color: '#8BC34A', fontWeight: 700 }}>
                    {aiStatus.confidence.toFixed(1)}%
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#B0BEC5' }}>Actions Taken:</Typography>
                  <Typography variant="caption" sx={{ color: '#FFFFFF', fontWeight: 700 }}>
                    {aiStatus.actionCount}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#FF9800', display: 'block', mt: 1, fontSize: '0.65rem' }}>
                  {aiStatus.lastAction}
                </Typography>
              </Box>
            )}
            
            {!aiControlEnabled && (
              <Typography variant="caption" sx={{ color: '#B0BEC5', display: 'block', mt: 1 }}>
                Enable AI to automatically monitor and control system parameters
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>
      
      {/* RUL and Health Score Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2 }}>
                Remaining Useful Life
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularGauge
                  value={pdmData.rul}
                  min={0}
                  max={60}
                  label="RUL"
                  unit="days"
                  width={120}
                  height={120}
                />
              </Box>
              <Typography variant="h4" sx={{ color: '#FFFFFF', textAlign: 'center', mt: 2 }}>
                {pdmData.rul} days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2 }}>
                Overall Health Score
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularGauge
                  value={pdmData.healthScore}
                  min={0}
                  max={100}
                  label="Health"
                  unit="%"
                  width={120}
                  height={120}
                />
              </Box>
              <Typography variant="h4" sx={{ color: '#FFFFFF', textAlign: 'center', mt: 2 }}>
                {pdmData.healthScore}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2 }}>
                Upcoming Maintenance
              </Typography>
              <Typography variant="h4" sx={{ color: '#FF9800', textAlign: 'center', mb: 1 }}>
                {pdmData.maintenanceSchedule[0].daysUntil} days
              </Typography>
              <Typography variant="body2" sx={{ color: '#B0BEC5', textAlign: 'center' }}>
                {pdmData.maintenanceSchedule[0].component}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2 }}>
                Critical Alerts
              </Typography>
              <Typography variant="h4" sx={{ color: '#F44336', textAlign: 'center', mb: 1 }}>
                {pdmData.maintenanceSchedule.filter(m => m.status === 'Critical').length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#B0BEC5', textAlign: 'center' }}>
                Components requiring attention
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Left Panel - Sensor Parameter Thresholds */}
        <Grid item xs={12} md={3}>
          <Paper
            sx={{
              p: 2,
              backgroundColor: '#1a1a1a',
              border: '2px solid #8BC34A',
              height: '100%',
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: '#8BC34A', mb: 2, textAlign: 'center', fontWeight: 600 }}
            >
              Parameter Thresholds
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: '#B0BEC5', mb: 3, textAlign: 'center', display: 'block' }}
            >
              {selectedSensor} - {sensorsData[selectedSensor].name}
            </Typography>
            
            {Object.entries(getThresholds()).map(([key, threshold]) => (
              <Box key={key} sx={{ mb: 3 }}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 1.5,
                  backgroundColor: '#0a0a0a',
                  borderRadius: 2,
                  border: '1px solid #8BC34A'
                }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#8BC34A', 
                      fontWeight: 600, 
                      mb: 0.5,
                      fontSize: '0.7rem',
                      textAlign: 'center'
                    }}
                  >
                    {threshold.name}
                  </Typography>
                  
                  {/* Current Value */}
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: threshold.value > threshold.criticalLevel ? '#F44336' :
                             threshold.value > threshold.warningLevel ? '#FF9800' : '#8BC34A',
                      fontWeight: 700,
                      mb: 0.5
                    }}
                  >
                    {typeof threshold.value === 'number' ? threshold.value.toFixed(1) : threshold.value} {threshold.unit}
                  </Typography>

                  {/* Progress Bar */}
                  <Box sx={{ width: '100%', mb: 1 }}>
                    <Box sx={{ 
                      width: '100%', 
                      height: 8, 
                      backgroundColor: '#333', 
                      borderRadius: 1,
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <Box sx={{ 
                        width: `${(threshold.value / threshold.max) * 100}%`, 
                        height: '100%',
                        backgroundColor: threshold.value > threshold.criticalLevel ? '#F44336' :
                                       threshold.value > threshold.warningLevel ? '#FF9800' : '#8BC34A',
                        transition: 'width 0.3s ease'
                      }} />
                      {/* Warning threshold marker */}
                      <Box sx={{
                        position: 'absolute',
                        left: `${(threshold.warningLevel / threshold.max) * 100}%`,
                        top: 0,
                        bottom: 0,
                        width: 2,
                        backgroundColor: '#FF9800',
                        opacity: 0.7
                      }} />
                      {/* Critical threshold marker */}
                      <Box sx={{
                        position: 'absolute',
                        left: `${(threshold.criticalLevel / threshold.max) * 100}%`,
                        top: 0,
                        bottom: 0,
                        width: 2,
                        backgroundColor: '#F44336',
                        opacity: 0.7
                      }} />
                    </Box>
                  </Box>

                  {/* Range Info */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Typography variant="caption" sx={{ color: '#B0BEC5', fontSize: '0.65rem' }}>
                      0
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#FF9800', fontSize: '0.65rem' }}>
                      ⚠ {threshold.warningLevel.toFixed(0)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#F44336', fontSize: '0.65rem' }}>
                      🔴 {threshold.criticalLevel.toFixed(0)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#B0BEC5', fontSize: '0.65rem' }}>
                      {threshold.max}
                    </Typography>
                  </Box>

                  {/* Status Chip */}
                  <Chip
                    label={
                      threshold.value > threshold.criticalLevel ? 'CRITICAL' :
                      threshold.value > threshold.warningLevel ? 'WARNING' : 'NORMAL'
                    }
                    size="small"
                    color={
                      threshold.value > threshold.criticalLevel ? 'error' :
                      threshold.value > threshold.warningLevel ? 'warning' : 'success'
                    }
                    sx={{ mt: 1, fontSize: '0.65rem', height: 18 }}
                  />
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Middle Panel - Control Buttons */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              backgroundColor: '#1a1a1a',
              border: '2px solid #8BC34A',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Sensor Selector */}
            <FormControl fullWidth sx={{ width: '80%', mb: 3 }}>
              <Select
                value={selectedSensor}
                onChange={(e) => setSelectedSensor(e.target.value)}
                sx={{
                  backgroundColor: '#D3D3D3',
                  borderRadius: '30px',
                  color: '#000000',
                  fontWeight: 700,
                  fontStyle: 'italic',
                  textAlign: 'center',
                  '& .MuiSelect-select': {
                    textAlign: 'center',
                    py: 1.5,
                  },
                  '&:before, &:after': {
                    display: 'none',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                  },
                }}
              >
                {Object.keys(sensorsData).map((sensorKey) => (
                  <MenuItem key={sensorKey} value={sensorKey}>
                    {sensorKey} - {sensorsData[sensorKey].name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Sensor Info Display */}
            <Box sx={{ width: '80%', mb: 2, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#8BC34A', fontWeight: 600 }}>
                Location: {sensorsData[selectedSensor].location}
              </Typography>
              <Chip
                label={sensorsData[selectedSensor].status}
                size="small"
                color="success"
                sx={{ mt: 1 }}
              />
            </Box>

            {/* RUN Button */}
            <Button
              variant="contained"
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              sx={{
                width: '70%',
                height: 80,
                fontSize: '2rem',
                fontWeight: 700,
                backgroundColor: isAnalyzing ? '#FF9800' : analysisResult ? '#4CAF50' : '#D3D3D3',
                color: isAnalyzing || analysisResult ? '#FFFFFF' : '#000000',
                borderRadius: '40px',
                mb: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: isAnalyzing ? '#F57C00' : analysisResult ? '#388E3C' : '#BDBDBD',
                  transform: 'scale(1.02)',
                },
                '&:disabled': {
                  backgroundColor: '#FF9800',
                  color: '#FFFFFF',
                },
              }}
            >
              {isAnalyzing ? 'ANALYZING...' : analysisResult ? 'RE-RUN' : 'RUN ANALYSIS'}
            </Button>

            {/* Analysis Result Display */}
            {analysisResult && (
              <Box sx={{ 
                width: '80%', 
                mb: 3,
                p: 2,
                backgroundColor: analysisResult.healthScore >= 75 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                borderRadius: 2,
                border: `2px solid ${analysisResult.healthScore >= 75 ? '#4CAF50' : '#FF9800'}`,
              }}>
                <Typography variant="h6" sx={{ color: '#8BC34A', mb: 1, textAlign: 'center' }}>
                  Analysis Result
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#B0BEC5' }}>Health Score:</Typography>
                  <Typography variant="body1" sx={{ color: '#FFFFFF', fontWeight: 700 }}>
                    {analysisResult.healthScore}% ({analysisResult.status})
                  </Typography>
                </Box>
                {analysisResult.issues.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" sx={{ color: '#FF9800', display: 'block', mb: 0.5 }}>
                      Issues Detected:
                    </Typography>
                    {analysisResult.issues.map((issue, idx) => (
                      <Typography key={idx} variant="caption" sx={{ color: '#B0BEC5', display: 'block', fontSize: '0.7rem' }}>
                        • {issue}
                      </Typography>
                    ))}
                  </Box>
                )}
                <Typography variant="caption" sx={{ color: '#B0BEC5', display: 'block', mt: 1, textAlign: 'center' }}>
                  {analysisResult.timestamp}
                </Typography>
              </Box>
            )}

            {/* Sensor Parameter Display Grid */}
            <Grid container spacing={2} justifyContent="center">
              {Object.entries(sensorsData[selectedSensor].parameters).map(([paramName, paramData], index) => (
                <Grid item key={paramName}>
                  <Box
                    sx={{
                      width: 110,
                      height: 110,
                      borderRadius: '50%',
                      backgroundColor: paramData.value > paramData.max * 0.9 ? '#F44336' :
                                     paramData.value > paramData.max * 0.75 ? '#FF9800' : '#FFFFFF',
                      color: '#000000',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 1,
                      border: '3px solid #8BC34A',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 6px 16px rgba(139,195,74,0.4)',
                      },
                    }}
                  >
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontWeight: 700, 
                        fontSize: '0.65rem',
                        textAlign: 'center',
                        mb: 0.5,
                        lineHeight: 1.2,
                      }}
                    >
                      {paramName}
                    </Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700,
                        fontSize: '1rem',
                        lineHeight: 1,
                      }}
                    >
                      {typeof paramData.value === 'number' ? paramData.value.toFixed(1) : paramData.value}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontSize: '0.6rem',
                        fontWeight: 600,
                      }}
                    >
                      {paramData.unit}
                    </Typography>
                  </Box>
                </Grid>
              ))}
              
              {/* Gauge Parameters */}
              {Object.entries(sensorsData[selectedSensor].gauges).map(([gaugeName, gaugeData]) => (
                <Grid item key={gaugeName}>
                  <Box
                    sx={{
                      width: 110,
                      height: 110,
                      borderRadius: '50%',
                      backgroundColor: gaugeData.value > gaugeData.max * 0.8 ? '#FF9800' : '#E3F2FD',
                      color: '#000000',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 1,
                      border: '3px solid #2196F3',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 6px 16px rgba(33,150,243,0.4)',
                      },
                    }}
                  >
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontWeight: 700, 
                        fontSize: '0.65rem',
                        textAlign: 'center',
                        mb: 0.5,
                        lineHeight: 1.2,
                      }}
                    >
                      {gaugeName}
                    </Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700,
                        fontSize: '1rem',
                        lineHeight: 1,
                      }}
                    >
                      {typeof gaugeData.value === 'number' ? gaugeData.value.toFixed(1) : gaugeData.value}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontSize: '0.6rem',
                        fontWeight: 600,
                      }}
                    >
                      {gaugeData.unit}
                    </Typography>
                  </Box>
                </Grid>
              ))}
              
              {/* System Status Indicator */}
              <Grid item>
                <Box
                  sx={{
                    width: 110,
                    height: 110,
                    borderRadius: '50%',
                    backgroundColor: sensorsData[selectedSensor].status === 'Active' ? '#4CAF50' : '#F44336',
                    color: '#FFFFFF',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 1,
                    border: '3px solid #FFF',
                    transition: 'all 0.3s ease',
                    animation: sensorsData[selectedSensor].status === 'Active' ? 'pulse 2s infinite' : 'none',
                    '@keyframes pulse': {
                      '0%': {
                        boxShadow: '0 4px 12px rgba(76,175,80,0.4)',
                      },
                      '50%': {
                        boxShadow: '0 6px 20px rgba(76,175,80,0.8)',
                      },
                      '100%': {
                        boxShadow: '0 4px 12px rgba(76,175,80,0.4)',
                      },
                    },
                  }}
                >
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontWeight: 700, 
                      fontSize: '0.7rem',
                      textAlign: 'center',
                      mb: 0.5,
                    }}
                  >
                    SYSTEM
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      textAlign: 'center',
                    }}
                  >
                    {sensorsData[selectedSensor].status}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Right Panel - Sensor Parameters */}
        <Grid item xs={12} md={3}>
          <Paper
            sx={{
              p: 2,
              backgroundColor: '#1a1a1a',
              border: '2px solid #8BC34A',
              height: '100%',
            }}
          >
            {/* Gauge Parameter Selection */}
            <Typography
              variant="h6"
              sx={{ color: '#8BC34A', mb: 2, textAlign: 'center', fontWeight: 600 }}
            >
              Gauge Parameters
            </Typography>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel sx={{ color: '#8BC34A' }}>Select Gauge</InputLabel>
              <Select
                value={selectedGaugeParameter}
                onChange={(e) => setSelectedGaugeParameter(e.target.value)}
                label="Select Gauge"
                sx={{ 
                  color: '#FFFFFF',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#8BC34A',
                  },
                }}
              >
                {Object.keys(sensorsData[selectedSensor].gauges).map((gaugeKey) => (
                  <MenuItem key={gaugeKey} value={gaugeKey}>
                    {gaugeKey}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Display Selected Gauge Data */}
            <Box sx={{ 
              mb: 3, 
              p: 2, 
              backgroundColor: '#0a0a0a', 
              borderRadius: 2,
              border: '1px solid #8BC34A'
            }}>
              <Typography variant="body2" sx={{ color: '#8BC34A', mb: 1, fontWeight: 600 }}>
                {selectedGaugeParameter}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                <CircularGauge
                  value={sensorsData[selectedSensor].gauges[selectedGaugeParameter].value}
                  min={sensorsData[selectedSensor].gauges[selectedGaugeParameter].min}
                  max={sensorsData[selectedSensor].gauges[selectedGaugeParameter].max}
                  label={selectedGaugeParameter}
                  unit={sensorsData[selectedSensor].gauges[selectedGaugeParameter].unit}
                  width={100}
                  height={100}
                />
              </Box>
              <Typography variant="h5" sx={{ color: '#FFFFFF', textAlign: 'center', fontWeight: 700 }}>
                {sensorsData[selectedSensor].gauges[selectedGaugeParameter].value} {sensorsData[selectedSensor].gauges[selectedGaugeParameter].unit}
              </Typography>
            </Box>

            {/* Sensor Parameter Selection */}
            <Typography
              variant="h6"
              sx={{ color: '#8BC34A', mb: 2, textAlign: 'center', fontWeight: 600 }}
            >
              Sensor Parameters
            </Typography>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel sx={{ color: '#8BC34A' }}>Select Parameter</InputLabel>
              <Select
                value={selectedSensorParameter}
                onChange={(e) => setSelectedSensorParameter(e.target.value)}
                label="Select Parameter"
                sx={{ 
                  color: '#FFFFFF',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#8BC34A',
                  },
                }}
              >
                {Object.keys(sensorsData[selectedSensor].parameters).map((paramKey) => (
                  <MenuItem key={paramKey} value={paramKey}>
                    {paramKey}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Display Selected Parameter Data */}
            <Box sx={{ 
              p: 2, 
              backgroundColor: '#0a0a0a', 
              borderRadius: 2,
              border: '1px solid #8BC34A'
            }}>
              <Typography variant="body2" sx={{ color: '#8BC34A', mb: 1, fontWeight: 600 }}>
                {selectedSensorParameter}
              </Typography>
              <Typography variant="h4" sx={{ color: '#FFFFFF', mb: 1, fontWeight: 700 }}>
                {sensorsData[selectedSensor].parameters[selectedSensorParameter].value} {sensorsData[selectedSensor].parameters[selectedSensorParameter].unit}
              </Typography>
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#B0BEC5' }}>
                  Range: {sensorsData[selectedSensor].parameters[selectedSensorParameter].min} - {sensorsData[selectedSensor].parameters[selectedSensorParameter].max} {sensorsData[selectedSensor].parameters[selectedSensorParameter].unit}
                </Typography>
              </Box>
              <Chip
                label={sensorsData[selectedSensor].parameters[selectedSensorParameter].status}
                size="small"
                color="success"
                sx={{ mt: 1 }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Sensor Data Overview */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* All Parameters Table */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #2196F3' }}>
            <Typography variant="h6" sx={{ color: '#2196F3', mb: 2 }}>
              {selectedSensor} - All Parameters
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#2196F3', backgroundColor: '#0a0a0a' }}>Parameter</TableCell>
                    <TableCell sx={{ color: '#2196F3', backgroundColor: '#0a0a0a' }}>Value</TableCell>
                    <TableCell sx={{ color: '#2196F3', backgroundColor: '#0a0a0a' }}>Range</TableCell>
                    <TableCell sx={{ color: '#2196F3', backgroundColor: '#0a0a0a' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(sensorsData[selectedSensor].parameters).map(([paramName, paramData]) => (
                    <TableRow key={paramName} hover>
                      <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>{paramName}</TableCell>
                      <TableCell sx={{ color: '#8BC34A', fontWeight: 700, fontSize: '1rem' }}>
                        {paramData.value} {paramData.unit}
                      </TableCell>
                      <TableCell sx={{ color: '#B0BEC5', fontSize: '0.85rem' }}>
                        {paramData.min} - {paramData.max} {paramData.unit}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={paramData.status}
                          size="small"
                          color="success"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* All Gauges Display */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #FF9800' }}>
            <Typography variant="h6" sx={{ color: '#FF9800', mb: 2 }}>
              {selectedSensor} - All Gauges
            </Typography>
            <Grid container spacing={2} justifyContent="center">
              {Object.entries(sensorsData[selectedSensor].gauges).map(([gaugeName, gaugeData]) => (
                <Grid item xs={12} sm={4} key={gaugeName}>
                  <Box sx={{ 
                    p: 2, 
                    backgroundColor: '#0a0a0a', 
                    borderRadius: 2,
                    border: '1px solid #FF9800',
                    textAlign: 'center'
                  }}>
                    <Typography variant="body2" sx={{ color: '#FF9800', mb: 1, fontWeight: 600 }}>
                      {gaugeName}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                      <CircularGauge
                        value={gaugeData.value}
                        min={gaugeData.min}
                        max={gaugeData.max}
                        label={gaugeName}
                        unit={gaugeData.unit}
                        width={100}
                        height={100}
                      />
                    </Box>
                    <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 700 }}>
                      {gaugeData.value} {gaugeData.unit}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* AI Control Dashboard */}
      {aiControlEnabled && (
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* AI Decisions Log */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
              <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <SmartToy /> AI Decisions Log
              </Typography>
              <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                {aiDecisions.length === 0 ? (
                  <Typography variant="body2" sx={{ color: '#B0BEC5', textAlign: 'center', py: 3 }}>
                    No decisions made yet. AI is monitoring...
                  </Typography>
                ) : (
                  <List dense>
                    {aiDecisions.map((decision, index) => (
                      <React.Fragment key={index}>
                        <ListItem 
                          sx={{ 
                            backgroundColor: decision.severity === 'Critical' ? 'rgba(244, 67, 54, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                            borderRadius: 1,
                            mb: 1,
                            border: `1px solid ${decision.severity === 'Critical' ? '#F44336' : '#FF9800'}`,
                          }}
                        >
                          <Box sx={{ width: '100%' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 0.5 }}>
                              <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                                {decision.action}
                              </Typography>
                              <Chip
                                label={decision.severity}
                                size="small"
                                color={decision.severity === 'Critical' ? 'error' : 'warning'}
                                sx={{ ml: 1, fontSize: '0.65rem', height: 18 }}
                              />
                            </Box>
                            <Typography variant="caption" sx={{ color: '#B0BEC5', display: 'block' }}>
                              Sensor: {decision.sensor} • {decision.details}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                              <Typography variant="caption" sx={{ color: '#8BC34A' }}>
                                Confidence: {decision.confidence.toFixed(1)}%
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#B0BEC5' }}>
                                {decision.timestamp}
                              </Typography>
                            </Box>
                          </Box>
                        </ListItem>
                        {index < aiDecisions.length - 1 && <Divider sx={{ my: 0.5, backgroundColor: '#333' }} />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* AI Recommendations */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #2196F3' }}>
              <Typography variant="h6" sx={{ color: '#2196F3', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoAwesome /> AI Recommendations
              </Typography>
              <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                {aiRecommendations.length === 0 ? (
                  <Typography variant="body2" sx={{ color: '#B0BEC5', textAlign: 'center', py: 3 }}>
                    No recommendations at this time. All systems normal.
                  </Typography>
                ) : (
                  <List dense>
                    {aiRecommendations.map((recommendation, index) => {
                      const isCritical = recommendation.startsWith('CRITICAL');
                      const isWarning = recommendation.startsWith('WARNING');
                      const icon = isCritical ? <Warning sx={{ color: '#F44336', fontSize: 20 }} /> :
                                   isWarning ? <Warning sx={{ color: '#FF9800', fontSize: 20 }} /> :
                                   <CheckCircle sx={{ color: '#4CAF50', fontSize: 20 }} />;
                      
                      return (
                        <React.Fragment key={index}>
                          <ListItem sx={{ 
                            backgroundColor: isCritical ? 'rgba(244, 67, 54, 0.05)' : 
                                           isWarning ? 'rgba(255, 152, 0, 0.05)' : 'rgba(76, 175, 80, 0.05)',
                            borderRadius: 1,
                            mb: 1,
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, width: '100%' }}>
                              {icon}
                              <Typography variant="body2" sx={{ 
                                color: isCritical ? '#F44336' : isWarning ? '#FF9800' : '#4CAF50',
                                fontSize: '0.85rem',
                                flex: 1,
                              }}>
                                {recommendation}
                              </Typography>
                            </Box>
                          </ListItem>
                          {index < aiRecommendations.length - 1 && <Divider sx={{ my: 0.5, backgroundColor: '#333' }} />}
                        </React.Fragment>
                      );
                    })}
                  </List>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Additional Data Sections */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* RUL History Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2 }}>
              RUL Trend (30 Days)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={pdmData.rulHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="day" stroke="#8BC34A" />
                <YAxis stroke="#8BC34A" />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #8BC34A' }} />
                <Legend />
                <Line type="monotone" dataKey="rul" stroke="#8BC34A" name="RUL (days)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Component Health Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2 }}>
              Component Health Status
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pdmData.componentHealth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#8BC34A" />
                <YAxis stroke="#8BC34A" domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #8BC34A' }} />
                <Legend />
                <Bar dataKey="health" fill="#8BC34A" name="Health %" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Maintenance Schedule Table - Expanded */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2 }}>
              Detailed Maintenance Schedule
            </Typography>
            <TableContainer sx={{ maxHeight: 600, overflowY: 'auto' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#8BC34A', backgroundColor: '#0a0a0a', fontWeight: 'bold' }}>Component</TableCell>
                    <TableCell sx={{ color: '#8BC34A', backgroundColor: '#0a0a0a', fontWeight: 'bold' }}>Part Number</TableCell>
                    <TableCell sx={{ color: '#8BC34A', backgroundColor: '#0a0a0a', fontWeight: 'bold' }}>Type</TableCell>
                    <TableCell sx={{ color: '#8BC34A', backgroundColor: '#0a0a0a', fontWeight: 'bold' }}>Days Until</TableCell>
                    <TableCell sx={{ color: '#8BC34A', backgroundColor: '#0a0a0a', fontWeight: 'bold' }}>Operating Hours</TableCell>
                    <TableCell sx={{ color: '#8BC34A', backgroundColor: '#0a0a0a', fontWeight: 'bold' }}>Time to Overhaul</TableCell>
                    <TableCell sx={{ color: '#8BC34A', backgroundColor: '#0a0a0a', fontWeight: 'bold' }}>Time to Exchange</TableCell>
                    <TableCell sx={{ color: '#8BC34A', backgroundColor: '#0a0a0a', fontWeight: 'bold' }}>Last Maintenance</TableCell>
                    <TableCell sx={{ color: '#8BC34A', backgroundColor: '#0a0a0a', fontWeight: 'bold' }}>Est. Cost</TableCell>
                    <TableCell sx={{ color: '#8BC34A', backgroundColor: '#0a0a0a', fontWeight: 'bold' }}>Priority</TableCell>
                    <TableCell sx={{ color: '#8BC34A', backgroundColor: '#0a0a0a', fontWeight: 'bold' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pdmData.maintenanceSchedule.map((row, index) => (
                    <TableRow 
                      key={row.component} 
                      hover
                      sx={{
                        backgroundColor: row.status === 'Critical' ? 'rgba(244, 67, 54, 0.05)' : 
                                       row.status === 'Warning' ? 'rgba(255, 152, 0, 0.05)' : 'transparent'
                      }}
                    >
                      <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>{row.component}</TableCell>
                      <TableCell sx={{ color: '#2196F3', fontFamily: 'monospace', fontSize: '0.85rem' }}>{row.partNumber}</TableCell>
                      <TableCell sx={{ color: '#FF9800', fontSize: '0.85rem' }}>{row.maintenanceType}</TableCell>
                      <TableCell sx={{ 
                        color: row.daysUntil <= 10 ? '#F44336' : row.daysUntil <= 30 ? '#FF9800' : '#FFFFFF',
                        fontWeight: 'bold',
                        fontSize: '0.95rem'
                      }}>
                        {row.daysUntil} days
                      </TableCell>
                      <TableCell sx={{ color: '#B0BEC5', fontSize: '0.85rem' }}>
                        <Box>
                          <Typography variant="caption" sx={{ display: 'block', color: '#FFFFFF' }}>
                            {row.currentHours.toLocaleString()} / {row.maxHours.toLocaleString()} hrs
                          </Typography>
                          <Box sx={{ 
                            width: 80, 
                            height: 6, 
                            backgroundColor: '#333', 
                            borderRadius: 1,
                            mt: 0.5,
                            overflow: 'hidden'
                          }}>
                            <Box sx={{ 
                              width: `${(row.currentHours / row.maxHours) * 100}%`, 
                              height: '100%',
                              backgroundColor: (row.currentHours / row.maxHours) > 0.9 ? '#F44336' : 
                                             (row.currentHours / row.maxHours) > 0.75 ? '#FF9800' : '#8BC34A'
                            }} />
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#8BC34A', fontWeight: 600, fontSize: '0.85rem' }}>
                        {row.timeToOverhaul}
                      </TableCell>
                      <TableCell sx={{ 
                        color: row.timeToExchange.includes('Critical') ? '#F44336' : '#00BCD4',
                        fontWeight: 600,
                        fontSize: '0.85rem'
                      }}>
                        {row.timeToExchange}
                      </TableCell>
                      <TableCell sx={{ color: '#B0BEC5', fontSize: '0.8rem' }}>{row.lastMaintenance}</TableCell>
                      <TableCell sx={{ color: '#4CAF50', fontWeight: 600, fontSize: '0.9rem' }}>{row.estimatedCost}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.priority}
                          size="small"
                          color={
                            row.priority === 'High' ? 'error' :
                            row.priority === 'Medium' ? 'warning' : 'default'
                          }
                          sx={{ fontSize: '0.7rem' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.status}
                          size="small"
                          color={
                            row.status === 'Critical' ? 'error' :
                            row.status === 'Warning' ? 'warning' : 'success'
                          }
                          sx={{ fontSize: '0.7rem' }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Failure Probability Table */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2 }}>
              Failure Probability Analysis
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#8BC34A' }}>Component</TableCell>
                    <TableCell sx={{ color: '#8BC34A' }}>Probability</TableCell>
                    <TableCell sx={{ color: '#8BC34A' }}>Risk Level</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pdmData.failureProbability.map((row) => (
                    <TableRow key={row.component}>
                      <TableCell sx={{ color: '#FFFFFF' }}>{row.component}</TableCell>
                      <TableCell sx={{ color: '#FFFFFF' }}>{row.probability}%</TableCell>
                      <TableCell>
                        <Chip
                          label={row.risk}
                          size="small"
                          color={
                            row.risk === 'High' ? 'error' :
                            row.risk === 'Medium' ? 'warning' : 'default'
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Detailed Maintenance Information Cards */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #FF9800' }}>
            <Typography variant="h6" sx={{ color: '#FF9800', mb: 2 }}>
              Maintenance Details & Recommendations
            </Typography>
            <Grid container spacing={2}>
              {pdmData.maintenanceSchedule.slice(0, 6).map((item, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      backgroundColor: '#0a0a0a',
                      border: `2px solid ${
                        item.status === 'Critical' ? '#F44336' : 
                        item.status === 'Warning' ? '#FF9800' : '#8BC34A'
                      }`,
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: `0 4px 20px ${
                          item.status === 'Critical' ? 'rgba(244, 67, 54, 0.4)' : 
                          item.status === 'Warning' ? 'rgba(255, 152, 0, 0.4)' : 'rgba(139, 195, 74, 0.4)'
                        }`,
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                        {item.component}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Chip
                          label={item.status}
                          size="small"
                          color={
                            item.status === 'Critical' ? 'error' :
                            item.status === 'Warning' ? 'warning' : 'success'
                          }
                          sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                        <Chip
                          label={item.priority}
                          size="small"
                          color={
                            item.priority === 'High' ? 'error' :
                            item.priority === 'Medium' ? 'warning' : 'default'
                          }
                          sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                      </Box>
                    </Box>

                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" sx={{ color: '#B0BEC5' }}>Part Number: </Typography>
                      <Typography variant="body2" sx={{ color: '#2196F3', fontFamily: 'monospace', display: 'inline' }}>
                        {item.partNumber}
                      </Typography>
                    </Box>

                    <Grid container spacing={1} sx={{ mb: 1 }}>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#B0BEC5', display: 'block' }}>
                          Maintenance Type
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#FF9800', fontWeight: 600 }}>
                          {item.maintenanceType}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#B0BEC5', display: 'block' }}>
                          Days Until
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: item.daysUntil <= 10 ? '#F44336' : item.daysUntil <= 30 ? '#FF9800' : '#8BC34A',
                          fontWeight: 'bold',
                          fontSize: '1.1rem'
                        }}>
                          {item.daysUntil} days
                        </Typography>
                      </Grid>
                    </Grid>

                    <Grid container spacing={1} sx={{ mb: 1 }}>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#B0BEC5', display: 'block' }}>
                          Time to Overhaul
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#8BC34A', fontWeight: 600 }}>
                          {item.timeToOverhaul}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#B0BEC5', display: 'block' }}>
                          Time to Exchange
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: item.timeToExchange.includes('Critical') ? '#F44336' : '#00BCD4',
                          fontWeight: 600
                        }}>
                          {item.timeToExchange}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" sx={{ color: '#B0BEC5', display: 'block' }}>
                        Operating Hours
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                          {item.currentHours.toLocaleString()} / {item.maxHours.toLocaleString()} hrs
                        </Typography>
                        <Typography variant="caption" sx={{ 
                          color: (item.currentHours / item.maxHours) > 0.9 ? '#F44336' : 
                                 (item.currentHours / item.maxHours) > 0.75 ? '#FF9800' : '#8BC34A'
                        }}>
                          ({((item.currentHours / item.maxHours) * 100).toFixed(1)}%)
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        width: '100%', 
                        height: 8, 
                        backgroundColor: '#333', 
                        borderRadius: 1,
                        mt: 0.5,
                        overflow: 'hidden'
                      }}>
                        <Box sx={{ 
                          width: `${(item.currentHours / item.maxHours) * 100}%`, 
                          height: '100%',
                          backgroundColor: (item.currentHours / item.maxHours) > 0.9 ? '#F44336' : 
                                         (item.currentHours / item.maxHours) > 0.75 ? '#FF9800' : '#8BC34A',
                          transition: 'width 0.5s ease'
                        }} />
                      </Box>
                    </Box>

                    <Grid container spacing={1} sx={{ mb: 1 }}>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#B0BEC5', display: 'block' }}>
                          Last Maintenance
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                          {item.lastMaintenance}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#B0BEC5', display: 'block' }}>
                          Estimated Cost
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 'bold', fontSize: '1rem' }}>
                          {item.estimatedCost}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Box sx={{ 
                      mt: 2, 
                      pt: 2, 
                      borderTop: '1px solid #333',
                      backgroundColor: 'rgba(139, 195, 74, 0.05)',
                      p: 1,
                      borderRadius: 1
                    }}>
                      <Typography variant="caption" sx={{ color: '#8BC34A', display: 'block', fontWeight: 'bold', mb: 0.5 }}>
                        Details & Recommendations:
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#B0BEC5', fontSize: '0.85rem', lineHeight: 1.4 }}>
                        {item.details}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PDMPage;

