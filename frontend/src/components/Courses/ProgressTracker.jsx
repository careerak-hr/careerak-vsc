import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import '../../styles/progressTracker.css';

const ProgressTracker = ({ enrollment, course, onContinue }) => {
  const navigate = useNavigate();
  const { language } = useApp();

  const translations = {
    ar: {
      yourProgress: 'تقدمك',
      completed: 'مكتمل',
      lessons: 'دروس',
      continueLearning: 'متابعة التعلم',
      downloadCertificate: 'تحميل الشهادة',
      congratulations: 'تهانينا!',
      courseCompleted: 'لقد أكملت الدورة بنجاح',
      lastAccessed: 'آخر وصول',
      startedOn: 'بدأت في',
      completedOn: 'اكتملت في'
    },
    en: {
      yourProgress: 'Your Progress',
      completed: 'Completed',
      lessons: 'lessons',
      continueLearning: 'Continue Learning',
      downloadCertificate: 'Download Certificate',
      congratulations: 'Congratulations!',
      courseCompleted: 'You have successfully completed the course',
      lastAccessed: 'Last accessed',
      startedOn: 'Started on',
      completedOn: 'Completed on'
    },
    fr: {
      yourProgress: 'Votre progression',
      completed: 'Terminé',
      lessons: 'leçons',
      continueLearning: 'Continuer l\'apprentissage',
      downloadCertificate: 'Télécharger le certificat',
      congratulations: 'Félicitations!',
      courseCompleted: 'Vous avez terminé le cours avec succès',
      lastAccessed: 'Dernier accès',
      startedOn: 'Commencé le',
      completedOn: 'Terminé le'
    }
  };

  const t = translations[language] || translations.en;

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString(language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US');
  };

  const handleContinueLearning = () => {
    if (onContinue) {
      onContinue();
    } else {
      navigate(`/courses/${course._id}/learn`);
    }
  };

  const handleDownloadCertificate = async () => {
    try {
      const response = await fetch(`/api/courses/${course._id}/certificate`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch certificate');
      }

      const data = await response.json();
      
      // Open certificate URL in new tab
      if (data.certificateUrl) {
        window.open(data.certificateUrl, '_blank');
      }
    } catch (error) {
      console.error('Error downloading certificate:', error);
    }
  };

  const completedLessons = enrollment.progress.completedLessons.length;
  const totalLessons = course.totalLessons;
  const percentage = enrollment.progress.percentageComplete;
  const isCompleted = enrollment.status === 'completed';
  const hasCertificate = enrollment.certificateIssued?.issued;

  return (
    <div className="progress-tracker">
      <div className="progress-tracker-container">
        {/* Progress Header */}
        <div className="progress-header">
          <h3>{t.yourProgress}</h3>
          <span className="progress-percentage">{percentage}%</span>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${percentage}%` }}
          >
            <span className="progress-bar-label">
              {percentage}%
            </span>
          </div>
        </div>

        {/* Progress Stats */}
        <div className="progress-stats">
          <div className="stat-item">
            <span className="stat-value">
              {completedLessons} / {totalLessons}
            </span>
            <span className="stat-label">{t.lessons}</span>
          </div>

          <div className="stat-item">
            <span className="stat-label">
              {isCompleted ? t.completedOn : t.lastAccessed}
            </span>
            <span className="stat-value">
              {formatDate(
                isCompleted 
                  ? enrollment.completedAt 
                  : enrollment.progress.lastAccessedAt
              )}
            </span>
          </div>

          {enrollment.enrolledAt && (
            <div className="stat-item">
              <span className="stat-label">{t.startedOn}</span>
              <span className="stat-value">
                {formatDate(enrollment.enrolledAt)}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="progress-actions">
          {!isCompleted && (
            <button 
              className="continue-button"
              onClick={handleContinueLearning}
            >
              {t.continueLearning}
            </button>
          )}

          {isCompleted && (
            <div className="completion-section">
              <div className="completion-message">
                <span className="completion-icon">🎉</span>
                <div>
                  <h4>{t.congratulations}</h4>
                  <p>{t.courseCompleted}</p>
                </div>
              </div>

              {hasCertificate && (
                <button 
                  className="certificate-button"
                  onClick={handleDownloadCertificate}
                >
                  <span className="certificate-icon">📜</span>
                  {t.downloadCertificate}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Visual Progress Indicator */}
        <div className="progress-visual">
          {Array.from({ length: totalLessons }).map((_, index) => (
            <div
              key={index}
              className={`progress-dot ${
                index < completedLessons ? 'completed' : ''
              }`}
              title={`${t.lessons} ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
