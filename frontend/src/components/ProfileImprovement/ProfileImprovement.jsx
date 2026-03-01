/**
 * Profile Improvement Component
 * مكون تحسين الملف الشخصي
 * 
 * Features:
 * - عرض درجة اكتمال الملف (0-100%)
 * - قائمة الاقتراحات المرتبة حسب الأولوية
 * - تتبع التقدم بمرور الوقت
 * - دعم متعدد اللغات (ar, en, fr)
 * - تصميم متجاوب
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import './ProfileImprovement.css';

const ProfileImprovement = () => {
  const { user, language } = useApp();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSuggestion, setExpandedSuggestion] = useState(null);

  // الترجمات
  const translations = {
    ar: {
      title: 'تحسين الملف الشخصي',
      completeness: 'درجة الاكتمال',
      strength: 'درجة القوة',
      level: {
        excellent: 'ممتاز',
        good: 'جيد',
        fair: 'مقبول',
        poor: 'ضعيف',
        very_poor: 'ضعيف جداً'
      },
      suggestions: 'اقتراحات التحسين',
      priority: {
        high: 'أولوية عالية',
        medium: 'أولوية متوسطة',
        low: 'أولوية منخفضة'
      },
      impact: 'التأثير المتوقع',
      action: 'الإجراء المطلوب',
      strengths: 'نقاط القوة',
      weaknesses: 'نقاط الضعف',
      noSuggestions: 'رائع! ملفك الشخصي مكتمل',
      loading: 'جاري تحليل ملفك الشخصي...',
      error: 'حدث خطأ أثناء تحليل الملف',
      retry: 'إعادة المحاولة',
      refresh: 'تحديث التحليل',
      details: 'التفاصيل',
      categories: {
        basic: 'معلومات أساسية',
        education: 'التعليم',
        experience: 'الخبرة',
        skills: 'المهارات',
        training: 'التدريب',
        additional: 'معلومات إضافية'
      }
    },
    en: {
      title: 'Profile Improvement',
      completeness: 'Completeness Score',
      strength: 'Strength Score',
      level: {
        excellent: 'Excellent',
        good: 'Good',
        fair: 'Fair',
        poor: 'Poor',
        very_poor: 'Very Poor'
      },
      suggestions: 'Improvement Suggestions',
      priority: {
        high: 'High Priority',
        medium: 'Medium Priority',
        low: 'Low Priority'
      },
      impact: 'Expected Impact',
      action: 'Required Action',
      strengths: 'Strengths',
      weaknesses: 'Weaknesses',
      noSuggestions: 'Great! Your profile is complete',
      loading: 'Analyzing your profile...',
      error: 'An error occurred while analyzing the profile',
      retry: 'Retry',
      refresh: 'Refresh Analysis',
      details: 'Details',
      categories: {
        basic: 'Basic Information',
        education: 'Education',
        experience: 'Experience',
        skills: 'Skills',
        training: 'Training',
        additional: 'Additional Information'
      }
    },
    fr: {
      title: 'Amélioration du Profil',
      completeness: 'Score de Complétude',
      strength: 'Score de Force',
      level: {
        excellent: 'Excellent',
        good: 'Bon',
        fair: 'Acceptable',
        poor: 'Faible',
        very_poor: 'Très Faible'
      },
      suggestions: 'Suggestions d\'Amélioration',
      priority: {
        high: 'Priorité Élevée',
        medium: 'Priorité Moyenne',
        low: 'Priorité Faible'
      },
      impact: 'Impact Attendu',
      action: 'Action Requise',
      strengths: 'Points Forts',
      weaknesses: 'Points Faibles',
      noSuggestions: 'Excellent! Votre profil est complet',
      loading: 'Analyse de votre profil...',
      error: 'Une erreur s\'est produite lors de l\'analyse',
      retry: 'Réessayer',
      refresh: 'Actualiser l\'Analyse',
      details: 'Détails',
      categories: {
        basic: 'Informations de Base',
        education: 'Éducation',
        experience: 'Expérience',
        skills: 'Compétences',
        training: 'Formation',
        additional: 'Informations Supplémentaires'
      }
    }
  };

  const t = translations[language] || translations.en;

  // جلب تحليل الملف الشخصي
  useEffect(() => {
    fetchProfileAnalysis();
  }, [user]);

  const fetchProfileAnalysis = async () => {
    if (!user || !user._id) {
      setError('User not found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/ai/profile-analysis/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile analysis');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      console.error('Error fetching profile analysis:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // الحصول على لون حسب الدرجة
  const getScoreColor = (score) => {
    if (score >= 90) return '#4CAF50'; // أخضر
    if (score >= 75) return '#8BC34A'; // أخضر فاتح
    if (score >= 50) return '#FFC107'; // أصفر
    if (score >= 25) return '#FF9800'; // برتقالي
    return '#F44336'; // أحمر
  };

  // الحصول على لون حسب الأولوية
  const getPriorityColor = (priority) => {
    const colors = {
      high: '#F44336',
      medium: '#FF9800',
      low: '#4CAF50'
    };
    return colors[priority] || '#757575';
  };

  // الحصول على أيقونة حسب الفئة
  const getCategoryIcon = (category) => {
    const icons = {
      basic: '👤',
      education: '🎓',
      experience: '💼',
      skills: '🛠️',
      training: '📚',
      additional: '➕',
      specialization: '🎯',
      interests: '❤️',
      bio: '📝',
      cv: '📄',
      profile: '🖼️',
      languages: '🌍'
    };
    return icons[category] || '📌';
  };

  if (loading) {
    return (
      <div className="profile-improvement loading">
        <div className="loading-spinner"></div>
        <p>{t.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-improvement error">
        <p className="error-message">{t.error}: {error}</p>
        <button onClick={fetchProfileAnalysis} className="retry-button">
          {t.retry}
        </button>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className="profile-improvement">
      {/* Header */}
      <div className="improvement-header">
        <h2>{t.title}</h2>
        <button onClick={fetchProfileAnalysis} className="refresh-button">
          🔄 {t.refresh}
        </button>
      </div>

      {/* Scores Section */}
      <div className="scores-section">
        {/* Completeness Score */}
        <div className="score-card">
          <div className="score-label">{t.completeness}</div>
          <div className="score-circle" style={{ borderColor: getScoreColor(analysis.completenessScore) }}>
            <span className="score-value">{analysis.completenessScore}%</span>
          </div>
          <div className="score-level" style={{ color: getScoreColor(analysis.completenessScore) }}>
            {t.level[analysis.completenessLevel]}
          </div>
        </div>

        {/* Strength Score */}
        <div className="score-card">
          <div className="score-label">{t.strength}</div>
          <div className="score-circle" style={{ borderColor: getScoreColor(analysis.strengthScore) }}>
            <span className="score-value">{analysis.strengthScore}%</span>
          </div>
        </div>
      </div>

      {/* Completeness Details */}
      {analysis.completenessDetails && (
        <div className="completeness-details">
          {Object.entries(analysis.completenessDetails).map(([category, details]) => (
            <div key={category} className="category-detail">
              <div className="category-header">
                <span className="category-icon">{getCategoryIcon(category)}</span>
                <span className="category-name">{t.categories[category]}</span>
              </div>
              <div className="category-progress">
                <div 
                  className="progress-bar" 
                  style={{ 
                    width: `${details.percentage}%`,
                    backgroundColor: getScoreColor(details.percentage)
                  }}
                ></div>
              </div>
              <div className="category-stats">
                {details.filled}/{details.total} ({details.percentage}%)
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Strengths */}
      {analysis.strengths && analysis.strengths.length > 0 && (
        <div className="strengths-section">
          <h3>✅ {t.strengths}</h3>
          <div className="strengths-list">
            {analysis.strengths.map((strength, index) => (
              <div key={index} className="strength-item">
                <div className="strength-icon">{getCategoryIcon(strength.category)}</div>
                <div className="strength-content">
                  <div className="strength-title">{strength.title}</div>
                  <div className="strength-description">{strength.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      <div className="suggestions-section">
        <h3>💡 {t.suggestions}</h3>
        
        {analysis.suggestions && analysis.suggestions.length > 0 ? (
          <div className="suggestions-list">
            {analysis.suggestions.map((suggestion, index) => (
              <div 
                key={index} 
                className={`suggestion-item ${expandedSuggestion === index ? 'expanded' : ''}`}
                onClick={() => setExpandedSuggestion(expandedSuggestion === index ? null : index)}
              >
                <div className="suggestion-header">
                  <div className="suggestion-icon">{getCategoryIcon(suggestion.category)}</div>
                  <div className="suggestion-main">
                    <div className="suggestion-title">{suggestion.title}</div>
                    <div 
                      className="suggestion-priority" 
                      style={{ backgroundColor: getPriorityColor(suggestion.priority) }}
                    >
                      {t.priority[suggestion.priority]}
                    </div>
                  </div>
                  <div className="suggestion-impact">
                    +{suggestion.estimatedImpact}%
                  </div>
                </div>
                
                {expandedSuggestion === index && (
                  <div className="suggestion-details">
                    <p className="suggestion-description">{suggestion.description}</p>
                    <div className="suggestion-action">
                      <strong>{t.action}:</strong> {suggestion.action}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-suggestions">
            <span className="success-icon">🎉</span>
            <p>{t.noSuggestions}</p>
          </div>
        )}
      </div>

      {/* Weaknesses */}
      {analysis.weaknesses && analysis.weaknesses.length > 0 && (
        <div className="weaknesses-section">
          <h3>⚠️ {t.weaknesses}</h3>
          <div className="weaknesses-list">
            {analysis.weaknesses.map((weakness, index) => (
              <div key={index} className="weakness-item">
                <div className="weakness-icon">{getCategoryIcon(weakness.category)}</div>
                <div className="weakness-content">
                  <div className="weakness-title">{weakness.title}</div>
                  <div className="weakness-description">{weakness.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileImprovement;
