import React, { useState } from 'react';
import {
  Box, Card, CardContent, TextField, Button,
  Typography, Alert, CircularProgress, Link,
} from '@mui/material';
import { MonitorHeart } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err?.error || err?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', backgroundColor: 'background.default', p: 2,
    }}>
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <MonitorHeart sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>SpineSense</Typography>
            <Typography variant="body2" color="text.secondary">Create your account</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Full Name" name="name"
              value={form.name} onChange={handleChange}
              required fullWidth size="small"
            />
            <TextField
              label="Email" name="email" type="email"
              value={form.email} onChange={handleChange}
              required fullWidth size="small"
            />
            <TextField
              label="Password" name="password" type="password"
              value={form.password} onChange={handleChange}
              required fullWidth size="small"
              helperText="Minimum 6 characters"
            />
            <TextField
              label="Confirm Password" name="confirm" type="password"
              value={form.confirm} onChange={handleChange}
              required fullWidth size="small"
            />
            <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ mt: 1 }}>
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Create Account'}
            </Button>
          </Box>

          <Typography variant="body2" sx={{ textAlign: 'center', mt: 3 }}>
            Already have an account?{' '}
            <Link href="/login" underline="hover" sx={{ fontWeight: 600 }}>Sign In</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;
