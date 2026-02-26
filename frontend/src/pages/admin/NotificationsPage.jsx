import React, { useState, useEffect } from 'react';
import { Bell, Filter, Check, Settings, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

/**
 * NotificationsPage Component
 * 
 * Full-page view of all notifications with filtering and preferences.
 * Requirements: 6.11, 6.12
 */
const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'all',
    priority: 'all',
    isRead: 'all'
  });
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    enabledTypes: [],
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchNotifications();
    fetchPreferences();
  }, [page]);

  useEffect(() => {
    applyFilters();
  }, [notifications, filters]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/notifications?page=${page}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/admin/notifications/preferences', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...notifications];

    if (filters.type !== 'all') {
      filtered = filtered.filter(n => n.type === filters.type);
    }

    if (filters.priority !== 'all') {
      filtered = filtered.filter(n => n.priority === filters.priority);
    }

    if (filters.isRead !== 'all') {
      const isRead = filters.isRead === 'read';
      filtered = filtered.filter(n => n.isRead === isRead);
    }

    setFilteredNotifications(filtered);
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/admin/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
        );
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/admin/notifications/mark-all-read', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const updatePreferences = async (newPreferences) => {
    try {
      const response = await fetch('/api/admin/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newPreferences)
      });

      if (response.ok) {
        setPreferences(newPreferences);
        setShowPreferences(false);
      }
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 border-red-500 text-red-900';
      case 'high': return 'bg-orange-100 border-orange-500 text-orange-900';
      case 'medium': return 'bg-yellow-100 border-yellow-500 text-yellow-900';
      case 'low': return 'bg-blue-100 border-blue-500 text-blue-900';
      default: return 'bg-gray-100 border-gray-500 text-gray-900';
    }
  };

  const notificationTypes = [
    'user_registered',
    'job_posted',
    'course_published',
    'review_flagged',
    'content_reported',
    'suspicious_activity',
    'system_error'
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Bell className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Notifications
              </h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Check className="w-4 h-4" />
                Mark All as Read
              </button>
              <button
                onClick={() => setShowPreferences(!showPreferences)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Preferences
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Types</option>
                {notificationTypes.map(type => (
                  <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={filters.isRead}
                onChange={(e) => setFilters({ ...filters, isRead: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>
          </div>
        </div>

        {/* Preferences Modal */}
        {showPreferences && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 max-w-2xl w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Notification Preferences
                </h2>
                <button
                  onClick={() => setShowPreferences(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Enabled Notification Types
                  </h3>
                  <div className="space-y-2">
                    {notificationTypes.map(type => (
                      <label key={type} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={preferences.enabledTypes.includes(type)}
                          onChange={(e) => {
                            const newTypes = e.target.checked
                              ? [...preferences.enabledTypes, type]
                              : preferences.enabledTypes.filter(t => t !== type);
                            setPreferences({ ...preferences, enabledTypes: newTypes });
                          }}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-gray-700 dark:text-gray-300">
                          {type.replace(/_/g, ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Quiet Hours
                  </h3>
                  <label className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={preferences.quietHours.enabled}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        quietHours: { ...preferences.quietHours, enabled: e.target.checked }
                      })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      Enable quiet hours
                    </span>
                  </label>

                  {preferences.quietHours.enabled && (
                    <div className="flex gap-4 ml-6">
                      <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                          Start
                        </label>
                        <input
                          type="time"
                          value={preferences.quietHours.start}
                          onChange={(e) => setPreferences({
                            ...preferences,
                            quietHours: { ...preferences.quietHours, start: e.target.value }
                          })}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                          End
                        </label>
                        <input
                          type="time"
                          value={preferences.quietHours.end}
                          onChange={(e) => setPreferences({
                            ...preferences,
                            quietHours: { ...preferences.quietHours, end: e.target.value }
                          })}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    onClick={() => setShowPreferences(false)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => updatePreferences(preferences)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          {isLoading ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              Loading notifications...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              No notifications found
            </div>
          ) : (
            <>
              {filteredNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-6 border-b border-gray-200 dark:border-gray-700 last:border-b-0 ${
                    !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(
                            notification.priority
                          )}`}
                        >
                          {notification.priority}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {notification.type.replace(/_/g, ' ')}
                        </span>
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {notification.title}
                      </h3>

                      <p className="text-gray-600 dark:text-gray-300 mb-3">
                        {notification.message}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>
                          {formatDistanceToNow(new Date(notification.timestamp), {
                            addSuffix: true
                          })}
                        </span>
                        {notification.actionUrl && (
                          <a
                            href={notification.actionUrl}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                          >
                            View Details →
                          </a>
                        )}
                      </div>
                    </div>

                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification._id)}
                        className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                      >
                        <Check className="w-4 h-4" />
                        Mark as Read
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-gray-700 dark:text-gray-300">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
