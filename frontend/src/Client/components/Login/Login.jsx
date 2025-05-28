import * as React from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { useFormik } from 'formik';
import { Button, Typography, Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import BookIcon from '@mui/icons-material/MenuBook';
import { School, Users, GraduationCap } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { loginSchema } from '../../../yupSchema/loginSchema';
import { AuthContext } from '../../../context/AuthContext';
import { baseApi } from '../../../environment';

// Create a custom dark theme with orange/yellow/red accents
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FF9800', // Orange
    },
    secondary: {
      main: '#FF5722', // Deep Orange
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
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 600,
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
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
          background: 'linear-gradient(45deg, #FF9800 30%, #FF5722 100%)',
          boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
        },
      },
    },
  },
});

export default function Login() {
  const { login } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const { role } = useParams(); // Get role from URL params
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [success, setSuccess] = React.useState(null);
  const [rememberMe, setRememberMe] = React.useState(false);
  const [oauthLoading, setOauthLoading] = React.useState(false);

  // Forgot Password states
  const [forgotPasswordOpen, setForgotPasswordOpen] = React.useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = React.useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = React.useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = React.useState('');
  const [forgotPasswordError, setForgotPasswordError] = React.useState('');

  const initialValues = {
    email: "",
    password: "",
  };

  // Role configuration
  const roleConfig = {
    school: {
      title: 'School Admin',
      icon: <School className="w-12 h-12 text-orange-500" />,
      color: 'from-orange-500 to-red-500',
      description: 'Administrative Dashboard'
    },
    teacher: {
      title: 'Teacher',
      icon: <Users className="w-12 h-12 text-blue-500" />,
      color: 'from-blue-500 to-indigo-500',
      description: 'Teaching Dashboard'
    },
    student: {
      title: 'Student',
      icon: <GraduationCap className="w-12 h-12 text-green-500" />,
      color: 'from-green-500 to-teal-500',
      description: 'Student Portal'
    }
  };

  // Initialize formik with default values
  const formik = useFormik({
    initialValues,
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      // If no role is specified, redirect to role selection
      if (!role || !roleConfig[role]) {
        navigate('/select-role');
        return;
      }

      setLoading(true);
      setError(null);

      let URL;
      if (role === "student") {
        URL = `${baseApi}/student/login`
      } else if (role === "teacher") {
        URL = `${baseApi}/teacher/login`
      } else if (role === 'school') {
        URL = `${baseApi}/school/login`
      }

      try {
        const response = await axios.post(
          URL,
          {
            email: values.email,
            password: values.password
          }
        );

        // Handle remember me functionality (role-specific)
        if (rememberMe) {
          localStorage.setItem(`rememberedEmail_${role}`, values.email);
          localStorage.setItem(`rememberedPassword_${role}`, values.password);
          localStorage.setItem(`rememberMe_${role}`, 'true');
        } else {
          // Clear remembered credentials for this role
          localStorage.removeItem(`rememberedEmail_${role}`);
          localStorage.removeItem(`rememberedPassword_${role}`);
          localStorage.removeItem(`rememberMe_${role}`);
        }

        // Store token in localStorage
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);

          // Store user data if needed
          if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
            login({
              token: response.data.token,
              user: response.data.user
            });
          }
        }

        setSuccess("Login successful!");

        // Handle successful login (redirect to dashboard)
        setTimeout(() => {
          navigate(`/${role}`);
        }, 1000);
      } catch (error) {
        console.error("Login error:", error);
        setError(
          error.response?.data?.message ||
          "Invalid email or password"
        );
      } finally {
        setLoading(false);
      }
    }
  });

  // Redirect if no role or invalid role
  React.useEffect(() => {
    if (!role || !roleConfig[role]) {
      navigate('/select-role');
      return;
    }
  }, [role, navigate]);

  // Load remembered credentials on component mount (role-specific)
  React.useEffect(() => {
    if (role && roleConfig[role]) {
      const rememberedEmail = localStorage.getItem(`rememberedEmail_${role}`);
      const rememberedPassword = localStorage.getItem(`rememberedPassword_${role}`);
      const isRemembered = localStorage.getItem(`rememberMe_${role}`) === 'true';

      if (isRemembered && rememberedEmail) {
        formik.setFieldValue('email', rememberedEmail);
        if (rememberedPassword) {
          formik.setFieldValue('password', rememberedPassword);
        }
        setRememberMe(true);
      }
    }
  }, [role]);

  const handleRememberMeChange = () => {
    setRememberMe(!rememberMe);
  };

  // Forgot Password Handler
  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      setForgotPasswordError('Please enter your email address');
      setForgotPasswordMessage('');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotPasswordEmail)) {
      setForgotPasswordError('Please enter a valid email address');
      setForgotPasswordMessage('');
      return;
    }

    setForgotPasswordLoading(true);
    setForgotPasswordMessage('');
    setForgotPasswordError('');

    try {
      const response = await axios.post(`${baseApi}/school/forgot-password`, {
        email: forgotPasswordEmail
      });

      setForgotPasswordMessage(response.data.message || 'Password reset link sent to your email');
      setForgotPasswordError('');

      // Clear the email field and close dialog after successful request
      setTimeout(() => {
        setForgotPasswordEmail('');
        setForgotPasswordOpen(false);
        setForgotPasswordMessage('');
        setForgotPasswordError('');
      }, 3000);

    } catch (error) {
      console.error("Forgot password error:", error);
      setForgotPasswordError(
        error.response?.data?.message ||
        'Failed to send reset email. Please try again.'
      );
      setForgotPasswordMessage('');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  // Open forgot password dialog and pre-fill email if available
  const openForgotPasswordDialog = () => {
    setForgotPasswordEmail(formik.values.email || '');
    setForgotPasswordMessage('');
    setForgotPasswordError('');
    setForgotPasswordOpen(true);
  };

  // Google OAuth login
  const handleGoogleLogin = async (e) => {
    e.preventDefault();

    if (role !== 'school') {
      setError('OAuth login is currently only available for School Admin accounts');
      return;
    }

    setOauthLoading(true);
    setError(null);

    try {
      // Initialize Google OAuth
      if (window.google && window.google.accounts) {
        window.google.accounts.oauth2.initTokenClient({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
          scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
          callback: async (response) => {
            try {
              if (response.access_token) {
                // First, try to get user info to check if account exists
                const userInfoResponse = await axios.get(
                  `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${response.access_token}`
                );

                const userEmail = userInfoResponse.data.email;

                // Try OAuth login first
                try {
                  const loginResponse = await axios.post(`${baseApi}/school/login/oauth`, {
                    email: userEmail,
                    provider: 'google'
                  });

                  if (loginResponse.data.token) {
                    localStorage.setItem('token', loginResponse.data.token);
                    localStorage.setItem('user', JSON.stringify(loginResponse.data.user));

                    login({
                      token: loginResponse.data.token,
                      user: loginResponse.data.user
                    });

                    setSuccess("Google login successful!");
                    setTimeout(() => {
                      navigate('/school');
                    }, 1000);
                  }
                } catch (loginError) {
                  // If login fails, it means account doesn't exist - redirect to registration
                  if (loginError.response?.status === 404) {
                    setError("No account found with this Google email. Please register first.");
                    setTimeout(() => {
                      navigate('/register', {
                        state: {
                          googleToken: response.access_token,
                          userInfo: userInfoResponse.data
                        }
                      });
                    }, 2000);
                  } else {
                    throw loginError;
                  }
                }
              }
            } catch (error) {
              console.error("Google OAuth error:", error);
              setError("Google login failed. Please try again.");
            } finally {
              setOauthLoading(false);
            }
          }
        }).requestAccessToken();
      } else {
        setError("Google login is not available. Please use email/password login.");
        setOauthLoading(false);
      }
    } catch (error) {
      console.error("Google OAuth initialization error:", error);
      setError("Google login initialization failed");
      setOauthLoading(false);
    }
  };

  // Load Google OAuth script
  React.useEffect(() => {
    const loadGoogleScript = () => {
      if (!window.google) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
    };

    loadGoogleScript();
  }, []);

  // Return loading if role is invalid (will redirect)
  if (!role || !roleConfig[role]) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Redirecting...</div>
      </div>
    );
  }

  const currentRole = roleConfig[role];

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="min-h-screen bg-gray-900 flex items-center justify-center py-5 px-4 sm:px-6 lg:px-8">
        <Box
          component="form"
          sx={{
            '& > :not(style)': { m: 1 },
            display: "flex",
            flexDirection: "column",
            margin: "50px",
            justifyContent: "center",
            width: "80vw",
            minWidth: '320px',
            maxWidth: '500px',
            borderRadius: { xs: '5px', lg: '12px' },
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
            bgcolor: 'background.paper',
          }}
          className="bg-gray-800 p-2 lg:p-8 border border-gray-700"
          noValidate
          autoComplete="off"
          onSubmit={formik.handleSubmit}
        >
          {/* Role Header */}
          <div className="flex flex-col gap-5 items-center justify-center">
            {currentRole.icon}
            <Typography variant="h5" gutterBottom sx={{ color: 'text.primary', m: 0, ml: 2 }}>
              {currentRole.title} Login
            </Typography>
          </div>
          <Typography variant="body2" className="text-gray-400 text-center mb-4">
            {currentRole.description}
          </Typography>

          {/* Role Selection Link */}
          <div className="text-center mb-6">
            <button
              type="button"
              onClick={() => navigate('/select-role')}
              className="text-orange-500 hover:text-orange-400 text-sm underline"
            >
              Switch to different role
            </button>
          </div>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <TextField
            name="email"
            label="Email address"
            type="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            sx={{ mb: 3 }}
          />

          <TextField
            type='password'
            name="password"
            label="Password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            sx={{ mb: 3 }}
          />

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={handleRememberMeChange}
                className="h-4 w-4 text-orange-500  accent-amber-500 rounded focus:ring-orange-500"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              {role === 'school' && (
                <button
                  type="button"
                  onClick={openForgotPasswordDialog}
                  className="text-orange-500 hover:text-orange-400 bg-transparent border-none cursor-pointer"
                >
                  Forgot your password?
                </button>
              )}
            </div>
          </div>

          <Button
            type='submit'
            variant="contained"
            disabled={loading || oauthLoading}
            sx={{
              mt: { xs: 1, sm: 2, md: 3, lg: 4 },
              py: { xs: 1, sm: 1.2, md: 1.2 },
              textTransform: 'uppercase',
              fontWeight: 'bold',
            }}
            className="bg-gradient-to-r from-amber-500 to-orange-600"
          >
            {loading ? <CircularProgress size={24} /> : `Sign In as ${currentRole.title}`}
          </Button>

          {role === 'school' && (
            <div className="mt-4 text-center">
              <Typography variant="body2" className="text-gray-400">
                Don't have an account?{' '}
                <span onClick={() => navigate('/register')} className="text-orange-500 cursor-pointer hover:underline">
                  Register
                </span>
              </Typography>
            </div>
          )}

          {/* Only show Google OAuth section when School Admin is selected */}
          {role === 'school' && (
            <>
              <div className="mt-6 flex items-center justify-center">
                <div className="h-px bg-gray-700 flex-grow"></div>
                <span className="mx-4 text-sm text-gray-500">Or continue with</span>
                <div className="h-px bg-gray-700 flex-grow"></div>
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading || oauthLoading}
                  className="w-full max-w-xs h-10 inline-flex justify-center items-center py-2 px-4 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {oauthLoading ? (
                    <CircularProgress size={20} sx={{ color: '#FF9800' }} />
                  ) : (
                    <>
                      <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      Continue with Google
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </Box>

        {/* Forgot Password Dialog */}
        <Dialog
          open={forgotPasswordOpen}
          onClose={() => {
            setForgotPasswordOpen(false);
            setForgotPasswordMessage('');
            setForgotPasswordError('');
          }}
          PaperProps={{
            sx: {
              bgcolor: 'background.paper',
              color: 'text.primary',
              minWidth: { xs: '90vw', sm: '400px' }
            }
          }}
        >
          <DialogTitle sx={{ color: 'text.primary' }}>
            Reset Your Password
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              Enter your email address and we'll send you a link to reset your password.
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              label="Email Address"
              type="email"
              fullWidth
              variant="outlined"
              value={forgotPasswordEmail}
              onChange={(e) => setForgotPasswordEmail(e.target.value)}
              sx={{ mt: 2 }}
              error={Boolean(forgotPasswordError)}
            />
            {forgotPasswordMessage && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {forgotPasswordMessage}
              </Alert>
            )}
            {forgotPasswordError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {forgotPasswordError}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setForgotPasswordOpen(false);
                setForgotPasswordMessage('');
                setForgotPasswordError('');
              }}
              sx={{ color: 'text.secondary' }}
              disabled={forgotPasswordLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleForgotPassword}
              disabled={forgotPasswordLoading}
              variant="contained"
            >
              {forgotPasswordLoading ? <CircularProgress size={20} /> : 'Send Reset Link'}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </ThemeProvider>
  );
}