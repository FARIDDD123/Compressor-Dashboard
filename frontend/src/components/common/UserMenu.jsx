// src/components/common/UserMenu.jsx

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
} from '@mui/material';
import {
  AccountCircle,
  Logout,
  Settings,
  Person,
} from '@mui/icons-material';
import { logoutUser } from '../../features/auth/authSlice';

const UserMenu = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await dispatch(logoutUser());
    navigate('/login');
  };

  if (!user) return null;

  return (
    <>
      <IconButton
        onClick={handleMenuOpen}
        size="large"
        edge="end"
        color="inherit"
        aria-label="user menu"
        aria-controls="user-menu"
        aria-haspopup="true"
      >
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
          {user.username?.[0]?.toUpperCase() || 'U'}
        </Avatar>
      </IconButton>

      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            {user.username}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user.email}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block',
              mt: 0.5,
              px: 1,
              py: 0.25,
              bgcolor: 'primary.main',
              color: 'white',
              borderRadius: 1,
              width: 'fit-content',
            }}
          >
            {user.role?.toUpperCase()}
          </Typography>
        </Box>

        <Divider />

        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>
            <Typography color="error">Logout</Typography>
          </ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserMenu;

