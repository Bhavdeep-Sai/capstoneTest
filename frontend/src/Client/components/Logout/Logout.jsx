import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { CircularProgress, Box, Typography } from '@mui/material';

const Logout = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [logoutStatus, setLogoutStatus] = useState('logging_out');

  useEffect(() => {
    const performLogout = async () => {
      try {
        setLogoutStatus('logging_out');
        
        // Add a small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        logout();
        setLogoutStatus('success');
        
        // Navigate after successful logout
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 500);
        
      } catch (error) {
        console.error('Logout error:', error);
        setLogoutStatus('error');
        
        // Still navigate to login even if there's an error
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      }
    };

    performLogout();
  }, [logout, navigate]);

  const renderContent = () => {
    switch (logoutStatus) {
      case 'logging_out':
        return (
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <CircularProgress size={40} sx={{ color: '#FF9800' }} />
            <Typography variant="h6" color="white">
              Logging out...
            </Typography>
          </Box>
        );
      case 'success':
        return (
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <Typography variant="h6" color="green">
              ✓ Logged out successfully
            </Typography>
            <Typography variant="body2" color="gray">
              Redirecting to login...
            </Typography>
          </Box>
        );
      case 'error':
        return (
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <Typography variant="h6" color="red">
              ⚠ Logout completed with warnings
            </Typography>
            <Typography variant="body2" color="gray">
              Redirecting to login...
            </Typography>
          </Box>
        );
      default:
        return (
          <Typography variant="h6" color="white">
            Logout
          </Typography>
        );
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#121212',
        padding: 2
      }}
    >
      <Box
        sx={{
          backgroundColor: '#1E1E2E',
          padding: 4,
          borderRadius: 2,
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
          textAlign: 'center',
          minWidth: '300px'
        }}
      >
        {renderContent()}
      </Box>
    </Box>
  );
};

export default Logout;