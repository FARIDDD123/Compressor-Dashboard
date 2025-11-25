// src/pages/Alarms.jsx

import React, { useMemo, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Paper, Grid, Typography, Chip, Card, CardContent } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Warning, Error as ErrorIcon, Info, CheckCircle, Cancel, TrendingUp } from '@mui/icons-material';

import PageHeader from '../components/common/PageHeader';
import AnomalyAlerts from '../features/rtm/components/AnomalyAlerts';
import { addAlert, markAsAnomaly } from '../features/rtm/rtmSlice';

// Final version with improved wrapping and vertical alignment
const CustomYAxisTick = (props) => {
  const { x, y, payload } = props;
  const text = String(payload.value || '');
  const maxCharsPerLine = 18; // You can adjust this for wider or narrower lines

  // A more robust way to wrap words
  const words = text.split('_');
  const lines = words.reduce((acc, word) => {
    const lastLine = acc[acc.length - 1];

    if (lastLine && (lastLine + ' ' + word).length <= maxCharsPerLine) {
      // Add word to the last line if it fits
      acc[acc.length - 1] = lastLine + ' ' + word;
    } else {
      // Otherwise, start a new line
      acc.push(word);
    }
    return acc;
  }, []);


  // This part vertically centers the text block against the bar's center
  const verticalOffset = -((lines.length - 1) * 0.5) * 12 + 4;

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={verticalOffset} textAnchor="end" fill="#666">
        {lines.map((line, i) => (
          <tspan key={i} x={0} dy={i === 0 ? 0 : '1.2em'}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
};

const Alarms = () => {
  const dispatch = useDispatch();
  const { alerts, anomalyCauseCounts } = useSelector((state) => state.rtm);
  
  // Real-time statistics
  const [statistics, setStatistics] = useState({
    total: 0,
    critical: 0,
    warning: 0,
    info: 0,
    resolved: 0,
    active: 0
  });

  // Trend data for the last hour
  const [trendData, setTrendData] = useState([]);

  const chartData = useMemo(() => {
    return Object.entries(anomalyCauseCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [anomalyCauseCounts]);

  // Filter alerts to show only those from the last 8 hours
  const filteredAlerts = useMemo(() => {
    const eightHoursAgo = Date.now() - (8 * 60 * 60 * 1000);
    return alerts.filter(alert => 
      new Date(alert.iso_timestamp).getTime() >= eightHoursAgo
    );
  }, [alerts]);

  // Calculate severity distribution for pie chart
  const severityDistribution = useMemo(() => {
    const dist = { Critical: 0, Warning: 0, Info: 0 };
    filteredAlerts.forEach(alert => {
      dist[alert.severity] = (dist[alert.severity] || 0) + 1;
    });
    return [
      { name: 'Critical', value: dist.Critical, color: '#F44336' },
      { name: 'Warning', value: dist.Warning, color: '#FF9800' },
      { name: 'Info', value: dist.Info, color: '#2196F3' }
    ];
  }, [filteredAlerts]);

  // Update statistics based on alerts
  useEffect(() => {
    const critical = filteredAlerts.filter(a => a.severity === 'Critical').length;
    const warning = filteredAlerts.filter(a => a.severity === 'Warning').length;
    const info = filteredAlerts.filter(a => a.severity === 'Info').length;
    
    setStatistics({
      total: filteredAlerts.length,
      critical,
      warning,
      info,
      resolved: Math.floor(filteredAlerts.length * 0.65), // 65% resolved simulation
      active: Math.floor(filteredAlerts.length * 0.35) // 35% active
    });
  }, [filteredAlerts]);

  // Generate trend data for the last hour (12 points, 5-minute intervals)
  useEffect(() => {
    const generateTrend = () => {
      const trend = [];
      const now = Date.now();
      for (let i = 11; i >= 0; i--) {
        const time = new Date(now - i * 5 * 60 * 1000);
        const hour = time.getHours();
        const minute = time.getMinutes();
        trend.push({
          time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          Critical: Math.floor(Math.random() * 5) + 2,
          Warning: Math.floor(Math.random() * 8) + 3,
          Info: Math.floor(Math.random() * 6) + 1
        });
      }
      return trend;
    };

    setTrendData(generateTrend());

    const interval = setInterval(() => {
      setTrendData(prev => {
        const newTrend = [...prev.slice(1)];
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        newTrend.push({
          time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          Critical: Math.floor(Math.random() * 5) + 2,
          Warning: Math.floor(Math.random() * 8) + 3,
          Info: Math.floor(Math.random() * 6) + 1
        });
        return newTrend;
      });
    }, 5 * 60 * 1000); // Update every 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Simulate new alerts periodically
  useEffect(() => {
    const alertMessages = [
      { msg: 'Compressor inlet temperature rising above normal', severity: 'Warning', source: 'Compressor' },
      { msg: 'Turbine blade vibration detected - immediate attention required', severity: 'Critical', source: 'Turbine' },
      { msg: 'Fuel flow rate optimization completed', severity: 'Info', source: 'Fuel System' },
      { msg: 'Generator output power fluctuation detected', severity: 'Warning', source: 'Generator' },
      { msg: 'Emergency shutdown sequence initiated', severity: 'Critical', source: 'Control System' },
      { msg: 'Lubrication system pressure below threshold', severity: 'Critical', source: 'Compressor' },
      { msg: 'Cooling water temperature increase detected', severity: 'Warning', source: 'Turbine' },
      { msg: 'Routine maintenance check completed successfully', severity: 'Info', source: 'Control System' },
      { msg: 'Air filter differential pressure high - replacement needed', severity: 'Warning', source: 'Compressor' },
      { msg: 'Bearing temperature exceeding safety limits', severity: 'Critical', source: 'Turbine' }
    ];

    const interval = setInterval(() => {
      const randomAlert = alertMessages[Math.floor(Math.random() * alertMessages.length)];
      const newAlert = {
        id: `alert-${Date.now()}`,
        iso_timestamp: new Date().toISOString(),
        display_timestamp: new Date().toLocaleString(),
        message: randomAlert.msg,
        severity: randomAlert.severity,
        source: randomAlert.source
      };
      dispatch(addAlert(newAlert));
    }, 15000); // Add a new alert every 15 seconds

    return () => clearInterval(interval);
  }, [dispatch]);


  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title="Alarm System & Real-Time Monitoring"
        subtitle="Comprehensive alarm monitoring with live statistics and anomaly analysis for gas turbine operations."
      />
      
      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #F44336 0%, #E53935 100%)',
            color: '#FFF',
            boxShadow: 3
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{statistics.critical}</Typography>
                  <Typography variant="body2">Critical Alarms</Typography>
                </Box>
                <ErrorIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #FF9800 0%, #FB8C00 100%)',
            color: '#FFF',
            boxShadow: 3
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{statistics.warning}</Typography>
                  <Typography variant="body2">Warning Alarms</Typography>
                </Box>
                <Warning sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #2196F3 0%, #1E88E5 100%)',
            color: '#FFF',
            boxShadow: 3
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{statistics.info}</Typography>
                  <Typography variant="body2">Info Alarms</Typography>
                </Box>
                <Info sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4CAF50 0%, #43A047 100%)',
            color: '#FFF',
            boxShadow: 3
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{statistics.resolved}</Typography>
                  <Typography variant="body2">Resolved</Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Severity Distribution & Trend */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 3, 
            backgroundColor: '#1a1a1a', 
            border: '2px solid #8BC34A',
            height: '400px'
          }}>
            <Typography variant="h6" sx={{ color: '#8BC34A', fontWeight: 'bold', mb: 2 }}>
              Severity Distribution (Last 8 Hours)
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={severityDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {severityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #8BC34A',
                    color: '#FFFFFF'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 3, 
            backgroundColor: '#1a1a1a', 
            border: '2px solid #2196F3',
            height: '400px'
          }}>
            <Typography variant="h6" sx={{ color: '#2196F3', fontWeight: 'bold', mb: 2 }}>
              <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
              Alarm Trend (Last Hour)
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="time" stroke="#2196F3" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#2196F3" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #2196F3',
                    color: '#FFFFFF'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="Critical" stroke="#F44336" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Warning" stroke="#FF9800" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Info" stroke="#2196F3" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Live Alerts List */}
        <Grid item xs={12}>
          <Paper 
            sx={{ 
              p: 3, 
              backgroundColor: '#1a1a1a', 
              border: '2px solid #F44336',
              borderRadius: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ color: '#F44336', fontWeight: 'bold' }}>
                🚨 Real-Time Alert Feed (Last 8 Hours)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip 
                  label={`Total: ${filteredAlerts.length}`} 
                  sx={{ 
                    backgroundColor: '#8BC34A',
                    color: '#FFFFFF',
                    fontWeight: 'bold'
                  }}
                />
                <Chip 
                  label={`Active: ${statistics.active}`} 
                  sx={{ 
                    backgroundColor: '#F44336',
                    color: '#FFFFFF',
                    fontWeight: 'bold'
                  }}
                />
              </Box>
            </Box>
            <Box sx={{ height: '50vh', overflow: 'auto' }}>
              <AnomalyAlerts alerts={filteredAlerts} />
            </Box>
          </Paper>
        </Grid>

        {/* Anomaly Cause Frequency Chart */}
        <Grid item xs={12}>
          <Paper 
            sx={{ 
              p: 3, 
              backgroundColor: '#1a1a1a', 
              border: '2px solid #8BC34A',
              borderRadius: 2
            }}
          >
            <Typography variant="h6" sx={{ color: '#8BC34A', fontWeight: 'bold', mb: 2 }}>
              📊 Anomaly Root Cause Analysis - Frequency Distribution
            </Typography>
            <Typography variant="body2" sx={{ color: '#999', mb: 2 }}>
              Historical analysis of anomaly causes across all turbine systems
            </Typography>
            <Box sx={{ height: '80vh', overflow: 'auto' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                  <XAxis type="number" stroke="#8BC34A" label={{ value: 'Occurrence Count', position: 'insideBottom', offset: -5, fill: '#8BC34A' }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={180}
                    tick={<CustomYAxisTick />}
                    interval={0}
                    stroke="#8BC34A"
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(139, 195, 74, 0.1)' }}
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #8BC34A',
                      color: '#FFFFFF'
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="count" 
                    name="Frequency of Anomaly Cause" 
                    fill="#8BC34A"
                    radius={[0, 8, 8, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Alarms;