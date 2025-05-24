import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { baseApi } from '../../../environment';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  Card,
  CardContent,
  Fade,
  Zoom,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { 
  TrendingUp, 
  TrendingDown, 
  CalendarToday, 
  School,
  CheckCircle,
  Cancel,
  BarChart
} from '@mui/icons-material';
import moment from 'moment';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const modernTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FF8C00', // Dark Orange
      light: '#FFA500',
      dark: '#FF7F00',
    },
    secondary: {
      main: '#FF6347', // Tomato (yellowish-red)
      light: '#FF7F50',
      dark: '#FF4500',
    },
    success: {
      main: '#4CAF50', // Green
      light: '#FFED4E',
      dark: '#FFC107',
    },
    error: {
      main: '#FF4500', // Orange Red
      light: '#FF6347',
      dark: '#DC143C',
    },
    warning: {
      main: '#FFA500', // Orange
      light: '#FFB347',
      dark: '#FF8C00',
    },
    background: {
      default: 'transparent',
      paper: '#1A1A1A',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
    },
    divider: '#333333',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: '2.25rem',
      color: '#FFFFFF',
      letterSpacing: '-0.025em',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
      color: '#FFFFFF',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.25rem',
      color: '#E0E0E0',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          border: '1px solid #333333',
          backgroundColor: '#1A1A1A',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(255, 140, 0, 0.1)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 10px 15px rgba(0, 0, 0, 0.4), 0 4px 6px rgba(255, 140, 0, 0.2)',
            borderColor: '#FF8C00',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          border: '1px solid #333333',
          backgroundColor: '#1A1A1A',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(255, 140, 0, 0.1)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 20px rgba(0, 0, 0, 0.4), 0 4px 8px rgba(255, 140, 0, 0.2)',
            borderColor: '#FF8C00',
          },
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          border: '1px solid #333333',
          backgroundColor: '#1A1A1A',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#2A2A2A',
          '& .MuiTableCell-head': {
            backgroundColor: '#2A2A2A',
            borderBottom: '2px solid #FF8C00',
            color: '#FFFFFF',
            fontWeight: 600,
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'all 0.15s ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(255, 140, 0, 0.1)',
          },
          '&:last-child td': {
            borderBottom: 0,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 500,
          fontSize: '0.875rem',
        },
      },
    },
  },
});

// Enhanced colors for charts
const CHART_COLORS = ['#4CAF50', '#FF4500', '#FFA500', '#FF6347']; // Gold, OrangeRed, Orange, Tomato

const AttendanceDetails = () => {
  const { id: studentId } = useParams();
  const [attendanceData, setAttendanceData] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const fetchAttendanceData = async (studentId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${baseApi}/attendance/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log("Response data:", response.data);
      setAttendanceData(response.data.attendance || []);
      
      if (response.data.student) {
        setStudentInfo(response.data.student);
      }
      
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch attendance data");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchAttendanceData(studentId);
    }
  }, [studentId]);

  const calculateStats = () => {
    if (!attendanceData || attendanceData.length === 0) return { presentPercentage: 0, totalClasses: 0, presentCount: 0 };
    
    const totalClasses = attendanceData.length;
    const presentCount = attendanceData.filter(record => record.status === "Present").length;
    const presentPercentage = (presentCount / totalClasses) * 100;
    
    return {
      presentPercentage,
      totalClasses,
      presentCount
    };
  };
  
  const stats = calculateStats();

  const chartData = [
    { name: 'Present', value: stats.presentCount, color: CHART_COLORS[0] },
    { name: 'Absent', value: stats.totalClasses - stats.presentCount, color: CHART_COLORS[1] },
  ];

  // Monthly attendance data for bar chart
  const getMonthlyData = () => {
    const monthlyStats = {};
    attendanceData.forEach(record => {
      const month = moment(record.date).format('MMM YYYY');
      if (!monthlyStats[month]) {
        monthlyStats[month] = { month, present: 0, absent: 0 };
      }
      if (record.status === 'Present') {
        monthlyStats[month].present++;
      } else {
        monthlyStats[month].absent++;
      }
    });
    return Object.values(monthlyStats);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Paper 
          sx={{ 
            p: 2, 
            border: '1px solid #333333',
            backgroundColor: '#1A1A1A',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
          }}
        >
          <Typography variant="body2" fontWeight={600}>
            {`${payload[0].name}: ${payload[0].value} (${((payload[0].value / stats.totalClasses) * 100).toFixed(1)}%)`}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Zoom in={!loading} timeout={500}>
      <Card 
        sx={{ 
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: color,
            borderRadius: '16px 16px 0 0',
          }
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ color, fontWeight: 700, mb: 0.5 }}>
                {value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="caption" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
            <Box sx={{ 
              p: 2, 
              borderRadius: '12px', 
              backgroundColor: `rgba(255, 140, 0, 0.15)`,
              color: color
            }}>
              {icon}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Zoom>
  );

  return (
    <ThemeProvider theme={modernTheme}>
      <Box 
        sx={{ 
          minHeight: '100vh',
          backgroundColor: 'transparent',
          px: { xs: 2, md: 4 },
          pb: 6
        }}
      >
        <Fade in timeout={800}>
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                textAlign: 'center', 
                mb: 6,
                color: '#FFFFFF',
                fontWeight: 700
              }}
            >
              Student Attendance Dashboard
            </Typography>

            {error && (
              <Fade in timeout={500}>
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 4, 
                    borderRadius: '16px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                  }}
                >
                  {error}
                </Alert>
              </Fade>
            )}

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
                <CircularProgress size={60} thickness={4} />
              </Box>
            ) : (
              <>
                {studentInfo && (
                  <Fade in timeout={1000}>
                    <Paper sx={{ p: 4, mb: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <School sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
                        <Box>
                          <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
                            {studentInfo.name}
                          </Typography>
                          <Typography variant="body1" color="text.secondary">
                            {studentInfo.studentClass?.classText || "No Class Assigned"}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Fade>
                )}

                {/* Statistics Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                      title="Total Classes"
                      value={stats.totalClasses}
                      icon={<CalendarToday fontSize="large" />}
                      color={theme.palette.primary.main}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                      title="Present"
                      value={stats.presentCount}
                      icon={<CheckCircle fontSize="large" />}
                      color={theme.palette.success.main}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                      title="Absent"
                      value={stats.totalClasses - stats.presentCount}
                      icon={<Cancel fontSize="large" />}
                      color={theme.palette.error.main}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                      title="Attendance Rate"
                      value={`${stats.presentPercentage.toFixed(1)}%`}
                      icon={stats.presentPercentage >= 75 ? <TrendingUp fontSize="large" /> : <TrendingDown fontSize="large" />}
                      color={stats.presentPercentage >= 75 ? theme.palette.success.main : theme.palette.error.main}
                      subtitle={stats.presentPercentage >= 75 ? "Excellent!" : "Needs Improvement"}
                    />
                  </Grid>
                </Grid>

                {/* Charts Section */}
                {attendanceData && attendanceData.length > 0 && (
                  <Grid container spacing={4} sx={{ mb: 4 }}>
                    <Grid item xs={12} lg={6}>
                      <Zoom in timeout={800}>
                        <Card sx={{ height: 400 }}>
                          <CardContent sx={{ p: 3, height: '100%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <BarChart sx={{ mr: 1, color: 'primary.main' }} />
                              <Typography variant="h6">
                                Attendance Overview
                              </Typography>
                            </Box>
                            <ResponsiveContainer width="100%" height="85%">
                              <PieChart>
                                <Pie
                                  data={chartData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                  outerRadius={100}
                                  fill="#8884d8"
                                  dataKey="value"
                                  strokeWidth={2}
                                  stroke="rgba(99, 102, 241, 0.3)"
                                >
                                  {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                              </PieChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      </Zoom>
                    </Grid>
                    
                    <Grid item xs={12} lg={6}>
                      <Zoom in timeout={1000}>
                        <Card sx={{ height: 400 }}>
                          <CardContent sx={{ p: 3, height: '100%' }}>
                            <Typography variant="h6" gutterBottom>
                              Monthly Attendance Trend
                            </Typography>
                            <ResponsiveContainer width="100%" height="85%">
                              <RechartsBarChart data={getMonthlyData()}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                                <XAxis 
                                  dataKey="month" 
                                  stroke="#B0B0B0"
                                  fontSize={12}
                                />
                                <YAxis stroke="#B0B0B0" fontSize={12} />
                                <Tooltip 
                                  contentStyle={{
                                    backgroundColor: '#1A1A1A',
                                    border: '1px solid #333333',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                                    color: '#FFFFFF'
                                  }}
                                />
                                <Bar dataKey="present" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
                                <Bar dataKey="absent" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
                              </RechartsBarChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      </Zoom>
                    </Grid>
                  </Grid>
                )}

                {/* Attendance Table */}
                {attendanceData && attendanceData.length > 0 ? (
                  <Fade in timeout={1200}>
                    <TableContainer component={Paper}>
                      <Table aria-label="attendance records table">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>Date</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700, fontSize: '1rem' }}>Status</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700, fontSize: '1rem' }}>Class</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {attendanceData.map((record, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <CalendarToday sx={{ mr: 1, color: 'text.secondary', fontSize: 16 }} />
                                  <Typography variant="body2" fontWeight={500}>
                                    {moment(record.date).format('MMMM DD, YYYY')}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell align="center">
                                <Chip 
                                  label={record.status}
                                  color={record.status === 'Present' ? 'success' : 'error'}
                                  size="small"
                                  icon={record.status === 'Present' ? <CheckCircle /> : <Cancel />}
                                  sx={{ 
                                    fontWeight: 600,
                                    minWidth: '100px'
                                  }}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2" fontWeight={500}>
                                  {record.class?.classText || 'N/A'}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Fade>
                ) : (
                  <Fade in timeout={1000}>
                    <Paper 
                      sx={{ 
                        p: 6, 
                        textAlign: 'center',
                        backgroundColor: '#1A1A1A',
                        border: '1px solid #333333'
                      }}
                    >
                      <School sx={{ fontSize: 64, color: '#FF8C00', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        No attendance records found for this student.
                      </Typography>
                    </Paper>
                  </Fade>
                )}
              </>
            )}
          </Box>
        </Fade>
      </Box>
    </ThemeProvider>
  );
};

export default AttendanceDetails;