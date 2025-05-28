import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Search, Edit, Trash2, Plus, Filter, RefreshCw, AlertCircle, Bell, Lock } from "lucide-react";
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
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create' or 'update'
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

  // Update filtered notices when notices state changes or filters
  useEffect(() => {
    setFilteredNotices(notices);
  }, [notices]);

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
      today.setHours(0, 0, 0, 0); // Set to beginning of today
      const expiry = new Date(form.expiryDate);
      if (expiry < today) return "Expiry date cannot be in the past";
    }
    // Extra check: If teacher, audience must be Student
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

      // Prepare form data - only send expiryDate if it's provided
      const formData = {
        title: form.title.trim(),
        message: form.message.trim(),
        audience: form.audience,
        isImportant: form.isImportant
      };

      // Only include expiryDate if it's provided
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

  // Check if notice expired
  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  // Creator badge
  const getCreatorBadge = (notice) => {
    if (notice.createdBy?.role === "SCHOOL") {
      return { text: "School", color: "bg-purple-600 text-white" };
    } else if (notice.createdBy?.role === "TEACHER") {
      return { text: "Teacher", color: "bg-green-600 text-white" };
    }
    return { text: "Unknown", color: "bg-gray-600 text-white" };
  };

  // Check if user can manage given notice (for showing Edit/Delete buttons)
  const canManageNotice = (notice) => {
    // School users can manage all notices
    if (userInfo.role === "SCHOOL") return true;
    
    // Teachers can only manage notices they created AND that are for students
    if (userInfo.role === "TEACHER") {
      if (!notice.createdBy) return false;
      
      // Get the creator ID - handle both object and string formats
      const noticeCreatorId = notice.createdBy._id || notice.createdBy;
      const currentUserId = userInfo.id;
      
      // Debug logging
      console.log('Checking teacher permissions:', {
        noticeCreatorId,
        currentUserId,
        audience: notice.audience,
        createdBy: notice.createdBy
      });
      
      return (
        notice.audience === "Student" &&
        noticeCreatorId === currentUserId
      );
    }
    
    return false;
  };

  return (
    <div className="pt-10 px-6 min-h-screen text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Bell className="w-8 h-8 text-amber-500" />
            <h1 className="text-3xl font-bold text-amber-500">Notice Board</h1>
            {userInfo.role === "TEACHER" && (
              <span className="px-3 py-1 bg-green-700 text-white rounded-full text-sm">
                Teacher Portal
              </span>
            )}
            {userInfo.role === "STUDENT" && (
              <span className="px-3 py-1 bg-blue-700 text-white rounded-full text-sm">
                Student Portal
              </span>
            )}
            {userInfo.role === "SCHOOL" && (
              <span className="px-3 py-1 bg-purple-700 text-white rounded-full text-sm">
                School Admin
              </span>
            )}
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => fetchNotices(pagination.page)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            {(userInfo.role === "SCHOOL" || userInfo.role === "TEACHER") && (
              <button
                onClick={openCreateModal}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded hover:from-orange-600 hover:to-red-700 transition-all duration-300 shadow-lg"
              >
                {userInfo.role === "TEACHER" ? "Create Student Notice" : "Create New Notice"}
              </button>
            )}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 bg-gray-800 p-4 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-semibold text-amber-400">Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* Audience Filter */}
            <div>
              <select
                value={audienceFilter}
                onChange={(e) => setAudienceFilter(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="All">All Notices</option>
                <option value="Student">For Students</option>
                <option value="Teacher">For Teachers</option>
              </select>
            </div>

            {/* Important Filter */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="importantFilter"
                checked={importantFilter}
                onChange={(e) => setImportantFilter(e.target.checked)}
                className="w-4 h-4 text-amber-600 bg-gray-700 border-gray-600 rounded focus:ring-amber-500 focus:ring-2"
              />
              <label htmlFor="importantFilter" className="text-white">
                Important only
              </label>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-900 border border-red-600 text-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-900 border border-green-600 text-green-200 rounded-lg">
            {success}
          </div>
        )}

        {/* Notices Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
            <span className="ml-2 text-amber-500">Loading notices...</span>
          </div>
        ) : filteredNotices.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No notices found</div>
            <div className="text-gray-500 text-sm">
              {searchTerm || audienceFilter !== "All" || importantFilter
                ? "Try adjusting your filters or search terms"
                : "No notices have been posted yet"}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredNotices.map((notice) => {
              const expired = isExpired(notice.expiryDate);
              const creatorBadge = getCreatorBadge(notice);
              const canManage = canManageNotice(notice);
              
              return (
                <div
                  key={notice._id}
                  className={`bg-gray-800 rounded-lg shadow-lg border ${
                    expired ? 'border-red-500 opacity-75' : 'border-gray-700'
                  } hover:shadow-xl transition-all duration-300 ${
                    notice.isImportant ? 'ring-2 ring-amber-500' : ''
                  }`}
                >
                  <div className="p-6">
                    {/* Header with badges */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAudienceBadgeColor(notice.audience)}`}>
                          {notice.audience}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${creatorBadge.color}`}>
                          {creatorBadge.text}
                        </span>
                        {canManage && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 bg-green-600 text-white`}>
                            <Lock className="w-3 h-3" />
                            Editable
                          </span>
                        )}
                        {notice.isImportant && (
                          <span className="px-2 py-1 bg-amber-600 text-white rounded-full text-xs font-medium">
                            Important
                          </span>
                        )}
                        {expired && (
                          <span className="px-2 py-1 bg-red-600 text-white rounded-full text-xs font-medium">
                            Expired
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className={`text-xl font-semibold mb-3 ${expired ? 'text-gray-400' : 'text-white'}`}>
                      {notice.title}
                    </h3>

                    {/* Message */}
                    <p className={`mb-4 leading-relaxed ${expired ? 'text-gray-500' : 'text-gray-300'}`}>
                      {notice.message?.length > 150 
                        ? `${notice.message.substring(0, 150)}...` 
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

                    {/* Action buttons */}
                    {canManage && (
                      <div className="flex gap-2 pt-4 border-t border-gray-700">
                        <button
                          onClick={() => openUpdateModal(notice)}
                          className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setDeleteId(notice._id);
                            setShowDeleteModal(true);
                          }}
                          className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center gap-2 mb-8">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex gap-1">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded ${
                    page === pagination.page
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Create/Update Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-amber-500">
                  {modalType === 'create' ? 'Create New Notice' : 'Update Notice'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Plus className="w-6 h-6 transform rotate-45" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-900 border border-red-600 text-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Enter notice title"
                    maxLength="100"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Enter notice message"
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-vertical"
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
                    onChange={(e) => setForm({ ...form, audience: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                    disabled={userInfo.role === "TEACHER"}
                  >
                    {/* Teachers can only create Student notices */}
                    <option value="Student">Students</option>
                    {userInfo.role !== "TEACHER" && (
                      <>
                        <option value="Teacher">Teachers</option>
                        <option value="All">All</option>
                      </>
                    )}
                  </select>
                  {userInfo.role === "TEACHER" && (
                    <div className="text-xs text-gray-400 mt-1">
                      As a teacher, you can only create notices for students.
                    </div>
                  )}
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select the date for which this notice applies
                  </label>
                  <input
                    type="date"
                    value={form.expiryDate}
                    onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                {/* Important checkbox */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isImportant"
                    checked={form.isImportant}
                    onChange={(e) => setForm({ ...form, isImportant: e.target.checked })}
                    className="w-5 h-5 text-amber-600 bg-gray-700 border-gray-600 rounded focus:ring-amber-500 focus:ring-2"
                  />
                  <label htmlFor="isImportant" className="text-gray-300">
                    Mark as important
                  </label>
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-6 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        {modalType === 'create' ? 'Creating...' : 'Updating...'}
                      </div>
                    ) : (
                      modalType === 'create' ? 'Create Notice' : 'Update Notice'
                    )}
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
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-red-500" />
                <h3 className="text-xl font-bold text-white">Confirm Delete</h3>
              </div>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete this notice? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteId(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Deleting...
                    </div>
                  ) : (
                    'Delete'
                  )}
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