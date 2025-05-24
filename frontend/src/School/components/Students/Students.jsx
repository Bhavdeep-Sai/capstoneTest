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
import { Button, CardMedia, Typography, Alert, CircularProgress, Card, CardActionArea, CardContent, IconButton, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import BookIcon from '@mui/icons-material/MenuBook';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import EditIcon from '@mui/icons-material/Edit';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { studentSchema } from '../../../yupSchema/studentSchema';
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

export default function Students() {
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

  const fetchClasses = async () => {
    try {
      const response = await axios.get(`${baseApi}/class/all`);
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
    setParams((prevParams) => ({
      ...prevParams,
      search: null,
      studentClass: null
    }));

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
      setStudents(response.data.students);

      const initialVisibility = {};
      response.data.students.forEach(student => {
        initialVisibility[student._id] = false;
      });
      setPasswordVisibility(initialVisibility);
    } catch (err) {
      console.log(err);
    }
  };

  React.useEffect(() => {
    fetchClasses();
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
    setEditImageUrl(null);
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
        await axios.post(
          `${baseApi}/student/register`,
          fd,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${token}`
            }
          }
        );

        setSuccess("Student registered successfully!");
        formik.resetForm();
        handleClearFile();
        setForm(false);
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
  };

  // Edit form setup
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
        await axios.put(
          `${baseApi}/student/update/${currentStudent._id}`,
          fd,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${token}`
            }
          }
        );

        setSuccess("Student updated successfully!");
        setEditDialogOpen(false);
        setMessage(`Student ${values.name} updated at ${new Date().toLocaleString()}`);
        handleClearEditFile();
      } catch (error) {
        console.error("Update error:", error);
        setError(error.response?.data?.message || "Update failed");
      } finally {
        setLoading(false);
      }
    },
  });

  const handleEdit = (id) => {
    const studentToEdit = students.find(student => student._id === id);
    if (!studentToEdit) return;

    setCurrentStudent(studentToEdit);

    editFormik.setValues({
      email: studentToEdit.email || "",
      name: studentToEdit.name || "",
      studentClass: studentToEdit.studentClass?._id || "",
      age: studentToEdit.age || "",
      gender: studentToEdit.gender || "",
      parent: studentToEdit.parent || "",
      parentNum: studentToEdit.parentNum || "",
    });

    if (studentToEdit.studentImg) {
      setEditImageUrl(`${baseApi}/uploads/student/${studentToEdit.studentImg}`);
    } else {
      setEditImageUrl(null);
    }

    setEditDialogOpen(true);
  };

  const handleDelete = async (id) => {
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
      setSuccess("Student deleted Successfully");
      setMessage(response.data.message);
    } catch (err) {
      setError("Student is not Deleted");
      console.log(err);
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
            + Add Student
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
                <BookIcon sx={{ color: '#FF9800', fontSize: 40, mr: 1 }} />
                <Typography variant="h5" gutterBottom sx={{ color: 'text.primary', m: 0 }}>
                  Add New Student
                </Typography>
              </div>
              <Typography variant="body2" className="text-gray-400 text-center mb-6">
                Register a student in the School Management System
              </Typography>

              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

              <TextField
                name="name"
                label="Student Name"
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

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="class-select-label">Class</InputLabel>
                <Select
                  labelId="class-select-label"
                  id="class-select"
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
                  <Typography color="error" variant="caption" sx={{ mt: 1, ml: 2 }}>
                    {formik.errors.studentClass}
                  </Typography>
                )}
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
                name="parent"
                label="Parent Name"
                type="text"
                value={formik.values.parent}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.parent && Boolean(formik.errors.parent)}
                helperText={formik.touched.parent && formik.errors.parent}
                sx={{ mb: 2 }}
              />

              <TextField
                name="parentNum"
                label="Parent Number"
                type="text"
                value={formik.values.parentNum}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.parentNum && Boolean(formik.errors.parentNum)}
                helperText={formik.touched.parentNum && formik.errors.parentNum}
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

              <Typography className="text-gray-300 mb-1">Student Image</Typography>
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
                {loading ? <CircularProgress size={24} /> : 'Add Student'}
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
            onChange={handleSearch}
            sx={{ mb: 2 }}
            className='w-3/4'
          />
          <FormControl className='w-1/2' sx={{ mb: 2 }}>
            <InputLabel id="class-select-label">Class</InputLabel>
            <Select
              label="Class"
              value={filterClass}
              onChange={handleClass}
            >
              <MenuItem value="">None</MenuItem>
              {classes && classes.map((cls) => (
                <MenuItem key={cls._id} value={cls._id}>{cls.classText}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button sx={{ mb: 2, border: "2px solid gray", }} className='w-1/4 h-[100%]' onClick={handleClearFilter}>Clear Filter</Button>
        </Box>

        <Box sx={{ margin: "auto" }} className="flex w-[90%] pt-10 flex-wrap justify-center items-center gap-3">
          {students && students.map(student => (
            <Card key={student._id} sx={{ maxWidth: 345 }}>
              <CardActionArea>
                <CardMedia
                  component="img"
                  height="140"
                  image={student.studentImg ? `${baseApi}/uploads/student/${student.studentImg}` : ''}
                  alt={student.name}
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {student.name}
                  </Typography>
                  <ul>
                    <li><b>Email : </b>{student.email}</li>
                    <li><b>Class : </b>{student.studentClass?.classText || ''}</li>
                    <li><b>Gender : </b>{student.gender}</li>
                    <li><b>Age : </b>{student.age}</li>
                    {student.password && (
                      <li className="flex items-center">
                        <b>Password : </b>
                        <span style={{ marginLeft: '4px' }}>
                          {passwordVisibility[student._id] ? student.password : '••••••••'}
                        </span>
                        <IconButton
                          size="small"
                          onClick={() => togglePasswordVisibility(student._id)}
                          sx={{ ml: 1 }}
                        >
                          {passwordVisibility[student._id] ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                        </IconButton>
                      </li>
                    )}
                  </ul>
                  <p>Parental Details</p>
                  <ul>
                    <li><b>Parent Name : </b>{student.parent}</li>
                    <li><b>Contact no: </b>{student.parentNum}</li>
                  </ul>
                  <div className='flex justify-end gap-4'>
                    <IconButton sx={{ border: "2px solid white" }} onClick={() => handleEdit(student._id)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(student._id)} sx={{ border: "2px solid orange" }}>
                      <PersonRemoveIcon />
                    </IconButton>
                  </div>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      </div>

      {/* Edit Student Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="flex items-center">
            <EditIcon sx={{ color: '#FF9800', mr: 1 }} />
            Edit Student
          </div>
          <IconButton onClick={() => setEditDialogOpen(false)}>
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
              mt: 2
            }}
            noValidate
            onSubmit={editFormik.handleSubmit}
          >
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TextField
              name="name"
              label="Student Name"
              value={editFormik.values.name}
              onChange={editFormik.handleChange}
              onBlur={editFormik.handleBlur}
              error={editFormik.touched.name && Boolean(editFormik.errors.name)}
              helperText={editFormik.touched.name && editFormik.errors.name}
              sx={{ mb: 2 }}
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

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="edit-class-select-label">Class</InputLabel>
              <Select
                labelId="edit-class-select-label"
                id="edit-class-select"
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

            <TextField
              name="parent"
              label="Parent Name"
              type="text"
              value={editFormik.values.parent}
              onChange={editFormik.handleChange}
              onBlur={editFormik.handleBlur}
              error={editFormik.touched.parent && Boolean(editFormik.errors.parent)}
              helperText={editFormik.touched.parent && editFormik.errors.parent}
              sx={{ mb: 2 }}
            />

            <TextField
              name="parentNum"
              label="Parent Number"
              type="text"
              value={editFormik.values.parentNum}
              onChange={editFormik.handleChange}
              onBlur={editFormik.handleBlur}
              error={editFormik.touched.parentNum && Boolean(editFormik.errors.parentNum)}
              helperText={editFormik.touched.parentNum && editFormik.errors.parentNum}
              sx={{ mb: 2 }}
            />

            <Typography className="text-gray-300 mb-1">Student Image (Optional - Leave empty to keep current image)</Typography>
            <input
              type="file"
              ref={editFileInputRef}
              onChange={(e) => {
                const selectedFile = e.target.files[0];
                if (selectedFile) {
                  setEditFile(selectedFile);
                  setEditImageUrl(URL.createObjectURL(selectedFile));
                }
              }}
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
                Upload New Image
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
                  alt="Student preview"
                  sx={{
                    borderRadius: '8px',
                    border: '1px solid #444',
                    maxHeight: '150px',
                    objectFit: 'contain'
                  }}
                />
                {editFile && (
                  <Button
                    size="small"
                    color="error"
                    onClick={handleClearEditFile}
                    sx={{ mt: 1 }}
                  >
                    Clear New Image
                  </Button>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={editFormik.handleSubmit}
            variant="contained"
            disabled={loading}
            sx={{
              background: 'linear-gradient(45deg, #FF9800 30%, #FF5722 90%)',
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Update Student'}
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}

