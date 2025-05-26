import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Alert, 
  CircularProgress,
  Paper,
  Container
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { Lock, CheckCircle } from 'lucide-react';

// Create dark theme matching your login page
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FF9800',
    },
    secondary: {
      main: '#FF5722',
    },
    background: {
      default: '#121212',
      paper: '#1E1E2E',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#E0E0E0',
    },
    error: {
      main: '#F44336',
    },
    success: {
      main: '#66BB6A',
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#444444',
            },
            '&:hover fieldset': {
              borderColor: '#FF9800',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#FF9800',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#BBBBBB',
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#FF9800',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          background: 'linear-gradient(45deg, #FF9800 30%, #FF5722 90%)',
          boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
        },
      },
    },
  },
});

// Validation schema
const resetPasswordSchema = Yup.object({
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your password'),
});

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  const [schoolName, setSchoolName] = useState('');

  // Updated API configuration
  const baseApi = import.meta.env.VITE_BASE_API || 'https://capstonetest-gmxh.onrender.com/api';

  // Debug logging
  console.log('Reset Password Component Loaded');
  console.log('Token from URL:', token);
  console.log('Base API URL:', baseApi);
  console.log('Current URL:', window.location.href);

  const formik = useFormik({
    initialValues: {
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: resetPasswordSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError('');
      setSuccess('');

      try {
        console.log('Submitting password reset...');
        const response = await axios.post(`${baseApi}/school/reset-password`, {
          token,
          newPassword: values.newPassword,
        });

        console.log('Password reset response:', response.data);

        if (response.data.success) {
          setSuccess('Password has been reset successfully! Redirecting to login...');
          
          // Redirect to login page after 3 seconds
          setTimeout(() => {
            navigate('/login/school');
          }, 3000);
        }
      } catch (error) {
        console.error('Reset password error:', error);
        console.error('Error response:', error.response);
        setError(
          error.response?.data?.message || 
          'Failed to reset password. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    },
  });

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        console.error('No token provided');
        setError('Invalid reset token - no token provided');
        setVerifying(false);
        return;
      }

      try {
        console.log('Verifying token:', token);
        const response = await axios.get(`${baseApi}/school/verify-reset-token/${token}`);
        
        console.log('Token verification response:', response.data);

        if (response.data.success) {
          setTokenValid(true);
          setSchoolName(response.data.schoolName || '');
          console.log('Token is valid');
        }
      } catch (error) {
        console.error('Token verification error:', error);
        console.error('Error response:', error.response);
        setError(
          error.response?.data?.message || 
          'Invalid or expired reset token'
        );
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token, baseApi]);

  if (verifying) {
    return (
      <ThemeProvider theme={darkTheme}>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <CircularProgress size={40} sx={{ color: '#FF9800' }} />
            <Typography variant="h6" sx={{ mt: 2, color: 'white' }}>
              Verifying reset token...
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color: 'gray' }}>
              Token: {token}
            </Typography>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  if (!tokenValid) {
    return (
      <ThemeProvider theme={darkTheme}>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <Container maxWidth="sm">
            <Paper 
              elevation={10}
              sx={{
                p: 4,
                bgcolor: 'background.paper',
                borderRadius: '12px',
                textAlign: 'center'
              }}
            >
              <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <Typography variant="h5" gutterBottom sx={{ color: 'text.primary' }}>
                Invalid Reset Link
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                {error || 'This password reset link is invalid or has expired.'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, fontFamily: 'monospace' }}>
                Token: {token}
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/login/school')}
                sx={{ mr: 2 }}
              >
                Back to Login
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/login/school')}
                sx={{ color: 'primary.main', borderColor: 'primary.main' }}
              >
                Request New Reset Link
              </Button>
            </Paper>
          </Container>
        </div>
      </ThemeProvider>
    );
  }

  if (success) {
    return (
      <ThemeProvider theme={darkTheme}>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <Container maxWidth="sm">
            <Paper 
              elevation={10}
              sx={{
                p: 4,
                bgcolor: 'background.paper',
                borderRadius: '12px',
                textAlign: 'center'
              }}
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <Typography variant="h5" gutterBottom sx={{ color: 'text.primary' }}>
                Password Reset Successful!
              </Typography>
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
              </Alert>
              <Button
                variant="contained"
                onClick={() => navigate('/login/school')}
              >
                Go to Login
              </Button>
            </Paper>
          </Container>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Container maxWidth="sm">
          <Paper 
            elevation={10}
            sx={{
              p: 4,
              bgcolor: 'background.paper',
              borderRadius: '12px',
            }}
          >
            <div className="text-center mb-6">
              <Lock className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <Typography variant="h4" gutterBottom sx={{ color: 'text.primary' }}>
                Reset Password
              </Typography>
              {schoolName && (
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  for {schoolName}
                </Typography>
              )}
            </div>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={formik.handleSubmit}
              noValidate
            >
              <TextField
                fullWidth
                name="newPassword"
                label="New Password"
                type="password"
                value={formik.values.newPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.newPassword && Boolean(formik.errors.newPassword)}
                helperText={formik.touched.newPassword && formik.errors.newPassword}
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                name="confirmPassword"
                label="Confirm New Password"
                type="password"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                sx={{ mb: 4 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  py: 1.5,
                  textTransform: 'uppercase',
                  fontWeight: 'bold',
                  mb: 2
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Reset Password'}
              </Button>

              <div className="text-center">
                <Button
                  variant="text"
                  onClick={() => navigate('/login/school')}
                  sx={{ color: 'text.secondary' }}
                >
                  Back to Login
                </Button>
              </div>
            </Box>
          </Paper>
        </Container>
      </div>
    </ThemeProvider>
  );
};

export default ResetPassword;