// src/pages/CSMPage.jsx
// Condition Monitoring System Page

import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Card, CardContent, LinearProgress, IconButton,
  Divider, List, ListItem, ListItemText, Avatar
} from '@mui/material';
import {
  Memory, Storage, Speed, NetworkCheck, Timeline, Cloud, DeviceHub,
  CheckCircle, Warning, Error as ErrorIcon, TrendingUp, TrendingDown,
  Refresh, Settings
} from '@mui/icons-material';
import PageHeader from '../components/common/PageHeader';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

const CSMPage = () => {
  const [systemMetrics, setSystemMetrics] = useState({
    cpuUsage: 45,
    memoryUsage: 62,
    diskIO: 78,
    networkLatency: 12,
    activeConnections: 234,
    queueDepth: 15,
    cacheHitRate: 89,
    responseTime: 45,
  });

  const [services, setServices] = useState([
    { id: 1, name: 'Data Acquisition Service', status: 'Running', uptime: '15d 8h 32m', cpu: 12, memory: 256, port: 8001 },
    { id: 2, name: 'Real-Time Processing', status: 'Running', uptime: '15d 8h 30m', cpu: 28, memory: 512, port: 8002 },
    { id: 3, name: 'Database Connector', status: 'Running', uptime: '15d 8h 32m', cpu: 8, memory: 128, port: 8003 },
    { id: 4, name: 'WebSocket Server', status: 'Running', uptime: '15d 8h 31m', cpu: 15, memory: 192, port: 8004 },
    { id: 5, name: 'Alert Manager', status: 'Running', uptime: '15d 8h 29m', cpu: 5, memory: 64, port: 8005 },
    { id: 6, name: 'Analytics Engine', status: 'Running', uptime: '12d 4h 15m', cpu: 35, memory: 1024, port: 8006 },
    { id: 7, name: 'Backup Service', status: 'Warning', uptime: '8d 2h 45m', cpu: 20, memory: 256, port: 8007 },
    { id: 8, name: 'API Gateway', status: 'Running', uptime: '15d 8h 32m', cpu: 18, memory: 384, port: 8008 },
    { id: 9, name: 'Logger Service', status: 'Running', uptime: '15d 8h 32m', cpu: 10, memory: 128, port: 8009 },
    { id: 10, name: 'Cache Manager', status: 'Running', uptime: '15d 8h 30m', cpu: 8, memory: 512, port: 8010 },
  ]);

  const [databases, setDatabases] = useState([
    { name: 'InfluxDB Time-Series', status: 'Connected', health: 98, records: 2543210, size: '45.2 GB', queries: 1250, avgLatency: 8 },
    { name: 'PostgreSQL Main', status: 'Connected', health: 95, records: 852000, size: '12.8 GB', queries: 850, avgLatency: 12 },
    { name: 'MongoDB Documents', status: 'Connected', health: 92, records: 450000, size: '8.5 GB', queries: 420, avgLatency: 15 },
    { name: 'Redis Cache', status: 'Connected', health: 99, records: 125000, size: '2.1 GB', queries: 8500, avgLatency: 2 },
    { name: 'MySQL Analytics', status: 'Warning', health: 78, records: 320000, size: '5.4 GB', queries: 180, avgLatency: 28 },
  ]);

  // Real-time metrics history (last 60 minutes)
  const [metricsHistory, setMetricsHistory] = useState(
    Array.from({ length: 60 }, (_, i) => ({
      time: new Date(Date.now() - (60 - i) * 60000).toLocaleTimeString(),
      cpu: 40 + Math.sin(i * 0.15) * 15 + Math.random() * 10,
      memory: 55 + Math.sin(i * 0.12) * 12 + Math.random() * 8,
      network: 10 + Math.sin(i * 0.18) * 5 + Math.random() * 3,
      disk: 70 + Math.sin(i * 0.1) * 10 + Math.random() * 5,
    }))
  );

  // System events log
  const [events, setEvents] = useState([
    { id: 1, timestamp: new Date(Date.now() - 5 * 60000).toLocaleTimeString(), type: 'Info', message: 'System health check completed successfully', source: 'Health Monitor' },
    { id: 2, timestamp: new Date(Date.now() - 15 * 60000).toLocaleTimeString(), type: 'Warning', message: 'Backup Service experiencing high latency', source: 'Backup Service' },
    { id: 3, timestamp: new Date(Date.now() - 22 * 60000).toLocaleTimeString(), type: 'Info', message: 'Database backup completed', source: 'Backup Service' },
    { id: 4, timestamp: new Date(Date.now() - 35 * 60000).toLocaleTimeString(), type: 'Success', message: 'Cache cleared and rebuilt', source: 'Cache Manager' },
    { id: 5, timestamp: new Date(Date.now() - 48 * 60000).toLocaleTimeString(), type: 'Warning', message: 'MySQL Analytics connection slow', source: 'Database Connector' },
    { id: 6, timestamp: new Date(Date.now() - 52 * 60000).toLocaleTimeString(), type: 'Info', message: 'Analytics Engine restarted', source: 'Analytics Engine' },
    { id: 7, timestamp: new Date(Date.now() - 68 * 60000).toLocaleTimeString(), type: 'Info', message: 'System startup completed', source: 'System' },
  ]);

  // Storage usage
  const storageData = [
    { name: 'Time-Series Data', value: 45, color: '#8BC34A' },
    { name: 'Relational Data', value: 25, color: '#2196F3' },
    { name: 'Cache', value: 10, color: '#FF9800' },
    { name: 'Logs', value: 8, color: '#9C27B0' },
    { name: 'Backups', value: 7, color: '#F44336' },
    { name: 'Other', value: 5, color: '#607D8B' },
  ];

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update system metrics
      setSystemMetrics(prev => ({
        cpuUsage: Math.max(0, Math.min(100, prev.cpuUsage + (Math.random() - 0.5) * 5)),
        memoryUsage: Math.max(0, Math.min(100, prev.memoryUsage + (Math.random() - 0.5) * 3)),
        diskIO: Math.max(0, Math.min(100, prev.diskIO + (Math.random() - 0.5) * 4)),
        networkLatency: Math.max(0, prev.networkLatency + (Math.random() - 0.5) * 2),
        activeConnections: Math.max(0, prev.activeConnections + Math.floor((Math.random() - 0.5) * 10)),
        queueDepth: Math.max(0, prev.queueDepth + Math.floor((Math.random() - 0.5) * 3)),
        cacheHitRate: Math.max(0, Math.min(100, prev.cacheHitRate + (Math.random() - 0.5) * 2)),
        responseTime: Math.max(0, prev.responseTime + (Math.random() - 0.5) * 5),
      }));

      // Update metrics history
      setMetricsHistory(prev => {
        const newData = [...prev.slice(1), {
          time: new Date().toLocaleTimeString(),
          cpu: Math.max(0, Math.min(100, prev[prev.length - 1].cpu + (Math.random() - 0.5) * 5)),
          memory: Math.max(0, Math.min(100, prev[prev.length - 1].memory + (Math.random() - 0.5) * 3)),
          network: Math.max(0, prev[prev.length - 1].network + (Math.random() - 0.5) * 2),
          disk: Math.max(0, Math.min(100, prev[prev.length - 1].disk + (Math.random() - 0.5) * 4)),
        }];
        return newData;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Running':
      case 'Connected':
        return 'success';
      case 'Warning':
        return 'warning';
      case 'Error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'Success':
        return <CheckCircle sx={{ color: '#4CAF50' }} />;
      case 'Warning':
        return <Warning sx={{ color: '#FF9800' }} />;
      case 'Error':
        return <ErrorIcon sx={{ color: '#F44336' }} />;
      default:
        return <CheckCircle sx={{ color: '#2196F3' }} />;
    }
  };

  return (
    <Box>
      <PageHeader
        title="Condition Monitoring System (CSM)"
        subtitle="System health, services, and infrastructure monitoring"
      />

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Memory sx={{ color: '#8BC34A', mr: 1 }} />
                <Typography variant="h6" sx={{ color: '#8BC34A', fontSize: '0.9rem' }}>
                  CPU Usage
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ color: '#FFFFFF', mb: 1 }}>
                {systemMetrics.cpuUsage.toFixed(1)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={systemMetrics.cpuUsage}
                sx={{
                  height: 8,
                  borderRadius: 1,
                  backgroundColor: '#333',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: systemMetrics.cpuUsage > 80 ? '#F44336' : systemMetrics.cpuUsage > 60 ? '#FF9800' : '#8BC34A',
                  },
                }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#1a1a1a', border: '2px solid #2196F3' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Storage sx={{ color: '#2196F3', mr: 1 }} />
                <Typography variant="h6" sx={{ color: '#2196F3', fontSize: '0.9rem' }}>
                  Memory Usage
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ color: '#FFFFFF', mb: 1 }}>
                {systemMetrics.memoryUsage.toFixed(1)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={systemMetrics.memoryUsage}
                sx={{
                  height: 8,
                  borderRadius: 1,
                  backgroundColor: '#333',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: systemMetrics.memoryUsage > 80 ? '#F44336' : systemMetrics.memoryUsage > 60 ? '#FF9800' : '#2196F3',
                  },
                }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#1a1a1a', border: '2px solid #FF9800' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Speed sx={{ color: '#FF9800', mr: 1 }} />
                <Typography variant="h6" sx={{ color: '#FF9800', fontSize: '0.9rem' }}>
                  Disk I/O
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ color: '#FFFFFF', mb: 1 }}>
                {systemMetrics.diskIO.toFixed(1)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={systemMetrics.diskIO}
                sx={{
                  height: 8,
                  borderRadius: 1,
                  backgroundColor: '#333',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: systemMetrics.diskIO > 80 ? '#F44336' : systemMetrics.diskIO > 60 ? '#FF9800' : '#FF9800',
                  },
                }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#1a1a1a', border: '2px solid #9C27B0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <NetworkCheck sx={{ color: '#9C27B0', mr: 1 }} />
                <Typography variant="h6" sx={{ color: '#9C27B0', fontSize: '0.9rem' }}>
                  Network Latency
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ color: '#FFFFFF', mb: 1 }}>
                {systemMetrics.networkLatency.toFixed(0)} ms
              </Typography>
              <Typography variant="caption" sx={{ color: '#B0BEC5' }}>
                {systemMetrics.activeConnections} active connections
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* System Metrics Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: '#8BC34A' }}>
                Real-Time System Metrics (Last 60 Minutes)
              </Typography>
              <IconButton sx={{ color: '#8BC34A' }}>
                <Refresh />
              </IconButton>
            </Box>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={metricsHistory}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8BC34A" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8BC34A" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2196F3" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#2196F3" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorNetwork" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9C27B0" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#9C27B0" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF9800" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#FF9800" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="time" stroke="#8BC34A" interval={9} angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#8BC34A" domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #8BC34A', color: '#FFF' }} />
                <Legend />
                <Area type="monotone" dataKey="cpu" stroke="#8BC34A" fillOpacity={1} fill="url(#colorCpu)" name="CPU %" />
                <Area type="monotone" dataKey="memory" stroke="#2196F3" fillOpacity={1} fill="url(#colorMemory)" name="Memory %" />
                <Area type="monotone" dataKey="disk" stroke="#FF9800" fillOpacity={1} fill="url(#colorDisk)" name="Disk I/O %" />
                <Area type="monotone" dataKey="network" stroke="#9C27B0" fillOpacity={1} fill="url(#colorNetwork)" name="Network (ms)" />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Storage Distribution */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #2196F3', height: '100%' }}>
            <Typography variant="h6" sx={{ color: '#2196F3', mb: 2 }}>
              Storage Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={storageData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {storageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2196F3', color: '#FFF' }} />
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ color: '#B0BEC5', mb: 1 }}>
                Total Storage: <strong style={{ color: '#FFF' }}>100 GB</strong>
              </Typography>
              <Typography variant="body2" sx={{ color: '#B0BEC5' }}>
                Available: <strong style={{ color: '#4CAF50' }}>22 GB</strong>
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Services Status Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2 }}>
              System Services
            </Typography>
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#8BC34A', backgroundColor: '#0a0a0a' }}>Service Name</TableCell>
                    <TableCell sx={{ color: '#8BC34A', backgroundColor: '#0a0a0a' }}>Status</TableCell>
                    <TableCell sx={{ color: '#8BC34A', backgroundColor: '#0a0a0a' }}>Uptime</TableCell>
                    <TableCell sx={{ color: '#8BC34A', backgroundColor: '#0a0a0a' }}>CPU %</TableCell>
                    <TableCell sx={{ color: '#8BC34A', backgroundColor: '#0a0a0a' }}>Memory (MB)</TableCell>
                    <TableCell sx={{ color: '#8BC34A', backgroundColor: '#0a0a0a' }}>Port</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.id} hover>
                      <TableCell sx={{ color: '#FFFFFF' }}>{service.name}</TableCell>
                      <TableCell>
                        <Chip
                          label={service.status}
                          size="small"
                          color={getStatusColor(service.status)}
                          sx={{ fontSize: '0.7rem' }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#B0BEC5' }}>{service.uptime}</TableCell>
                      <TableCell sx={{ color: '#FFFFFF' }}>{service.cpu}%</TableCell>
                      <TableCell sx={{ color: '#B0BEC5' }}>{service.memory} MB</TableCell>
                      <TableCell sx={{ color: '#2196F3' }}>:{service.port}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Database Connections */}
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #2196F3' }}>
            <Typography variant="h6" sx={{ color: '#2196F3', mb: 2 }}>
              Database Connections
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#2196F3', backgroundColor: '#0a0a0a' }}>Database</TableCell>
                    <TableCell sx={{ color: '#2196F3', backgroundColor: '#0a0a0a' }}>Status</TableCell>
                    <TableCell sx={{ color: '#2196F3', backgroundColor: '#0a0a0a' }}>Health</TableCell>
                    <TableCell sx={{ color: '#2196F3', backgroundColor: '#0a0a0a' }}>Records</TableCell>
                    <TableCell sx={{ color: '#2196F3', backgroundColor: '#0a0a0a' }}>Size</TableCell>
                    <TableCell sx={{ color: '#2196F3', backgroundColor: '#0a0a0a' }}>Queries/min</TableCell>
                    <TableCell sx={{ color: '#2196F3', backgroundColor: '#0a0a0a' }}>Avg Latency</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {databases.map((db) => (
                    <TableRow key={db.name} hover>
                      <TableCell sx={{ color: '#FFFFFF' }}>{db.name}</TableCell>
                      <TableCell>
                        <Chip
                          label={db.status}
                          size="small"
                          color={getStatusColor(db.status)}
                          sx={{ fontSize: '0.7rem' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={db.health}
                            sx={{
                              width: 60,
                              height: 8,
                              borderRadius: 1,
                              backgroundColor: '#333',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: db.health > 90 ? '#4CAF50' : db.health > 75 ? '#FF9800' : '#F44336',
                              },
                            }}
                          />
                          <Typography sx={{ color: '#B0BEC5', fontSize: '0.8rem' }}>{db.health}%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#B0BEC5' }}>{db.records.toLocaleString()}</TableCell>
                      <TableCell sx={{ color: '#B0BEC5' }}>{db.size}</TableCell>
                      <TableCell sx={{ color: '#FFFFFF' }}>{db.queries}</TableCell>
                      <TableCell sx={{ color: db.avgLatency > 20 ? '#FF9800' : '#4CAF50' }}>{db.avgLatency} ms</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* System Events Log */}
        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #9C27B0' }}>
            <Typography variant="h6" sx={{ color: '#9C27B0', mb: 2 }}>
              Recent System Events
            </Typography>
            <List sx={{ maxHeight: 400, overflowY: 'auto' }}>
              {events.map((event) => (
                <ListItem key={event.id} sx={{ borderBottom: '1px solid #333', py: 1 }}>
                  <Avatar sx={{ bgcolor: 'transparent', mr: 2 }}>
                    {getEventIcon(event.type)}
                  </Avatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                        {event.message}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" sx={{ color: '#B0BEC5' }}>
                          {event.timestamp} • {event.source}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CSMPage;

