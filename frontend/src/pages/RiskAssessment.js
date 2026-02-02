import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Paper,
} from '@mui/material';
import {
  Warning,
  Error,
  CheckCircle,
  TrendingUp,
  Schedule,
  Person,
} from '@mui/icons-material';

const RiskAssessment = () => {
  const riskFactors = [
    { factor: 'Prolonged Poor Posture', level: 'High', score: 85, color: 'error' },
    { factor: 'Spinal Deviation', level: 'Medium', score: 60, color: 'warning' },
    { factor: 'Muscle Fatigue', level: 'Low', score: 25, color: 'success' },
    { factor: 'Movement Frequency', level: 'Medium', score: 45, color: 'warning' },
  ];

  const recommendations = [
    { text: 'Take posture breaks every 30 minutes', priority: 'High', icon: <Schedule /> },
    { text: 'Perform neck and shoulder stretches', priority: 'Medium', icon: <Person /> },
    { text: 'Adjust workstation ergonomics', priority: 'High', icon: <Warning /> },
    { text: 'Strengthen core muscles', priority: 'Medium', icon: <TrendingUp /> },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'success';
      default: return 'default';
    }
  };

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
        Risk Assessment
      </Typography>

      <Grid container spacing={3}>
        {/* Overall Risk Score */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Overall Risk Score
              </Typography>
              <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'conic-gradient(#f44336 0deg 126deg, #e0e0e0 126deg 360deg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      backgroundColor: 'background.paper',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      65
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Typography variant="h6" color="error.main" sx={{ fontWeight: 'bold' }}>
                Moderate Risk
              </Typography>
              <Typography color="text.secondary">
                Requires attention and corrective measures
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Risk Alerts */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Risk Alerts
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Alert severity="error" icon={<Error />}>
                  Poor posture detected for 2+ hours continuously
                </Alert>
                <Alert severity="warning" icon={<Warning />}>
                  Spinal angle exceeding safe threshold (25°)
                </Alert>
                <Alert severity="info" icon={<CheckCircle />}>
                  Movement frequency below recommended level
                </Alert>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Risk Factors */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Risk Factor Analysis
              </Typography>
              <Grid container spacing={2}>
                {riskFactors.map((factor, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Paper sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1">{factor.factor}</Typography>
                        <Chip
                          label={factor.level}
                          color={factor.color}
                          size="small"
                        />
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={factor.score}
                        color={factor.color}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Risk Score: {factor.score}/100
                      </Typography>
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
              <Typography variant="h6" gutterBottom>
                Personalized Recommendations
              </Typography>
              <List>
                {recommendations.map((rec, index) => (
                  <ListItem key={index} sx={{ bgcolor: 'action.hover', mb: 1, borderRadius: 2 }}>
                    <ListItemIcon sx={{ color: `${getPriorityColor(rec.priority)}.main` }}>
                      {rec.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={rec.text}
                      secondary={`Priority: ${rec.priority}`}
                    />
                    <Chip
                      label={rec.priority}
                      color={getPriorityColor(rec.priority)}
                      size="small"
                      variant="outlined"
                    />
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