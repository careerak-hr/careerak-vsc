/**
 * 🆕 New For You Component
 * مكون قسم "جديد لك" - عرض التوصيات اليومية الجديدة
 * 
 * المتطلبات: 7.2, 7.3 (تحديث يومي، قسم "جديد لك")
 * Task: 12.2 تحديث يومي
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import './NewForYou.css';

const NewForYou = ({ limit = 5 }) => {
  const { language, user } = useApp();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // الترجمات
  const translations = {
    ar: {
      title: 'جديد لك',
      subtitle: 'توصيات مخصصة بناءً على ملفك الشخصي',
      loading: 'جاري التحميل...',
      noRecommendations: 'لا توجد توصيات جديدة حالياً',
      error: 'فشل في تحميل التوصيات',
      retry: 'إعادة المحاولة',
      matchScore: 'نسبة التطابق',
      viewDetails: 'عرض التفاصيل',
      apply: 'تقديم',
      save: 'حفظ',
      reasons: 'لماذا هذه التوصية؟'
    },
    en: {
      title: 'New For You',
      subtitle: 'Personalized recommendations based on your profile',
      loading: 'Loading...',
      noRecommendations: 'No new recommendations at the moment',
      error: 'Failed to load recommendations',
      retry: 'Retry',
      matchScore: 'Match Score',
      viewDetails: 'View Details',
      apply: 'Apply',
      save: 'Save',
      reasons: 'Why this recommendation?'
    },
    fr: {
      title: 'Nouveau pour vous',
      subtitle: 'Recommandations personnalisées basées sur votre profil',
      loading: 'Chargement...',
      noRecommendations: 'Aucune nouvelle recommandation pour le moment',
      error: 'Échec du chargement des recommandations',
      retry: 'Réessayer',
      matchScore: 'Score de correspondance',
      viewDetails: 'Voir les détails',
      apply: 'Postuler',
      save: 'Enregistrer',
      reasons: 'Pourquoi cette recommandation?'
    }
  };

  const t = translations[language] || translations.ar;

  // جلب التوصيات الجديدة
  useEffect(() => {
    fetchNewRecommendations();
  }, [user]);

  const fetchNewRecommendations = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/recommendations/new?limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // تحديد توصية كمشاهدة
  const markAsSeen = async (recommendationId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/recommendations/${recommendationId}/seen`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (err) {
      console.error('Error marking recommendation as seen:', err);
    }
  };

  // معالجة النقر على توصية
  const handleRecommendationClick = (recommendation) => {
    markAsSeen(recommendation._id);
    // يمكن إضافة navigation هنا
  };

  // حالة التحميل
  if (loading) {
    return (
      <section className="new-for-you" aria-labelledby="new-for-you-title">
        <div className="new-for-you-header">
          <h2 id="new-for-you-title">{t.title}</h2>
          <p className="new-for-you-subtitle">{t.subtitle}</p>
        </div>
        <div className="new-for-you-loading">
          <div className="spinner" aria-label={t.loading}></div>
          <p>{t.loading}</p>
        </div>
      </section>
    );
  }

  // حالة الخطأ
  if (error) {
    return (
      <section className="new-for-you" aria-labelledby="new-for-you-title">
        <div className="new-for-you-header">
          <h2 id="new-for-you-title">{t.title}</h2>
          <p className="new-for-you-subtitle">{t.subtitle}</p>
        </div>
        <div className="new-for-you-error">
          <p>{t.error}</p>
          <button onClick={fetchNewRecommendations} className="retry-button">
            {t.retry}
          </button>
        </div>
      </section>
    );
  }

  // لا توجد توصيات
  if (recommendations.length === 0) {
    return (
      <section className="new-for-you" aria-labelledby="new-for-you-title">
        <div className="new-for-you-header">
          <h2 id="new-for-you-title">{t.title}</h2>
          <p className="new-for-you-subtitle">{t.subtitle}</p>
        </div>
        <div className="new-for-you-empty">
          <p>{t.noRecommendations}</p>
        </div>
      </section>
    );
  }

  // عرض التوصيات
  return (
    <section className="new-for-you" aria-labelledby="new-for-you-title">
      <div className="new-for-you-header">
        <h2 id="new-for-you-title">{t.title}</h2>
        <p className="new-for-you-subtitle">{t.subtitle}</p>
      </div>

      <div className="recommendations-grid">
        {recommendations.map((rec) => (
          <article 
            key={rec._id} 
            className="recommendation-card"
            onClick={() => handleRecommendationClick(rec)}
          >
            {/* نسبة التطابق */}
            <div className="match-score">
              <span className="score-label">{t.matchScore}</span>
              <span className="score-value">{rec.score}%</span>
            </div>

            {/* محتوى التوصية */}
            <div className="recommendation-content">
              <h3 className="recommendation-title">
                {rec.itemId?.title || 'Untitled'}
              </h3>
              
              {rec.itemType === 'job' && rec.itemId?.company && (
                <p className="recommendation-company">
                  {rec.itemId.company.name}
                </p>
              )}

              {rec.itemId?.description && (
                <p className="recommendation-description">
                  {rec.itemId.description.substring(0, 100)}...
                </p>
              )}

              {/* أسباب التوصية */}
              {rec.reasons && rec.reasons.length > 0 && (
                <div className="recommendation-reasons">
                  <p className="reasons-title">{t.reasons}</p>
                  <ul className="reasons-list">
                    {rec.reasons.slice(0, 2).map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* أزرار الإجراءات */}
            <div className="recommendation-actions">
              <button className="btn-primary" aria-label={t.apply}>
                {t.apply}
              </button>
              <button className="btn-secondary" aria-label={t.save}>
                {t.save}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default NewForYou;
