import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Switch,
  FormControlLabel,
  Box,
  Avatar,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Brightness4,
  Brightness7,
  Notifications,
  AccountCircle,
} from '@mui/icons-material';

const Navbar = ({ darkMode, toggleDarkMode, toggleSidebar }) => {
  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="toggle sidebar"
          onClick={toggleSidebar}
          edge="start"
          sx={{ mr: 1
  , p: 1 }}
        >
          <MenuIcon sx={{ fontSize: 15 }} />
        </IconButton>
        
        <Typography 
          variant="h6" 
          noWrap 
          component="div" 
          sx={{ flexGrow: 1, fontWeight: 600, fontSize: '1rem' }}
        >
          SpineSense
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={toggleDarkMode}
                color="primary"
                size="small"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {darkMode ? (
                  <Brightness7 sx={{ fontSize: 18 }} />
                ) : (
                  <Brightness4 sx={{ fontSize: 18 }} />
                )}
              </Box>
            }
            labelPlacement="start"
          />
          
          <Tooltip title="Notifications">
            <IconButton color="inherit" sx={{ p: 1 }}> {/* Reduced padding */}
              <Badge badgeContent={3} color="error">
                <Notifications sx={{ fontSize: 18 }} /> {/* Smaller icon */}
              </Badge>
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Profile">
            <IconButton color="inherit" sx={{ p: 1 }}> {/* Reduced padding */}
              <Avatar sx={{ width: 28, height: 28 }}> {/* Smaller avatar */}
                <AccountCircle sx={{ fontSize: 20 }} /> {/* Smaller icon */}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;