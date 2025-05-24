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
  CircularProgress
} from '@mui/material';
import { baseApi } from '../../../environment';
import axios from 'axios';

const ScheduleManagement = ({ selectedClass, selectedEvent, editMode, onScheduleAdded, onScheduleUpdated }) => {
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
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required error={Boolean(error && !formData.teacher)}>
            <InputLabel id="teacher-label">Teacher</InputLabel>
            <Select
              labelId="teacher-label"
              id="teacher"
              name="teacher"
              value={formData.teacher}
              label="Teacher"
              onChange={handleChange}
              disabled={loading}
            >
              {teachers.map(teacher => (
                <MenuItem key={teacher._id} value={teacher._id}>
                  {teacher.name}
                </MenuItem>
              ))}
            </Select>
            {error && !formData.teacher && <FormHelperText>Teacher is required</FormHelperText>}
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required error={Boolean(error && !formData.subject)}>
            <InputLabel id="subject-label">Subject</InputLabel>
            <Select
              labelId="subject-label"
              id="subject"
              name="subject"
              value={formData.subject}
              label="Subject"
              onChange={handleChange}
              disabled={loading || !formData.teacher || availableSubjects.length === 0}
            >
              {availableSubjects.length > 0 ? (
                availableSubjects.map(subject => (
                  <MenuItem key={subject._id} value={subject._id}>
                    {subject.subjectName}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>
                  {formData.teacher ? "No subjects assigned to this teacher" : "Select a teacher first"}
                </MenuItem>
              )}
            </Select>
            {error && !formData.subject && <FormHelperText>Subject is required</FormHelperText>}
            {formData.teacher && availableSubjects.length === 0 && 
              <FormHelperText>No subjects are assigned to this teacher</FormHelperText>
            }
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={4}>
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
            inputProps={{ min: new Date().toISOString().split('T')[0], max: "2030-12-31" }}
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
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
            helperText={error && !formData.startTime ? "Start time is required" : ""}
            disabled={loading}
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
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
            helperText={error && !formData.endTime ? "End time is required" : ""}
            disabled={loading}
          />
        </Grid>
        
        {/* Status select - only show in edit mode */}
        {editMode && (
          <Grid item xs={12}>
            <FormControl fullWidth>
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
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}
      </Grid>
      
      {error && <Box sx={{ color: 'error.main', mt: 2 }}>{error}</Box>}
      {success && <Box sx={{ color: 'success.main', mt: 2 }}>{success}</Box>}
      
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={loading}
        sx={{ mt: 3 }}
      >
        {loading ? (
          <>
            <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
            {editMode ? "Updating..." : "Creating..."}
          </>
        ) : (
          editMode ? "Update Schedule" : "Create Schedule"
        )}
      </Button>
    </Box>
  );
};

export default ScheduleManagement;