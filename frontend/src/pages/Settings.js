import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Switch, FormControlLabel,
  TextField, Button, Divider, List, ListItem, ListItemIcon, ListItemText,
  Slider, Select, MenuItem, FormControl, InputLabel, Chip, Alert, CircularProgress,
} from '@mui/material';
import { Notifications, Bluetooth, Security, Vibration, VolumeUp } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

const Settings = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaved, setProfileSaved] = useState(false);
  const [sensorStatus, setSensorStatus] = useState({ sensor1: null, sensor2: null });

  const [prefs, setPrefs] = useState({
    notifications: true,
    soundAlerts: true,
    vibrationAlerts: false,
    reminderInterval: 30,
    riskThreshold: 70,
    autoCalibration: true,
    dataSharing: false,
    language: 'en',
  });

  useEffect(() => {
    api.get('/auth/me')
      .then(data => setProfile({ name: data.name, email: data.email }))
      .catch(() => {
        if (user) setProfile({ name: user.name, email: user.email });
      })
      .finally(() => setProfileLoading(false));

    // Get live sensor angles to show real device status
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socket.on('posture_update', (entry) => {
      setSensorStatus({
        sensor1: entry?.sensor1?.angle != null ? `${entry.sensor1.angle.toFixed(1)}Â°` : null,
        sensor2: entry?.sensor2?.angle != null ? `${entry.sensor2.angle.toFixed(1)}Â°` : null,
      });
    });
    return () => socket.disconnect();
  }, [user]);

  const handlePrefChange = (key, value) => setPrefs(prev => ({ ...prev, [key]: value }));

  const handleSaveProfile = (e) => {
    e.preventDefault();
    // Profile update endpoint can be added later; for now show success feedback
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const SettingCard = ({ title, children }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>{title}</Typography>
        <Divider sx={{ mb: 2 }} />
        {children}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Settings</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <SettingCard title="Notification Settings">
            <List>
              <ListItem>
                <ListItemIcon><Notifications color="primary" /></ListItemIcon>
                <ListItemText primary="Push Notifications" secondary="Receive posture alerts" />
                <FormControlLabel
                  control={<Switch checked={prefs.notifications} onChange={e => handlePrefChange('notifications', e.target.checked)} />}
                  label=""
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><VolumeUp color="primary" /></ListItemIcon>
                <ListItemText primary="Sound Alerts" secondary="Audio notifications for posture issues" />
                <FormControlLabel
                  control={<Switch checked={prefs.soundAlerts} onChange={e => handlePrefChange('soundAlerts', e.target.checked)} />}
                  label=""
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><Vibration color="primary" /></ListItemIcon>
                <ListItemText primary="Vibration Alerts" secondary="Haptic feedback for wearable devices" />
                <FormControlLabel
                  control={<Switch checked={prefs.vibrationAlerts} onChange={e => handlePrefChange('vibrationAlerts', e.target.checked)} />}
                  label=""
                />
              </ListItem>
            </List>
          </SettingCard>

          <SettingCard title="Monitoring Settings">
            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom>Posture Reminder Interval</Typography>
              <Slider
                value={prefs.reminderInterval}
                onChange={(_, v) => handlePrefChange('reminderInterval', v)}
                min={15} max={120} step={15}
                marks={[{ value: 15, label: '15min' }, { value: 30, label: '30min' }, { value: 60, label: '1hr' }, { value: 120, label: '2hr' }]}
                valueLabelDisplay="auto"
                valueLabelFormat={v => `${v} min`}
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom>Risk Alert Threshold</Typography>
              <Slider
                value={prefs.riskThreshold}
                onChange={(_, v) => handlePrefChange('riskThreshold', v)}
                min={50} max={90} step={5}
                marks={[{ value: 50, label: 'Low' }, { value: 70, label: 'Medium' }, { value: 90, label: 'High' }]}
                valueLabelDisplay="auto"
                valueLabelFormat={v => `${v}%`}
              />
            </Box>
            <FormControlLabel
              control={<Switch checked={prefs.autoCalibration} onChange={e => handlePrefChange('autoCalibration', e.target.checked)} />}
              label="Auto-calibration of sensors"
            />
          </SettingCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <SettingCard title="Device Settings">
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>Connected Sensors</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Chip
                  icon={<Bluetooth />}
                  label={sensorStatus.sensor1 != null ? `Sensor 1 â€” ${sensorStatus.sensor1}` : 'Sensor 1 â€” Waiting...'}
                  color={sensorStatus.sensor1 != null ? 'success' : 'default'}
                  variant="outlined"
                />
                <Chip
                  icon={<Bluetooth />}
                  label={sensorStatus.sensor2 != null ? `Sensor 2 â€” ${sensorStatus.sensor2}` : 'Sensor 2 â€” Waiting...'}
                  color={sensorStatus.sensor2 != null ? 'success' : 'default'}
                  variant="outlined"
                />
              </Box>
            </Box>
            <Button variant="outlined" color="secondary">Calibrate Sensors</Button>
          </SettingCard>

          <SettingCard title="Privacy & Data">
            <List>
              <ListItem>
                <ListItemIcon><Security color="primary" /></ListItemIcon>
                <ListItemText primary="Data Sharing" secondary="Share anonymized data for research" />
                <FormControlLabel
                  control={<Switch checked={prefs.dataSharing} onChange={e => handlePrefChange('dataSharing', e.target.checked)} />}
                  label=""
                />
              </ListItem>
            </List>
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button variant="outlined" size="small">Export Data</Button>
              <Button variant="outlined" color="error" size="small">Delete Data</Button>
            </Box>
          </SettingCard>

          <SettingCard title="Profile Settings">
            {profileLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}><CircularProgress size={24} /></Box>
            ) : (
              <Box component="form" onSubmit={handleSaveProfile} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {profileSaved && <Alert severity="success">Profile saved successfully.</Alert>}
                <TextField
                  label="Name" value={profile.name}
                  onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  variant="outlined" size="small" required
                />
                <TextField
                  label="Email" value={profile.email}
                  onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                  variant="outlined" size="small" type="email" required
                />
                <FormControl size="small">
                  <InputLabel>Language</InputLabel>
                  <Select value={prefs.language} onChange={e => handlePrefChange('language', e.target.value)} label="Language">
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="es">Spanish</MenuItem>
                    <MenuItem value="fr">French</MenuItem>
                    <MenuItem value="de">German</MenuItem>
                  </Select>
                </FormControl>
                <Button type="submit" variant="contained" sx={{ mt: 1 }}>Save Profile</Button>
              </Box>
            )}
          </SettingCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;


