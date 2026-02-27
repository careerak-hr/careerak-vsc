/**
 * 🆕 New For You Component
 * مكون "جديد لك" - عرض التوصيات اليومية الجديدة
 * 
 * المتطلبات: 7.3 (قسم "جديد لك")
 * Task: 12.2 تحديث يومي
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import axios from 'axios';
import './NewForYou.css';

const NewForYou = () => {
  const { language, fontFamily } = useApp();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // الترجمات
  const translations = {
    ar: {
      title: 'جديد لك',
      subtitle: 'توصيات وظائف جديدة تم توليدها خصيصاً لك اليوم',
      noRecommendations: 'لا توجد توصيات جديدة حالياً',
      noRecommendationsDesc: 'سيتم تحديث التوصيات يومياً بناءً على ملفك الشخصي',
      matchScore: 'نسبة التطابق',
      viewJob: 'عرض الوظيفة',
      apply: 'تقديم',
      loading: 'جاري تحميل التوصيات الجديدة...',
      error: 'فشل في تحميل التوصيات',
      retry: 'إعادة المحاولة',
      generatedToday: 'تم التوليد اليوم',
      reasons: 'لماذا هذه الوظيفة؟'
    },
    en: {
      title: 'New For You',
      subtitle: 'Fresh job recommendations generated just for you today',
      noRecommendations: 'No new recommendations available',
      noRecommendationsDesc: 'Recommendations will be updated daily based on your profile',
      matchScore: 'Match Score',
      viewJob: 'View Job',
      apply: 'Apply',
      loading: 'Loading new recommendations...',
      error: 'Failed to load recommendations',
      retry: 'Retry',
      generatedToday: 'Generated Today',
      reasons: 'Why this job?'
    },
    fr: {
      title: 'Nouveau pour vous',
      subtitle: 'Nouvelles recommandations d\'emploi générées spécialement pour vous aujourd\'hui',
      noRecommendations: 'Aucune nouvelle recommandation disponible',
      noRecommendationsDesc: 'Les recommandations seront mises à jour quotidiennement en fonction de votre profil',
      matchScore: 'Score de correspondance',
      viewJob: 'Voir l\'emploi',
      apply: 'Postuler',
      loading: 'Chargement des nouvelles recommandations...',
      error: 'Échec du chargement des recommandations',
      retry: 'Réessayer',
      generatedToday: 'Généré aujourd\'hui',
      reasons: 'Pourquoi cet emploi?'
    }
  };

  const t = translations[language] || translations.ar;

  useEffect(() => {
    fetchNewRecommendations();
  }, []);

  const fetchNewRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/recommendations/new`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 10 }
        }
      );

      if (response.data.success) {
        setRecommendations(response.data.recommendations);
      }

    } catch (err) {
      console.error('Error fetching new recommendations:', err);
      setError(err.response?.data?.message || t.error);
    } finally {
      setLoading(false);
    }
  };

  const markAsSeen = async (recommendationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/recommendations/${recommendationId}/seen`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
    } catch (err) {
      console.error('Error marking recommendation as seen:', err);
    }
  };

  const handleViewJob = (recommendation) => {
    // تحديد كمشاهدة
    markAsSeen(recommendation._id);
    
    // الانتقال إلى صفحة الوظيفة
    window.location.href = `/job/${recommendation.job._id}`;
  };

  const handleApply = (recommendation) => {
    // تحديد كمشاهدة
    markAsSeen(recommendation._id);
    
    // الانتقال إلى صفحة التقديم
    window.location.href = `/apply/${recommendation.job._id}`;
  };

  if (loading) {
    return (
      <div className="new-for-you-container" style={{ fontFamily }}>
        <div className="new-for-you-loading">
          <div className="spinner"></div>
          <p>{t.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="new-for-you-container" style={{ fontFamily }}>
        <div className="new-for-you-error">
          <p>{error}</p>
          <button onClick={fetchNewRecommendations} className="retry-button">
            {t.retry}
          </button>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="new-for-you-container" style={{ fontFamily }}>
        <div className="new-for-you-header">
          <h2 className="new-for-you-title">🆕 {t.title}</h2>
          <p className="new-for-you-subtitle">{t.subtitle}</p>
        </div>
        <div className="new-for-you-empty">
          <div className="empty-icon">📭</div>
          <h3>{t.noRecommendations}</h3>
          <p>{t.noRecommendationsDesc}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="new-for-you-container" style={{ fontFamily }}>
      <div className="new-for-you-header">
        <h2 className="new-for-you-title">🆕 {t.title}</h2>
        <p className="new-for-you-subtitle">{t.subtitle}</p>
        <span className="generated-badge">✨ {t.generatedToday}</span>
      </div>

      <div className="recommendations-grid">
        {recommendations.map((rec) => (
          <div key={rec._id} className="recommendation-card">
            {/* Badge "جديد" */}
            <div className="new-badge">NEW</div>

            {/* معلومات الوظيفة */}
            <div className="job-info">
              <h3 className="job-title">{rec.job.title}</h3>
              <p className="company-name">
                {rec.job.postedBy?.companyName || 'شركة'}
              </p>
              <p className="job-location">
                📍 {rec.job.location || 'غير محدد'}
              </p>
            </div>

            {/* نسبة التطابق */}
            <div className="match-score-container">
              <div className="match-score-label">{t.matchScore}</div>
              <div className="match-score-value">
                {rec.matchScore.percentage}%
              </div>
              <div className="match-score-bar">
                <div 
                  className="match-score-fill"
                  style={{ width: `${rec.matchScore.percentage}%` }}
                ></div>
              </div>
            </div>

            {/* أسباب التوصية */}
            {rec.reasons && rec.reasons.length > 0 && (
              <div className="reasons-container">
                <h4 className="reasons-title">{t.reasons}</h4>
                <ul className="reasons-list">
                  {rec.reasons.slice(0, 2).map((reason, index) => (
                    <li key={index} className={`reason-item reason-${reason.strength}`}>
                      <span className="reason-icon">
                        {reason.strength === 'high' ? '⭐' : 
                         reason.strength === 'medium' ? '✓' : '•'}
                      </span>
                      <span className="reason-text">{reason.message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* الأزرار */}
            <div className="card-actions">
              <button 
                onClick={() => handleViewJob(rec)}
                className="view-button"
              >
                {t.viewJob}
              </button>
              <button 
                onClick={() => handleApply(rec)}
                className="apply-button"
              >
                {t.apply}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewForYou;
