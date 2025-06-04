import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Search, Edit, Trash2, Plus, Filter, RefreshCw, AlertCircle, Bell, Lock, Eye, EyeOff } from "lucide-react";
import { baseApi } from "../../../environment";

const Notice = () => {
  const [notices, setNotices] = useState([]);
  const [filteredNotices, setFilteredNotices] = useState([]);
  const [form, setForm] = useState({
    title: "",
    message: "",
    audience: "Student",
    isImportant: false,
    expiryDate: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [currentNoticeId, setCurrentNoticeId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [audienceFilter, setAudienceFilter] = useState("All");
  const [importantFilter, setImportantFilter] = useState(false);
  const [expiredFilter, setExpiredFilter] = useState("active"); // "active", "expired", "all"
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  // Get user role and ID from localStorage
  const [userInfo, setUserInfo] = useState(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        return {
          role: parsedUser.role || "STUDENT",
          id: parsedUser._id || parsedUser.id,
          schoolId: parsedUser.schoolId || null,
        };
      } catch (error) {
        return { role: "STUDENT", id: null, schoolId: null };
      }
    }
    return { role: "STUDENT", id: null, schoolId: null };
  });

  // Get token and user info for API requests
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    };
  };

  // Check if notice expired
  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  // Filter notices based on expiry status
  const filterNoticesByExpiry = (noticesList) => {
    switch (expiredFilter) {
      case "expired":
        return noticesList.filter(notice => isExpired(notice.expiryDate));
      case "active":
        return noticesList.filter(notice => !isExpired(notice.expiryDate));
      case "all":
      default:
        return noticesList;
    }
  };

  // Fetch notices with pagination and filters
  const fetchNotices = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', pagination.limit);
      if (audienceFilter && audienceFilter !== 'All') {
        params.append('audience', audienceFilter);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      if (importantFilter) {
        params.append('important', 'true');
      }

      const response = await axios.get(
        `${baseApi}/notice/all?${params.toString()}`,
        getAuthHeaders()
      );

      if (response.data?.success) {
        const fetchedNotices = response.data.data || [];
        setNotices(fetchedNotices);
        console.log(fetchedNotices)
        setPagination(prev => ({
          ...prev,
          page: response.data.pagination?.page || page,
          total: response.data.pagination?.total || 0,
          pages: response.data.pagination?.pages || 0
        }));
      } else {
        setNotices([]);
      }
    } catch (error) {
      console.error("Failed to fetch notices:", error);
      setError(error.response?.data?.message || "Failed to fetch notices");
      setNotices([]);

      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, audienceFilter, searchTerm, importantFilter]);

  // Initial fetch and refetch when filters change
  useEffect(() => {
    fetchNotices(1);
  }, [fetchNotices]);

  // Update filtered notices when notices state changes or expiry filter changes
  useEffect(() => {
    const filtered = filterNoticesByExpiry(notices);
    setFilteredNotices(filtered);
  }, [notices, expiredFilter]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // Form validation
  const validateForm = () => {
    if (!form.title?.trim()) return "Title is required";
    if (form.title.length > 100) return "Title must be less than 100 characters";
    if (!form.message?.trim()) return "Message is required";
    if (!form.audience) return "Audience is required";
    if (form.expiryDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expiry = new Date(form.expiryDate);
      if (expiry < today) return "Expiry date cannot be in the past";
    }
    if (userInfo.role === "TEACHER" && form.audience !== "Student") {
      return "Teachers can only create notices for students";
    }
    return null;
  };

  // Handle form submission for create/update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const endpoint = editMode
        ? `${baseApi}/notice/${currentNoticeId}`
        : `${baseApi}/notice/create`;

      const method = editMode ? 'put' : 'post';

      const formData = {
        title: form.title.trim(),
        message: form.message.trim(),
        audience: form.audience,
        isImportant: form.isImportant
      };

      if (form.expiryDate) {
        formData.expiryDate = form.expiryDate;
      }

      const response = await axios[method](endpoint, formData, getAuthHeaders());

      if (response.data?.success) {
        setSuccess(editMode ? "Notice updated successfully" : "Notice created successfully");
        resetForm();
        setShowModal(false);
        fetchNotices(pagination.page);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setError(error.response?.data?.message || "Operation failed");
      if (error.response?.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setForm({
      title: "",
      message: "",
      audience: "Student",
      isImportant: false,
      expiryDate: "",
    });
    setEditMode(false);
    setCurrentNoticeId(null);
  };

  // Open create modal
  const openCreateModal = () => {
    setModalType('create');
    resetForm();
    setShowModal(true);
    setError('');
  };

  // Open edit modal with notice data
  const openUpdateModal = (notice) => {
    setModalType('update');
    setForm({
      title: notice.title || "",
      message: notice.message || "",
      audience: notice.audience || "Student",
      isImportant: notice.isImportant || false,
      expiryDate: notice.expiryDate ? new Date(notice.expiryDate).toISOString().split('T')[0] : "",
    });
    setEditMode(true);
    setCurrentNoticeId(notice._id);
    setShowModal(true);
    setError('');
  };

  // Close modal and reset form
  const closeModal = () => {
    setShowModal(false);
    resetForm();
    setError('');
  };

  // Handle notice delete request
  const handleDelete = async () => {
    if (!deleteId) return;

    setSubmitting(true);
    setError('');
    try {
      const response = await axios.delete(
        `${baseApi}/notice/${deleteId}`,
        getAuthHeaders()
      );

      if (response.data?.success) {
        setSuccess("Notice deleted successfully");
        fetchNotices(pagination.page);
      }
    } catch (error) {
      console.error("Delete failed:", error);
      setError(error.response?.data?.message || "Failed to delete notice");

      if (error.response?.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
      }
    } finally {
      setSubmitting(false);
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  // Pagination controls
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchNotices(newPage);
    }
  };

  // Format date for display
  const formatDate = (date) => {
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Badge colors for audience
  const getAudienceBadgeColor = (audience) => {
    switch (audience) {
      case 'Student': return 'bg-blue-600 text-white';
      case 'Teacher': return 'bg-green-600 text-white';
      case 'All': return 'bg-purple-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  // Creator badge
  const getCreatorBadge = (notice) => {
    if (notice.creatorRole === "SCHOOL") {
      return { text: "School Admin", color: "bg-purple-600 text-white" };
    } else if (notice.creatorRole === "TEACHER") {
      return { text: notice.createdBy, color: "bg-green-600 text-white" };
    }
    return { text: "Unknown", color: "bg-gray-600 text-white" };
  };

  // Check if user can manage given notice
  const canManageNotice = (notice) => {
    // School admins can manage all notices
    if (userInfo.role === "SCHOOL") {
      // Multiple ways to check if teacher created this notice
      const currentUserId = userInfo.id;
      console.log(currentUserId)

      // Check if createdBy is an object with _id or id
      if (notice.createdBy) {
        const creatorId = notice.createdId || notice.createdId;
        if (creatorId === currentUserId) return true;
      }


      // Check if createdBy is a string ID
      if (typeof notice.createdBy === 'string' && notice.createdBy === currentUserId) {
        return true;
      }

      // Check creatorId field (some APIs might use this)
      if (notice.creatorId === currentUserId) return true;

      // Check if notice has a creator field
      if (notice.creator) {
        const creatorId = typeof notice.creator === 'object'
          ? (notice.creator._id || notice.createdId)
          : notice.creator;
        if (creatorId === currentUserId) return true;
      }

      return false;
    };

    // Teachers can only manage notices they created for students
    if (userInfo.role === "TEACHER") {
      // Ensure the notice is for students
      if (notice.audience !== "Student") return false;

      // Multiple ways to check if teacher created this notice
      const currentUserId = userInfo.id;
      console.log(currentUserId)

      // Check if createdBy is an object with _id or id
      if (notice.createdBy) {
        const creatorId = notice.createdId || notice.createdId;
        if (creatorId === currentUserId) return true;
      }


      // Check if createdBy is a string ID
      if (typeof notice.createdBy === 'string' && notice.createdBy === currentUserId) {
        return true;
      }

      // Check creatorId field (some APIs might use this)
      if (notice.creatorId === currentUserId) return true;

      // Check if notice has a creator field
      if (notice.creator) {
        const creatorId = typeof notice.creator === 'object'
          ? (notice.creator._id || notice.createdId)
          : notice.creator;
        if (creatorId === currentUserId) return true;
      }

      return false;
    }

    // Students cannot manage notices
    return false;
  };

  // Get expired notices count for display
  const expiredCount = notices.filter(notice => isExpired(notice.expiryDate)).length;
  const activeCount = notices.filter(notice => !isExpired(notice.expiryDate)).length;

  return (
    <div className="pt-4 sm:pt-6 lg:pt-10 px-3 sm:px-4 lg:px-6 min-h-screen text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Bell className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500" />
            <h1 className="text-2xl sm:text-3xl font-bold text-amber-500">Notice Board</h1>
            {userInfo.role === "TEACHER" && (
              <span className="px-2 py-1 sm:px-3 bg-green-700 text-white rounded-full text-xs sm:text-sm">
                Teacher Portal
              </span>
            )}
            {userInfo.role === "STUDENT" && (
              <span className="px-2 py-1 sm:px-3 bg-blue-700 text-white rounded-full text-xs sm:text-sm">
                Student Portal
              </span>
            )}
            {userInfo.role === "SCHOOL" && (
              <span className="px-2 py-1 sm:px-3 bg-purple-700 text-white rounded-full text-xs sm:text-sm">
                School Admin
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-4 w-full sm:w-auto">
            <button
              onClick={() => fetchNotices(pagination.page)}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 transition-colors text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            {(userInfo.role === "SCHOOL" || userInfo.role === "TEACHER") && (
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded hover:from-orange-600 hover:to-red-700 transition-all duration-300 shadow-lg text-sm flex-1 sm:flex-none justify-center"
              >
                <Plus className="w-4 h-4" />
                <span className="sm:hidden">Create</span>
                <span className="hidden sm:inline">
                  {userInfo.role === "TEACHER" ? "Create Student Notice" : "Create New Notice"}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 bg-gray-800 p-3 sm:p-4 lg:p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            <h3 className="text-base sm:text-lg font-semibold text-amber-400">Filters</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Audience Filter */}
            <div>
              <select
                value={audienceFilter}
                onChange={(e) => setAudienceFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
              >
                <option value="All">All Audiences</option>
                {userInfo.role !== 'TEACHER' && <option value="Student">For Students</option>}
                {userInfo.role !== 'STUDENT' && <option value="Teacher">For Teachers</option>}

              </select>
            </div>

            {/* Expiry Status Filter */}
            <div>
              <select
                value={expiredFilter}
                onChange={(e) => setExpiredFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
              >
                <option value="active">Active ({activeCount})</option>
                <option value="expired">Expired ({expiredCount})</option>
                <option value="all">All Notices</option>
              </select>
            </div>

            {/* Important Filter */}
            <div className="flex items-center gap-2 bg-gray-700 px-3 py-2 rounded-lg">
              <input
                type="checkbox"
                id="importantFilter"
                checked={importantFilter}
                onChange={(e) => setImportantFilter(e.target.checked)}
                className="w-4 h-4 text-amber-600 bg-gray-700 border-gray-600 rounded focus:ring-amber-500 focus:ring-2"
              />
              <label htmlFor="importantFilter" className="text-white text-sm">
                Important only
              </label>
            </div>

            {/* Filter Status Display */}
            <div className="sm:col-span-2 lg:col-span-1 flex items-center gap-2 text-xs text-gray-400">
              {expiredFilter === "expired" && (
                <div className="flex items-center gap-1 bg-red-900 px-2 py-1 rounded">
                  <EyeOff className="w-3 h-3" />
                  Showing Expired
                </div>
              )}
              {expiredFilter === "active" && (
                <div className="flex items-center gap-1 bg-green-900 px-2 py-1 rounded">
                  <Eye className="w-3 h-3" />
                  Showing Active
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-3 sm:p-4 bg-red-900 border border-red-600 text-red-200 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 sm:p-4 bg-green-900 border border-green-600 text-green-200 rounded-lg text-sm">
            {success}
          </div>
        )}

        {/* Notices Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-amber-500" />
            <span className="ml-2 text-amber-500 text-sm sm:text-base">Loading notices...</span>
          </div>
        ) : filteredNotices.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-base sm:text-lg mb-2">
              {expiredFilter === "expired" ? "No expired notices found" : "No notices found"}
            </div>
            <div className="text-gray-500 text-xs sm:text-sm">
              {searchTerm || audienceFilter !== "All" || importantFilter
                ? "Try adjusting your filters or search terms"
                : expiredFilter === "expired"
                  ? "All notices are still active"
                  : "No notices have been posted yet"}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {filteredNotices.map((notice) => {
              const expired = isExpired(notice.expiryDate);
              const creatorBadge = getCreatorBadge(notice);
              const canManage = canManageNotice(notice);

              return (
                <div
                  key={notice._id}
                  className={`bg-gray-800 rounded-lg shadow-lg border ${expired ? 'border-red-500 opacity-90' : 'border-gray-700'
                    } hover:shadow-xl transition-all duration-300 ${notice.isImportant ? 'ring-2 ring-amber-500' : ''
                    } flex flex-col`}
                >
                  <div className="p-4 sm:p-6 flex-1">
                    {/* Header with badges */}
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAudienceBadgeColor(notice.audience)}`}>
                          {notice.audience}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${creatorBadge.color}`}>
                          {creatorBadge.text}
                        </span>
                        {canManage && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 bg-green-600 text-white">
                            <Lock className="w-2 h-2 sm:w-3 sm:h-3" />
                            <span className="hidden sm:inline">Editable</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status badges */}
                    <div className="flex flex-wrap gap-1 sm:gap-2 mb-3">
                      {expired && (
                        <span className="px-2 py-1 bg-red-600 text-white rounded-full text-xs font-medium">
                          Expired
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className={`text-lg sm:text-xl font-semibold mb-3 line-clamp-2 ${expired ? 'text-gray-400' : 'text-white'}`}>
                      {notice.title}
                    </h3>

                    {/* Message */}
                    <p className={`mb-4 leading-relaxed text-sm sm:text-base line-clamp-4 ${expired ? 'text-gray-500' : 'text-gray-300'}`}>
                      {notice.message?.length > 120
                        ? `${notice.message.substring(0, 120)}...`
                        : notice.message}
                    </p>

                    {/* Timestamps */}
                    <div className="text-xs text-gray-400 mb-4 space-y-1">
                      <div>Created: {formatDate(notice.createdAt)}</div>
                      {notice.expiryDate && (
                        <div className={expired ? 'text-red-400' : ''}>
                          Expires: {formatDate(notice.expiryDate)}
                        </div>
                      )}
                      {notice.createdBy?.name && (
                        <div>By: {notice.createdBy.name}</div>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  {canManage && (
                    <div className="p-4 sm:p-6 pt-0 flex gap-2">
                      <button
                        onClick={() => openUpdateModal(notice)}
                        className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs sm:text-sm flex-1"
                      >
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          setDeleteId(notice._id);
                          setShowDeleteModal(true);
                        }}
                        className="flex items-center justify-center gap-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs sm:text-sm flex-1"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center gap-2 mb-8 flex-wrap">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-2 py-2 sm:px-3 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <span className="sm:hidden">‹</span>
              <span className="hidden sm:inline">Previous</span>
            </button>

            <div className="flex gap-1 overflow-x-auto max-w-xs sm:max-w-none">
              {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                let page;
                if (pagination.pages <= 5) {
                  page = i + 1;
                } else {
                  const start = Math.max(1, pagination.page - 2);
                  const end = Math.min(pagination.pages, start + 4);
                  page = start + i;
                  if (page > end) return null;
                }

                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-2 py-2 sm:px-3 rounded text-sm ${page === pagination.page
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                      }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-2 py-2 sm:px-3 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <span className="sm:hidden">›</span>
              <span className="hidden sm:inline">Next</span>
            </button>
          </div>
        )}
      </div>

      {/* Create/Update Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-amber-500">
                  {modalType === 'create' ? 'Create New Notice' : 'Update Notice'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                >
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6 transform rotate-45" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 sm:p-4 bg-red-900 border border-red-600 text-red-200 rounded-lg flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter notice title"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base"
                    maxLength={100}
                    required
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    {form.title.length}/100 characters
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Enter notice message"
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base resize-vertical"
                    required
                  />
                </div>

                {/* Audience */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Audience *
                  </label>
                  <select
                    value={form.audience}
                    onChange={(e) => setForm(prev => ({ ...prev, audience: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base"
                    required
                  >
                    <option value="Student">Students</option>
                    {userInfo.role === "SCHOOL" && (
                      <>
                        <option value="Teacher">Teachers</option>
                        <option value="All">Everyone</option>
                      </>
                    )}
                  </select>
                  {userInfo.role === "TEACHER" && (
                    <div className="text-xs text-amber-400 mt-1">
                      As a teacher, you can only create notices for students
                    </div>
                  )}
                </div>

                {/* Important and Expiry Date Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Important Checkbox */}
                  <div className="flex items-center gap-3 bg-gray-700 p-3 rounded-lg">
                    <input
                      type="checkbox"
                      id="isImportant"
                      checked={form.isImportant}
                      onChange={(e) => setForm(prev => ({ ...prev, isImportant: e.target.checked }))}
                      className="w-4 h-4 text-amber-600 bg-gray-700 border-gray-600 rounded focus:ring-amber-500 focus:ring-2"
                    />
                    <label htmlFor="isImportant" className="text-sm font-medium text-gray-300">
                      Mark as Important
                    </label>
                  </div>

                  {/* Expiry Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Expiry Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={form.expiryDate}
                      onChange={(e) => setForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base order-2 sm:order-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-sm sm:text-base order-1 sm:order-2 flex-1 sm:flex-none flex items-center justify-center gap-2"
                  >
                    {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                    {submitting
                      ? (modalType === 'create' ? 'Creating...' : 'Updating...')
                      : (modalType === 'create' ? 'Create Notice' : 'Update Notice')
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Delete Notice</h3>
                  <p className="text-sm text-gray-400">This action cannot be undone.</p>
                </div>
              </div>

              <p className="text-gray-300 mb-6 text-sm sm:text-base">
                Are you sure you want to delete this notice? This will permanently remove it from the system.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteId(null);
                  }}
                  disabled={submitting}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors text-sm sm:text-base order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={submitting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base order-1 sm:order-2 flex-1 sm:flex-none flex items-center justify-center gap-2"
                >
                  {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Deleting...' : 'Delete Notice'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notice;