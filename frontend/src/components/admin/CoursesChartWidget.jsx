import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ChartWidget from './ChartWidget';
import axios from 'axios';

/**
 * CoursesChartWidget Component
 * 
 * Displays courses and enrollments over time
 * Requirements: 1.3
 */
const CoursesChartWidget = ({ timeRange: initialTimeRange = 'daily' }) => {
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
        `${import.meta.env.VITE_API_URL || ''}/api/admin/statistics/courses`,
        {
          params: { timeRange },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      const { labels, coursesPublished, enrollments, completions } = response.data;

      setChartData({
        labels,
        datasets: [
          {
            label: 'دورات منشورة (Courses Published)',
            data: coursesPublished,
            borderColor: '#D48161',
            backgroundColor: 'rgba(212, 129, 97, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          },
          {
            label: 'تسجيلات (Enrollments)',
            data: enrollments,
            borderColor: '#304B60',
            backgroundColor: 'rgba(48, 75, 96, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          },
          {
            label: 'إكمالات (Completions)',
            data: completions,
            borderColor: '#E3DAD1',
            backgroundColor: 'rgba(227, 218, 209, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          }
        ]
      });
    } catch (err) {
      console.error('Error fetching courses chart data:', err);
      setError('فشل تحميل بيانات الدورات');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="chart-widget">
        <div className="chart-widget-header">
          <h3 className="chart-widget-title">إحصائيات الدورات</h3>
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
          <h3 className="chart-widget-title">إحصائيات الدورات</h3>
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
      title="إحصائيات الدورات (Courses Statistics)"
      timeRange={timeRange}
      onTimeRangeChange={setTimeRange}
      height={350}
    />
  );
};

CoursesChartWidget.propTypes = {
  timeRange: PropTypes.oneOf(['daily', 'weekly', 'monthly'])
};

export default CoursesChartWidget;
