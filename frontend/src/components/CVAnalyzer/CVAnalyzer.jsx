/**
 * CV Analyzer Component
 * مكون تحليل السيرة الذاتية بالذكاء الاصطناعي
 * Requirements: 4.1, 4.3
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import './CVAnalyzer.css';

const CVAnalyzer = () => {
  const { language } = useApp();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, skills, experience, education, suggestions

  // الترجمات
  const translations = {
    ar: {
      title: 'تحليل السيرة الذاتية بالذكاء الاصطناعي',
      subtitle: 'احصل على تحليل شامل لسيرتك الذاتية مع اقتراحات للتحسين',
      uploadTitle: 'رفع السيرة الذاتية',
      uploadDesc: 'اسحب وأفلت الملف هنا أو انقر للاختيار',
      supportedFormats: 'الصيغ المدعومة: PDF, DOCX, TXT',
      maxSize: 'الحد الأقصى: 5 ميجابايت',
      selectFile: 'اختر ملف',
      analyzing: 'جاري التحليل...',
      analyze: 'تحليل',
      cancel: 'إلغاء',
      // Tabs
      overview: 'نظرة عامة',
      skills: 'المهارات',
      experience: 'الخبرات',
      education: 'التعليم',
      suggestions: 'الاقتراحات',
      // Overview
      qualityScore: 'درجة الجودة',
      rating: 'التقييم',
      totalSkills: 'إجمالي المهارات',
      totalExperience: 'إجمالي الخبرة',
      years: 'سنوات',
      totalEducation: 'المؤهلات',
      // Quality Ratings
      excellent: 'ممتاز',
      good: 'جيد',
      average: 'متوسط',
      poor: 'ضعيف',
      // Scores
      completeness: 'الاكتمال',
      clarity: 'الوضوح',
      relevance: 'الملاءمة',
      formatting: 'التنسيق',
      keywords: 'الكلمات المفتاحية',
      // Skills
      technicalSkills: 'المهارات التقنية',
      softSkills: 'المهارات الشخصية',
      languages: 'اللغات',
      // Experience
      position: 'المنصب',
      company: 'الشركة',
      duration: 'المدة',
      current: 'حالياً',
      // Education
      degree: 'الدرجة',
      institution: 'المؤسسة',
      field: 'التخصص',
      // Suggestions
      improvementSuggestions: 'اقتراحات التحسين',
      priority: 'الأولوية',
      high: 'عالية',
      medium: 'متوسطة',
      low: 'منخفضة',
      impact: 'التأثير المتوقع',
      // Strengths & Weaknesses
      strengths: 'نقاط القوة',
      weaknesses: 'نقاط الضعف',
      // Errors
      errorTitle: 'حدث خطأ',
      errorUploading: 'فشل رفع الملف',
      errorAnalyzing: 'فشل تحليل السيرة الذاتية',
      tryAgain: 'حاول مرة أخرى',
      // File validation
      invalidFileType: 'نوع الملف غير مدعوم',
      fileTooLarge: 'حجم الملف كبير جداً',
    },
    en: {
      title: 'AI-Powered CV Analysis',
      subtitle: 'Get comprehensive analysis of your CV with improvement suggestions',
      uploadTitle: 'Upload CV',
      uploadDesc: 'Drag and drop your file here or click to select',
      supportedFormats: 'Supported formats: PDF, DOCX, TXT',
      maxSize: 'Max size: 5 MB',
      selectFile: 'Select File',
      analyzing: 'Analyzing...',
      analyze: 'Analyze',
      cancel: 'Cancel',
      // Tabs
      overview: 'Overview',
      skills: 'Skills',
      experience: 'Experience',
      education: 'Education',
      suggestions: 'Suggestions',
      // Overview
      qualityScore: 'Quality Score',
      rating: 'Rating',
      totalSkills: 'Total Skills',
      totalExperience: 'Total Experience',
      years: 'years',
      totalEducation: 'Education',
      // Quality Ratings
      excellent: 'Excellent',
      good: 'Good',
      average: 'Average',
      poor: 'Poor',
      // Scores
      completeness: 'Completeness',
      clarity: 'Clarity',
      relevance: 'Relevance',
      formatting: 'Formatting',
      keywords: 'Keywords',
      // Skills
      technicalSkills: 'Technical Skills',
      softSkills: 'Soft Skills',
      languages: 'Languages',
      // Experience
      position: 'Position',
      company: 'Company',
      duration: 'Duration',
      current: 'Current',
      // Education
      degree: 'Degree',
      institution: 'Institution',
      field: 'Field',
      // Suggestions
      improvementSuggestions: 'Improvement Suggestions',
      priority: 'Priority',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      impact: 'Expected Impact',
      // Strengths & Weaknesses
      strengths: 'Strengths',
      weaknesses: 'Weaknesses',
      // Errors
      errorTitle: 'Error',
      errorUploading: 'Failed to upload file',
      errorAnalyzing: 'Failed to analyze CV',
      tryAgain: 'Try Again',
      // File validation
      invalidFileType: 'Invalid file type',
      fileTooLarge: 'File too large',
    },
    fr: {
      title: 'Analyse CV par IA',
      subtitle: 'Obtenez une analyse complète de votre CV avec des suggestions d\'amélioration',
      uploadTitle: 'Télécharger CV',
      uploadDesc: 'Glissez-déposez votre fichier ici ou cliquez pour sélectionner',
      supportedFormats: 'Formats supportés: PDF, DOCX, TXT',
      maxSize: 'Taille max: 5 Mo',
      selectFile: 'Sélectionner',
      analyzing: 'Analyse en cours...',
      analyze: 'Analyser',
      cancel: 'Annuler',
      // Tabs
      overview: 'Aperçu',
      skills: 'Compétences',
      experience: 'Expérience',
      education: 'Formation',
      suggestions: 'Suggestions',
      // Overview
      qualityScore: 'Score de qualité',
      rating: 'Évaluation',
      totalSkills: 'Compétences totales',
      totalExperience: 'Expérience totale',
      years: 'ans',
      totalEducation: 'Formation',
      // Quality Ratings
      excellent: 'Excellent',
      good: 'Bon',
      average: 'Moyen',
      poor: 'Faible',
      // Scores
      completeness: 'Complétude',
      clarity: 'Clarté',
      relevance: 'Pertinence',
      formatting: 'Formatage',
      keywords: 'Mots-clés',
      // Skills
      technicalSkills: 'Compétences techniques',
      softSkills: 'Compétences personnelles',
      languages: 'Langues',
      // Experience
      position: 'Poste',
      company: 'Entreprise',
      duration: 'Durée',
      current: 'Actuel',
      // Education
      degree: 'Diplôme',
      institution: 'Institution',
      field: 'Domaine',
      // Suggestions
      improvementSuggestions: 'Suggestions d\'amélioration',
      priority: 'Priorité',
      high: 'Haute',
      medium: 'Moyenne',
      low: 'Basse',
      impact: 'Impact attendu',
      // Strengths & Weaknesses
      strengths: 'Points forts',
      weaknesses: 'Points faibles',
      // Errors
      errorTitle: 'Erreur',
      errorUploading: 'Échec du téléchargement',
      errorAnalyzing: 'Échec de l\'analyse',
      tryAgain: 'Réessayer',
      // File validation
      invalidFileType: 'Type de fichier invalide',
      fileTooLarge: 'Fichier trop volumineux',
    },
  };

  const t = translations[language] || translations.ar;

  // معالجة اختيار الملف
  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  // معالجة السحب والإفلات
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // التحقق من صحة الملف
  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;

    // التحقق من نوع الملف
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError(t.invalidFileType);
      return;
    }

    // التحقق من حجم الملف (5 MB)
    const maxSize = 5 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError(t.fileTooLarge);
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  // تحليل السيرة الذاتية
  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('cv', file);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/cv/improvement-suggestions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || t.errorAnalyzing);
      }

      setAnalysis(result.data);
      setActiveTab('overview');
    } catch (err) {
      console.error('Error analyzing CV:', err);
      setError(err.message || t.errorAnalyzing);
    } finally {
      setLoading(false);
    }
  };

  // إعادة تعيين
  const handleReset = () => {
    setFile(null);
    setAnalysis(null);
    setError(null);
    setActiveTab('overview');
  };

  // الحصول على لون التقييم
  const getRatingColor = (rating) => {
    const colors = {
      excellent: '#4CAF50',
      good: '#8BC34A',
      average: '#FFC107',
      poor: '#F44336',
    };
    return colors[rating] || '#9E9E9E';
  };

  // الحصول على لون الأولوية
  const getPriorityColor = (priority) => {
    const colors = {
      high: '#F44336',
      medium: '#FFC107',
      low: '#4CAF50',
    };
    return colors[priority] || '#9E9E9E';
  };

  return (
    <div className="cv-analyzer">
      <div className="cv-analyzer-header">
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </div>

      {!analysis ? (
        // Upload Section
        <div className="cv-upload-section">
          <div
            className="cv-upload-area"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="cv-upload-icon">📄</div>
            <h3>{t.uploadTitle}</h3>
            <p>{t.uploadDesc}</p>
            <p className="cv-upload-formats">{t.supportedFormats}</p>
            <p className="cv-upload-size">{t.maxSize}</p>

            <input
              type="file"
              id="cv-file-input"
              accept=".pdf,.docx,.txt"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <label htmlFor="cv-file-input" className="cv-upload-button">
              {t.selectFile}
            </label>

            {file && (
              <div className="cv-selected-file">
                <span>✓ {file.name}</span>
                <button onClick={() => setFile(null)}>✕</button>
              </div>
            )}
          </div>

          {error && (
            <div className="cv-error-message">
              <span>⚠️ {error}</span>
            </div>
          )}

          {file && !error && (
            <div className="cv-analyze-actions">
              <button
                className="cv-analyze-button"
                onClick={handleAnalyze}
                disabled={loading}
              >
                {loading ? t.analyzing : t.analyze}
              </button>
              <button
                className="cv-cancel-button"
                onClick={handleReset}
                disabled={loading}
              >
                {t.cancel}
              </button>
            </div>
          )}
        </div>
      ) : (
        // Analysis Results
        <div className="cv-analysis-results">
          {/* Tabs */}
          <div className="cv-tabs">
            <button
              className={`cv-tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              {t.overview}
            </button>
            <button
              className={`cv-tab ${activeTab === 'skills' ? 'active' : ''}`}
              onClick={() => setActiveTab('skills')}
            >
              {t.skills}
            </button>
            <button
              className={`cv-tab ${activeTab === 'experience' ? 'active' : ''}`}
              onClick={() => setActiveTab('experience')}
            >
              {t.experience}
            </button>
            <button
              className={`cv-tab ${activeTab === 'education' ? 'active' : ''}`}
              onClick={() => setActiveTab('education')}
            >
              {t.education}
            </button>
            <button
              className={`cv-tab ${activeTab === 'suggestions' ? 'active' : ''}`}
              onClick={() => setActiveTab('suggestions')}
            >
              {t.suggestions}
            </button>
          </div>

          {/* Tab Content */}
          <div className="cv-tab-content">
            {activeTab === 'overview' && (
              <OverviewTab analysis={analysis} t={t} getRatingColor={getRatingColor} />
            )}
            {activeTab === 'skills' && (
              <SkillsTab skills={analysis.parsed.skills} t={t} />
            )}
            {activeTab === 'experience' && (
              <ExperienceTab experience={analysis.parsed.experience} t={t} />
            )}
            {activeTab === 'education' && (
              <EducationTab education={analysis.parsed.education} t={t} />
            )}
            {activeTab === 'suggestions' && (
              <SuggestionsTab improvements={analysis.improvements} t={t} getPriorityColor={getPriorityColor} />
            )}
          </div>

          {/* Reset Button */}
          <div className="cv-reset-section">
            <button className="cv-reset-button" onClick={handleReset}>
              {t.tryAgain}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ analysis, t, getRatingColor }) => {
  const { quality, parsed, stats } = analysis;

  return (
    <div className="cv-overview">
      {/* Quality Score */}
      <div className="cv-quality-card">
        <div className="cv-quality-score">
          <div
            className="cv-score-circle"
            style={{ borderColor: getRatingColor(quality.rating) }}
          >
            <span className="cv-score-value">{quality.overallScore}</span>
            <span className="cv-score-max">/100</span>
          </div>
          <div className="cv-score-info">
            <h3>{t.qualityScore}</h3>
            <p style={{ color: getRatingColor(quality.rating) }}>
              {t[quality.rating]}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="cv-stats-grid">
        <div className="cv-stat-card">
          <div className="cv-stat-icon">🎯</div>
          <div className="cv-stat-info">
            <h4>{parsed.skills?.length || 0}</h4>
            <p>{t.totalSkills}</p>
          </div>
        </div>
        <div className="cv-stat-card">
          <div className="cv-stat-icon">💼</div>
          <div className="cv-stat-info">
            <h4>{parsed.totalExperience || 0}</h4>
            <p>{t.totalExperience} ({t.years})</p>
          </div>
        </div>
        <div className="cv-stat-card">
          <div className="cv-stat-icon">🎓</div>
          <div className="cv-stat-info">
            <h4>{parsed.education?.length || 0}</h4>
            <p>{t.totalEducation}</p>
          </div>
        </div>
      </div>

      {/* Detailed Scores */}
      <div className="cv-detailed-scores">
        <h3>{t.rating}</h3>
        <div className="cv-scores-list">
          {Object.entries(quality.scores).map(([key, value]) => (
            <div key={key} className="cv-score-item">
              <div className="cv-score-label">{t[key]}</div>
              <div className="cv-score-bar">
                <div
                  className="cv-score-fill"
                  style={{ width: `${value}%` }}
                ></div>
              </div>
              <div className="cv-score-number">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Skills Tab Component
const SkillsTab = ({ skills, t }) => {
  return (
    <div className="cv-skills">
      <div className="cv-skills-grid">
        {skills && skills.length > 0 ? (
          skills.map((skill, index) => (
            <div key={index} className="cv-skill-tag">
              {skill}
            </div>
          ))
        ) : (
          <p className="cv-empty-message">No skills found</p>
        )}
      </div>
    </div>
  );
};

// Experience Tab Component
const ExperienceTab = ({ experience, t }) => {
  return (
    <div className="cv-experience">
      {experience && experience.length > 0 ? (
        experience.map((exp, index) => (
          <div key={index} className="cv-experience-card">
            <div className="cv-experience-header">
              <h3>{exp.position || exp.title}</h3>
              {exp.current && (
                <span className="cv-current-badge">{t.current}</span>
              )}
            </div>
            {exp.company && (
              <p className="cv-experience-company">
                <span className="cv-icon">🏢</span> {exp.company}
              </p>
            )}
            {(exp.startDate || exp.endDate) && (
              <p className="cv-experience-duration">
                <span className="cv-icon">📅</span>
                {exp.startDate} - {exp.endDate || t.current}
              </p>
            )}
            {exp.description && (
              <p className="cv-experience-description">{exp.description}</p>
            )}
          </div>
        ))
      ) : (
        <p className="cv-empty-message">No experience found</p>
      )}
    </div>
  );
};

// Education Tab Component
const EducationTab = ({ education, t }) => {
  return (
    <div className="cv-education">
      {education && education.length > 0 ? (
        education.map((edu, index) => (
          <div key={index} className="cv-education-card">
            <h3>{edu.degree}</h3>
            {edu.institution && (
              <p className="cv-education-institution">
                <span className="cv-icon">🏫</span> {edu.institution}
              </p>
            )}
            {edu.field && (
              <p className="cv-education-field">
                <span className="cv-icon">📚</span> {edu.field}
              </p>
            )}
            {(edu.startDate || edu.endDate) && (
              <p className="cv-education-duration">
                <span className="cv-icon">📅</span>
                {edu.startDate} - {edu.endDate || t.current}
              </p>
            )}
          </div>
        ))
      ) : (
        <p className="cv-empty-message">No education found</p>
      )}
    </div>
  );
};

// Suggestions Tab Component
const SuggestionsTab = ({ improvements, t, getPriorityColor }) => {
  const { strengths, weaknesses, suggestions } = improvements;

  return (
    <div className="cv-suggestions">
      {/* Strengths */}
      {strengths && strengths.length > 0 && (
        <div className="cv-section">
          <h3 className="cv-section-title">
            <span className="cv-icon">✅</span> {t.strengths}
          </h3>
          <div className="cv-list">
            {strengths.map((strength, index) => (
              <div key={index} className="cv-list-item cv-strength-item">
                {strength}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weaknesses */}
      {weaknesses && weaknesses.length > 0 && (
        <div className="cv-section">
          <h3 className="cv-section-title">
            <span className="cv-icon">⚠️</span> {t.weaknesses}
          </h3>
          <div className="cv-list">
            {weaknesses.map((weakness, index) => (
              <div key={index} className="cv-list-item cv-weakness-item">
                {weakness}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Improvement Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <div className="cv-section">
          <h3 className="cv-section-title">
            <span className="cv-icon">💡</span> {t.improvementSuggestions}
          </h3>
          <div className="cv-suggestions-list">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="cv-suggestion-card">
                <div className="cv-suggestion-header">
                  <span
                    className="cv-priority-badge"
                    style={{ backgroundColor: getPriorityColor(suggestion.priority) }}
                  >
                    {t[suggestion.priority]}
                  </span>
                  {suggestion.impact && (
                    <span className="cv-impact-badge">
                      {t.impact}: +{suggestion.impact}%
                    </span>
                  )}
                </div>
                <p className="cv-suggestion-text">{suggestion.suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CVAnalyzer;
