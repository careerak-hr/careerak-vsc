import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, MapPin, Calendar, Activity, Edit, Save, Ban, CheckCircle, Trash2, Bell } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

/**
 * UserDetailModal Component
 * 
 * Display complete user information with edit, disable/enable, and delete capabilities.
 * Requirements: 8.3-8.9
 */
const UserDetailModal = ({ user, onClose, onUserUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [activityHistory, setActivityHistory] = useState([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showActivityTab, setShowActivityTab] = useState(false);

  useEffect(() => {
    setEditedUser({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      country: user.country || '',
      city: user.city || ''
    });
  }, [user]);

  useEffect(() => {
    if (showActivityTab) {
      fetchActivityHistory();
    }
  }, [showActivityTab]);

  const fetchActivityHistory = async () => {
    try {
      setIsLoadingActivity(true);
      const response = await fetch(`/api/admin/users/${user._id}/activity`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setActivityHistory(data.activities || []);
      }
    } catch (error) {
      console.error('Failed to fetch activity history:', error);
    } finally {
      setIsLoadingActivity(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await fetch(`/api/admin/users/${user._id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editedUser)
      });

      if (response.ok) {
        alert('User updated successfully');
        setIsEditing(false);
        onUserUpdated();
      } else {
        const error = await response.json();
        alert(`Failed to update user: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Failed to update user');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisable = async () => {
    if (!window.confirm('Are you sure you want to disable this user account?')) {
      return;
    }

    const reason = prompt('Please provide a reason for disabling:');
    if (!reason) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${user._id}/disable`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        alert('User account disabled successfully');
        onUserUpdated();
        onClose();
      } else {
        const error = await response.json();
        alert(`Failed to disable user: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to disable user:', error);
      alert('Failed to disable user account');
    }
  };

  const handleEnable = async () => {
    try {
      const response = await fetch(`/api/admin/users/${user._id}/enable`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        alert('User account enabled successfully');
        onUserUpdated();
        onClose();
      } else {
        const error = await response.json();
        alert(`Failed to enable user: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to enable user:', error);
      alert('Failed to enable user account');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    const reason = prompt('Please provide a reason for deletion:');
    if (!reason) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${user._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        alert('User deleted successfully');
        onUserUpdated();
        onClose();
      } else {
        const error = await response.json();
        alert(`Failed to delete user: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    }
  };

  const handleSendNotification = async () => {
    const message = prompt('Enter notification message:');
    if (!message) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${user._id}/notify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'Admin Notification',
          message: message
        })
      });

      if (response.ok) {
        alert('Notification sent successfully');
      } else {
        const error = await response.json();
        alert(`Failed to send notification: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
      alert('Failed to send notification');
    }
  };

  const getUserTypeColor = (type) => {
    switch (type) {
      case 'Employee': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Company': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Freelancer': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            {user.profilePicture ? (
              <img
                className="h-16 w-16 rounded-full object-cover"
                src={user.profilePicture}
                alt={user.name}
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                <span className="text-2xl text-gray-600 dark:text-gray-300 font-medium">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user.name}
              </h2>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUserTypeColor(user.type)}`}>
                {user.type}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowActivityTab(false)}
            className={`px-6 py-3 text-sm font-medium ${
              !showActivityTab
                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            User Details
          </button>
          <button
            onClick={() => setShowActivityTab(true)}
            className={`px-6 py-3 text-sm font-medium ${
              showActivityTab
                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Activity History
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!showActivityTab ? (
            /* User Details Tab */
            <div className="space-y-6">
              {/* Status Badges */}
              <div className="flex flex-wrap gap-2">
                {user.isVerified && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Verified
                  </span>
                )}
                {user.isDisabled && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    <Ban className="w-4 h-4 mr-1" />
                    Disabled
                  </span>
                )}
                {user.twoFactorEnabled && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    2FA Enabled
                  </span>
                )}
                {user.isSpecialNeeds && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    Special Needs
                  </span>
                )}
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedUser.email}
                      onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{user.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedUser.phone}
                      onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{user.phone || 'N/A'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Country
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser.country}
                      onChange={(e) => setEditedUser({ ...editedUser, country: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{user.country || 'N/A'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    City
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser.city}
                      onChange={(e) => setEditedUser({ ...editedUser, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{user.city || 'N/A'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Registered
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {format(new Date(user.createdAt), 'PPP')}
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                      ({formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })})
                    </span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Last Login
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {user.lastLogin
                      ? formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true })
                      : 'Never'}
                  </p>
                </div>
              </div>

              {/* Additional Information */}
              {user.type === 'Employee' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Professional Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Specialization
                      </label>
                      <p className="text-gray-900 dark:text-white">{user.specialization || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Experience
                      </label>
                      <p className="text-gray-900 dark:text-white">{user.experience || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {user.type === 'Company' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Company Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Company Name
                      </label>
                      <p className="text-gray-900 dark:text-white">{user.companyName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Industry
                      </label>
                      <p className="text-gray-900 dark:text-white">{user.industry || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Activity History Tab */
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Activity History
              </h3>
              {isLoadingActivity ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Loading activity history...
                </div>
              ) : activityHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No activity history found
                </div>
              ) : (
                <div className="space-y-4">
                  {activityHistory.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.actionType.replace(/_/g, ' ')}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {activity.details}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={handleSendNotification}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Bell className="w-4 h-4" />
                  Send Notification
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedUser({
                      name: user.name || '',
                      email: user.email || '',
                      phone: user.phone || '',
                      country: user.country || '',
                      city: user.city || ''
                    });
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </>
            )}
          </div>

          <div className="flex gap-2">
            {user.isDisabled ? (
              <button
                onClick={handleEnable}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Enable Account
              </button>
            ) : (
              <button
                onClick={handleDisable}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Ban className="w-4 h-4" />
                Disable Account
              </button>
            )}
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;
