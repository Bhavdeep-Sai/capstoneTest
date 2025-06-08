import axios from 'axios';
import * as React from 'react';
import { baseApi } from '../../../environment';
import Attendee from './Attendee';
import { Link } from 'react-router-dom';
import { Box, Paper, Typography } from '@mui/material';
import EqualizerIcon from "@mui/icons-material/Equalizer";


// Icon components (simplified SVG icons)
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const ClearIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const VisibilityIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const SchoolIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
  </svg>
);

const PersonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#f68405" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users-icon lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /></svg>
);

const PhoneIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const AssessmentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round" class="lucide lucide-chart-no-axes-column-icon lucide-chart-no-axes-column"><line x1="18" x2="18" y1="20" y2="10" /><line x1="12" x2="12" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="14" /></svg>
);

const FilterListIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="#f68405" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
  </svg>
);

const ExpandMoreIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ExpandLessIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

// Custom Alert Component
const Alert = ({ type, message, onClose }) => {
  const alertClasses = {
    error: 'bg-red-900/20 border-red-500/50 text-red-200',
    success: 'bg-green-900/20 border-green-500/50 text-green-200',
    warning: 'bg-yellow-900/20 border-yellow-500/50 text-yellow-200',
  };

  return (
    <div className={`p-4 rounded-xl border backdrop-blur-lg ${alertClasses[type]} flex items-center justify-between animate-fade-in`}>
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-white/70 hover:text-white transition-colors"
        >
          <ClearIcon />
        </button>
      )}
    </div>
  );
};

// Custom Loading Spinner
const LoadingSpinner = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-orange-500/30 border-t-orange-500`}></div>
  );
};

// Custom Chip Component
const Chip = ({ label, color = 'default', size = 'md', percentage }) => {
  let colorClasses = 'bg-gray-600/20 text-gray-300 border-gray-500/30';

  if (color === 'primary') {
    colorClasses = 'bg-orange-500/20 text-orange-300 border-orange-500/30 rounded-md';
  } else if (typeof percentage !== 'undefined') {
    if (percentage >= 80) {
      colorClasses = 'bg-green-500/20 text-green-300 border-green-500/30 rounded-md';
    } else if (percentage >= 50) {
      colorClasses = 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30 rounded-md';
    } else {
      colorClasses = 'bg-red-500/20 text-red-300 border-red-500/30 rounded-md';
    }
  }


  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <span className={`inline-flex items-center rounded-full border font-semibold ${colorClasses} ${sizeClasses}`}>
      {label}
    </span>
  );
};

// Avatar Component
const Avatar = ({ children, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-20 h-20 text-2xl'
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center font-bold text-white shadow-lg`}>
      {children}
    </div>
  );
};

// Mobile Student Card Component
const StudentMobileCard = ({ student, attendanceData, getInitials }) => {
  const attendancePercentage = attendanceData[student._id];

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-white/10 rounded-2xl p-4 mb-4 backdrop-blur-lg transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-start mb-4">
        <Avatar size="md">
          {getInitials(student.name)}
        </Avatar>
        <div className="ml-3 flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white mb-1">
            {student.name}
          </h3>
          <div className="flex gap-2 mb-2 flex-wrap">
            <Chip
              label={student.gender}
              color={student.gender === 'Male' ? 'primary' : 'secondary'}
              size="sm"
            />
            <Chip
              label={student.studentClass?.classText || 'Unassigned'}
              size="sm"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-user-icon lucide-shield-user"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="M6.376 18.91a6 6 0 0 1 11.249.003" /><circle cx="12" cy="11" r="4" /></svg>
          <span className="ml-2 text-sm">Parent: {student.parent}</span>
        </div>

        <div className="flex items-center text-gray-300">
          <PhoneIcon />
          <span className="ml-2 text-sm">{student.parentNum}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">Attendance:</span>
          {attendancePercentage !== undefined ? (
            attendancePercentage !== null ? (
              <Chip
                label={`${attendancePercentage.toFixed(1)}%`}
                percentage={attendancePercentage}
                size="sm"
              />
            ) : (
              <Chip label="No Data" size="sm" />
            )
          ) : (
            <LoadingSpinner size="sm" />
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Link
            to={`/school/attendance/${student._id}`}
            className="inline-flex items-center px-4 py-2 border-2 border-orange-500 text-orange-400 rounded-xl font-semibold text-sm transition-all duration-300 hover:bg-orange-500/10 hover:text-orange-300 hover:-translate-y-0.5"
          >
            <VisibilityIcon />
            <span className="ml-2">View Details</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function AttendanceStudentList() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [message, setMessage] = React.useState('');
  const [classes, setClasses] = React.useState([]);
  const [students, setStudents] = React.useState([]);
  const [attendanceData, setAttendanceData] = React.useState({});
  const [filterClass, setFilterClass] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [selectedClass, setSelectedClass] = React.useState(null);
  const [filterExpanded, setFilterExpanded] = React.useState(true);
  const [isMobile, setIsMobile] = React.useState(false);

  // Handle responsive design
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setFilterExpanded(window.innerWidth >= 640);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch classes from API
  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${baseApi}/class/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setClasses(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch classes:', err);
      setError('Failed to fetch classes');
    }
  };

  // Handle class filter change
  const handleClass = (e) => {
    const classId = e.target.value;
    setSelectedClass(classId);
    setFilterClass(classId);
    fetchStudentsByFilters(classId, search);
  };

  // Handle search input change
  const handleSearch = (e) => {
    const searchText = e.target.value;
    setSearch(searchText);
    fetchStudentsByFilters(filterClass, searchText);
  };

  // Clear all filters
  const handleClearFilter = () => {
    setFilterClass('');
    setSearch('');
    setSelectedClass(null);
    fetchStudentsByFilters('', '');
  };

  // Fetch students with filters
  const fetchStudentsByFilters = async (classId, searchText) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const queryParams = {};
      if (classId) queryParams.studentClass = classId;
      if (searchText) queryParams.search = searchText;

      const response = await axios.get(`${baseApi}/student/fetch-with-query`, {
        params: queryParams,
        headers: { Authorization: `Bearer ${token}` },
      });

      const studentList = response.data.students || [];
      setStudents(studentList);

      if (studentList.length > 0) {
        await fetchAttendanceForStudents(studentList);
      } else {
        setAttendanceData({});
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to fetch students');
      setStudents([]);
      setAttendanceData({});
    } finally {
      setLoading(false);
    }
  };

  // Fetch attendance for students
  const fetchAttendanceForStudents = async (studentList) => {
    const updatedAttendanceData = {};
    const token = localStorage.getItem('token');

    try {
      const attendancePromises = studentList.map((student) =>
        axios
          .get(`${baseApi}/attendance/${student._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            const attendanceRecords = response.data.attendance || [];
            const totalClasses = attendanceRecords.length;
            const presentCount = attendanceRecords.filter(
              (record) => record.status === 'Present'
            ).length;
            const attendancePercentage =
              totalClasses > 0 ? (presentCount / totalClasses) * 100 : 0;
            updatedAttendanceData[student._id] = attendancePercentage;
          })
          .catch((err) => {
            console.warn(
              `Could not fetch attendance for student ${student.name} (${student._id}):`,
              err
            );
            updatedAttendanceData[student._id] = null;
          })
      );

      await Promise.all(attendancePromises);
      setAttendanceData(updatedAttendanceData);
    } catch (error) {
      console.error('Error in attendance fetching process:', error);
      setError('Failed to fetch attendance data');
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  React.useEffect(() => {
    fetchClasses();
    fetchStudentsByFilters('', '');
  }, []);

  return (
    <div className="min-h-screen py-6 md:py-3">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-fade-in">
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap:{xs:3, lg:2}}}>
                  <EqualizerIcon sx={{ fontSize: { xs: 38, md: 32 } }} />
                  <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                      fontWeight: 'bold',
                      fontSize: { xs: '1.2rem', sm: '2rem', md: '2.5rem' },
                      textAlign: { xs: 'left', md: 'left' }
                    }}
                  >
                    Student Attendance Dashboard
                  </Typography>
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
          {/* Alerts */}
          <div className="space-y-4 mb-8">
            {error && (
              <Alert
                type="error"
                message={error}
                onClose={() => setError(null)}
              />
            )}
            {message && (
              <Alert
                type="success"
                message={message}
                onClose={() => setMessage('')}
              />
            )}
          </div>

          {/* Filter Section */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-orange-500/20 rounded-2xl p-6 mb-8 backdrop-blur-lg">
            <div
              className={`flex items-center lg:mb-4 ${isMobile ? 'cursor-pointer' : ''}`}
              onClick={isMobile ? () => setFilterExpanded(!filterExpanded) : undefined}
            >
              <FilterListIcon />
              <h2 className="text-sm lg:text-left lg:text-xl font-bold ml-2 flex-1">
                Search & Filter Students
              </h2>
              {isMobile && (
                <button className="text-orange-400 p-1">
                  {filterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </button>
              )}
            </div>

            {filterExpanded && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-5">
                  <label className="block mt-3 text-sm font-medium text-gray-300 mb-2">
                    Search Students
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <SearchIcon />
                    </div>
                    <input
                      type="text"
                      placeholder="Search by name..."
                      value={search}
                      onChange={handleSearch}
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent backdrop-blur-lg transition-all duration-300"
                    />
                    {search && (
                      <button
                        onClick={() => setSearch('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-red-400 hover:text-white transition-colors"
                      >
                        <ClearIcon />
                      </button>
                    )}
                  </div>
                </div>

                <div className="md:col-span-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Class
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <SchoolIcon />
                    </div>
                    <select
                      value={filterClass}
                      onChange={handleClass}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent backdrop-blur-lg transition-all duration-300 appearance-none cursor-pointer"
                    >
                      <option value="">All Classes</option>
                      {classes.map((cls) => (
                        <option key={cls._id} value={cls._id} className="bg-gray-800">
                          {cls.classText}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="md:col-span-3">
                  <button
                    onClick={handleClearFilter}
                    className="w-full flex items-center justify-center px-6 py-3 border-2 border-red-500 text-red-300 rounded-xl font-semibold transition-all duration-300 hover:border-red-400 hover:text-red-200 cursor-pointer hover:-translate-y-0.5"
                  >
                    <ClearIcon />
                    <span className="ml-2">Clear Filters</span>
                  </button>
                </div>
              </div>
            )}

            {selectedClass && filterExpanded && (
              <div className="mt-8 animate-fade-in">
                <Attendee classId={selectedClass} />
              </div>
            )}
          </div>

          {/* Students Display */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-white/10 rounded-2xl backdrop-blur-lg overflow-hidden shadow-2xl mt-8">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center">
                <PersonIcon />
                <h2 className="text-xl font-bold ml-2">
                  Students List <span className='text-cyan-400'>({students.length})</span>
                </h2>
              </div>
            </div>

            {/* Mobile View - Card List */}
            {isMobile ? (
              <div className="p-6">
                {loading ? (
                  [...Array(3)].map((_, index) => (
                    <div key={index} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-white/10 rounded-2xl p-4 mb-4 animate-pulse">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gray-600 rounded-full mr-3"></div>
                        <div className="flex-1">
                          <div className="h-6 bg-gray-600 rounded mb-2 w-3/4"></div>
                          <div className="h-4 bg-gray-600 rounded w-1/2"></div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-600 rounded w-4/5"></div>
                        <div className="h-4 bg-gray-600 rounded w-3/5"></div>
                        <div className="h-10 bg-gray-600 rounded w-full"></div>
                      </div>
                    </div>
                  ))
                ) : students.length > 0 ? (
                  students.map((student) => (
                    <StudentMobileCard
                      key={student._id}
                      student={student}
                      attendanceData={attendanceData}
                      getInitials={getInitials}
                    />
                  ))
                ) : (
                  <div className="text-center py-16">
                    <div className="text-6xl text-gray-500 mb-4">
                      <SchoolIcon />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">
                      No Students Found
                    </h3>
                    <p className="text-gray-400">
                      Try adjusting your search criteria or filters
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // Desktop View - Table
              <div className="overflow-y-auto max-h-96 scroll-container scroll-smooth">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-orange-500 to-orange-600 sticky top-0 z-10">
                    <tr>
                      {['Student', 'Gender', 'Class', 'Parent', 'Contact', 'Attendance', 'Actions'].map((header) => (
                        <th key={header} className="px-6 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loading ? (
                      [...Array(5)].map((_, index) => (
                        <tr key={index} className="animate-pulse">
                          {[...Array(7)].map((_, cellIndex) => (
                            <td key={cellIndex} className="px-6 py-4">
                              <div className="h-4 bg-gray-600 rounded-md"></div>
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : students?.length > 0 ? (
                      students.map((student) => {
                        const attendancePercentage = attendanceData[student._id];
                        return (
                          <tr key={student._id} className="hover:bg-gradient-to-r hover:from-orange-500/10 hover:to-red-500/10 transition-all duration-200 hover:scale-[1.002]">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <Avatar size="sm">
                                  {getInitials(student.name)}
                                </Avatar>
                                <span className="ml-3 font-semibold text-white">{student.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center flex items-center justify-center">
                              {student.gender === "male" ? (
                                <div className='flex h-12 m-auto items-center justify-center gap-2'>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1092de" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mars">
                                    <path d="M16 3h5v5" />
                                    <path d="m21 3-6.75 6.75" />
                                    <circle cx="10" cy="14" r="6" />
                                  </svg>
                                  <p className='capitalize'>{student.gender}</p>
                                </div>
                              ) : (
                                <div className='flex h-12 m-auto items-center justify-center gap-2'>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#de56a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-venus">
                                    <path d="M12 15v7" />
                                    <path d="M9 19h6" />
                                    <circle cx="12" cy="9" r="6" />
                                  </svg>
                                  <p className='capitalize'>{student.gender}</p>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center text-sm">{student.studentClass?.classText || 'Unassigned'}</td>
                            <td className="px-6 py-4 text-center text-gray-300">{student.parent}</td>
                            <td className="px-6 py-4 text-center text-gray-400">{student.parentNum}</td>
                            <td className="px-6 py-4 text-center">
                              {attendancePercentage !== undefined ? (
                                attendancePercentage !== null ? (
                                  <Chip label={`${attendancePercentage.toFixed(1)}%`} percentage={attendancePercentage} size="sm" />
                                ) : (
                                  <Chip label="No Data" size="sm" />
                                )
                              ) : (
                                <LoadingSpinner size="sm" />
                              )}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <Link
                                to={`/school/attendance/${student._id}`}
                                className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 hover:scale-105 transition-all duration-200"
                                title="View Attendance Details"
                              >
                                <VisibilityIcon />
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-16 text-center text-gray-300">No Students Found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            )}
          </div>
        </div>
      </div>
    </div>
  );
}