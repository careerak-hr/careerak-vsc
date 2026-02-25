import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ChartWidget from './ChartWidget';
import axios from 'axios';

/**
 * RevenueChartWidget Component
 * 
 * Displays revenue trends (conditional - only if revenue tracking is enabled)
 * Requirements: 1.9
 */
const RevenueChartWidget = ({ timeRange: initialTimeRange = 'daily' }) => {
  const [timeRange, setTimeRange] = useState(initialTimeRange);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revenueEnabled, setRevenueEnabled] = useState(false);

  useEffect(() => {
    checkRevenueTracking();
  }, []);

  useEffect(() => {
    if (revenueEnabled) {
      fetchData();
    }
  }, [timeRange, revenueEnabled]);

  const checkRevenueTracking = async () => {
    try {
      // Check if revenue tracking is enabled
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || ''}/api/admin/settings/revenue-tracking`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setRevenueEnabled(response.data.enabled);
    } catch (err) {
      console.error('Error checking revenue tracking:', err);
      setRevenueEnabled(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || ''}/api/admin/statistics/revenue`,
        {
          params: { timeRange },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      const { labels, revenue, bySource } = response.data;

      setChartData({
        labels,
        datasets: [
          {
            label: 'الإيرادات (Revenue)',
            data: revenue,
            borderColor: '#D48161',
            backgroundColor: 'rgba(212, 129, 97, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          }
        ]
      });
    } catch (err) {
      console.error('Error fetching revenue chart data:', err);
      setError('فشل تحميل بيانات الإيرادات');
    } finally {
      setLoading(false);
    }
  };

  if (!revenueEnabled) {
    return null; // Don't render if revenue tracking is disabled
  }

  if (loading) {
    return (
      <div className="chart-widget">
        <div className="chart-widget-header">
          <h3 className="chart-widget-title">إحصائيات الإيرادات</h3>
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
          <h3 className="chart-widget-title">إحصائيات الإيرادات</h3>
        </div>
        <div className="chart-widget-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#D48161' }}>{error}</p>
        </div>
      </div>
    );
  }

  const customOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0
            }).format(value);
          }
        }
      }
    }
  };

  return (
    <ChartWidget
      type="line"
      data={chartData}
      title="إحصائيات الإيرادات (Revenue Statistics)"
      timeRange={timeRange}
      onTimeRangeChange={setTimeRange}
      height={350}
      options={customOptions}
    />
  );
};

RevenueChartWidget.propTypes = {
  timeRange: PropTypes.oneOf(['daily', 'weekly', 'monthly'])
};

export default RevenueChartWidget;
