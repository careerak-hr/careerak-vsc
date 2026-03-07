import React from 'react';
import PropTypes from 'prop-types';
import './SalaryIndicator.css';

/**
 * مكون عرض تقدير الراتب مع نطاق السوق
 * يعرض الراتب المعروض، متوسط السوق، والنطاق (الأدنى - الأعلى)
 * مع مؤشر بصري ملون حسب المقارنة
 */
const SalaryIndicator = ({ estimate, currency = 'ريال' }) => {
  if (!estimate || !estimate.market) {
    return null;
  }

  // تكوين الألوان والأيقونات حسب المقارنة
  const config = {
    below: {
      color: '#ef4444',
      icon: '🔴',
      label: 'أقل من المتوسط',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700'
    },
    average: {
      color: '#f59e0b',
      icon: '🟡',
      label: 'متوسط السوق',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-700'
    },
    above: {
      color: '#10b981',
      icon: '🟢',
      label: 'أعلى من المتوسط',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700'
    }
  };

  const { color, icon, label, bgColor, borderColor, textColor } = 
    config[estimate.comparison] || config.average;

  // تنسيق الأرقام مع فواصل
  const formatNumber = (num) => {
    if (!num && num !== 0) return '-';
    return new Intl.NumberFormat('ar-SA').format(Math.round(num));
  };

  return (
    <div className={`salary-indicator ${bgColor} ${borderColor}`}>
      {/* العنوان */}
      <div className="salary-indicator-header">
        <span className="salary-indicator-title">تقدير الراتب</span>
        <span className="salary-indicator-icon" role="img" aria-label={label}>
          {icon}
        </span>
      </div>

      {/* محتوى التقدير */}
      <div className="salary-indicator-content">
        {/* الراتب المعروض */}
        <div className="salary-row">
          <span className="salary-label">الراتب المعروض:</span>
          <span className="salary-value salary-value-bold">
            {formatNumber(estimate.provided)} {currency}
          </span>
        </div>

        {/* متوسط السوق */}
        <div className="salary-row">
          <span className="salary-label">متوسط السوق:</span>
          <span className="salary-value">
            {formatNumber(estimate.market.average)} {currency}
          </span>
        </div>

        {/* نطاق الراتب (الأدنى - الأعلى) */}
        <div className="salary-row salary-row-range">
          <span className="salary-label">النطاق:</span>
          <span className="salary-value salary-range">
            {formatNumber(estimate.market.min)} - {formatNumber(estimate.market.max)} {currency}
          </span>
        </div>

        {/* عدد الوظائف المستخدمة في الحساب */}
        {estimate.market.count && (
          <div className="salary-row salary-row-count">
            <span className="salary-label-small">
              بناءً على {estimate.market.count} وظيفة مشابهة
            </span>
          </div>
        )}

        {/* التقييم النهائي */}
        <div className="salary-assessment">
          <span className={`salary-assessment-label ${textColor}`} style={{ color }}>
            {label}
            {estimate.percentageDiff > 0 && ` (${estimate.percentageDiff}%)`}
          </span>
        </div>
      </div>

      {/* Tooltip للمعلومات الإضافية */}
      <div className="salary-indicator-tooltip">
        <p className="tooltip-text">
          يتم حساب تقدير الراتب بناءً على الوظائف المشابهة في نفس المجال والموقع ومستوى الخبرة.
          النطاق يمثل الحد الأدنى والأعلى للرواتب في السوق.
        </p>
      </div>
    </div>
  );
};

SalaryIndicator.propTypes = {
  estimate: PropTypes.shape({
    provided: PropTypes.number.isRequired,
    market: PropTypes.shape({
      average: PropTypes.number.isRequired,
      min: PropTypes.number.isRequired,
      max: PropTypes.number.isRequired,
      count: PropTypes.number
    }).isRequired,
    comparison: PropTypes.oneOf(['below', 'average', 'above']).isRequired,
    percentageDiff: PropTypes.number
  }),
  currency: PropTypes.string
};

export default SalaryIndicator;
