// src/pages/ThreeDAnalysis.jsx

import React, { useState, useEffect } from 'react';
import { 
  Box, Paper, Typography, Select, MenuItem, FormControl, InputLabel, Button, Grid, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, 
  Card, CardContent, Switch, FormControlLabel 
} from '@mui/material';
import PageHeader from '../components/common/PageHeader';
import GasTurbineViewer from '../components/3d/GasTurbineViewer';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';

const ThreeDAnalysis = () => {
  const [viewMode, setViewMode] = useState('full');
  const [componentFocus, setComponentFocus] = useState('all');
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [showHeatMap, setShowHeatMap] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  // Enhanced 3D model component data with positions and properties
  const [componentData, setComponentData] = useState([
    { 
      id: 'inlet', 
      component: 'Inlet Guide Vanes', 
      temperature: 420, 
      pressure: 1.2, 
      efficiency: 92, 
      status: 'Normal',
      position: { x: 0, y: 0, z: -3 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      color: '#2196F3',
      vertices: 1250,
      faces: 2480,
      material: 'Titanium Alloy',
      health: 98
    },
    { 
      id: 'comp1', 
      component: 'Compressor Stage 1', 
      temperature: 580, 
      pressure: 3.5, 
      efficiency: 88, 
      status: 'Normal',
      position: { x: 0, y: 0, z: -2 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      color: '#4CAF50',
      vertices: 3200,
      faces: 6400,
      material: 'Nickel Superalloy',
      health: 95
    },
    { 
      id: 'comp2', 
      component: 'Compressor Stage 2', 
      temperature: 720, 
      pressure: 8.2, 
      efficiency: 85, 
      status: 'Warning',
      position: { x: 0, y: 0, z: -1 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      color: '#FF9800',
      vertices: 3800,
      faces: 7600,
      material: 'Nickel Superalloy',
      health: 82
    },
    { 
      id: 'combustion', 
      component: 'Combustion Chamber', 
      temperature: 1200, 
      pressure: 12.5, 
      efficiency: 95, 
      status: 'Normal',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1.2, y: 1.2, z: 1.2 },
      color: '#F44336',
      vertices: 5600,
      faces: 11200,
      material: 'Ceramic Matrix Composite',
      health: 96
    },
    { 
      id: 'turbine1', 
      component: 'Turbine Stage 1', 
      temperature: 1100, 
      pressure: 10.8, 
      efficiency: 90, 
      status: 'Normal',
      position: { x: 0, y: 0, z: 1 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      color: '#9C27B0',
      vertices: 4200,
      faces: 8400,
      material: 'Single Crystal Superalloy',
      health: 93
    },
    { 
      id: 'turbine2', 
      component: 'Turbine Stage 2', 
      temperature: 950, 
      pressure: 6.5, 
      efficiency: 87, 
      status: 'Normal',
      position: { x: 0, y: 0, z: 2 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      color: '#E91E63',
      vertices: 3800,
      faces: 7600,
      material: 'Single Crystal Superalloy',
      health: 91
    },
    { 
      id: 'exhaust', 
      component: 'Exhaust System', 
      temperature: 650, 
      pressure: 1.5, 
      efficiency: 82, 
      status: 'Normal',
      position: { x: 0, y: 0, z: 3 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1.1, y: 1.1, z: 1.1 },
      color: '#00BCD4',
      vertices: 2100,
      faces: 4200,
      material: 'Inconel 718',
      health: 89
    },
    { 
      id: 'shaft', 
      component: 'Main Shaft', 
      temperature: 450, 
      pressure: 0, 
      efficiency: 99, 
      status: 'Normal',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 0.3, y: 0.3, z: 6 },
      color: '#607D8B',
      vertices: 800,
      faces: 1600,
      material: 'High-Strength Steel',
      health: 97
    },
    { 
      id: 'bearings', 
      component: 'Bearings', 
      temperature: 380, 
      pressure: 0, 
      efficiency: 98, 
      status: 'Normal',
      position: { x: 0, y: 0, z: -1.5 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 0.5, y: 0.5, z: 0.5 },
      color: '#795548',
      vertices: 600,
      faces: 1200,
      material: 'Ceramic Bearing',
      health: 94
    },
  ]);

  // 3D model mesh data (simplified representation)
  const modelMeshData = {
    totalVertices: 26350,
    totalFaces: 52700,
    boundingBox: {
      min: { x: -2, y: -2, z: -4 },
      max: { x: 2, y: 2, z: 4 }
    },
    center: { x: 0, y: 0, z: 0 },
    fileSize: '12.5 MB',
    format: 'GLTF 2.0',
    lastUpdated: new Date().toISOString()
  };

  // Temperature heat map data (3D coordinates with temperature values)
  const heatMapData = componentData.flatMap(comp => 
    Array.from({ length: 20 }, (_, i) => ({
      x: comp.position.x + (Math.random() - 0.5) * 0.5,
      y: comp.position.y + (Math.random() - 0.5) * 0.5,
      z: comp.position.z + (Math.random() - 0.5) * 0.5,
      temperature: comp.temperature + (Math.random() - 0.5) * 50,
      component: comp.component
    }))
  );

  // Temperature trend data (extended)
  const temperatureData = Array.from({ length: 48 }, (_, i) => ({
    hour: i / 2,
    inlet: 420 + Math.sin(i * 0.15) * 20 + Math.random() * 5,
    compressor: 720 + Math.sin(i * 0.125) * 30 + Math.random() * 8,
    turbine: 1100 + Math.sin(i * 0.1) * 50 + Math.random() * 10,
    exhaust: 650 + Math.sin(i * 0.175) * 25 + Math.random() * 6,
    shaft: 450 + Math.sin(i * 0.2) * 15 + Math.random() * 4,
  }));

  // Real-time component updates
  useEffect(() => {
    const interval = setInterval(() => {
      setComponentData(prev => prev.map(comp => ({
        ...comp,
        temperature: Math.max(300, Math.min(1300, comp.temperature + (Math.random() - 0.5) * 5)),
        pressure: comp.pressure > 0 ? Math.max(0.5, comp.pressure + (Math.random() - 0.5) * 0.1) : 0,
      })));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleComponentClick = (componentId) => {
    setSelectedComponent(componentId);
  };

  return (
    <Box>
      <PageHeader
        title="3D Analysis Operations"
        subtitle="Interactive 3D visualization of the gas turbine model with real-time data."
      />
      <Grid container spacing={3}>
        {/* 3D Viewer */}
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={3} 
            sx={{ 
              height: '60vh', 
              position: 'relative',
              backgroundColor: '#1a1a1a',
              border: '2px solid #8BC34A',
              mb: 3,
              overflow: 'hidden'
            }}
          >
            {/* 3D Gas Turbine Viewer */}
            <GasTurbineViewer
              onComponentSelect={handleComponentClick}
              selectedComponent={selectedComponent}
            />
            
            {/* Selected Component Info Overlay */}
            {selectedComponent && (
              <Paper sx={{ 
                position: 'absolute',
                bottom: 140,
                right: 20,
                p: 2,
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                border: '2px solid #8BC34A',
                minWidth: 250,
                zIndex: 10
              }}>
                {(() => {
                  const comp = componentData.find(c => c.id === selectedComponent);
                  return comp ? (
                    <>
                      <Typography variant="h6" sx={{ color: '#8BC34A', mb: 1 }}>
                        {comp.component}
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="caption" sx={{ color: '#FFF' }}>
                            Temp: <strong>{comp.temperature.toFixed(1)}°C</strong>
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" sx={{ color: '#FFF' }}>
                            Pressure: <strong>{comp.pressure > 0 ? `${comp.pressure.toFixed(2)} bar` : 'N/A'}</strong>
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" sx={{ color: '#FFF' }}>
                            Efficiency: <strong>{comp.efficiency}%</strong>
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" sx={{ color: '#FFF' }}>
                            Health: <strong>{comp.health}%</strong>
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="caption" sx={{ color: '#FFF', mt: 1, display: 'block' }}>
                            Material: <strong>{comp.material}</strong>
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Chip
                            label={comp.status}
                            size="small"
                            color={comp.status === 'Normal' ? 'success' : 'warning'}
                            sx={{ mt: 1 }}
                          />
                        </Grid>
                      </Grid>
                    </>
                  ) : null;
                })()}
              </Paper>
            )}
          </Paper>

          {/* Temperature Trend Chart */}
          <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#8BC34A' }}>
              Temperature Trends (24 Hours)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={temperatureData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="hour" stroke="#8BC34A" />
                <YAxis stroke="#8BC34A" />
                <RechartsTooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #8BC34A' }} />
                <Legend />
                <Line type="monotone" dataKey="inlet" stroke="#2196F3" name="Inlet" />
                <Line type="monotone" dataKey="compressor" stroke="#FF5722" name="Compressor" />
                <Line type="monotone" dataKey="turbine" stroke="#FF9800" name="Turbine" />
                <Line type="monotone" dataKey="exhaust" stroke="#4CAF50" name="Exhaust" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Controls & Component Data */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, mb: 3, backgroundColor: '#1a1a1a', border: '1px solid #8BC34A' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#8BC34A' }}>3D Controls</Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel sx={{ color: '#8BC34A' }}>View Mode</InputLabel>
              <Select 
                value={viewMode} 
                onChange={(e) => setViewMode(e.target.value)} 
                label="View Mode"
                sx={{ 
                  color: '#FFFFFF',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#8BC34A' }
                }}
              >
                <MenuItem value="full">Full Model</MenuItem>
                <MenuItem value="cutaway">Cutaway View</MenuItem>
                <MenuItem value="exploded">Exploded View</MenuItem>
                <MenuItem value="wireframe">Wireframe</MenuItem>
                <MenuItem value="solid">Solid</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel sx={{ color: '#8BC34A' }}>Component Focus</InputLabel>
              <Select 
                value={componentFocus} 
                onChange={(e) => setComponentFocus(e.target.value)} 
                label="Component Focus"
                sx={{ 
                  color: '#FFFFFF',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#8BC34A' }
                }}
              >
                <MenuItem value="all">All Components</MenuItem>
                <MenuItem value="inlet">Inlet System</MenuItem>
                <MenuItem value="compressor">Compressor Stage</MenuItem>
                <MenuItem value="combustion">Combustion Chamber</MenuItem>
                <MenuItem value="turbine">Turbine Stage</MenuItem>
                <MenuItem value="exhaust">Exhaust System</MenuItem>
              </Select>
            </FormControl>

            {/* Toggle Options */}
            <FormControlLabel
              control={
                <Switch
                  checked={showHeatMap}
                  onChange={(e) => setShowHeatMap(e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: '#8BC34A' },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#8BC34A' }
                  }}
                />
              }
              label={<Typography sx={{ color: '#FFFFFF' }}>Heat Map</Typography>}
              sx={{ mb: 1 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={showLabels}
                  onChange={(e) => setShowLabels(e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: '#8BC34A' },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#8BC34A' }
                  }}
                />
              }
              label={<Typography sx={{ color: '#FFFFFF' }}>Component Labels</Typography>}
              sx={{ mb: 2 }}
            />

            <Button 
              variant="contained" 
              fullWidth 
              sx={{ 
                mb: 1, 
                backgroundColor: '#8BC34A',
                '&:hover': { backgroundColor: '#7CB342' }
              }}
            >
              Reset View
            </Button>
            <Button 
              variant="outlined" 
              fullWidth
              sx={{ 
                borderColor: '#8BC34A',
                color: '#8BC34A',
                '&:hover': { borderColor: '#8BC34A', backgroundColor: 'rgba(139, 195, 74, 0.1)' }
              }}
            >
              Export Model
            </Button>
          </Paper>

          {/* Component Status Table */}
          <Paper elevation={3} sx={{ p: 2, backgroundColor: '#1a1a1a', border: '1px solid #8BC34A' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#8BC34A' }}>
              Component Status
            </Typography>
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#8BC34A', fontWeight: 'bold' }}>Component</TableCell>
                    <TableCell align="right" sx={{ color: '#8BC34A', fontWeight: 'bold' }}>Temp (°C)</TableCell>
                    <TableCell align="right" sx={{ color: '#8BC34A', fontWeight: 'bold' }}>Pressure</TableCell>
                    <TableCell align="right" sx={{ color: '#8BC34A', fontWeight: 'bold' }}>Health</TableCell>
                    <TableCell align="center" sx={{ color: '#8BC34A', fontWeight: 'bold' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {componentData.map((row) => (
                    <TableRow 
                      key={row.id}
                      onClick={() => handleComponentClick(row.id)}
                      sx={{ 
                        cursor: 'pointer',
                        backgroundColor: selectedComponent === row.id ? 'rgba(139, 195, 74, 0.2)' : 'transparent',
                        '&:hover': { backgroundColor: 'rgba(139, 195, 74, 0.1)' }
                      }}
                    >
                      <TableCell sx={{ color: '#FFFFFF' }}>{row.component}</TableCell>
                      <TableCell align="right" sx={{ color: '#FFFFFF' }}>{row.temperature.toFixed(1)}</TableCell>
                      <TableCell align="right" sx={{ color: '#FFFFFF' }}>
                        {row.pressure > 0 ? `${row.pressure.toFixed(2)} bar` : 'N/A'}
                      </TableCell>
                      <TableCell align="right" sx={{ color: '#FFFFFF' }}>{row.health}%</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={row.status}
                          size="small"
                          color={row.status === 'Normal' ? 'success' : 'warning'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Model Statistics */}
          <Paper elevation={3} sx={{ p: 2, mt: 3, backgroundColor: '#1a1a1a', border: '1px solid #8BC34A' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#8BC34A' }}>
              Model Statistics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card sx={{ backgroundColor: '#2a2a2a', p: 1 }}>
                  <Typography variant="caption" sx={{ color: '#8BC34A' }}>Total Vertices</Typography>
                  <Typography variant="h6" sx={{ color: '#FFFFFF' }}>
                    {modelMeshData.totalVertices.toLocaleString()}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card sx={{ backgroundColor: '#2a2a2a', p: 1 }}>
                  <Typography variant="caption" sx={{ color: '#8BC34A' }}>Total Faces</Typography>
                  <Typography variant="h6" sx={{ color: '#FFFFFF' }}>
                    {modelMeshData.totalFaces.toLocaleString()}
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card sx={{ backgroundColor: '#2a2a2a', p: 1 }}>
                  <Typography variant="caption" sx={{ color: '#8BC34A' }}>File Size</Typography>
                  <Typography variant="h6" sx={{ color: '#FFFFFF' }}>{modelMeshData.fileSize}</Typography>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card sx={{ backgroundColor: '#2a2a2a', p: 1 }}>
                  <Typography variant="caption" sx={{ color: '#8BC34A' }}>Format</Typography>
                  <Typography variant="h6" sx={{ color: '#FFFFFF' }}>{modelMeshData.format}</Typography>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Additional Data Visualization */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Temperature Heat Map Visualization */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, backgroundColor: '#1a1a1a', border: '1px solid #8BC34A' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#8BC34A' }}>
              Temperature Distribution (3D Heat Map)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="X Position" 
                  stroke="#8BC34A"
                  domain={[-3, 3]}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Y Position" 
                  stroke="#8BC34A"
                  domain={[-3, 3]}
                />
                <ZAxis 
                  type="number" 
                  dataKey="temperature" 
                  name="Temperature" 
                  range={[50, 400]}
                />
                <RechartsTooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ 
                    backgroundColor: '#1a1a1a', 
                    border: '1px solid #8BC34A',
                    color: '#FFFFFF'
                  }}
                />
                <Scatter 
                  name="Temperature Points" 
                  data={heatMapData} 
                  fill="#FF5722"
                  fillOpacity={0.6}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Component Health Overview */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, backgroundColor: '#1a1a1a', border: '1px solid #8BC34A' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#8BC34A' }}>
              Component Health Overview
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#8BC34A', fontWeight: 'bold' }}>Component</TableCell>
                    <TableCell align="right" sx={{ color: '#8BC34A', fontWeight: 'bold' }}>Efficiency</TableCell>
                    <TableCell align="right" sx={{ color: '#8BC34A', fontWeight: 'bold' }}>Material</TableCell>
                    <TableCell align="right" sx={{ color: '#8BC34A', fontWeight: 'bold' }}>Vertices</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {componentData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell sx={{ color: '#FFFFFF' }}>{row.component}</TableCell>
                      <TableCell align="right" sx={{ color: '#FFFFFF' }}>{row.efficiency}%</TableCell>
                      <TableCell align="right" sx={{ color: '#FFFFFF', fontSize: '0.75rem' }}>
                        {row.material}
                      </TableCell>
                      <TableCell align="right" sx={{ color: '#FFFFFF' }}>
                        {row.vertices.toLocaleString()}
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

export default ThreeDAnalysis;