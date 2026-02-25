import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import './ChartWidget.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * ChartWidget Component
 * 
 * Reusable chart component with Chart.js integration
 * Supports line, bar, pie, and doughnut charts
 * 
 * Requirements: 1.1-1.8
 * Properties: 1 (Chart Data Completeness), 2 (Chart Interactivity)
 */
const ChartWidget = ({
  type = 'line',
  data,
  title,
  timeRange = 'daily',
  onTimeRangeChange,
  showTimeRangeSelector = true,
  height = 300,
  options: customOptions = {}
}) => {
  const [hiddenDatasets, setHiddenDatasets] = useState(new Set());

  // Default chart options
  const defaultOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        onClick: (e, legendItem, legend) => {
          const index = legendItem.datasetIndex;
          const chart = legend.chart;
          const meta = chart.getDatasetMeta(index);

          // Toggle visibility
          meta.hidden = !meta.hidden;
          
          // Update hidden datasets state
          setHiddenDatasets(prev => {
            const newSet = new Set(prev);
            if (meta.hidden) {
              newSet.add(index);
            } else {
              newSet.delete(index);
            }
            return newSet;
          });

          chart.update();
        },
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(48, 75, 96, 0.95)',
        titleColor: '#E3DAD1',
        bodyColor: '#E3DAD1',
        borderColor: '#D48161',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          title: (tooltipItems) => {
            return tooltipItems[0].label || '';
          },
          label: (context) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US').format(context.parsed.y);
            }
            return label;
          },
          afterLabel: (context) => {
            // Add percentage for pie/doughnut charts
            if (type === 'pie' || type === 'doughnut') {
              const dataset = context.dataset;
              const total = dataset.data.reduce((acc, val) => acc + val, 0);
              const percentage = ((context.parsed / total) * 100).toFixed(1);
              return `(${percentage}%)`;
            }
            return '';
          }
        }
      },
      title: {
        display: false
      }
    },
    scales: (type === 'line' || type === 'bar') ? {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('en-US').format(value);
          }
        },
        grid: {
          color: 'rgba(48, 75, 96, 0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    } : undefined
  }), [type]);

  // Merge custom options with defaults
  const chartOptions = useMemo(() => {
    return {
      ...defaultOptions,
      ...customOptions,
      plugins: {
        ...defaultOptions.plugins,
        ...(customOptions.plugins || {})
      }
    };
  }, [defaultOptions, customOptions]);

  // Apply hidden datasets to chart data
  const processedData = useMemo(() => {
    if (!data || !data.datasets) return data;

    return {
      ...data,
      datasets: data.datasets.map((dataset, index) => ({
        ...dataset,
        hidden: hiddenDatasets.has(index)
      }))
    };
  }, [data, hiddenDatasets]);

  // Render appropriate chart type
  const renderChart = () => {
    if (!processedData || !processedData.labels || !processedData.datasets) {
      return (
        <div className="chart-no-data">
          <p>لا توجد بيانات لعرضها</p>
          <p className="text-sm">No data available</p>
        </div>
      );
    }

    const chartProps = {
      data: processedData,
      options: chartOptions,
      height
    };

    switch (type) {
      case 'line':
        return <Line {...chartProps} />;
      case 'bar':
        return <Bar {...chartProps} />;
      case 'pie':
        return <Pie {...chartProps} />;
      case 'doughnut':
        return <Doughnut {...chartProps} />;
      default:
        return <Line {...chartProps} />;
    }
  };

  return (
    <div className="chart-widget">
      <div className="chart-widget-header">
        <h3 className="chart-widget-title">{title}</h3>
        
        {showTimeRangeSelector && onTimeRangeChange && (
          <div className="chart-time-range-selector">
            <button
              className={`time-range-btn ${timeRange === 'daily' ? 'active' : ''}`}
              onClick={() => onTimeRangeChange('daily')}
              aria-label="عرض البيانات اليومية"
            >
              يومي
            </button>
            <button
              className={`time-range-btn ${timeRange === 'weekly' ? 'active' : ''}`}
              onClick={() => onTimeRangeChange('weekly')}
              aria-label="عرض البيانات الأسبوعية"
            >
              أسبوعي
            </button>
            <button
              className={`time-range-btn ${timeRange === 'monthly' ? 'active' : ''}`}
              onClick={() => onTimeRangeChange('monthly')}
              aria-label="عرض البيانات الشهرية"
            >
              شهري
            </button>
          </div>
        )}
      </div>

      <div className="chart-widget-body" style={{ height: `${height}px` }}>
        {renderChart()}
      </div>
    </div>
  );
};

ChartWidget.propTypes = {
  type: PropTypes.oneOf(['line', 'bar', 'pie', 'doughnut']),
  data: PropTypes.shape({
    labels: PropTypes.arrayOf(PropTypes.string).isRequired,
    datasets: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string,
      data: PropTypes.arrayOf(PropTypes.number).isRequired,
      backgroundColor: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string)
      ]),
      borderColor: PropTypes.string,
      borderWidth: PropTypes.number
    })).isRequired
  }).isRequired,
  title: PropTypes.string.isRequired,
  timeRange: PropTypes.oneOf(['daily', 'weekly', 'monthly']),
  onTimeRangeChange: PropTypes.func,
  showTimeRangeSelector: PropTypes.bool,
  height: PropTypes.number,
  options: PropTypes.object
};

export default ChartWidget;
