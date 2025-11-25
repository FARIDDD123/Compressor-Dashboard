// src/components/3d/GasTurbineViewer.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Box, IconButton, Tooltip, Paper, Typography, Slider } from '@mui/material';
import {
  PlayArrow, Pause, RotateLeft, ZoomIn, ZoomOut, Fullscreen,
  CameraAlt, ThreeDRotation, Refresh
} from '@mui/icons-material';

const GasTurbineViewer = ({ onComponentSelect, selectedComponent }) => {
  const canvasRef = useRef(null);
  const [isRotating, setIsRotating] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotationSpeed, setRotationSpeed] = useState(0.5);
  const animationRef = useRef(null);

  // Gas turbine components with positions (normalized 0-1)
  const components = [
    { id: 'inlet', name: 'Inlet Guide Vanes', x: 0.15, y: 0.5, color: '#2196F3' },
    { id: 'comp1', name: 'Compressor Stage 1', x: 0.25, y: 0.5, color: '#4CAF50' },
    { id: 'comp2', name: 'Compressor Stage 2', x: 0.35, y: 0.5, color: '#FF9800' },
    { id: 'combustion', name: 'Combustion Chamber', x: 0.5, y: 0.5, color: '#F44336' },
    { id: 'turbine1', name: 'Turbine Stage 1', x: 0.65, y: 0.5, color: '#9C27B0' },
    { id: 'turbine2', name: 'Turbine Stage 2', x: 0.75, y: 0.5, color: '#E91E63' },
    { id: 'exhaust', name: 'Exhaust System', x: 0.85, y: 0.5, color: '#00BCD4' },
  ];

  // Draw the gas turbine rotor
  const drawTurbine = (ctx, width, height, rot, z) => {
    ctx.clearRect(0, 0, width, height);
    
    // Apply transformations
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(z, z);
    ctx.rotate((rot.z * Math.PI) / 180);
    ctx.translate(-width / 2, -height / 2);

    // Background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#1a1a1a');
    gradient.addColorStop(1, '#2a2a2a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Main shaft (central axis)
    const shaftGradient = ctx.createLinearGradient(width * 0.1, 0, width * 0.1, height);
    shaftGradient.addColorStop(0, '#555');
    shaftGradient.addColorStop(0.5, '#888');
    shaftGradient.addColorStop(1, '#555');
    ctx.fillStyle = shaftGradient;
    ctx.fillRect(width * 0.1, height * 0.45, width * 0.8, height * 0.1);

    // Draw compressor section (left side - multiple blade stages)
    const compressorStages = 8;
    for (let i = 0; i < compressorStages; i++) {
      const x = width * (0.15 + i * 0.04);
      const bladeCount = 12 + i * 2;
      const radius = height * (0.35 - i * 0.02);
      
      drawBladeStage(ctx, x, height / 2, radius, bladeCount, '#4CAF50', rotation.y + i * 10);
    }

    // Draw combustion chamber (middle)
    const combustionX = width * 0.5;
    const combustionRadius = height * 0.25;
    const combustionGradient = ctx.createRadialGradient(
      combustionX, height / 2, combustionRadius * 0.3,
      combustionX, height / 2, combustionRadius
    );
    combustionGradient.addColorStop(0, '#FF6B35');
    combustionGradient.addColorStop(0.5, '#F44336');
    combustionGradient.addColorStop(1, '#D32F2F');
    ctx.fillStyle = combustionGradient;
    ctx.beginPath();
    ctx.ellipse(combustionX, height / 2, combustionRadius, combustionRadius * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw turbine section (right side - larger blades, fewer stages)
    const turbineStages = 5;
    for (let i = 0; i < turbineStages; i++) {
      const x = width * (0.6 + i * 0.06);
      const bladeCount = 8 + i;
      const radius = height * (0.30 - i * 0.03);
      
      drawBladeStage(ctx, x, height / 2, radius, bladeCount, '#9C27B0', rotation.y - i * 15);
    }

    // Draw exhaust (right end)
    const exhaustGradient = ctx.createLinearGradient(width * 0.85, 0, width * 0.95, 0);
    exhaustGradient.addColorStop(0, '#555');
    exhaustGradient.addColorStop(1, '#888');
    ctx.fillStyle = exhaustGradient;
    ctx.beginPath();
    ctx.moveTo(width * 0.85, height * 0.3);
    ctx.lineTo(width * 0.95, height * 0.35);
    ctx.lineTo(width * 0.95, height * 0.65);
    ctx.lineTo(width * 0.85, height * 0.7);
    ctx.closePath();
    ctx.fill();

    // Draw component hotspots
    components.forEach(comp => {
      const cx = width * comp.x;
      const cy = height * comp.y;
      const isSelected = selectedComponent === comp.id;
      
      ctx.fillStyle = isSelected ? '#FFFFFF' : comp.color;
      ctx.beginPath();
      ctx.arc(cx, cy, isSelected ? 12 : 8, 0, Math.PI * 2);
      ctx.fill();
      
      if (isSelected) {
        ctx.strokeStyle = '#8BC34A';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Draw label
      if (isSelected) {
        ctx.fillStyle = '#8BC34A';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(comp.name, cx + 15, cy - 10);
      }
    });

    ctx.restore();
  };

  // Draw a single blade stage
  const drawBladeStage = (ctx, x, y, radius, bladeCount, color, angleOffset) => {
    ctx.save();
    ctx.translate(x, y);
    
    for (let i = 0; i < bladeCount; i++) {
      const angle = ((i / bladeCount) * Math.PI * 2) + (angleOffset * Math.PI / 180);
      const x1 = Math.cos(angle) * radius * 0.5;
      const y1 = Math.sin(angle) * radius * 0.5;
      const x2 = Math.cos(angle) * radius;
      const y2 = Math.sin(angle) * radius;
      
      const bladeGradient = ctx.createLinearGradient(x1, y1, x2, y2);
      bladeGradient.addColorStop(0, color);
      bladeGradient.addColorStop(1, '#555');
      
      ctx.strokeStyle = bladeGradient;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    
    ctx.restore();
  };

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const animate = () => {
      if (isRotating) {
        setRotation(prev => ({
          ...prev,
          y: prev.y + rotationSpeed
        }));
      }
      
      drawTurbine(ctx, width, height, rotation, zoom);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [rotation, zoom, isRotating, rotationSpeed, selectedComponent]);

  // Handle canvas click for component selection
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Check if click is near a component
    for (const comp of components) {
      const distance = Math.sqrt(
        Math.pow(x - comp.x, 2) + Math.pow(y - comp.y, 2)
      );
      if (distance < 0.05) {
        onComponentSelect(comp.id);
        return;
      }
    }
  };

  const handleReset = () => {
    setRotation({ x: 0, y: 0, z: 0 });
    setZoom(1);
    setIsRotating(false);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={1200}
        height={600}
        onClick={handleCanvasClick}
        style={{
          width: '100%',
          height: '100%',
          cursor: 'pointer',
          borderRadius: '8px'
        }}
      />

      {/* Control Panel Overlay */}
      <Box sx={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 1 }}>
        <Tooltip title={isRotating ? 'Pause Rotation' : 'Start Rotation'}>
          <IconButton
            onClick={() => setIsRotating(!isRotating)}
            sx={{ backgroundColor: 'rgba(139, 195, 74, 0.9)', color: '#FFF', '&:hover': { backgroundColor: 'rgba(139, 195, 74, 1)' } }}
          >
            {isRotating ? <Pause /> : <PlayArrow />}
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Zoom In">
          <IconButton
            onClick={handleZoomIn}
            sx={{ backgroundColor: 'rgba(33, 150, 243, 0.9)', color: '#FFF', '&:hover': { backgroundColor: 'rgba(33, 150, 243, 1)' } }}
          >
            <ZoomIn />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Zoom Out">
          <IconButton
            onClick={handleZoomOut}
            sx={{ backgroundColor: 'rgba(33, 150, 243, 0.9)', color: '#FFF', '&:hover': { backgroundColor: 'rgba(33, 150, 243, 1)' } }}
          >
            <ZoomOut />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Reset View">
          <IconButton
            onClick={handleReset}
            sx={{ backgroundColor: 'rgba(255, 152, 0, 0.9)', color: '#FFF', '&:hover': { backgroundColor: 'rgba(255, 152, 0, 1)' } }}
          >
            <Refresh />
          </IconButton>
        </Tooltip>

        <Tooltip title="3D Rotation">
          <IconButton
            sx={{ backgroundColor: 'rgba(156, 39, 176, 0.9)', color: '#FFF' }}
          >
            <ThreeDRotation />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Rotation Speed Control */}
      <Paper sx={{ 
        position: 'absolute', 
        bottom: 80, 
        left: 20, 
        p: 2, 
        backgroundColor: 'rgba(0,0,0,0.8)',
        minWidth: 200
      }}>
        <Typography variant="caption" sx={{ color: '#8BC34A', display: 'block', mb: 1 }}>
          Rotation Speed
        </Typography>
        <Slider
          value={rotationSpeed}
          onChange={(e, newValue) => setRotationSpeed(newValue)}
          min={0}
          max={3}
          step={0.1}
          sx={{ color: '#8BC34A' }}
        />
        <Typography variant="caption" sx={{ color: '#FFF', textAlign: 'center', display: 'block' }}>
          {rotationSpeed.toFixed(1)}x
        </Typography>
      </Paper>

      {/* Zoom Level Indicator */}
      <Paper sx={{ 
        position: 'absolute', 
        top: 20, 
        right: 20, 
        p: 1, 
        backgroundColor: 'rgba(0,0,0,0.8)'
      }}>
        <Typography variant="caption" sx={{ color: '#8BC34A' }}>
          Zoom: {(zoom * 100).toFixed(0)}%
        </Typography>
      </Paper>

      {/* Instructions */}
      <Paper sx={{ 
        position: 'absolute', 
        top: 20, 
        left: 20, 
        p: 2, 
        backgroundColor: 'rgba(0,0,0,0.8)',
        maxWidth: 300
      }}>
        <Typography variant="caption" sx={{ color: '#8BC34A', display: 'block', mb: 0.5, fontWeight: 'bold' }}>
          Interactive 3D Model
        </Typography>
        <Typography variant="caption" sx={{ color: '#FFF', display: 'block', fontSize: '0.7rem' }}>
          • Click colored dots to select components
        </Typography>
        <Typography variant="caption" sx={{ color: '#FFF', display: 'block', fontSize: '0.7rem' }}>
          • Use controls to zoom and rotate
        </Typography>
        <Typography variant="caption" sx={{ color: '#FFF', display: 'block', fontSize: '0.7rem' }}>
          • Press play for auto-rotation
        </Typography>
      </Paper>
    </Box>
  );
};

export default GasTurbineViewer;

