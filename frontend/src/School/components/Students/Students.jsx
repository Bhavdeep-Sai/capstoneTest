/* eslint-disable no-unused-vars */
import * as React from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { useFormik } from 'formik';
import { Button, CardMedia, Typography, Alert, CircularProgress, Card, CardActionArea, CardContent, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, Container, Grid, Paper, Chip, Avatar, Fade, Slide, useMediaQuery } from '@mui/material';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import BookIcon from '@mui/icons-material/MenuBook';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import EditIcon from '@mui/icons-material/Edit';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SchoolIcon from '@mui/icons-material/School';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import CakeIcon from '@mui/icons-material/Cake';
import WcIcon from '@mui/icons-material/Wc';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import { studentSchema } from '../../../yupSchema/studentSchema';
import { baseApi } from '../../../environment';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import LockIcon from '@mui/icons-material/Lock';

// Enhanced dark theme with better responsive design
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FF9800',
      light: '#FFB74D',
      male: '#1ca3f0',
      female: "#ef598e",
      dark: '#F57C00',
      contrastText: '#000000',
    },
    secondary: {
      main: '#FF5722',
      light: '#FF8A65',
      dark: '#E64A19',
    },
    background: {
      default: '#0a0a0a',
      paper: '#1a1a2e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
    error: {
      main: '#f44336',
    },
    success: {
      main: '#4caf50',
    },
    info: {
      main: '#2196f3',
    },
    warning: {
      main: '#ff9800',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: '2.125rem',
      lineHeight: 1.2,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.3,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.4,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 152, 0, 0.12)',
          borderRadius: '16px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            border: '1px solid rgba(255, 152, 0, 0.3)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '5px',
          padding: '10px 24px',
          fontSize: '0.875rem',
          transition: 'all 0.2s ease-in-out',
        },
        contained: {
          boxShadow: '0 4px 14px 0 rgba(255, 152, 0, 0.3)',
          '&:hover': {
            boxShadow: '0 6px 20px 0 rgba(255, 152, 0, 0.4)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '3px',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 152, 0, 0.5)',
              },
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#FF9800',
                borderWidth: '2px',
              },
            },
          },
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

// Enhanced styled components
const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #FF9800 0%, #FF5722 80%)',
  borderRadius: '5px',
  boxShadow: '0 4px 15px rgba(255, 152, 0, 0.4)',
  color: 'white',
  fontWeight: 400,
  padding: '12px 28px',
  fontSize: '0.875rem',
  textTransform: 'none',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: 'linear-gradient(135deg, #F57C00 0%, #E64A19 100%)',
    boxShadow: '0 6px 20px rgba(255, 152, 0, 0.5)',
    transform: 'translateY(-3px)',
  },
  '&:active': {
    transform: 'translateY(-1px)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '10px 20px',
    fontSize: '0.8rem',
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 152, 0, 0.12)',
  borderRadius: '20px',
  padding: theme.spacing(4),
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(3),
    borderRadius: '16px',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    borderRadius: '12px',
    margin: theme.spacing(1),
  },
}));

const HeaderContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 0),
  marginBottom: theme.spacing(4),
  borderBottom: '1px solid rgba(255, 152, 0, 0.12)',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2, 0),
    marginBottom: theme.spacing(2),
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #FF9800, #FF5722)',
  },
}));

const InfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(0.5),
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.8rem',
  },
}));

export default function Students() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [form, setForm] = React.useState(false);
  const [file, setFile] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [success, setSuccess] = React.useState(null);
  const [classes, setClasses] = React.useState([]);
  const [message, setMessage] = React.useState('');
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [currentStudent, setCurrentStudent] = React.useState(null);
  const [editFile, setEditFile] = React.useState(null);
  const [passwordVisibility, setPasswordVisibility] = React.useState({});
  const [params, setParams] = React.useState({});
  const [filterClass, setFilterClass] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [students, setStudents] = React.useState([]);
  const [deleteLoading, setDeleteLoading] = React.useState({});

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${baseApi}/class/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setClasses(response.data.data);
    } catch (err) {
      console.log(err);
      setError("Failed to fetch classes");
    }
  };

  const handleClass = (e) => {
    setParams((prevParams) => ({
      ...prevParams,
      studentClass: e.target.value || undefined,
    }));
    setFilterClass(e.target.value);
  };

  const handleSearch = (e) => {
    setParams((prevParams) => ({
      ...prevParams,
      search: e.target.value || undefined,
    }));
    setSearch(e.target.value);
  };

  const handleClearFilter = () => {
    setParams({});
    setSearch("");
    setFilterClass("");
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${baseApi}/student/fetch-with-query`, {
        params,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setStudents(response.data.students);

        const initialVisibility = {};
        response.data.students.forEach(student => {
          initialVisibility[student._id] = false;
        });
        setPasswordVisibility(initialVisibility);
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.log(err);
      if (err.response?.status === 404) {
        setStudents([]);
      } else {
        setError("Failed to fetch students");
      }
    }
  };

  React.useEffect(() => {
    fetchClasses();
  }, []);

  React.useEffect(() => {
    fetchStudents();
  }, [params, message]);

  const addImage = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const fileInputRef = React.useRef(null);
  const hiddenFileInputRef = React.useRef(null);
  const editFileInputRef = React.useRef(null);
  const [editImageUrl, setEditImageUrl] = React.useState(null);
  const [originalEditImageUrl, setOriginalEditImageUrl] = React.useState(null);

  const handleClearFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFile(null);
  };

  const handleClearEditFile = () => {
    if (editFileInputRef.current) {
      editFileInputRef.current.value = '';
    }
    setEditFile(null);
    setEditImageUrl(originalEditImageUrl);
  };

  const handleUploadClick = () => {
    hiddenFileInputRef.current.click();
  };

  const handleEditUploadClick = () => {
    editFileInputRef.current.click();
  };

  const togglePasswordVisibility = (studentId) => {
    setPasswordVisibility(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const initialValues = {
    email: "",
    name: "",
    studentClass: "",
    age: "",
    gender: "",
    parent: "",
    parentNum: "",
    password: "",
    confirmPassword: ""
  };

  const formik = useFormik({
    initialValues,
    validationSchema: studentSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
        if (!file) {
          setError("Student image is required");
          setLoading(false);
          return;
        }

        const fd = new FormData();
        fd.append("image", file);
        fd.append("name", values.name);
        fd.append("email", values.email);
        fd.append("studentClass", values.studentClass);
        fd.append("age", values.age);
        fd.append("gender", values.gender);
        fd.append("parent", values.parent);
        fd.append("parentNum", values.parentNum);
        fd.append("password", values.password);

        const token = localStorage.getItem('token');
        const response = await axios.post(
          `${baseApi}/student/register`,
          fd,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (response.data.success) {
          setSuccess("Student registered successfully!");
          formik.resetForm();
          handleClearFile();
          setForm(false);
          setMessage(`Student ${values.name} registered at ${new Date().toLocaleString()}`);
        }
      } catch (error) {
        console.error("Registration error:", error);
        if (error.response?.status === 409) {
          setError("A student with this email already exists.");
        } else {
          setError(error.response?.data?.message || "Registration failed");
        }
      } finally {
        setLoading(false);
      }
    },
  });

  const handleCancel = () => {
    formik.resetForm();
    handleClearFile();
    setForm(false);
    setError(null);
    setSuccess(null);
  };

  const editFormik = useFormik({
    initialValues: {
      email: "",
      name: "",
      studentClass: "",
      age: "",
      gender: "",
      parent: "",
      parentNum: "",
    },
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
        const fd = new FormData();

        if (editFile) {
          fd.append("image", editFile);
        }

        fd.append("name", values.name);
        fd.append("email", values.email);
        fd.append("studentClass", values.studentClass);
        fd.append("age", values.age);
        fd.append("gender", values.gender);
        fd.append("parent", values.parent);
        fd.append("parentNum", values.parentNum);

        const token = localStorage.getItem('token');
        const response = await axios.put(
          `${baseApi}/student/update/${currentStudent._id}`,
          fd,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (response.data.success) {
          setSuccess(editFile ?
            "Student updated successfully! Previous image has been removed from cloud storage." :
            "Student updated successfully!"
          );
          setEditDialogOpen(false);
          setMessage(`Student ${values.name} updated at ${new Date().toLocaleString()}`);
          handleClearEditFile();
          setCurrentStudent(null);
          setOriginalEditImageUrl(null);
        }
      } catch (error) {
        console.error("Update error:", error);
        if (error.response?.status === 404) {
          setError("Student not found");
        } else {
          setError(error.response?.data?.message || "Update failed");
        }
      } finally {
        setLoading(false);
      }
    },
  });

  const handleEdit = (id) => {
    const studentToEdit = students.find(student => student._id === id);
    console.log(studentToEdit);
    if (!studentToEdit) return;

    setCurrentStudent(studentToEdit);

    editFormik.setValues({
      email: studentToEdit.email || "",
      name: studentToEdit.name || "",
      studentClass: studentToEdit.studentClass?._id || "",
      age: studentToEdit.age || "",
      gender: studentToEdit.gender,
      parent: studentToEdit.parent || "",
      parentNum: studentToEdit.parentNum || "",
    });

    if (studentToEdit.studentImg) {
      setOriginalEditImageUrl(studentToEdit.studentImg);
      setEditImageUrl(studentToEdit.studentImg);
    } else {
      setOriginalEditImageUrl(null);
      setEditImageUrl(null);
    }

    setEditDialogOpen(true);
  };

  const handleDelete = async (id) => {
    const studentToDelete = students.find(student => student._id === id);
    const studentName = studentToDelete?.name || 'this student';

    if (!window.confirm(`Are you sure you want to delete ${studentName}? This will also permanently remove their image from cloud storage.`)) {
      return;
    }

    setDeleteLoading(prev => ({ ...prev, [id]: true }));

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${baseApi}/student/delete/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setSuccess("Student and associated image deleted successfully from both database and cloud storage");
        setMessage(`Student ${studentName} deleted at ${new Date().toLocaleString()}`);
      }
    } catch (err) {
      console.log(err);
      if (err.response?.status === 404) {
        setError("Student not found or already deleted");
      } else {
        setError(err.response?.data?.message || "Failed to delete student");
      }
    } finally {
      setDeleteLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setEditFile(null);
    setEditImageUrl(null);
    setOriginalEditImageUrl(null);
    setCurrentStudent(null);
    if (editFileInputRef.current) {
      editFileInputRef.current.value = '';
    }
  };
  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{
        minHeight: '100vh',
        pb: 4
      }}>
        {/* Alert Messages */}
        <Container maxWidth="xl" sx={{ pt: 2 }}>
          <Fade in={!!success}>
            <Box>
              {success && (
                <Alert
                  severity="success"
                  sx={{ mb: 2, borderRadius: 2 }}
                  onClose={() => setSuccess(null)}
                >
                  {success}
                </Alert>
              )}
            </Box>
          </Fade>
          <Fade in={!!error}>
            <Box>
              {error && (
                <Alert
                  severity="error"
                  sx={{ mb: 2, borderRadius: 2 }}
                  onClose={() => setError(null)}
                >
                  {error}
                </Alert>
              )}
            </Box>
          </Fade>
        </Container>

        {/* Header Section */}
        {!form && <HeaderContainer>
          <Container maxWidth="xl">
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{
                  bgcolor: 'primary.main',
                  width: isMobile ? 40 : 56,
                  height: isMobile ? 40 : 56
                }}>
                  <SchoolIcon sx={{ fontSize: isMobile ? 20 : 28 }} />
                </Avatar>
                <Box>
                  <Typography
                    variant={isMobile ? "h5" : "h4"}
                    sx={{
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #FF9800 0%, #FF5722 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Student Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manage and organize student records
                  </Typography>
                </Box>
              </Box>

              {!form && (
                isMobile ? (
                  <div className="flex justify-end w-full">
                    <Button
                      onClick={() => setForm(true)}
                      startIcon={<PersonAddIcon />}
                      size="small"
                      variant="outlined"
                    >
                      Add Student
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => setForm(true)}
                    startIcon={<PersonAddIcon />}
                    size="medium"
                    variant="outlined"
                  >
                    Add Student
                  </Button>
                )
              )}
            </Box>
          </Container>
        </HeaderContainer>
        }

        {/* Add Student Form */}
        {form && (
          <Slide direction="up" in={form} mountOnEnter unmountOnExit>
            <Container maxWidth="md" sx={{ mb: 4 }}>
              <StyledPaper>
                <Box
                  component="form"
                  onSubmit={formik.handleSubmit}
                  sx={{ width: '100%' }}
                >
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Avatar sx={{
                      bgcolor: 'primary.main',
                      width: 56,
                      height: 56,
                      mx: 'auto',
                      mb: 2
                    }}>
                      <PersonAddIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                      Add New Student
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Register a student in the School Management System
                    </Typography>
                  </Box>

                  <Grid sx={{ width: { xs: '95%', lg: '70%' } }} className="flex flex-col gap-5 justify-center m-auto" spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="name"
                        label="Student Name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.name && Boolean(formik.errors.name)}
                        helperText={formik.touched.name && formik.errors.name}
                        fullWidth
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="email"
                        label="Email address"
                        type="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.email && Boolean(formik.errors.email)}
                        helperText={formik.touched.email && formik.errors.email}
                        fullWidth
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Class</InputLabel>
                        <Select
                          value={formik.values.studentClass}
                          label="Class"
                          name="studentClass"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.studentClass && Boolean(formik.errors.studentClass)}
                        >
                          {classes && classes.map((cls) => (
                            <MenuItem key={cls._id} value={cls._id}>{cls.classText}</MenuItem>
                          ))}
                        </Select>
                        {formik.touched.studentClass && formik.errors.studentClass && (
                          <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                            {formik.errors.studentClass}
                          </Typography>
                        )}
                      </FormControl>
                    </Grid>
                    <div className='flex flex-row justify-between  w-[100%]'>
                      <Grid item width={1 / 3} xs={12} sm={6}>
                        <TextField
                          name="age"
                          label="Age"
                          value={formik.values.age}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.age && Boolean(formik.errors.age)}
                          helperText={formik.touched.age && formik.errors.age}
                        />
                      </Grid>

                      <Grid item width={1 / 2} xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Gender</InputLabel>
                          <Select
                            value={formik.values.gender}
                            label="Gender"
                            name="gender"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.gender && Boolean(formik.errors.gender)}
                          >
                            <MenuItem value="Male">Male</MenuItem>
                            <MenuItem value="Female">Female</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                          </Select>
                          {formik.touched.gender && formik.errors.gender && (
                            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                              {formik.errors.gender}
                            </Typography>
                          )}
                        </FormControl>
                      </Grid>

                    </div>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="parent"
                        label="Parent/Guardian Name"
                        value={formik.values.parent}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.parent && Boolean(formik.errors.parent)}
                        helperText={formik.touched.parent && formik.errors.parent}
                        fullWidth
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="parentNum"
                        label="Parent Phone Number"
                        value={formik.values.parentNum}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.parentNum && Boolean(formik.errors.parentNum)}
                        helperText={formik.touched.parentNum && formik.errors.parentNum}
                        fullWidth
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="password"
                        label="Password"
                        type="password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.password && Boolean(formik.errors.password)}
                        helperText={formik.touched.password && formik.errors.password}
                        fullWidth
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="confirmPassword"
                        label="Confirm Password"
                        type="password"
                        value={formik.values.confirmPassword}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                        helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                        fullWidth
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Box>
                        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                          Student Image *
                        </Typography>
                        <input
                          type="file"
                          ref={hiddenFileInputRef}
                          style={{ display: 'none' }}
                          accept="image/*"
                          onChange={addImage}
                        />
                        <Button
                          onClick={handleUploadClick}
                          startIcon={<CloudUploadIcon />}
                          fullWidth={isMobile}
                          variant={file ? 'outlined' : "contained"}
                          sx={{ mb: 1 }}
                        >
                          {file ? 'Change Image' : 'Upload Student Image'}
                        </Button>
                        {file && (
                          <div className='w-[100%]'>
                            <Box sx={{ mt: 2, display: 'flex', flexDirection: "column", alignItems: 'flex-start', gap: 2 }}>
                              <Chip
                                label={file.name}
                                onDelete={handleClearFile}
                                color="primary"
                                variant="outlined"
                                sx={{ borderRadius: "5px" }}
                              />
                              <Typography variant="body2" className='flex justify-center lg:w-[45%]' color="success.main">
                                Image selected successfully
                              </Typography>
                            </Box>
                          </div>
                        )}
                      </Box>
                    </Grid>
                  </Grid>

                  <Box sx={{
                    display: 'flex',
                    gap: 2,
                    mt: 4,
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'flex-end'
                  }}>
                    <Button
                      onClick={handleCancel}
                      variant="outlined"
                      size="large"
                      fullWidth={isMobile}
                      sx={{ minWidth: 120 }}
                    >
                      Cancel
                    </Button>
                    <GradientButton
                      type="submit"
                      disabled={loading}
                      size="large"
                      fullWidth={isMobile}
                      sx={{ minWidth: 120 }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Register Student'}
                    </GradientButton>
                  </Box>
                </Box>
              </StyledPaper>
            </Container>
          </Slide>
        )}

        {/* Search and Filter Section */}
        {!form && (
          <Container maxWidth="xl" sx={{ mb: 4, }}>
            <div sx={{ p: 3 }} className='flex flex-col lg:flex-row justify-center  lg:justify-end items-center gap-3 lg:gap-10'>
              <Grid item xs={12} md={2}>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  {students.length} student{students.length !== 1 ? 's' : ''} found
                </Typography>
              </Grid>
              <Grid className="flex justify-center lg:justify-end gap-5" spacing={3} alignItems="center">
                <Grid width={1 / 2} xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    placeholder="Search students..."
                    value={search}
                    onChange={handleSearch}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                <Grid width={1 / 2} xs={12} sm={6} md={3}>
                  <FormControl>
                    <InputLabel>Filter by Class</InputLabel>
                    <Select
                      value={filterClass}
                      label="Filter by Class"
                      onChange={handleClass}
                      sx={{ width: { xs: "150px", lg: "200px" } }}
                    >
                      <MenuItem value="">All Classes</MenuItem>
                      {classes && classes.map((cls) => (
                        <MenuItem key={cls._id} value={cls._id}>{cls.classText}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {filterClass && <Grid item xs={12} sm={12} md={3}>
                  <Button
                    onClick={handleClearFilter}
                    variant="outlined"
                    fullWidth
                    sx={{ height: "50px" }}

                  >
                    <CloseIcon />

                  </Button>
                </Grid>}
              </Grid>
            </div>
          </Container>
        )}

        {/* Students Grid */}
        {!form && (
          <Container maxWidth="xl">
            {students.length === 0 ? (
              <StyledPaper sx={{ textAlign: 'center', py: 8 }}>
                <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No students found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {search || filterClass ? 'Try adjusting your search or filter criteria' : 'Start by adding your first student'}
                </Typography>
              </StyledPaper>
            ) : (
              <Grid className="flex gap-5 flex-wrap justify-evenly" spacing={3}>
                {students.map((student) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={student._id}>
                    <StyledCard sx={{ width: { lg: "400px" } }}>
                      <Box sx={{ position: 'relative' }}>
                        <CardMedia
                          component="img"
                          height={isMobile ? "200" : "240"}
                          image={student.studentImg}
                          alt={student.name}
                          sx={{
                            objectFit: 'cover',
                            borderRadius: 2,
                            boxShadow: 2,
                            filter: 'brightness(0.95) contrast(1.1)',
                            transition: '0.3s ease-in-out',
                            '&:hover': {
                              transform: 'scale(1.03)',
                            }
                          }}
                        />
                        <div className="absolute top-2 right-2 flex gap-1">
                          <Chip
                            label={student.studentClass?.classText || 'No Class'}
                            size="small"
                            sx={{
                              bgcolor: '#181e37',
                              color: 'white',
                              fontWeight: 400,
                              borderRadius: '5px',
                            }}
                          />
                        </div>
                      </Box>

                      <CardContent sx={{ flexGrow: 1, p: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{
                          fontWeight: 600,
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}>
                          {student.name}
                        </Typography>

                        <Box sx={{ mb: 2 }}>
                          <InfoRow>
                            <EmailIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                            <Typography variant="body2" color="text.secondary" sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}>
                              {student.email}
                            </Typography>
                          </InfoRow>

                          <InfoRow>
                            <CakeIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                            <Typography variant="body2" color="text.secondary">
                              {student.age} years old
                            </Typography>
                          </InfoRow>

                          <InfoRow>
                            {student.gender == "male" ? <MaleIcon sx={{ fontSize: 16, color: 'primary.male' }} /> : <FemaleIcon sx={{ fontSize: 16, color: 'primary.female' }} />}
                            <Typography variant="body2" color="text.secondary">
                              {student.gender}
                            </Typography>
                          </InfoRow>

                          <InfoRow>
                            <FamilyRestroomIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                            <Typography variant="body2" color="text.secondary" sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}>
                              {student.parent}
                            </Typography>
                          </InfoRow>

                          <InfoRow>
                            <PhoneIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                            <Typography variant="body2" color="text.secondary">
                              {student.parentNum}
                            </Typography>
                          </InfoRow>
                          <InfoRow>
                            <Box sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              borderRadius: 2,
                              mb: 2
                            }}>
                              <LockIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                              <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 500 }}>
                                Password:
                              </Typography>
                              <div className='flex items-center'>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontFamily: 'monospace',
                                    flex: 1,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  {passwordVisibility[student._id] ? student.password : '••••••••'}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={() => togglePasswordVisibility(student._id)}
                                  sx={{ ml: 1 }}
                                >
                                  {passwordVisibility[student._id] ?
                                    <VisibilityOffIcon sx={{ fontSize: 16 }} /> :
                                    <VisibilityIcon sx={{ fontSize: 16 }} />
                                  }
                                </IconButton>
                              </div>
                            </Box>
                          </InfoRow>
                        </Box>



                        <Box sx={{
                          display: 'flex',
                          gap: 1,
                          flexDirection: 'row'
                        }}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => handleEdit(student._id)}
                            fullWidth={isMobile}
                            sx={{ flex: 1 }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={deleteLoading[student._id] ?
                              <CircularProgress size={16} /> :
                              <DeleteIcon />
                            }
                            onClick={() => handleDelete(student._id)}
                            disabled={deleteLoading[student._id]}
                            fullWidth={isMobile}
                            sx={{ flex: 1 }}
                          >
                            Delete
                          </Button>
                        </Box>
                      </CardContent>
                    </StyledCard>
                  </Grid>
                ))}
              </Grid>
            )}
          </Container>
        )}

        {/* Edit Student Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={handleEditDialogClose}
          maxWidth="md"
          fullWidth
          fullScreen={isMobile}
          PaperProps={{
            sx: {
              bgcolor: 'background.paper',
              backgroundImage: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              border: '1px solid rgba(255, 152, 0, 0.12)',
            }
          }}
        >
          <DialogTitle sx={{
            borderBottom: '1px solid rgba(255, 152, 0, 0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <EditIcon color="primary" />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6">Edit Student</Typography>
              <Typography variant="body2" color="text.secondary">
                Update student information
              </Typography>
            </Box>
            <IconButton onClick={handleEditDialogClose}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ mt: { xs: 2, lg: 4 } }}>
            <Box
              component="form"
              onSubmit={editFormik.handleSubmit}
              sx={{ width: '100%' }}
            >
              <Grid container spacing={3}>
                <div className='flex flex-col w-full lg:flex-row lg:justify-center items-center gap-10 lg:items-start m-auto'>
                  {editImageUrl && (
                    <Grid item xs={12}>
                      <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                          Current Student Image
                        </Typography>
                        <CardMedia
                          component="img"
                          height="200"
                          image={editImageUrl}
                          alt="Current student"
                          sx={{
                            borderRadius: 2,
                            maxWidth: 300,
                            mx: 'auto',
                            objectFit: 'cover',
                          }}
                        />
                      </Box>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Box>
                      <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                        Update Student Image (Optional)
                      </Typography>
                      <input
                        type="file"
                        ref={editFileInputRef}
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={(e) => {
                          const selectedFile = e.target.files[0];
                          if (selectedFile) {
                            setEditFile(selectedFile);
                            const imageUrl = URL.createObjectURL(selectedFile);
                            setEditImageUrl(imageUrl);
                          }
                        }}
                      />
                      <Box sx={{ display: 'flex', gap: 2, flexDirection: isMobile ? 'column' : 'row' }}>
                        <Button
                          onClick={handleEditUploadClick}
                          startIcon={<CloudUploadIcon />}
                          variant={editFile ? "outlined" : "contained"}
                          fullWidth={isMobile}
                        >
                          {editFile ? 'Change Image' : 'Upload New Image'}
                        </Button>
                        {(editFile || editImageUrl !== originalEditImageUrl) && (
                          <Button
                            onClick={handleClearEditFile}
                            variant="contained"
                            startIcon={<CloseIcon />}
                            fullWidth={isMobile}
                          >
                            Reset Image
                          </Button>
                        )}
                      </Box>


                      {editFile && (
                        <Box sx={{ mt: 2 }}>
                          <Chip
                            label={editFile.name}
                            onDelete={() => {
                              setEditFile(null);
                              setEditImageUrl(originalEditImageUrl);
                              if (editFileInputRef.current) {
                                editFileInputRef.current.value = '';
                              }
                            }}
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                      )}
                    </Box>
                  </Grid>
                </div>
                <div className='flex flex-col items-center w-[100%] gap-5'>
                  <Grid className=" w-[90%] lg:w-1/2" item xs={12} sm={6}>
                    <TextField
                      name="name"
                      label="Student Name"
                      value={editFormik.values.name}
                      onChange={editFormik.handleChange}
                      onBlur={editFormik.handleBlur}
                      error={editFormik.touched.name && Boolean(editFormik.errors.name)}
                      helperText={editFormik.touched.name && editFormik.errors.name}
                      fullWidth
                    />
                  </Grid>

                  <Grid className=" w-[90%] lg:w-1/2" item xs={12} sm={6}>
                    <TextField
                      name="email"
                      label="Email address"
                      type="email"
                      value={editFormik.values.email}
                      onChange={editFormik.handleChange}
                      onBlur={editFormik.handleBlur}
                      error={editFormik.touched.email && Boolean(editFormik.errors.email)}
                      helperText={editFormik.touched.email && editFormik.errors.email}
                      fullWidth
                    />
                  </Grid>

                  <Grid className=" w-[90%] lg:w-1/2" item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Class</InputLabel>
                      <Select
                        value={editFormik.values.studentClass}
                        label="Class"
                        name="studentClass"
                        onChange={editFormik.handleChange}
                        onBlur={editFormik.handleBlur}
                        error={editFormik.touched.studentClass && Boolean(editFormik.errors.studentClass)}
                      >
                        {classes && classes.map((cls) => (
                          <MenuItem key={cls._id} value={cls._id}>{cls.classText}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <div className='flex w-[90%] lg:w-1/2 gap-5 justify-between'>
                    <Grid className="w-1/2" item xs={12} sm={6}>
                      <TextField
                        name="age"
                        label="Age"
                        value={editFormik.values.age}
                        onChange={editFormik.handleChange}
                        onBlur={editFormik.handleBlur}
                        error={editFormik.touched.age && Boolean(editFormik.errors.age)}
                        helperText={editFormik.touched.age && editFormik.errors.age}
                        fullWidth
                      />
                    </Grid>

                    <Grid className="w-1/2" item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Gender</InputLabel>
                        <Select
                          value={editFormik.values.gender}
                          label="Gender"
                          name="gender"
                          onChange={editFormik.handleChange}
                          onBlur={editFormik.handleBlur}
                          error={editFormik.touched.gender && Boolean(editFormik.errors.gender)}
                          displayEmpty
                          renderValue={(selected) => {
                            if (!selected) {
                              return <span style={{ color: '#999' }}>Select Gender</span>;
                            }
                            return selected;
                          }}
                        >
                          <MenuItem value="Male">Male</MenuItem>
                          <MenuItem value="Female">Female</MenuItem>
                          <MenuItem value="Other">Other</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                  </div>

                  <Grid item className=" w-[90%] lg:w-1/2" xs={12} sm={6}>
                    <TextField
                      name="parent"
                      label="Parent/Guardian Name"
                      value={editFormik.values.parent}
                      onChange={editFormik.handleChange}
                      onBlur={editFormik.handleBlur}
                      error={editFormik.touched.parent && Boolean(editFormik.errors.parent)}
                      helperText={editFormik.touched.parent && editFormik.errors.parent}
                      fullWidth
                    />
                  </Grid>

                  <Grid item className=" w-[90%] lg:w-1/2" xs={12}>
                    <TextField
                      name="parentNum"
                      label="Parent Phone Number"
                      value={editFormik.values.parentNum}
                      onChange={editFormik.handleChange}
                      onBlur={editFormik.handleBlur}
                      error={editFormik.touched.parentNum && Boolean(editFormik.errors.parentNum)}
                      helperText={editFormik.touched.parentNum && editFormik.errors.parentNum}
                      fullWidth
                    />
                  </Grid>
                </div>
              </Grid>
            </Box>
          </DialogContent>

          <DialogActions sx={{
            p: 3,
            borderTop: '1px solid rgba(255, 152, 0, 0.12)',
            flexDirection: 'row',
            gap: 2
          }}>
            <Button
              onClick={handleEditDialogClose}
              variant="outlined"
              fullWidth={isMobile}
              sx={{ minWidth: 120 }}
            >
              Cancel
            </Button>
            <GradientButton
              onClick={editFormik.handleSubmit}
              disabled={loading}
              fullWidth={isMobile}
              sx={{ minWidth: 120 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Update Student'}
            </GradientButton>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider >
  );
}