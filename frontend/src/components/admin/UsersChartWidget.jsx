import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ChartWidget from './ChartWidget';
import axios from 'axios';

/**
 * UsersChartWidget Component
 * 
 * Displays user statistics over time with type distribution
 * Requirements: 1.1, 1.4
 */
const UsersChartWidget = ({ timeRange: initialTimeRange = 'daily' }) => {
  const [timeRange, setTimeRange] = useState(initialTimeRange);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || ''}/api/admin/statistics/users`,
        {
          params: { timeRange },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      const { labels, newUsers, totalUsers, byType } = response.data;

      setChartData({
        labels,
        datasets: [
          {
            label: 'مستخدمون جدد (New Users)',
            data: newUsers,
            borderColor: '#D48161',
            backgroundColor: 'rgba(212, 129, 97, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          },
          {
            label: 'إجمالي المستخدمين (Total Users)',
            data: totalUsers,
            borderColor: '#304B60',
            backgroundColor: 'rgba(48, 75, 96, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          }
        ]
      });
    } catch (err) {
      console.error('Error fetching users chart data:', err);
      setError('فشل تحميل بيانات المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="chart-widget">
        <div className="chart-widget-header">
          <h3 className="chart-widget-title">إحصائيات المستخدمين</h3>
        </div>
        <div className="chart-widget-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-widget">
        <div className="chart-widget-header">
          <h3 className="chart-widget-title">إحصائيات المستخدمين</h3>
        </div>
        <div className="chart-widget-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#D48161' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <ChartWidget
      type="line"
      data={chartData}
      title="إحصائيات المستخدمين (Users Statistics)"
      timeRange={timeRange}
      onTimeRangeChange={setTimeRange}
      height={350}
    />
  );
};

UsersChartWidget.propTypes = {
  timeRange: PropTypes.oneOf(['daily', 'weekly', 'monthly'])
};

export default UsersChartWidget;
