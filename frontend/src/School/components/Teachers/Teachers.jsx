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
import { Button, CardMedia, Typography, Alert, CircularProgress, Card, CardActionArea, CardContent, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, Chip, OutlinedInput } from '@mui/material';
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

// MENU ITEM PROPS
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

// Teacher validation schema
import { teacherSchema } from '../../../yupSchema/teacherSchema';

export default function Teachers() {
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

      // Store the fetched teachers
      setTeachers(response.data.teachers);

      // Initialize password visibility state for all teachers
      const initialVisibility = {};
      response.data.teachers.forEach(teacher => {
        initialVisibility[teacher._id] = false;
      });
      setPasswordVisibility(initialVisibility);

      // Reset the set of fetched teacher ids
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
    setFile(null);
    setImageUrl(null);
  };

  const handleClearEditFile = () => {
    if (editFileInputRef.current) {
      editFileInputRef.current.value = '';
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
    // If we haven't fetched this teacher's password yet, fetch it first
    if (!fetchedTeacherIds.has(teacherId)) {
      await fetchTeacherWithPassword(teacherId);
      setFetchedTeacherIds(prev => new Set([...prev, teacherId]));
    }

    // Toggle password visibility
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

        // Add subjects as JSON array if selected
        if (values.subjects && values.subjects.length > 0) {
          fd.append("subjects", JSON.stringify(values.subjects));
        }

        // Add multiple classes if selected
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

        // Refresh teacher list
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

  // Edit form setup
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

        // Only append the image if a new one is selected
        if (editFile) {
          fd.append("image", editFile);
        }

        fd.append("name", values.name);
        fd.append("email", values.email);
        fd.append("qualification", values.qualification);
        fd.append("age", values.age);
        fd.append("gender", values.gender);

        // Add subjects as JSON array if selected
        if (values.subjects && values.subjects.length > 0) {
          fd.append("subjects", JSON.stringify(values.subjects));
        }

        // Add multiple classes if selected
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

        // Refresh teacher list
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
    // Find the teacher by id
    const teacherToEdit = teachers.find(teacher => teacher._id === id);
    if (!teacherToEdit) return;

    // Set the current teacher
    setCurrentTeacher(teacherToEdit);

    // Set the edit form initial values
    editFormik.setValues({
      email: teacherToEdit.email || "",
      name: teacherToEdit.name || "",
      qualification: teacherToEdit.qualification || "",
      age: teacherToEdit.age || "",
      gender: teacherToEdit.gender || "",
      // Convert subjects array properly
      subjects: teacherToEdit.subjects?.map(subject =>
        typeof subject === 'object' ? subject._id : subject
      ) || [],
      // Transform teacherClasses array if it exists
      teacherClasses: teacherToEdit.teacherClasses?.map(cls =>
        typeof cls === 'object' ? cls._id : cls
      ) || [],
    });

    // Set the image preview if available
    if (teacherToEdit.teacherImg) {
      setEditImageUrl(`/images/uploaded/teacher/${teacherToEdit.teacherImg}`);
    } else {
      setEditImageUrl(null);
    }

    // Open the edit dialog
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

      // Refresh teacher list after deletion
      fetchTeachers();
    } catch (err) {
      setError("Teacher is not Deleted");
      console.log(err);
    }
  };

  // Fetch single teacher with password for display
  const fetchTeacherWithPassword = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${baseApi}/teacher/fetch/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Update the teacher in the teachers array
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
      <div className='min-h-screen pt-25 bg-gray-900 relative'>
        {message && <Alert severity="success" sx={{ m: 2 }}>{message}</Alert>}

        {!form && <Button onClick={() => setForm(true)}
          sx={{
            mt: 1,
            py: 1.5,
            textTransform: 'uppercase',
            fontWeight: 'bold',
            color: "black",
            position: "absolute",
            right: "30px",
            top: "80px"
          }}
          className="bg-gradient-to-r from-amber-500 to-orange-600">
          <Typography>
            + Add Teacher
          </Typography>
        </Button>}
        {form &&
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
              onSubmit={formik.handleSubmit}
            >
              <div className="flex items-center justify-center mb-4">
                <SchoolIcon sx={{ color: '#FF9800', fontSize: 40, mr: 1 }} />
                <Typography variant="h5" gutterBottom sx={{ color: 'text.primary', m: 0 }}>
                  Add New Teacher
                </Typography>
              </div>
              <Typography variant="body2" className="text-gray-400 text-center mb-6">
                Register a teacher in the School Management System
              </Typography>

              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

              <TextField
                name="name"
                label="Teacher Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
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
                name="qualification"
                label="Qualification"
                value={formik.values.qualification}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.qualification && Boolean(formik.errors.qualification)}
                helperText={formik.touched.qualification && formik.errors.qualification}
                sx={{ mb: 2 }}
              />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="subjects-select-label">Subjects (Optional)</InputLabel>
                <Select
                  labelId="subjects-select-label"
                  id="subjects-select"
                  value={formik.values.subjects}
                  multiple
                  input={<OutlinedInput label="Subjects" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const subjectObj = subjects.find(s => s._id === value);
                        return (
                          <Chip key={value} label={subjectObj ? subjectObj.subjectName : value} />
                        );
                      })}
                    </Box>
                  )}
                  MenuProps={MenuProps}
                  name="subjects"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  {subjects && subjects.map((subject) => (
                    <MenuItem key={subject._id} value={subject._id}>{subject.subjectName}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="class-select-label">Classes (Optional)</InputLabel>
                <Select
                  labelId="class-select-label"
                  id="class-select"
                  value={formik.values.teacherClasses}
                  multiple
                  input={<OutlinedInput label="Classes" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const classObj = classes.find(c => c._id === value);
                        return (
                          <Chip key={value} label={classObj ? classObj.classText : value} />
                        );
                      })}
                    </Box>
                  )}
                  MenuProps={MenuProps}
                  name="teacherClasses"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  {classes && classes.map((cls) => (
                    <MenuItem key={cls._id} value={cls._id}>
                      {cls.classText}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="gender-select-label">Gender</InputLabel>
                <Select
                  labelId="gender-select-label"
                  id="gender-select"
                  value={formik.values.gender}
                  label="Gender"
                  name="gender"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.gender && Boolean(formik.errors.gender)}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
                {formik.touched.gender && formik.errors.gender && (
                  <Typography color="error" variant="caption" sx={{ mt: 1, ml: 2 }}>
                    {formik.errors.gender}
                  </Typography>
                )}
              </FormControl>

              <TextField
                name="age"
                label="Age"
                value={formik.values.age}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.age && Boolean(formik.errors.age)}
                helperText={formik.touched.age && formik.errors.age}
                sx={{ mb: 2 }}
              />

              <TextField
                type="password"
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
                type="password"
                name="confirmPassword"
                label="Confirm password"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                sx={{ mb: 3 }}
              />

              <Typography className="text-gray-300 mb-1">Teacher Image</Typography>
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
                  startIcon={<CloudUploadIcon />}
                  className="bg-amber-500 flex justify-center items-center h-10 gap-5"
                >
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
                    component="img"
                    image={imageUrl}
                    alt="Teacher preview"
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

              <Button
                type="submit"
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
                {loading ? <CircularProgress size={24} /> : 'Add Teacher'}
              </Button>
              <Button
                onClick={() => handleCancel()}
                sx={{
                  mt: 1,
                  py: 1.5,
                  textTransform: 'uppercase',
                  fontWeight: 'bold',
                  color: "black"
                }}
                className="bg-gradient-to-r from-amber-500 to-orange-600"
              >
                Cancel
              </Button>
            </Box>
          </div>
        }
        <Box sx={{ margin: "auto", marginTop: "10px" }} className="flex w-[60%] h-15 justify-center items-center gap-3">
          <TextField
            label="Search"
            value={search}
            onChange={(e) => {
              handleSearch(e)
            }}
            sx={{ mb: 2 }}
            className='w-2/4'
          />

          <FormControl className='w-1/2' sx={{ mb: 2 }}>
            <InputLabel id="class-filter-label">Class</InputLabel>
            <Select
              labelId="class-filter-label"
              label="Class"
              value={filterClass}
              onChange={(e) => {
                handleClass(e)
              }}
            >
              <MenuItem value="">None</MenuItem>

              {classes && classes.map((cls) => (
                <MenuItem key={cls._id} value={cls._id}>{cls.classText}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl className='w-1/2' sx={{ mb: 2 }}>
            <InputLabel id="subject-filter-label">Subject</InputLabel>
            <Select
              labelId="subject-filter-label"
              label="Subject"
              value={filterSubject}
              onChange={(e) => {
                handleSubject(e)
              }}
            >
              <MenuItem value="">None</MenuItem>

              {subjects && subjects.map((subject) => (
                <MenuItem key={subject._id} value={subject._id}>{subject.subjectName}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button sx={{ mb: 2, border: "2px solid gray", }} className='w-1/4 h-[100%]' onClick={() => handleClearFilter()}>Clear Filter</Button>
        </Box>

        <Box sx={{ margin: "auto" }} className="flex w-[90%] pt-10 flex-wrap justify-center items-center gap-3">
          {teachers && teachers.map(teacher => {
            return (
              <Card key={teacher._id} sx={{ maxWidth: 345 }}>
                <CardActionArea>
                  <CardMedia
                    component="img"
                    height="140"
                    image={`/images/uploaded/teacher/${teacher.teacherImg}`}
                    alt={teacher.name}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      {teacher.name}
                    </Typography>
                    <ul>
                      <li><b>Email : </b>{teacher.email}</li>
                      <li><b>Qualification : </b>{teacher.qualification}</li>
                      <li><b>Subjects : </b>
                        {teacher.subjects && teacher.subjects.length > 0
                          ? teacher.subjects.map(subject =>
                            typeof subject === 'object' ? subject.subjectName : 'Loading...'
                          ).join(', ')
                          : 'Not assigned'}
                      </li>
                      <li><b>Classes : </b>
                        {teacher.teacherClasses && teacher.teacherClasses.length > 0
                          ? teacher.teacherClasses.map(cls =>
                            typeof cls === 'object' ? cls.classText : 'Loading...'
                          ).join(', ')
                          : 'Not assigned'}
                      </li>
                      <li><b>Age : </b>{teacher.age}</li>
                      <li><b>Gender : </b>{teacher.gender && teacher.gender.charAt(0).toUpperCase() + teacher.gender.slice(1)}</li>
                      <li className="flex items-center">
                        <b>Password : </b>
                        <span className="ml-1">
                          {fetchedTeacherIds.has(teacher._id) ?
                            (passwordVisibility[teacher._id] ? teacher.password : '••••••••') :
                            '••••••••'}
                        </span>
                        <IconButton
                          size="small"
                          onClick={() => togglePasswordVisibility(teacher._id)}
                          sx={{ ml: 1 }}
                        >
                          {passwordVisibility[teacher._id] ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </li>
                    </ul>
                    <Box className="flex justify-end gap-2 mt-3">
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<EditIcon />}
                        onClick={() => handleEdit(teacher._id)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<PersonRemoveIcon />}
                        onClick={() => handleDelete(teacher._id)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            );
          })}
        </Box>
      </div>

      {/* Edit Teacher Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
      >
        <DialogTitle>
          Edit Teacher
          <IconButton
            aria-label="close"
            onClick={() => setEditDialogOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box
            component="form"
            sx={{
              '& > :not(style)': { m: 1 },
              display: "flex",
              flexDirection: "column",
              width: "100%",
              minWidth: '300px',
            }}
            noValidate
            autoComplete="off"
            onSubmit={editFormik.handleSubmit}
          >
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TextField
              name="name"
              label="Teacher Name"
              value={editFormik.values.name}
              onChange={editFormik.handleChange}
              onBlur={editFormik.handleBlur}
              error={editFormik.touched.name && Boolean(editFormik.errors.name)}
              helperText={editFormik.touched.name && editFormik.errors.name}
              sx={{ mb: 2, mt: 2 }}
            />

            <TextField
              name="email"
              label="Email address"
              type="email"
              value={editFormik.values.email}
              onChange={editFormik.handleChange}
              onBlur={editFormik.handleBlur}
              error={editFormik.touched.email && Boolean(editFormik.errors.email)}
              helperText={editFormik.touched.email && editFormik.errors.email}
              sx={{ mb: 2 }}
            />

            <TextField
              name="qualification"
              label="Qualification"
              value={editFormik.values.qualification}
              onChange={editFormik.handleChange}
              onBlur={editFormik.handleBlur}
              error={editFormik.touched.qualification && Boolean(editFormik.errors.qualification)}
              helperText={editFormik.touched.qualification && editFormik.errors.qualification}
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="edit-subjects-select-label">Subjects</InputLabel>
              <Select
                labelId="edit-subjects-select-label"
                id="edit-subjects-select"
                value={editFormik.values.subjects}
                multiple
                input={<OutlinedInput label="Subjects" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const subjectObj = subjects.find(s => s._id === value);
                      return (
                        <Chip key={value} label={subjectObj ? subjectObj.subjectName : value} />
                      );
                    })}
                  </Box>
                )}
                MenuProps={MenuProps}
                name="subjects"
                onChange={editFormik.handleChange}
                onBlur={editFormik.handleBlur}
              >
                {subjects && subjects.map((subject) => (
                  <MenuItem key={subject._id} value={subject._id}>{subject.subjectName}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="edit-class-select-label">Classes</InputLabel>
              <Select
                labelId="edit-class-select-label"
                id="edit-class-select"
                value={editFormik.values.teacherClasses}
                multiple
                input={<OutlinedInput label="Classes" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const classObj = classes.find(c => c._id === value);
                      return (
                        <Chip key={value} label={classObj ? classObj.classText : value} />
                      );
                    })}
                  </Box>
                )}
                MenuProps={MenuProps}
                name="teacherClasses"
                onChange={editFormik.handleChange}
                onBlur={editFormik.handleBlur}
              >
                {classes && classes.map((cls) => (
                  <MenuItem key={cls._id} value={cls._id}>
                    {cls.classText}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="edit-gender-select-label">Gender</InputLabel>
              <Select
                labelId="edit-gender-select-label"
                id="edit-gender-select"
                value={editFormik.values.gender}
                label="Gender"
                name="gender"
                onChange={editFormik.handleChange}
                onBlur={editFormik.handleBlur}
                error={editFormik.touched.gender && Boolean(editFormik.errors.gender)}
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
              {editFormik.touched.gender && editFormik.errors.gender && (
                <Typography color="error" variant="caption" sx={{ mt: 1, ml: 2 }}>
                  {editFormik.errors.gender}
                </Typography>
              )}
            </FormControl>

            <TextField
              name="age"
              label="Age"
              value={editFormik.values.age}
              onChange={editFormik.handleChange}
              onBlur={editFormik.handleBlur}
              error={editFormik.touched.age && Boolean(editFormik.errors.age)}
              helperText={editFormik.touched.age && editFormik.errors.age}
              sx={{ mb: 2 }}
            />

            <Typography className="text-gray-300 mb-1">Teacher Image (Optional)</Typography>
            <input
              type="file"
              ref={editFileInputRef}
              onChange={addEditImage}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <div className="mb-4 flex items-center">
              <Button
                variant="outlined"
                onClick={handleEditUploadClick}
                startIcon={<CloudUploadIcon />}
                className="bg-amber-500 flex justify-center items-center h-10 gap-5"
              >
                Update Image
              </Button>
              {editFile && (
                <Typography variant="body2" className="ml-2 text-gray-300">
                  {editFile.name}
                </Typography>
              )}
            </div>

            {editImageUrl && (
              <Box sx={{ maxWidth: '300px', marginTop: '10px', marginBottom: '20px' }}>
                <CardMedia
                  component="img"
                  image={editImageUrl}
                  alt="Teacher preview"
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
                  onClick={handleClearEditFile}
                  sx={{ mt: 1 }}
                >
                  Clear Image
                </Button>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setEditDialogOpen(false)}
            color="primary"
          >
            Cancel
          </Button>
          <Button
            onClick={editFormik.handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}