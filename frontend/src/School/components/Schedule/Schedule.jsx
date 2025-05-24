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
  Alert
} from '@mui/material';
import { Edit, Delete, Close } from '@mui/icons-material';
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
      return { backgroundColor: '#d32f2f', color: 'white' }; // Red for exams
    }
    
    // Style based on event status
    if (event.status === 'completed') {
      return { backgroundColor: '#9e9e9e', opacity: 0.7 };
    } else if (event.status === 'cancelled') {
      return { backgroundColor: '#f44336', textDecoration: 'line-through' };
    }
    return { backgroundColor: '#1976d2' }; // Default blue for regular schedule
  };

  const EventComponent = ({ event }) => (
    <div 
      className="p-1 rounded text-xs md:text-sm overflow-hidden"
      style={getEventStyle(event)}
    >
      <strong>{event.title}</strong>
      {event.teacher && <div>{event.teacher}</div>}
    </div>
  );

  return (
    <div className="pt-20 mx-4 md:mx-10">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-center text-2xl md:text-3xl font-bold">Class Schedule</h1>
        {!newPeriod && (
          <Button 
            variant="contained" 
            color="primary"
            onClick={toggleNewPeriod}
            sx={{ my: 2, md: { my: 0 } }}
          >
            Add New Period
          </Button>
        )}
      </div>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={showSnackbar} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={error ? "error" : "success"} 
          sx={{ width: '100%' }}
        >
          {error || success}
        </Alert>
      </Snackbar>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this schedule period? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => handleDeleteEvent(selectedEvent?.id)} 
            color="error" 
            variant="contained"
            disabled={loading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {newPeriod && (
        <div className="mb-6 relative">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {editMode ? "Edit Schedule Period" : "Add New Schedule Period"}
            </h2>
            <IconButton onClick={closeEditForm}>
              <Close />
            </IconButton>
          </div>
          
          <ScheduleManagement 
            selectedClass={selectedClass} 
            selectedEvent={selectedEvent}
            editMode={editMode}
            onScheduleAdded={handleCreateSuccess}
            onScheduleUpdated={handleUpdateSuccess}
          />
          
          {editMode && selectedEvent && (
            <div className="text-center mt-4 flex justify-between">
              <Button 
                variant="outlined" 
                color="error" 
                onClick={() => setDeleteConfirmOpen(true)}
                disabled={loading}
              >
                Delete Period
              </Button>
              <Button 
                variant="outlined" 
                color="secondary" 
                onClick={closeEditForm}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      )}

      <FormControl sx={{ mb: 4, width: { xs: "100%", md: "30%" } }} error={Boolean(error)}>
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

      {loading ? (
        <div className="flex justify-center items-center h-96">
          <p>Loading schedule...</p>
        </div>
      ) : (
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
          style={{ height: 600 }}
          components={{
            event: EventComponent
          }}
          onSelectEvent={handleEventClick}
          eventPropGetter={(event) => ({
            style: getEventStyle(event)
          })}
        />
      )}
    </div>
  );
};

export default Schedule;