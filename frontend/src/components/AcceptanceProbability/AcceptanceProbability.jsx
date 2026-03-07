/**
 * Acceptance Probability Component
 * 
 * مكون لعرض احتمالية القبول للوظيفة
 */

import React from 'react';
import './AcceptanceProbability.css';

const AcceptanceProbability = ({ probability, level, factors, matchScore, details, compact = false }) => {
  // تحديد اللون والأيقونة حسب المستوى
  const getLevelConfig = (level) => {
    switch (level) {
      case 'high':
        return {
          label: 'عالية',
          labelEn: 'High',
          color: '#10b981', // أخضر
          icon: '🟢',
          bgColor: 'rgba(16, 185, 129, 0.1)'
        };
      case 'medium':
        return {
          label: 'متوسطة',
          labelEn: 'Medium',
          color: '#f59e0b', // برتقالي
          icon: '🟡',
          bgColor: 'rgba(245, 158, 11, 0.1)'
        };
      case 'low':
        return {
          label: 'منخفضة',
          labelEn: 'Low',
          color: '#ef4444', // أحمر
          icon: '🔴',
          bgColor: 'rgba(239, 68, 68, 0.1)'
        };
      default:
        return {
          label: 'غير محدد',
          labelEn: 'Unknown',
          color: '#6b7280',
          icon: '⚪',
          bgColor: 'rgba(107, 114, 128, 0.1)'
        };
    }
  };

  const config = getLevelConfig(level);

  // العرض المضغوط (للبطاقات)
  if (compact) {
    return (
      <div className="acceptance-probability-compact" style={{ backgroundColor: config.bgColor }}>
        <span className="probability-icon">{config.icon}</span>
        <span className="probability-label" style={{ color: config.color }}>
          احتمالية القبول: {config.label}
        </span>
        <span className="probability-value" style={{ color: config.color }}>
          {probability}%
        </span>
      </div>
    );
  }

  // العرض الكامل (لصفحة تفاصيل الوظيفة)
  return (
    <div className="acceptance-probability-full">
      <div className="probability-header">
        <h3>احتمالية القبول</h3>
        <span className="probability-icon-large">{config.icon}</span>
      </div>

      <div className="probability-main" style={{ backgroundColor: config.bgColor }}>
        <div className="probability-circle" style={{ borderColor: config.color }}>
          <span className="probability-percentage" style={{ color: config.color }}>
            {probability}%
          </span>
          <span className="probability-level" style={{ color: config.color }}>
            {config.label}
          </span>
        </div>

        <div className="probability-description">
          <p>
            {level === 'high' && 'لديك فرصة ممتازة للقبول في هذه الوظيفة! ملفك الشخصي يتطابق بشكل كبير مع المتطلبات.'}
            {level === 'medium' && 'لديك فرصة جيدة للقبول. قد تحتاج إلى تحسين بعض المهارات أو الخبرات.'}
            {level === 'low' && 'فرصة القبول محدودة. ننصحك بتطوير مهاراتك أو البحث عن وظائف أكثر ملاءمة.'}
          </p>
        </div>
      </div>

      {/* العوامل المؤثرة */}
      {factors && factors.length > 0 && (
        <div className="probability-factors">
          <h4>العوامل المؤثرة:</h4>
          <ul>
            {factors.map((factor, index) => (
              <li key={index}>{factor}</li>
            ))}
          </ul>
        </div>
      )}

      {/* التفاصيل */}
      {details && Object.keys(details).length > 0 && (
        <div className="probability-details">
          <h4>التفاصيل:</h4>
          <div className="details-grid">
            {matchScore !== undefined && (
              <div className="detail-item">
                <span className="detail-label">نسبة التطابق:</span>
                <span className="detail-value">{matchScore}%</span>
              </div>
            )}
            {details.skills !== undefined && (
              <div className="detail-item">
                <span className="detail-label">المهارات:</span>
                <span className="detail-value">{details.skills}%</span>
              </div>
            )}
            {details.experience !== undefined && (
              <div className="detail-item">
                <span className="detail-label">الخبرة:</span>
                <span className="detail-value">{details.experience}%</span>
              </div>
            )}
            {details.education !== undefined && (
              <div className="detail-item">
                <span className="detail-label">التعليم:</span>
                <span className="detail-value">{details.education}%</span>
              </div>
            )}
            {details.competition !== undefined && (
              <div className="detail-item">
                <span className="detail-label">المنافسة:</span>
                <span className="detail-value">{details.competition}%</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* نصائح للتحسين */}
      {level !== 'high' && (
        <div className="probability-tips">
          <h4>💡 نصائح للتحسين:</h4>
          <ul>
            {level === 'low' && (
              <>
                <li>قم بتحديث مهاراتك لتتطابق مع متطلبات الوظيفة</li>
                <li>احصل على شهادات أو دورات تدريبية ذات صلة</li>
                <li>ابحث عن وظائف تتطابق أكثر مع خبراتك الحالية</li>
              </>
            )}
            {level === 'medium' && (
              <>
                <li>حسّن المهارات الناقصة من خلال دورات تدريبية</li>
                <li>أضف مشاريع ذات صلة إلى ملفك الشخصي</li>
                <li>اكتب رسالة تغطية قوية تبرز نقاط قوتك</li>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AcceptanceProbability;
