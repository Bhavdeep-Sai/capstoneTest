import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { baseApi } from '../../../environment';

const Examination = () => {
  // States
  const [examinations, setExaminations] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [availableExamTypes, setAvailableExamTypes] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    date: '',
    subjectId: '',
    examType: '',
    classId: '',
    startTime: '',
    endTime: '',
    duration: ''
  });

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create' or 'update'
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [calculatingDuration, setCalculatingDuration] = useState(false);

  // Fetch all data on component mount
  useEffect(() => {
    initializeComponent();
  }, []);

  // Fetch examinations by class when selected class changes
  useEffect(() => {
    if (selectedClass) {
      fetchExaminationsByClass(selectedClass);
    } else {
      fetchExaminations();
    }
  }, [selectedClass]);

  // Calculate duration when start time or end time changes
  useEffect(() => {
    const { startTime, endTime } = formData;
    if (startTime && endTime) {
      calculateDuration(startTime, endTime);
    } else {
      setFormData(prev => ({ ...prev, duration: '' }));
    }
  }, [formData.startTime, formData.endTime]);

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const initializeComponent = async () => {
    await getUserInfo();
    await Promise.all([
      fetchExaminations(),
      fetchClasses(),
      fetchSubjects(),
      fetchAvailableExamTypes()
    ]);
  };

  const getUserInfo = () => {
    // Get user info from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role || '');
        setUserId(payload.id || '');
      } catch (error) {
        console.error('Error parsing token:', error);
        setError('Authentication error. Please login again.');
      }
    } else {
      setError('No authentication token found. Please login.');
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  };

  const fetchExaminations = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${baseApi}/examination/all`, getAuthHeaders());
      if (response.data.success) {
        setExaminations(response.data.data || []);
      } else {
        setError('Failed to fetch examinations');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch examinations';
      setError(errorMessage);
      console.error('Fetch examinations error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExaminationsByClass = async (classId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${baseApi}/examination/class/${classId}`, getAuthHeaders());
      if (response.data.success) {
        setExaminations(response.data.data || []);
      } else {
        setError('Failed to fetch examinations for this class');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch examinations for this class';
      setError(errorMessage);
      console.error('Fetch class examinations error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await axios.get(`${baseApi}/class/all`, getAuthHeaders());
      if (response.data.success) {
        setClasses(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      // Don't set error for this as it's not critical for viewing examinations
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`${baseApi}/subject/all`, getAuthHeaders());
      if (response.data.success) {
        setSubjects(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      // Don't set error for this as it's not critical for viewing examinations
    }
  };

  const fetchAvailableExamTypes = async () => {
    try {
      const response = await axios.get(`${baseApi}/examination/exam-types`, getAuthHeaders());
      if (response.data.success) {
        setAvailableExamTypes(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch exam types:', error);
      // Fallback exam types based on user role
      if (userRole === 'TEACHER') {
        setAvailableExamTypes(['Quiz', 'Class Test', 'Pop Quiz', 'Unit Test', 'Weekly Test', 'Slip Test']);
      } else {
        setAvailableExamTypes(['Mid Term', 'Final Term', 'Annual Exam', 'Semester Exam', 'Quiz', 'Class Test', 'Pop Quiz', 'Unit Test', 'Weekly Test', 'Slip Test']);
      }
    }
  };

  const calculateDuration = async (startTime, endTime) => {
    if (!startTime || !endTime) return;

    setCalculatingDuration(true);
    try {
      // Client-side validation first
      const start = new Date(`1970-01-01T${startTime}:00`);
      const end = new Date(`1970-01-01T${endTime}:00`);

      if (end <= start) {
        setError('End time must be after start time');
        setFormData(prev => ({ ...prev, duration: '' }));
        setCalculatingDuration(false);
        return;
      }

      // Calculate duration in minutes
      const diffMs = end - start;
      const durationMinutes = Math.round(diffMs / 60000);

      // Basic validation
      if (durationMinutes < 15) {
        setError('Exam duration must be at least 15 minutes');
        setFormData(prev => ({ ...prev, duration: '' }));
        setCalculatingDuration(false);
        return;
      }

      if (durationMinutes > 480) {
        setError('Exam duration cannot exceed 8 hours');
        setFormData(prev => ({ ...prev, duration: '' }));
        setCalculatingDuration(false);
        return;
      }

      setFormData(prev => ({
        ...prev,
        duration: durationMinutes
      }));

      // Server-side validation
      const response = await axios.post(
        `${baseApi}/examination/calculate-duration`,
        { startTime, endTime },
        getAuthHeaders()
      );

      if (response.data.success) {
        setFormData(prev => ({
          ...prev,
          duration: response.data.data.duration
        }));
      }
    } catch (error) {
      console.error('Failed to calculate duration:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      }
    } finally {
      setCalculatingDuration(false);
    }
  };

  const validateForm = () => {
    const { date, subjectId, examType, classId, startTime, endTime, duration } = formData;

    if (!date || !subjectId || !examType || !startTime || !endTime) {
      setError('All required fields must be filled');
      return false;
    }

    if (modalType === 'create' && !classId) {
      setError('Class selection is required');
      return false;
    }

    if (!duration || duration < 15) {
      setError('Invalid duration. Please check start and end times');
      return false;
    }

    // Check if exam date is not in the past
    const examDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (examDate < today) {
      setError('Exam date cannot be in the past');
      return false;
    }

    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user changes input
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let response;

      if (modalType === 'create') {
        response = await axios.post(
          `${baseApi}/examination/create`,
          formData,
          getAuthHeaders()
        );
      } else if (modalType === 'update') {
        const updatePayload = {
          date: formData.date,
          subjectId: formData.subjectId,
          examType: formData.examType,
          startTime: formData.startTime,
          endTime: formData.endTime,
          duration: formData.duration
        };

        response = await axios.put(
          `${baseApi}/examination/update/${selectedExamId}`,
          updatePayload,
          getAuthHeaders()
        );
      }

      if (response.data.success) {
        setSuccess(modalType === 'create' ? 'Examination created successfully' : 'Examination updated successfully');
        await fetchExaminations();
        closeModal();
      } else {
        setError(response.data.message || 'Operation failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Operation failed. Please try again.';
      setError(errorMessage);
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (examId) => {
    if (!window.confirm('Are you sure you want to delete this examination? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.delete(`${baseApi}/examination/delete/${examId}`, getAuthHeaders());
      if (response.data.success) {
        setSuccess('Examination deleted successfully');
        await fetchExaminations();
      } else {
        setError(response.data.message || 'Failed to delete examination');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete examination';
      setError(errorMessage);
      console.error('Delete error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setModalType('create');
    setFormData({
      date: '',
      subjectId: '',
      examType: '',
      classId: '',
      startTime: '',
      endTime: '',
      duration: ''
    });
    setError('');
    setShowModal(true);
  };

  const openUpdateModal = (exam) => {
    setModalType('update');
    setSelectedExamId(exam._id);

    // Handle different data structures from populated vs non-populated responses
    const subjectId = typeof exam.subject === 'object' ? exam.subject._id : exam.subject;
    const classId = typeof exam.class === 'object' ? exam.class._id : exam.class;

    setFormData({
      date: exam.examDate ? format(new Date(exam.examDate), 'yyyy-MM-dd') : '',
      subjectId: subjectId || '',
      examType: exam.examType || '',
      classId: classId || '',
      startTime: exam.startTime || '',
      endTime: exam.endTime || '',
      duration: exam.duration || ''
    });
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedExamId(null);
    setFormData({
      date: '',
      subjectId: '',
      examType: '',
      classId: '',
      startTime: '',
      endTime: '',
      duration: ''
    });
    setError('');
  };

  // Check if user can edit/delete an exam
  const canEditExam = (exam) => {
    if (userRole === 'SCHOOL') return true;
    if (userRole === 'TEACHER' && exam.creatorRole === 'TEACHER') {
      // Check if the teacher created this exam
      const createdById = typeof exam.createdBy === 'object' ? exam.createdBy._id : exam.createdBy;
      return createdById === userId;
    }
    return false;
  };

  // Get class name by ID or object
  const getClassName = (classData) => {
    if (typeof classData === 'object' && classData.classText) {
      return classData.classText;
    }
    const classObj = classes.find(c => c._id === classData);
    return classObj ? classObj.classText : 'Unknown';
  };

  // Get subject name by ID or object
  const getSubjectName = (subjectData) => {
    if (typeof subjectData === 'object' && subjectData.subjectName) {
      return subjectData.subjectName;
    }
    const subjectObj = subjects.find(s => s._id === subjectData);
    return subjectObj ? subjectObj.subjectName : 'Unknown';
  };

  // Format duration to hours and minutes
  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) {
      return `${mins} min`;
    } else if (mins === 0) {
      return `${hours} hr`;
    } else {
      return `${hours} hr ${mins} min`;
    }
  };

  // Format time (HH:MM) to display format
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';

    try {
      const date = new Date(`1970-01-01T${timeString}:00`);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch (error) {
      return timeString;
    }
  };

  // Get exam type badge color based on exam type
  const getExamTypeBadge = (examType) => {
    const majorExams = ['Mid Term', 'Final Term', 'Annual Exam', 'Semester Exam'];

    if (majorExams.includes(examType)) {
      return 'bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold';
    } else {
      return 'bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold';
    }
  };

  // Get creator display name
  const getCreatorName = (exam) => {
    if (exam.creatorRole === 'SCHOOL') {
      return typeof exam.createdBy === 'object' && exam.createdBy.schoolName
        ? exam.createdBy.schoolName
        : 'School Admin';
    } else {
      return typeof exam.createdBy === 'object' && exam.createdBy.name
        ? exam.createdBy.name
        : 'Teacher';
    }
  };

  // Show appropriate content based on user role and loading state
  const canCreateExam = userRole === 'SCHOOL' || userRole === 'TEACHER';
  const canViewActions = userRole === 'SCHOOL' || userRole === 'TEACHER';

  return (
    <div className="pt-20 px-6 min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-amber-500">Examination Management</h1>
          {canCreateExam && (
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded hover:from-orange-600 hover:to-red-700 transition-all duration-300 shadow-lg"
            >
              Create New Examination
            </button>
          )}
        </div>

        {/* Role indicator */}
        <div className="mb-4 text-sm text-gray-400">
          <span>Role: <span className="text-amber-400 font-semibold">{userRole}</span></span>
          {userRole === 'TEACHER' && (
            <span className="ml-4 text-blue-400">
              (Can create: Quiz, Class Test, Pop Quiz, Unit Test, Weekly Test, Slip Test)
            </span>
          )}
          {userRole === 'STUDENT' && (
            <span className="ml-4 text-green-400">
              (Viewing examinations for your class)
            </span>
          )}
        </div>

        {/* Filter by class - Only show for SCHOOL and TEACHER roles */}
        {(userRole === 'SCHOOL' || userRole === 'TEACHER') && classes.length > 0 && (
          <div className="mb-6 bg-gray-800 p-4 rounded-lg shadow-md">
            <label className="block text-amber-400 mb-2">Filter by Class:</label>
            <div className="flex gap-4">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full max-w-md p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">All Classes</option>
                {classes.map(cls => (
                  <option key={cls._id} value={cls._id}>{cls.classText}</option>
                ))}
              </select>
              {selectedClass && (
                <button
                  onClick={() => setSelectedClass('')}
                  className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Clear Filter
                </button>
              )}
            </div>
          </div>
        )}

        {/* Success and Error Messages */}
        {success && (
          <div className="p-4 mb-6 bg-green-900 border-l-4 border-green-600 rounded text-green-100 flex justify-between items-center">
            <span>{success}</span>
            <button
              onClick={() => setSuccess('')}
              className="text-green-300 hover:text-green-100 ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {error && (
          <div className="p-4 mb-6 bg-red-900 border-l-4 border-red-600 rounded text-red-100 flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => setError('')}
              className="text-red-300 hover:text-red-100 ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-10">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Examinations Table */}
        {!loading && examinations.length > 0 ? (
          <div className="overflow-x-auto rounded-lg shadow-lg">
            <table className="min-w-full bg-gray-800 border border-gray-700">
              <thead>
                <tr className="bg-gradient-to-r from-orange-700 to-red-800 text-white">
                  <th className="py-3 px-4 text-center">Exam Date</th>
                  <th className="py-3 px-4 text-center">Subject</th>
                  <th className="py-3 px-4 text-center">Class</th>
                  <th className="py-3 px-4 text-center">Exam Type</th>
                  <th className="py-3 px-4 text-center">Time</th>
                  <th className="py-3 px-4 text-center">Duration</th>
                  <th className="py-3 px-4 text-center">Created By</th>
                  {canViewActions && (
                    <th className="py-3 px-4 text-center">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {examinations.map((exam) => (
                  <tr key={exam._id} className="border-t border-gray-700 hover:bg-gray-700 transition-colors">
                    <td className="py-3 px-4 text-center">
                      {exam.examDate ? format(new Date(exam.examDate), 'MMM dd, yyyy') : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-amber-400 text-center font-medium">
                      {getSubjectName(exam.subject)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getClassName(exam.class)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={getExamTypeBadge(exam.examType)}>
                        {exam.examType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="text-sm">
                        {formatTime(exam.startTime)} - {formatTime(exam.endTime)}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center text-amber-400 font-medium">
                      {formatDuration(exam.duration)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="text-sm">
                        <div className={exam.creatorRole === 'SCHOOL' ? 'text-red-400' : 'text-blue-400'}>
                          {exam.creatorRole === 'SCHOOL' ? 'School' : 'Teacher'}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {getCreatorName(exam)}
                        </div>
                      </div>
                    </td>
                    {canViewActions && (
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center space-x-2">
                          {canEditExam(exam) ? (
                            <>
                              <button
                                onClick={() => openUpdateModal(exam)}
                                className="px-3 py-1 bg-amber-600 text-white rounded hover:bg-amber-700 text-sm transition-colors"
                                title="Edit Examination"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(exam._id)}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm transition-colors"
                                title="Delete Examination"
                              >
                                Delete
                              </button>
                            </>
                          ) : (
                            <span className="text-gray-500 text-sm">View Only</span>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : !loading && (
          <div className="bg-gray-800 p-8 rounded-lg text-center">
            <p className="text-lg text-amber-400 mb-4">
              {selectedClass ? 'No examinations found for the selected class.' : 'No examinations found.'}
            </p>
            {canCreateExam && (
              <button
                onClick={openCreateModal}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded hover:from-orange-600 hover:to-red-700 transition-all duration-300"
              >
                Create Your First Examination
              </button>
            )}
          </div>
        )}

        {/* Summary Information */}
        {!loading && examinations.length > 0 && (
          <div className="mt-6 text-center text-gray-400">
            <p>
              Showing {examinations.length} examination{examinations.length !== 1 ? 's' : ''}
              {selectedClass && ` for selected class`}
            </p>
          </div>
        )}
      </div>

      {/* Modal for Create/Update */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
            <div className="bg-gradient-to-r from-orange-700 to-red-800 py-4 px-6 rounded-t-lg">
              <h2 className="text-xl font-bold text-white">
                {modalType === 'create' ? 'Create New Examination' : 'Update Examination'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <label className="block text-amber-400 mb-2">
                  Exam Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-amber-400 mb-2">
                  Subject <span className="text-red-400">*</span>
                </label>
                <select
                  name="subjectId"
                  value={formData.subjectId}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-amber-500"
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map(subject => (
                    <option key={subject._id} value={subject._id}>{subject.subjectName}</option>
                  ))}
                </select>
              </div>

              {modalType === 'create' && (
                <div className="mb-4">
                  <label className="block text-amber-400 mb-2">
                    Class <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="classId"
                    value={formData.classId}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-amber-500"
                    required
                  >
                    <option value="">Select Class</option>
                    {classes.map(cls => (
                      <option key={cls._id} value={cls._id}>{cls.classText}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-amber-400 mb-2">
                  Exam Type <span className="text-red-400">*</span>
                  {userRole === 'TEACHER' && (
                    <span className="text-xs text-blue-400 ml-2">(Limited options for teachers)</span>
                  )}
                </label>
                <select
                  name="examType"
                  value={formData.examType}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-amber-500"
                  required
                >
                  <option value="">Select Type</option>
                  {availableExamTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Time Fields */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-amber-400 mb-2">
                    Start Time <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-amber-400 mb-2">
                    End Time <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              {/* Duration Display */}
              <div className="mb-6">
                <label className="block text-amber-400 mb-2">Duration</label>
                <div className="p-2 bg-gray-700 border border-gray-600 rounded text-white">
                  {calculatingDuration ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                      Calculating...
                    </div>
                  ) : formData.duration ? (
                    <span className="text-amber-400 font-medium">
                      {formatDuration(formData.duration)}
                    </span>
                  ) : (
                    <span className="text-gray-400">
                      {formData.startTime && formData.endTime ? 'Invalid time range' : 'Select start and end time'}
                    </span>
                  )}
                </div>
              </div>

              {/* Form Error */}
              {error && (
                <div className="mb-4 p-3 bg-red-900 border border-red-600 rounded text-red-100 text-sm">
                  {error}
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || calculatingDuration}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded hover:from-orange-600 hover:to-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      {modalType === 'create' ? 'Creating...' : 'Updating...'}
                    </>
                  ) : (
                    modalType === 'create' ? 'Create Examination' : 'Update Examination'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Examination;