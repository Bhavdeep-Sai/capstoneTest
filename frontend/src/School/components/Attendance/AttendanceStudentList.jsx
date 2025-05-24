import axios from 'axios';
import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { Button, Typography, Alert, CircularProgress, Paper } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import { baseApi } from '../../../environment';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Grid from '@mui/material/Grid';
import Attendee from './Attendee';
import { Link } from 'react-router-dom';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  borderRadius: 8,
  boxShadow: theme.shadows[3],
}));

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
          textTransform: 'none',
          fontWeight: 600,
          '&:hover': {
            background: 'linear-gradient(45deg, #FFB74D 30%, #FF7043 90%)',
          },
        },
        outlined: {
          textTransform: 'none',
          fontWeight: 600,
          borderColor: '#FF9800',
          color: '#FF9800',
          '&:hover': {
            borderColor: '#FF5722',
            color: '#FF5722',
            backgroundColor: 'rgba(255, 87, 34, 0.1)',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '12px 16px',
        },
      },
    },
  },
});

export default function AttendanceStudentList() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [message, setMessage] = React.useState('');
  const [classes, setClasses] = React.useState([]);
  const [students, setStudents] = React.useState([]);
  const [attendanceData, setAttendanceData] = React.useState({});
  const [filterClass, setFilterClass] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [selectedClass, setSelectedClass] = React.useState(null);

  // Fetch classes from API
  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${baseApi}/class/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setClasses(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch classes:', err);
      setError('Failed to fetch classes');
    }
  };

  // Handle class filter change
  const handleClass = (e) => {
    const classId = e.target.value;
    setSelectedClass(classId);
    setFilterClass(classId);
    fetchStudentsByFilters(classId, search);
  };

  // Handle search input change
  const handleSearch = (e) => {
    const searchText = e.target.value;
    setSearch(searchText);
    fetchStudentsByFilters(filterClass, searchText);
  };

  // Clear all filters
  const handleClearFilter = () => {
    setFilterClass('');
    setSearch('');
    setSelectedClass(null);
    fetchStudentsByFilters('', '');
  };

  // Fetch students with filters
  const fetchStudentsByFilters = async (classId, searchText) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const queryParams = {};
      if (classId) queryParams.studentClass = classId;
      if (searchText) queryParams.search = searchText;

      const response = await axios.get(`${baseApi}/student/fetch-with-query`, {
        params: queryParams,
        headers: { Authorization: `Bearer ${token}` },
      });

      const studentList = response.data.students || [];
      setStudents(studentList);

      if (studentList.length > 0) {
        await fetchAttendanceForStudents(studentList);
      } else {
        setAttendanceData({});
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to fetch students');
      setStudents([]);
      setAttendanceData({});
    } finally {
      setLoading(false);
    }
  };

  // Fetch attendance for students
  const fetchAttendanceForStudents = async (studentList) => {
    const updatedAttendanceData = {};
    const token = localStorage.getItem('token');

    try {
      const attendancePromises = studentList.map((student) =>
        axios
          .get(`${baseApi}/attendance/${student._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            const attendanceRecords = response.data.attendance || [];
            const totalClasses = attendanceRecords.length;
            const presentCount = attendanceRecords.filter(
              (record) => record.status === 'Present'
            ).length;
            const attendancePercentage =
              totalClasses > 0 ? (presentCount / totalClasses) * 100 : 0;
            updatedAttendanceData[student._id] = attendancePercentage;
          })
          .catch((err) => {
            console.warn(
              `Could not fetch attendance for student ${student.name} (${student._id}):`,
              err
            );
            updatedAttendanceData[student._id] = null;
          })
      );

      await Promise.all(attendancePromises);
      setAttendanceData(updatedAttendanceData);
    } catch (error) {
      console.error('Error in attendance fetching process:', error);
      setError('Failed to fetch attendance data');
    }
  };

  React.useEffect(() => {
    fetchClasses();
    fetchStudentsByFilters('', '');
  }, []);

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ pt:5, px: { xs: 2, md: 10 }, pb: 5, minHeight: '100vh' }}>
        <Typography
          variant="h4"
          component="h1"
          align="center"
          fontWeight={700}
          gutterBottom
          sx={{ color: 'primary.main', mb: 4 }}
        >
          Student Attendance
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {message && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setMessage('')}>
            {message}
          </Alert>
        )}

        <Grid container spacing={3} justifyContent="center" sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Item>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: 'center',
                  gap: 2,
                  justifyContent: 'center',
                }}
              >
                <TextField
                  label="Search by name or parent"
                  value={search}
                  onChange={handleSearch}
                  fullWidth
                  size="medium"
                  sx={{ maxWidth: { sm: '60%' } }}
                />

                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel id="class-select-label">Class</InputLabel>
                  <Select
                    labelId="class-select-label"
                    label="Class"
                    value={filterClass}
                    onChange={handleClass}
                    size="medium"
                  >
                    <MenuItem value="">None</MenuItem>
                    {classes.map((cls) => (
                      <MenuItem key={cls._id} value={cls._id}>
                        {cls.classText}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  variant="outlined"
                  onClick={handleClearFilter}
                  sx={{ minWidth: 120 }}
                  size="medium"
                >
                  Clear Filter
                </Button>
              </Box>

              {selectedClass && (
                <Box sx={{ mt: 4 }}>
                  <Attendee classId={selectedClass} />
                </Box>
              )}
            </Item>
          </Grid>
        </Grid>

        <Grid container justifyContent="center">
          <Grid item xs={12} md={10}>
            <Item>
              {loading ? (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    my: 6,
                  }}
                >
                  <CircularProgress color="primary" />
                </Box>
              ) : (
                <TableContainer>
                  <Table
                    sx={{ minWidth: 1000 }}
                    aria-label="students attendance table"
                    stickyHeader
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell align="center">Gender</TableCell>
                        <TableCell align="center">Parent Name</TableCell>
                        <TableCell align="center">Parent Number</TableCell>
                        <TableCell align="center">Class</TableCell>
                        <TableCell align="center">Attendance (%)</TableCell>
                        <TableCell align="center">Details</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {students.length > 0 ? (
                        students.map((student) => (
                          <TableRow
                            key={student._id}
                            sx={{
                              '&:last-child td, &:last-child th': { border: 0 },
                              '&:hover': {
                                backgroundColor: 'action.hover',
                              },
                            }}
                          >
                            <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
                              {student.name}
                            </TableCell>
                            <TableCell align="center">{student.gender}</TableCell>
                            <TableCell align="center">{student.parent}</TableCell>
                            <TableCell align="center">{student.parentNum}</TableCell>
                            <TableCell align="center">
                              {student.studentClass?.classText || 'Not Assigned'}
                            </TableCell>
                            <TableCell align="center">
                              {attendanceData[student._id] !== undefined ? (
                                attendanceData[student._id] !== null ? (
                                  `${attendanceData[student._id].toFixed(2)}%`
                                ) : (
                                  'No Data'
                                )
                              ) : (
                                'Loading...'
                              )}
                            </TableCell>
                            <TableCell align="center">
                              <Link
                                to={`/school/attendance/${student._id}`}
                                style={{
                                  color: '#FF9800',
                                  fontWeight: 600,
                                  textDecoration: 'none',
                                }}
                              >
                                Details
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                            <Typography variant="body1" color="text.secondary">
                              No students found
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Item>
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  );
}
