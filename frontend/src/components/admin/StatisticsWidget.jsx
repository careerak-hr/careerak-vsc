import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * StatisticsWidget Component
 * 
 * Displays a single statistic with:
 * - Icon
 * - Value
 * - Growth rate with trend indicator
 * - Color coding (green for up, red for down)
 * - Loading and error states
 * 
 * Requirements: 2.1-2.9
 */
const StatisticsWidget = ({
  title,
  value,
  previousValue,
  icon: Icon,
  color = '#304B60',
  loading = false,
  error = null,
  format = 'number', // 'number', 'percentage', 'currency'
  className = ''
}) => {
  // Calculate growth rate
  const calculateGrowthRate = () => {
    if (previousValue === 0 || previousValue === null || previousValue === undefined) {
      return value > 0 ? 100 : 0;
    }
    return ((value - previousValue) / previousValue) * 100;
  };

  const growthRate = calculateGrowthRate();
  const isPositive = growthRate > 0;
  const isNegative = growthRate < 0;
  const isStable = growthRate === 0;

  // Format value based on type
  const formatValue = (val) => {
    if (val === null || val === undefined) return '—';
    
    switch (format) {
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'currency':
        return `$${val.toLocaleString()}`;
      default:
        return val.toLocaleString();
    }
  };

  // Get trend icon and color
  const getTrendIcon = () => {
    if (isPositive) return <TrendingUp className="w-4 h-4" />;
    if (isNegative) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (isPositive) return 'text-green-600';
    if (isNegative) return 'text-red-600';
    return 'text-gray-600';
  };

  // Loading state
  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 w-8 bg-gray-200 rounded"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          {Icon && <Icon className="w-8 h-8 text-gray-400" />}
        </div>
        <div className="text-red-600 text-sm">
          <p>خطأ في تحميل البيانات</p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow ${className}`}>
      {/* Header with title and icon */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {Icon && (
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="w-6 h-6" style={{ color }} />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-2">
        <p className="text-3xl font-bold text-gray-900">
          {formatValue(value)}
        </p>
      </div>

      {/* Growth rate with trend indicator */}
      <div className="flex items-center gap-1">
        <span className={`flex items-center gap-1 ${getTrendColor()}`}>
          {getTrendIcon()}
          <span className="text-sm font-medium">
            {Math.abs(growthRate).toFixed(1)}%
          </span>
        </span>
        <span className="text-xs text-gray-500">
          مقارنة بالفترة السابقة
        </span>
      </div>
    </div>
  );
};

export default StatisticsWidget;
