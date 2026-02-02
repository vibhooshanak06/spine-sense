import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import {
  Notifications,
  Bluetooth,
  Security,
  Person,
  Schedule,
  Vibration,
  VolumeUp,
} from '@mui/icons-material';

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    soundAlerts: true,
    vibrationAlerts: false,
    postureReminders: true,
    reminderInterval: 30,
    riskThreshold: 70,
    autoCalibration: true,
    dataSharing: false,
    darkMode: false,
    language: 'en',
  });

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value,
    }));
  };

  const SettingCard = ({ title, children }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
          {title}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {children}
      </CardContent>
    </Card>
  );

  return (
    <Box
       component="main"
       sx={{
         ml: '-200px',   // 👈 move page LEFT (adjust value)
         mt: '6px',    // navbar height
         p: 2,          // slightly tighter padding
         minHeight: '100vh',
         backgroundColor: 'background.default',
       }}
     >
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
        Settings
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          {/* Notification Settings */}
          <SettingCard title="Notification Settings">
            <List>
              <ListItem>
                <ListItemIcon>
                  <Notifications color="primary" />
                </ListItemIcon>
                <ListItemText primary="Push Notifications" secondary="Receive posture alerts" />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications}
                      onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                    />
                  }
                  label=""
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <VolumeUp color="primary" />
                </ListItemIcon>
                <ListItemText primary="Sound Alerts" secondary="Audio notifications for posture issues" />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.soundAlerts}
                      onChange={(e) => handleSettingChange('soundAlerts', e.target.checked)}
                    />
                  }
                  label=""
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <Vibration color="primary" />
                </ListItemIcon>
                <ListItemText primary="Vibration Alerts" secondary="Haptic feedback for wearable devices" />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.vibrationAlerts}
                      onChange={(e) => handleSettingChange('vibrationAlerts', e.target.checked)}
                    />
                  }
                  label=""
                />
              </ListItem>
            </List>
          </SettingCard>

          {/* Monitoring Settings */}
          <SettingCard title="Monitoring Settings">
            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom>Posture Reminder Interval</Typography>
              <Slider
                value={settings.reminderInterval}
                onChange={(e, value) => handleSettingChange('reminderInterval', value)}
                min={15}
                max={120}
                step={15}
                marks={[
                  { value: 15, label: '15min' },
                  { value: 30, label: '30min' },
                  { value: 60, label: '1hr' },
                  { value: 120, label: '2hr' },
                ]}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value} min`}
              />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom>Risk Alert Threshold</Typography>
              <Slider
                value={settings.riskThreshold}
                onChange={(e, value) => handleSettingChange('riskThreshold', value)}
                min={50}
                max={90}
                step={5}
                marks={[
                  { value: 50, label: 'Low' },
                  { value: 70, label: 'Medium' },
                  { value: 90, label: 'High' },
                ]}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}%`}
              />
            </Box>
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoCalibration}
                  onChange={(e) => handleSettingChange('autoCalibration', e.target.checked)}
                />
              }
              label="Auto-calibration of sensors"
            />
          </SettingCard>
        </Grid>

        <Grid item xs={12} md={6}>
          {/* Device Settings */}
          <SettingCard title="Device Settings">
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Connected Devices
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Chip
                  icon={<Bluetooth />}
                  label="Posture Sensor #1"
                  color="success"
                  variant="outlined"
                />
                <Chip
                  icon={<Bluetooth />}
                  label="Posture Sensor #2"
                  color="success"
                  variant="outlined"
                />
              </Box>
            </Box>
            
            <Button variant="outlined" startIcon={<Bluetooth />} sx={{ mb: 2 }}>
              Add New Device
            </Button>
            
            <Button variant="outlined" color="secondary">
              Calibrate Sensors
            </Button>
          </SettingCard>

          {/* Privacy Settings */}
          <SettingCard title="Privacy & Data">
            <List>
              <ListItem>
                <ListItemIcon>
                  <Security color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Data Sharing" 
                  secondary="Share anonymized data for research" 
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.dataSharing}
                      onChange={(e) => handleSettingChange('dataSharing', e.target.checked)}
                    />
                  }
                  label=""
                />
              </ListItem>
            </List>
            
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button variant="outlined" size="small">
                Export Data
              </Button>
              <Button variant="outlined" color="error" size="small">
                Delete Data
              </Button>
            </Box>
          </SettingCard>

          {/* Profile Settings */}
          <SettingCard title="Profile Settings">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Name"
                defaultValue="John Doe"
                variant="outlined"
                size="small"
              />
              
              <TextField
                label="Email"
                defaultValue="john.doe@example.com"
                variant="outlined"
                size="small"
              />
              
              <FormControl size="small">
                <InputLabel>Language</InputLabel>
                <Select
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  label="Language"
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                  <MenuItem value="de">German</MenuItem>
                </Select>
              </FormControl>
              
              <Button variant="contained" sx={{ mt: 2 }}>
                Save Profile
              </Button>
            </Box>
          </SettingCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;