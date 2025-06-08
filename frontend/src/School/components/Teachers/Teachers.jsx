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
import {
  Button,
  CardMedia,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardActionArea,
  CardContent,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Chip,
  OutlinedInput,
  Container,
  Grid,
  Paper,
  Fade,
  Slide,
  Avatar,
  Divider,
  Tooltip,
  Badge,
  Stack,
  useMediaQuery,
  useTheme,
  Backdrop,
  Zoom
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import SchoolIcon from '@mui/icons-material/School';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { baseApi } from '../../../environment';
import EditIcon from '@mui/icons-material/Edit';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import WorkIcon from '@mui/icons-material/Work';
import CakeIcon from '@mui/icons-material/Cake';
import WcIcon from '@mui/icons-material/Wc';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ClassIcon from '@mui/icons-material/Class';
import LockIcon from '@mui/icons-material/Lock';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import Groups3Icon from "@mui/icons-material/Groups3";

// Enhanced dark theme with modern design
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FF6B35',
      light: '#FF8A65',
      male: '#1ca3f0',
      female: "#ef598e",
      dark: '#E64A19',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FFC107',
      light: '#FFD54F',
      dark: '#FFA000',
    },
    background: {
      default: 'linear-gradient(135deg, #0F0F23 0%, #1A1A2E 50%, #16213E 100%)',
      paper: 'rgba(30, 30, 46, 0.95)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#E0E0E0',
    },
    error: {
      main: '#FF5252',
    },
    success: {
      main: '#4CAF50',
    },
    info: {
      main: '#2196F3',
    },
    warning: {
      main: '#FF9800',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: '2.125rem',
      letterSpacing: '-0.025em',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
      letterSpacing: '-0.025em',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.3s ease',
            '&:hover fieldset': {
              borderColor: '#FF6B35',
              borderWidth: 2,
            },
            '&.Mui-focused fieldset': {
              borderColor: '#FF6B35',
              borderWidth: 2,
              boxShadow: '0 0 0 3px rgba(255, 107, 53, 0.1)',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#BBBBBB',
            '&.Mui-focused': {
              color: '#FF6B35',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          padding: '10px 24px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        contained: {
          background: 'linear-gradient(135deg, #FF6B35 0%, #FF8A65 100%)',
          boxShadow: '0 4px 14px 0 rgba(255, 107, 53, 0.39)',
          '&:hover': {
            background: 'linear-gradient(135deg, #E64A19 0%, #FF6B35 100%)',
            boxShadow: '0 6px 20px 0 rgba(255, 107, 53, 0.5)',
            transform: 'translateY(-2px)',
          },
        },
        outlined: {
          borderColor: '#FF6B35',
          color: '#FF6B35',
          borderWidth: 2,
          '&:hover': {
            borderColor: '#FF8A65',
            backgroundColor: 'rgba(255, 107, 53, 0.04)',
            borderWidth: 2,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(30, 30, 46, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 16,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(255, 107, 53, 0.3)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          fontSize: '0.75rem',
        },
        outlined: {
          '&.MuiChip-colorPrimary': {
            borderColor: '#FF6B35',
            color: '#FF6B35',
            backgroundColor: 'rgba(255, 107, 53, 0.1)',
          },
          '&.MuiChip-colorSecondary': {
            borderColor: '#FFC107',
            color: '#FFC107',
            backgroundColor: 'rgba(255, 193, 7, 0.1)',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: 'rgba(30, 30, 46, 0.98)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 16,
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
  },
});


const GlassCard = styled(Card)(({ theme }) => ({
  backdropFilter: 'blur(20px)',
  borderRadius: 15,
  overflow: 'hidden',
  position: 'relative',
}));

const TeacherCard = styled(Card)(({ theme }) => ({
  background: '#1e1e1e',
  backdropFilter: 'blur(20px)',
  width: "300px",
  borderRadius: 5,
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 107, 53, 0.2)',
    border: '2px solid rgba(255, 107, 53, 0.3)',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    background: 'rgba(255, 255, 255, 0.02)',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.04)',
    },
    '&.Mui-focused': {
      background: 'rgba(255, 255, 255, 0.06)',
    },
  },
}));

const IconBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1),
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
}));

// MENU ITEM PROPS
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
      background: 'rgba(30, 30, 46, 0.95)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
  },
};

// Teacher validation schema
import { teacherSchema } from '../../../yupSchema/teacherSchema';

export default function Teachers() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [form, setForm] = React.useState(false);
  const [file, setFile] = React.useState(null);
  const [imageUrl, setImageUrl] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [success, setSuccess] = React.useState(null);
  const [classes, setClasses] = React.useState([]);
  const [subjects, setSubjects] = React.useState([]);
  const [message, setMessage] = React.useState('');
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [currentTeacher, setCurrentTeacher] = React.useState(null);
  const [editFile, setEditFile] = React.useState(null);
  const [editImageUrl, setEditImageUrl] = React.useState(null);
  const [passwordVisibility, setPasswordVisibility] = React.useState({});
  const [fetchedTeacherIds, setFetchedTeacherIds] = React.useState(new Set());

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

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${baseApi}/subject/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setSubjects(response.data.data);
    } catch (err) {
      console.log(err);
      setError("Failed to fetch subjects");
    }
  };

  const [params, setParams] = React.useState({});
  const [filterClass, setFilterClass] = React.useState("");
  const [filterSubject, setFilterSubject] = React.useState("");
  const [search, setSearch] = React.useState("");

  const handleClass = (e) => {
    setParams((prevParams) => ({
      ...prevParams,
      teacherClass: e.target.value || undefined,
    }));
    setFilterClass(e.target.value);
  };

  const handleSubject = (e) => {
    setParams((prevParams) => ({
      ...prevParams,
      subject: e.target.value || undefined,
    }));
    setFilterSubject(e.target.value);
  };

  const handleSearch = (e) => {
    setParams((prevParams) => ({
      ...prevParams,
      search: e.target.value || undefined,
    }));
    setSearch(e.target.value);
  };

  const handleClearFilter = () => {
    setParams((prevParams) => ({
      ...prevParams,
      search: undefined,
      teacherClass: undefined,
      subject: undefined
    }));

    setSearch("");
    setFilterClass("");
    setFilterSubject("");
  };

  const [teachers, setTeachers] = React.useState([]);
  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${baseApi}/teacher/fetch-with-query`, {
        params,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setTeachers(response.data.teachers);

      const initialVisibility = {};
      response.data.teachers.forEach(teacher => {
        initialVisibility[teacher._id] = false;
      });
      setPasswordVisibility(initialVisibility);

      setFetchedTeacherIds(new Set());

    } catch (err) {
      console.log(err);
    }
  };

  React.useEffect(() => {
    fetchClasses();
    fetchSubjects();
    fetchTeachers();
  }, [params, message]);

  const addImage = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setImageUrl(URL.createObjectURL(selectedFile));
      setFile(selectedFile);
    }
  };

  const addEditImage = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setEditImageUrl(URL.createObjectURL(selectedFile));
      setEditFile(selectedFile);
    }
  };

  const fileInputRef = React.useRef(null);
  const hiddenFileInputRef = React.useRef(null);
  const editFileInputRef = React.useRef(null);

  const handleClearFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setFile(null);
    setImageUrl(null);
  };

  const handleClearEditFile = () => {
    if (editFileInputRef.current) {
      editFileInputRef.current.value = '';
    }
    if (editImageUrl && editImageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(editImageUrl);
    }
    setEditFile(null);
    setEditImageUrl(null);
  };

  const handleUploadClick = () => {
    hiddenFileInputRef.current.click();
  };

  const handleEditUploadClick = () => {
    editFileInputRef.current.click();
  };

  const togglePasswordVisibility = async (teacherId) => {
    if (!fetchedTeacherIds.has(teacherId)) {
      await fetchTeacherWithPassword(teacherId);
      setFetchedTeacherIds(prev => new Set([...prev, teacherId]));
    }

    setPasswordVisibility(prev => ({
      ...prev,
      [teacherId]: !prev[teacherId]
    }));
  };

  const initialValues = {
    email: "",
    name: "",
    qualification: "",
    age: "",
    gender: "",
    subjects: [],
    teacherClasses: [],
    password: "",
    confirmPassword: ""
  };

  const formik = useFormik({
    initialValues,
    validationSchema: teacherSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
        if (!file) {
          setError("Teacher image is required");
          setLoading(false);
          return;
        }

        const fd = new FormData();
        fd.append("image", file);
        fd.append("name", values.name);
        fd.append("email", values.email);
        fd.append("qualification", values.qualification);
        fd.append("age", values.age);
        fd.append("gender", values.gender);
        fd.append("password", values.password);

        if (values.subjects && values.subjects.length > 0) {
          fd.append("subjects", JSON.stringify(values.subjects));
        }

        if (values.teacherClasses && values.teacherClasses.length > 0) {
          fd.append("teacherClasses", JSON.stringify(values.teacherClasses));
        }

        const token = localStorage.getItem('token');
        await axios.post(
          `${baseApi}/teacher/register`,
          fd,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${token}`
            }
          }
        );

        setSuccess("Teacher registered successfully!");
        formik.resetForm();
        handleClearFile();
        setForm(false);
        fetchTeachers();
      } catch (error) {
        console.error("Registration error:", error);
        setError(error.response?.data?.message || "Registration failed");
      } finally {
        setLoading(false);
      }
    },
  });

  const handleCancel = () => {
    formik.resetForm();
    handleClearFile();
    setForm(false);
  }

  const editFormik = useFormik({
    initialValues: {
      email: "",
      name: "",
      qualification: "",
      age: "",
      gender: "",
      subjects: [],
      teacherClasses: [],
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
        fd.append("qualification", values.qualification);
        fd.append("age", values.age);
        fd.append("gender", values.gender);

        if (values.subjects && values.subjects.length > 0) {
          fd.append("subjects", JSON.stringify(values.subjects));
        }

        if (values.teacherClasses && values.teacherClasses.length > 0) {
          fd.append("teacherClasses", JSON.stringify(values.teacherClasses));
        }

        const token = localStorage.getItem('token');
        await axios.put(
          `${baseApi}/teacher/update/${currentTeacher._id}`,
          fd,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${token}`
            }
          }
        );

        setSuccess("Teacher updated successfully!");
        setEditDialogOpen(false);
        setMessage(`Teacher ${values.name} updated at ${new Date().toLocaleString()}`);
        handleClearEditFile();
        fetchTeachers();
      } catch (error) {
        console.error("Update error:", error);
        setError(error.response?.data?.message || "Update failed");
      } finally {
        setLoading(false);
      }
    },
  });

  const handleEdit = (id) => {
    const teacherToEdit = teachers.find(teacher => teacher._id === id);
    if (!teacherToEdit) return;

    setCurrentTeacher(teacherToEdit);

    editFormik.setValues({
      email: teacherToEdit.email || "",
      name: teacherToEdit.name || "",
      qualification: teacherToEdit.qualification || "",
      age: teacherToEdit.age || "",
      gender: teacherToEdit.gender || "",
      subjects: teacherToEdit.subjects?.map(subject =>
        typeof subject === 'object' ? subject._id : subject
      ) || [],
      teacherClasses: teacherToEdit.teacherClasses?.map(cls =>
        typeof cls === 'object' ? cls._id : cls
      ) || [],
    });

    if (teacherToEdit.teacherImg) {
      setEditImageUrl(teacherToEdit.teacherImg);
    } else {
      setEditImageUrl(null);
    }

    setEditDialogOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${baseApi}/teacher/delete/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setSuccess("Teacher deleted Successfully");
      setMessage(response.data.message);
      fetchTeachers();
    } catch (err) {
      setError("Teacher is not Deleted");
      console.log(err);
    }
  };

  const fetchTeacherWithPassword = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${baseApi}/teacher/fetch/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setTeachers(prevTeachers =>
        prevTeachers.map(teacher =>
          teacher._id === id ? response.data.teacher : teacher
        )
      );
    } catch (err) {
      console.error("Failed to fetch teacher details:", err);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <div>
        <div>
          <div className='flex lg:px-5 justify-between lg:items-center lg:w-[100%] flex-col lg:flex-row mb-3 lg:mb-0'>
            {/* Header */}
            {!form && (
              <Fade in={!form}>
                <Box className="flex gap-[16px] items-center p-5" sx={{ textAlign: 'center'}}>
                  <Avatar sx={{
                    bgcolor: 'primary.main',
                    width: isMobile ? 40 : 56,
                    height: isMobile ? 40 : 56,
                    color: 'black'
                  }}>
                    <Groups3Icon sx={{ fontSize: isMobile ? 20 : 28 }} />
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
                      Teacher Management
                    </Typography>
                    <Typography variant="body2" sx={{ textAlign: "left", paddingLeft: "7px" }} color="text.secondary">
                      Manage and organize Teacher Data
                    </Typography>
                  </Box>

                </Box>
              </Fade>
            )}

            {/* Floating Action Button */}
            {!form && (
              isMobile ? (
                <div className="flex justify-end mb-2 w-full">
                  <Button
                    onClick={() => setForm(true)}
                    startIcon={<PersonAddIcon />}
                    size="small"
                    variant="outlined"
                    sx={{ borderRadius: "10px" }}
                  >
                    Add Teacher
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setForm(true)}
                  startIcon={<PersonAddIcon />}
                  size="medium"
                  variant="outlined"
                  sx={{ height: "50px", borderRadius:"5px" }}
                >
                  Add Teacher
                </Button>
              )
            )}
          </div>

          <Divider sx={{ mb: 2, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />

          {/* Success/Error Messages */}
          {message && (
            <Fade in={Boolean(message)}>
              <Alert
                severity="success"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  '& .MuiAlert-icon': { color: '#4CAF50' }
                }}
                onClose={() => setMessage('')}
              >
                {message}
              </Alert>
            </Fade>
          )}


          {/* Teacher Registration Form */}
          {form && (
            <Slide direction="down" in={form} mountOnEnter unmountOnExit>
              <GlassCard sx={{ maxWidth: 800, mx: 'auto', p: { xs: 2, sm: 4 }, mb: 4 }}>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #FF6B35, #FFC107)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  <SchoolIcon sx={{ mr: 1, color: '#FF6B35' }} />
                  Add New Teacher
                </Typography>

                {error && (
                  <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}
                {success && (
                  <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                    {success}
                  </Alert>
                )}

                <form onSubmit={formik.handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <StyledTextField
                        fullWidth
                        label="Teacher Name"
                        name="name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.name && Boolean(formik.errors.name)}
                        helperText={formik.touched.name && formik.errors.name}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <StyledTextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.email && Boolean(formik.errors.email)}
                        helperText={formik.touched.email && formik.errors.email}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <StyledTextField
                        fullWidth
                        label="Qualification"
                        name="qualification"
                        value={formik.values.qualification}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.qualification && Boolean(formik.errors.qualification)}
                        helperText={formik.touched.qualification && formik.errors.qualification}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <StyledTextField
                        fullWidth
                        label="Age"
                        name="age"
                        type="number"
                        value={formik.values.age}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.age && Boolean(formik.errors.age)}
                        helperText={formik.touched.age && formik.errors.age}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth error={formik.touched.gender && Boolean(formik.errors.gender)}>
                        <InputLabel>Gender</InputLabel>
                        <Select
                          value={formik.values.gender}
                          name="gender"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          input={<OutlinedInput label="Gender" />}
                          sx={{
                            borderRadius: 3,
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(255, 255, 255, 0.23)',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#FF6B35',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#FF6B35',
                            },
                          }}
                        >
                          <MenuItem value="Male">Male</MenuItem>
                          <MenuItem value="Female">Female</MenuItem>
                          <MenuItem value="Other">Other</MenuItem>
                        </Select>
                        {formik.touched.gender && formik.errors.gender && (
                          <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                            {formik.errors.gender}
                          </Typography>
                        )}
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <StyledTextField
                        fullWidth
                        label="Password"
                        name="password"
                        type="password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.password && Boolean(formik.errors.password)}
                        helperText={formik.touched.password && formik.errors.password}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <StyledTextField
                        fullWidth
                        label="Confirm Password"
                        name="confirmPassword"
                        type="password"
                        value={formik.values.confirmPassword}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                        helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth error={formik.touched.subjects && Boolean(formik.errors.subjects)}>
                        <InputLabel>Subjects</InputLabel>
                        <Select
                          multiple
                          value={formik.values.subjects}
                          name="subjects"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          input={<OutlinedInput label="Subjects" />}
                          MenuProps={MenuProps}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => {
                                const subject = subjects.find(s => s._id === value);
                                return (
                                  <Chip
                                    key={value}
                                    label={subject?.name || value}
                                    size="small"
                                    variant="outlined"
                                    color="primary"
                                  />
                                );
                              })}
                            </Box>
                          )}
                          sx={{
                            borderRadius: 3,
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(255, 255, 255, 0.23)',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#FF6B35',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#FF6B35',
                            },
                          }}
                        >
                          {subjects.map((subject) => (
                            <MenuItem key={subject._id} value={subject._id}>
                              {subject.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {formik.touched.subjects && formik.errors.subjects && (
                          <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                            {formik.errors.subjects}
                          </Typography>
                        )}
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth error={formik.touched.teacherClasses && Boolean(formik.errors.teacherClasses)}>
                        <InputLabel>Classes</InputLabel>
                        <Select
                          multiple
                          value={formik.values.teacherClasses}
                          name="teacherClasses"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          input={<OutlinedInput label="Classes" />}
                          MenuProps={MenuProps}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => {
                                const cls = classes.find(c => c._id === value);
                                return (
                                  <Chip
                                    key={value}
                                    label={cls?.name || value}
                                    size="small"
                                    variant="outlined"
                                    color="secondary"
                                  />
                                );
                              })}
                            </Box>
                          )}
                          sx={{
                            borderRadius: 3,
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(255, 255, 255, 0.23)',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#FF6B35',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#FF6B35',
                            },
                          }}
                        >
                          {classes.map((cls) => (
                            <MenuItem key={cls._id} value={cls._id}>
                              {cls.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {formik.touched.teacherClasses && formik.errors.teacherClasses && (
                          <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                            {formik.errors.teacherClasses}
                          </Typography>
                        )}
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
                          Teacher Image
                        </Typography>

                        <input
                          type="file"
                          accept="image/*"
                          onChange={addImage}
                          style={{ display: 'none' }}
                          ref={hiddenFileInputRef}
                        />

                        {imageUrl ? (
                          <Box sx={{ position: 'relative', display: 'inline-block' }}>
                            <Avatar
                              src={imageUrl}
                              sx={{
                                width: 120,
                                height: 120,
                                mb: 2,
                                border: '3px solid #FF6B35',
                                boxShadow: '0 8px 32px rgba(255, 107, 53, 0.3)'
                              }}
                            />
                            <IconButton
                              onClick={handleClearFile}
                              sx={{
                                position: 'absolute',
                                top: -5,
                                right: -5,
                                bgcolor: 'error.main',
                                color: 'white',
                                width: 32,
                                height: 32,
                                '&:hover': { bgcolor: 'error.dark' }
                              }}
                            >
                              <CloseIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Box>
                        ) : (
                          <Box
                            onClick={handleUploadClick}
                            sx={{
                              border: '2px dashed #FF6B35',
                              borderRadius: 2,
                              p: 4,
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                borderColor: '#FF8A65',
                                bgcolor: 'rgba(255, 107, 53, 0.05)'
                              }
                            }}
                          >
                            <CloudUploadIcon sx={{ fontSize: 48, color: '#FF6B35', mb: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              Click to upload teacher image
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <Stack direction="row" spacing={2} justifyContent="center">
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={loading}
                          startIcon={loading ? <CircularProgress size={20} /> : <SchoolIcon />}
                          sx={{ minWidth: 140 }}
                        >
                          {loading ? 'Adding...' : 'Add Teacher'}
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={handleCancel}
                          disabled={loading}
                          sx={{ minWidth: 140 }}
                        >
                          Cancel
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </form>
              </GlassCard>
            </Slide>
          )}

          {!form && (
            <div className='min-h-20 p-2'>
              <div className='flex flex-col lg:flex-row justify-between w-[100%]'>
                <div className=' flex justify-center items-center mb-4'>
                  <Typography variant="body1" color="text.secondary" textAlign="center">
                    {teachers.length} student{teachers.length !== 1 ? 's' : ''} found
                  </Typography>
                </div>
                <div className="flex justify-evenly flex-col lg:flex-row items-center gap-5 lg:gap-2 lg:p-2">
                  <div className='order-1'>
                    {(filterClass || filterSubject) && <Grid item xs={12} sm={12} md={3}>
                      <Button
                        onClick={handleClearFilter}
                        variant="outlined"
                        sx={{ height: "50px" }}

                      >
                        <CloseIcon />
                      </Button>
                    </Grid>}
                  </div>
                  <Grid  sx={{ width: { lg: "300px", xs: "250px" } }} xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      placeholder="Search Teachers..."
                      value={search}
                      onChange={handleSearch}
                      InputProps={{
                        startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  </Grid>
                  <div className='flex gap-5 w-[100%]'>
                    <div className='w-1/2'>
                      <FormControl fullWidth>
                        <InputLabel>Filter by Class</InputLabel>
                        <Select
                          value={filterClass}
                          label="Filter by Class"
                          onChange={handleClass}
                          sx={{ width: { xs: "100%", lg: "100%" } }}
                        >
                          <MenuItem value="">All Classes</MenuItem>
                          {classes && classes.map((cls) => (
                            <MenuItem key={cls._id} value={cls._id}>{cls.classText}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </div>
                    <div className='w-1/2'>
                      <FormControl fullWidth>
                        <InputLabel>Filter by Subject</InputLabel>
                        <Select
                          value={filterSubject}
                          label="Filter by Subject"
                          onChange={handleSubject}
                          sx={{ width: { xs: "100%", lg: "200px" } }}
                        >
                          <MenuItem value="">All Subjects</MenuItem>
                          {subjects && subjects.map((subject) => (
                            <MenuItem key={subject._id} value={subject._id}>{subject.subjectName}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Teachers Grid */}
          {!form && (
            <Fade in={!form}>
              <div className='flex flex-wrap gap-5 mt-5 lg:mt-10 justify-center'>
                {teachers.length === 0 ? (
                  <Grid item xs={12}>
                    <Paper
                      sx={{
                        p: 8,
                        textAlign: 'center',
                        background: 'rgba(30, 30, 46, 0.8)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 4,
                      }}
                    >
                      <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No Teachers Found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {search || filterClass || filterSubject
                          ? "Try adjusting your search or filters"
                          : "Add your first teacher to get started"
                        }
                      </Typography>
                    </Paper>
                  </Grid>
                ) : (
                  teachers.map((teacher, index) => (
                    <div>
                      <TeacherCard>
                        <div className='p-5'>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar
                              src={teacher.teacherImg}
                              sx={{
                                width: 100,
                                height: 100,
                                mr: 2,
                                border: '2px solid #FF6B35',
                              }}
                            >
                              <PersonIcon />
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" noWrap>
                                {teacher.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {teacher.qualification}
                              </Typography>
                            </Box>
                          </Box>

                          <Divider sx={{ mb: 2, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />

                          <Stack spacing={1}>
                            <IconBox>
                              <EmailIcon sx={{ fontSize: 16 }} />
                              <Typography variant="body2" noWrap>
                                {teacher.email}
                              </Typography>
                            </IconBox>

                            <IconBox>
                              <CakeIcon sx={{ fontSize: 16 }} />
                              <Typography variant="body2">
                                {teacher.age} years old
                              </Typography>
                            </IconBox>

                            <IconBox>
                              {teacher.gender == "male" ? <MaleIcon sx={{ fontSize: 16, color: 'primary.male' }} /> : <FemaleIcon sx={{ fontSize: 16, color: 'primary.female' }} />}
                              <Typography variant="body2">
                                {teacher.gender}
                              </Typography>
                            </IconBox>

                            {teacher.subjects && teacher.subjects.length > 0 && (
                              <Box>
                                <IconBox>
                                  <MenuBookIcon sx={{ fontSize: 16 }} />
                                  <Typography variant="body2">Subjects:</Typography>
                                </IconBox>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                  {teacher.subjects.map((subject, idx) => (
                                    <Chip
                                      key={idx}
                                      label={typeof subject === 'object' ? subject.subjectName : subject}
                                      size="small"
                                      variant="outlined"
                                      color="primary"
                                    />
                                  ))}
                                </Box>
                              </Box>
                            )}

                            {teacher.teacherClasses && teacher.teacherClasses.length > 0 && (
                              <Box>
                                <IconBox>
                                  <ClassIcon sx={{ fontSize: 16 }} />
                                  <Typography variant="body2">Classes:</Typography>
                                </IconBox>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                  {teacher.teacherClasses.map((cls, idx) => (
                                    <Chip
                                      key={idx}
                                      label={typeof cls === 'object' ? cls.classText : cls}
                                      size="small"
                                      variant="outlined"
                                      color="secondary"
                                    />
                                  ))}
                                </Box>
                              </Box>
                            )}

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LockIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" sx={{ flex: 1 }}>
                                {passwordVisibility[teacher._id] ? teacher.password || 'Not available' : '••••••••'}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => togglePasswordVisibility(teacher._id)}
                                sx={{ color: 'text.secondary' }}
                              >
                                {passwordVisibility[teacher._id] ? (
                                  <VisibilityOffIcon sx={{ fontSize: 16 }} />
                                ) : (
                                  <VisibilityIcon sx={{ fontSize: 16 }} />
                                )}
                              </IconButton>
                            </Box>
                          </Stack>

                          <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<EditIcon />}
                              onClick={() => handleEdit(teacher._id)}
                              sx={{ flex: 1 }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              color="error"
                              startIcon={<PersonRemoveIcon />}
                              onClick={() => handleDelete(teacher._id)}
                              sx={{ flex: 1 }}
                            >
                              Delete
                            </Button>
                          </Stack>
                        </div>
                      </TeacherCard>
                    </div>
                  ))
                )}
              </div>
            </Fade>
          )}
        </div>

        {/* Edit Teacher Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: 'rgba(30, 30, 46, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }
          }}
        >
          <DialogTitle>
            <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
              <EditIcon sx={{ mr: 1, color: '#FF6B35' }} />
              Edit Teacher
            </Typography>
          </DialogTitle>

          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                {success}
              </Alert>
            )}

            <form onSubmit={editFormik.handleSubmit}>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    fullWidth
                    label="Teacher Name"
                    name="name"
                    value={editFormik.values.name}
                    onChange={editFormik.handleChange}
                    onBlur={editFormik.handleBlur}
                    error={editFormik.touched.name && Boolean(editFormik.errors.name)}
                    helperText={editFormik.touched.name && editFormik.errors.name}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={editFormik.values.email}
                    onChange={editFormik.handleChange}
                    onBlur={editFormik.handleBlur}
                    error={editFormik.touched.email && Boolean(editFormik.errors.email)}
                    helperText={editFormik.touched.email && editFormik.errors.email}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    fullWidth
                    label="Qualification"
                    name="qualification"
                    value={editFormik.values.qualification}
                    onChange={editFormik.handleChange}
                    onBlur={editFormik.handleBlur}
                    error={editFormik.touched.qualification && Boolean(editFormik.errors.qualification)}
                    helperText={editFormik.touched.qualification && editFormik.errors.qualification}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    fullWidth
                    label="Age"
                    name="age"
                    type="number"
                    value={editFormik.values.age}
                    onChange={editFormik.handleChange}
                    onBlur={editFormik.handleBlur}
                    error={editFormik.touched.age && Boolean(editFormik.errors.age)}
                    helperText={editFormik.touched.age && editFormik.errors.age}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      value={editFormik.values.gender}
                      name="gender"
                      onChange={editFormik.handleChange}
                      onBlur={editFormik.handleBlur}
                      input={<OutlinedInput label="Gender" />}
                    >
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Subjects</InputLabel>
                    <Select
                      multiple
                      value={editFormik.values.subjects}
                      name="subjects"
                      onChange={editFormik.handleChange}
                      input={<OutlinedInput label="Subjects" />}
                      MenuProps={MenuProps}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => {
                            const subject = subjects.find(s => s._id === value);
                            return (
                              <Chip
                                key={value}
                                label={subject?.name || value}
                                size="small"
                                variant="outlined"
                                color="primary"
                              />
                            );
                          })}
                        </Box>
                      )}
                    >
                      {subjects.map((subject) => (
                        <MenuItem key={subject._id} value={subject._id}>
                          {subject.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Classes</InputLabel>
                    <Select
                      multiple
                      value={editFormik.values.teacherClasses}
                      name="teacherClasses"
                      onChange={editFormik.handleChange}
                      input={<OutlinedInput label="Classes" />}
                      MenuProps={MenuProps}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => {
                            const cls = classes.find(c => c._id === value);
                            return (
                              <Chip
                                key={value}
                                label={cls?.name || value}
                                size="small"
                                variant="outlined"
                                color="secondary"
                              />
                            );
                          })}
                        </Box>
                      )}
                    >
                      {classes.map((cls) => (
                        <MenuItem key={cls._id} value={cls._id}>
                          {cls.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
                      Teacher Image
                    </Typography>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={addEditImage}
                      style={{ display: 'none' }}
                      ref={editFileInputRef}
                    />

                    {editImageUrl ? (
                      <Box sx={{ position: 'relative', display: 'inline-block' }}>
                        <Avatar
                          src={editImageUrl}
                          sx={{
                            width: 120,
                            height: 120,
                            mb: 2,
                            border: '3px solid #FF6B35',
                            boxShadow: '0 8px 32px rgba(255, 107, 53, 0.3)'
                          }}
                        />
                        <IconButton
                          onClick={handleClearEditFile}
                          sx={{
                            position: 'absolute',
                            top: -5,
                            right: -5,
                            bgcolor: 'error.main',
                            color: 'white',
                            width: 32,
                            height: 32,
                            '&:hover': { bgcolor: 'error.dark' }
                          }}
                        >
                          <CloseIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                    ) : (
                      <Box
                        onClick={handleEditUploadClick}
                        sx={{
                          border: '2px dashed #FF6B35',
                          borderRadius: 2,
                          p: 4,
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: '#FF8A65',
                            bgcolor: 'rgba(255, 107, 53, 0.05)'
                          }
                        }}
                      >
                        <CloudUploadIcon sx={{ fontSize: 48, color: '#FF6B35', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          Click to upload new image
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </form>
          </DialogContent>

          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => setEditDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={editFormik.handleSubmit}
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <EditIcon />}
            >
              {loading ? 'Updating...' : 'Update Teacher'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Loading Backdrop */}
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </div>
    </ThemeProvider>
  );
}