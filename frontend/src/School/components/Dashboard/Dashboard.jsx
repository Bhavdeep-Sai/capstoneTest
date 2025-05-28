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
  Paper,
  Badge,
  Divider,
  Container,
  useTheme,
  useMediaQuery,
  Grid
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
import SubjectIcon from '@mui/icons-material/Subject';

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isExtraSmall = useMediaQuery(theme.breakpoints.down('xs'));

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
    classes: 0,
    subjects: 0
  });

  // Calendar and notices
  const [currentDate, setCurrentDate] = useState(new Date());
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState({
    students: false,
    teachers: false,
    classes: false,
    subjects: false,
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

    setLoading(prev => ({
      ...prev,
      students: true,
      teachers: true,
      classes: true,
      subjects: true
    }));

    try {
      const studentsResponse = await axios.get(`${baseApi}/student/fetch-with-query`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const teachersResponse = await axios.get(`${baseApi}/teacher/fetch-with-query`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const classesResponse = await axios.get(`${baseApi}/class/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const subjectsResponse = await axios.get(`${baseApi}/subject/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setStats({
        students: studentsResponse.data.students?.length || 0,
        teachers: teachersResponse.data.teachers?.length || 0,
        classes: classesResponse.data.data?.length || 0,
        subjects: subjectsResponse.data.data?.length || 0
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Failed to fetch dashboard statistics");
    } finally {
      setLoading(prev => ({
        ...prev,
        students: false,
        teachers: false,
        classes: false,
        subjects: false
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

      const response = await axios.get(`${baseApi}/notice/active`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data && response.data.data) {
        const formattedNotices = response.data.data.map(notice => ({
          id: notice._id,
          date: new Date(notice.expiryDate).toISOString().split('T')[0],
          title: notice.title,
          important: notice.isImportant === true,
          content: notice.message
        }));

        setNotices(formattedNotices);
      }
    } catch (err) {
      console.error("Error fetching notices:", err);
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
          fetchSchool();
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

  // Calendar functions
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
    const days = [];
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    weekdays.forEach(day => {
      days.push(
        <Box key={`header-${day}`} sx={{
          width: { xs: '30px', sm: '35px' },
          height: { xs: '25px', sm: '30px' },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Typography variant="caption" sx={{ color: '#bbb', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
            {isSmallScreen ? day.slice(0, 1) : day.slice(0, 3)}
          </Typography>
        </Box>
      );
    });

    for (let i = 0; i < firstDay; i++) {
      days.push(<Box key={`empty-${i}`} sx={{ width: { xs: '30px', sm: '35px' }, height: { xs: '30px', sm: '35px' } }} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === new Date().getDate() &&
        currentDate.getMonth() === new Date().getMonth() &&
        currentDate.getFullYear() === new Date().getFullYear();
      days.push(
        <Box
          key={`day-${day}`}
          sx={{
            width: { xs: '30px', sm: '35px' },
            height: { xs: '30px', sm: '35px' },
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            borderRadius: '50%',
            backgroundColor: isToday ? '#FF6B00' : 'transparent',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: isToday ? '#000' : '#fff',
              fontWeight: isToday ? 'bold' : 'normal',
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}
          >
            {day}
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: { xs: '2px', sm: '5px' } }}>
        {days}
      </Box>
    );
  };

  useEffect(() => {
    fetchSchool();
    fetchStats();
    fetchNotices();
  }, []);

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
    },
    headerSection: {
      borderRadius: '12px',
      overflow: 'hidden',
      marginBottom: { xs: '16px', sm: '20px', md: '24px' },
      position: 'relative',
      height: { xs: '200px', sm: '300px', md: '400px', lg: '500px' }
    },
    statsCard: {
      backgroundColor: '#1E1E1E',
      borderRadius: '10px',
      padding: { xs: '12px', sm: '16px', md: '20px' },
      width: { xs: '150px', lg: '200px' },
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
      padding: { xs: '8px', sm: '10px' },
      borderRadius: { xs: '25%', lg: '50%' },
      marginBottom: '10px',
      '& svg': {
        fontSize: { xs: '1.2rem', sm: '1.5rem' }
      }
    },
    calendarCard: {
      backgroundColor: '#1E1E1E',
      borderRadius: { xs: '10px', lg: '12px' },
      padding: { xs: '12px', sm: '16px', md: '20px' },
      border: '1px solid #333',

    },
    noticeCard: {
      backgroundColor: '#2A2A2A',
      borderRadius: '8px',
      padding: { xs: '8px', sm: '10px' },
      marginBottom: '10px',
      width: '100%',
    },
    noticeItem: {
      backgroundColor: '#2A2A2A',
      borderRadius: '8px',
      padding: { xs: '8px', sm: '10px' },
      marginBottom: '10px',
      width: '95%',
      borderLeft: '2px solid #FF6B00'
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
          alignItems: { xs: 'flex-start', sm: 'center' },
          zIndex: 1000,
          padding: { xs: '8px', sm: '20px' },
          overflow: 'auto',
        }}>
          <Box
            component="form"
            sx={{
              display: "flex",
              flexDirection: "column",
              width: { xs: '95%', sm: '90%', md: '70%', lg: '40%' },
              maxWidth: '600px',
              padding: { xs: '16px', sm: '24px', md: '30px' },
              borderRadius: { xs: '5px', sm: '12px' },
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
              backgroundColor: '#1E1E1E',
              border: '1px solid #333',
              maxHeight: { xs: '100vh', sm: '90vh' },
              overflow: 'auto',
              scrollBehavior: 'smooth',
              marginTop: '70px',
            }}
            noValidate
            autoComplete="off"
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <BookIcon sx={{ color: '#FF9800', fontSize: { xs: 30, sm: 40 }, mr: 1 }} />
                <Typography variant={isSmallScreen ? "h6" : "h5"} gutterBottom sx={{ color: '#FFF', m: 0 }}>
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
              fullWidth
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
              fullWidth
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
              fullWidth
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
            <Box sx={{ mb: 2, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, gap: { xs: 1, sm: 2 } }}>
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
                <Typography variant="body2" sx={{ color: '#AAA', textAlign: { xs: 'center', sm: 'left' } }}>
                  {file.name}
                </Typography>
              )}
            </Box>

            {!imageUrl && schoolData?.schoolImg && (
              <Box sx={{ maxWidth: '100%', marginTop: '10px', marginBottom: '20px', textAlign: 'center' }}>
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
                    maxHeight: { xs: '120px', sm: '150px' },
                    maxWidth: '100%',
                    objectFit: 'contain'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    console.error('Failed to load school image');
                  }}
                />
              </Box>
            )}

            {imageUrl && (
              <Box sx={{ maxWidth: '100%', marginTop: '10px', marginBottom: '20px', textAlign: 'center' }}>
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
                    maxHeight: { xs: '120px', sm: '150px' },
                    maxWidth: '100%',
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

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: 2 }}>
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
      <Container maxWidth="xl" sx={{ p: 0 }}>
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
                position: 'relative',
                padding: { xs: '16px', sm: '24px', md: '30px' }
              }}>
                <Typography
                  variant={isExtraSmall ? "h5" : isSmallScreen ? "h4" : isTablet ? "h3" : "h2"}
                  sx={{
                    color: '#fff',
                    fontWeight: 'bold',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                    textAlign: 'center',
                    wordBreak: 'break-word',
                    maxWidth: '80%'
                  }}
                >
                  {schoolData.schoolName}
                </Typography>

                {/* Action Buttons */}
                <Box sx={{
                  position: 'absolute',
                  top: { xs: '8px', sm: '12px', md: '16px' },
                  right: { xs: '8px', sm: '12px', md: '16px' },
                  display: 'flex',
                  gap: { xs: 0.5, sm: 1 },
                  flexDirection: { xs: 'column', sm: 'row' }
                }}>
                  <IconButton
                    onClick={() => setPreview(true)}
                    sx={{
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      '&:hover': { backgroundColor: 'rgba(0,0,0,0.8)' },
                      width: { xs: '36px', sm: '44px', md: '48px' },
                      height: { xs: '36px', sm: '44px', md: '48px' }
                    }}
                  >
                    <PreviewIcon sx={{ color: "#FF9800", fontSize: { xs: '18px', sm: '22px', md: '24px' } }} />
                  </IconButton>
                  <IconButton
                    onClick={() => setEdit(true)}
                    sx={{
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      '&:hover': { backgroundColor: 'rgba(0,0,0,0.8)' },
                      width: { xs: '36px', sm: '44px', md: '48px' },
                      height: { xs: '36px', sm: '44px', md: '48px' }
                    }}
                  >
                    <EditIcon sx={{ color: "#FF9800", fontSize: { xs: '18px', sm: '22px', md: '24px' } }} />
                  </IconButton>
                </Box>

                {/* School Info */}
                <Box sx={{
                  position: 'absolute',
                  bottom: { xs: '8px', sm: '12px', md: '16px' },
                  left: { xs: '8px', sm: '12px', md: '16px' },
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  padding: { xs: '6px', sm: '10px', md: '12px' },
                  borderRadius: '8px',
                  maxWidth: { xs: '70%', sm: '50%', md: '40%' }
                }}>
                  <Typography variant={isSmallScreen ? "caption" : "body2"} sx={{ color: '#fff', wordBreak: 'break-word' }}>
                    <strong>Owner:</strong> {schoolData.ownerName}
                  </Typography>
                  <Typography variant={isSmallScreen ? "caption" : "body2"} sx={{ color: '#fff', wordBreak: 'break-all' }}>
                    <strong>Email:</strong> {schoolData.email}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </>
        )}

        {/* Main Content Grid */}
        <Grid className="flex flex-col lg:flex-row justify-center items-center gap-5 lg:gap-10" >
          {/* Left Section - Stats and Notices */}
          <Grid className="md:w-1/2">
            {/* Stats Cards */}
            <Grid className="flex flex-wrap gap-5 md:gap-10 justify-center items-center" spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
              <Grid item xs={6} sm={6} md={3}>
                <Paper sx={dashboardStyles.statsCard}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <Box sx={dashboardStyles.statIcon}>
                      <GroupIcon />
                    </Box>
                    <Typography variant={isSmallScreen ? "h6" : "h5"} sx={{ color: '#FF9800', fontWeight: 'bold', mb: 1 }}>
                      {loading.students ? '...' : stats.students}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#AAA' }}>
                      Students
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={6} sm={6} md={3}>
                <Paper sx={dashboardStyles.statsCard}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <Box sx={dashboardStyles.statIcon}>
                      <PersonIcon />
                    </Box>
                    <Typography variant={isSmallScreen ? "h6" : "h5"} sx={{ color: '#FF9800', fontWeight: 'bold', mb: 1 }}>
                      {loading.teachers ? '...' : stats.teachers}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#AAA' }}>
                      Teachers
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={6} sm={6} md={3}>
                <Paper sx={dashboardStyles.statsCard}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <Box sx={dashboardStyles.statIcon}>
                      <ClassIcon />
                    </Box>
                    <Typography variant={isSmallScreen ? "h6" : "h5"} sx={{ color: '#FF9800', fontWeight: 'bold', mb: 1 }}>
                      {loading.classes ? '...' : stats.classes}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#AAA' }}>
                      Classes
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={6} sm={6} md={3}>
                <Paper sx={dashboardStyles.statsCard}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <Box sx={dashboardStyles.statIcon}>
                      <SubjectIcon />
                    </Box>
                    <Typography variant={isSmallScreen ? "h6" : "h5"} sx={{ color: '#FF9800', fontWeight: 'bold', mb: 1 }}>
                      {loading.subjects ? '...' : stats.subjects}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#AAA' }}>
                      Subjects
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            {/* Recent Notices Section */}
            <Paper sx={dashboardStyles.noticeCard}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <NotificationsIcon sx={{ color: '#FF9800', mr: 1 }} />
                <Typography variant={isSmallScreen ? "h6" : "h5"} sx={{ color: '#fff', fontWeight: 'bold' }}>
                  Recent Notices
                </Typography>
              </Box>
              <Divider sx={{ borderColor: '#333', mb: 2 }} />

              {loading.notices ? (
                <Typography sx={{ color: '#AAA', textAlign: 'center', py: 2 }}>
                  Loading notices...
                </Typography>
              ) : notices.length === 0 ? (
                <Typography sx={{ color: '#AAA', textAlign: 'center', py: 2 }}>
                  No active notices
                </Typography>
              ) : (
                <Box sx={{ maxHeight: '300px', overflow: 'auto' }}>
                  {notices.slice(0, 5).map((notice) => (
                    <Box key={notice.id} className={notice.important ? "border-2 border-red-400" : ""} sx={dashboardStyles.noticeItem}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="subtitle2"  sx={{ color: '#fff', fontWeight: 'bold', flex: 1 }}>
                          <div>
                            {notice.title}
                          </div>
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#AAA', ml: 1 }}>
                          {new Date(notice.date).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: '#CCC' }}>
                        {notice.content}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Right Section - Calendar */}
          <Grid className='w-[90%] lg:w-1/2'>
            <Paper sx={dashboardStyles.calendarCard}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarTodayIcon sx={{ color: '#FF9800', mr: 1 }} />
                  <Typography variant={isSmallScreen ? "h6" : "h5"} sx={{ color: '#fff', fontWeight: 'bold' }}>
                    Calendar
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ borderColor: '#333', mb: 2 }} />

              {/* Month Navigation */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <IconButton
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    newDate.setMonth(newDate.getMonth() - 1);
                    setCurrentDate(newDate);
                  }}
                  sx={{ color: '#FF9800' }}
                >
                  <Typography>{'<'}</Typography>
                </IconButton>

                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold' }}>
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </Typography>

                <IconButton
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    newDate.setMonth(newDate.getMonth() + 1);
                    setCurrentDate(newDate);
                  }}
                  sx={{ color: '#FF9800' }}
                >
                  <Typography>{'>'}</Typography>
                </IconButton>
              </Box>

              {/* Calendar Grid */}
              <Box sx={{ mb: 2 }}>
                {renderCalendar()}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Preview Modal */}
        {preview && schoolData && (
          <Box sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.9)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: { xs: '8px', sm: '20px' }
          }}>
            <Box sx={{
              backgroundColor: '#1E1E1E',
              borderRadius: '12px',
              padding: { xs: '16px', sm: '24px', md: '30px' },
              maxWidth: { xs: '95%', sm: '80%', md: '70%', lg: '60%' },
              maxHeight: '90vh',
              overflow: 'auto',
              border: '1px solid #333',
              position: 'relative'
            }}>
              <IconButton
                onClick={() => setPreview(false)}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  color: '#fff',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
                }}
              >
                <CloseIcon />
              </IconButton>

              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant={isSmallScreen ? "h5" : "h4"} sx={{ color: '#FF9800', fontWeight: 'bold', mb: 2 }}>
                  {schoolData.schoolName}
                </Typography>

                {schoolData.schoolImg && (
                  <CardMedia
                    component="img"
                    image={getSchoolImageUrl(schoolData.schoolImg)}
                    alt="School"
                    sx={{
                      borderRadius: '12px',
                      maxHeight: { xs: '200px', sm: '300px', md: '400px' },
                      maxWidth: '100%',
                      objectFit: 'contain',
                      border: '1px solid #444',
                      mb: 2
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}

                <Box sx={{ textAlign: 'left', mt: 2 }}>
                  <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
                    School Information
                  </Typography>
                  <Divider sx={{ borderColor: '#333', mb: 2 }} />

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" sx={{ color: '#AAA', mb: 0.5 }}>
                      <strong>Owner:</strong>
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#fff' }}>
                      {schoolData.ownerName}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" sx={{ color: '#AAA', mb: 0.5 }}>
                      <strong>Email:</strong>
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#fff', wordBreak: 'break-all' }}>
                      {schoolData.email}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body1" sx={{ color: '#AAA', mb: 0.5 }}>
                      <strong>Registered:</strong>
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#fff' }}>
                      {new Date(schoolData.createdAt || Date.now()).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Dashboard;