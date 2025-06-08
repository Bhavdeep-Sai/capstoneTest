/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Grid,
  FormHelperText,
  Box,
  CircularProgress,
  Card,
  CardContent,
  Typography,
  useTheme,
  useMediaQuery,
  Container,
  Paper,
  Alert
} from '@mui/material';
import { baseApi } from '../../../environment';
import axios from 'axios';

const ScheduleManagement = ({ selectedClass, selectedEvent, editMode, onScheduleAdded, onScheduleUpdated }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [formData, setFormData] = useState({
    teacher: '',
    subject: '',
    date: '',
    startTime: '',
    endTime: '',
    status: 'active'
  });
  
  const [teachers, setTeachers] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Initialize form with selected event data when in edit mode
  useEffect(() => {
    if (editMode && selectedEvent) {
      const eventStartDate = new Date(selectedEvent.start);
      const eventEndDate = new Date(selectedEvent.end);
      
      // Format date to YYYY-MM-DD
      const formattedDate = eventStartDate.toISOString().split('T')[0];
      
      // Format time to HH:MM
      const formattedStartTime = eventStartDate.toTimeString().slice(0, 5);
      const formattedEndTime = eventEndDate.toTimeString().slice(0, 5);
      
      // Fetch the schedule details from the API
      fetchEventDetails(selectedEvent.id);
      
      setFormData({
        ...formData,
        date: formattedDate,
        startTime: formattedStartTime,
        endTime: formattedEndTime
      });
    }
  }, [editMode, selectedEvent]);
  
  const fetchEventDetails = async (eventId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseApi}/schedule/fetch/${eventId}`);
      
      if (response.data && response.data.data) {
        const eventData = response.data.data;
        
        setFormData(prev => ({
          ...prev,
          teacher: eventData.teacher?._id || '',
          subject: eventData.subject?._id || '',
          status: eventData.status || 'active'
        }));
        
        // After setting the teacher, fetch the subjects assigned to this teacher
        if (eventData.teacher?._id) {
          fetchTeacherSubjects(eventData.teacher._id);
        }
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
      setError("Failed to load schedule details");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTeachers();
    fetchAllSubjects();
  }, []);
  
  const fetchTeachers = async () => {
    try {
      const response = await axios.get(`${baseApi}/teacher/fetch-with-query`);
      if (response.data && response.data.teachers) {
        setTeachers(response.data.teachers);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
      setError("Failed to load teachers");
    }
  };
  
  const fetchAllSubjects = async () => {
    try {
      const response = await axios.get(`${baseApi}/subject/all`);
      if (response.data && response.data.data) {
        setAllSubjects(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setError("Failed to load subjects");
    }
  };
  
  // Updated function to fetch subjects assigned to a specific teacher
  const fetchTeacherSubjects = async (teacherId) => {
    if (!teacherId) {
      setAvailableSubjects([]);
      return;
    }
    
    try {
      setLoading(true);
      // Use the endpoint that fetches subjects for a teacher
      const response = await axios.get(`${baseApi}/schedule/teacher/subjects/${teacherId}`);
      
      if (response.data && response.data.subjects) {
        setAvailableSubjects(response.data.subjects);
        console.log(response.data.subjects)
        
        // If we're in edit mode and have a selected subject, check if it's in the available subjects
        if (editMode && formData.subject) {
          const subjectExists = response.data.subjects.some(
            subject => subject._id === formData.subject
          );
          
          // If not, reset the subject selection
          if (!subjectExists) {
            setFormData(prev => ({
              ...prev,
              subject: ''
            }));
          }
        }
      } else {
        // Fallback to empty array if no subjects found
        setAvailableSubjects([]);
        // Reset subject selection if no subjects available
        setFormData(prev => ({
          ...prev,
          subject: ''
        }));
      }
    } catch (error) {
      console.error("Error fetching teacher subjects:", error);
      setError("Failed to load subjects for this teacher");
      setAvailableSubjects([]);
      // Reset subject on error
      setFormData(prev => ({
        ...prev,
        subject: ''
      }));
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'teacher') {
      // When teacher changes, reset subject and fetch subjects for this teacher
      setFormData(prev => ({
        ...prev,
        [name]: value,
        subject: '' // Reset subject when teacher changes
      }));
      
      fetchTeacherSubjects(value);
      console.log(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear any previous errors when a field is changed
    setError('');
  };
  
  const validateForm = () => {
    if (!formData.teacher || !formData.subject || !formData.date || 
        !formData.startTime || !formData.endTime) {
      setError("All fields are required");
      return false;
    }
    
    // Check if end time is after start time
    const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.date}T${formData.endTime}`);
    
    if (endDateTime <= startDateTime) {
      setError("End time must be after start time");
      return false;
    }
    
    // Verify the subject is assigned to the teacher
    if (availableSubjects.length > 0) {
      const isValidSubject = availableSubjects.some(subject => 
        subject._id === formData.subject
      );
      
      if (!isValidSubject) {
        setError("Selected subject is not assigned to this teacher");
        return false;
      }
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      if (editMode && selectedEvent) {
        // Handle update existing schedule
        const response = await axios.put(`${baseApi}/schedule/update/${selectedEvent.id}`, {
          teacher: formData.teacher,
          subject: formData.subject,
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          status: formData.status
        });
        
        if (response.data.success) {
          setSuccess("Schedule updated successfully");
          
          // Notify parent component
          if (onScheduleUpdated) {
            onScheduleUpdated(response.data.data);
          }
        } else {
          setError(response.data.message || "Failed to update schedule");
        }
      } else {
        // Handle create new schedule
        const response = await axios.post(`${baseApi}/schedule/create`, {
          teacher: formData.teacher,
          subject: formData.subject,
          selectedClass: selectedClass,
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime
        });
        
        if (response.data.success) {
          setSuccess("Schedule created successfully");
          // Clear form
          setFormData({
            teacher: '',
            subject: '',
            date: '',
            startTime: '',
            endTime: '',
            status: 'active'
          });
          
          // Reset available subjects
          setAvailableSubjects([]);
          
          // Notify parent component to refresh events
          if (onScheduleAdded) {
            onScheduleAdded();
          }
        } else {
          setError(response.data.message || "Failed to create schedule");
        }
      }
    } catch (error) {
      console.error("Error with schedule operation:", error);
      setError(
        error.response?.data?.message || 
        `An error occurred while ${editMode ? 'updating' : 'creating'} the schedule`
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        px: { xs: 1, sm: 2, md: 3 },
        py: { xs: 1, sm: 2 }
      }}
    >
      <Paper 
        elevation={isMobile ? 1 : 3}
        sx={{ 
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: { xs: 2, sm: 3 }
        }}
      >
        {/* Header */}
        <Box sx={{ mb: { xs: 2, sm: 3 } }}>
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            component="h2"
            sx={{ 
              fontWeight: 600,
              color: 'primary.main',
              mb: 1
            }}
          >
            {editMode ? 'Update Schedule' : 'Create New Schedule'}
          </Typography>
          {selectedClass && (
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              Class: {selectedClass}
            </Typography>
          )}
        </Box>

        {/* Alerts */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2,
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 2,
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
            onClose={() => setSuccess('')}
          >
            {success}
          </Alert>
        )}

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
            {/* Teacher Selection */}
            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth 
                required 
                error={Boolean(error && !formData.teacher)}
                size={isMobile ? "small" : "medium"}
              >
                <InputLabel id="teacher-label">Teacher</InputLabel>
                <Select
                  labelId="teacher-label"
                  id="teacher"
                  name="teacher"
                  value={formData.teacher}
                  label="Teacher"
                  onChange={handleChange}
                  disabled={loading}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: isMobile ? 200 : 300,
                      },
                    },
                  }}
                >
                  {teachers.map(teacher => (
                    <MenuItem key={teacher._id} value={teacher._id}>
                      <Typography
                        sx={{ 
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          wordBreak: 'break-word'
                        }}
                      >
                        {teacher.name}
                      </Typography>
                    </MenuItem>
                  ))}
                </Select>
                {error && !formData.teacher && (
                  <FormHelperText>Teacher is required</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            {/* Subject Selection */}
            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth 
                required 
                error={Boolean(error && !formData.subject)}
                size={isMobile ? "small" : "medium"}
              >
                <InputLabel id="subject-label">Subject</InputLabel>
                <Select
                  labelId="subject-label"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  label="Subject"
                  onChange={handleChange}
                  disabled={loading || !formData.teacher || availableSubjects.length === 0}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: isMobile ? 200 : 300,
                      },
                    },
                  }}
                >
                  {availableSubjects.length > 0 ? (
                    availableSubjects.map(subject => (
                      <MenuItem key={subject._id} value={subject._id}>
                        <Typography
                          sx={{ 
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                            wordBreak: 'break-word'
                          }}
                        >
                          {subject.subjectName}
                        </Typography>
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>
                      <Typography
                        sx={{ 
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          fontStyle: 'italic'
                        }}
                      >
                        {formData.teacher ? "No subjects assigned to this teacher" : "Select a teacher first"}
                      </Typography>
                    </MenuItem>
                  )}
                </Select>
                {error && !formData.subject && (
                  <FormHelperText>Subject is required</FormHelperText>
                )}
                {formData.teacher && availableSubjects.length === 0 && (
                  <FormHelperText>No subjects are assigned to this teacher</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            {/* Date */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="date"
                name="date"
                label="Date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
                error={Boolean(error && !formData.date)}
                helperText={error && !formData.date ? "Date is required" : ""}
                disabled={loading}
                inputProps={{ 
                  min: new Date().toISOString().split('T')[0], 
                  max: "2030-12-31",
                  style: { fontSize: isMobile ? '16px' : '14px' } // Prevents zoom on iOS
                }}
                size={isMobile ? "small" : "medium"}
              />
            </Grid>
            
            {/* Start Time */}
            <Grid item xs={6} sm={4}>
              <TextField
                fullWidth
                id="startTime"
                name="startTime"
                label="Start Time"
                type="time"
                value={formData.startTime}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
                error={Boolean(error && !formData.startTime)}
                helperText={error && !formData.startTime ? "Required" : ""}
                disabled={loading}
                inputProps={{
                  style: { fontSize: isMobile ? '16px' : '14px' }
                }}
                size={isMobile ? "small" : "medium"}
              />
            </Grid>
            
            {/* End Time */}
            <Grid item xs={6} sm={4}>
              <TextField
                fullWidth
                id="endTime"
                name="endTime"
                label="End Time"
                type="time"
                value={formData.endTime}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
                error={Boolean(error && !formData.endTime)}
                helperText={error && !formData.endTime ? "Required" : ""}
                disabled={loading}
                inputProps={{
                  style: { fontSize: isMobile ? '16px' : '14px' }
                }}
                size={isMobile ? "small" : "medium"}
              />
            </Grid>
            
            {/* Status select - only show in edit mode */}
            {editMode && (
              <Grid item xs={12} sm={6}>
                <FormControl 
                  fullWidth
                  size={isMobile ? "small" : "medium"}
                >
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    id="status"
                    name="status"
                    value={formData.status}
                    label="Status"
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <MenuItem value="active">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: 'success.main',
                            mr: 1
                          }}
                        />
                        Active
                      </Box>
                    </MenuItem>
                    <MenuItem value="cancelled">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: 'error.main',
                            mr: 1
                          }}
                        />
                        Cancelled
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
          
          {/* Submit Button */}
          <Box 
            sx={{ 
              mt: { xs: 3, sm: 4 },
              display: 'flex',
              justifyContent: { xs: 'stretch', sm: 'flex-start' }
            }}
          >
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              size={isMobile ? "large" : "medium"}
              sx={{ 
                minWidth: { xs: '100%', sm: 200 },
                py: { xs: 1.5, sm: 1 },
                fontSize: { xs: '1rem', sm: '0.875rem' },
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none'
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress 
                    size={isMobile ? 20 : 24} 
                    sx={{ mr: 1 }} 
                    color="inherit" 
                  />
                  {editMode ? "Updating..." : "Creating..."}
                </Box>
              ) : (
                editMode ? "Update Schedule" : "Create Schedule"
              )}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ScheduleManagement;