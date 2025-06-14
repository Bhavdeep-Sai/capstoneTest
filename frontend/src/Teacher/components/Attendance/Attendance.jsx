import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { baseApi } from '../../../environment';
import {
  Box,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Typography,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Divider,
  IconButton,
  Tooltip,
  LinearProgress,
  useTheme,
  styled,
  useMediaQuery,
  Stack,
  Avatar,
  Fade,
  Zoom,
  Skeleton
} from '@mui/material';
import {
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PersonAdd as PersonAddIcon,
  School as SchoolIcon,
  Today as TodayIcon,
  Warning as WarningIcon,
  Analytics as AnalyticsIcon,
  Assignment as AssignmentIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Enhanced styled components with professional design
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 15,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-4px)',
  },
}));

const StatCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  width: '200px',
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.05)',
  transition: 'all 0.3s ease-in-out',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    transform: 'translateY(-2px)',
  }
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 16,
  overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
  border: `1px solid ${theme.palette.divider}`,
  backdropFilter: 'blur(10px)',
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  '& .MuiTableCell-head': {
    color: theme.palette.primary.contrastText,
    fontWeight: 700,
    fontSize: '1rem',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    padding: theme.spacing(2.5),
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.5, 3),
  fontWeight: 600,
  fontSize: '1rem',
  textTransform: 'none',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-2px)',
  }
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 600,
  fontSize: '0.875rem',
  padding: theme.spacing(0.5, 1),
  borderRadius: 20,
  ...(status === 'Present' && {
    background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.light} 100%)`,
    color: theme.palette.success.contrastText,
    boxShadow: `0 4px 12px ${theme.palette.success.main}40`,
  }),
  ...(status === 'Absent' && {
    background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.light} 100%)`,
    color: theme.palette.error.contrastText,
    boxShadow: `0 4px 12px ${theme.palette.error.main}40`,
  }),
}));

const Attendance = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const [attendeeClass, setAttendeeClass] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [students, setStudents] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [attendanceTaken, setAttendanceTaken] = useState(false);
  const [noAttendeeRole, setNoAttendeeRole] = useState(false);

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getTodayFormatted = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const fetchAttendeeClass = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`${baseApi}/class/attendee`);

      if (res.data?.data && res.data.data.length > 0) {
        setAttendeeClass(res.data.data);
        setNoAttendeeRole(false);
      } else {
        setAttendeeClass([]);
        setNoAttendeeRole(true);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      if (err.response?.status === 403 || err.response?.status === 401) {
        setNoAttendeeRole(true);
        setError("You are not assigned as an attendee for any classes.");
      } else {
        setError("Failed to fetch classes.");
        showSnackbar("Failed to fetch classes", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    if (!selectedClass) return;

    try {
      setLoading(true);
      const response = await axios.get(`${baseApi}/student/fetch-with-query`, {
        params: { studentClass: selectedClass }
      });
      setStudents(response.data.students || []);

      // Initialize attendance status for all students
      const initialStatus = {};
      response.data.students?.forEach(student => {
        initialStatus[student._id] = 'Present'; // Default to Present
      });
      setAttendanceStatus(initialStatus);

    } catch (err) {
      console.error("Error fetching students:", err);
      showSnackbar("Failed to fetch students", "error");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const checkAttendanceStatus = async () => {
    if (!selectedClass) return;

    try {
      const response = await axios.get(`${baseApi}/attendance/check/${selectedClass}`);
      setAttendanceTaken(response.data.attendanceTaken);
    } catch (err) {
      console.error("Error checking attendance status:", err);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceStatus((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmitAttendance = async () => {
    if (!selectedClass) {
      showSnackbar("Please select a class first", "error");
      return;
    }

    if (students.length === 0) {
      showSnackbar("No students found in selected class", "error");
      return;
    }

    if (attendanceTaken) {
      showSnackbar("Attendance has already been taken for today", "error");
      return;
    }

    setSubmitting(true);
    const todayDate = getTodayDate();

    try {
      const attendanceData = students.map(student => ({
        studentId: student._id,
        status: attendanceStatus[student._id] || 'Present',
        notes: ''
      }));

      const response = await axios.post(`${baseApi}/attendance/mark-bulk`, {
        attendanceData,
        classId: selectedClass,
        date: todayDate
      });

      if (response.data.success) {
        showSnackbar(response.data.message, "success");
        setAttendanceTaken(true);
      } else {
        showSnackbar(response.data.message || "Failed to submit attendance", "error");
      }

    } catch (err) {
      console.error('Error submitting attendance:', err);

      if (err.response?.status === 409) {
        showSnackbar("Attendance has already been taken for this class today", "error");
        setAttendanceTaken(true);
      } else if (err.response?.data?.message) {
        showSnackbar(err.response.data.message, "error");
      } else {
        showSnackbar("Failed to submit attendance", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectAllPresent = () => {
    if (attendanceTaken) return;

    const newStatus = {};
    students.forEach(student => {
      newStatus[student._id] = 'Present';
    });
    setAttendanceStatus(newStatus);
  };

  const handleSelectAllAbsent = () => {
    if (attendanceTaken) return;

    const newStatus = {};
    students.forEach(student => {
      newStatus[student._id] = 'Absent';
    });
    setAttendanceStatus(newStatus);
  };

  useEffect(() => {
    fetchAttendeeClass();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
      checkAttendanceStatus();
    } else {
      setStudents([]);
      setAttendanceStatus({});
      setAttendanceTaken(false);
    }
  }, [selectedClass]);

  const presentCount = Object.values(attendanceStatus).filter(status => status === 'Present').length;
  const absentCount = Object.values(attendanceStatus).filter(status => status === 'Absent').length;
  const attendancePercentage = students.length > 0 ? (presentCount / students.length) * 100 : 0;

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box mb={4}>
        <Skeleton variant="text" width={300} height={60} />
        <Skeleton variant="text" width={200} height={30} />
      </Box>
      <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 4, mb: 3 }} />
      <Grid container spacing={3}>
        {[1, 2, 3].map((item) => (
          <Grid item xs={12} md={4} key={item}>
            <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );

  if (loading && attendeeClass.length === 0) {
    return <LoadingSkeleton />;
  }

  if (noAttendeeRole) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Fade in timeout={800}>
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh">
            <StyledCard sx={{ p: 6, textAlign: 'center', maxWidth: 600 }}>
              <WarningIcon sx={{ fontSize: 100, color: 'warning.main', mb: 3 }} />
              <Typography variant="h3" gutterBottom color="text.primary" fontWeight="700">
                Access Restricted
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                You are not assigned as an attendee for any classes. Please contact your administrator to get the appropriate permissions.
              </Typography>
              <GradientButton
                variant="contained"
                sx={{ mt: 4 }}
                startIcon={<RefreshIcon />}
                onClick={fetchAttendeeClass}
              >
                Refresh Access
              </GradientButton>
            </StyledCard>
          </Box>
        </Fade>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      {/* Header Section */}
      <Fade in timeout={600}>
        <Box mb={4}>
          <Stack direction={'row'} justifyContent="space-between" alignItems={isMobile ? 'flex-start' : 'center'} spacing={2}>
            <Box>
              <Typography
                variant={isMobile ? "h5" : "h2"}
                component="h1"
                gutterBottom
                fontWeight="800"
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Attendance Management
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <TodayIcon color="primary" />
                <Typography variant="h7" color="text.secondary">
                  {getTodayFormatted()}
                </Typography>
              </Stack>
            </Box>
            <Avatar
              sx={{
                width: { xs: 60, md: 80 },
                height: { xs: 60, md: 80 },
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
              }}
            >
              <AssignmentIcon sx={{ fontSize: { xs: 30, md: 40 } }} />
            </Avatar>
          </Stack>
        </Box>
      </Fade>

      {/* Class Selection Card */}
      <Zoom in timeout={800}>
        <StyledCard sx={{ mb: 4 }}>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Typography
              variant={isMobile ? "h6" : "h5"}
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, fontWeight: 600 }}
            >
              <SchoolIcon color="primary" />
              Select a Class to Take Attendance
            </Typography>

            {error && !noAttendeeRole ? (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
                {error}
              </Alert>
            ) : (
              <FormControl fullWidth sx={{ maxWidth: { xs: '100%', md: 400 } }}>
                <InputLabel id="class-select-label">Choose Class</InputLabel>
                <Select
                  labelId="class-select-label"
                  id="class-select"
                  value={selectedClass}
                  label="Choose Class"
                  onChange={(e) => setSelectedClass(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  {attendeeClass.map((cls) => (
                    <MenuItem key={cls._id} value={cls._id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <SchoolIcon fontSize="small" />
                        {cls.classText} {cls.section && `- ${cls.section}`}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </CardContent>
        </StyledCard>
      </Zoom>

      {/* Attendance Status Alert */}
      {attendanceTaken && (
        <Fade in timeout={500} className='flex items-center'>
          <Alert
            severity="warning"
            sx={{ mb: 3, borderRadius: 3, fontSize: '1rem' }}
            icon={<WarningIcon fontSize="large" />}
          >
            <p>
              Attendance has already been taken for today for this class. You cannot modify it.
            </p>
          </Alert>
        </Fade>
      )}

      {/* Loading Students */}
      {loading && selectedClass ? (
        <StyledCard>
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" flexDirection="column" alignItems="center" py={4}>
              <CircularProgress size={50} thickness={4} />
              <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary', fontWeight: 500 }}>
                Loading students...
              </Typography>
            </Box>
          </CardContent>
        </StyledCard>
      ) : students.length > 0 ? (
        <>
          {/* Attendance Percentage */}
          <Fade in timeout={1200}>
            <StyledCard sx={{ mb: 3 }}>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="h6" gutterBottom fontWeight="600">
                  Overall Attendance: {attendancePercentage.toFixed(1)}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={attendancePercentage}
                  sx={{
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      background: attendancePercentage >= 75
                        ? `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.light})`
                        : `linear-gradient(90deg, ${theme.palette.warning.main}, ${theme.palette.warning.light})`,
                      borderRadius: 6,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }
                  }}
                />
              </CardContent>
            </StyledCard>
          </Fade>
          {/* Attendance Stats */}
          <Fade in timeout={1000}>
            <Grid className="flex justify-center items-center flex-col lg:flex-row gap-5 lg:justify-start" spacing={{ xs: 2, md: 3 }} sx={{ mb: 4, mt: 5 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard>
                  <CardContent sx={{ textAlign: 'center', p: { xs: 2, md: 3 } }}>
                    <PeopleIcon sx={{ fontSize: { xs: 35, md: 45 }, color: 'primary.main', mb: 1 }} />
                    <Typography variant={isMobile ? "h5" : "h4"} fontWeight="700" color="primary.main">
                      {students.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight="500">
                      Total Students
                    </Typography>
                  </CardContent>
                </StatCard>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard>
                  <CardContent sx={{ textAlign: 'center', p: { xs: 2, md: 3 } }}>
                    <CheckCircleIcon sx={{ fontSize: { xs: 35, md: 45 }, color: 'success.main', mb: 1 }} />
                    <Typography variant={isMobile ? "h5" : "h4"} fontWeight="700" color="success.main">
                      {presentCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight="500">
                      Present
                    </Typography>
                  </CardContent>
                </StatCard>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard>
                  <CardContent sx={{ textAlign: 'center', p: { xs: 2, md: 3 } }}>
                    <CancelIcon sx={{ fontSize: { xs: 35, md: 45 }, color: 'error.main', mb: 1 }} />
                    <Typography variant={isMobile ? "h5" : "h4"} fontWeight="700" color="error.main">
                      {absentCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight="500">
                      Absent
                    </Typography>
                  </CardContent>
                </StatCard>
              </Grid>
            </Grid>
          </Fade>
          <Divider sx={{ mb: 3 }} />
          {/* Action Buttons */}
          <Fade in timeout={1400}>
            <Stack
              direction={isMobile ? 'column' : 'row'}
              spacing={2}
              sx={{ mb: 3 }}
            >
              <GradientButton
                variant="contained"
                color="success"
                onClick={handleSelectAllPresent}
                disabled={submitting || attendanceTaken}
                startIcon={<CheckCircleIcon />}
                fullWidth={isMobile}
              >
                Mark All Present
              </GradientButton>
              <GradientButton
                variant="contained"
                color="error"
                onClick={handleSelectAllAbsent}
                disabled={submitting || attendanceTaken}
                startIcon={<CancelIcon />}
                fullWidth={isMobile}
              >
                Mark All Absent
              </GradientButton>
            </Stack>
          </Fade>

          {/* Students Table */}
          <Fade in timeout={1600}>
            <StyledTableContainer component={Paper}>
              <Table sx={{ minWidth: { xs: 300, md: 650 } }} aria-label="attendance table">
                <StyledTableHead>
                  <TableRow>
                    <TableCell sx={{ minWidth: { xs: 150, md: 200 } }}>Student Name</TableCell>
                    {!isMobile && (
                      <TableCell sx={{ minWidth: 150 }}>Roll Number</TableCell>
                    )}
                    <TableCell align="center" sx={{ minWidth: { xs: 140, md: 200 } }}>
                      Attendance Status
                    </TableCell>
                  </TableRow>
                </StyledTableHead>
                <TableBody>
                  {students.map((student, index) => (
                    <TableRow
                      key={student._id}
                      sx={{
                        '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                        '&:hover': { backgroundColor: 'action.selected' },
                        transition: 'background-color 0.2s ease'
                      }}
                    >
                      <TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                            {student.name?.charAt(0) || 'S'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="600">
                              {student.name}
                            </Typography>
                            {isMobile && (
                              <Typography variant="caption" color="text.secondary">
                                ID: {student._id || 'N/A'}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      {!isMobile && (
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                          {student._id || 'N/A'}
                        </TableCell>
                      )}
                      <TableCell align="center">
                        <FormControl sx={{ minWidth: { xs: 100, md: 140 } }}>
                          <Select
                            value={attendanceStatus[student._id] || 'Present'}
                            onChange={(e) => handleAttendanceChange(student._id, e.target.value)}
                            disabled={submitting || attendanceTaken}
                            size="small"
                            sx={{ borderRadius: 3 }}
                          >
                            <MenuItem value="Present">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CheckCircleIcon fontSize="small" color="success" />
                                Present
                              </Box>
                            </MenuItem>
                            <MenuItem value="Absent">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CancelIcon fontSize="small" color="error" />
                                Absent
                              </Box>
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </StyledTableContainer>
          </Fade>

          {/* Submit Button */}
          <Fade in timeout={1800}>
            <Box mt={4} display="flex" justifyContent="center">
              <GradientButton
                variant="contained"
                color="primary"
                onClick={handleSubmitAttendance}
                disabled={submitting || attendanceTaken}
                startIcon={submitting ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                size="large"
                sx={{
                  px: { xs: 3, md: 6 },
                  py: { xs: 1.5, md: 2 },
                  fontSize: { xs: '1rem', md: '1.2rem' },
                  fontWeight: 700,
                  minWidth: { xs: '100%', sm: 'auto' }
                }}
              >
                {submitting ? 'Submitting...' : attendanceTaken ? 'Attendance Already Taken' : 'Submit Attendance'}
              </GradientButton>
            </Box>
          </Fade>

        </>
      ) : (
        selectedClass && (
          <Fade in timeout={800}>
            <StyledCard>
              <CardContent sx={{ p: { xs: 3, md: 6 }, textAlign: 'center' }}>
                <PeopleIcon sx={{ fontSize: { xs: 60, md: 80 }, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h5" color="text.secondary" fontWeight="600">
                  No students found in the selected class.
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                  Please check if students are enrolled in this class.
                </Typography>
              </CardContent>
            </StyledCard>
          </Fade>
        )
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            borderRadius: 3,
            minWidth: { xs: 280, md: 350 },
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Attendance;