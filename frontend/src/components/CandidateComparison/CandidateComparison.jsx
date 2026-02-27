/**
 * 🎯 Candidate Side-by-Side Comparison Component
 * مكون مقارنة المرشحين جنباً إلى جنب
 * 
 * Requirements: 3.4 (مقارنة جنباً إلى جنب - side-by-side)
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import './CandidateComparison.css';

const CandidateComparison = ({ candidateIds, jobId, onClose }) => {
  const { language } = useApp();
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const translations = {
    ar: {
      title: 'مقارنة المرشحين',
      loading: 'جاري تحميل المقارنة...',
      error: 'حدث خطأ أثناء تحميل المقارنة',
      close: 'إغلاق',
      candidate: 'مرشح',
      matchScore: 'درجة التطابق',
      confidence: 'الثقة',
      skills: 'المهارات',
      experience: 'الخبرة',
      education: 'التعليم',
      location: 'الموقع',
      training: 'التدريب',
      languages: 'اللغات',
      strengths: 'نقاط القوة',
      weaknesses: 'نقاط الضعف',
      overallAssessment: 'التقييم العام',
      topCandidate: 'أفضل مرشح',
      keyDifferences: 'الفروقات الرئيسية',
      recommendations: 'التوصيات',
      years: 'سنوات',
      courses: 'دورات',
      hasCertificates: 'لديه شهادات',
      noCertificates: 'لا يوجد شهادات',
      highImpact: 'تأثير عالي',
      mediumImpact: 'تأثير متوسط',
      lowImpact: 'تأثير منخفض'
    },
    en: {
      title: 'Candidate Comparison',
      loading: 'Loading comparison...',
      error: 'Error loading comparison',
      close: 'Close',
      candidate: 'Candidate',
      matchScore: 'Match Score',
      confidence: 'Confidence',
      skills: 'Skills',
      experience: 'Experience',
      education: 'Education',
      location: 'Location',
      training: 'Training',
      languages: 'Languages',
      strengths: 'Strengths',
      weaknesses: 'Weaknesses',
      overallAssessment: 'Overall Assessment',
      topCandidate: 'Top Candidate',
      keyDifferences: 'Key Differences',
      recommendations: 'Recommendations',
      years: 'years',
      courses: 'courses',
      hasCertificates: 'Has certificates',
      noCertificates: 'No certificates',
      highImpact: 'High impact',
      mediumImpact: 'Medium impact',
      lowImpact: 'Low impact'
    },
    fr: {
      title: 'Comparaison des candidats',
      loading: 'Chargement de la comparaison...',
      error: 'Erreur lors du chargement de la comparaison',
      close: 'Fermer',
      candidate: 'Candidat',
      matchScore: 'Score de correspondance',
      confidence: 'Confiance',
      skills: 'Compétences',
      experience: 'Expérience',
      education: 'Éducation',
      location: 'Emplacement',
      training: 'Formation',
      languages: 'Langues',
      strengths: 'Points forts',
      weaknesses: 'Points faibles',
      overallAssessment: 'Évaluation globale',
      topCandidate: 'Meilleur candidat',
      keyDifferences: 'Différences clés',
      recommendations: 'Recommandations',
      years: 'ans',
      courses: 'cours',
      hasCertificates: 'A des certificats',
      noCertificates: 'Pas de certificats',
      highImpact: 'Impact élevé',
      mediumImpact: 'Impact moyen',
      lowImpact: 'Faible impact'
    }
  };

  const t = translations[language] || translations.ar;

  useEffect(() => {
    fetchComparison();
  }, [candidateIds, jobId]);

  const fetchComparison = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/recommendations/candidates/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          candidateIds,
          jobId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch comparison');
      }

      const data = await response.json();
      setComparison(data.data);
    } catch (err) {
      console.error('Error fetching comparison:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return '#4CAF50'; // Green
    if (score >= 40) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const getImpactBadge = (impact) => {
    const colors = {
      high: '#F44336',
      medium: '#FF9800',
      low: '#4CAF50'
    };
    
    const labels = {
      high: t.highImpact,
      medium: t.mediumImpact,
      low: t.lowImpact
    };

    return (
      <span 
        className="impact-badge" 
        style={{ backgroundColor: colors[impact] }}
      >
        {labels[impact]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="comparison-modal">
        <div className="comparison-content">
          <div className="loading-spinner">{t.loading}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="comparison-modal">
        <div className="comparison-content">
          <div className="error-message">{t.error}: {error}</div>
          <button onClick={onClose} className="close-btn">{t.close}</button>
        </div>
      </div>
    );
  }

  if (!comparison) return null;

  const { comparisonTable, analysis } = comparison;

  return (
    <div className="comparison-modal">
      <div className="comparison-content">
        <div className="comparison-header">
          <h2>{t.title}</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        {/* Top Candidate */}
        {analysis.topCandidate && (
          <div className="top-candidate-section">
            <h3>{t.topCandidate}</h3>
            <div className="top-candidate-card">
              <h4>{analysis.topCandidate.name}</h4>
              <div className="score-badge" style={{ backgroundColor: getScoreColor(analysis.topCandidate.score) }}>
                {analysis.topCandidate.score}%
              </div>
              <ul>
                {analysis.topCandidate.reasons.map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Comparison Table */}
        <div className="comparison-table-container">
          <table className="comparison-table">
            <thead>
              <tr>
                <th className="category-column">Category</th>
                {comparisonTable.basicInfo.map((candidate, idx) => (
                  <th key={idx}>
                    <div className="candidate-header">
                      {candidate.profileImage && (
                        <img src={candidate.profileImage} alt={candidate.name} />
                      )}
                      <div>
                        <div className="candidate-name">{candidate.name}</div>
                        <div className="candidate-location">{candidate.location}</div>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Match Scores */}
              <tr className="section-header">
                <td colSpan={comparisonTable.basicInfo.length + 1}>{t.matchScore}</td>
              </tr>
              <tr>
                <td>{t.matchScore}</td>
                {comparisonTable.matchScores.map((score, idx) => (
                  <td key={idx}>
                    <div className="score-cell" style={{ color: getScoreColor(score.totalScore) }}>
                      <strong>{score.totalScore}%</strong>
                      <div className="confidence">({t.confidence}: {score.confidence}%)</div>
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <td>{t.skills}</td>
                {comparisonTable.matchScores.map((score, idx) => (
                  <td key={idx}>{Math.round(score.breakdown.skills)}%</td>
                ))}
              </tr>
              <tr>
                <td>{t.experience}</td>
                {comparisonTable.matchScores.map((score, idx) => (
                  <td key={idx}>{Math.round(score.breakdown.experience)}%</td>
                ))}
              </tr>
              <tr>
                <td>{t.education}</td>
                {comparisonTable.matchScores.map((score, idx) => (
                  <td key={idx}>{Math.round(score.breakdown.education)}%</td>
                ))}
              </tr>

              {/* Skills */}
              <tr className="section-header">
                <td colSpan={comparisonTable.basicInfo.length + 1}>{t.skills}</td>
              </tr>
              <tr>
                <td>Total {t.skills}</td>
                {comparisonTable.skills.map((skill, idx) => (
                  <td key={idx}>{skill.totalSkills}</td>
                ))}
              </tr>
              <tr>
                <td>Match %</td>
                {comparisonTable.skills.map((skill, idx) => (
                  <td key={idx}>{skill.skillsMatchPercentage}%</td>
                ))}
              </tr>

              {/* Experience */}
              <tr className="section-header">
                <td colSpan={comparisonTable.basicInfo.length + 1}>{t.experience}</td>
              </tr>
              <tr>
                <td>{t.years}</td>
                {comparisonTable.experience.map((exp, idx) => (
                  <td key={idx}>{exp.totalYears} {t.years}</td>
                ))}
              </tr>

              {/* Education */}
              <tr className="section-header">
                <td colSpan={comparisonTable.basicInfo.length + 1}>{t.education}</td>
              </tr>
              <tr>
                <td>Highest Level</td>
                {comparisonTable.education.map((edu, idx) => (
                  <td key={idx}>{edu.highestLevel}</td>
                ))}
              </tr>

              {/* Training */}
              <tr className="section-header">
                <td colSpan={comparisonTable.basicInfo.length + 1}>{t.training}</td>
              </tr>
              <tr>
                <td>{t.courses}</td>
                {comparisonTable.training.map((train, idx) => (
                  <td key={idx}>
                    {train.totalCourses} {t.courses}
                    <br />
                    {train.hasCertificates ? t.hasCertificates : t.noCertificates}
                  </td>
                ))}
              </tr>

              {/* Languages */}
              <tr className="section-header">
                <td colSpan={comparisonTable.basicInfo.length + 1}>{t.languages}</td>
              </tr>
              <tr>
                <td>Total</td>
                {comparisonTable.languages.map((lang, idx) => (
                  <td key={idx}>{lang.totalLanguages}</td>
                ))}
              </tr>

              {/* Strengths */}
              <tr className="section-header">
                <td colSpan={comparisonTable.basicInfo.length + 1}>{t.strengths}</td>
              </tr>
              <tr>
                <td>Total</td>
                {comparisonTable.strengths.map((str, idx) => (
                  <td key={idx}>
                    {str.total} ({str.highImpact} {t.highImpact})
                  </td>
                ))}
              </tr>

              {/* Weaknesses */}
              <tr className="section-header">
                <td colSpan={comparisonTable.basicInfo.length + 1}>{t.weaknesses}</td>
              </tr>
              <tr>
                <td>Total</td>
                {comparisonTable.weaknesses.map((weak, idx) => (
                  <td key={idx}>
                    {weak.total} ({weak.highImpact} {t.highImpact})
                  </td>
                ))}
              </tr>

              {/* Overall Assessment */}
              <tr className="section-header">
                <td colSpan={comparisonTable.basicInfo.length + 1}>{t.overallAssessment}</td>
              </tr>
              <tr>
                <td>Assessment</td>
                {comparisonTable.overallAssessment.map((assess, idx) => (
                  <td key={idx}>
                    <strong>{assess.assessment}</strong>
                    <br />
                    <small>{assess.recommendation}</small>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Key Differences */}
        {analysis.keyDifferences && analysis.keyDifferences.length > 0 && (
          <div className="key-differences-section">
            <h3>{t.keyDifferences}</h3>
            <ul>
              {analysis.keyDifferences.map((diff, idx) => (
                <li key={idx}>
                  <strong>{diff.category}:</strong> {diff.description}
                  <br />
                  <small>Advantage: {diff.advantage}</small>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <div className="recommendations-section">
            <h3>{t.recommendations}</h3>
            <ul>
              {analysis.recommendations.map((rec, idx) => (
                <li key={idx} className={`priority-${rec.priority}`}>
                  <strong>{rec.suggestion}</strong>
                  <br />
                  <small>{rec.action}</small>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="comparison-footer">
          <button onClick={onClose} className="close-btn-large">{t.close}</button>
        </div>
      </div>
    </div>
  );
};

export default CandidateComparison;
