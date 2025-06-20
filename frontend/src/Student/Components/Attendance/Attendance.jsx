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
  useTheme,
  Container,
  Avatar,
  LinearProgress,
  Divider,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  TrendingUp,
  TrendingDown,
  CalendarToday,
  School,
  CheckCircle,
  Cancel,
  BarChart,
  Person,
  Analytics,
  Timeline,
  Assignment,
  StarBorder,
  Warning,
  Info
} from '@mui/icons-material';
import moment from 'moment';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, Area, AreaChart } from 'recharts';

const modernTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FF8C00',
      light: '#FFA500',
      dark: '#FF7F00',
    },
    secondary: {
      main: '#FF6347',
      light: '#FF7F50',
      dark: '#FF4500',
    },
    success: {
      main: '#00E676',
      light: '#4CAF50',
      dark: '#00C853',
    },
    error: {
      main: '#FF1744',
      light: '#FF5722',
      dark: '#D50000',
    },
    warning: {
      main: '#FFD600',
      light: '#FFEB3B',
      dark: '#FFC107',
    },
    info: {
      main: '#00B0FF',
      light: '#03A9F4',
      dark: '#0091EA',
    },
    background: {
      default: 'transparent',
      paper: 'rgba(26, 26, 26, 0.95)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0BEC5',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 800,
      fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
      background: 'linear-gradient(135deg, #FF8C00, #FFD700)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      letterSpacing: '-0.05em',
    },
    h4: {
      fontWeight: 700,
      fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
      color: '#FFFFFF',
      letterSpacing: '-0.025em',
    },
    h5: {
      fontWeight: 600,
      fontSize: { xs: '1.25rem', sm: '1.375rem', md: '1.5rem' },
      color: '#FFFFFF',
    },
    h6: {
      fontWeight: 600,
      fontSize: { xs: '1.125rem', sm: '1.25rem' },
      color: '#E0E0E0',
    },
    body1: {
      fontSize: { xs: '0.875rem', sm: '1rem' },
    },
    body2: {
      fontSize: { xs: '0.75rem', sm: '0.875rem' },
    }
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: { xs: 16, sm: 24, md: 32 },
          paddingRight: { xs: 16, sm: 24, md: 32 },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '15px',
          border: '1px solid rgba(255, 140, 0, 0.2)',
          backgroundColor: 'rgba(26, 26, 26, 0.95)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 140, 0, 0.1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 140, 0, 0.3)',
            borderColor: 'rgba(255, 140, 0, 0.4)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '24px',
          border: '1px solid rgba(255, 140, 0, 0.15)',
          backgroundColor: 'rgba(26, 26, 26, 0.8)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(255, 140, 0, 0.05) 0%, rgba(255, 99, 71, 0.05) 100%)',
            opacity: 0,
            transition: 'opacity 0.3s ease',
          },
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 140, 0, 0.3)',
            borderColor: 'rgba(255, 140, 0, 0.4)',
            '&::before': {
              opacity: 1,
            },
          },
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          border: '1px solid rgba(255, 140, 0, 0.2)',
          backgroundColor: 'rgba(26, 26, 26, 0.95)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #FF8C00, #FF6347)',
          '& .MuiTableCell-head': {
            backgroundColor: 'transparent',
            borderBottom: 'none',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: { xs: '0.875rem', sm: '1rem' },
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: { xs: '12px 8px', sm: '16px 16px' },
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(255, 140, 0, 0.08)',
            transform: 'scale(1.01)',
          },
          '&:last-child td': {
            borderBottom: 0,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: { xs: '12px 8px', sm: '16px 16px' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          fontWeight: 600,
          fontSize: { xs: '0.75rem', sm: '0.875rem' },
          height: { xs: '28px', sm: '32px' },
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.3)',
          },
        },
      },
    },
  },
});

const CHART_COLORS = ['#00E676', '#FF1744', '#FFD600', '#00B0FF'];

const AttendanceDetails = () => {
  const { id: studentId } = useParams();
  const [attendanceData, setAttendanceData] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const fetchAttendanceData = async (studentId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.get(`${baseApi}/attendance/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

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

  const getWeeklyTrend = () => {
    const weeklyStats = {};
    attendanceData.forEach(record => {
      const week = moment(record.date).format('WW-YYYY');
      const weekLabel = `Week ${moment(record.date).format('WW')}`;
      if (!weeklyStats[week]) {
        weeklyStats[week] = { week: weekLabel, attendance: 0, total: 0 };
      }
      weeklyStats[week].total++;
      if (record.status === 'Present') {
        weeklyStats[week].attendance++;
      }
    });
    return Object.values(weeklyStats).map(item => ({
      ...item,
      percentage: (item.attendance / item.total) * 100
    }));
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Paper
          sx={{
            p: 2,
            border: '1px solid rgba(255, 140, 0, 0.3)',
            backgroundColor: 'rgba(26, 26, 26, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
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

  const StatCard = ({ title, value, icon, color, subtitle, trend, progress }) => (
    <Zoom in={!loading} timeout={500}>
      <Card
        sx={{
          height: {xs:'200px', lg:'250px'},
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '12px',
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant={isMobile ? "h5" : "h4"}
                  sx={{
                    color,
                    fontWeight: 800,
                    mb: 0.5,
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' }
                  }}
                >
                  {value}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {title}
                </Typography>
                {subtitle && (
                  <Chip
                    label={subtitle}
                    size="small"
                    sx={{
                      backgroundColor: `${color}20`,
                      color: color,
                      borderRadius: '3px',
                      border: `1px solid ${color}40`,
                      fontSize: '0.75rem',
                      height: '24px'
                    }}
                  />
                )}
              </Box>
              <Box sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: '10px',
                background: `linear-gradient(135deg, ${color}20, ${color}10)`,
                border: `1px solid ${color}30`,
                color: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: { xs: 0, sm: 2, md: 3 }
              }}>
                {React.cloneElement(icon, {
                  fontSize: isMobile ? 'medium' : 'medium',
                  sx: { filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }
                })}
              </Box>
            </Box>

            {progress !== undefined && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Progress
                  </Typography>
                  <Typography variant="caption" color={color} fontWeight={600}>
                    {progress}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 3,
                      background: `linear-gradient(90deg, ${color}, ${color}CC)`,
                    },
                  }}
                />
              </Box>
            )}

            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {trend > 0 ? (
                  <TrendingUp sx={{ color: theme.palette.success.main, mr: 0.5, fontSize: '1rem' }} />
                ) : (
                  <TrendingDown sx={{ color: theme.palette.error.main, mr: 0.5, fontSize: '1rem' }} />
                )}
                <Typography variant="caption" color="text.secondary">
                  {Math.abs(trend)}% from last month
                </Typography>
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Zoom>
  );

  const getAttendanceStatus = (percentage) => {
    if (percentage >= 90) return { status: 'Excellent', color: theme.palette.success.main, icon: <StarBorder /> };
    if (percentage >= 75) return { status: 'Good', color: theme.palette.info.main, icon: <CheckCircle /> };
    if (percentage >= 60) return { status: 'Average', color: theme.palette.warning.main, icon: <Warning /> };
    return { status: 'Poor', color: theme.palette.error.main, icon: <Cancel /> };
  };

  const attendanceStatus = getAttendanceStatus(stats.presentPercentage);

  return (
    <ThemeProvider theme={modernTheme}>
      <Box
        sx={{
          minHeight: '100vh',
          background: 'transparent',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 20%, rgba(255, 140, 0, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 99, 71, 0.1) 0%, transparent 50%)',
            pointerEvents: 'none',
            zIndex: -1,
          }
        }}
      >
        <Container maxWidth="xl" sx={{ py: { xs: 3, sm: 4, md: 3 } }}>
          <Fade in timeout={800}>
            <Box>
              {/* Header Section */}
              <Box sx={{ textAlign: 'center', mb: { xs: 2, sm: 4, md: 6 } }}>
                <Typography
                  variant="h3"
                  sx={{
                    mb: 2,
                    background: 'linear-gradient(135deg, #ff7c17, #f76d42, #ff7c17)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 800,
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
                    letterSpacing: '-0.02em',
                  }}
                >
                  My Attendance Dashboard
                </Typography>
              </Box>

              {error && (
                <Fade in timeout={500}>
                  <Alert
                    severity="error"
                    sx={{
                      mb: 4,
                      borderRadius: '16px',
                      background: 'rgba(255, 23, 68, 0.1)',
                      border: '1px solid rgba(255, 23, 68, 0.3)',
                      backdropFilter: 'blur(20px)',
                      '& .MuiAlert-icon': {
                        color: theme.palette.error.main
                      }
                    }}
                  >
                    {error}
                  </Alert>
                </Fade>
              )}

              {loading ? (
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  my: { xs: 6, sm: 8, md: 12 }
                }}>
                  <CircularProgress
                    size={80}
                    thickness={3}
                    sx={{
                      color: theme.palette.primary.main,
                      filter: 'drop-shadow(0 4px 8px rgba(255, 140, 0, 0.3))'
                    }}
                  />
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 3 }}>
                    Loading attendance data...
                  </Typography>
                </Box>
              ) : (
                <>
                  {/* Student Info Card */}
                  {studentInfo && (
                    <Fade in timeout={1000}>
                      <Paper  sx={{ p: { xs: 3, sm: 4 }, mb: 4,}}>
                        <Grid container spacing={3} alignItems="center">
                          <Grid item xs={12} sm="auto">
                            <Avatar
                              sx={{
                                width: { xs: 90, sm: 150 },
                                height: { xs: 90, sm: 150 },
                                fontSize: { xs: '2rem', sm: '2.5rem' },
                                fontWeight: 700,
                                border: "2px solid rgba(255, 140, 0, 0.7)",
                                mx: { xs: 'auto', sm: 0 },
                                mb: { xs: 2, sm: 0 }
                              }}
                            >
                              <img src={studentInfo.studentImg} alt={studentInfo.name} />
                            </Avatar>
                          </Grid>
                          <Grid item xs={12} sm>
                            <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                              <Typography
                                variant="h4"
                                fontWeight={700}
                                sx={{
                                  mb: 1,
                                  fontSize: { xs: '1.5rem', sm: '2rem' }
                                }}
                              >
                                {studentInfo.name}
                              </Typography>
                              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                                {studentInfo.studentClass?.classText || "No Class Assigned"}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Fade>
                  )}

                  {/* Statistics Cards */}
                  <Grid className="flex justify-evenly flex-col lg:flex-row gap-5 lg:fap-0" spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} lg={3}>
                      <StatCard
                        title="Total Classes"
                        value={stats.totalClasses}
                        icon={<CalendarToday />}
                        color={theme.palette.primary.main}
                        subtitle="This Semester"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3}>
                      <StatCard
                        title="Classes Attended"
                        value={stats.presentCount}
                        icon={<CheckCircle />}
                        color={theme.palette.success.main}
                        subtitle="Present"
                        progress={parseFloat(stats.presentPercentage).toFixed(2)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3}>
                      <StatCard
                        title="Classes Missed"
                        value={stats.totalClasses - stats.presentCount}
                        icon={<Cancel />}
                        color={theme.palette.error.main}
                        subtitle="Absent"
                        progress={parseFloat((((stats.totalClasses - stats.presentCount) / stats.totalClasses) * 100).toFixed(2))}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3}>
                      <StatCard
                        title="Attendance Rate"
                        value={`${stats.presentPercentage.toFixed(1)}%`}
                        icon={stats.presentPercentage >= 75 ? <TrendingUp /> : <TrendingDown />}
                        color={attendanceStatus.color}
                        subtitle={attendanceStatus.status}
                        trend={stats.presentPercentage >= 75 ? 5 : -3}
                        progress={parseFloat(stats.presentPercentage).toFixed(2)}
                      />
                    </Grid>
                  </Grid>

                  {/* Charts Section */}
                  {attendanceData && attendanceData.length > 0 && (
                    <Grid className="flex flex-col gap-5 lg:flex-row items-center-safe justify-center lg:justify-evenly" spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ mb: 4 }}>
                      {/* Pie Chart */}
                      <Grid item xs={12} lg={4}>
                        <Zoom in timeout={800}>
                          <Card sx={{ height: { xs: 350, sm: 400 }, width: { xs: "300px", lg: "400px" } }}>
                            <CardContent sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Analytics sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
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
                                    outerRadius={isMobile ? 80 : 100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    strokeWidth={3}
                                    stroke="rgba(255, 255, 255, 0.1)"
                                  >
                                    {chartData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                  </Pie>
                                  <RechartsTooltip content={<CustomTooltip />} />
                                  <Legend />
                                </PieChart>
                              </ResponsiveContainer>
                            </CardContent>
                          </Card>
                        </Zoom>
                      </Grid>

                      {/* Bar Chart */}
                      <Grid item xs={12} lg={4}>
                        <Zoom in timeout={1000}>
                          <Card sx={{ height: { xs: 350, sm: 400 }, width: { xs: "300px", lg: "400px" } }}>
                            <CardContent sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <BarChart sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                                  Monthly Trend
                                </Typography>
                              </Box>
                              <ResponsiveContainer width="100%" height="85%">
                                <RechartsBarChart data={getMonthlyData()}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                  <XAxis
                                    dataKey="month"
                                    stroke="#B0BEC5"
                                    fontSize={isMobile ? 10 : 12}
                                    tick={{ fill: '#B0BEC5' }} />
                                  <YAxis
                                    stroke="#B0BEC5"
                                    fontSize={isMobile ? 10 : 12}
                                    tick={{ fill: '#B0BEC5' }}
                                  />
                                  <RechartsTooltip content={<CustomTooltip />} />
                                  <Bar dataKey="present" fill={CHART_COLORS[0]} radius={[2, 2, 0, 0]} />
                                  <Bar dataKey="absent" fill={CHART_COLORS[1]} radius={[2, 2, 0, 0]} />
                                </RechartsBarChart>
                              </ResponsiveContainer>
                            </CardContent>
                          </Card>
                        </Zoom>
                      </Grid>

                      {/* Line Chart */}
                      <Grid item xs={12} lg={4}>
                        <Zoom in timeout={1200}>
                          <Card sx={{ height: { xs: 350, sm: 400 }, width: { xs: "300px", lg: "400px" } }}>
                            <CardContent sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Timeline sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                                  Weekly Attendance
                                </Typography>
                              </Box>
                              <ResponsiveContainer width="100%" height="85%">
                                <AreaChart data={getWeeklyTrend()}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                  <XAxis
                                    dataKey="week"
                                    stroke="#B0BEC5"
                                    fontSize={isMobile ? 10 : 12}
                                    tick={{ fill: '#B0BEC5' }}
                                  />
                                  <YAxis
                                    stroke="#B0BEC5"
                                    fontSize={isMobile ? 10 : 12}
                                    tick={{ fill: '#B0BEC5' }}
                                  />
                                  <RechartsTooltip content={<CustomTooltip />} />
                                  <Area
                                    type="monotone"
                                    dataKey="percentage"
                                    stroke={CHART_COLORS[2]}
                                    fill={`${CHART_COLORS[2]}40`}
                                    strokeWidth={3}
                                    dot={{ fill: CHART_COLORS[2], strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 5, stroke: CHART_COLORS[2], strokeWidth: 2 }}
                                  />
                                </AreaChart>
                              </ResponsiveContainer>
                            </CardContent>
                          </Card>
                        </Zoom>
                      </Grid>
                    </Grid>
                  )}

                  {/* Attendance Table */}
                  {attendanceData && attendanceData.length > 0 && (
                    <Zoom in timeout={1400}>
                      <Paper
                        className='flex m-auto flex-col'
                        sx={{
                          overflow: 'hidden',
                          width: { lg: "70%" },
                          borderRadius: { xs: 2, sm: 3 },
                          boxShadow: { xs: 2, sm: 4 },
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.2)'
                        }}
                      >
                        {/* Header Section */}
                        <Box
                          sx={{
                            p: { xs: 2, sm: 3, md: 4 },
                            borderBottom: '1px solid rgba(0,0,0,0.08)',
                            background: 'linear-gradient(135deg, rgba(25,118,210,0.05) 0%, rgba(13,71,161,0.02) 100%)'
                          }}
                        >
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 1,
                            mb: 1.5
                          }}>
                            <Assignment
                              sx={{
                                mr: 1,
                                color: 'primary.main',
                                fontSize: { xs: '1.25rem', sm: '1.5rem' }
                              }}
                            />
                            <Typography
                              variant="h5"
                              component="h2"
                              sx={{
                                fontSize: { xs: '1.125rem', sm: '1.375rem', md: '1.5rem' },
                                fontWeight: 700,
                                color: 'text.primary',
                                letterSpacing: '-0.02em'
                              }}
                            >
                              Detailed Attendance Records
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'text.secondary',
                              fontSize: { xs: '0.875rem', sm: '1rem' },
                              lineHeight: 1.5
                            }}
                          >
                            Complete history of attendance with dates and status
                          </Typography>
                        </Box>

                        {/* Mobile Card Layout */}
                        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                          <Box sx={{
                            maxHeight: 500,
                            overflow: 'auto',
                            p: { xs: 1, sm: 2 }
                          }}>
                            {attendanceData
                              .sort((a, b) => new Date(b.date) - new Date(a.date))
                              .map((record, index) => (
                                <Fade in timeout={500 + index * 50} key={record._id}>
                                  <Card
                                    sx={{
                                      mb: 2,
                                      borderRadius: 2,
                                      border: '1px solid rgba(0,0,0,0.08)',
                                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                      transition: 'all 0.2s ease-in-out',
                                      '&:hover': {
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                                        transform: 'translateY(-2px)'
                                      }
                                    }}
                                  >
                                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                      <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        mb: 1.5
                                      }}>
                                        <Box sx={{ flex: 1 }}>
                                          <Typography
                                            variant="body2"
                                            sx={{
                                              color: 'text.secondary',
                                              fontSize: '0.75rem',
                                              fontWeight: 600,
                                              textTransform: 'uppercase',
                                              letterSpacing: '0.1em',
                                              mb: 0.5
                                            }}
                                          >
                                            Record #{index + 1}
                                          </Typography>
                                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <CalendarToday sx={{
                                              mr: 1,
                                              fontSize: '1rem',
                                              color: 'primary.main'
                                            }} />
                                            <Typography variant="h6" sx={{
                                              fontWeight: 600,
                                              fontSize: '1rem'
                                            }}>
                                              {moment(record.date).format('MMM DD, YYYY')}
                                            </Typography>
                                          </Box>
                                          <Typography
                                            variant="body2"
                                            sx={{
                                              color: 'text.secondary',
                                              fontWeight: 500
                                            }}
                                          >
                                            {moment(record.date).format('dddd')}
                                          </Typography>
                                        </Box>
                                        <Chip
                                          icon={record.status === "Present" ? <CheckCircle /> : <Cancel />}
                                          label={record.status}
                                          color={record.status === "Present" ? "success" : "error"}
                                          variant="filled"
                                          sx={{
                                            fontWeight: 700,
                                            fontSize: '0.75rem',
                                            height: 28,
                                            '& .MuiChip-icon': {
                                              fontSize: '0.875rem'
                                            }
                                          }}
                                        />
                                      </Box>
                                    </CardContent>
                                  </Card>
                                </Fade>
                              ))}
                          </Box>
                        </Box>

                        {/* Desktop Table Layout */}
                        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                          <TableContainer
                            sx={{
                              display: 'block',
                              maxHeight: 500,
                              overflowY: 'auto',
                              scrollbarWidth: 'none',
                              '&::-webkit-scrollbar': {
                                width: 6,
                                height: 6,
                              },
                              '&::-webkit-scrollbar-track': {
                                backgroundColor: 'rgba(0,0,0,0.05)',
                                borderRadius: 2,
                              },
                              '&::-webkit-scrollbar-thumb': {
                                backgroundColor: 'rgba(0,0,0,0.2)',
                                borderRadius: 2,
                                '&:hover': {
                                  backgroundColor: 'rgba(0,0,0,0.3)',
                                },
                              },
                            }}
                          >
                            <Table>
                              <TableHead>
                                <TableRow>
                                  <TableCell
                                    sx={{
                                      width:"50%",
                                      bgcolor: 'rgba(25,118,210,0.05)',
                                      borderBottom: '2px solid rgba(25,118,210,0.2)',
                                      fontWeight: 700,
                                      fontSize: '0.875rem',
                                      letterSpacing: '0.05em',
                                      position: 'sticky',
                                      top: 0,
                                      zIndex: 100,
                                      backdropFilter: 'blur(10px)',
                                      '&::after': {
                                        position: 'absolute',
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        height: '2px',
                                        background: 'rgb(255, 126, 25)',
                                      },
                                    }}
                                  >
                                    <Box className="ml-10 text-2xl capitalize">
                                      Date & Day
                                    </Box>
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      width:"50%",
                                      bgcolor: 'rgba(25,118,210,0.05)',
                                      borderBottom: '2px solid rgba(25,118,210,0.2)',
                                      fontWeight: 700,
                                      fontSize: '0.875rem',
                                      textAlign: 'center',
                                      letterSpacing: '0.05em',
                                      position: 'sticky',
                                      top: 0,
                                      zIndex: 100,
                                      backdropFilter: 'blur(10px)',
                                      '&::after': {
                                        position: 'absolute',
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        height: '2px',
                                        background: 'rgb(255, 126, 25)',
                                      },
                                    }}
                                  >
                                    <Box className="text-2xl capitalize">
                                      Status
                                    </Box>
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {attendanceData
                                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                                  .map((record, index) => (
                                    <Fade in timeout={500 + index * 50} key={record._id}>
                                      <TableRow
                                        sx={{
                                          '&:nth-of-type(odd)': { bgcolor: 'rgba(0,0,0,0.02)' },
                                          '&:hover': {
                                            bgcolor: 'rgba(25,118,210,0.08)',
                                            transform: 'scale(1.01)',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                          },
                                          transition: 'all 0.2s ease-in-out',
                                          cursor: 'pointer',
                                        }}
                                      >
                                        <TableCell>
                                          <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: "20px" }}>
                                            <CalendarToday sx={{ mr: 1.5, fontSize: '1.125rem', color: 'primary.main' }} />
                                            <Box>
                                              <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.9375rem', lineHeight: 1.2 }}>
                                                {moment(record.date).format('MMM DD, YYYY')}
                                              </Typography>
                                              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                                                {moment(record.date).format('ddd')}
                                              </Typography>
                                            </Box>
                                          </Box>
                                        </TableCell>
                                        <TableCell>
                                          <Box className="flex justify-center items-center">
                                            <Chip
                                              icon={record.status === "Present" ? <CheckCircle /> : <Cancel />}
                                              label={record.status}
                                              color={record.status === "Present" ? "success" : "error"}
                                              variant="filled"
                                              sx={{
                                                fontWeight: 700,
                                                borderRadius: '10px',
                                                fontSize: '0.8125rem',
                                                height: 32,
                                                minWidth: 100,
                                                '& .MuiChip-icon': { fontSize: '1rem' },
                                                boxShadow: record.status === "Present"
                                                  ? '0 2px 8px rgba(46,125,50,0.3)'
                                                  : '0 2px 8px rgba(211,47,47,0.3)',
                                              }}
                                            />
                                          </Box>
                                        </TableCell>
                                      </TableRow>
                                    </Fade>
                                  ))}
                              </TableBody>
                            </Table>
                          </TableContainer>

                        </Box>

                        {/* Footer with additional info */}
                        <Box sx={{
                          p: { xs: 2, sm: 3 },
                          borderTop: '1px solid rgba(0,0,0,0.08)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: 1
                        }}>
                          <Typography variant="caption" sx={{
                            color: 'text.secondary',
                            fontSize: '0.75rem'
                          }}>
                            Last updated: {moment().format('MMM DD, YYYY [at] HH:mm')}
                          </Typography>
                          <Typography variant="caption" sx={{
                            color: 'text.secondary',
                            fontSize: '0.75rem'
                          }}>
                            Attendance Rate: {Math.round((attendanceData.filter(r => r.status === 'Present').length / attendanceData.length) * 100)}%
                          </Typography>
                        </Box>
                      </Paper>
                    </Zoom>
                  )}

                  {/* Empty State */}
                  {!loading && (!attendanceData || attendanceData.length === 0) && (
                    <Fade in timeout={1000}>
                      <Paper
                        sx={{
                          py: { xs: 6, sm: 8, md: 12 },
                          textAlign: 'center',
                          background: 'linear-gradient(135deg, rgba(255, 140, 0, 0.05), rgba(255, 99, 71, 0.05))',
                        }}
                      >
                        <School
                          sx={{
                            fontSize: { xs: '4rem', sm: '5rem', md: '6rem' },
                            color: 'text.secondary',
                            opacity: 0.5,
                            mb: 3
                          }}
                        />
                        <Typography
                          variant="h5"
                          color="text.secondary"
                          sx={{
                            mb: 2,
                            fontSize: { xs: '1.25rem', sm: '1.5rem' }
                          }}
                        >
                          No Attendance Records Found
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          There are no attendance records available for this student.
                        </Typography>
                        <Box sx={{ mt: 4 }}>
                          <Chip
                            icon={<Info />}
                            label="Contact administration for more information"
                            variant="outlined"
                            sx={{ color: 'text.secondary' }}
                          />
                        </Box>
                      </Paper>
                    </Fade>
                  )}
                </>
              )}
            </Box>
          </Fade>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default AttendanceDetails;