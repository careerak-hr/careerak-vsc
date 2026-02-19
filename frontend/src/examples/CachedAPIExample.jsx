/**
 * Cached API Integration Example
 * 
 * This example demonstrates how to integrate the stale-while-revalidate
 * caching into React components for the Careerak platform.
 */

import React, { useState, useEffect } from 'react';
import { getCached } from '../services/api';
import { invalidateCache, getCacheStats } from '../utils/apiCache';

// ============================================================================
// Example 1: Simple Component with Cached Data
// ============================================================================

export function JobPostingsExample() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        // Use cached data with 5-minute expiration
        const data = await getCached('/job-postings', {
          maxAge: 5 * 60 * 1000
        });
        setJobs(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) return <div className="text-center p-4">Loading jobs...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Job Postings (Cached)</h2>
      {jobs.map(job => (
        <div key={job.id} className="border p-4 rounded">
          <h3 className="font-semibold">{job.title}</h3>
          <p className="text-gray-600">{job.company}</p>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Example 2: Component with Force Refresh
// ============================================================================

export function NotificationsExample() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async (forceRefresh = false) => {
    try {
      setLoading(true);
      const data = await getCached('/notifications', {
        maxAge: 2 * 60 * 1000, // 2 minutes
        forceRefresh
      });
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleRefresh = () => {
    fetchNotifications(true); // Force refresh
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Notifications</h2>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      {notifications.length === 0 ? (
        <p className="text-gray-500">No notifications</p>
      ) : (
        <div className="space-y-2">
          {notifications.map(notif => (
            <div key={notif.id} className="border-l-4 border-blue-500 p-3 bg-gray-50">
              <p>{notif.message}</p>
              <span className="text-xs text-gray-500">{notif.timestamp}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Example 3: Component with Cache Invalidation
// ============================================================================

export function UserProfileExample({ userId }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getCached(`/users/${userId}`, {
        maxAge: 10 * 60 * 1000 // 10 minutes
      });
      setProfile(data);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const handleUpdate = async (updatedData) => {
    try {
      // Update via API
      await api.put(`/users/${userId}`, updatedData);
      
      // Invalidate cache to force fresh data on next fetch
      invalidateCache(`GET:/users/${userId}`);
      
      // Refresh the profile
      await fetchProfile();
      
      setEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  if (loading) return <div>Loading profile...</div>;
  if (!profile) return <div>Profile not found</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">User Profile</h2>
      
      {editing ? (
        <ProfileEditForm
          profile={profile}
          onSave={handleUpdate}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <div className="space-y-2">
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Role:</strong> {profile.role}</p>
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Example 4: Custom Hook for Cached Data
// ============================================================================

export function useCachedData(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { maxAge = 5 * 60 * 1000, dependencies = [] } = options;

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getCached(url, { maxAge });
        if (mounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [url, maxAge, ...dependencies]);

  const refresh = async () => {
    try {
      setLoading(true);
      const result = await getCached(url, { maxAge, forceRefresh: true });
      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refresh };
}

// Usage of custom hook
export function CoursesExample() {
  const { data: courses, loading, error, refresh } = useCachedData('/courses', {
    maxAge: 15 * 60 * 1000 // 15 minutes
  });

  if (loading) return <div>Loading courses...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Courses (Cached)</h2>
        <button
          onClick={refresh}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses?.map(course => (
          <div key={course.id} className="border p-4 rounded shadow">
            <h3 className="font-semibold">{course.title}</h3>
            <p className="text-sm text-gray-600">{course.description}</p>
            <p className="text-xs text-gray-500 mt-2">Duration: {course.duration}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Example 5: Cache Statistics Dashboard
// ============================================================================

export function CacheStatsExample() {
  const [stats, setStats] = useState(null);

  const refreshStats = () => {
    const cacheStats = getCacheStats();
    setStats(cacheStats);
  };

  useEffect(() => {
    refreshStats();
    const interval = setInterval(refreshStats, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  if (!stats) return <div>Loading stats...</div>;

  const validCount = stats.entries.filter(e => e.isValid).length;
  const staleCount = stats.entries.filter(e => e.isStale).length;

  return (
    <div className="space-y-4 p-4 bg-gray-100 rounded">
      <h3 className="text-xl font-bold">Cache Statistics</h3>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-600">Total Entries</p>
          <p className="text-2xl font-bold">{stats.size}</p>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-600">Valid Entries</p>
          <p className="text-2xl font-bold text-green-600">{validCount}</p>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-600">Stale Entries</p>
          <p className="text-2xl font-bold text-yellow-600">{staleCount}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h4 className="font-semibold mb-2">Cache Entries</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {stats.entries.map((entry, index) => (
            <div key={index} className="text-xs border-b pb-2">
              <p className="font-mono truncate">{entry.key}</p>
              <div className="flex gap-4 text-gray-600">
                <span>Age: {Math.round(entry.age / 1000)}s</span>
                <span className={entry.isValid ? 'text-green-600' : 'text-yellow-600'}>
                  {entry.isValid ? 'Valid' : 'Stale'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Example 6: Complete Page with Multiple Cached Components
// ============================================================================

export function DashboardExample() {
  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">Dashboard (with API Caching)</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <JobPostingsExample />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <NotificationsExample />
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <CoursesExample />
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <CacheStatsExample />
      </div>
    </div>
  );
}

// ============================================================================
// Helper Components
// ============================================================================

function ProfileEditForm({ profile, onSave, onCancel }) {
  const [formData, setFormData] = useState(profile);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />
      </div>
      
      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default {
  JobPostingsExample,
  NotificationsExample,
  UserProfileExample,
  CoursesExample,
  CacheStatsExample,
  DashboardExample,
  useCachedData
};
