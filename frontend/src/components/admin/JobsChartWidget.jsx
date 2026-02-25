import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ChartWidget from './ChartWidget';
import axios from 'axios';

/**
 * JobsChartWidget Component
 * 
 * Displays job postings and applications over time
 * Requirements: 1.2
 */
const JobsChartWidget = ({ timeRange: initialTimeRange = 'daily' }) => {
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
        `${import.meta.env.VITE_API_URL || ''}/api/admin/statistics/jobs`,
        {
          params: { timeRange },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      const { labels, jobsPosted, applications } = response.data;

      setChartData({
        labels,
        datasets: [
          {
            label: 'وظائف منشورة (Jobs Posted)',
            data: jobsPosted,
            backgroundColor: 'rgba(212, 129, 97, 0.8)',
            borderColor: '#D48161',
            borderWidth: 2
          },
          {
            label: 'طلبات التوظيف (Applications)',
            data: applications,
            backgroundColor: 'rgba(48, 75, 96, 0.8)',
            borderColor: '#304B60',
            borderWidth: 2
          }
        ]
      });
    } catch (err) {
      console.error('Error fetching jobs chart data:', err);
      setError('فشل تحميل بيانات الوظائف');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="chart-widget">
        <div className="chart-widget-header">
          <h3 className="chart-widget-title">إحصائيات الوظائف</h3>
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
          <h3 className="chart-widget-title">إحصائيات الوظائف</h3>
        </div>
        <div className="chart-widget-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#D48161' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <ChartWidget
      type="bar"
      data={chartData}
      title="إحصائيات الوظائف (Jobs Statistics)"
      timeRange={timeRange}
      onTimeRangeChange={setTimeRange}
      height={350}
    />
  );
};

JobsChartWidget.propTypes = {
  timeRange: PropTypes.oneOf(['daily', 'weekly', 'monthly'])
};

export default JobsChartWidget;
