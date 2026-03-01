import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import './RecommendationsDashboard.css';

/**
 * RecommendationsDashboard Component
 * Displays 10-20 recommended jobs daily with match scores and explanations
 * 
 * ✅ دعم كامل للعربية والإنجليزية والفرنسية
 * 
 * Validates: Requirements 1.1, 1.3, 1.4
 * Task: 14.1 Recommendations Dashboard
 */
const RecommendationsDashboard = () => {
  const { language, user, api } = useApp();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch recommendations from API
  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call the recommendations API
      const response = await api.get('/recommendations/jobs', {
        params: {
          limit: 20, // Display 10-20 jobs as per requirement
          minScore: 0.5 // Minimum match score of 50%
        }
      });

      if (response.data.success) {
        setRecommendations(response.data.recommendations || []);
        setLastUpdated(new Date());
        
        // Store in localStorage for daily refresh tracking
        localStorage.setItem('recommendations_last_fetch', new Date().toISOString());
        localStorage.setItem('recommendations_data', JSON.stringify(response.data.recommendations || []));
      } else {
        setError(response.data.message || 'Failed to fetch recommendations');
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('حدث خطأ في جلب التوصيات. يرجى المحاولة مرة أخرى.');
      
      // Try to load from localStorage as fallback
      try {
        const cachedData = localStorage.getItem('recommendations_data');
        if (cachedData) {
          setRecommendations(JSON.parse(cachedData));
        }
      } catch (cacheErr) {
        console.error('Error loading cached recommendations:', cacheErr);
      }
    } finally {
      setLoading(false);
    }
  };

  // Check if we need to refresh recommendations (daily)
  const shouldRefreshRecommendations = () => {
    const lastFetch = localStorage.getItem('recommendations_last_fetch');
    if (!lastFetch) return true;
    
    const lastFetchDate = new Date(lastFetch);
    const now = new Date();
    const hoursDiff = (now - lastFetchDate) / (1000 * 60 * 60);
    
    // Refresh if more than 24 hours have passed
    return hoursDiff >= 24;
  };

  // Handle user interaction with a recommendation
  const handleInteraction = async (jobId, action) => {
    try {
      await api.post('/recommendations/feedback', {
        jobId,
        action,
        timestamp: new Date().toISOString()
      });
      
      // Update local state to reflect interaction
      setRecommendations(prev => 
        prev.map(rec => 
          rec.job?._id === jobId 
            ? { ...rec, userAction: action }
            : rec
        )
      );
    } catch (err) {
      console.error('Error recording interaction:', err);
    }
  };

  // Initialize component
  useEffect(() => {
    if (user && api) {
      if (shouldRefreshRecommendations()) {
        fetchRecommendations();
      } else {
        // Load from cache
        try {
          const cachedData = localStorage.getItem('recommendations_data');
          if (cachedData) {
            setRecommendations(JSON.parse(cachedData));
          }
          setLoading(false);
        } catch (err) {
          console.error('Error loading cached data:', err);
          fetchRecommendations();
        }
      }
    }
  }, [user, api]);

  // Translations
  const translations = {
    ar: {
      title: 'وظائف مقترحة لك',
      subtitle: 'وظائف تناسب مهاراتك وخبراتك',
      loading: 'جاري تحميل التوصيات...',
      error: 'حدث خطأ في جلب التوصيات',
      retry: 'إعادة المحاولة',
      matchScore: 'نسبة التطابق',
      reasons: 'أسباب التوصية',
      apply: 'تقديم',
      save: 'حفظ',
      ignore: 'تجاهل',
      viewDetails: 'عرض التفاصيل',
      lastUpdated: 'آخر تحديث',
      noRecommendations: 'لا توجد توصيات متاحة حالياً',
      refresh: 'تحديث التوصيات',
      dailyLimit: 'عرض 10-20 وظيفة مقترحة يومياً'
    },
    en: {
      title: 'Recommended Jobs for You',
      subtitle: 'Jobs that match your skills and experience',
      loading: 'Loading recommendations...',
      error: 'Error loading recommendations',
      retry: 'Retry',
      matchScore: 'Match Score',
      reasons: 'Recommendation Reasons',
      apply: 'Apply',
      save: 'Save',
      ignore: 'Ignore',
      viewDetails: 'View Details',
      lastUpdated: 'Last Updated',
      noRecommendations: 'No recommendations available',
      refresh: 'Refresh Recommendations',
      dailyLimit: 'Displaying 10-20 recommended jobs daily'
    },
    fr: {
      title: 'Emplois recommandés pour vous',
      subtitle: 'Emplois correspondant à vos compétences et expérience',
      loading: 'Chargement des recommandations...',
      error: 'Erreur lors du chargement des recommandations',
      retry: 'Réessayer',
      matchScore: 'Score de correspondance',
      reasons: 'Raisons de la recommandation',
      apply: 'Postuler',
      save: 'Enregistrer',
      ignore: 'Ignorer',
      viewDetails: 'Voir les détails',
      lastUpdated: 'Dernière mise à jour',
      noRecommendations: 'Aucune recommandation disponible',
      refresh: 'Actualiser les recommandations',
      dailyLimit: 'Affichage de 10-20 emplois recommandés quotidiennement'
    }
  };

  const t = translations[language] || translations.ar;

  // Format match score as percentage
  const formatMatchScore = (score) => {
    if (typeof score === 'object' && score.percentage !== undefined) {
      return `${Math.round(score.percentage)}%`;
    }
    if (typeof score === 'number') {
      return `${Math.round(score)}%`;
    }
    return '0%';
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString(language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US');
  };

  // Limit recommendations to 10-20 as per requirement
  const limitedRecommendations = recommendations.slice(0, 20);

  return (
    <div className="recommendations-dashboard" role="region" aria-labelledby="recommendations-title">
      <div className="recommendations-header">
        <h2 id="recommendations-title" className="recommendations-title">
          {t.title}
        </h2>
        <p className="recommendations-subtitle">
          {t.subtitle}
        </p>
        <div className="recommendations-meta">
          <span className="daily-limit-badge">
            {t.dailyLimit}
          </span>
          {lastUpdated && (
            <span className="last-updated">
              {t.lastUpdated}: {formatDate(lastUpdated)}
            </span>
          )}
          <button 
            className="refresh-button"
            onClick={fetchRecommendations}
            aria-label={t.refresh}
            disabled={loading}
          >
            {t.refresh}
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading-state" role="status" aria-live="polite">
          <div className="loading-spinner"></div>
          <p>{t.loading}</p>
        </div>
      )}

      {error && !loading && (
        <div className="error-state" role="alert">
          <p>{error}</p>
          <button 
            className="retry-button"
            onClick={fetchRecommendations}
            aria-label={t.retry}
          >
            {t.retry}
          </button>
        </div>
      )}

      {!loading && !error && limitedRecommendations.length === 0 && (
        <div className="empty-state" role="status" aria-live="polite">
          <p>{t.noRecommendations}</p>
        </div>
      )}

      {!loading && !error && limitedRecommendations.length > 0 && (
        <div className="recommendations-grid">
          {limitedRecommendations.map((recommendation, index) => {
            const job = recommendation.job || {};
            const matchScore = recommendation.matchScore || recommendation.score || 0;
            const reasons = recommendation.reasons || recommendation.aiAnalysis?.reasons || [];
            
            return (
              <div 
                key={job._id || index} 
                className="recommendation-card"
                role="article"
                aria-labelledby={`job-title-${index}`}
              >
                <div className="recommendation-card-header">
                  <h3 id={`job-title-${index}`} className="job-title">
                    {job.title || 'Untitled Job'}
                  </h3>
                  <div className="match-score">
                    <span className="score-label">{t.matchScore}:</span>
                    <span className="score-value">{formatMatchScore(matchScore)}</span>
                    <div 
                      className="score-bar"
                      role="progressbar"
                      aria-valuenow={typeof matchScore === 'object' ? matchScore.percentage : matchScore}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    >
                      <div 
                        className="score-fill"
                        style={{ 
                          width: `${typeof matchScore === 'object' ? matchScore.percentage : matchScore}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="recommendation-card-body">
                  <div className="job-details">
                    {job.postedBy?.companyName && (
                      <p className="company-name">
                        <strong>الشركة:</strong> {job.postedBy.companyName}
                      </p>
                    )}
                    {job.location && (
                      <p className="job-location">
                        <strong>الموقع:</strong> {job.location}
                      </p>
                    )}
                    {job.salaryRange && (
                      <p className="job-salary">
                        <strong>الراتب:</strong> {job.salaryRange}
                      </p>
                    )}
                  </div>

                  {reasons.length > 0 && (
                    <div className="recommendation-reasons">
                      <h4 className="reasons-title">{t.reasons}:</h4>
                      <ul className="reasons-list">
                        {reasons.slice(0, 3).map((reason, reasonIndex) => (
                          <li key={reasonIndex} className="reason-item">
                            {typeof reason === 'string' ? reason : reason.message || reason.reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="recommendation-actions">
                    <button
                      className="action-button apply-button"
                      onClick={() => handleInteraction(job._id, 'apply')}
                      aria-label={`${t.apply} لهذه الوظيفة`}
                    >
                      {t.apply}
                    </button>
                    <button
                      className="action-button save-button"
                      onClick={() => handleInteraction(job._id, 'save')}
                      aria-label={`${t.save} هذه الوظيفة`}
                    >
                      {t.save}
                    </button>
                    <button
                      className="action-button view-button"
                      onClick={() => handleInteraction(job._id, 'view')}
                      aria-label={`${t.viewDetails} لهذه الوظيفة`}
                    >
                      {t.viewDetails}
                    </button>
                    <button
                      className="action-button ignore-button"
                      onClick={() => handleInteraction(job._id, 'ignore')}
                      aria-label={`${t.ignore} هذه الوظيفة`}
                    >
                      {t.ignore}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && !error && limitedRecommendations.length > 0 && (
        <div className="recommendations-footer">
          <p className="recommendations-count">
            عرض {Math.min(limitedRecommendations.length, 20)} من أصل {recommendations.length} توصية
          </p>
          <p className="recommendations-note">
            يتم تحديث التوصيات تلقائياً كل 24 ساعة. يمكنك تحديثها يدوياً في أي وقت.
          </p>
        </div>
      )}
    </div>
  );
};

export default RecommendationsDashboard;