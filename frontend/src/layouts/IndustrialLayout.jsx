/**
 * Industrial Layout Component
 * Sidebar-based layout inspired by Turbin Generator Dashboard
 */

import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Checklist as ChecklistIcon,
  Alarm as AlarmIcon,
  Settings as ControlIcon,
  ShowChart as GraphIcon,
  ThreeDRotation as ThreeDIcon,
  Timer as TimerIcon,
  Description as ReportIcon,
  Link as ConnectionIcon,
  Storage as DataLoggerIcon,
  Folder as DatabaseIcon,
  Security as CSMIcon,
  Thermostat as ThermoIcon,
  PrecisionManufacturing as PDMIcon,
  Videocam as DVRIcon,
  ExpandLess,
  ExpandMore,
  Menu as MenuIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../features/auth/authSlice';

const DRAWER_WIDTH = 200;

// Menu Structure based on the images
const menuItems = [
  { id: 'display', label: 'Display', icon: <DashboardIcon />, path: '/dashboard' },
  { id: 'checklist', label: 'Check List', icon: <ChecklistIcon />, path: '/checklist' },
  { id: 'alarm', label: 'Alarm Systems', icon: <AlarmIcon />, path: '/alarms' },
  { id: 'control', label: 'Control', icon: <ControlIcon />, path: '/control' },
  { id: 'graph', label: 'Graph_Analysis', icon: <GraphIcon />, path: '/graph-analysis' },
  { id: '3d', label: '3D_Analysis_OP', icon: <ThreeDIcon />, path: '/3d-analysis' },
  { id: 'realtime', label: 'REAL_TIME_OP', icon: <TimerIcon />, path: '/real-time-op' },
  { id: 'reporting', label: 'Reporting', icon: <ReportIcon />, path: '/reporting' },
  { id: 'connection', label: 'Connection', icon: <ConnectionIcon />, path: '/connection' },
  { id: 'dataloggers', label: 'Data Loggers', icon: <DataLoggerIcon />, path: '/data-loggers' },
  { id: 'databases', label: 'Databases', icon: <DatabaseIcon />, path: '/databases' },
  { id: 'csm', label: 'CSM', icon: <CSMIcon />, path: '/csm' },
  { id: 'thermo', label: 'ThermoVision', icon: <ThermoIcon />, path: '/thermo-vision' },
  { id: 'pdm', label: 'PDM', icon: <PDMIcon />, path: '/pdm' },
  { id: 'dvr', label: 'DVR', icon: <DVRIcon />, path: '/dvr' },
];

const IndustrialLayout = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});
  
  const user = useSelector((state) => state.auth.user);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo/Header */}
      <Box
        sx={{
          p: 2,
          backgroundColor: theme.palette.background.sidebarActive,
          borderBottom: '2px solid rgba(0,0,0,0.3)',
        }}
      >
        <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 700, textAlign: 'center' }}>
          TURBIN
        </Typography>
        <Typography variant="caption" sx={{ color: '#E0E0E0', display: 'block', textAlign: 'center' }}>
          Generator
        </Typography>
      </Box>

      {/* Menu Items */}
      <List sx={{ flex: 1, py: 1, overflowY: 'auto' }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.id}
            selected={location.pathname === item.path}
            onClick={() => handleNavigate(item.path)}
            sx={{
              py: 1.2,
              px: 2,
              my: 0.3,
              mx: 0.5,
              borderRadius: '4px',
              '&.Mui-selected': {
                backgroundColor: theme.palette.background.sidebarActive,
                borderLeft: '4px solid #FFEB3B',
              },
            }}
          >
            <ListItemIcon sx={{ color: '#FFFFFF', minWidth: 36 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontSize: '0.875rem',
                fontWeight: location.pathname === item.path ? 600 : 400,
                color: '#FFFFFF',
              }}
            />
          </ListItemButton>
        ))}
      </List>

      {/* User Info & Logout */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid rgba(0,0,0,0.3)',
          backgroundColor: theme.palette.background.sidebarActive,
        }}
      >
        <Typography variant="caption" sx={{ color: '#E0E0E0', display: 'block' }}>
          Logged in as:
        </Typography>
        <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600, mb: 1 }}>
          {user?.username || 'User'}
        </Typography>
        <IconButton
          onClick={handleLogout}
          size="small"
          sx={{
            color: '#FFFFFF',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
          }}
        >
          <LogoutIcon fontSize="small" />
          <Typography variant="caption" sx={{ ml: 1 }}>
            Logout
          </Typography>
        </IconButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#000000' }}>
      {/* App Bar for Mobile */}
      {isMobile && (
        <AppBar
          position="fixed"
          sx={{
            width: '100%',
            zIndex: theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              Gas Turbine Monitoring
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Sidebar Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          height: '100vh',
          overflow: 'auto',
          backgroundColor: '#000000',
          mt: { xs: 7, md: 0 },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default IndustrialLayout;

