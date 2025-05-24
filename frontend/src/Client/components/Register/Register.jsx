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

// Custom styled file input button
const UploadButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #FF9800 30%, #FF5722 90%)',
  borderRadius: 3,
  boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
  color: 'white',
  height: 36,
  padding: '0 16px',
  margin: '10px 0',
}));

export default function Register() {
  const navigate = useNavigate();
  const [file, setFile] = React.useState(null);
  const [imageUrl, setImageUrl] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [success, setSuccess] = React.useState(null);

  const addImage = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setImageUrl(URL.createObjectURL(selectedFile));
      setFile(selectedFile);
    }
  };

  const fileInputRef = React.useRef(null);
  const hiddenFileInputRef = React.useRef(null);

  const handleClearFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFile(null);
    setImageUrl(null);
  };

  const handleUploadClick = () => {
    hiddenFileInputRef.current.click();
  };

  const initialValues = {
    schoolName: "",
    email: "",
    ownerName: "",
    password: "",
    confirmPassword: ""
  };

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

        const fd = new FormData();
        fd.append("image", file);
        fd.append("schoolName", values.schoolName);
        fd.append("email", values.email);
        fd.append("ownerName", values.ownerName);
        fd.append("password", values.password);

        await axios.post(
          'http://localhost:5000/api/school/register',
          fd,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        setSuccess("School registered successfully!");
        formik.resetForm();
        handleClearFile();
      } catch (error) {
        console.error("Registration error:", error);
        setError(error.response?.data?.message || "Registration failed");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4  sm:px-6 lg:px-8">
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
          className="bg-gray-800 border  border-gray-700"
          noValidate
          autoComplete="off"
          onSubmit={formik.handleSubmit}
        >
          <div className="flex items-center justify-center mb-4">
            <BookIcon sx={{ color: '#FF9800', fontSize: 40, mr: 1 }} />
            <Typography variant="h5" gutterBottom sx={{ color: 'text.primary', m: 0 }}>
              Signup to your account
            </Typography>
          </div>
          <Typography variant="body2" className="text-gray-400 text-center mb-6">
            Join our School Management System
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}



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
              className="w-4 h-4  text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
            />
            <label htmlFor="terms-checkbox" className="ml-2 text-sm  text-gray-300">
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
              <span onClick={()=>navigate('/login')} className="text-orange-500 ml-1 cursor-pointer hover:underline">
                Login
              </span>
            </Typography>
          </div>

          <div className="mt-6 flex items-center justify-center">
            <div className="h-px bg-gray-700 flex-grow"></div>
            <span className="mx-4 text-sm text-gray-500">Or continue with</span>
            <div className="h-px bg-gray-700 flex-grow"></div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div>
              <button
                type="button"
                className=" h-10 w-full inline-flex justify-center items-center py-2 px-4 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </button>
            </div>
            
            <div>
              <button
                type="button"
                className="w-full h-10 items-center inline-flex justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.933.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.139 18.163 20 14.418 20 10c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </Box>
      </div>
    </ThemeProvider>
  );
}