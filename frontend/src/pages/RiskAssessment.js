import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Alert,
  LinearProgress, List, ListItem, ListItemIcon, ListItemText,
  Chip, Paper, CircularProgress as MuiSpinner,
} from '@mui/material';
import { Warning, Error, CheckCircle, TrendingUp, Schedule, Person } from '@mui/icons-material';
import { analyticsAPI } from '../services/api';

const RiskAssessment = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    analyticsAPI.getRiskAssessment()
      .then(setData)
      .catch(() => setError('Failed to load risk data.'))
      .finally(() => setLoading(false));
  }, []);

  const getPriorityColor = (level) => {
    if (level === 'High') return 'error';
    if (level === 'Medium') return 'warning';
    return 'success';
  };

  const iconMap = { High: <Warning />, Medium: <Schedule />, Low: <CheckCircle /> };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <MuiSpinner />
    </Box>
  );

  return (
    <Box component="main" sx={{ ml: '-200px', mt: '6px', p: 2, minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>Risk Assessment</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {/* Overall Risk Score */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>Overall Risk Score</Typography>
              <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                <Box sx={{
                  width: 120, height: 120, borderRadius: '50%',
                  background: `conic-gradient(#f44336 0deg ${Math.round((data?.overallRiskScore ?? 0) * 3.6)}deg, #e0e0e0 ${Math.round((data?.overallRiskScore ?? 0) * 3.6)}deg 360deg)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Box sx={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: 'background.paper', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{data?.overallRiskScore ?? '--'}</Typography>
                  </Box>
                </Box>
              </Box>
              <Typography variant="h6"
                color={data?.overallRiskLevel === 'High' ? 'error.main' : data?.overallRiskLevel === 'Medium' ? 'warning.main' : 'success.main'}
                sx={{ fontWeight: 'bold' }}>
                {data?.overallRiskLevel ?? '--'} Risk
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Alerts */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Active Risk Alerts</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {data?.alerts?.length ? data.alerts.map((a, i) => (
                  <Alert key={i} severity={a.severity}>{a.message}</Alert>
                )) : (
                  <Alert severity="success">No active risk alerts — posture looks good!</Alert>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Risk Factors */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Risk Factor Analysis</Typography>
              <Grid container spacing={2}>
                {(data?.factors ?? []).map((factor, i) => (
                  <Grid item xs={12} md={6} key={i}>
                    <Paper sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1">{factor.factor}</Typography>
                        <Chip label={factor.level} color={getPriorityColor(factor.level)} size="small" />
                      </Box>
                      <LinearProgress variant="determinate" value={factor.score} color={getPriorityColor(factor.level)} sx={{ height: 8, borderRadius: 4 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Risk Score: {factor.score}/100</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Recommendations */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Personalized Recommendations</Typography>
              <List>
                {(data?.factors ?? []).map((f, i) => (
                  <ListItem key={i} sx={{ bgcolor: 'action.hover', mb: 1, borderRadius: 2 }}>
                    <ListItemIcon sx={{ color: `${getPriorityColor(f.level)}.main` }}>
                      {iconMap[f.level] || <TrendingUp />}
                    </ListItemIcon>
                    <ListItemText
                      primary={`Address: ${f.factor}`}
                      secondary={`Current risk level: ${f.level}`}
                    />
                    <Chip label={f.level} color={getPriorityColor(f.level)} size="small" variant="outlined" />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RiskAssessment;
