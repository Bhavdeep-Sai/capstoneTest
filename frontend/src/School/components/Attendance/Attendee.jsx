import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { baseApi } from '../../../environment';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Button,
  Alert,
  IconButton,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Stack,
  Fade,
  Collapse,
  Divider,
  CircularProgress,
  Tooltip,
  InputAdornment
} from '@mui/material';
import {
  Edit as EditIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  PersonAdd as PersonAddIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled components matching the main theme
const StyledCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #2a2a3e 0%, #1e1e2e 100%)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 152, 0, 0.2)',
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    borderColor: 'rgba(255, 152, 0, 0.3)',
    boxShadow: '0 6px 25px rgba(0, 0, 0, 0.3)',
  },
}));

const AttendeeCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 87, 34, 0.1) 100%)',
  border: '1px solid rgba(255, 152, 0, 0.3)',
  borderRadius: 12,
  backdropFilter: 'blur(10px)',
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 10,
  textTransform: 'none',
  fontWeight: 700,
  fontSize: '0.875rem',
  padding: '10px 20px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-1px)',
  },
}));

const Attendee = ({ classId }) => {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedClassData, setSelectedClassData] = useState(null);
  const [edit, setEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch teachers and class data when component mounts or classId changes
  useEffect(() => {
    if (classId) {
      fetchTeachers();
      fetchSelectedClass();
    }
  }, [classId]);

  // Fetch teachers from the API, filtering by the specific class
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Use the teacherClass query parameter to filter teachers by class
      const response = await axios.get(`${baseApi}/teacher/fetch-with-query`, {
        params: { teacherClass: classId },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setTeachers(response.data.teachers || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching teachers:", err);
      setMessage({ type: 'error', text: 'Failed to load teachers for this class' });
      setLoading(false);
    }
  };

  const fetchSelectedClass = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${baseApi}/class/${classId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.data.data) {
        setSelectedClassData(res.data.data);

        // If class already has an attendee, set it as selected
        if (res.data.data.attendee) {
          setSelectedTeacher(res.data.data.attendee._id || res.data.data.attendee);
        }
      }
    } catch (error) {
      console.error("Error fetching class data:", error);
      setMessage({ type: 'error', text: 'Failed to load class information' });
    }
  };

  const handleSubmit = async () => {
    if (!selectedTeacher) {
      setMessage({ type: 'error', text: 'Please select a teacher' });
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      await axios.put(
        `${baseApi}/class/update/${classId}`,
        { attendee: selectedTeacher },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setMessage({ type: 'success', text: 'Attendee assigned successfully' });
      // Refresh class data after successful update
      fetchSelectedClass();
      setSubmitting(false);
      setEdit(false);
    } catch (error) {
      console.error("Error assigning attendee:", error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to assign attendee' });
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setEdit(false);
    setSelectedTeacher(selectedClassData?.attendee?._id || selectedClassData?.attendee || '');
    setMessage({ type: '', text: '' });
  };

  // Find the teacher name based on ID
  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t._id === teacherId);
    return teacher ? teacher.name : 'Unknown Teacher';
  };

  // Get initials for avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const currentAttendee = selectedClassData?.attendee;
  const attendeeName = typeof currentAttendee === 'object' 
    ? currentAttendee.name 
    : getTeacherName(currentAttendee);

  return (
    <StyledCard>
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              mr: 2,
              width: 40,
              height: 40,
            }}
          >
            <AssignmentIcon />
          </Avatar>
          <Typography variant="h6" fontWeight={700} color="primary">
            Class Attendee Management
          </Typography>
        </Box>

        {/* Alert Messages */}
        {message.text && (
          <Fade in>
            <Alert 
              severity={message.type} 
              sx={{ mb: 3, borderRadius: 2 }}
              onClose={() => setMessage({ type: '', text: '' })}
            >
              {message.text}
            </Alert>
          </Fade>
        )}

        {/* Current Attendee Display */}
        {currentAttendee && !edit && (
          <Fade in>
            <AttendeeCard sx={{ mb: 3 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      sx={{
                        bgcolor: 'success.main',
                        mr: 2,
                        width: 45,
                        height: 45,
                        fontSize: '1rem',
                      }}
                    >
                      {attendeeName ? getInitials(attendeeName) : <PersonIcon />}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Current Attendee
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {attendeeName}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip 
                      label="Active" 
                      color="success" 
                      size="small"
                      icon={<CheckIcon />}
                      sx={{ fontWeight: 600 }}
                    />
                    <Tooltip title="Edit Attendee">
                      <IconButton
                        onClick={() => setEdit(true)}
                        sx={{
                          bgcolor: 'rgba(255, 152, 0, 0.1)',
                          color: 'primary.main',
                          '&:hover': {
                            bgcolor: 'rgba(255, 152, 0, 0.2)',
                            transform: 'scale(1.05)',
                          },
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </CardContent>
            </AttendeeCard>
          </Fade>
        )}

        {/* No Attendee State */}
        {!currentAttendee && !edit && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Avatar
              sx={{
                bgcolor: 'rgba(255, 152, 0, 0.1)',
                color: 'primary.main',
                width: 60,
                height: 60,
                mx: 'auto',
                mb: 2,
              }}
            >
              <PersonAddIcon sx={{ fontSize: 30 }} />
            </Avatar>
            <Typography variant="h6" gutterBottom color="text.secondary">
              No Attendee Assigned
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              This class doesn't have an attendee assigned yet
            </Typography>
            <ActionButton
              variant="contained"
              onClick={() => setEdit(true)}
              startIcon={<PersonAddIcon />}
              sx={{
                background: 'linear-gradient(135deg, #FF9800 0%, #FF5722 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #FFB74D 0%, #FF7043 100%)',
                },
              }}
            >
              Assign Attendee
            </ActionButton>
          </Box>
        )}

        {/* Edit Form */}
        <Collapse in={edit}>
          <Box>
            <Divider sx={{ my: 3, borderColor: 'rgba(255, 152, 0, 0.2)' }} />
            
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
              <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
              {currentAttendee ? 'Change Attendee' : 'Assign New Attendee'}
            </Typography>

            <Stack spacing={3}>
              <FormControl fullWidth>
                <InputLabel id="teacher-select-label">Select Teacher</InputLabel>
                <Select
                  labelId="teacher-select-label"
                  label="Select Teacher"
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  disabled={loading || submitting}
                  startAdornment={
                    <InputAdornment position="start">
                      <PersonIcon color="primary" sx={{ ml: 1 }} />
                    </InputAdornment>
                  }
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    },
                  }}
                >
                  <MenuItem value="">
                    <em>Select a teacher</em>
                  </MenuItem>
                  {teachers.map((teacher) => (
                    <MenuItem key={teacher._id} value={teacher._id}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem', bgcolor: 'primary.main' }}>
                          {getInitials(teacher.name)}
                        </Avatar>
                        {teacher.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* No Teachers Warning */}
              {teachers.length === 0 && !loading && (
                <Alert severity="warning" sx={{ borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <WarningIcon sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      No teachers are assigned to this class. Teachers must be assigned to this class to appear in this list.
                    </Typography>
                  </Box>
                </Alert>
              )}

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <ActionButton
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={submitting}
                  startIcon={<CloseIcon />}
                  sx={{
                    borderColor: 'text.secondary',
                    color: 'text.secondary',
                    '&:hover': {
                      borderColor: 'error.main',
                      color: 'error.main',
                      backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    },
                  }}
                >
                  Cancel
                </ActionButton>
                
                <ActionButton
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading || submitting || !selectedTeacher}
                  startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <CheckIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #66BB6A 0%, #4CAF50 100%)',
                    },
                    '&:disabled': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'rgba(255, 255, 255, 0.3)',
                    },
                  }}
                >
                  {submitting 
                    ? 'Saving...' 
                    : currentAttendee 
                      ? 'Update Attendee' 
                      : 'Assign Attendee'
                  }
                </ActionButton>
              </Box>
            </Stack>
          </Box>
        </Collapse>

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress color="primary" />
          </Box>
        )}
      </CardContent>
    </StyledCard>
  );
};

export default Attendee;