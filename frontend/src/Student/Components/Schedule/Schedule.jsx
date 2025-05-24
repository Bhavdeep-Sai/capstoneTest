/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Container,
  useTheme,
  useMediaQuery,
  Alert,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import { CalendarToday, School, Schedule as ScheduleIcon } from '@mui/icons-material';
import { baseApi } from '../../../environment';
import axios from 'axios';

const localizer = momentLocalizer(moment);

// Dark theme configuration
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4299e1',
      light: '#63b3ed',
      dark: '#3182ce',
    },
    secondary: {
      main: '#9f7aea',
      light: '#b794f6',
      dark: '#805ad5',
    },
    background: {
      default: '#0f1419',
      paper: '#1a202c',
    },
    text: {
      primary: '#f7fafc',
      secondary: '#a0aec0',
    },
    error: {
      main: '#fc8181',
      light: '#feb2b2',
      dark: '#e53e3e',
    },
    warning: {
      main: '#f6ad55',
      light: '#fbd38d',
      dark: '#ed8936',
    },
    success: {
      main: '#68d391',
      light: '#9ae6b4',
      dark: '#48bb78',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#1a202c',
          border: '1px solid #2d3748',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a202c',
          border: '1px solid #2d3748',
        },
      },
    },
  },
});

const Schedule = () => {
  const [studentClass, setStudentClass] = useState("");
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [view, setView] = useState('week');
  const [date, setDate] = useState(new Date());
  const [error, setError] = useState("");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const handleNavigate = (newDate) => {
    setDate(newDate);
  };

  const fetchStudentData = () => {
    setLoading(true);
    setError("");

    axios.get(`${baseApi}/student/fetch-single`)
      .then(res => {
        const student = res.data?.student;

        if (student && student.studentClass) {
          setStudentData(student);
          setStudentClass(student.studentClass);
        } else {
          setError("Student class information not found. Please contact administrator.");
        }
      })
      .catch(err => {
        setError("Error loading student information. Please try again.");
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
          const formattedEvents = res.data.data.map(event => {
            const startDateTime = new Date(event.startTime);
            const endDateTime = new Date(event.endTime);

            return {
              id: event._id,
              title: event.subject?.subjectName || "Untitled",
              start: startDateTime,
              end: endDateTime,
              teacher: event.teacher?.name || "Unassigned",
              status: event.status || "active",
              eventType: 'schedule',
              resource: event
            };
          });

          // Fetch examinations after getting schedule events
          fetchExaminationsByClass(classId, formattedEvents);
        } else {
          // Still try to fetch examinations even if no schedule events
          fetchExaminationsByClass(classId, []);
        }
      })
      .catch(err => {
        setError("Error loading schedule. Please try again.");
        // Try to fetch examinations even if schedule fetch fails
        fetchExaminationsByClass(classId, []);
      });
  };

  const fetchExaminationsByClass = async (classId, scheduleEvents = []) => {
    if (!classId) return;

    try {
      const response = await axios.get(`${baseApi}/examination/class/${classId}`);

      if (response.data.success && response.data.data) {
        const examEvents = response.data.data.map(exam => {
          const examDate = new Date(exam.examDate);
          let startDateTime = new Date(examDate);
          let endDateTime = new Date(examDate);

          if (exam.startTime) {
            const [startHours, startMinutes] = exam.startTime.split(':').map(Number);
            startDateTime.setHours(startHours, startMinutes, 0);
          } else {
            // Default start time if not provided
            startDateTime.setHours(9, 0, 0);
          }

          if (exam.endTime) {
            const [endHours, endMinutes] = exam.endTime.split(':').map(Number);
            endDateTime.setHours(endHours, endMinutes, 0);
          } else if (exam.duration) {
            endDateTime = new Date(startDateTime.getTime() + (exam.duration * 60000));
          } else {
            // Default 2 hour duration if no end time or duration provided
            endDateTime = new Date(startDateTime.getTime() + (120 * 60000));
          }

          return {
            id: exam._id,
            title: `EXAM: ${exam.subject?.subjectName || exam.examType || "Examination"}`,
            start: startDateTime,
            end: endDateTime,
            status: "active",
            eventType: 'exam',
            examDetails: exam,
            resource: exam
          };
        });

        const allEvents = [...scheduleEvents, ...examEvents];
        setEvents(allEvents);
      } else {
        setEvents(scheduleEvents);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setEvents(scheduleEvents);
      } else {
        setError('Failed to fetch examinations for this class');
        setEvents(scheduleEvents);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  useEffect(() => {
    if (studentClass) {
      fetchEvents(studentClass._id);
    }
  }, [studentClass]);

  const getEventStyle = (event) => {
    const baseStyle = {
      borderRadius: '8px',
      border: 'none',
      fontWeight: '600',
      fontSize: isMobile ? '0.8rem' : '0.9rem',
      padding: '6px 10px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
      color: '#ffffff',
      textShadow: '0 1px 2px rgba(0,0,0,0.5)',
    };

    if (event.eventType === 'exam') {
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, #fc8181 0%, #e53e3e 100%)',
        border: '2px solid #feb2b2',
        fontWeight: '700',
      };
    }

    if (event.status === 'completed') {
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, #a0aec0 0%, #718096 100%)',
        border: '2px solid #cbd5e0',
        opacity: 0.9,
      };
    } else if (event.status === 'cancelled') {
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)',
        border: '2px solid #fc8181',
        textDecoration: 'line-through',
      };
    }

    return {
      ...baseStyle,
      background: 'linear-gradient(135deg, #63b3ed 0%, #4299e1 100%)',
      border: '2px solid #90cdf4',
    };
  };

  const EventComponent = ({ event }) => (
    <Box
      sx={{
        p: 0.75,
        borderRadius: 2,
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: '35px',
        ...getEventStyle(event),
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontWeight: 'bold',
          lineHeight: 1.3,
          fontSize: isMobile ? '0.8rem' : '0.85rem',
          textShadow: '0 1px 2px rgba(0,0,0,0.7)',
          wordBreak: 'break-word'
        }}
      >
        {event.title}
      </Typography>
      {event.teacher && !isMobile && (
        <Typography
          variant="caption"
          sx={{
            opacity: 0.95,
            fontSize: '0.75rem',
            textShadow: '0 1px 2px rgba(0,0,0,0.7)',
            marginTop: '2px'
          }}
        >
          {event.teacher}
        </Typography>
      )}
    </Box>
  );

  const calendarStyle = {
    height: isMobile ? 500 : isTablet ? 600 : 700,
    backgroundColor: '#1a202c',
    borderRadius: '12px',
    padding: isMobile ? '12px' : '24px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    border: '1px solid #2d3748',
    color: '#f7fafc',

    '& .rbc-calendar': {
      fontFamily: theme.typography.fontFamily,
      color: '#f7fafc',
    },

    // Header styling
    '& .rbc-header': {
      backgroundColor: '#2d3748',
      borderBottom: '2px solid #4a5568',
      padding: '14px 10px',
      fontWeight: '700',
      color: '#f7fafc',
      fontSize: isMobile ? '0.9rem' : '1rem',
      textAlign: 'center',
    },

    // Time header styling
    '& .rbc-time-header': {
      borderBottom: '2px solid #4a5568',
      backgroundColor: '#1a202c',
    },

    // Time slots
    '& .rbc-timeslot-group': {
      borderBottom: '1px solid #2d3748',
      backgroundColor: '#1a202c',
    },

    '& .rbc-time-slot': {
      borderTop: '1px solid #2d3748',
      color: '#a0aec0',
    },

    '& .rbc-day-slot .rbc-time-slot': {
      borderTop: '1px solid #2d3748',
    },

    // Time gutter
    '& .rbc-time-gutter': {
      backgroundColor: '#1a202c',
      color: '#a0aec0',
      fontWeight: '500',
    },

    '& .rbc-time-gutter .rbc-timeslot-group': {
      borderRight: '1px solid #4a5568',
    },

    // Today highlight
    '& .rbc-today': {
      backgroundColor: '#2a4365',
    },

    // Toolbar
    '& .rbc-toolbar': {
      marginBottom: '20px',
      flexWrap: 'wrap',
      gap: '8px',
      color: '#f7fafc',
    },

    '& .rbc-toolbar button': {
      backgroundColor: '#2d3748',
      border: '2px solid #4a5568',
      borderRadius: '10px',
      padding: '10px 18px',
      fontWeight: '600',
      color: '#f7fafc',
      transition: 'all 0.3s ease',
      fontSize: isMobile ? '0.8rem' : '0.9rem',
    },

    '& .rbc-toolbar button:hover': {
      backgroundColor: '#4a5568',
      borderColor: '#63b3ed',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(99, 179, 237, 0.3)',
    },

    '& .rbc-toolbar button.rbc-active': {
      backgroundColor: '#4299e1',
      borderColor: '#4299e1',
      color: 'white',
      boxShadow: '0 4px 12px rgba(66, 153, 225, 0.4)',
    },

    // Month view
    '& .rbc-month-view': {
      border: '1px solid #4a5568',
      borderRadius: '10px',
      overflow: 'hidden',
      backgroundColor: '#1a202c',
    },

    '& .rbc-date-cell': {
      padding: isMobile ? '6px' : '10px',
      textAlign: 'right',
      fontSize: isMobile ? '0.8rem' : '0.9rem',
      fontWeight: '600',
      color: '#f7fafc',
    },

    '& .rbc-off-range-bg': {
      backgroundColor: '#171923',
    },

    // Event container
    '& .rbc-event': {
      borderRadius: '8px',
      border: 'none',
      padding: '2px',
      margin: '1px',
    },

    // Month row
    '& .rbc-month-row': {
      borderBottom: '1px solid #2d3748',
    },

    // Date cell
    '& .rbc-date-cell > a': {
      color: '#f7fafc',
      textDecoration: 'none',
    },

    '& .rbc-date-cell.rbc-off-range > a': {
      color: '#4a5568',
    },

    // Week/Day view
    '& .rbc-time-content': {
      backgroundColor: '#1a202c',
      border: '1px solid #2d3748',
      borderRadius: '8px',
    },

    '& .rbc-time-column': {
      backgroundColor: '#1a202c',
    },

    '& .rbc-day-slot': {
      backgroundColor: '#1a202c',
    },

    // Current time indicator
    '& .rbc-current-time-indicator': {
      backgroundColor: '#63b3ed',
      height: '2px',
    },

    // All day events
    '& .rbc-allday-cell': {
      backgroundColor: '#2d3748',
      color: '#f7fafc',
    },

    // Agenda view
    '& .rbc-agenda-view': {
      backgroundColor: '#1a202c',
      color: '#f7fafc',
    },

    '& .rbc-agenda-view table': {
      backgroundColor: '#1a202c',
    },

    '& .rbc-agenda-view tbody > tr > td': {
      borderTop: '1px solid #2d3748',
      color: '#f7fafc',
    },

    '& .rbc-agenda-time-cell': {
      color: '#a0aec0',
    },

    '& .rbc-agenda-event-cell': {
      color: '#f7fafc',
    },
  };

  const statsData = [
    {
      title: 'My Class',
      displayValue: studentData?.studentClass?.classText || 'Not assigned',
      icon: <School sx={{ fontSize: isMobile ? 20 : 24 }} />,
      color: '#4299e1',
      bgColor: '#2a4365',
      isClassName: true,
    },
    {
      title: 'Schedule Events',
      displayValue: events.filter(e => e.eventType === 'schedule').length,
      icon: <ScheduleIcon sx={{ fontSize: isMobile ? 20 : 24 }} />,
      color: '#48bb78',
      bgColor: '#22543d',
      isClassName: false,
    },
    {
      title: 'Examinations',
      displayValue: events.filter(e => e.eventType === 'exam').length,
      icon: <CalendarToday sx={{ fontSize: isMobile ? 20 : 24 }} />,
      color: '#fc8181',
      bgColor: '#742a2a',
      isClassName: false,
    },
  ];

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ backgroundColor: '#0f1419', minHeight: '100vh', pb: 4 }}>
        <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
          {/* Header Section */}
          <Paper
            elevation={0}
            sx={{
              background: 'linear-gradient(135deg, #ff7c17 0%, #742a2a 100%)',
              color: 'white',
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              mb: 4,
              textAlign: 'center',
              border: '1px solid #4a5568',
            }}
          >
            <Typography
              variant={isMobile ? "h4" : "h3"}
              component="h1"
              sx={{
                fontWeight: 'bold',
                mb: 1,
                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                color: '#f7fafc',
              }}
            >
              My Class Schedule
            </Typography>
            <Typography
              variant={isMobile ? "body2" : "subtitle1"}
              sx={{ opacity: 0.9, maxWidth: 600, mx: 'auto', color: '#e2e8f0' }}
            >
              View your class schedules and upcoming examinations
            </Typography>
            {studentData && (
              <Typography
                variant={isMobile ? "body2" : "body1"}
                sx={{
                  opacity: 0.8,
                  mt: 1,
                  color: '#cbd5e0',
                  fontWeight: '500'
                }}
              >
                Welcome, {studentData.name || 'Student'}
              </Typography>
            )}
          </Paper>

          {/* Stats Cards */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 2,
              mb: 4,
            }}
          >
            {statsData.map((stat, index) => (
              <Card
                key={index}
                sx={{
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                  border: '1px solid #2d3748',
                  backgroundColor: '#1a202c',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
                    border: `1px solid ${stat.color}`,
                  },
                }}
              >
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: stat.bgColor,
                        color: stat.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1px solid ${stat.color}30`,
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant={stat.isClassName ? (isMobile ? "h6" : "h5") : (isMobile ? "h5" : "h4")}
                        sx={{
                          fontWeight: 'bold',
                          color: stat.color,
                          ...(stat.isClassName && {
                            fontSize: isMobile ? '1rem' : '1.25rem',
                            wordBreak: 'break-word',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          })
                        }}
                      >
                        {stat.displayValue}
                      </Typography>
                      <Typography
                        variant={isMobile ? "body2" : "body1"}
                        sx={{ fontWeight: '500', color: '#a0aec0' }}
                      >
                        {stat.title}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Student Class Info */}
          {studentData && (
            <Paper
              sx={{
                p: { xs: 2, md: 3 },
                borderRadius: 3,
                mb: 4,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                border: '1px solid #2d3748',
                backgroundColor: '#1a202c',
              }}
            >
              <Typography
                variant="h6"
                sx={{ mb: 2, fontWeight: '600', color: '#f7fafc' }}
              >
                Class Information
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <School sx={{ fontSize: 20, color: '#4299e1' }} />
                <Typography variant="body1" sx={{ color: '#f7fafc', fontWeight: '500' }}>
                  {studentData.studentClass?.classText || 'Class information not available'}
                </Typography>
              </Box>
            </Paper>
          )}

          {/* Calendar Section */}
          <Paper
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              border: '1px solid #2d3748',
              backgroundColor: '#1a202c',
            }}
          >
            {loading ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 8,
                  gap: 2,
                  backgroundColor: '#1a202c',
                }}
              >
                <CircularProgress size={48} sx={{ color: '#4299e1' }} />
                <Typography variant="h6" sx={{ color: '#a0aec0' }}>
                  Loading schedule...
                </Typography>
              </Box>
            ) : studentClass ? (
              <Box sx={calendarStyle}>
                {events.length > 0 && (
                  <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label="Regular Classes"
                      sx={{
                        backgroundColor: '#4299e1',
                        color: 'white',
                        fontWeight: '600',
                        border: '1px solid #63b3ed',
                      }}
                      size={isMobile ? "small" : "medium"}
                    />
                    <Chip
                      label="Examinations"
                      sx={{
                        backgroundColor: '#fc8181',
                        color: 'white',
                        fontWeight: '600',
                        border: '1px solid #feb2b2',
                      }}
                      size={isMobile ? "small" : "medium"}
                    />
                    <Chip
                      label="Completed"
                      sx={{
                        backgroundColor: '#a0aec0',
                        color: 'white',
                        fontWeight: '600',
                        border: '1px solid #cbd5e0',
                      }}
                      size={isMobile ? "small" : "medium"}
                    />
                  </Box>
                )}
                <Calendar
                  localizer={localizer}
                  events={events}
                  date={date}
                  onNavigate={handleNavigate}
                  view={view}
                  onView={setView}
                  views={['month', 'week', 'day', 'agenda']}
                  step={30}
                  timeslots={1}
                  startAccessor="start"
                  endAccessor="end"
                  min={new Date(0, 0, 0, 7, 0, 0)}
                  max={new Date(0, 0, 0, 22, 0, 0)}
                  style={{ height: isMobile ? 500 : isTablet ? 600 : 700 }}
                  components={{
                    event: EventComponent,
                  }}
                  eventPropGetter={() => ({ style: { border: 'none' } })}
                  formats={{
                    timeGutterFormat: (date, culture, localizer) =>
                      localizer.format(date, isMobile ? 'HH:mm' : 'h:mm A', culture),
                    dayFormat: (date, culture, localizer) =>
                      localizer.format(date, isMobile ? 'ddd M/D' : 'dddd M/D', culture),
                  }}
                />
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 8,
                  gap: 2,
                  backgroundColor: '#1a202c',
                }}
              >
                <CalendarToday sx={{ fontSize: 64, color: '#4a5568' }} />
                <Typography
                  variant={isMobile ? "h6" : "h5"}
                  sx={{ fontWeight: 'bold', color: '#f7fafc' }}
                >
                  Loading your schedule...
                </Typography>
                <Typography variant="body2" sx={{ color: '#a0aec0' }} textAlign="center">
                  Please wait while we load your class schedule and examinations
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Error Alert */}
          {error && (
            <Alert
              severity="error"
              sx={{
                mt: 2,
                borderRadius: 2,
                backgroundColor: '#742a2a',
                color: '#feb2b2',
                border: '1px solid #e53e3e',
                '& .MuiAlert-icon': {
                  fontSize: isMobile ? 20 : 24,
                  color: '#fc8181',
                },
              }}
            >
              {error}
            </Alert>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Schedule;