/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import ScheduleManagement from './ScheduleManagement';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Container,
  Paper,
  Fade,
  Slide
} from '@mui/material';
import {
  Edit,
  Delete,
  Close,
  Add,
  School,
  Schedule as ScheduleIcon,
  CalendarToday,
  Person,
  Book,
  AccessTime
} from '@mui/icons-material';
import { baseApi } from '../../../environment';
import axios from 'axios';

const localizer = momentLocalizer(moment);

const Schedule = () => {
  const [newPeriod, setNewPeriod] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [view, setView] = useState('week');
  const [date, setDate] = useState(new Date());
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [calendarViews, setCalendarViews] = useState(['month', 'week', 'day', 'agenda']);
  const [currentView, setCurrentView] = useState('day');

  // State for event editing/deleting
  const [editMode, setEditMode] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleNavigate = (newDate) => {
    console.log(`Navigated to date: ${newDate}`);
    setDate(newDate);
  };

  const fetchClasses = () => {
    setLoading(true);
    setError("");

    axios.get(`${baseApi}/class/all`)
      .then(res => {
        if (res.data && res.data.data) {
          setClasses(res.data.data);
          if (res.data.data.length > 0) {
            setSelectedClass(res.data.data[0]._id);
          }
        } else {
          console.error("Invalid class data format received");
          setClasses([]);
          setError("Failed to load classes data");
        }
      })
      .catch(err => {
        console.error("Error fetching classes:", err);
        setClasses([]);
        setError("Error loading classes. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchEvents = (classId) => {
    if (!classId) return;

    setLoading(true);
    setError("");

    axios.get(`${baseApi}/schedule/fetch-with-class/${classId}`)
      .then(res => {
        if (res.data && res.data.data) {
          console.log("Schedule data:", res.data.data);

          const formattedEvents = res.data.data.map(event => {
            // Parse the start and end times properly
            const startDateTime = new Date(event.startTime);
            const endDateTime = new Date(event.endTime);

            return {
              id: event._id,
              title: event.subject?.subjectName || "Untitled",
              start: startDateTime,
              end: endDateTime,
              teacher: event.teacher?.name || "Unassigned",
              status: event.status || "active",
              eventType: 'schedule'
            };
          });

          // Also fetch examinations for this class
          fetchExaminationsByClass(classId, formattedEvents);
        } else {
          console.log("No events found for this class");
          // Still fetch examinations even if no schedule events
          fetchExaminationsByClass(classId, []);
        }
      })
      .catch(err => {
        console.error("Error fetching events:", err);
        setError("Error loading schedule. Please try again.");
        // Still try to fetch examinations
        fetchExaminationsByClass(classId, []);
      });
  };

  const fetchExaminationsByClass = async (classId, scheduleEvents = []) => {
    if (!classId) return;

    try {
      const response = await axios.get(`${baseApi}/examination/class/${classId}`);
      if (response.data.success) {
        console.log("Examination data:", response.data.data);

        // Format examination data to match calendar events
        const examEvents = response.data.data.map(exam => {
          // Based on the schema, examDate is a Date object, and startTime/endTime are strings in HH:MM format
          // We need to combine these to create proper Date objects for the calendar

          // Get the base date from examDate
          const examDate = new Date(exam.examDate);

          // Create start datetime by parsing startTime (HH:MM) and applying it to examDate
          let startDateTime = new Date(examDate);
          if (exam.startTime) {
            const [startHours, startMinutes] = exam.startTime.split(':').map(Number);
            startDateTime.setHours(startHours, startMinutes, 0);
          }

          // Create end datetime by parsing endTime (HH:MM) and applying it to examDate
          let endDateTime = new Date(examDate);
          if (exam.endTime) {
            const [endHours, endMinutes] = exam.endTime.split(':').map(Number);
            endDateTime.setHours(endHours, endMinutes, 0);
          } else if (exam.duration) {
            // If there's no endTime but there is a duration, calculate end time
            endDateTime = new Date(startDateTime.getTime() + (exam.duration * 60000)); // duration in minutes to milliseconds
          } else {
            // Fallback: If neither endTime nor duration are specified, default to 2 hours
            endDateTime = new Date(startDateTime.getTime() + (120 * 60000)); // 2 hours in milliseconds
          }

          return {
            id: exam._id,
            title: `EXAM: ${exam.subject?.subjectName || exam.examType || "Untitled Exam"}`,
            start: startDateTime,
            end: endDateTime,
            status: "active", // Examinations don't have a status field in schema
            eventType: 'exam',
            examDetails: exam // Store full exam details for reference
          };
        });

        // Combine schedule events and exam events
        const allEvents = [...scheduleEvents, ...examEvents];
        setEvents(allEvents);
      }
    } catch (error) {
      console.error("Error fetching examinations:", error);
      setError('Failed to fetch examinations for this class');

      // If we have schedule events, still show them even if exam fetch failed
      if (scheduleEvents.length > 0) {
        setEvents(scheduleEvents);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchEvents(selectedClass);
    }
  }, [selectedClass]);

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
  };

  const toggleNewPeriod = () => {
    setNewPeriod(!newPeriod);
    // Clear selected event when opening new period form
    if (!newPeriod) {
      setSelectedEvent(null);
      setEditMode(false);
    }
  };

  const handleEventClick = (event) => {
    // Don't allow editing of completed events
    if (event.status === 'completed') {
      setShowSnackbar(true);
      setSuccess("This event has been completed and cannot be modified.");
      return;
    }

    // Handle differently if it's an exam
    if (event.eventType === 'exam') {
      setShowSnackbar(true);
      setSuccess("This is an examination. Please use the Examinations menu to edit.");
      return;
    }

    setSelectedEvent({
      id: event.id,
      title: event.title,
      teacher: event.teacher,
      start: event.start,
      end: event.end
    });
    setEditMode(true);
    setNewPeriod(true);
  };

  const handleDeleteEvent = (eventId) => {
    setLoading(true);

    axios.delete(`${baseApi}/schedule/delete/${eventId}`)
      .then(res => {
        if (res.data && res.data.success) {
          setSuccess("Schedule period deleted successfully");
          setShowSnackbar(true);

          // Remove the event from state
          setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
          setDeleteConfirmOpen(false);
          setSelectedEvent(null);
          setEditMode(false);
          setNewPeriod(false);
        } else {
          throw new Error(res.data?.message || "Failed to delete schedule");
        }
      })
      .catch(err => {
        console.error("Error deleting schedule:", err);
        setError(err.response?.data?.message || "Error deleting schedule. Please try again.");
        setShowSnackbar(true);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleUpdateSuccess = (updatedEvent) => {
    setSuccess("Schedule updated successfully");
    setShowSnackbar(true);

    // Refresh events to reflect the changes
    fetchEvents(selectedClass);

    // Close the edit form
    setEditMode(false);
    setNewPeriod(false);
    setSelectedEvent(null);
  };

  const handleCreateSuccess = () => {
    setSuccess("New schedule period created successfully");
    setShowSnackbar(true);

    // Refresh events to reflect the changes
    fetchEvents(selectedClass);

    // Close the form
    setNewPeriod(false);
  };

  const closeEditForm = () => {
    setEditMode(false);
    setNewPeriod(false);
    setSelectedEvent(null);
  };

  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };

  const getEventStyle = (event) => {
    // Style based on event type and status
    if (event.eventType === 'exam') {
      return {
        backgroundColor: '#e53e3e',
        color: 'white',
        border: 'none',
        boxShadow: '0 2px 4px rgba(229, 62, 62, 0.2)'
      };
    }

    // Style based on event status
    if (event.status === 'completed') {
      return {
        backgroundColor: '#073B3A',
        opacity: 0.8,
        border: 'none',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(104, 211, 145, 0.2)'
      };
    } else if (event.status === 'cancelled') {
      return {
        backgroundColor: '#919191',
        color: '#1e1e1e',
        textDecoration: 'line-through',
        border: 'none',
        borderRadius: '2px',
        boxShadow: '0 2px 4px rgba(252, 129, 129, 0.2)'
      };
    }
    return {
      backgroundColor: '#93C572',
      border: 'none',
      boxShadow: '0 2px 4px rgba(66, 153, 225, 0.2)'
    };
  };

  const EventComponent = ({ event }) => (
    <Box
      sx={{
        p: 0.5,
        overflow: 'hidden',
        height: '100%',
        width: "100%",
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontWeight: 'bold',
          fontSize: { xs: '0.85rem', sm: '0.95rem', lg: '1rem', md: '1.2rem' },
          lineHeight: 1.2,
          mb: 0.25
        }}
      >
        {event.title}
      </Typography>
      {event.teacher && (
        <Typography
          variant="caption"
          sx={{
            fontSize: { xs: '0.6rem', sm: '0.7rem' },
            opacity: 0.9,
            lineHeight: 1.1
          }}
        >
          {event.teacher}
        </Typography>
      )}
    </Box>
  );

  useEffect(() => {
    const updateViews = () => {
      const isMobile = window.innerWidth <= 768;
      const newViews = isMobile ? ['day', 'agenda'] : ['month', 'week', 'day', 'agenda'];
      setCalendarViews(newViews);

      // If current view is not valid for new view list, fallback to first available
      if (!newViews.includes(currentView)) {
        setCurrentView(newViews[0]);
      }
    };

    updateViews();
    window.addEventListener('resize', updateViews);
    return () => window.removeEventListener('resize', updateViews);
  }, [currentView]);

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 2 }, px: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header Section */}
      <Paper
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #ff7c17 0%, #764ba2 100%)',
          color: 'white',
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          mb: 2,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', md: 'center' },
            gap: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ScheduleIcon sx={{ fontSize: { xs: 28, md: 32 } }} />
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 'bold',
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                  textAlign: { xs: 'center', md: 'left' }
                }}
              >
                Class Schedule
              </Typography>
            </Box>

            {!newPeriod && (
              <Button
                variant="contained"
                size="large"
                onClick={toggleNewPeriod}
                startIcon={<Add />}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  fontWeight: 'bold',
                  px: 3,
                  py: 1.5,
                  borderRadius: 3,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Add New Period
              </Button>
            )}
          </Box>
        </Box>

        {/* Decorative elements */}
        <Box sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 150,
          height: 150,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          zIndex: 0
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: 100,
          height: 100,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          zIndex: 0
        }} />
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        TransitionComponent={Slide}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={error ? "error" : "success"}
          sx={{
            width: '100%',
            borderRadius: 2,
            boxShadow: 3
          }}
        >
          {error || success}
        </Alert>
      </Snackbar>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          color: 'error.main',
          fontWeight: 'bold'
        }}>
          <Delete />
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this schedule period? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleDeleteEvent(selectedEvent?.id)}
            color="error"
            variant="contained"
            disabled={loading}
            sx={{ borderRadius: 2 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Management Form */}
      {newPeriod && (
        <Fade in={newPeriod} timeout={300}>
          <Card
            sx={{
              mb: 3,
              borderRadius: 3,
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              border: '1px solid rgba(0,0,0,0.05)'
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {editMode ? <Edit color="primary" /> : <Add color="primary" />}
                  <Typography
                    variant="h5"
                    component="h2"
                    sx={{
                      fontWeight: 'bold',
                      color: 'primary.main',
                      fontSize: { xs: '1.25rem', md: '1.5rem' }
                    }}
                  >
                    {editMode ? "Edit Schedule Period" : "Add New Schedule Period"}
                  </Typography>
                </Box>

                <IconButton
                  onClick={closeEditForm}
                  sx={{
                    backgroundColor: 'grey.100',
                    '&:hover': { backgroundColor: 'grey.200' }
                  }}
                >
                  <Close />
                </IconButton>
              </Box>

              <ScheduleManagement
                selectedClass={selectedClass}
                selectedEvent={selectedEvent}
                editMode={editMode}
                onScheduleAdded={handleCreateSuccess}
                onScheduleUpdated={handleUpdateSuccess}
              />

              {editMode && selectedEvent && (
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mt: 3,
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2
                }}>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setDeleteConfirmOpen(true)}
                    disabled={loading}
                    startIcon={<Delete />}
                    sx={{ borderRadius: 2 }}
                  >
                    Delete Period
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={closeEditForm}
                    sx={{ borderRadius: 2 }}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Fade>
      )}

      {/* Class Selection */}
      <Card sx={{
        mb: 3,
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        border: '1px solid rgba(0,0,0,0.05)'
      }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <School color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Select Class
            </Typography>
          </Box>

          <FormControl
            sx={{
              width: { xs: "100%", md: "400px" },
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
            error={Boolean(error)}
          >
            <InputLabel id="class-select-label">Class</InputLabel>
            <Select
              labelId="class-select-label"
              id="class-select"
              value={selectedClass}
              label="Class"
              name="class"
              onChange={handleClassChange}
              disabled={loading}
            >
              {classes.length > 0 ? (
                classes.map((cls) => (
                  <MenuItem key={cls._id} value={cls._id}>{cls.classText}</MenuItem>
                ))
              ) : (
                <MenuItem disabled value="">No Classes available</MenuItem>
              )}
            </Select>
            {error && <FormHelperText error>{error}</FormHelperText>}
          </FormControl>
        </CardContent>
      </Card>

      {/* Calendar Section */}
      <Card sx={{
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        border: '1px solid rgba(0,0,0,0.05)',
        overflow: 'hidden'
      }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 400,
              flexDirection: 'column',
              gap: 2
            }}>
              <CalendarToday sx={{ fontSize: 48, color: 'primary.main', opacity: 0.5 }} />
              <Typography variant="h6" color="text.secondary">
                Loading schedule...
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                '& .rbc-calendar': {
                  fontFamily: 'inherit',
                  backgroundColor: '#292929',
                  color: '#facc15',
                },
                '& .rbc-toolbar': {
                  padding: '16px',
                  background: 'linear-gradient(135deg, #ff7c17 0%, #c9694f 100%)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '12px',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  color: '#1e1e1e',
                },
                '& .rbc-toolbar-label': {
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                },
                '& .rbc-toolbar button': {
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#1e1e1e',
                  color: '#ff7c17',
                  fontWeight: 600,
                  padding: '8px 14px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: '#1e1e1e',
                    color: 'white',
                  },
                  '&.rbc-active': {
                    backgroundColor: 'rgb(41, 41, 41, 0.5)',
                    borderRadius: '2px',
                    color: '#fff',
                    boxShadow: "none",
                  },
                },
                '& .rbc-btn-group': {
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                },
                '& .rbc-header': {
                  backgroundColor: '#111827',
                  padding: '10px 6px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  textAlign: 'center',
                  color: '#facc15',
                },
                '& .rbc-time-view .rbc-time-gutter': {
                  backgroundColor: '#111827',
                  color: '#facc15',
                  fontSize: '0.85rem',
                },
                '& .rbc-today': {
                  backgroundColor: 'rgba(141, 83, 138, 0.2)',
                },
                '& .rbc-current-time-indicator': {
                  backgroundColor: '#f97316',
                  height: '2px',
                },
                '& .rbc-event': {
                  backgroundColor: '#fcd34d',
                  borderRadius: '2px',
                  color: '#1e293b',
                  padding: '4px 8px',
                  fontWeight: 500,
                  border: '1px solid #fbbf24',
                  fontSize: '0.875rem',
                },
                '& .rbc-events-container': {
                  margin: 0,
                },
                '& .rbc-event.rbc-selected': {
                  backgroundColor: '#f97316',
                  color: '#fff',
                },
                '& .rbc-day-bg + .rbc-day-bg': {
                  borderLeft: '1px solid #374151',
                },
                '& .rbc-agenda-view': {
                  color: '#1e1e1e',
                },
                '& .rbc-agenda-time-cell, & .rbc-agenda-date-cell': {
                  borderRight: '1px solid #1e1e1e',
                  padding: '8px',
                },
                '& .rbc-agenda-event-cell': {
                  color: '#1e1e1e',
                  fontWeight: 500,
                  padding: '8px',
                },
                '& .rbc-allday-cell': {
                  display: 'none',
                },
                '& .rbc-time-header-content': {
                  borderLeft: 'none',
                },
                '& .rbc-time-header-gutter': {
                  backgroundColor: '#111827',
                  color: '#facc15',
                },
                '& .rbc-date-cell': {
                  padding: '4px',
                },
                '& .rbc-show-more': {
                  color: '#fcd34d',
                  fontWeight: 500,
                  cursor: 'pointer',
                },
                '& .rbc-off-range-bg': {
                  color: '#fcd34d',
                  fontWeight: 500,
                  cursor: 'pointer',
                  backgroundColor: '#1e293b',
                },
                '& .rbc-time-slot': {
                  minHeight: '60px',
                  display:"flex",
                  alignItems:"end",
                  justifyContent:"center"
                },

                '& .rbc-time-content': {
                  width: '100%', // Ensures the content fills the available space
                  display: 'flex', // Required to align gutter and events correctly
                },

                '& .rbc-time-gutter': {
                  width: '150px', // Sets the width of the time gutter
                },

                '& .rbc-time-gutter .rbc-time-column': {
                  width: '100%', // Ensures inner column uses full width of gutter
                },

                // Responsive Enhancements
                '@media (max-width: 768px)': {
                  '& .rbc-toolbar': {
                    flexDirection: 'column',
                    alignItems: 'flex-center',
                    gap: '8px',
                  },
                  '& .rbc-toolbar-label': {
                    fontSize: '1.2rem',
                  },
                  '& .rbc-toolbar button': {
                    padding: '6px 12px',
                    fontSize: '0.85rem',
                  },
                  '& .rbc-header': {
                    fontSize: '0.75rem',
                  },
                },
              }}
            >
              <Calendar
                localizer={localizer}
                events={events}
                date={date}
                onNavigate={handleNavigate}
                view={currentView}
                onView={setCurrentView}
                views={calendarViews}
                step={60}
                timeslots={1}
                startAccessor="start"
                endAccessor="end"
                min={new Date(0, 0, 0, 7, 0, 0)}
                max={new Date(0, 0, 0, 19, 30, 0)}
                style={{ height: '80vh', width: '100%' }}
                components={{
                  event: EventComponent,
                }}
                onSelectEvent={handleEventClick}
                eventPropGetter={(event) => ({
                  style: getEventStyle(event),
                })}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card sx={{
        mt: 2,
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        border: '1px solid rgba(0,0,0,0.05)'
      }}>
        <CardContent sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
            Indicators
          </Typography>
          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            alignItems: 'center'
          }}>
            <div className='flex items-center'>
              <div className='w-5 h-5 bg-[#93c572] rounded-full'/>
              <span className='ml-2 text-sm'>Regular Class</span>
            </div>
            <div className='flex items-center'>
              <div className='w-5 h-5 bg-[#e53e3e] rounded-full'/>
              <span className='ml-2 text-sm'>Examination</span>
            </div>
            <div className='flex items-center'>
              <div className='w-5 h-5 bg-[#919191] rounded-full'/>
              <span className='ml-2 text-sm'>Cancelled</span>
            </div>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Schedule;