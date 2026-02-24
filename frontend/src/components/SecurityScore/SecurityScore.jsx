import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, AlertCircle, Info, ChevronRight } from 'lucide-react';
import './SecurityScore.css';

/**
 * مكون Security Score
 * يعرض درجة أمان الحساب مع التوصيات
 */
const SecurityScore = ({ compact = false }) => {
  const [securityData, setSecurityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(!compact);

  useEffect(() => {
    fetchSecurityScore();
  }, []);

  const fetchSecurityScore = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('يجب تسجيل الدخول أولاً');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/security-score', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('فشل في جلب Security Score');
      }

      const data = await response.json();
      setSecurityData(data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching security score:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="security-score-container">
        <div className="security-score-loading">
          <div className="spinner"></div>
          <p>جاري حساب Security Score...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="security-score-container">
        <div className="security-score-error">
          <AlertCircle size={24} />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!securityData) {
    return null;
  }

  const { score, maxScore, percentage, level, levelLabel, color, factors, recommendations, tips } = securityData;

  return (
    <div className={`security-score-container ${compact ? 'compact' : ''}`}>
      {/* Header */}
      <div className="security-score-header">
        <div className="header-icon">
          <Shield size={24} style={{ color }} />
        </div>
        <div className="header-content">
          <h3>درجة أمان الحساب</h3>
          <p className="subtitle">Security Score</p>
        </div>
      </div>

      {/* Score Circle */}
      <div className="security-score-circle">
        <svg width="200" height="200" viewBox="0 0 200 200">
          {/* Background Circle */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="12"
          />
          {/* Progress Circle */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeDasharray={`${2 * Math.PI * 80}`}
            strokeDashoffset={`${2 * Math.PI * 80 * (1 - percentage / 100)}`}
            strokeLinecap="round"
            transform="rotate(-90 100 100)"
            className="progress-circle"
          />
        </svg>
        <div className="score-text">
          <div className="score-number">{score}</div>
          <div className="score-max">/ {maxScore}</div>
          <div className="score-level" style={{ color }}>
            {levelLabel}
          </div>
        </div>
      </div>

      {/* Toggle Details Button (في الوضع المضغوط) */}
      {compact && (
        <button
          className="toggle-details-btn"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
          <ChevronRight
            size={16}
            className={`chevron ${showDetails ? 'rotated' : ''}`}
          />
        </button>
      )}

      {/* Details */}
      {showDetails && (
        <>
          {/* Factors */}
          <div className="security-factors">
            <h4>عوامل الأمان</h4>
            <div className="factors-list">
              {factors.map((factor, index) => (
                <div key={index} className="factor-item">
                  <div className="factor-header">
                    <span className="factor-label">{factor.label}</span>
                    <span className="factor-score">
                      {factor.score} / {factor.maxScore}
                    </span>
                  </div>
                  <div className="factor-bar">
                    <div
                      className="factor-progress"
                      style={{
                        width: `${(factor.score / factor.maxScore) * 100}%`,
                        backgroundColor: 
                          factor.status === 'good' ? '#10b981' :
                          factor.status === 'medium' ? '#f59e0b' :
                          factor.status === 'weak' ? '#ef4444' :
                          '#9ca3af'
                      }}
                    />
                  </div>
                  {factor.count !== undefined && (
                    <span className="factor-count">
                      ({factor.count} {factor.name === 'oauth_accounts' ? 'حساب' : ''})
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          {recommendations && recommendations.length > 0 && (
            <div className="security-recommendations">
              <h4>توصيات لتحسين الأمان</h4>
              <div className="recommendations-list">
                {recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className={`recommendation-item priority-${rec.priority}`}
                  >
                    <div className="recommendation-icon">
                      {rec.priority === 'high' ? (
                        <AlertCircle size={20} />
                      ) : rec.priority === 'medium' ? (
                        <Info size={20} />
                      ) : (
                        <CheckCircle size={20} />
                      )}
                    </div>
                    <div className="recommendation-content">
                      <p className="recommendation-message">{rec.message}</p>
                      <span className="recommendation-priority">
                        {rec.priority === 'high' ? 'أولوية عالية' :
                         rec.priority === 'medium' ? 'أولوية متوسطة' :
                         'أولوية منخفضة'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          {tips && tips.length > 0 && (
            <div className="security-tips">
              <h4>نصائح أمنية</h4>
              <div className="tips-list">
                {tips.map((tip, index) => (
                  <div key={index} className="tip-item">
                    <span className="tip-icon">{tip.icon}</span>
                    <span className="tip-text">{tip.tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Refresh Button */}
          <button
            className="refresh-btn"
            onClick={fetchSecurityScore}
            disabled={loading}
          >
            تحديث Security Score
          </button>
        </>
      )}
    </div>
  );
};

export default SecurityScore;
