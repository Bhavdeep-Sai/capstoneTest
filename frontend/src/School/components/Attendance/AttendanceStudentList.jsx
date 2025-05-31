import axios from 'axios';
import * as React from 'react';
import {
  Box,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  InputAdornment,
  Fade,
  Skeleton,
  Container,
  Stack,
  Avatar,
  Tooltip
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Assessment as AssessmentIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { baseApi } from '../../../environment';
import Attendee from './Attendee';
import { Link } from 'react-router-dom';

// Styled components with modern design
const StyledCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 20,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
  },
}));

const FilterCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #2a2a3e 0%, #1e1e2e 100%)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 152, 0, 0.2)',
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 16,
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #1e1e2e 0%, #2a2a3e 100%)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  '& .MuiTable-root': {
    '& .MuiTableHead-root': {
      background: 'linear-gradient(135deg, #FF9800 0%, #FF5722 100%)',
      '& .MuiTableCell-root': {
        color: '#ffffff',
        fontWeight: 700,
        fontSize: '0.95rem',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        borderBottom: 'none',
      },
    },
    '& .MuiTableBody-root': {
      '& .MuiTableRow-root': {
        transition: 'all 0.2s ease',
        '&:hover': {
          background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 87, 34, 0.1) 100%)',
          transform: 'scale(1.005)',
        },
        '&:nth-of-type(even)': {
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
        },
      },
      '& .MuiTableCell-root': {
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '16px',
      },
    },
  },
}));

const AttendanceChip = styled(Chip)(({ theme, percentage }) => {
  let backgroundColor, color;
  if (percentage >= 85) {
    backgroundColor = 'rgba(76, 175, 80, 0.2)';
    color = '#4CAF50';
  } else if (percentage >= 70) {
    backgroundColor = 'rgba(255, 193, 7, 0.2)';
    color = '#FFC107';
  } else {
    backgroundColor = 'rgba(244, 67, 54, 0.2)';
    color = '#F44336';
  }
  
  return {
    backgroundColor,
    color,
    fontWeight: 700,
    borderRadius: 12,
    border: `1px solid ${color}30`,
    '& .MuiChip-label': {
      fontSize: '0.875rem',
    },
  };
});

const professionalTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FF9800',
      light: '#FFB74D',
      dark: '#F57C00',
    },
    secondary: {
      main: '#FF5722',
      light: '#FF7043',
      dark: '#D84315',
    },
    background: {
      default: '#0a0a0a',
      paper: '#1a1a2e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
    success: {
      main: '#4CAF50',
    },
    warning: {
      main: '#FFC107',
    },
    error: {
      main: '#F44336',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 800,
      fontSize: '2.5rem',
      background: 'linear-gradient(135deg, #FF9800 0%, #FF5722 100%)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      letterSpacing: '-0.02em',
    },
    h6: {
      fontWeight: 700,
      fontSize: '1.25rem',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              '& fieldset': {
                borderColor: '#FF9800',
              },
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              '& fieldset': {
                borderColor: '#FF9800',
                borderWidth: 2,
              },
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          background: 'linear-gradient(135deg, #FF9800 0%, #FF5722 100%)',
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 700,
          fontSize: '1rem',
          padding: '12px 24px',
          boxShadow: '0 4px 15px rgba(255, 152, 0, 0.3)',
          transition: 'all 0.3s ease',
          '&:hover': {
            background: 'linear-gradient(135deg, #FFB74D 0%, #FF7043 100%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(255, 152, 0, 0.4)',
          },
        },
        outlined: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 700,
          fontSize: '1rem',
          padding: '12px 24px',
          borderColor: '#FF9800',
          color: '#FF9800',
          borderWidth: 2,
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: '#FF5722',
            color: '#FF5722',
            backgroundColor: 'rgba(255, 87, 34, 0.1)',
            borderWidth: 2,
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backdropFilter: 'blur(10px)',
        },
      },
    },
  },
});

const LoadingSkeleton = () => (
  <TableRow>
    {[...Array(7)].map((_, index) => (
      <TableCell key={index}>
        <Skeleton variant="text" animation="wave" />
      </TableCell>
    ))}
  </TableRow>
);

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

  const getAttendanceColor = (percentage) => {
    if (percentage >= 85) return 'success';
    if (percentage >= 70) return 'warning';
    return 'error';
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  React.useEffect(() => {
    fetchClasses();
    fetchStudentsByFilters('', '');
  }, []);

  return (
    <ThemeProvider theme={professionalTheme}>
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
          pt: 4,
          pb: 6,
        }}
      >
        <Container maxWidth="xl">
          <Fade in timeout={800}>
            <Box>
              {/* Header Section */}
              <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    margin: '0 auto 16px',
                    background: 'linear-gradient(135deg, #FF9800 0%, #FF5722 100%)',
                  }}
                >
                  <AssessmentIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h4" component="h1" gutterBottom>
                  Student Attendance Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                  Monitor and track student attendance with real-time analytics and comprehensive reporting
                </Typography>
              </Box>

              {/* Alerts */}
              <Stack spacing={2} sx={{ mb: 4 }}>
                {error && (
                  <Fade in>
                    <Alert 
                      severity="error" 
                      onClose={() => setError(null)}
                      sx={{ backdropFilter: 'blur(10px)' }}
                    >
                      {error}
                    </Alert>
                  </Fade>
                )}
                {message && (
                  <Fade in>
                    <Alert 
                      severity="success" 
                      onClose={() => setMessage('')}
                      sx={{ backdropFilter: 'blur(10px)' }}
                    >
                      {message}
                    </Alert>
                  </Fade>
                )}
              </Stack>

              {/* Filter Section */}
              <FilterCard sx={{ mb: 4 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <FilterListIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" color="primary">
                      Search & Filter Students
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={5}>
                      <TextField
                        fullWidth
                        label="Search Students"
                        placeholder="Search by name or parent..."
                        value={search}
                        onChange={handleSearch}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon color="primary" />
                            </InputAdornment>
                          ),
                          endAdornment: search && (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setSearch('')} size="small">
                                <ClearIcon />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Select Class</InputLabel>
                        <Select
                          value={filterClass}
                          label="Select Class"
                          onChange={handleClass}
                          startAdornment={
                            <InputAdornment position="start">
                              <SchoolIcon color="primary" sx={{ ml: 1 }} />
                            </InputAdornment>
                          }
                        >
                          <MenuItem value="">All Classes</MenuItem>
                          {classes.map((cls) => (
                            <MenuItem key={cls._id} value={cls._id}>
                              {cls.classText}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={handleClearFilter}
                        startIcon={<ClearIcon />}
                        sx={{ height: 56 }}
                      >
                        Clear Filters
                      </Button>
                    </Grid>
                  </Grid>

                  {selectedClass && (
                    <Fade in timeout={500}>
                      <Box sx={{ mt: 4 }}>
                        <Attendee classId={selectedClass} />
                      </Box>
                    </Fade>
                  )}
                </CardContent>
              </FilterCard>

              {/* Students Table */}
              <StyledCard>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ p: 3, pb: 0 }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                      Students List ({students.length})
                    </Typography>
                  </Box>
                  
                  <StyledTableContainer>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>Student</TableCell>
                          <TableCell align="center">Gender</TableCell>
                          <TableCell align="center">Parent</TableCell>
                          <TableCell align="center">Contact</TableCell>
                          <TableCell align="center">Class</TableCell>
                          <TableCell align="center">Attendance</TableCell>
                          <TableCell align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {loading ? (
                          [...Array(5)].map((_, index) => (
                            <LoadingSkeleton key={index} />
                          ))
                        ) : students.length > 0 ? (
                          students.map((student) => {
                            const attendancePercentage = attendanceData[student._id];
                            return (
                              <TableRow key={student._id}>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Avatar
                                      sx={{
                                        mr: 2,
                                        bgcolor: 'primary.main',
                                        width: 40,
                                        height: 40,
                                        fontSize: '0.875rem',
                                      }}
                                    >
                                      {getInitials(student.name)}
                                    </Avatar>
                                    <Typography variant="body1" fontWeight={600}>
                                      {student.name}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                
                                <TableCell align="center">
                                  <Chip
                                    label={student.gender}
                                    size="small"
                                    sx={{
                                      backgroundColor: student.gender === 'Male' 
                                        ? 'rgba(33, 150, 243, 0.2)' 
                                        : 'rgba(233, 30, 99, 0.2)',
                                      color: student.gender === 'Male' ? '#2196F3' : '#E91E63',
                                      fontWeight: 600,
                                    }}
                                  />
                                </TableCell>
                                
                                <TableCell align="center">
                                  <Typography variant="body2">
                                    {student.parent}
                                  </Typography>
                                </TableCell>
                                
                                <TableCell align="center">
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <PhoneIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                                    <Typography variant="body2">
                                      {student.parentNum}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                
                                <TableCell align="center">
                                  <Chip
                                    label={student.studentClass?.classText || 'Unassigned'}
                                    variant="outlined"
                                    size="small"
                                    sx={{ fontWeight: 600 }}
                                  />
                                </TableCell>
                                
                                <TableCell align="center">
                                  {attendancePercentage !== undefined ? (
                                    attendancePercentage !== null ? (
                                      <AttendanceChip
                                        label={`${attendancePercentage.toFixed(1)}%`}
                                        percentage={attendancePercentage}
                                        size="small"
                                      />
                                    ) : (
                                      <Chip label="No Data" size="small" color="default" />
                                    )
                                  ) : (
                                    <CircularProgress size={20} />
                                  )}
                                </TableCell>
                                
                                <TableCell align="center">
                                  <Tooltip title="View Details">
                                    <IconButton
                                      component={Link}
                                      to={`/school/attendance/${student._id}`}
                                      sx={{
                                        color: 'primary.main',
                                        '&:hover': {
                                          backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                        },
                                      }}
                                    >
                                      <VisibilityIcon />
                                    </IconButton>
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                              <SchoolIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                              <Typography variant="h6" color="text.secondary" gutterBottom>
                                No Students Found
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Try adjusting your search criteria or filters
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </StyledTableContainer>
                </CardContent>
              </StyledCard>
            </Box>
          </Fade>
        </Container>
      </Box>
    </ThemeProvider>
  );
}