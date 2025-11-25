// src/layouts/MainLayout.jsx

import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, CssBaseline, IconButton, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

// Import Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import TimelineIcon from '@mui/icons-material/Timeline';
import OnlinePredictionIcon from '@mui/icons-material/OnlinePrediction';
import BuildIcon from '@mui/icons-material/Build';
import companyLogo from '../assets/images/logo.png';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SettingsIcon from '@mui/icons-material/Settings';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import BarChartIcon from '@mui/icons-material/BarChart';

// Import UserMenu
import UserMenu from '../components/common/UserMenu';

const drawerWidth = 240;

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Overview', icon: <DashboardIcon />, path: '/' },
    { text: 'Real-Time Monitoring', icon: <TimelineIcon />, path: '/monitoring' },
    { text: 'Alarms', icon: <NotificationsActiveIcon />, path: '/alarms' },
    { text: 'Optimization', icon: <OnlinePredictionIcon />, path: '/optimization' },
    { text: 'Graph Analysis', icon: <BarChartIcon />, path: '/graph-analysis' },
    { text: 'Checklist', icon: <CheckBoxIcon />, path: '/checklist' },
    { text: '3D Analysis', icon: <BubbleChartIcon />, path: '/3d-analysis' },
    { text: 'Control', icon: <SettingsIcon />, path: '/control' },
    { text: 'Maintenance', icon: <BuildIcon />, path: '/maintenance' },
  ];

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const drawer = (
    <>
      <a 
        href="http://petropala.com/" 
        target="_blank" 
        rel="noopener noreferrer" 
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <img src={companyLogo} alt="Company Logo" style={{ height: 40 }} />
          <Typography variant="h6" component="div">
            Petro Pala
          </Typography>
        </Box>
      </a>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              component={NavLink} 
              to={item.path}
              onClick={isMobile ? handleDrawerToggle : undefined}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Compressor Monitoring Dashboard
          </Typography>
          <UserMenu />
        </Toolbar>
      </AppBar>
      
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
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
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        anchor="left"
      >
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: { xs: 2, sm: 3 },
          mt: '64px',
          width: { md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;