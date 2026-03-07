import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import QuizComponent from './QuizComponent';
import '../../styles/lessonContent.css';

const LessonContent = ({ lesson, onComplete, isCompleted }) => {
  const { language } = useApp();
  const videoRef = useRef(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoWatched, setVideoWatched] = useState(false);

  const translations = {
    ar: {
      resources: 'الموارد',
      download: 'تحميل',
      videoLesson: 'درس فيديو',
      textLesson: 'درس نصي',
      quizLesson: 'اختبار',
      assignmentLesson: 'مهمة',
      resourceLesson: 'موارد',
      noContent: 'لا يوجد محتوى متاح',
      watchVideo: 'شاهد الفيديو لإكمال الدرس',
      readContent: 'اقرأ المحتوى لإكمال الدرس',
      completeQuiz: 'أكمل الاختبار لإكمال الدرس'
    },
    en: {
      resources: 'Resources',
      download: 'Download',
      videoLesson: 'Video Lesson',
      textLesson: 'Text Lesson',
      quizLesson: 'Quiz',
      assignmentLesson: 'Assignment',
      resourceLesson: 'Resources',
      noContent: 'No content available',
      watchVideo: 'Watch the video to complete the lesson',
      readContent: 'Read the content to complete the lesson',
      completeQuiz: 'Complete the quiz to complete the lesson'
    },
    fr: {
      resources: 'Ressources',
      download: 'Télécharger',
      videoLesson: 'Leçon vidéo',
      textLesson: 'Leçon texte',
      quizLesson: 'Quiz',
      assignmentLesson: 'Devoir',
      resourceLesson: 'Ressources',
      noContent: 'Aucun contenu disponible',
      watchVideo: 'Regardez la vidéo pour terminer la leçon',
      readContent: 'Lisez le contenu pour terminer la leçon',
      completeQuiz: 'Complétez le quiz pour terminer la leçon'
    }
  };

  const t = translations[language] || translations.en;

  useEffect(() => {
    // Reset video progress when lesson changes
    setVideoProgress(0);
    setVideoWatched(false);
  }, [lesson._id]);

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setVideoProgress(progress);

      // Mark as watched if 90% completed
      if (progress >= 90 && !videoWatched) {
        setVideoWatched(true);
      }
    }
  };

  const handleVideoEnded = () => {
    setVideoWatched(true);
    setVideoProgress(100);
  };

  const renderVideoContent = () => {
    if (!lesson.videoUrl) {
      return <p>{t.noContent}</p>;
    }

    return (
      <div className="video-container">
        <video
          ref={videoRef}
          controls
          controlsList="nodownload"
          onTimeUpdate={handleVideoTimeUpdate}
          onEnded={handleVideoEnded}
          className="lesson-video"
        >
          <source src={lesson.videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Video Progress Bar */}
        <div className="video-progress-bar">
          <div 
            className="video-progress-fill"
            style={{ width: `${videoProgress}%` }}
          />
        </div>

        {!isCompleted && !videoWatched && (
          <p className="completion-hint">{t.watchVideo}</p>
        )}
      </div>
    );
  };

  const renderTextContent = () => {
    if (!lesson.textContent) {
      return <p>{t.noContent}</p>;
    }

    return (
      <div className="text-content">
        <div 
          className="lesson-text"
          dangerouslySetInnerHTML={{ __html: lesson.textContent }}
        />

        {!isCompleted && (
          <p className="completion-hint">{t.readContent}</p>
        )}
      </div>
    );
  };

  const renderQuizContent = () => {
    if (!lesson.quiz || !lesson.quiz.questions || lesson.quiz.questions.length === 0) {
      return <p>{t.noContent}</p>;
    }

    return (
      <div className="quiz-container">
        <QuizComponent
          quiz={lesson.quiz}
          onComplete={onComplete}
          isCompleted={isCompleted}
        />

        {!isCompleted && (
          <p className="completion-hint">{t.completeQuiz}</p>
        )}
      </div>
    );
  };

  const renderAssignmentContent = () => {
    return (
      <div className="assignment-content">
        <div 
          className="assignment-description"
          dangerouslySetInnerHTML={{ __html: lesson.textContent || '' }}
        />
        
        {/* Assignment submission would go here */}
        <div className="assignment-submission">
          <p>Assignment submission feature coming soon...</p>
        </div>
      </div>
    );
  };

  const renderResourceContent = () => {
    return (
      <div className="resource-content">
        <p>Resource content display coming soon...</p>
      </div>
    );
  };

  const renderContent = () => {
    switch (lesson.content) {
      case 'video':
        return renderVideoContent();
      case 'text':
        return renderTextContent();
      case 'quiz':
        return renderQuizContent();
      case 'assignment':
        return renderAssignmentContent();
      case 'resource':
        return renderResourceContent();
      default:
        return <p>{t.noContent}</p>;
    }
  };

  const getLessonTypeLabel = () => {
    switch (lesson.content) {
      case 'video':
        return t.videoLesson;
      case 'text':
        return t.textLesson;
      case 'quiz':
        return t.quizLesson;
      case 'assignment':
        return t.assignmentLesson;
      case 'resource':
        return t.resourceLesson;
      default:
        return '';
    }
  };

  return (
    <div className="lesson-content">
      {/* Lesson Type Badge */}
      <div className="lesson-type-badge">
        {getLessonTypeLabel()}
      </div>

      {/* Lesson Description */}
      {lesson.description && (
        <div className="lesson-description">
          <p>{lesson.description}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="lesson-main">
        {renderContent()}
      </div>

      {/* Resources Section */}
      {lesson.resources && lesson.resources.length > 0 && (
        <div className="lesson-resources">
          <h3>{t.resources}</h3>
          <div className="resources-list">
            {lesson.resources.map((resource, index) => (
              <a
                key={index}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="resource-item"
                download
              >
                <span className="resource-icon">📎</span>
                <span className="resource-title">{resource.title}</span>
                <span className="resource-type">{resource.type}</span>
                <span className="resource-action">{t.download}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonContent;
