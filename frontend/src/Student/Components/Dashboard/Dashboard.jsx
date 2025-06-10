import * as React from 'react';
import {
  Table, TableBody, TableCell, TableContainer,
  TableRow, Paper, Box, IconButton, Typography,
  ThemeProvider, createTheme, CssBaseline, Collapse,
  useMediaQuery
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { baseApi } from '../../../environment';

// Create dark theme with orange/red color scheme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff7043', // Orange
      light: '#ffab91',
      dark: '#d84315',
    },
    secondary: {
      main: '#ff5722', // Deep orange
      light: '#ff8a65',
      dark: '#bf360c',
    },
    background: {
      default: '#0a0a0a',
      paper: 'rgba(30, 30, 30, 0.9)',
    },
    text: {
      primary: '#ffffff',
      secondary: '#ffab91',
    },
    warning: {
      main: '#ffc107',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(135deg, rgba(30, 30, 30, 0.9) 0%, rgba(45, 45, 45, 0.9) 100%)',
          border: '1px solid rgba(255, 112, 67, 0.2)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(255, 112, 67, 0.1)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(255, 112, 67, 0.2)',
          color: '#ffffff',
          fontWeight: 500,
          '@media (max-width: 600px)': {
            padding: '8px 4px',
            fontSize: '14px',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#ff7043',
          '&:hover': {
            backgroundColor: 'rgba(255, 112, 67, 0.1)',
          },
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

const customCalendarStyles = `
  .react-calendar {
    background: linear-gradient(135deg, rgba(30, 30, 30, 0.9) 0%, rgba(45, 45, 45, 0.9) 100%) !important;
    border: 1px solid rgba(255, 112, 67, 0.3) !important;
    border-radius: 16px !important;
    color: white !important;
    font-family: 'Roboto', sans-serif !important;
    box-shadow: 0 8px 32px rgba(255, 112, 67, 0.1) !important;
    backdrop-filter: blur(10px) !important;
    width: 100% !important;
    max-width: 100% !important;
  }
  
  .react-calendar__navigation {
    background: rgba(255, 112, 67, 0.1) !important;
    border-radius: 12px 12px 0 0 !important;
    margin-bottom: 1em !important;
  }
  
  .react-calendar__navigation button {
    color: #ff7043 !important;
    font-weight: 600 !important;
    font-size: 16px !important;
  }
  
  .react-calendar__navigation button:enabled:hover,
  .react-calendar__navigation button:enabled:focus {
    background-color: rgba(255, 112, 67, 0.2) !important;
  }
  
  .react-calendar__month-view__weekdays {
    background: rgba(255, 112, 67, 0.05) !important;
    color: #ffab91 !important;
    font-weight: 600 !important;
    padding: 10px 0 !important;
    text-align: center !important;
  }
  
  .react-calendar__tile {
    background: transparent !important;
    color: white !important;
    border-radius: 5px !important;
    padding-left:0;
    padding-right:0;
    margin: 0 !important;
    transition: all 0.3s ease !important;
    text-align: center !important;
  }
  
  .react-calendar__tile--now {
    background: rgba(255, 193, 7, 0.2) !important;
    color: #ffc107 !important;
    font-weight: 600 !important;
  }
  
  .react-calendar__tile--neighboringMonth {
    color: rgba(255, 255, 255, 0.3) !important;
  }

  @media (max-width: 600px) {
    .react-calendar {
      font-size: 14px !important;
    }
    
    .react-calendar__navigation button {
      font-size: 14px !important;
    }
    
    .react-calendar__tile {
      height: 35px !important;
      font-size: 12px !important;
    }
  }
`;

export default function Dashboard() {
  const [studentData, setStudentData] = React.useState({});
  const [notices, setNotices] = React.useState([]);
  const [showPassword, setShowPassword] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [expandedPersonalInfo, setExpandedPersonalInfo] = React.useState(false);

  // Media queries for responsive behavior
  const isMobile = useMediaQuery(darkTheme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(darkTheme.breakpoints.down('md'));
  const isLarge = useMediaQuery(darkTheme.breakpoints.up('lg'));

  const fetchstudentData = async () => {
    try {
      const res = await axios.get(`${baseApi}/student/fetch-single`);
      setStudentData(res.data.student);
      console.log(res.data.student)
    } catch (error) {
      console.log("Error in Fetching student Data:", error);
    }
  };

  const fetchNotices = async () => {
    try {
      const res = await axios.get(`${baseApi}/notice/important`);
      setNotices(res.data.data);
    } catch (error) {
      console.log("Error in Fetching Notices:", error);
    }
  };

  React.useEffect(() => {
    fetchstudentData();
    fetchNotices();
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const togglePersonalInfoExpansion = () => {
    setExpandedPersonalInfo(prev => !prev);
  };

  // Inject custom calendar styles
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = customCalendarStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Responsive container styles
  const containerStyles = {
    width: '100%',
    maxWidth: isLarge ? '1200px' : '100%',
    margin: '0 auto',
    padding: isMobile ? '1rem' : isTablet ? '1.5rem' : '2rem',
    minHeight: '100vh',
  };

  // Responsive header styles
  const headerStyles = {
    textAlign: 'center',
    marginBottom: isMobile ? '1rem' : '2rem',
    background: 'linear-gradient(135deg, rgba(255, 112, 67, 0.1) 0%, rgba(255, 87, 34, 0.05) 100%)',
    borderRadius: isMobile ? '12px' : '20px',
    padding: isMobile ? '1rem' : '2rem',
    border: '1px solid rgba(255, 112, 67, 0.2)',
    backdropFilter: 'blur(10px)',
  };

  // Responsive main grid styles
  const mainGridStyles = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr' : '1.75fr 2fr',
    gap: isMobile ? '1rem' : '2rem',
    alignItems: 'start',
    marginBottom: isMobile ? '1rem' : '2rem',
  };

  // Responsive bottom grid styles
  const bottomGridStyles = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    gap: isMobile ? '1rem' : '2rem',
  };

  // Responsive profile image styles
  const profileImageStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    order: isMobile ? -1 : 0, // Show image first on mobile
    marginBottom: isMobile ? '1rem' : 0,
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div style={{
        position: 'relative',
        minHeight: '100vh',
        background: '#0a0a0a',
      }}>
        {/* Animated background elements - hide on mobile for performance */}
        {!isMobile && (
          <>
            <div style={{
              position: 'absolute',
              top: '10%',
              left: '10%',
              width: isTablet ? '150px' : '200px',
              height: isTablet ? '150px' : '200px',
              background: 'radial-gradient(circle, rgba(255, 112, 67, 0.1) 0%, transparent 70%)',
              borderRadius: '50%',
              animation: 'float 6s ease-in-out infinite',
              zIndex: 0,
            }} />
            <div style={{
              position: 'absolute',
              top: '60%',
              right: '10%',
              width: isTablet ? '100px' : '150px',
              height: isTablet ? '100px' : '150px',
              background: 'radial-gradient(circle, rgba(255, 87, 34, 0.08) 0%, transparent 70%)',
              borderRadius: '50%',
              animation: 'float 8s ease-in-out infinite reverse',
              zIndex: 0,
            }} />
          </>
        )}

        <div style={{...containerStyles, position: 'relative', zIndex: 10}}>
          {/* Header */}
          <div style={headerStyles}>
            <Typography 
              variant={isMobile ? "h4" : isTablet ? "h3" : "h3"} 
              style={{
                color: '#ffab91',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
                textShadow: '0 4px 8px rgba(255, 112, 67, 0.3)',
                fontSize: isMobile ? '1.5rem' : undefined,
              }}
            >
              Welcome back
              <span style={{
                background: 'linear-gradient(45deg, #ff7043, #ffc107)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
                paddingLeft: '10px',
                textShadow: '0 4px 8px rgba(255, 112, 67, 0.3)',
              }}>
                {studentData.name || 'Student'}
              </span>
            </Typography>
            <Typography 
              variant={isMobile ? "body1" : "h6"} 
              style={{ 
                color: '#ffab91',
                fontSize: isMobile ? '1rem' : undefined,
              }}
            >
              Student Dashboard
            </Typography>
          </div>

          {/* Profile and Data Section */}
          <div style={mainGridStyles}>
            {/* Student Details Table */}
            <TableContainer 
              component={Paper} 
              style={{ 
                borderRadius: isMobile ? '12px' : '20px', 
                overflow: 'hidden',
                order: 1,
              }}
            >
              {/* Personal Information Header with Expand/Collapse Button */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: isMobile ? '1rem' : '1.5rem',
                background: 'linear-gradient(135deg, rgba(255, 112, 67, 0.1) 0%, rgba(255, 87, 34, 0.05) 100%)',
                borderBottom: '1px solid rgba(255, 112, 67, 0.2)',
                cursor: 'pointer',
              }}
                onClick={togglePersonalInfoExpansion}
              >
                <Typography 
                  variant={isMobile ? "h6" : "h5"} 
                  style={{
                    color: '#ff7043',
                    fontWeight: 'bold',
                    fontSize: isMobile ? '1.1rem' : undefined,
                  }}
                >
                  Personal Information
                </Typography>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePersonalInfoExpansion();
                  }}
                  style={{
                    background: 'rgba(255, 112, 67, 0.1)',
                    borderRadius: '50%',
                    transition: 'all 0.3s ease',
                    transform: expandedPersonalInfo ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                >
                  <ExpandMore />
                </IconButton>
              </div>

              {/* Basic Information (Always Visible) */}
              <Table aria-label="student table">
                <TableBody>
                  {[
                    { label: 'Name', value: studentData.name },
                    { label: 'Age', value: studentData.age },
                    { label: 'Gender', value: studentData.gender },
                    { label: 'Class', value: studentData.studentClass?.classText },
                    { label: 'Parent Name', value: studentData.parent },
                    { label: 'Contact No', value: studentData.parentNum },
                  ].map((row, index) => (
                    <TableRow key={row.label} style={{
                      background: index % 2 === 0 ? 'rgba(255, 112, 67, 0.02)' : 'transparent',
                      transition: 'background-color 0.3s ease',
                    }}>
                      <TableCell style={{
                        fontWeight: 600,
                        color: '#ffab91',
                        fontSize: isMobile ? '14px' : '16px',
                        padding: isMobile ? '8px 4px' : undefined,
                      }}>
                        {row.label}
                      </TableCell>
                      <TableCell align="center" style={{
                        fontSize: isMobile ? '14px' : '16px',
                        color: '#ffffff',
                        padding: isMobile ? '8px 4px' : undefined,
                        wordBreak: 'break-word',
                      }}>
                        {row.value}
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Expandable Credentials Section */}
                  <TableRow>
                    <TableCell colSpan={2} style={{ padding: 0, border: 'none' }}>
                      <Collapse in={expandedPersonalInfo} timeout="auto" unmountOnExit>
                        <Table>
                          <TableBody>
                            {/* Email Row */}
                            <TableRow style={{ background: 'rgba(255, 112, 67, 0.02)' }}>
                              <TableCell style={{
                                fontWeight: 600,
                                color: '#ffab91',
                                fontSize: isMobile ? '14px' : '16px',
                                padding: isMobile ? '8px 4px' : undefined,
                              }}>
                                Email
                              </TableCell>
                              <TableCell align="center" style={{
                                fontSize: isMobile ? '14px' : '16px',
                                color: '#ffffff',
                                padding: isMobile ? '8px 4px' : undefined,
                                wordBreak: 'break-all',
                              }}>
                                {studentData.email}
                              </TableCell>
                            </TableRow>

                            {/* Password Row */}
                            <TableRow>
                              <TableCell style={{
                                fontWeight: 600,
                                color: '#ffab91',
                                fontSize: isMobile ? '14px' : '16px',
                                borderBottom: '2px solid rgba(255, 193, 7, 0.3)',
                                padding: isMobile ? '8px 4px' : undefined,
                              }}>
                                Password
                              </TableCell>
                              <TableCell align="center" style={{
                                borderBottom: '2px solid rgba(255, 193, 7, 0.3)',
                                padding: isMobile ? '8px 4px' : undefined,
                              }}>
                                <Box display="flex" justifyContent="center" alignItems="center" flexWrap="wrap">
                                  <span style={{
                                    marginRight: isMobile ? 4 : 8,
                                    fontSize: isMobile ? '14px' : '16px',
                                    color: '#ffffff',
                                    fontFamily: 'monospace',
                                    padding: isMobile ? '2px 4px' : '4px 8px',
                                    background: 'rgba(255, 193, 7, 0.1)',
                                    borderRadius: '6px',
                                    border: '1px solid rgba(255, 193, 7, 0.3)',
                                    marginBottom: isMobile ? '4px' : 0,
                                  }}>
                                    {showPassword ? studentData.password : '••••••••'}
                                  </span>
                                  <IconButton
                                    onClick={togglePasswordVisibility}
                                    style={{
                                      background: 'rgba(255, 193, 7, 0.2)',
                                      borderRadius: '50%',
                                      color: '#ffc107',
                                      padding: isMobile ? '4px' : '8px',
                                    }}
                                    size={isMobile ? "small" : "medium"}
                                  >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                  </IconButton>
                                </Box>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {/* Profile Image */}
            <div style={profileImageStyles}>
              <div style={{
                position: 'relative',
                padding: '3px',
                background: 'linear-gradient(45deg, #ff7043, #ff5722)',
                borderRadius: isMobile ? '8px' : '15px',
                boxShadow: '0 12px 40px rgba(255, 112, 67, 0.3)',
                width: isMobile ? '200px' : isTablet ? '280px' : '100%',
                maxWidth: isMobile ? '200px' : isTablet ? '300px' : '450px',
                height: 'fit-content',
                justifyContent:"center",
              }}>
                <img
                  src={studentData.studentImg}
                  alt="student"
                  style={{
                    width: '100%',
                    height: isMobile ? '200px' : isTablet ? '280px' : '450px',
                    borderRadius: isMobile ? '5px' : '14px',
                    objectFit: 'cover',
                    border: '4px solid rgba(255, 255, 255, 0.1)',
                    transition: 'transform 0.3s ease',
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'scale(1.04)'}
                  onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                />
              </div>
            </div>
          </div>

          {/* Calendar and Notices Container */}
          <div style={bottomGridStyles}>
            {/* Calendar Section */}
            <Box 
              component={Paper} 
              style={{ 
                padding: isMobile ? '1rem' : '1.5rem', 
                borderRadius: isMobile ? '12px' : '20px',
              }}
            >
              <Typography 
                variant={isMobile ? "h6" : "h5"} 
                style={{
                  color: '#ff7043',
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                  textAlign: 'center',
                  fontSize: isMobile ? '1.1rem' : undefined,
                }}
              >
                Calendar
              </Typography>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center',
                overflow: 'hidden',
              }}>
                <Calendar
                  onChange={setSelectedDate}
                  value={selectedDate}
                />
              </div>
            </Box>

            {/* Notices Section */}
            <Box 
              component={Paper} 
              style={{ 
                padding: isMobile ? '1rem' : '1.5rem', 
                borderRadius: isMobile ? '12px' : '20px',
              }}
            >
              <Typography 
                variant={isMobile ? "h6" : "h5"} 
                style={{
                  color: '#ff7043',
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                  textAlign: 'center',
                  fontSize: isMobile ? '1.1rem' : undefined,
                }}
              >
                Latest Notices
              </Typography>
              {Array.isArray(notices) && notices.length > 0 ? (
                <div style={{ 
                  maxHeight: isMobile ? '250px' : '300px', 
                  overflowY: 'auto',
                  paddingRight: isMobile ? '4px' : '8px',
                }}>
                  {notices.map((notice, index) => (
                    <div key={notice._id} style={{
                      background: index % 2 === 0 ? 'rgba(255, 112, 67, 0.05)' : 'rgba(255, 193, 7, 0.05)',
                      padding: isMobile ? '0.75rem' : '1rem',
                      borderRadius: '12px',
                      marginBottom: '1rem',
                      border: '1px solid rgba(255, 112, 67, 0.1)',
                      transition: 'transform 0.2s ease',
                    }}
                      onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <Typography 
                        variant={isMobile ? "subtitle1" : "h6"} 
                        style={{
                          color: '#ff7043',
                          fontWeight: 'bold',
                          marginBottom: '0.5rem',
                          fontSize: isMobile ? '1rem' : undefined,
                        }}
                      >
                        {notice.title}
                      </Typography>
                      <Typography style={{
                        color: '#ffffff',
                        marginBottom: '0.5rem',
                        lineHeight: 1.5,
                        fontSize: isMobile ? '14px' : '16px',
                      }}>
                        {notice.message}
                      </Typography>
                      <Typography style={{
                        color: '#ffab91',
                        fontSize: isMobile ? '11px' : '12px',
                        fontStyle: 'italic',
                      }}>
                        {new Date(notice.createdAt).toDateString()}
                      </Typography>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: isMobile ? '1.5rem' : '2rem',
                  color: '#ffab91',
                  fontStyle: 'italic',
                  fontSize: isMobile ? '14px' : '16px',
                }}>
                  No notices available.
                </div>
              )}
            </Box>
          </div>
        </div>

        {/* Add floating animation keyframes */}
        <style>
          {`
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-20px); }
            }
            
            /* Custom scrollbar for notices */
            ::-webkit-scrollbar {
              width: 6px;
            }
            
            ::-webkit-scrollbar-track {
              background: rgba(255, 112, 67, 0.1);
              border-radius: 3px;
            }
            
            ::-webkit-scrollbar-thumb {
              background: rgba(255, 112, 67, 0.5);
              border-radius: 3px;
            }
            
            ::-webkit-scrollbar-thumb:hover {
              background: rgba(255, 112, 67, 0.7);
            }
          `}
        </style>
      </div>
    </ThemeProvider>
  );
}