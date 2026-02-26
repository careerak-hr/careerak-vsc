import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import './CourseRecommendationsDashboard.css';

/**
 * CourseRecommendationsDashboard Component
 * Displays AI-recommended courses with employment improvement predictions
 * 
 * Validates: Requirements 2.3 (توقع تحسين فرص التوظيف بعد الدورة)
 * Task: 9.4 توقع التأثير
 */
const CourseRecommendationsDashboard = () => {
  const { language, user, api } = useApp();
  const [recommendations, setRecommendations] = useState([]);
  const [filteredRecommendations, setFilteredRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showImpactAnalysis, setShowImpactAnalysis] = useState(false);
  const [impactAnalysis, setImpactAnalysis] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState('all'); // 'all', 'beginner', 'intermediate', 'advanced'

  // Filter recommendations by level
  const filterRecommendationsByLevel = (courses, level) => {
    if (level === 'all') {
      return courses;
    }
    return courses.filter(course => 
      course.level?.toLowerCase() === level.toLowerCase()
    );
  };

  // Calculate level distribution
  const calculateLevelDistribution = (courses) => {
    const distribution = {
      all: courses.length,
      beginner: 0,
      intermediate: 0,
      advanced: 0
    };
    
    courses.forEach(course => {
      const level = course.level?.toLowerCase();
      if (level === 'beginner') distribution.beginner++;
      else if (level === 'intermediate') distribution.intermediate++;
      else if (level === 'advanced') distribution.advanced++;
    });
    
    return distribution;
  };

  const levelDistribution = calculateLevelDistribution(recommendations);

  // Update filtered recommendations when recommendations or level filter changes
  useEffect(() => {
    setFilteredRecommendations(filterRecommendationsByLevel(recommendations, selectedLevel));
  }, [recommendations, selectedLevel]);

  // Fetch course recommendations from API
  const fetchCourseRecommendations = async (jobId = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        limit: 10, // Display 5-10 courses as per requirement
        includeLearningPaths: true
      };

      if (jobId) {
        params.jobIds = jobId;
      }

      // Call the course recommendations API
      const response = await api.get('/recommendations/courses', { params });

      if (response.data.success) {
        const courses = response.data.courseRecommendations || [];
        setRecommendations(courses);
        setFilteredRecommendations(filterRecommendationsByLevel(courses, selectedLevel));
        setImpactAnalysis(response.data.employmentImprovement || null);
        
        // Store in localStorage for caching
        localStorage.setItem('course_recommendations_last_fetch', new Date().toISOString());
        localStorage.setItem('course_recommendations_data', JSON.stringify(courses));
        localStorage.setItem('course_impact_analysis', JSON.stringify(response.data.employmentImprovement || null));
      } else {
        setError(response.data.message || 'Failed to fetch course recommendations');
      }
    } catch (err) {
      console.error('Error fetching course recommendations:', err);
      setError('حدث خطأ في جلب توصيات الدورات. يرجى المحاولة مرة أخرى.');
      
      // Try to load from localStorage as fallback
      try {
        const cachedData = localStorage.getItem('course_recommendations_data');
        const cachedAnalysis = localStorage.getItem('course_impact_analysis');
        if (cachedData) {
          const courses = JSON.parse(cachedData);
          setRecommendations(courses);
          setFilteredRecommendations(filterRecommendationsByLevel(courses, selectedLevel));
        }
        if (cachedAnalysis) {
          setImpactAnalysis(JSON.parse(cachedAnalysis));
        }
      } catch (cacheErr) {
        console.error('Error loading cached course recommendations:', cacheErr);
      }
    } finally {
      setLoading(false);
    }
  };

  // Analyze skill gaps for a specific job
  const analyzeSkillGaps = async (jobId) => {
    try {
      setLoading(true);
      const response = await api.get('/recommendations/skill-gaps', {
        params: { jobId, limit: 5 }
      });

      if (response.data.success) {
        setSelectedJob(response.data.targetJob);
        setShowImpactAnalysis(true);
        
        // Fetch course recommendations for this job
        await fetchCourseRecommendations(jobId);
      }
    } catch (err) {
      console.error('Error analyzing skill gaps:', err);
      setError('حدث خطأ في تحليل فجوات المهارات');
    } finally {
      setLoading(false);
    }
  };

  // Get quick course recommendations based on user profile
  const getQuickRecommendations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/recommendations/courses/quick', {
        params: { limit: 5 }
      });

      if (response.data.success) {
        const courses = response.data.courseRecommendations || [];
        setRecommendations(courses);
        setFilteredRecommendations(filterRecommendationsByLevel(courses, selectedLevel));
        setShowImpactAnalysis(false);
        setSelectedJob(null);
      }
    } catch (err) {
      console.error('Error getting quick recommendations:', err);
      // Fallback to regular recommendations
      await fetchCourseRecommendations();
    } finally {
      setLoading(false);
    }
  };

  // Initialize component
  useEffect(() => {
    if (user && api) {
      getQuickRecommendations();
    }
  }, [user, api]);

  // Translations
  const translations = {
    ar: {
      title: 'دورات مقترحة لتطوير مهاراتك',
      subtitle: 'دورات ذكية مبنية على تحليل فجوات المهارات',
      loading: 'جاري تحليل مهاراتك وتوليد التوصيات...',
      error: 'حدث خطأ في جلب التوصيات',
      retry: 'إعادة المحاولة',
      matchScore: 'نسبة التطابق',
      employmentImprovement: 'تحسين فرص التوظيف',
      expectedImprovement: 'التحسين المتوقع',
      skillsCovered: 'المهارات المغطاة',
      duration: 'المدة',
      level: 'المستوى',
      enroll: 'التسجيل',
      viewDetails: 'عرض التفاصيل',
      analyzeForJob: 'تحليل للوظيفة',
      quickRecommendations: 'توصيات سريعة',
      impactAnalysis: 'تحليل التأثير',
      improvementPlan: 'خطة التحسين',
      estimatedImprovement: 'التحسين المتوقع',
      topCourses: 'أفضل الدورات',
      skillGaps: 'فجوات المهارات',
      learningPath: 'مسار التعلم',
      weeks: 'أسابيع',
      hours: 'ساعات',
      priority: 'الأولوية',
      high: 'عالية',
      medium: 'متوسطة',
      low: 'منخفضة',
      benefits: 'الفوائد المتوقعة',
      whyRecommended: 'لماذا تمت التوصية بهذه الدورة؟',
      howItHelps: 'كيف ستساعدك هذه الدورة؟',
      targetJobs: 'الوظائف المستهدفة',
      overallImprovement: 'التحسين الإجمالي',
      averageImprovement: 'متوسط التحسين',
      maxImprovement: 'أقصى تحسين',
      skillDistribution: 'توزيع المهارات',
      immediateActions: 'إجراءات فورية',
      shortTermGoals: 'أهداف قصيرة المدى',
      longTermDevelopment: 'تطوير طويل المدى',
      filterByLevel: 'تصفية حسب المستوى',
      allLevels: 'جميع المستويات',
      beginner: 'مبتدئ',
      intermediate: 'متوسط',
      advanced: 'متقدم',
      showingCourses: 'عرض الدورات',
      noCoursesForLevel: 'لا توجد دورات لهذا المستوى',
      resetFilters: 'إعادة تعيين الفلاتر'
    },
    en: {
      title: 'Recommended Courses for Skill Development',
      subtitle: 'Smart courses based on skill gap analysis',
      loading: 'Analyzing your skills and generating recommendations...',
      error: 'Error loading recommendations',
      retry: 'Retry',
      matchScore: 'Match Score',
      employmentImprovement: 'Employment Improvement',
      expectedImprovement: 'Expected Improvement',
      skillsCovered: 'Skills Covered',
      duration: 'Duration',
      level: 'Level',
      enroll: 'Enroll',
      viewDetails: 'View Details',
      analyzeForJob: 'Analyze for Job',
      quickRecommendations: 'Quick Recommendations',
      impactAnalysis: 'Impact Analysis',
      improvementPlan: 'Improvement Plan',
      estimatedImprovement: 'Estimated Improvement',
      topCourses: 'Top Courses',
      skillGaps: 'Skill Gaps',
      learningPath: 'Learning Path',
      weeks: 'weeks',
      hours: 'hours',
      priority: 'Priority',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      benefits: 'Expected Benefits',
      whyRecommended: 'Why is this course recommended?',
      howItHelps: 'How will this course help you?',
      targetJobs: 'Target Jobs',
      overallImprovement: 'Overall Improvement',
      averageImprovement: 'Average Improvement',
      maxImprovement: 'Maximum Improvement',
      skillDistribution: 'Skill Distribution',
      immediateActions: 'Immediate Actions',
      shortTermGoals: 'Short-term Goals',
      longTermDevelopment: 'Long-term Development',
      filterByLevel: 'Filter by Level',
      allLevels: 'All Levels',
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
      showingCourses: 'Showing courses',
      noCoursesForLevel: 'No courses for this level',
      resetFilters: 'Reset Filters'
    },
    fr: {
      title: 'Cours recommandés pour le développement des compétences',
      subtitle: 'Cours intelligents basés sur l\'analyse des écarts de compétences',
      loading: 'Analyse de vos compétences et génération de recommandations...',
      error: 'Erreur lors du chargement des recommandations',
      retry: 'Réessayer',
      matchScore: 'Score de correspondance',
      employmentImprovement: 'Amélioration de l\'emploi',
      expectedImprovement: 'Amélioration attendue',
      skillsCovered: 'Compétences couvertes',
      duration: 'Durée',
      level: 'Niveau',
      enroll: 'S\'inscrire',
      viewDetails: 'Voir les détails',
      analyzeForJob: 'Analyser pour l\'emploi',
      quickRecommendations: 'Recommandations rapides',
      impactAnalysis: 'Analyse d\'impact',
      improvementPlan: 'Plan d\'amélioration',
      estimatedImprovement: 'Amélioration estimée',
      topCourses: 'Meilleurs cours',
      skillGaps: 'Écarts de compétences',
      learningPath: 'Parcours d\'apprentissage',
      weeks: 'semaines',
      hours: 'heures',
      priority: 'Priorité',
      high: 'Élevée',
      medium: 'Moyenne',
      low: 'Faible',
      benefits: 'Avantages attendus',
      whyRecommended: 'Pourquoi ce cours est-il recommandé ?',
      howItHelps: 'Comment ce cours vous aidera-t-il ?',
      targetJobs: 'Emplois cibles',
      overallImprovement: 'Amélioration globale',
      averageImprovement: 'Amélioration moyenne',
      maxImprovement: 'Amélioration maximale',
      skillDistribution: 'Distribution des compétences',
      immediateActions: 'Actions immédiates',
      shortTermGoals: 'Objectifs à court terme',
      longTermDevelopment: 'Développement à long terme',
      filterByLevel: 'Filtrer par niveau',
      allLevels: 'Tous les niveaux',
      beginner: 'Débutant',
      intermediate: 'Intermédiaire',
      advanced: 'Avancé',
      showingCourses: 'Affichage des cours',
      noCoursesForLevel: 'Aucun cours pour ce niveau',
      resetFilters: 'Réinitialiser les filtres'
    }
  };

  const t = translations[language] || translations.ar;

  // Format percentage
  const formatPercentage = (value) => {
    if (typeof value === 'number') {
      return `${Math.round(value)}%`;
    }
    if (typeof value === 'string' && value.includes('%')) {
      return value;
    }
    return '0%';
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444'; // red
      case 'medium': return '#f59e0b'; // amber
      case 'low': return '#10b981'; // emerald
      default: return '#6b7280'; // gray
    }
  };

  // Get level description
  const getLevelDescription = (level) => {
    const levels = {
      'beginner': { ar: 'مبتدئ', en: 'Beginner', fr: 'Débutant' },
      'intermediate': { ar: 'متوسط', en: 'Intermediate', fr: 'Intermédiaire' },
      'advanced': { ar: 'متقدم', en: 'Advanced', fr: 'Avancé' },
      'comprehensive': { ar: 'شامل', en: 'Comprehensive', fr: 'Complet' }
    };
    return levels[level]?.[language] || level;
  };

  return (
    <div className="course-recommendations-dashboard" role="region" aria-labelledby="course-recommendations-title">
      <div className="course-recommendations-header">
        <h2 id="course-recommendations-title" className="course-recommendations-title">
          {t.title}
        </h2>
        <p className="course-recommendations-subtitle">
          {t.subtitle}
        </p>
        
        <div className="course-recommendations-actions">
          <button 
            className="action-button quick-recommendations-button"
            onClick={getQuickRecommendations}
            disabled={loading}
          >
            {t.quickRecommendations}
          </button>
          
          {selectedJob && (
            <div className="selected-job-info">
              <span className="job-title">{selectedJob.title}</span>
              <span className="company-name">{selectedJob.company}</span>
            </div>
          )}
        </div>

        {/* Level Filter Controls */}
        <div className="level-filter-section">
          <h3 className="level-filter-title">{t.filterByLevel}</h3>
          <div className="level-filter-buttons">
            <button
              className={`level-filter-button ${selectedLevel === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedLevel('all')}
              aria-label={t.allLevels}
              aria-pressed={selectedLevel === 'all'}
            >
              {t.allLevels}
            </button>
            <button
              className={`level-filter-button ${selectedLevel === 'beginner' ? 'active' : ''}`}
              onClick={() => setSelectedLevel('beginner')}
              aria-label={t.beginner}
              aria-pressed={selectedLevel === 'beginner'}
            >
              {t.beginner}
            </button>
            <button
              className={`level-filter-button ${selectedLevel === 'intermediate' ? 'active' : ''}`}
              onClick={() => setSelectedLevel('intermediate')}
              aria-label={t.intermediate}
              aria-pressed={selectedLevel === 'intermediate'}
            >
              {t.intermediate}
            </button>
            <button
              className={`level-filter-button ${selectedLevel === 'advanced' ? 'active' : ''}`}
              onClick={() => setSelectedLevel('advanced')}
              aria-label={t.advanced}
              aria-pressed={selectedLevel === 'advanced'}
            >
              {t.advanced}
            </button>
          </div>
          {selectedLevel !== 'all' && (
            <div className="filter-status">
              <span className="filter-status-text">
                {t.showingCourses}: <strong>{t[selectedLevel]}</strong> ({filteredRecommendations.length} {filteredRecommendations.length === 1 ? 'course' : 'courses'})
              </span>
              <button
                className="reset-filter-button"
                onClick={() => setSelectedLevel('all')}
                aria-label={t.resetFilters}
              >
                {t.resetFilters}
              </button>
            </div>
          )}

          {/* Level Distribution Stats */}
          <div className="filter-stats">
            <div className="filter-stats-text">
              <strong>{levelDistribution.all}</strong> {t.allLevels.toLowerCase()}
            </div>
            <div className="filter-stats-text">
              <strong>{levelDistribution.beginner}</strong> {t.beginner.toLowerCase()}
            </div>
            <div className="filter-stats-text">
              <strong>{levelDistribution.intermediate}</strong> {t.intermediate.toLowerCase()}
            </div>
            <div className="filter-stats-text">
              <strong>{levelDistribution.advanced}</strong> {t.advanced.toLowerCase()}
            </div>
          </div>
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
            onClick={getQuickRecommendations}
            aria-label={t.retry}
          >
            {t.retry}
          </button>
        </div>
      )}

      {!loading && !error && recommendations.length === 0 && (
        <div className="empty-state" role="status" aria-live="polite">
          <p>لا توجد توصيات دورات متاحة حالياً. حاول تحديث الصفحة أو تحليل مهاراتك لوظيفة محددة.</p>
        </div>
      )}

      {!loading && !error && recommendations.length > 0 && filteredRecommendations.length === 0 && selectedLevel !== 'all' && (
        <div className="empty-state" role="status" aria-live="polite">
          <p>{t.noCoursesForLevel} ({t[selectedLevel]}). {t.resetFilters} <button className="inline-reset-button" onClick={() => setSelectedLevel('all')}>{t.allLevels}</button>.</p>
        </div>
      )}

      {!loading && !error && recommendations.length > 0 && filteredRecommendations.length > 0 && (
        <>
          {/* Impact Analysis Section */}
          {impactAnalysis && showImpactAnalysis && (
            <div className="impact-analysis-section">
              <h3 className="impact-analysis-title">{t.impactAnalysis}</h3>
              
              <div className="improvement-summary">
                <div className="improvement-card overall-improvement">
                  <h4>{t.overallImprovement}</h4>
                  <div className="improvement-value">
                    {formatPercentage(impactAnalysis.average)}
                  </div>
                  <p className="improvement-label">{t.averageImprovement}</p>
                </div>
                
                <div className="improvement-card max-improvement">
                  <h4>{t.maxImprovement}</h4>
                  <div className="improvement-value">
                    {formatPercentage(impactAnalysis.max)}
                  </div>
                  <p className="improvement-label">{t.maxImprovement}</p>
                </div>
              </div>

              {/* Improvement Plan */}
              {impactAnalysis.improvementPlan && (
                <div className="improvement-plan">
                  <h4>{t.improvementPlan}</h4>
                  
                  {impactAnalysis.improvementPlan.immediateActions && impactAnalysis.improvementPlan.immediateActions.length > 0 && (
                    <div className="plan-section immediate-actions">
                      <h5>{t.immediateActions}</h5>
                      <ul>
                        {impactAnalysis.improvementPlan.immediateActions.map((action, index) => (
                          <li key={index}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {impactAnalysis.improvementPlan.shortTermGoals && impactAnalysis.improvementPlan.shortTermGoals.length > 0 && (
                    <div className="plan-section short-term-goals">
                      <h5>{t.shortTermGoals}</h5>
                      <ul>
                        {impactAnalysis.improvementPlan.shortTermGoals.map((goal, index) => (
                          <li key={index}>{goal}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {impactAnalysis.improvementPlan.longTermDevelopment && impactAnalysis.improvementPlan.longTermDevelopment.length > 0 && (
                    <div className="plan-section long-term-development">
                      <h5>{t.longTermDevelopment}</h5>
                      <ul>
                        {impactAnalysis.improvementPlan.longTermDevelopment.map((development, index) => (
                          <li key={index}>{development}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Course Recommendations Grid */}
          <div className="course-recommendations-grid">
            {filteredRecommendations.map((course, index) => (
              <div 
                key={course.id || index} 
                className="course-recommendation-card"
                role="article"
                aria-labelledby={`course-title-${index}`}
              >
                <div className="course-card-header">
                  <h3 id={`course-title-${index}`} className="course-title">
                    {course.title || 'Untitled Course'}
                  </h3>
                  
                  <div className="course-meta">
                    <span className="course-category">{course.category}</span>
                    <span className="course-level">{getLevelDescription(course.level)}</span>
                  </div>
                </div>

                <div className="course-card-body">
                  <p className="course-description">
                    {course.description || 'No description available'}
                  </p>

                  {/* Match Score */}
                  <div className="match-score-section">
                    <div className="score-row">
                      <span className="score-label">{t.matchScore}:</span>
                      <span className="score-value">{formatPercentage(course.matchScore)}</span>
                      <div 
                        className="score-bar"
                        role="progressbar"
                        aria-valuenow={course.matchScore || 0}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      >
                        <div 
                          className="score-fill"
                          style={{ width: `${course.matchScore || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Employment Improvement */}
                    <div className="score-row">
                      <span className="score-label">{t.employmentImprovement}:</span>
                      <span className="score-value improvement-value">
                        {formatPercentage(course.employmentImprovement?.percentage || course.employmentImprovement || 0)}
                      </span>
                      <div 
                        className="score-bar improvement-bar"
                        role="progressbar"
                        aria-valuenow={course.employmentImprovement?.percentage || course.employmentImprovement || 0}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      >
                        <div 
                          className="score-fill improvement-fill"
                          style={{ 
                            width: `${course.employmentImprovement?.percentage || course.employmentImprovement || 0}%`,
                            backgroundColor: getPriorityColor(course.priority)
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Skills Covered */}
                  {course.skills && course.skills.length > 0 && (
                    <div className="skills-section">
                      <h4>{t.skillsCovered}:</h4>
                      <div className="skills-tags">
                        {course.skills.slice(0, 5).map((skill, skillIndex) => (
                          <span key={skillIndex} className="skill-tag">
                            {typeof skill === 'string' ? skill : skill.name || skill.skill}
                          </span>
                        ))}
                        {course.skills.length > 5 && (
                          <span className="skill-tag more-skills">
                            +{course.skills.length - 5} أكثر
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Course Details */}
                  <div className="course-details">
                    <div className="detail-item">
                      <span className="detail-label">{t.duration}:</span>
                      <span className="detail-value">{course.duration || 'غير محدد'}</span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-label">{t.priority}:</span>
                      <span 
                        className="detail-value priority-badge"
                        style={{ backgroundColor: getPriorityColor(course.priority) }}
                      >
                        {t[course.priority] || course.priority}
                      </span>
                    </div>
                    
                    {course.rating && (
                      <div className="detail-item">
                        <span className="detail-label">التقييم:</span>
                        <span className="detail-value">{course.rating} ⭐</span>
                      </div>
                    )}
                  </div>

                  {/* Expected Benefits */}
                  {course.expectedOutcomes && course.expectedOutcomes.length > 0 && (
                    <div className="benefits-section">
                      <h4>{t.benefits}:</h4>
                      <ul className="benefits-list">
                        {course.expectedOutcomes.slice(0, 3).map((benefit, benefitIndex) => (
                          <li key={benefitIndex} className="benefit-item">
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="course-actions">
                    <button
                      className="action-button enroll-button"
                      onClick={() => window.open(course.url || '#', '_blank')}
                      aria-label={`${t.enroll} في ${course.title}`}
                    >
                      {t.enroll}
                    </button>
                    
                    <button
                      className="action-button details-button"
                      onClick={() => setShowImpactAnalysis(!showImpactAnalysis)}
                      aria-label={`${t.viewDetails} عن ${course.title}`}
                    >
                      {t.viewDetails}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Learning Paths Section */}
          {filteredRecommendations[0]?.learningPath && filteredRecommendations[0].learningPath.length > 0 && (
            <div className="learning-paths-section">
              <h3 className="learning-paths-title">{t.learningPath}</h3>
              
              <div className="learning-path-timeline">
                {filteredRecommendations[0].learningPath.map((week, weekIndex) => (
                  <div key={weekIndex} className="week-card">
                    <div className="week-header">
                      <span className="week-number">{t.weeks} {week.week || weekIndex + 1}</span>
                      <h4 className="week-title">{week.title}</h4>
                    </div>
                    
                    {week.skills && week.skills.length > 0 && (
                      <div className="week-skills">
                        <h5>{t.skillsCovered}:</h5>
                        <div className="skills-tags">
                          {week.skills.map((skill, skillIndex) => (
                            <span key={skillIndex} className="skill-tag small">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {week.resources && week.resources.length > 0 && (
                      <div className="week-resources">
                        <h5>الموارد:</h5>
                        <ul>
                          {week.resources.map((resource, resourceIndex) => (
                            <li key={resourceIndex}>{resource}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Footer */}
      {!loading && !error && recommendations.length > 0 && filteredRecommendations.length > 0 && (
        <div className="course-recommendations-footer">
          <p className="recommendations-note">
            تم توليد هذه التوصيات بناءً على تحليل فجوات مهاراتك. يتم تحديث التوصيات تلقائياً عند تحديث ملفك الشخصي.
          </p>
          <p className="recommendations-disclaimer">
            النسب المئوية للتحسين هي تقديرات بناءً على تحليل البيانات وقد تختلف في الواقع.
          </p>
        </div>
      )}
    </div>
  );
};

export default CourseRecommendationsDashboard;