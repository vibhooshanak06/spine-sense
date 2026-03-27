import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, IconButton,
  Switch, FormControlLabel, Box, Avatar, Tooltip, Badge, Menu, MenuItem,
} from '@mui/material';
import { Menu as MenuIcon, Brightness4, Brightness7, Notifications, Logout } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

const Navbar = ({ darkMode, toggleDarkMode, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socket.on('analytics_update', (data) => {
      if (data.risk?.alerts) setAlertCount(data.risk.alerts.length);
    });
    return () => socket.disconnect();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton color="inherit" aria-label="toggle sidebar" onClick={toggleSidebar} edge="start" sx={{ mr: 1, p: 1 }}>
          <MenuIcon sx={{ fontSize: 15 }} />
        </IconButton>

        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600, fontSize: '1rem' }}>
          SpineSense
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <FormControlLabel
            control={<Switch checked={darkMode} onChange={toggleDarkMode} color="primary" size="small" />}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {darkMode ? <Brightness7 sx={{ fontSize: 18 }} /> : <Brightness4 sx={{ fontSize: 18 }} />}
              </Box>
            }
            labelPlacement="start"
          />

          <Tooltip title={alertCount > 0 ? `${alertCount} active alert${alertCount > 1 ? 's' : ''}` : 'No alerts'}>
            <IconButton color="inherit" sx={{ p: 1 }}>
              <Badge badgeContent={alertCount || null} color="error">
                <Notifications sx={{ fontSize: 18 }} />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title={user?.name || 'Profile'}>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
              <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main', fontSize: '0.75rem', fontWeight: 700 }}>
                {initials}
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem disabled sx={{ fontSize: '0.8rem', opacity: 0.7 }}>{user?.email}</MenuItem>
            <MenuItem onClick={handleLogout} sx={{ gap: 1 }}>
              <Logout fontSize="small" /> Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
