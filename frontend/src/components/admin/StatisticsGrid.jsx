import React, { useState, useEffect, useCallback } from 'react';
import StatisticsWidget from './StatisticsWidget';
import { Users, Briefcase, FileText, BookOpen, Star } from 'lucide-react';
import pusherClient from '../../utils/pusherClient';

/**
 * StatisticsGrid Component
 * 
 * Displays multiple StatisticsWidgets in a grid with:
 * - Auto-refresh every 30 seconds
 * - Real-time updates via Pusher
 * - Loading and error states
 * 
 * Requirements: 2.1-2.9
 */
const StatisticsGrid = ({ apiUrl = '/api/admin/statistics/overview' }) => {
  const [statistics, setStatistics] = useState({
    activeUsers: { current: 0, previous: 0 },
    jobsToday: { current: 0, previous: 0 },
    applicationsToday: { current: 0, previous: 0 },
    enrollmentsToday: { current: 0, previous: 0 },
    reviewsToday: { current: 0, previous: 0 }
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Fetch statistics from API
  const fetchStatistics = useCallback(async () => {
    try {
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('فشل في تحميل الإحصائيات');
      }

      const data = await response.json();
      
      setStatistics({
        activeUsers: {
          current: data.activeUsers || 0,
          previous: data.previousActiveUsers || 0
        },
        jobsToday: {
          current: data.jobsToday || 0,
          previous: data.previousJobsToday || 0
        },
        applicationsToday: {
          current: data.applicationsToday || 0,
          previous: data.previousApplicationsToday || 0
        },
        enrollmentsToday: {
          current: data.enrollmentsToday || 0,
          previous: data.previousEnrollmentsToday || 0
        },
        reviewsToday: {
          current: data.reviewsToday || 0,
          previous: data.previousReviewsToday || 0
        }
      });

      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  // Initial fetch
  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStatistics();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchStatistics]);

  // Pusher real-time updates
  useEffect(() => {
    // Subscribe to statistics updates channel
    const channel = pusherClient.subscribe('admin-statistics');

    // Listen for statistics update events
    channel.bind('statistics-updated', (data) => {
      console.log('Received real-time statistics update:', data);
      
      setStatistics(prevStats => ({
        activeUsers: {
          current: data.activeUsers ?? prevStats.activeUsers.current,
          previous: prevStats.activeUsers.current
        },
        jobsToday: {
          current: data.jobsToday ?? prevStats.jobsToday.current,
          previous: prevStats.jobsToday.current
        },
        applicationsToday: {
          current: data.applicationsToday ?? prevStats.applicationsToday.current,
          previous: prevStats.applicationsToday.current
        },
        enrollmentsToday: {
          current: data.enrollmentsToday ?? prevStats.enrollmentsToday.current,
          previous: prevStats.enrollmentsToday.current
        },
        reviewsToday: {
          current: data.reviewsToday ?? prevStats.reviewsToday.current,
          previous: prevStats.reviewsToday.current
        }
      }));

      setLastUpdate(new Date());
    });

    // Cleanup on unmount
    return () => {
      channel.unbind('statistics-updated');
      pusherClient.unsubscribe('admin-statistics');
    };
  }, []);

  // Format last update time
  const formatLastUpdate = () => {
    if (!lastUpdate) return '';
    
    const now = new Date();
    const diff = Math.floor((now - lastUpdate) / 1000); // seconds
    
    if (diff < 60) return 'الآن';
    if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
    return `منذ ${Math.floor(diff / 3600)} ساعة`;
  };

  return (
    <div className="space-y-4">
      {/* Header with last update time */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          الإحصائيات الفورية
        </h2>
        {lastUpdate && (
          <p className="text-sm text-gray-500">
            آخر تحديث: {formatLastUpdate()}
          </p>
        )}
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatisticsWidget
          title="المستخدمون النشطون"
          value={statistics.activeUsers.current}
          previousValue={statistics.activeUsers.previous}
          icon={Users}
          color="#304B60"
          loading={loading}
          error={error}
        />

        <StatisticsWidget
          title="الوظائف اليوم"
          value={statistics.jobsToday.current}
          previousValue={statistics.jobsToday.previous}
          icon={Briefcase}
          color="#D48161"
          loading={loading}
          error={error}
        />

        <StatisticsWidget
          title="الطلبات اليوم"
          value={statistics.applicationsToday.current}
          previousValue={statistics.applicationsToday.previous}
          icon={FileText}
          color="#304B60"
          loading={loading}
          error={error}
        />

        <StatisticsWidget
          title="التسجيلات اليوم"
          value={statistics.enrollmentsToday.current}
          previousValue={statistics.enrollmentsToday.previous}
          icon={BookOpen}
          color="#D48161"
          loading={loading}
          error={error}
        />

        <StatisticsWidget
          title="التقييمات اليوم"
          value={statistics.reviewsToday.current}
          previousValue={statistics.reviewsToday.previous}
          icon={Star}
          color="#304B60"
          loading={loading}
          error={error}
        />
      </div>

      {/* Refresh indicator */}
      {!loading && !error && (
        <div className="text-center">
          <p className="text-xs text-gray-400">
            التحديث التلقائي كل 30 ثانية
          </p>
        </div>
      )}
    </div>
  );
};

export default StatisticsGrid;
