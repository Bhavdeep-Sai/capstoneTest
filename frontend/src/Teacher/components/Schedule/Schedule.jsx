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
  const [selectedClass, setSelectedClass] = useState("");
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [view, setView] = useState('week');
  const [date, setDate] = useState(new Date());
  const [error, setError] = useState("");
  const [calendarViews, setCalendarViews] = useState(['month', 'week', 'day', 'agenda']);
  const [currentView, setCurrentView] = useState('day');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const handleNavigate = (newDate) => {
    console.log(`Navigated to date: ${newDate}`);
    setDate(newDate);
  };

  const fetchClasses = () => {
    setLoading(true);
    setError("");

    axios.get(`${baseApi}/teacher/fetch-single`)
      .then(res => {
        const teacherData = res.data?.teacher;

        if (teacherData && Array.isArray(teacherData.teacherClasses)) {
          setClasses(teacherData.teacherClasses);
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
              eventType: 'schedule'
            };
          });

          fetchExaminationsByClass(classId, formattedEvents);
        } else {
          console.log("No events found for this class");
          fetchExaminationsByClass(classId, []);
        }
      })
      .catch(err => {
        console.error("Error fetching events:", err);
        setError("Error loading schedule. Please try again.");
        fetchExaminationsByClass(classId, []);
      });
  };

  const fetchExaminationsByClass = async (classId, scheduleEvents = []) => {
    if (!classId) return;

    try {
      const response = await axios.get(`${baseApi}/examination/class/${classId}`);
      if (response.data.success) {
        const examEvents = response.data.data.map(exam => {
          const examDate = new Date(exam.examDate);
          let startDateTime = new Date(examDate);
          if (exam.startTime) {
            const [startHours, startMinutes] = exam.startTime.split(':').map(Number);
            startDateTime.setHours(startHours, startMinutes, 0);
          }
          let endDateTime = new Date(examDate);
          if (exam.endTime) {
            const [endHours, endMinutes] = exam.endTime.split(':').map(Number);
            endDateTime.setHours(endHours, endMinutes, 0);
          } else if (exam.duration) {
            endDateTime = new Date(startDateTime.getTime() + (exam.duration * 60000));
          } else {
            endDateTime = new Date(startDateTime.getTime() + (120 * 60000));
          }

          return {
            id: exam._id,
            title: `EXAM: ${exam.subject?.subjectName || exam.examType || "Untitled Exam"}`,
            start: startDateTime,
            end: endDateTime,
            status: "active",
            eventType: 'exam',
            examDetails: exam
          };
        });

        const allEvents = [...scheduleEvents, ...examEvents];
        setEvents(allEvents);
      }
    } catch (error) {
      console.error("Error fetching examinations:", error);
      setError('Failed to fetch examinations for this class');

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



  const statsData = [
    {
      title: 'Total Classes',
      count: classes.length,
      icon: <School sx={{ fontSize: isMobile ? 20 : 24 }} />,
      color: '#4299e1',
      bgColor: '#2a4365',
    },
    {
      title: 'Schedule Events',
      count: events.filter(e => e.eventType === 'schedule').length,
      icon: <ScheduleIcon sx={{ fontSize: isMobile ? 20 : 24 }} />,
      color: '#48bb78',
      bgColor: '#22543d',
    },
    {
      title: 'Examinations',
      count: events.filter(e => e.eventType === 'exam').length,
      icon: <CalendarToday sx={{ fontSize: isMobile ? 20 : 24 }} />,
      color: '#fc8181',
      bgColor: '#742a2a',
    },
  ];

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
    <ThemeProvider theme={darkTheme}>
      <Box sx={{minHeight: '100vh', pb: 4 }}>
        <Container maxWidth="xl" sx={{ py: { xs: 2, md: 2 } }}>
          {/* Header Section */}
          <Paper
            elevation={0}
            sx={{
              background: 'linear-gradient(135deg, #ff7c17 0%, #1e120e 100%)',
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
              Class Schedule Management
            </Typography>
            <Typography
              variant={isMobile ? "body2" : "subtitle1"}
              sx={{ opacity: 0.9, maxWidth: 600, mx: 'auto', color: '#e2e8f0' }}
            >
              View your class schedules and examinations in one place
            </Typography>
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
                    <Box>
                      <Typography
                        variant={isMobile ? "h5" : "h4"}
                        sx={{ fontWeight: 'bold', color: stat.color }}
                      >
                        {stat.count}
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

          {/* Class Selection */}
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
              Select Class
            </Typography>
            <FormControl
              fullWidth
              error={Boolean(error)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#2d3748',
                  color: '#f7fafc',
                  '& fieldset': {
                    borderColor: '#4a5568',
                  },
                  '&:hover fieldset': {
                    borderColor: '#4299e1',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#4299e1',
                    borderWidth: '2px',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#a0aec0',
                  '&.Mui-focused': {
                    color: '#4299e1',
                  },
                },
                '& .MuiSelect-icon': {
                  color: '#a0aec0',
                },
              }}
            >
              <InputLabel id="class-select-label">Choose a class</InputLabel>
              <Select
                labelId="class-select-label"
                id="class-select"
                value={selectedClass}
                label="Choose a class"
                onChange={handleClassChange}
                disabled={loading}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: '#2d3748',
                      border: '1px solid #4a5568',
                      '& .MuiMenuItem-root': {
                        color: '#f7fafc',
                        '&:hover': {
                          backgroundColor: '#4a5568',
                        },
                        '&.Mui-selected': {
                          backgroundColor: '#4299e1',
                          '&:hover': {
                            backgroundColor: '#3182ce',
                          },
                        },
                      },
                    },
                  },
                }}
              >
                {classes.length > 0 ? (
                  classes.map((cls) => (
                    <MenuItem key={cls._id} value={cls._id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <School sx={{ fontSize: 18, color: '#4299e1' }} />
                        {cls.classText}
                      </Box>
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled value="">
                    No Classes available
                  </MenuItem>
                )}
              </Select>
              {error && <FormHelperText error>{error}</FormHelperText>}
            </FormControl>
          </Paper>

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
            ) : selectedClass ? (
              <Box>
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
                      display: "flex",
                      alignItems: "end",
                      justifyContent: "center"
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
                    eventPropGetter={(event) => ({
                      style: getEventStyle(event),
                    })}
                  />
                </Box>

                {events.length > 0 && (
                  <>
                    <div className='flex flex-wrap gap-4 p-4 mt-4'>
                      <div className='flex items-center gap-2'>
                        <div className='w-5 h-5 bg-[#93c572] rounded-full' />
                        <p>Regular Classes</p>
                      </div>
                      <div className='flex items-center gap-2'>
                        <div className='w-5 h-5 bg-[#e53e3e] rounded-full' />
                        <p>Examination</p>
                      </div>
                      <div className='flex items-center gap-2'>
                        <div className='w-5 h-5 bg-[#919191] rounded-full' />
                        <p>Cancelled</p>
                      </div>
                    </div>
                  </>
                )}

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
                  Select a class to view schedule
                </Typography>
                <Typography variant="body2" sx={{ color: '#a0aec0' }} textAlign="center">
                  Choose a class from the dropdown above to see the schedule and examinations
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