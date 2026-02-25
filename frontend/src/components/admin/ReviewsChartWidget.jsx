import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ChartWidget from './ChartWidget';
import axios from 'axios';

/**
 * ReviewsChartWidget Component
 * 
 * Displays reviews and ratings trends
 * Requirements: 1.5
 */
const ReviewsChartWidget = ({ timeRange: initialTimeRange = 'daily' }) => {
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
        `${import.meta.env.VITE_API_URL || ''}/api/admin/statistics/reviews`,
        {
          params: { timeRange },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      const { labels, reviewCount, averageRating, flaggedCount } = response.data;

      setChartData({
        labels,
        datasets: [
          {
            label: 'عدد التقييمات (Review Count)',
            data: reviewCount,
            borderColor: '#D48161',
            backgroundColor: 'rgba(212, 129, 97, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            yAxisID: 'y'
          },
          {
            label: 'متوسط التقييم (Average Rating)',
            data: averageRating,
            borderColor: '#304B60',
            backgroundColor: 'rgba(48, 75, 96, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            yAxisID: 'y1'
          }
        ]
      });
    } catch (err) {
      console.error('Error fetching reviews chart data:', err);
      setError('فشل تحميل بيانات التقييمات');
    } finally {
      setLoading(false);
    }
  };

  const customOptions = {
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'عدد التقييمات'
        },
        beginAtZero: true
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'متوسط التقييم'
        },
        min: 0,
        max: 5,
        grid: {
          drawOnChartArea: false
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="chart-widget">
        <div className="chart-widget-header">
          <h3 className="chart-widget-title">إحصائيات التقييمات</h3>
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
          <h3 className="chart-widget-title">إحصائيات التقييمات</h3>
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
      title="إحصائيات التقييمات (Reviews Statistics)"
      timeRange={timeRange}
      onTimeRangeChange={setTimeRange}
      height={350}
      options={customOptions}
    />
  );
};

ReviewsChartWidget.propTypes = {
  timeRange: PropTypes.oneOf(['daily', 'weekly', 'monthly'])
};

export default ReviewsChartWidget;
