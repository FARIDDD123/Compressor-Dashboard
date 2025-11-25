// src/pages/Connection.jsx

import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Card, CardContent, Button, IconButton } from '@mui/material';
import PageHeader from '../components/common/PageHeader';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import { useSelector } from 'react-redux';

const Connection = () => {
  const { isConnected } = useSelector((state) => state.rtm);
  
  const [connectionData, setConnectionData] = useState({
    connections: [
      {
        id: 1,
        name: 'WebSocket Server',
        type: 'WebSocket',
        host: 'localhost:5000',
        status: 'Connected',
        latency: 12,
        lastConnected: new Date().toLocaleString(),
        messagesReceived: 1250,
        messagesSent: 850,
        uptime: '2h 34m',
      },
      {
        id: 2,
        name: 'OPC-UA Server',
        type: 'OPC-UA',
        host: '192.168.1.100:4840',
        status: 'Connected',
        latency: 8,
        lastConnected: new Date(Date.now() - 5 * 60 * 1000).toLocaleString(),
        messagesReceived: 3420,
        messagesSent: 2100,
        uptime: '5h 12m',
      },
      {
        id: 3,
        name: 'Kafka Broker',
        type: 'Kafka',
        host: 'localhost:9092',
        status: 'Connected',
        latency: 5,
        lastConnected: new Date(Date.now() - 2 * 60 * 1000).toLocaleString(),
        messagesReceived: 15200,
        messagesSent: 14800,
        uptime: '12h 45m',
      },
      {
        id: 4,
        name: 'InfluxDB',
        type: 'Database',
        host: 'localhost:8086',
        status: 'Connected',
        latency: 15,
        lastConnected: new Date(Date.now() - 1 * 60 * 1000).toLocaleString(),
        messagesReceived: 8500,
        messagesSent: 0,
        uptime: '8h 20m',
      },
      {
        id: 5,
        name: 'PostgreSQL',
        type: 'Database',
        host: 'localhost:5432',
        status: 'Warning',
        latency: 45,
        lastConnected: new Date(Date.now() - 10 * 60 * 1000).toLocaleString(),
        messagesReceived: 3200,
        messagesSent: 0,
        uptime: '6h 15m',
      },
      {
        id: 6,
        name: 'REST API',
        type: 'HTTP',
        host: 'localhost:5000/api',
        status: 'Connected',
        latency: 22,
        lastConnected: new Date().toLocaleString(),
        messagesReceived: 0,
        messagesSent: 1250,
        uptime: '1h 30m',
      },
      {
        id: 7,
        name: 'Modbus RTU',
        type: 'Modbus',
        host: 'COM3:9600',
        status: 'Connected',
        latency: 18,
        lastConnected: new Date(Date.now() - 2 * 60 * 1000).toLocaleString(),
        messagesReceived: 2850,
        messagesSent: 2850,
        uptime: '2h 15m',
      },
      {
        id: 8,
        name: 'MQTT Broker',
        type: 'MQTT',
        host: 'localhost:1883',
        status: 'Connected',
        latency: 10,
        lastConnected: new Date(Date.now() - 3 * 60 * 1000).toLocaleString(),
        messagesReceived: 5600,
        messagesSent: 5400,
        uptime: '3h 50m',
      },
    ],
    connectionHistory: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      active: 6 + Math.sin(i * 0.2) * 0.5 + Math.random() * 0.3,
      failed: Math.max(0, 0.2 + Math.sin(i * 0.3) * 0.1 + Math.random() * 0.1),
      latency: 15 + Math.sin(i * 0.25) * 5 + Math.random() * 2,
    })),
    networkStats: {
      totalConnections: 8,
      activeConnections: 6,
      failedConnections: 1,
      averageLatency: 15.2,
      totalMessages: 45820,
      dataThroughput: '2.5 MB/s',
    },
  });

  const handleRefresh = () => {
    setConnectionData((prev) => ({
      ...prev,
      connections: prev.connections.map((conn) => ({
        ...conn,
        latency: conn.latency + (Math.random() - 0.5) * 5,
        lastConnected: new Date().toLocaleString(),
      })),
    }));
  };

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionData((prev) => ({
        ...prev,
        connections: prev.connections.map((conn) => {
          if (conn.status === 'Connected') {
            return {
              ...conn,
              latency: Math.max(1, conn.latency + (Math.random() - 0.5) * 2),
              messagesReceived: conn.messagesReceived + Math.floor(Math.random() * 5),
              messagesSent: conn.messagesSent + Math.floor(Math.random() * 3),
            };
          }
          return conn;
        }),
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Connected':
        return 'success';
      case 'Warning':
        return 'warning';
      case 'Disconnected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Connected':
        return <CheckCircleIcon sx={{ color: '#4CAF50' }} />;
      case 'Warning':
        return <WarningIcon sx={{ color: '#FF9800' }} />;
      case 'Disconnected':
        return <ErrorIcon sx={{ color: '#F44336' }} />;
      default:
        return null;
    }
  };

  return (
    <Box>
      <PageHeader
        title="Connection Management"
        subtitle="Monitor and manage all system connections"
      />

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#8BC34A', mb: 1 }}>
                Active Connections
              </Typography>
              <Typography variant="h4" sx={{ color: '#FFFFFF' }}>
                {connectionData.networkStats.activeConnections}/{connectionData.networkStats.totalConnections}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#8BC34A', mb: 1 }}>
                Average Latency
              </Typography>
              <Typography variant="h4" sx={{ color: '#FFFFFF' }}>
                {connectionData.networkStats.averageLatency}ms
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#8BC34A', mb: 1 }}>
                Total Messages
              </Typography>
              <Typography variant="h4" sx={{ color: '#FFFFFF' }}>
                {connectionData.networkStats.totalMessages.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#8BC34A', mb: 1 }}>
                Data Throughput
              </Typography>
              <Typography variant="h4" sx={{ color: '#FFFFFF' }}>
                {connectionData.networkStats.dataThroughput}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Connections Table */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: '#8BC34A' }}>
                Active Connections
              </Typography>
              <IconButton onClick={handleRefresh} sx={{ color: '#8BC34A' }}>
                <RefreshIcon />
              </IconButton>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#8BC34A' }}>Name</TableCell>
                    <TableCell sx={{ color: '#8BC34A' }}>Type</TableCell>
                    <TableCell sx={{ color: '#8BC34A' }}>Host</TableCell>
                    <TableCell sx={{ color: '#8BC34A' }}>Status</TableCell>
                    <TableCell sx={{ color: '#8BC34A' }}>Latency</TableCell>
                    <TableCell sx={{ color: '#8BC34A' }}>Messages</TableCell>
                    <TableCell sx={{ color: '#8BC34A' }}>Uptime</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {connectionData.connections.map((conn) => (
                    <TableRow key={conn.id}>
                      <TableCell sx={{ color: '#FFFFFF' }}>{conn.name}</TableCell>
                      <TableCell sx={{ color: '#B0BEC5' }}>{conn.type}</TableCell>
                      <TableCell sx={{ color: '#B0BEC5', fontSize: '0.875rem' }}>{conn.host}</TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(conn.status)}
                          label={conn.status}
                          size="small"
                          color={getStatusColor(conn.status)}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#FFFFFF' }}>
                        {conn.status === 'Connected' ? `${conn.latency.toFixed(0)}ms` : '-'}
                      </TableCell>
                      <TableCell sx={{ color: '#B0BEC5', fontSize: '0.875rem' }}>
                        {conn.messagesReceived > 0 && `R: ${conn.messagesReceived}`}
                        {conn.messagesReceived > 0 && conn.messagesSent > 0 && ' / '}
                        {conn.messagesSent > 0 && `S: ${conn.messagesSent}`}
                        {conn.messagesReceived === 0 && conn.messagesSent === 0 && '-'}
                      </TableCell>
                      <TableCell sx={{ color: '#B0BEC5', fontSize: '0.875rem' }}>{conn.uptime}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Connection Statistics */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #8BC34A', mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2 }}>
              Connection Statistics
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ color: '#B0BEC5' }}>WebSocket Status</Typography>
                <Chip
                  label={isConnected ? 'Connected' : 'Disconnected'}
                  color={isConnected ? 'success' : 'error'}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: '#B0BEC5' }}>Failed Connections</Typography>
                <Typography variant="h6" sx={{ color: '#F44336', mt: 0.5 }}>
                  {connectionData.networkStats.failedConnections}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: '#B0BEC5' }}>Last Update</Typography>
                <Typography variant="body2" sx={{ color: '#FFFFFF', mt: 0.5 }}>
                  {new Date().toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Connection Health */}
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2 }}>
              Connection Health
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {connectionData.connections.filter(c => c.status === 'Connected').map((conn) => (
                <Box key={conn.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#FFFFFF' }}>{conn.name}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 8,
                        backgroundColor: '#333',
                        borderRadius: 1,
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        sx={{
                          width: `${Math.min(100, (100 - conn.latency / 2) * 100)}%`,
                          height: '100%',
                          backgroundColor: conn.latency < 20 ? '#4CAF50' : conn.latency < 50 ? '#FF9800' : '#F44336',
                        }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ color: '#B0BEC5', minWidth: 40 }}>
                      {conn.latency.toFixed(0)}ms
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Connection History Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a1a', border: '2px solid #8BC34A' }}>
            <Typography variant="h6" sx={{ color: '#8BC34A', mb: 2 }}>
              Connection History (Last 24 Hours)
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={connectionData.connectionHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="hour" stroke="#8BC34A" label={{ value: 'Hour', position: 'insideBottom', fill: '#8BC34A' }} />
                <YAxis yAxisId="left" stroke="#8BC34A" label={{ value: 'Connections', angle: -90, position: 'insideLeft', fill: '#8BC34A' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#FF9800" label={{ value: 'Latency (ms)', angle: 90, position: 'insideRight', fill: '#FF9800' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #8BC34A' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="active" stroke="#4CAF50" name="Active Connections" strokeWidth={2} />
                <Line yAxisId="left" type="monotone" dataKey="failed" stroke="#F44336" name="Failed Connections" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="latency" stroke="#FF9800" name="Avg Latency (ms)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Connection;

