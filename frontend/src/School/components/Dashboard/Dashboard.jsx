import React, { useEffect, useRef, useState } from 'react';
import { baseApi } from '../../../environment';
import axios from 'axios';
import {
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
  Alert,
  CardMedia,
  Card,
  Grid,
  Paper,
  Badge,
  Divider
} from '@mui/material';
import PreviewIcon from '@mui/icons-material/Preview';
import EditIcon from '@mui/icons-material/Edit';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import BookIcon from '@mui/icons-material/Book';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import ClassIcon from '@mui/icons-material/Class';
import EventNoteIcon from '@mui/icons-material/EventNote';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { Shrink } from 'lucide-react';

const Dashboard = () => {
  const [schoolData, setSchoolData] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [preview, setPreview] = useState(false);
  const [edit, setEdit] = useState(false);
  const [schoolName, setSchoolName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');

  // Stats data
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    classes: 0
  });

  // Calendar and notices
  const [currentDate, setCurrentDate] = useState(new Date());
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState({
    students: false,
    teachers: false,
    classes: false,
    notices: false
  });

  // Image handling
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const fileInputRef = useRef(null);

  // Helper function to get school image URL from backend
  const getSchoolImageUrl = (imageName) => {
    if (!imageName) return null;
    return `${baseApi}/uploads/school/${imageName}`;
  };

  const addImage = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setImageUrl(URL.createObjectURL(selectedFile));
      setFile(selectedFile);
    }
  };

  const handleClearFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFile(null);
    setImageUrl(null);
  };

  const fetchSchool = () => {
    // Get token from localStorage
    const token = localStorage.getItem('token');

    if (!token) {
      setError("No authentication token found");
      return;
    }

    axios.get(`${baseApi}/school/fetch-single`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        console.log(res);
        if (res.data && res.data.school) {
          setSchoolData(res.data.school);
          setSchoolName(res.data.school.schoolName);
          setOwnerName(res.data.school.ownerName);
          setEmail(res.data.school.email);
        }
      })
      .catch(e => {
        console.log("Error", e);
        setError(e.response?.data?.message || "Failed to fetch school data");
      });
  };

  // Fetch all necessary data for dashboard stats
  const fetchStats = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setError("No authentication token found");
      return;
    }

    // Set loading states
    setLoading(prev => ({
      ...prev,
      students: true,
      teachers: true,
      classes: true
    }));

    try {
      // Fetch students count
      const studentsResponse = await axios.get(`${baseApi}/student/fetch-with-query`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Fetch teachers count
      const teachersResponse = await axios.get(`${baseApi}/teacher/fetch-with-query`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Fetch classes count
      const classesResponse = await axios.get(`${baseApi}/class/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Update stats with actual counts
      setStats({
        students: studentsResponse.data.students?.length || 0,
        teachers: teachersResponse.data.teachers?.length || 0,
        classes: classesResponse.data.data?.length || 0
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Failed to fetch dashboard statistics");
    } finally {
      // Clear loading states
      setLoading(prev => ({
        ...prev,
        students: false,
        teachers: false,
        classes: false
      }));
    }
  };

  // Fetch notices for the calendar
  const fetchNotices = async () => {
    try {
      setLoading(prev => ({ ...prev, notices: true }));

      const token = localStorage.getItem('token');
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const response = await axios.get(`${baseApi}/notice/important`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data && response.data.data) {
        // Transform notices to include 'important' flag based on content or type
        const formattedNotices = response.data.data.map(notice => ({
          id: notice._id,
          date: new Date(notice.createdAt).toISOString().split('T')[0], // Format as YYYY-MM-DD
          title: notice.title,
          important: notice.isImportant === true,
          content: notice.message
        }));

        setNotices(formattedNotices);
      }
    } catch (err) {
      console.error("Error fetching notices:", err);
      // Don't show error for notices as they're not critical
    } finally {
      setLoading(prev => ({ ...prev, notices: false }));
    }
  };

  const handleEditSubmit = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError("No authentication token found");
      return;
    }

    // Create form data
    const formData = new FormData();
    formData.append('schoolName', schoolName);
    formData.append('ownerName', ownerName);
    formData.append('email', email);

    if (file) {
      formData.append('image', file);
    }

    axios.put(`${baseApi}/school/update`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(res => {
        console.log(res);
        if (res.data && res.data.success) {
          setSchoolData(res.data.school);
          setSuccess(res.data.message);
          setEdit(false);
          fetchSchool(); // Refresh data
          // Clear the file input after successful update
          handleClearFile();
        }
      })
      .catch(e => {
        console.log("Error", e);
        setError(e.response?.data?.message || "Failed to update school data");
      });
  };

  const cancelEdit = () => {
    setEdit(false);
    setSchoolName(schoolData.schoolName);
    setOwnerName(schoolData.ownerName);
    setEmail(schoolData.email);
    setFile(null);
    setImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Generate calendar days
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  // Check if a date has notices
  const hasNotice = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return notices.some(notice => notice.date === dateStr);
  };

  // Get notice for a specific day
  const getNoticesForDay = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return notices.filter(notice => notice.date === dateStr);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
    const days = [];
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Add weekday headers
    weekdays.forEach(day => {
      days.push(
        <Box key={`header-${day}`} sx={{ width: '35px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant="caption" sx={{ color: '#bbb' }}>{day}</Typography>
        </Box>
      );
    });

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<Box key={`empty-${i}`} sx={{ width: '35px', height: '35px' }} />);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === new Date().getDate() &&
        currentDate.getMonth() === new Date().getMonth() &&
        currentDate.getFullYear() === new Date().getFullYear();

      const hasEvent = hasNotice(day);

      days.push(
        <Box
          key={`day-${day}`}
          sx={{
            width: '35px',
            height: '35px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            borderRadius: '50%',
            backgroundColor: isToday ? '#FF6B00' : 'transparent',
            '&:hover': {
              backgroundColor: '#444',
              cursor: 'pointer',
            }
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: isToday ? '#000' : '#fff',
              fontWeight: isToday ? 'bold' : 'normal'
            }}
          >
            {day}
          </Typography>
          {hasEvent && (
            <Box
              sx={{
                position: 'absolute',
                bottom: '2px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#FF9800'
              }}
            />
          )}
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px' }}>
        {days}
      </Box>
    );
  };

  useEffect(() => {
    fetchSchool();
    fetchStats();
    fetchNotices();
  }, []);

  // Set form data when schoolData is updated
  useEffect(() => {
    if (schoolData) {
      setSchoolName(schoolData.schoolName);
      setOwnerName(schoolData.ownerName);
      setEmail(schoolData.email);
    }
  }, [schoolData]);

  const dashboardStyles = {
    container: {
      backgroundColor: '#121212',
      color: '#fff',
      minHeight: '100vh',
      padding: '20px',
    },
    headerSection: {
      borderRadius: '12px',
      overflow: 'hidden',
      marginBottom: '20px',
      position: 'relative',
      height: '60vh'
    },
    statsCard: {
      backgroundColor: '#1E1E1E',
      borderRadius: '12px',
      padding: '20px',
      height: '100%',
      border: '1px solid #333',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
      }
    },
    statIcon: {
      backgroundColor: '#FF6B00',
      color: '#000',
      padding: '10px',
      borderRadius: '50%',
      marginBottom: '10px'
    },
    calendarCard: {
      backgroundColor: '#1E1E1E',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid #333',
      height: '100%'
    },
    noticeItem: {
      backgroundColor: '#2A2A2A',
      borderRadius: '8px',
      padding: '10px',
      marginBottom: '10px',
      borderLeft: '4px solid #FF6B00'
    }
  };

  return (
    <Box sx={dashboardStyles.container}>
      {/* Edit Form Modal */}
      {edit && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <Box
            component="form"
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "80vw",
              minWidth: '320px',
              maxWidth: '600px',
              padding: '30px',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
              backgroundColor: '#1E1E1E',
              border: '1px solid #333',
            }}
            noValidate
            autoComplete="off"
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BookIcon sx={{ color: '#FF9800', fontSize: 40, mr: 1 }} />
                <Typography variant="h5" gutterBottom sx={{ color: '#FFF', m: 0 }}>
                  Edit School Information
                </Typography>
              </Box>
              <IconButton onClick={cancelEdit} sx={{ color: '#fff' }}>
                <CloseIcon />
              </IconButton>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <TextField
              name="schoolName"
              label="Institute Name"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#555',
                  },
                  '&:hover fieldset': {
                    borderColor: '#FF9800',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#FF6B00',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#AAA',
                },
                '& .MuiInputBase-input': {
                  color: '#FFF',
                }
              }}
            />

            <TextField
              name="ownerName"
              label="Owner Name"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#555',
                  },
                  '&:hover fieldset': {
                    borderColor: '#FF9800',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#FF6B00',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#AAA',
                },
                '& .MuiInputBase-input': {
                  color: '#FFF',
                }
              }}
            />

            <TextField
              name="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#555',
                  },
                  '&:hover fieldset': {
                    borderColor: '#FF9800',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#FF6B00',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#AAA',
                },
                '& .MuiInputBase-input': {
                  color: '#FFF',
                }
              }}
            />

            <Typography sx={{ color: '#AAA', mb: 1 }}>Institute Image</Typography>
            <input
              ref={fileInputRef}
              type="file"
              onChange={addImage}
              accept="image/*"
              style={{ display: 'none' }}
              id="upload-image"
            />
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <Button
                variant="contained"
                component="label"
                htmlFor="upload-image"
                sx={{
                  backgroundColor: '#FF9800',
                  color: '#000',
                  '&:hover': {
                    backgroundColor: '#FF6B00'
                  }
                }}
              >
                <CloudUploadIcon sx={{ mr: 1 }} />
                Upload Image
              </Button>
              {file && (
                <Typography variant="body2" sx={{ ml: 2, color: '#AAA' }}>
                  {file.name}
                </Typography>
              )}
            </Box>

            {/* Preview current school image if no new file selected */}
            {!imageUrl && schoolData?.schoolImg && (
              <Box sx={{ maxWidth: '300px', marginTop: '10px', marginBottom: '20px' }}>
                <Typography variant="body2" sx={{ color: '#AAA', mb: 1 }}>
                  Current Image:
                </Typography>
                <CardMedia
                  component="img"
                  image={getSchoolImageUrl(schoolData.schoolImg)}
                  alt="Current school image"
                  sx={{
                    borderRadius: '8px',
                    border: '1px solid #444',
                    maxHeight: '150px',
                    objectFit: 'contain'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    console.error('Failed to load school image');
                  }}
                />
              </Box>
            )}

            {/* Preview new image if selected */}
            {imageUrl && (
              <Box sx={{ maxWidth: '300px', marginTop: '10px', marginBottom: '20px' }}>
                <Typography variant="body2" sx={{ color: '#AAA', mb: 1 }}>
                  New Image Preview:
                </Typography>
                <CardMedia
                  component="img"
                  image={imageUrl}
                  alt="School preview"
                  sx={{
                    borderRadius: '8px',
                    border: '1px solid #444',
                    maxHeight: '150px',
                    objectFit: 'contain'
                  }}
                />
                <Button
                  size="small"
                  color="error"
                  onClick={handleClearFile}
                  sx={{ mt: 1 }}
                >
                  Clear Image
                </Button>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#FF9800',
                  color: '#000',
                  flex: 1,
                  '&:hover': {
                    backgroundColor: '#FF6B00'
                  }
                }}
                onClick={handleEditSubmit}
              >
                Save Changes
              </Button>
              <Button
                variant="outlined"
                sx={{
                  borderColor: '#FF9800',
                  color: '#FF9800',
                  flex: 1,
                  '&:hover': {
                    borderColor: '#FF6B00',
                    backgroundColor: 'rgba(255,107,0,0.1)'
                  }
                }}
                onClick={cancelEdit}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {/* Main Dashboard Content */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      {schoolData && (
        <>
          {/* Header Section with School Info */}
          <Box sx={dashboardStyles.headerSection}>
            <Box sx={{
              height: "100%",
              width: "100%",
              background: schoolData.schoolImg ? 
                `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${getSchoolImageUrl(schoolData.schoolImg)})` :
                'linear-gradient(135deg, #FF6B00 0%, #FF9800 100%)',
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              display: 'flex',
              justifyContent: "center",
              alignItems: 'center',
              position: 'relative'
            }}>
              <Typography variant="h2" sx={{ color: '#fff', fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                {schoolData.schoolName}
              </Typography>
              <Box sx={{ position: 'absolute', bottom: "10px", right: "10px", display: 'flex', gap: 1 }}>
                <IconButton
                  onClick={() => setPreview(true)}
                  sx={{
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    '&:hover': { backgroundColor: 'rgba(0,0,0,0.8)' }
                  }}
                >
                  <PreviewIcon sx={{ color: "#FF9800", fontSize: '24px' }} />
                </IconButton>
                <IconButton
                  onClick={() => setEdit(true)}
                  sx={{
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    '&:hover': { backgroundColor: 'rgba(0,0,0,0.8)' }
                  }}
                >
                  <EditIcon sx={{ color: "#FF9800", fontSize: '24px' }} />
                </IconButton>
              </Box>
              <Box sx={{ position: 'absolute', bottom: "10px", left: "10px", display: 'flex', flexDirection: 'column' }}>
                <Typography variant="body1" sx={{ color: '#fff' }}>
                  <strong>Owner:</strong> {schoolData.ownerName}
                </Typography>
                <Typography variant="body1" sx={{ color: '#fff' }}>
                  <strong>Email:</strong> {schoolData.email}
                </Typography>
              </Box>
            </Box>
          </Box>
        </>
      )}

      <div className='min-h-100 flex flex-col md:flex-row flex-wrap w-full '>
        <div className='flex flex-col gap-20  w-[60%] p-10 h-[120%]'>
          <div className='flex gap-10 justify-center w-[100%]'>
            <div className="w-1/4 ">
              <Paper sx={dashboardStyles.statsCard}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <Box sx={dashboardStyles.statIcon}>
                    <GroupIcon />
                  </Box>
                  <Typography variant="h3" sx={{ color: '#FF9800', fontWeight: 'bold' }}>
                    {loading.students ? '...' : stats.students}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#ccc' }}>
                    Total Students
                  </Typography>
                </Box>
              </Paper>
            </div>
            <div className="w-1/4">
              <Paper sx={dashboardStyles.statsCard}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <Box sx={dashboardStyles.statIcon}>
                    <PersonIcon />
                  </Box>
                  <Typography variant="h3" sx={{ color: '#FF9800', fontWeight: 'bold' }}>
                    {loading.teachers ? '...' : stats.teachers}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#ccc' }}>
                    Total Teachers
                  </Typography>
                </Box>
              </Paper>
            </div>
            <div className="w-1/4">
              <Paper sx={dashboardStyles.statsCard}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <Box sx={dashboardStyles.statIcon}>
                    <ClassIcon />
                  </Box>
                  <Typography variant="h3" sx={{ color: '#FF9800', fontWeight: 'bold' }}>
                    {loading.classes ? '...' : stats.classes}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#ccc' }}>
                    Total Classes
                  </Typography>
                </Box>
              </Paper>
            </div>
          </div>
          <div>
            <Paper sx={dashboardStyles.calendarCard}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <NotificationsIcon sx={{ color: '#FF9800', mr: 1 }} />
                <Typography variant="h6" sx={{ color: '#fff' }}>
                  Important Notices
                </Typography>
              </Box>
              <Divider sx={{ backgroundColor: '#333', mb: 2 }} />
              <Box sx={{ maxHeight: '300px', overflow: 'auto' }}>
                {loading.notices ? (
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="body1" sx={{ color: '#aaa' }}>Loading notices...</Typography>
                  </Box>
                ) : notices.length > 0 ? (
                  notices.map(notice => (
                    <Box key={notice.id} sx={{
                      ...dashboardStyles.noticeItem,
                      borderLeft: notice.important ? '4px solid #f44336' : '4px solid #00FFFF'
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: notice.important ? '#f44336' : '#00FFFF' }}>
                          {notice.title}
                        </Typography>
                        {notice.important && (
                          <Badge color="error" variant="dot" />
                        )}
                      </Box>
                      <Typography variant="caption" sx={{ color: '#aaa' }}>
                        {new Date(notice.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="body1" sx={{ color: '#aaa' }}>No notices available</Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </div>
        </div>
        <div className='w-[40%] h-[200%] p-10'>
          <Paper sx={dashboardStyles.calendarCard}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarTodayIcon sx={{ color: '#FF9800', mr: 1 }} />
                <Typography variant="h6" sx={{ color: '#fff' }}>
                  Calendar
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ color: '#FF9800' }}>
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </Typography>
            </Box>
            <Divider sx={{ backgroundColor: '#333', mb: 2 }} />
            <Box sx={{ mb: 2 }}>
              {renderCalendar()}
            </Box>
          </Paper>
        </div>
      </div>

      {/* Preview Modal */}
      {preview && (
        <Box sx={{
          position: 'fixed',
          top: "100px",
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <Box sx={{
            backgroundColor: '#1E1E1E',
            borderRadius: '12px',
            padding: '20px',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            border: '1px solid #333'
          }}>
<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ color: '#fff' }}>
                School Information Preview
              </Typography>
              <IconButton onClick={() => setPreview(false)} sx={{ color: '#fff' }}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Divider sx={{ backgroundColor: '#333', mb: 2 }} />
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {schoolData.schoolImg && (
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <CardMedia
                    component="img"
                    image={getSchoolImageUrl(schoolData.schoolImg)}
                    alt="School image"
                    sx={{
                      maxWidth: '300px',
                      maxHeight: '200px',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      border: '1px solid #444',
                      margin: '0 auto'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      console.error('Failed to load school image');
                    }}
                  />
                </Box>
              )}
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body1" sx={{ color: '#fff' }}>
                  <strong style={{ color: '#FF9800' }}>School Name:</strong> {schoolData.schoolName}
                </Typography>
                <Typography variant="body1" sx={{ color: '#fff' }}>
                  <strong style={{ color: '#FF9800' }}>Owner Name:</strong> {schoolData.ownerName}
                </Typography>
                <Typography variant="body1" sx={{ color: '#fff' }}>
                  <strong style={{ color: '#FF9800' }}>Email:</strong> {schoolData.email}
                </Typography>
                <Typography variant="body1" sx={{ color: '#fff' }}>
                  <strong style={{ color: '#FF9800' }}>Created:</strong> {new Date(schoolData.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button
                variant="contained"
                onClick={() => setPreview(false)}
                sx={{
                  backgroundColor: '#FF9800',
                  color: '#000',
                  '&:hover': {
                    backgroundColor: '#FF6B00'
                  }
                }}
              >
                Close Preview
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;