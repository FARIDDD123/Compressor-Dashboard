/**
 * Real-Time Optimization Page
 * Optimization settings and intensity graph
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  Divider,
  LinearProgress,
  Alert,
} from '@mui/material';
import { 
  SmartToy, 
  PlayArrow, 
  Pause, 
  CheckCircle, 
  Warning, 
  Info,
  AutoAwesome,
  TrendingUp,
  LocalGasStation,
  Nature,
  Bolt,
  Whatshot,
  Speed,
  Settings,
  Analytics,
  Timeline
} from '@mui/icons-material';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

const RealTimeOptimizationPage = () => {
  const [settings, setSettings] = useState({
    standardFunctions: 'Rosenbrock',
    algorithms: 'BFGS',
    optimizationMethod: 'Quasi-newton',
    gradientMethod: 'Polak-Ribiere',
    lineMinimization: 'With Derivatives',
    functionTolerance: '1E-03',
    parameterTolerance: '1E-10',
    gradientTolerance: '1',
    maximumIterations: '10000',
    maximumFunctionCalls: '10000',
    maximumTime: '1',
  });

  const [currentMetrics, setCurrentMetrics] = useState({
    efficiency: 87.5,
    fuelConsumption: 305.2,
    emissions: 395.8,
    powerOutput: 125.3,
    temperature: 845.2,
    pressure: 12.8,
  });

  const [optimizationStatus, setOptimizationStatus] = useState({
    status: 'Running',
    currentIteration: 42,
    bestEfficiency: 88.7,
    convergenceRate: 0.95,
    elapsedTime: '2m 34s',
  });

  // AI Control System State
  const [aiEnabled, setAiEnabled] = useState(true);
  const [aiStatus, setAiStatus] = useState({
    status: 'Active',
    confidence: 94.5,
    decisionsCount: 127,
    lastDecision: new Date().toLocaleTimeString(),
    mode: 'Auto-Optimization',
  });
  const [aiCommands, setAiCommands] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState({
    currentAction: 'Analyzing performance metrics...',
    recommendation: 'Optimize fuel flow rate to reduce consumption',
    impact: 'Expected efficiency improvement: +2.3%',
    riskLevel: 'Low',
  });

  // Generate more realistic intensity graph data
  const [intensityData, setIntensityData] = useState([]);
  useEffect(() => {
    const generateIntensityData = () => {
      return Array.from({ length: 800 }, (_, i) => {
        const angle = (i / 800) * Math.PI * 6;
        const radius = 30 + Math.sin(angle * 2) * 15;
        return {
          x: 65 + Math.cos(angle) * radius + (Math.random() - 0.5) * 8,
          y: 65 + Math.sin(angle) * radius + (Math.random() - 0.5) * 8,
          z: 800 + Math.sin(angle * 3) * 400 + Math.random() * 300,
        };
      });
    };
    setIntensityData(generateIntensityData());
  }, []);

  // Extended optimization history data
  const optimizationHistory = Array.from({ length: 50 }, (_, i) => ({
    iteration: i + 1,
    efficiency: 82 + Math.sin(i * 0.15) * 4 + (i * 0.12) + Math.random() * 1.5,
    fuelConsumption: 340 - Math.sin(i * 0.15) * 15 - (i * 0.8) + Math.random() * 4,
    emissions: 450 - Math.sin(i * 0.15) * 25 - (i * 1.2) + Math.random() * 8,
    powerOutput: 110 + Math.sin(i * 0.2) * 8 + (i * 0.3) + Math.random() * 2,
  }));

  // Real-time performance metrics over time
  const performanceData = Array.from({ length: 30 }, (_, i) => {
    const time = new Date(Date.now() - (29 - i) * 60000);
    return {
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      efficiency: 85 + Math.sin(i * 0.3) * 3 + Math.random() * 2,
      fuelConsumption: 315 + Math.sin(i * 0.25) * 12 + Math.random() * 3,
    };
  });

  // Optimization results table data
  const optimizationResults = [
    { parameter: 'Compressor Pressure Ratio', current: 12.8, optimal: 13.2, improvement: '+3.1%', status: 'Optimized' },
    { parameter: 'Turbine Inlet Temperature', current: 845.2, optimal: 852.5, improvement: '+0.9%', status: 'Optimized' },
    { parameter: 'Fuel Flow Rate', current: 305.2, optimal: 298.5, improvement: '-2.2%', status: 'Optimized' },
    { parameter: 'Air Flow Rate', current: 1250.5, optimal: 1280.2, improvement: '+2.4%', status: 'In Progress' },
    { parameter: 'Exhaust Gas Temperature', current: 485.3, optimal: 478.5, improvement: '-1.4%', status: 'Optimized' },
    { parameter: 'Rotor Speed', current: 3600, optimal: 3625, improvement: '+0.7%', status: 'Optimized' },
    { parameter: 'Cooling Flow Rate', current: 45.2, optimal: 47.8, improvement: '+5.8%', status: 'Pending' },
    { parameter: 'Bypass Ratio', current: 0.85, optimal: 0.88, improvement: '+3.5%', status: 'In Progress' },
  ];

  // AI Decision Making Logic
  const generateAIDecision = () => {
    const actions = [
      {
        type: 'optimize',
        parameter: 'Fuel Flow Rate',
        action: 'Reduce fuel flow by 2.5%',
        reason: 'Current consumption above optimal threshold',
        impact: '+1.8% efficiency',
        timestamp: new Date().toLocaleTimeString(),
      },
      {
        type: 'adjust',
        parameter: 'Compressor Pressure',
        action: 'Increase pressure ratio to 13.1',
        reason: 'Optimal pressure range detected',
        impact: '+0.9% efficiency',
        timestamp: new Date().toLocaleTimeString(),
      },
      {
        type: 'monitor',
        parameter: 'Temperature',
        action: 'Maintain current temperature',
        reason: 'Temperature within optimal range',
        impact: 'Stable operation',
        timestamp: new Date().toLocaleTimeString(),
      },
      {
        type: 'optimize',
        parameter: 'Air Flow Rate',
        action: 'Increase air flow by 1.8%',
        reason: 'Improve combustion efficiency',
        impact: '+1.2% efficiency, -3% emissions',
        timestamp: new Date().toLocaleTimeString(),
      },
      {
        type: 'adjust',
        parameter: 'Rotor Speed',
        action: 'Optimize speed to 3620 RPM',
        reason: 'Peak efficiency point identified',
        impact: '+0.7% efficiency',
        timestamp: new Date().toLocaleTimeString(),
      },
    ];

    return actions[Math.floor(Math.random() * actions.length)];
  };

  // Update metrics in real-time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMetrics((prev) => ({
        efficiency: Math.max(80, Math.min(95, prev.efficiency + (Math.random() - 0.5) * 0.5)),
        fuelConsumption: Math.max(280, Math.min(350, prev.fuelConsumption + (Math.random() - 0.5) * 2)),
        emissions: Math.max(350, Math.min(450, prev.emissions + (Math.random() - 0.5) * 3)),
        powerOutput: Math.max(100, Math.min(140, prev.powerOutput + (Math.random() - 0.5) * 0.5)),
        temperature: Math.max(800, Math.min(900, prev.temperature + (Math.random() - 0.5) * 2)),
        pressure: Math.max(11, Math.min(15, prev.pressure + (Math.random() - 0.5) * 0.1)),
      }));

      setOptimizationStatus((prev) => ({
        ...prev,
        currentIteration: prev.currentIteration + 1,
        bestEfficiency: Math.max(prev.bestEfficiency, 85 + Math.random() * 4),
        convergenceRate: Math.min(0.99, prev.convergenceRate + (Math.random() - 0.5) * 0.01),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // AI Auto-Control System
  useEffect(() => {
    if (!aiEnabled) return;

    const aiInterval = setInterval(() => {
      // Generate AI decision
      const decision = generateAIDecision();
      
      // Add command to log (keep last 10)
      setAiCommands((prev) => {
        const newCommands = [decision, ...prev];
        return newCommands.slice(0, 10);
      });

      // Update AI status
      setAiStatus((prev) => ({
        ...prev,
        decisionsCount: prev.decisionsCount + 1,
        lastDecision: new Date().toLocaleTimeString(),
        confidence: Math.max(85, Math.min(99, prev.confidence + (Math.random() - 0.5) * 2)),
      }));

      // Update AI analysis
      const analyses = [
        {
          currentAction: `Optimizing ${decision.parameter}...`,
          recommendation: decision.action,
          impact: decision.impact,
          riskLevel: decision.type === 'monitor' ? 'None' : 'Low',
        },
        {
          currentAction: 'Analyzing performance trends...',
          recommendation: 'Maintain current optimization parameters',
          impact: 'Stable performance expected',
          riskLevel: 'None',
        },
        {
          currentAction: 'Evaluating efficiency metrics...',
          recommendation: 'Fine-tuning operational parameters',
          impact: 'Gradual improvement in efficiency',
          riskLevel: 'Low',
        },
      ];
      setAiAnalysis(analyses[Math.floor(Math.random() * analyses.length)]);

      // Apply AI decision to metrics (simulated)
      if (decision.type === 'optimize' || decision.type === 'adjust') {
        setCurrentMetrics((prev) => {
          let updated = { ...prev };
          if (decision.parameter.includes('Fuel')) {
            updated.fuelConsumption = Math.max(280, prev.fuelConsumption - (Math.random() * 3));
            updated.efficiency = Math.min(95, prev.efficiency + (Math.random() * 0.5));
          } else if (decision.parameter.includes('Pressure')) {
            updated.pressure = Math.min(15, prev.pressure + (Math.random() * 0.2));
            updated.efficiency = Math.min(95, prev.efficiency + (Math.random() * 0.3));
          } else if (decision.parameter.includes('Air')) {
            updated.emissions = Math.max(350, prev.emissions - (Math.random() * 5));
            updated.efficiency = Math.min(95, prev.efficiency + (Math.random() * 0.4));
          } else if (decision.parameter.includes('Temperature')) {
            updated.temperature = Math.max(800, Math.min(900, prev.temperature + (Math.random() - 0.5) * 2));
          }
          return updated;
        });
      }
    }, 5000); // AI makes decisions every 5 seconds

    return () => clearInterval(aiInterval);
  }, [aiEnabled]);

  const handleSettingChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleRun = () => {
    console.log('Running optimization with settings:', settings);
    // TODO: Implement optimization logic
  };

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100%', 
      p: 3,
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)',
      minHeight: '100vh'
    }}>
      {/* Current Metrics Cards - Enhanced Design */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
            color: '#FFFFFF',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(46, 125, 50, 0.3)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 12px 40px rgba(46, 125, 50, 0.5)',
            }
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <TrendingUp sx={{ fontSize: 28, opacity: 0.9 }} />
                <Chip 
                  label="+2.3%" 
                  size="small" 
            sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: '#FFFFFF',
                    fontSize: '0.7rem',
                    height: 20
                  }} 
                />
              </Box>
              <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                Efficiency
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', letterSpacing: 0.5 }}>
                {currentMetrics.efficiency.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)',
            color: '#FFFFFF',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 12px 40px rgba(25, 118, 210, 0.5)',
            }
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <LocalGasStation sx={{ fontSize: 28, opacity: 0.9 }} />
                <Chip 
                  label="-1.8%" 
                  size="small" 
                  sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: '#FFFFFF',
                    fontSize: '0.7rem',
                    height: 20
                  }} 
                />
              </Box>
              <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                Fuel Consumption
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', letterSpacing: 0.5 }}>
                {currentMetrics.fuelConsumption.toFixed(1)}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.7rem' }}>L/h</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #F57C00 0%, #E65100 100%)',
            color: '#FFFFFF',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(245, 124, 0, 0.3)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 12px 40px rgba(245, 124, 0, 0.5)',
            }
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Nature sx={{ fontSize: 28, opacity: 0.9 }} />
                <Chip 
                  label="-2.5%" 
                  size="small" 
                  sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: '#FFFFFF',
                    fontSize: '0.7rem',
                    height: 20
                  }} 
                />
              </Box>
              <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                Emissions
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', letterSpacing: 0.5 }}>
                {currentMetrics.emissions.toFixed(1)}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.7rem' }}>ppm</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #7B1FA2 0%, #4A148C 100%)',
            color: '#FFFFFF',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(123, 31, 162, 0.3)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 12px 40px rgba(123, 31, 162, 0.5)',
            }
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Bolt sx={{ fontSize: 28, opacity: 0.9 }} />
                <Chip 
                  label="+1.2%" 
                  size="small" 
                  sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: '#FFFFFF',
                    fontSize: '0.7rem',
                    height: 20
                  }} 
                />
              </Box>
              <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                Power Output
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', letterSpacing: 0.5 }}>
                {currentMetrics.powerOutput.toFixed(1)}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.7rem' }}>MW</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #C62828 0%, #B71C1C 100%)',
            color: '#FFFFFF',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(198, 40, 40, 0.3)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 12px 40px rgba(198, 40, 40, 0.5)',
            }
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Whatshot sx={{ fontSize: 28, opacity: 0.9 }} />
                <Chip 
                  label="Stable" 
                  size="small" 
                  sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: '#FFFFFF',
                    fontSize: '0.7rem',
                    height: 20
                  }} 
                />
              </Box>
              <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                Temperature
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', letterSpacing: 0.5 }}>
                {currentMetrics.temperature.toFixed(1)}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.7rem' }}>°C</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #00897B 0%, #004D40 100%)',
            color: '#FFFFFF',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 137, 123, 0.3)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 12px 40px rgba(0, 137, 123, 0.5)',
            }
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Speed sx={{ fontSize: 28, opacity: 0.9 }} />
                <Chip 
                  label="+0.8%" 
                  size="small" 
                  sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: '#FFFFFF',
                    fontSize: '0.7rem',
                    height: 20
                  }} 
                />
              </Box>
              <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                Pressure
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', letterSpacing: 0.5 }}>
                {currentMetrics.pressure.toFixed(1)}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.7rem' }}>bar</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Optimization Status - Enhanced */}
      <Paper sx={{ 
        p: 3, 
        mb: 4, 
        background: 'linear-gradient(135deg, rgba(139, 195, 74, 0.1) 0%, rgba(139, 195, 74, 0.05) 100%)',
        border: '2px solid rgba(139, 195, 74, 0.3)',
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(139, 195, 74, 0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Analytics sx={{ color: '#8BC34A', fontSize: 28 }} />
          <Typography variant="h6" sx={{ color: '#8BC34A', fontWeight: 'bold' }}>
            Optimization Status
          </Typography>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ 
              p: 2, 
              backgroundColor: 'rgba(139, 195, 74, 0.1)',
              borderRadius: 2,
              border: '1px solid rgba(139, 195, 74, 0.2)'
            }}>
              <Typography variant="caption" sx={{ color: '#8BC34A', fontWeight: 600, display: 'block', mb: 1 }}>
                Status
              </Typography>
              <Chip 
                label={optimizationStatus.status} 
                color="success" 
                icon={<CheckCircle />}
                sx={{ 
                  fontWeight: 'bold',
                  boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ 
              p: 2, 
              backgroundColor: 'rgba(139, 195, 74, 0.1)',
              borderRadius: 2,
              border: '1px solid rgba(139, 195, 74, 0.2)'
            }}>
              <Typography variant="caption" sx={{ color: '#8BC34A', fontWeight: 600, display: 'block', mb: 1 }}>
                Iteration
              </Typography>
              <Typography variant="h5" sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                {optimizationStatus.currentIteration}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ 
              p: 2, 
              backgroundColor: 'rgba(139, 195, 74, 0.1)',
              borderRadius: 2,
              border: '1px solid rgba(139, 195, 74, 0.2)'
            }}>
              <Typography variant="caption" sx={{ color: '#8BC34A', fontWeight: 600, display: 'block', mb: 1 }}>
                Best Efficiency
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <Typography variant="h5" sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                  {optimizationStatus.bestEfficiency.toFixed(2)}%
                </Typography>
                <TrendingUp sx={{ color: '#4CAF50', fontSize: 20 }} />
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ 
              p: 2, 
              backgroundColor: 'rgba(139, 195, 74, 0.1)',
              borderRadius: 2,
              border: '1px solid rgba(139, 195, 74, 0.2)'
            }}>
              <Typography variant="caption" sx={{ color: '#8BC34A', fontWeight: 600, display: 'block', mb: 1 }}>
                Convergence Rate
              </Typography>
              <Box>
                <Typography variant="h5" sx={{ color: '#FFFFFF', fontWeight: 'bold', mb: 0.5 }}>
                  {(optimizationStatus.convergenceRate * 100).toFixed(1)}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={optimizationStatus.convergenceRate * 100}
                  sx={{ 
                    height: 6, 
                    borderRadius: 3,
                    backgroundColor: 'rgba(139, 195, 74, 0.2)',
                    '& .MuiLinearProgress-bar': { 
                      backgroundColor: '#8BC34A',
                      borderRadius: 3
                    }
                  }} 
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* AI Auto-Control System - Enhanced */}
      <Paper sx={{ 
        p: 4, 
        mb: 4, 
        background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.95) 100%)',
        border: '2px solid rgba(139, 195, 74, 0.4)',
        borderRadius: 4,
        boxShadow: '0 8px 32px rgba(139, 195, 74, 0.2)',
        backdropFilter: 'blur(10px)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <SmartToy sx={{ fontSize: 40, color: '#8BC34A' }} />
            <Box>
              <Typography variant="h5" sx={{ color: '#8BC34A', fontWeight: 'bold' }}>
                AI Auto-Control System
              </Typography>
              <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                Intelligent optimization and real-time parameter adjustment
              </Typography>
            </Box>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={aiEnabled}
                onChange={(e) => setAiEnabled(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: '#8BC34A' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#8BC34A' }
                }}
              />
            }
            label={
              <Typography sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                {aiEnabled ? 'Active' : 'Inactive'}
              </Typography>
            }
          />
        </Box>

        {aiEnabled && (
          <>
            {/* AI Status Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: '#2a2a2a', border: '1px solid #8BC34A' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <AutoAwesome sx={{ color: '#8BC34A', fontSize: 20 }} />
                      <Typography variant="caption" sx={{ color: '#8BC34A' }}>AI Status</Typography>
                    </Box>
                    <Chip 
                      label={aiStatus.status} 
                      color="success" 
                      size="small"
                      icon={<CheckCircle />}
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: '#2a2a2a', border: '1px solid #8BC34A' }}>
                  <CardContent>
                    <Typography variant="caption" sx={{ color: '#8BC34A' }}>Confidence Level</Typography>
                    <Typography variant="h6" sx={{ color: '#FFFFFF' }}>
                      {aiStatus.confidence.toFixed(1)}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={aiStatus.confidence} 
                      sx={{ 
                        mt: 1, 
                        height: 6, 
                        borderRadius: 3,
                        backgroundColor: '#1a1a1a',
                        '& .MuiLinearProgress-bar': { backgroundColor: '#8BC34A' }
                      }} 
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: '#2a2a2a', border: '1px solid #8BC34A' }}>
                  <CardContent>
                    <Typography variant="caption" sx={{ color: '#8BC34A' }}>Decisions Made</Typography>
                    <Typography variant="h6" sx={{ color: '#FFFFFF' }}>
                      {aiStatus.decisionsCount}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666666', display: 'block', mt: 0.5 }}>
                      Last: {aiStatus.lastDecision}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: '#2a2a2a', border: '1px solid #8BC34A' }}>
                  <CardContent>
                    <Typography variant="caption" sx={{ color: '#8BC34A' }}>Mode</Typography>
                    <Typography variant="h6" sx={{ color: '#FFFFFF' }}>
                      {aiStatus.mode}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666666', display: 'block', mt: 0.5 }}>
                      Auto-Optimization
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* AI Analysis & Recommendations */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, backgroundColor: '#2a2a2a', border: '1px solid #8BC34A' }}>
                  <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Info sx={{ fontSize: 20 }} />
                    Current AI Analysis
                  </Typography>
                  <Alert 
                    severity="info" 
                    icon={<AutoAwesome />}
                    sx={{ 
                      mb: 2, 
                      backgroundColor: '#1a3a1a',
                      color: '#8BC34A',
                      '& .MuiAlert-icon': { color: '#8BC34A' }
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                      {aiAnalysis.currentAction}
                    </Typography>
                  </Alert>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ color: '#8BC34A', display: 'block', mb: 0.5 }}>
                      Recommendation:
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                      {aiAnalysis.recommendation}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ color: '#8BC34A', display: 'block', mb: 0.5 }}>
                      Expected Impact:
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#4CAF50' }}>
                      {aiAnalysis.impact}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#8BC34A', display: 'block', mb: 0.5 }}>
                      Risk Level:
                    </Typography>
                    <Chip 
                      label={aiAnalysis.riskLevel} 
                      size="small"
                      color={aiAnalysis.riskLevel === 'None' ? 'success' : 'warning'}
                    />
                  </Box>
                </Paper>
              </Grid>

              {/* AI Command Log */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, backgroundColor: '#2a2a2a', border: '1px solid #8BC34A', maxHeight: 400, overflow: 'auto' }}>
                  <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PlayArrow sx={{ fontSize: 20 }} />
                    AI Command Log
                  </Typography>
                  <List sx={{ p: 0 }}>
                    {aiCommands.length === 0 ? (
                      <ListItem>
                        <ListItemText 
                          primary="No commands yet"
                          secondary="AI will start making decisions when active"
                          sx={{ color: '#666666' }}
                        />
                      </ListItem>
                    ) : (
                      aiCommands.map((cmd, index) => (
                        <React.Fragment key={index}>
                          <ListItem 
                sx={{
                              backgroundColor: index === 0 ? 'rgba(139, 195, 74, 0.1)' : 'transparent',
                              borderRadius: 1,
                              mb: 1
                            }}
                          >
                            <Box sx={{ width: '100%' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                {cmd.type === 'optimize' && <CheckCircle sx={{ color: '#4CAF50', fontSize: 16 }} />}
                                {cmd.type === 'adjust' && <Warning sx={{ color: '#FF9800', fontSize: 16 }} />}
                                {cmd.type === 'monitor' && <Info sx={{ color: '#2196F3', fontSize: 16 }} />}
                                <Typography variant="body2" sx={{ color: '#8BC34A', fontWeight: 'bold' }}>
                                  {cmd.parameter}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#666666', ml: 'auto' }}>
                                  {cmd.timestamp}
                                </Typography>
                              </Box>
                              <Typography variant="body2" sx={{ color: '#FFFFFF', mb: 0.5 }}>
                                {cmd.action}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#666666', display: 'block', mb: 0.5 }}>
                                Reason: {cmd.reason}
                              </Typography>
                              <Chip 
                                label={cmd.impact} 
                                size="small" 
                                sx={{ 
                                  backgroundColor: '#4CAF50',
                                  color: '#FFFFFF',
                                  fontSize: '0.7rem',
                                  height: 20
                                }}
                              />
                            </Box>
                          </ListItem>
                          {index < aiCommands.length - 1 && <Divider sx={{ borderColor: '#333' }} />}
                        </React.Fragment>
                      ))
                    )}
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </>
        )}

        {!aiEnabled && (
          <Alert 
            severity="warning" 
                sx={{
              backgroundColor: '#3a2a1a',
              color: '#FF9800',
              '& .MuiAlert-icon': { color: '#FF9800' }
            }}
          >
            AI Auto-Control System is currently inactive. Enable to start automatic optimization.
          </Alert>
        )}
      </Paper>

      <Grid container spacing={3}>
        {/* Left Panel - Settings - Enhanced */}
        <Grid item xs={12} md={5}>
          <Paper
            sx={{
              p: 4,
              background: 'linear-gradient(135deg, rgba(200, 230, 201, 0.15) 0%, rgba(232, 245, 233, 0.1) 100%)',
              border: '2px solid rgba(139, 195, 74, 0.4)',
              borderRadius: 4,
              height: '100%',
              boxShadow: '0 8px 32px rgba(139, 195, 74, 0.15)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Settings sx={{ color: '#8BC34A', fontSize: 28 }} />
              <Typography variant="h6" sx={{ color: '#8BC34A', fontWeight: 'bold' }}>
                Optimization Settings
              </Typography>
            </Box>
            {/* Standard Functions - Display Only - Enhanced */}
            <Paper sx={{ 
              p: 2.5, 
              mb: 3, 
              background: 'linear-gradient(135deg, rgba(139, 195, 74, 0.1) 0%, rgba(139, 195, 74, 0.05) 100%)',
              border: '1px solid rgba(139, 195, 74, 0.3)',
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(139, 195, 74, 0.1)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Timeline sx={{ color: '#8BC34A', fontSize: 20 }} />
              <Typography
                variant="subtitle2"
                  sx={{ color: '#8BC34A', fontWeight: 700, fontSize: '0.95rem' }}
                >
                  Standard Functions
                </Typography>
              </Box>
              <Box sx={{ 
                p: 2, 
                background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%)', 
                borderRadius: 2,
                border: '1px solid rgba(139, 195, 74, 0.2)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <Typography variant="body1" sx={{ color: '#1a1a1a', fontWeight: 600, mb: 0.5 }}>
                  {settings.standardFunctions || 'Rosenbrock Function'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#666666', display: 'block' }}>
                  Active optimization function
                </Typography>
              </Box>
            </Paper>

            {/* Algorithms - Display Only - Enhanced */}
            <Paper sx={{ 
              p: 2.5, 
              mb: 3, 
              background: 'linear-gradient(135deg, rgba(139, 195, 74, 0.1) 0%, rgba(139, 195, 74, 0.05) 100%)',
              border: '1px solid rgba(139, 195, 74, 0.3)',
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(139, 195, 74, 0.1)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <AutoAwesome sx={{ color: '#8BC34A', fontSize: 20 }} />
                <Typography
                  variant="subtitle2"
                  sx={{ color: '#8BC34A', fontWeight: 700, fontSize: '0.95rem' }}
                >
                  Algorithms
                </Typography>
              </Box>
              <Box sx={{ 
                p: 2, 
                background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%)', 
                borderRadius: 2,
                border: '1px solid rgba(139, 195, 74, 0.2)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <Typography variant="body1" sx={{ color: '#1a1a1a', fontWeight: 600, mb: 0.5 }}>
                  {settings.algorithms === 'BFGS' ? 'BFGS (Broyden-Fletcher-Goldfarb-Shanno)' :
                   settings.algorithms === 'L-BFGS' ? 'L-BFGS (Limited Memory BFGS)' :
                   settings.algorithms === 'ConjugateGradient' ? 'Conjugate Gradient' :
                   settings.algorithms === 'NelderMead' ? 'Nelder-Mead Simplex' :
                   settings.algorithms === 'ParticleSwarm' ? 'Particle Swarm Optimization' :
                   settings.algorithms === 'GeneticAlgorithm' ? 'Genetic Algorithm' :
                   'BFGS (Broyden-Fletcher-Goldfarb-Shanno)'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#666666', display: 'block' }}>
                  Current optimization algorithm
                </Typography>
              </Box>
            </Paper>

            {/* Stopping Criteria - Display Only - Enhanced */}
            <Paper sx={{ 
              p: 2.5, 
              mb: 3, 
              background: 'linear-gradient(135deg, rgba(139, 195, 74, 0.1) 0%, rgba(139, 195, 74, 0.05) 100%)',
              border: '1px solid rgba(139, 195, 74, 0.3)',
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(139, 195, 74, 0.1)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Settings sx={{ color: '#8BC34A', fontSize: 20 }} />
                <Typography
                  variant="subtitle2"
                  sx={{ color: '#8BC34A', fontWeight: 700, fontSize: '0.95rem' }}
              >
                Stopping Criteria
              </Typography>
              </Box>
              <Grid container spacing={1.5}>
                <Grid item xs={12}>
                  <Box sx={{ 
                    p: 2, 
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%)', 
                    borderRadius: 2,
                    border: '1px solid rgba(139, 195, 74, 0.2)',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: 'rgba(139, 195, 74, 0.4)',
                      boxShadow: '0 2px 8px rgba(139, 195, 74, 0.1)'
                    }
                  }}>
                    <Typography variant="caption" sx={{ color: '#666666', display: 'block', mb: 0.5, fontSize: '0.75rem' }}>
                      function tolerance
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#1a1a1a', fontWeight: 600 }}>
                      {settings.functionTolerance}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ 
                    p: 2, 
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%)', 
                    borderRadius: 2,
                    border: '1px solid rgba(139, 195, 74, 0.2)',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: 'rgba(139, 195, 74, 0.4)',
                      boxShadow: '0 2px 8px rgba(139, 195, 74, 0.1)'
                    }
                  }}>
                    <Typography variant="caption" sx={{ color: '#666666', display: 'block', mb: 0.5, fontSize: '0.75rem' }}>
                      parameter tolerance
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#1a1a1a', fontWeight: 600 }}>
                      {settings.parameterTolerance}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ 
                    p: 2, 
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%)', 
                    borderRadius: 2,
                    border: '1px solid rgba(139, 195, 74, 0.2)',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: 'rgba(139, 195, 74, 0.4)',
                      boxShadow: '0 2px 8px rgba(139, 195, 74, 0.1)'
                    }
                  }}>
                    <Typography variant="caption" sx={{ color: '#666666', display: 'block', mb: 0.5, fontSize: '0.75rem' }}>
                      gradient tolerance
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#1a1a1a', fontWeight: 600 }}>
                      {settings.gradientTolerance}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ 
                    p: 2, 
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%)', 
                    borderRadius: 2,
                    border: '1px solid rgba(139, 195, 74, 0.2)',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: 'rgba(139, 195, 74, 0.4)',
                      boxShadow: '0 2px 8px rgba(139, 195, 74, 0.1)'
                    }
                  }}>
                    <Typography variant="caption" sx={{ color: '#666666', display: 'block', mb: 0.5, fontSize: '0.75rem' }}>
                      maximum iterations
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#1a1a1a', fontWeight: 600 }}>
                      {settings.maximumIterations}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ 
                    p: 2, 
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%)', 
                    borderRadius: 2,
                    border: '1px solid rgba(139, 195, 74, 0.2)',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: 'rgba(139, 195, 74, 0.4)',
                      boxShadow: '0 2px 8px rgba(139, 195, 74, 0.1)'
                    }
                  }}>
                    <Typography variant="caption" sx={{ color: '#666666', display: 'block', mb: 0.5, fontSize: '0.75rem' }}>
                      maximum function calls
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#1a1a1a', fontWeight: 600 }}>
                      {settings.maximumFunctionCalls}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ 
                    p: 2, 
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%)', 
                    borderRadius: 2,
                    border: '1px solid rgba(139, 195, 74, 0.2)',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: 'rgba(139, 195, 74, 0.4)',
                      boxShadow: '0 2px 8px rgba(139, 195, 74, 0.1)'
                    }
                  }}>
                    <Typography variant="caption" sx={{ color: '#666666', display: 'block', mb: 0.5, fontSize: '0.75rem' }}>
                      maximum time
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#1a1a1a', fontWeight: 600 }}>
                      {settings.maximumTime} hour(s)
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Optimization Method - Display Only - Enhanced */}
            <Paper sx={{ 
              p: 2.5, 
              mb: 3, 
              background: 'linear-gradient(135deg, rgba(139, 195, 74, 0.1) 0%, rgba(139, 195, 74, 0.05) 100%)',
              border: '1px solid rgba(139, 195, 74, 0.3)',
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(139, 195, 74, 0.1)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Analytics sx={{ color: '#8BC34A', fontSize: 20 }} />
              <Typography
                variant="subtitle2"
                  sx={{ color: '#8BC34A', fontWeight: 700, fontSize: '0.95rem' }}
              >
                Optimization Method
              </Typography>
              </Box>
              <Box sx={{ 
                p: 2, 
                background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%)', 
                borderRadius: 2,
                border: '1px solid rgba(139, 195, 74, 0.2)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <Typography variant="body1" sx={{ color: '#1a1a1a', fontWeight: 600, mb: 0.5 }}>
                  {settings.optimizationMethod}
                </Typography>
                <Typography variant="caption" sx={{ color: '#666666', display: 'block' }}>
                  Active optimization method
                </Typography>
              </Box>
            </Paper>

            {/* Conjugate Gradient Settings - Display Only - Enhanced */}
            <Paper sx={{ 
              p: 2.5, 
              background: 'linear-gradient(135deg, rgba(139, 195, 74, 0.1) 0%, rgba(139, 195, 74, 0.05) 100%)',
              border: '1px solid rgba(139, 195, 74, 0.3)',
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(139, 195, 74, 0.1)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Settings sx={{ color: '#8BC34A', fontSize: 20 }} />
              <Typography
                variant="subtitle2"
                  sx={{ color: '#8BC34A', fontWeight: 700, fontSize: '0.95rem' }}
              >
                Conjugate Gradient Settings
              </Typography>
              </Box>
              <Grid container spacing={1.5}>
                <Grid item xs={12}>
                  <Box sx={{ 
                    p: 2, 
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%)', 
                    borderRadius: 2,
                    border: '1px solid rgba(139, 195, 74, 0.2)',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: 'rgba(139, 195, 74, 0.4)',
                      boxShadow: '0 2px 8px rgba(139, 195, 74, 0.1)'
                    }
                  }}>
                    <Typography variant="caption" sx={{ color: '#666666', display: 'block', mb: 0.5, fontSize: '0.75rem' }}>
                    gradient method
                  </Typography>
                    <Typography variant="body1" sx={{ color: '#1a1a1a', fontWeight: 600 }}>
                      {settings.gradientMethod}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ 
                    p: 2, 
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%)', 
                    borderRadius: 2,
                    border: '1px solid rgba(139, 195, 74, 0.2)',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: 'rgba(139, 195, 74, 0.4)',
                      boxShadow: '0 2px 8px rgba(139, 195, 74, 0.1)'
                    }
                  }}>
                    <Typography variant="caption" sx={{ color: '#666666', display: 'block', mb: 0.5, fontSize: '0.75rem' }}>
                    line minimization
                  </Typography>
                    <Typography variant="body1" sx={{ color: '#1a1a1a', fontWeight: 600 }}>
                      {settings.lineMinimization}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Paper>
        </Grid>

        {/* Right Panel - Visualization - Enhanced */}
        <Grid item xs={12} md={7}>
          <Paper
            sx={{
              p: 4,
              background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.95) 100%)',
              border: '2px solid rgba(139, 195, 74, 0.4)',
              borderRadius: 4,
              height: '100%',
              boxShadow: '0 8px 32px rgba(139, 195, 74, 0.2)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Timeline sx={{ color: '#8BC34A', fontSize: 28 }} />
            <Typography
              variant="h6"
                sx={{ color: '#8BC34A', fontWeight: 'bold' }}
            >
                Intensity Graph
            </Typography>
            </Box>
            <ResponsiveContainer width="100%" height={500}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="x(t-1)"
                  stroke="#8BC34A"
                  domain={[-5, 130]}
                  label={{
                    value: 'x(t-1)',
                    position: 'insideBottom',
                    offset: -10,
                    fill: '#8BC34A',
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="y(t)"
                  stroke="#8BC34A"
                  domain={[-5, 130]}
                  label={{
                    value: 'x(t)',
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#8BC34A',
                  }}
                />
                <ZAxis type="number" dataKey="z" range={[50, 400]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #8BC34A',
                    color: '#FFFFFF',
                  }}
                />
                <Scatter
                  name="Intensity"
                  data={intensityData}
                  fill="#8BC34A"
                  fillOpacity={0.6}
                />
              </ScatterChart>
            </ResponsiveContainer>

            {/* RUN Button - Enhanced */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Button
                variant="contained"
                onClick={handleRun}
                startIcon={<PlayArrow sx={{ fontSize: 28 }} />}
                sx={{
                  width: '70%',
                  height: 65,
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #8BC34A 0%, #7CB342 100%)',
                  color: '#FFFFFF',
                  borderRadius: '35px',
                  boxShadow: '0 8px 24px rgba(139, 195, 74, 0.4)',
                  textTransform: 'none',
                  letterSpacing: 1,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #7CB342 0%, #689F38 100%)',
                    boxShadow: '0 12px 32px rgba(139, 195, 74, 0.6)',
                    transform: 'translateY(-2px)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  }
                }}
              >
                RUN OPTIMIZATION
              </Button>
            </Box>

            {/* Optimization History Chart */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2 }}>
                Optimization History
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={optimizationHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="iteration" stroke="#8BC34A" />
                  <YAxis stroke="#8BC34A" />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #8BC34A' }} />
                  <Legend />
                  <Line type="monotone" dataKey="efficiency" stroke="#4CAF50" name="Efficiency %" />
                  <Line type="monotone" dataKey="fuelConsumption" stroke="#FF5722" name="Fuel (L/h)" />
                  <Line type="monotone" dataKey="emissions" stroke="#FF9800" name="Emissions (ppm)" />
                  <Line type="monotone" dataKey="powerOutput" stroke="#9C27B0" name="Power (MW)" />
                </LineChart>
              </ResponsiveContainer>
            </Box>

            {/* Real-Time Performance Chart */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2 }}>
                Real-Time Performance
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="time" stroke="#8BC34A" />
                  <YAxis stroke="#8BC34A" />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #8BC34A' }} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="efficiency" 
                    stroke="#4CAF50" 
                    fill="#4CAF50" 
                    fillOpacity={0.3}
                    name="Efficiency %" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="fuelConsumption" 
                    stroke="#FF5722" 
                    fill="#FF5722" 
                    fillOpacity={0.3}
                    name="Fuel (L/h)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Optimization Results Table - Enhanced */}
      <Grid container spacing={3} sx={{ mt: 4 }}>
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 4,
              background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(20, 20, 20, 0.95) 100%)',
              border: '2px solid rgba(139, 195, 74, 0.4)',
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(139, 195, 74, 0.2)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Analytics sx={{ color: '#8BC34A', fontSize: 28 }} />
              <Typography variant="h6" sx={{ color: '#8BC34A', fontWeight: 'bold' }}>
                Optimization Results
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#8BC34A', fontWeight: 'bold' }}>Parameter</TableCell>
                    <TableCell align="right" sx={{ color: '#8BC34A', fontWeight: 'bold' }}>Current Value</TableCell>
                    <TableCell align="right" sx={{ color: '#8BC34A', fontWeight: 'bold' }}>Optimal Value</TableCell>
                    <TableCell align="right" sx={{ color: '#8BC34A', fontWeight: 'bold' }}>Improvement</TableCell>
                    <TableCell align="center" sx={{ color: '#8BC34A', fontWeight: 'bold' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {optimizationResults.map((row, index) => (
                    <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#2a2a2a' } }}>
                      <TableCell sx={{ color: '#FFFFFF' }}>{row.parameter}</TableCell>
                      <TableCell align="right" sx={{ color: '#FFFFFF' }}>{row.current}</TableCell>
                      <TableCell align="right" sx={{ color: '#8BC34A' }}>{row.optimal}</TableCell>
                      <TableCell align="right" sx={{ color: row.improvement.startsWith('+') ? '#4CAF50' : '#FF9800' }}>
                        {row.improvement}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={row.status}
                          size="small"
                          color={
                            row.status === 'Optimized' ? 'success' :
                            row.status === 'In Progress' ? 'warning' : 'default'
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
      </Grid>
    </Box>
  );
};

export default RealTimeOptimizationPage;

