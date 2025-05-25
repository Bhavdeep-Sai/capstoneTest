/* eslint-disable no-unused-vars */
import * as React from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { useFormik } from 'formik';
import { registerSchema } from '../../../yupSchema/registerSchema';
import { Button, CardMedia, Typography, Alert, CircularProgress } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import BookIcon from '@mui/icons-material/MenuBook';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useNavigate } from 'react-router-dom';
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

export default function Register() {
  const navigate = useNavigate();
  const [file, setFile] = React.useState(null);
  const [imageUrl, setImageUrl] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [oauthLoading, setOauthLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [success, setSuccess] = React.useState(null);
  const [termsAccepted, setTermsAccepted] = React.useState(false);
  const [oauthData, setOauthData] = React.useState(null);
  const [showOauthForm, setShowOauthForm] = React.useState(false);

  const addImage = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setImageUrl(URL.createObjectURL(selectedFile));
      setFile(selectedFile);
      setError(null);
    }
  };

  const fileInputRef = React.useRef(null);
  const hiddenFileInputRef = React.useRef(null);
  const oauthFileInputRef = React.useRef(null);

  const handleClearFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (hiddenFileInputRef.current) {
      hiddenFileInputRef.current.value = '';
    }
    if (oauthFileInputRef.current) {
      oauthFileInputRef.current.value = '';
    }
    setFile(null);
    setImageUrl(null);
  };

  const handleUploadClick = () => {
    if (showOauthForm && oauthFileInputRef.current) {
      oauthFileInputRef.current.click();
    } else if (hiddenFileInputRef.current) {
      hiddenFileInputRef.current.click();
    }
  };

  const initialValues = {
    schoolName: "",
    email: "",
    ownerName: "",
    password: "",
    confirmPassword: ""
  };

  const oauthFormValues = {
    schoolName: "",
    ownerName: ""
  };

  // Load Google OAuth script
  React.useEffect(() => {
    const loadGoogleScript = () => {
      if (window.google) return;
      
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    };

    loadGoogleScript();
  }, []);

  // Google OAuth Registration
  const handleGoogleRegister = async () => {
    setOauthLoading(true);
    setError(null);

    try {
      // Check if Google OAuth is loaded
      if (typeof window.google === 'undefined') {
        throw new Error('Google OAuth not loaded. Please refresh the page and try again.');
      }

      // Initialize Google OAuth
      window.google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: 'email profile',
        callback: async (response) => {
          try {
            if (response.access_token) {
              // Get user info from Google
              const userInfoResponse = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${response.access_token}`);
              const userInfo = await userInfoResponse.json();
              
              setOauthData({
                provider: 'google',
                token: response.access_token,
                email: userInfo.email,
                name: userInfo.name,
                picture: userInfo.picture
              });
              setShowOauthForm(true);
            } else {
              throw new Error('No access token received from Google');
            }
          } catch (error) {
            console.error('Google OAuth error:', error);
            setError('Google authentication failed: ' + error.message);
          } finally {
            setOauthLoading(false);
          }
        },
        error_callback: (error) => {
          console.error('Google OAuth error:', error);
          setError('Google authentication failed');
          setOauthLoading(false);
        }
      }).requestAccessToken();
    } catch (error) {
      console.error('Google OAuth initialization error:', error);
      setError('Google OAuth initialization failed: ' + error.message);
      setOauthLoading(false);
    }
  };

  // OAuth form submission
  const oauthFormik = useFormik({
    initialValues: oauthFormValues,
    onSubmit: async (values) => {
      if (!oauthData) return;
      
      setLoading(true);
      setError(null);

      try {
        if (!termsAccepted) {
          setError("Please accept the Terms and Conditions");
          setLoading(false);
          return;
        }

        if (!values.schoolName.trim() || !values.ownerName.trim()) {
          setError("Please fill in all required fields");
          setLoading(false);
          return;
        }

        if (!file) {
          setError("School image is required");
          setLoading(false);
          return;
        }

        // Create FormData for Google OAuth registration with image
        const fd = new FormData();
        fd.append("image", file);
        fd.append("token", oauthData.token);
        fd.append("schoolName", values.schoolName.trim());
        fd.append("ownerName", values.ownerName.trim());

        const response = await axios.post(`${baseApi}/school/register/google`, fd, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response?.data?.success) {
          setSuccess(`School registered successfully with Google! Redirecting to login...`);
          
          // Reset forms
          oauthFormik.resetForm();
          setOauthData(null);
          setShowOauthForm(false);
          setTermsAccepted(false);
          handleClearFile();
          
          // Redirect to login after 2 seconds
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } catch (error) {
        console.error('OAuth registration error:', error);
        if (error.response?.data?.message) {
          setError(error.response.data.message);
        } else if (error.response) {
          setError('OAuth registration failed. Please try again.');
        } else {
          setError('Network error. Please check your connection and try again.');
        }
      } finally {
        setLoading(false);
      }
    }
  });

  // Traditional form submission
  const formik = useFormik({
    initialValues,
    validationSchema: registerSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
        if (!file) {
          setError("School image is required");
          setLoading(false);
          return;
        }

        if (!termsAccepted) {
          setError("Please accept the Terms and Conditions");
          setLoading(false);
          return;
        }

        const fd = new FormData();
        fd.append("image", file);
        fd.append("schoolName", values.schoolName);
        fd.append("email", values.email);
        fd.append("ownerName", values.ownerName);
        fd.append("password", values.password);

        const response = await axios.post(
          `${baseApi}/school/register`,
          fd,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        if (response?.data?.success) {
          setSuccess("School registered successfully! Redirecting to login...");
          
          formik.resetForm();
          handleClearFile();
          setTermsAccepted(false);
          
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }

      } catch (error) {
        console.error("Registration error:", error);
        
        if (error.response?.data?.message) {
          setError(error.response.data.message);
        } else if (error.response) {
          setError("Registration failed. Please try again.");
        } else if (error.request) {
          setError("Network error. Please check your connection and try again.");
        } else {
          setError("Registration failed. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
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
            maxWidth: '600px',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
            bgcolor: 'background.paper',
          }}
          className="bg-gray-800 border border-gray-700"
          noValidate
          autoComplete="off"
          onSubmit={showOauthForm ? oauthFormik.handleSubmit : formik.handleSubmit}
        >
          <div className="flex items-center justify-center mb-4">
            <BookIcon sx={{ color: '#FF9800', fontSize: 40, mr: 1 }} />
            <Typography variant="h5" gutterBottom sx={{ color: 'text.primary', m: 0 }}>
              {showOauthForm ? `Complete Google Registration` : 'Signup to your account'}
            </Typography>
          </div>
          <Typography variant="body2" className="text-gray-400 text-center mb-6">
            Join our School Management System
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          {showOauthForm ? (
            // OAuth completion form
            <>
              {oauthData?.email && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Registering with email: {oauthData.email}
                </Alert>
              )}
              
              <TextField
                name="schoolName"
                label="Institute Name"
                value={oauthFormik.values.schoolName}
                onChange={oauthFormik.handleChange}
                onBlur={oauthFormik.handleBlur}
                required
                sx={{ mb: 2 }}
              />

              <TextField
                name="ownerName"
                label="Owner Name"
                value={oauthFormik.values.ownerName}
                onChange={oauthFormik.handleChange}
                onBlur={oauthFormik.handleBlur}
                required
                sx={{ mb: 3 }}
              />

              {/* Image upload for OAuth form */}
              <Typography className="text-gray-300 mb-1">Institute Image *</Typography>
              <input
                type="file"
                ref={oauthFileInputRef}
                onChange={addImage}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <div className="mb-4 flex items-center">
                <Button
                  variant="outlined"
                  onClick={handleUploadClick}
                  className="bg-amber-500 flex justify-center items-center h-10 gap-5"
                >
                  <CloudUploadIcon />
                  Upload School Image
                </Button>
                {file && (
                  <Typography variant="body2" className="ml-2 text-gray-300">
                    {file.name}
                  </Typography>
                )}
              </div>

              {imageUrl && (
                <Box sx={{ maxWidth: '300px', marginTop: '10px', marginBottom: '20px' }}>
                  <CardMedia
                    component={'img'}
                    image={imageUrl}
                    alt="School preview"
                    sx={{
                      borderRadius: '8px',
                      border: '1px solid #444',
                      maxHeight: '150px',
                      objectFit: 'contain'
                    }}
                  />
                  <Button
                    size="small"
                    color="error"
                    onClick={handleClearFile}
                    sx={{ mt: 1 }}
                  >
                    Clear Image
                  </Button>
                </Box>
              )}

              <div className="flex items-center gap-3 mb-4">
                <input
                  id="oauth-terms-checkbox"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
                />
                <label htmlFor="oauth-terms-checkbox" className="ml-2 text-sm text-gray-300">
                  I agree to the Terms and Conditions and Privacy Policy
                </label>
              </div>

              <Button
                type='submit'
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 1,
                  py: 1.5,
                  textTransform: 'uppercase',
                  fontWeight: 'bold'
                }}
                className="bg-gradient-to-r from-amber-500 to-orange-600"
              >
                {loading ? <CircularProgress size={24} /> : `Complete Google Registration`}
              </Button>

              <Button
                onClick={() => {
                  setShowOauthForm(false);
                  setOauthData(null);
                  setTermsAccepted(false);
                  handleClearFile();
                }}
                sx={{ mt: 2 }}
                variant="outlined"
              >
                Back to Registration Options
              </Button>
            </>
          ) : (
            // Traditional registration form
            <>
              <TextField
                name="schoolName"
                label="Institute Name"
                value={formik.values.schoolName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.schoolName && Boolean(formik.errors.schoolName)}
                helperText={formik.touched.schoolName && formik.errors.schoolName}
                sx={{ mb: 2 }}
              />

              <TextField
                name="ownerName"
                label="Owner Name"
                value={formik.values.ownerName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.ownerName && Boolean(formik.errors.ownerName)}
                helperText={formik.touched.ownerName && formik.errors.ownerName}
                sx={{ mb: 2 }}
              />

              <TextField
                name="email"
                label="Email address"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                sx={{ mb: 2 }}
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
                sx={{ mb: 2 }}
              />

              <TextField
                type='password'
                name="confirmPassword"
                label="Confirm password"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                sx={{ mb: 3 }}
              />

              <Typography className="text-gray-300 mb-1">Institute Image</Typography>
              <input
                type="file"
                ref={hiddenFileInputRef}
                onChange={addImage}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <div className="mb-4 flex items-center">
                <Button
                  variant="outlined"
                  onClick={handleUploadClick}
                  className="bg-amber-500 flex justify-center items-center h-10 gap-5"
                >
                  <CloudUploadIcon />
                  Upload Image
                </Button>
                {file && (
                  <Typography variant="body2" className="ml-2 text-gray-300">
                    {file.name}
                  </Typography>
                )}
              </div>

              {imageUrl && (
                <Box sx={{ maxWidth: '300px', marginTop: '10px', marginBottom: '20px' }}>
                  <CardMedia
                    component={'img'}
                    image={imageUrl}
                    alt="School preview"
                    sx={{
                      borderRadius: '8px',
                      border: '1px solid #444',
                      maxHeight: '150px',
                      objectFit: 'contain'
                    }}
                  />
                  <Button
                    size="small"
                    color="error"
                    onClick={handleClearFile}
                    sx={{ mt: 1 }}
                  >
                    Clear Image
                  </Button>
                </Box>
              )}

              <div className="flex items-center gap-3 mb-4">
                <input
                  id="terms-checkbox"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
                />
                <label htmlFor="terms-checkbox" className="ml-2 text-sm text-gray-300">
                  I agree to the Terms and Conditions and Privacy Policy
                </label>
              </div>

              <Button
                type='submit'
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 1,
                  py: 1.5,
                  textTransform: 'uppercase',
                  fontWeight: 'bold'
                }}
                className="bg-gradient-to-r from-amber-500 to-orange-600"
              >
                {loading ? <CircularProgress size={24} /> : 'Sign Up'}
              </Button>

              <div className="mt-4 text-center">
                <Typography variant="body2" className="text-gray-400">
                  Already have an account?
                  <span onClick={() => navigate('/login')} className="text-orange-500 ml-1 cursor-pointer hover:underline">
                    Login
                  </span>
                </Typography>
              </div>

              <div className="mt-6 flex items-center justify-center">
                <div className="h-px bg-gray-700 flex-grow"></div>
                <span className="mx-4 text-sm text-gray-500">Or continue with</span>
                <div className="h-px bg-gray-700 flex-grow"></div>
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={handleGoogleRegister}
                  disabled={oauthLoading}
                  className="h-10 w-full max-w-xs inline-flex justify-center items-center py-2 px-4 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
                >
                  {oauthLoading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <>
                      <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Continue with Google
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </Box>
      </div>
    </ThemeProvider>
  );
}