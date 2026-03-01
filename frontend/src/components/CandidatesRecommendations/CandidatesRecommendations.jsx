/**
 * 🎯 Candidates Recommendations Component (للشركات)
 * مكون توصيات المرشحين للشركات
 * 
 * Requirements: 3.1, 3.4 (قائمة المرشحين المقترحين + مقارنة المرشحين)
 * Task: 14.5 Candidates Recommendations (للشركات)
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import CandidateComparison from '../CandidateComparison/CandidateComparison';
import './CandidatesRecommendations.css';

const CandidatesRecommendations = ({ jobId }) => {
  const { language, api } = useApp();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const translations = {
    ar: {
      title: 'المرشحون المقترحون',
      subtitle: 'مرشحون مناسبون لوظائفك',
      loading: 'جاري تحميل المرشحين...',
      error: 'حدث خطأ في جلب المرشحين',
      retry: 'إعادة المحاولة',
      matchScore: 'درجة التطابق',
      viewProfile: 'عرض الملف الشخصي',
      compare: 'مقارنة',
      selectToCompare: 'اختر للمقارنة',
      compareSelected: 'مقارنة المحددين',
      clearSelection: 'إلغاء التحديد',
      noCandidates: 'لا يوجد مرشحون متاحون حالياً',
      refresh: 'تحديث',
      skills: 'المهارات',
      experience: 'الخبرة',
      education: 'التعليم',
      location: 'الموقع',
      years: 'سنوات',
      highScore: 'تطابق عالي',
      mediumScore: 'تطابق متوسط',
      lowScore: 'تطابق منخفض',
      totalCandidates: 'إجمالي المرشحين',
      avgScore: 'متوسط الدرجة',
      highScoreCandidates: 'مرشحون بدرجة عالية',
      selectMinTwo: 'اختر مرشحين على الأقل للمقارنة',
      selectMaxFive: 'يمكنك اختيار 5 مرشحين كحد أقصى',
      refreshing: 'جاري التحديث...',
      lastUpdated: 'آخر تحديث',
      contact: 'تواصل',
      invite: 'دعوة للتقديم'
    },
    en: {
      title: 'Recommended Candidates',
      subtitle: 'Candidates suitable for your jobs',
      loading: 'Loading candidates...',
      error: 'Error loading candidates',
      retry: 'Retry',
      matchScore: 'Match Score',
      viewProfile: 'View Profile',
      compare: 'Compare',
      selectToCompare: 'Select to compare',
      compareSelected: 'Compare Selected',
      clearSelection: 'Clear Selection',
      noCandidates: 'No candidates available',
      refresh: 'Refresh',
      skills: 'Skills',
      experience: 'Experience',
      education: 'Education',
      location: 'Location',
      years: 'years',
      highScore: 'High match',
      mediumScore: 'Medium match',
      lowScore: 'Low match',
      totalCandidates: 'Total Candidates',
      avgScore: 'Average Score',
      highScoreCandidates: 'High Score Candidates',
      selectMinTwo: 'Select at least 2 candidates to compare',
      selectMaxFive: 'You can select up to 5 candidates',
      refreshing: 'Refreshing...',
      lastUpdated: 'Last Updated',
      contact: 'Contact',
      invite: 'Invite to Apply'
    },
    fr: {
      title: 'Candidats recommandés',
      subtitle: 'Candidats adaptés à vos emplois',
      loading: 'Chargement des candidats...',
      error: 'Erreur lors du chargement des candidats',
      retry: 'Réessayer',
      matchScore: 'Score de correspondance',
      viewProfile: 'Voir le profil',
      compare: 'Comparer',
      selectToCompare: 'Sélectionner pour comparer',
      compareSelected: 'Comparer la sélection',
      clearSelection: 'Effacer la sélection',
      noCandidates: 'Aucun candidat disponible',
      refresh: 'Actualiser',
      skills: 'Compétences',
      experience: 'Expérience',
      education: 'Éducation',
      location: 'Emplacement',
      years: 'ans',
      highScore: 'Correspondance élevée',
      mediumScore: 'Correspondance moyenne',
      lowScore: 'Faible correspondance',
      totalCandidates: 'Total des candidats',
      avgScore: 'Score moyen',
      highScoreCandidates: 'Candidats à score élevé',
      selectMinTwo: 'Sélectionnez au moins 2 candidats pour comparer',
      selectMaxFive: 'Vous pouvez sélectionner jusqu\'à 5 candidats',
      refreshing: 'Actualisation...',
      lastUpdated: 'Dernière mise à jour',
      contact: 'Contacter',
      invite: 'Inviter à postuler'
    }
  };

  const t = translations[language] || translations.ar;

  useEffect(() => {
    fetchCandidates();
    fetchStats();
  }, [jobId]);

  const fetchCandidates = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const endpoint = jobId 
        ? `/recommendations/candidates/job/${jobId}?refresh=${refresh}`
        : '/recommendations/candidates';

      const response = await api.get(endpoint);

      if (response.data.success) {
        setCandidates(response.data.data || []);
      } else {
        setError(response.data.message || t.error);
      }
    } catch (err) {
      console.error('Error fetching candidates:', err);
      setError(t.error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/recommendations/candidates/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleSelectCandidate = (candidateId) => {
    setSelectedCandidates(prev => {
      if (prev.includes(candidateId)) {
        return prev.filter(id => id !== candidateId);
      } else if (prev.length < 5) {
        return [...prev, candidateId];
      } else {
        alert(t.selectMaxFive);
        return prev;
      }
    });
  };

  const handleCompare = () => {
    if (selectedCandidates.length < 2) {
      alert(t.selectMinTwo);
      return;
    }
    setShowComparison(true);
  };

  const handleClearSelection = () => {
    setSelectedCandidates([]);
  };

  const getScoreColor = (score) => {
    if (score >= 70) return '#4CAF50'; // Green
    if (score >= 40) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const getScoreLabel = (score) => {
    if (score >= 70) return t.highScore;
    if (score >= 40) return t.mediumScore;
    return t.lowScore;
  };

  if (loading) {
    return (
      <div className="candidates-recommendations">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>{t.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="candidates-recommendations">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={() => fetchCandidates()} className="retry-button">
            {t.retry}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="candidates-recommendations">
      <div className="candidates-header">
        <div className="header-content">
          <h2>{t.title}</h2>
          <p className="subtitle">{t.subtitle}</p>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => fetchCandidates(true)} 
            className="refresh-button"
            disabled={refreshing}
          >
            {refreshing ? t.refreshing : t.refresh}
          </button>
        </div>
      </div>

      {stats && (
        <div className="candidates-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.totalCandidates || 0}</div>
            <div className="stat-label">{t.totalCandidates}</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{Math.round(stats.avgScore || 0)}%</div>
            <div className="stat-label">{t.avgScore}</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.highScoreCandidates || 0}</div>
            <div className="stat-label">{t.highScoreCandidates}</div>
          </div>
        </div>
      )}

      {selectedCandidates.length > 0 && (
        <div className="selection-toolbar">
          <span className="selection-count">
            {selectedCandidates.length} {selectedCandidates.length === 1 ? 'مرشح محدد' : 'مرشحين محددين'}
          </span>
          <div className="toolbar-actions">
            <button 
              onClick={handleCompare}
              className="compare-button"
              disabled={selectedCandidates.length < 2}
            >
              {t.compareSelected}
            </button>
            <button 
              onClick={handleClearSelection}
              className="clear-button"
            >
              {t.clearSelection}
            </button>
          </div>
        </div>
      )}

      {candidates.length === 0 ? (
        <div className="empty-state">
          <p>{t.noCandidates}</p>
        </div>
      ) : (
        <div className="candidates-grid">
          {candidates.map((candidate) => {
            const candidateData = candidate.candidate || candidate.itemId || {};
            const score = candidate.score || 0;
            const reasons = candidate.reasons || [];
            const isSelected = selectedCandidates.includes(candidateData._id);

            return (
              <div 
                key={candidateData._id} 
                className={`candidate-card ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelectCandidate(candidateData._id)}
              >
                <div className="candidate-card-header">
                  <div className="candidate-info">
                    {candidateData.profilePicture && (
                      <img 
                        src={candidateData.profilePicture} 
                        alt={candidateData.name}
                        className="candidate-avatar"
                      />
                    )}
                    <div>
                      <h3 className="candidate-name">{candidateData.name}</h3>
                      {candidateData.location && (
                        <p className="candidate-location">{candidateData.location}</p>
                      )}
                    </div>
                  </div>
                  <div className="match-score-badge" style={{ backgroundColor: getScoreColor(score) }}>
                    <div className="score-value">{Math.round(score)}%</div>
                    <div className="score-label">{getScoreLabel(score)}</div>
                  </div>
                </div>

                <div className="candidate-card-body">
                  <div className="candidate-details">
                    {candidateData.skills && candidateData.skills.length > 0 && (
                      <div className="detail-item">
                        <strong>{t.skills}:</strong>
                        <div className="skills-list">
                          {candidateData.skills.slice(0, 5).map((skill, idx) => (
                            <span key={idx} className="skill-tag">{skill}</span>
                          ))}
                          {candidateData.skills.length > 5 && (
                            <span className="skill-tag more">+{candidateData.skills.length - 5}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {candidateData.experience && (
                      <div className="detail-item">
                        <strong>{t.experience}:</strong>
                        <span>{candidateData.experience} {t.years}</span>
                      </div>
                    )}

                    {candidateData.education && (
                      <div className="detail-item">
                        <strong>{t.education}:</strong>
                        <span>{candidateData.education}</span>
                      </div>
                    )}
                  </div>

                  {reasons.length > 0 && (
                    <div className="match-reasons">
                      <ul>
                        {reasons.slice(0, 3).map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="candidate-card-footer">
                  <button 
                    className="action-button view-profile"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `/profile/${candidateData._id}`;
                    }}
                  >
                    {t.viewProfile}
                  </button>
                  <button 
                    className="action-button contact"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle contact action
                    }}
                  >
                    {t.contact}
                  </button>
                  <button 
                    className="action-button invite"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle invite action
                    }}
                  >
                    {t.invite}
                  </button>
                </div>

                {isSelected && (
                  <div className="selection-indicator">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" fill="#4CAF50"/>
                      <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showComparison && (
        <CandidateComparison
          candidateIds={selectedCandidates}
          jobId={jobId}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
};

export default CandidatesRecommendations;
