import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { baseApi } from '../../../environment';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';

const Attendance = () => {
  const [attendeeClass, setAttendeeClass] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [students, setStudents] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [attendanceTaken, setAttendanceTaken] = useState(false);

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const fetchAttendeeClass = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${baseApi}/class/attendee`);
      setAttendeeClass(res.data?.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to fetch classes.");
      showSnackbar("Failed to fetch classes", "error");
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
      // Prepare attendance data for bulk submission
      const attendanceData = students.map(student => ({
        studentId: student._id,
        status: attendanceStatus[student._id] || 'Present',
        notes: '' // You can add notes functionality if needed
      }));

      // Submit all attendance records in one request
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
      
      // Handle specific error cases
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

  if (loading && attendeeClass.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      <Typography variant="h4" component="h1" gutterBottom>
        Attendance Management
      </Typography>

      <Box mt={2}>
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <FormControl sx={{ width: '300px' }}>
            <InputLabel id="class-select-label">Select Class</InputLabel>
            <Select
              labelId="class-select-label"
              id="class-select"
              value={selectedClass}
              label="Select Class"
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              {attendeeClass.map((cls) => (
                <MenuItem key={cls._id} value={cls._id}>
                  {cls.classText} {cls.section && `- ${cls.section}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      {attendanceTaken && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Attendance has already been taken for today for this class. You cannot modify it.
        </Alert>
      )}

      {loading && selectedClass ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px" mt={2}>
          <CircularProgress size={30} />
          <Typography variant="body2" sx={{ ml: 2 }}>Loading students...</Typography>
        </Box>
      ) : students.length > 0 ? (
        <Box mt={4}>
          <Box display="flex" gap={2} mb={2}>
            <Button 
              variant="outlined" 
              onClick={handleSelectAllPresent}
              disabled={submitting || attendanceTaken}
            >
              Mark All Present
            </Button>
            <Button 
              variant="outlined" 
              onClick={handleSelectAllAbsent}
              disabled={submitting || attendanceTaken}
            >
              Mark All Absent
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="attendance table">
              <TableHead>
                <TableRow>
                  <TableCell>Student Name</TableCell>
                  <TableCell>Roll Number</TableCell>
                  <TableCell align="center">Attendance Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student._id}>
                    <TableCell component="th" scope="row">
                      {student.name}
                    </TableCell>
                    <TableCell>
                      {student._id || 'N/A'}
                    </TableCell>
                    <TableCell align="center">
                      <FormControl sx={{ minWidth: 120 }}>
                        <InputLabel id={`attendance-label-${student._id}`}>Status</InputLabel>
                        <Select
                          labelId={`attendance-label-${student._id}`}
                          value={attendanceStatus[student._id] || 'Present'}
                          label="Status"
                          onChange={(e) => handleAttendanceChange(student._id, e.target.value)}
                          disabled={submitting || attendanceTaken}
                        >
                          <MenuItem value="Present">Present</MenuItem>
                          <MenuItem value="Absent">Absent</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box mt={3}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleSubmitAttendance}
              disabled={submitting || attendanceTaken}
              startIcon={submitting ? <CircularProgress size={20} /> : null}
              size="large"
            >
              {submitting ? 'Submitting...' : attendanceTaken ? 'Attendance Already Taken' : 'Submit Attendance'}
            </Button>
          </Box>

          <Box mt={2}>
            <Typography variant="body2" color="textSecondary">
              Total Students: {students.length} | 
              Present: {Object.values(attendanceStatus).filter(status => status === 'Present').length} | 
              Absent: {Object.values(attendanceStatus).filter(status => status === 'Absent').length}
            </Typography>
          </Box>
        </Box>
      ) : (
        selectedClass && (
          <Box mt={4}>
            <Alert severity="info">
              No students found in the selected class.
            </Alert>
          </Box>
        )
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Attendance;