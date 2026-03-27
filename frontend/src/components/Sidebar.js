import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Divider, Box, Typography, Avatar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon, Analytics as AnalyticsIcon,
  Warning as WarningIcon, FitnessCenter as RehabIcon,
  Settings as SettingsIcon, MonitorHeart,
} from '@mui/icons-material';

const drawerWidth = 200;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Posture Analysis', icon: <AnalyticsIcon />, path: '/analysis' },
  { text: 'Risk Assessment', icon: <WarningIcon />, path: '/risk' },
  { text: 'Rehabilitation', icon: <RehabIcon />, path: '/rehabilitation' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

const Sidebar = ({ open }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', mt: 6 },
      }}
    >
      <Box sx={{ p: 1.5, textAlign: 'center' }}>
        <Avatar sx={{ width: 48, height: 48, mx: 'auto', mb: 1.5, bgcolor: 'primary.main' }}>
          <MonitorHeart sx={{ fontSize: 24 }} />
        </Avatar>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>SpineSense</Typography>
        <Typography variant="body2" color="text.secondary">Posture Monitoring</Typography>
      </Box>

      <Divider />

      <List sx={{ px: 1.5, py: 0.5 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': { backgroundColor: 'primary.dark' },
                  '& .MuiListItemIcon-root': { color: 'white' },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{ fontWeight: location.pathname === item.path ? 600 : 400 }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
