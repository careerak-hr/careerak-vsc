import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import LessonContent from '../components/courses/LessonContent';
import ProgressTracker from '../components/courses/ProgressTracker';
import '../styles/coursePlayer.css';

const CoursePlayerPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { language } = useApp();
  
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSyllabus, setShowSyllabus] = useState(true);

  const translations = {
    ar: {
      loading: 'جاري التحميل...',
      error: 'حدث خطأ',
      notEnrolled: 'يجب التسجيل في الدورة أولاً',
      enrollNow: 'سجل الآن',
      syllabus: 'المنهج',
      previous: 'السابق',
      next: 'التالي',
      markComplete: 'تحديد كمكتمل',
      completed: 'مكتمل',
      locked: 'مقفل',
      lesson: 'درس',
      of: 'من',
      backToCourse: 'العودة للدورة'
    },
    en: {
      loading: 'Loading...',
      error: 'An error occurred',
      notEnrolled: 'You must enroll in the course first',
      enrollNow: 'Enroll Now',
      syllabus: 'Syllabus',
      previous: 'Previous',
      next: 'Next',
      markComplete: 'Mark as Complete',
      completed: 'Completed',
      locked: 'Locked',
      lesson: 'Lesson',
      of: 'of',
      backToCourse: 'Back to Course'
    },
    fr: {
      loading: 'Chargement...',
      error: 'Une erreur s\'est produite',
      notEnrolled: 'Vous devez vous inscrire au cours d\'abord',
      enrollNow: 'S\'inscrire maintenant',
      syllabus: 'Programme',
      previous: 'Précédent',
      next: 'Suivant',
      markComplete: 'Marquer comme terminé',
      completed: 'Terminé',
      locked: 'Verrouillé',
      lesson: 'Leçon',
      of: 'de',
      backToCourse: 'Retour au cours'
    }
  };

  const t = translations[language] || translations.en;

  useEffect(() => {
    fetchCourseAndEnrollment();
  }, [courseId]);

  const fetchCourseAndEnrollment = async () => {
    try {
      setLoading(true);
      
      // Fetch course details
      const courseResponse = await fetch(`/api/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!courseResponse.ok) {
        throw new Error('Failed to fetch course');
      }
      
      const courseData = await courseResponse.json();
      setCourse(courseData.course);
      
      // Fetch enrollment and progress
      const enrollmentResponse = await fetch(`/api/courses/${courseId}/progress`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!enrollmentResponse.ok) {
        if (enrollmentResponse.status === 404) {
          setError('not_enrolled');
          return;
        }
        throw new Error('Failed to fetch enrollment');
      }
      
      const enrollmentData = await enrollmentResponse.json();
      setEnrollment(enrollmentData.enrollment);
      
      // Fetch lessons
      const lessonsResponse = await fetch(`/api/courses/${courseId}/lessons`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (lessonsResponse.ok) {
        const lessonsData = await lessonsResponse.json();
        setLessons(lessonsData.lessons);
        
        // Set current lesson (next incomplete or first)
        const nextLesson = lessonsData.lessons.find(
          lesson => !enrollmentData.enrollment.progress.completedLessons.includes(lesson._id)
        ) || lessonsData.lessons[0];
        
        setCurrentLesson(nextLesson);
      }
      
    } catch (err) {
      console.error('Error fetching course:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLessonComplete = async () => {
    if (!currentLesson || !enrollment) return;
    
    try {
      const response = await fetch(
        `/api/courses/${courseId}/lessons/${currentLesson._id}/complete`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to mark lesson as complete');
      }
      
      const data = await response.json();
      setEnrollment(data.enrollment);
      
      // Move to next lesson if available
      const currentIndex = lessons.findIndex(l => l._id === currentLesson._id);
      if (currentIndex < lessons.length - 1) {
        setCurrentLesson(lessons[currentIndex + 1]);
      }
      
    } catch (err) {
      console.error('Error marking lesson complete:', err);
    }
  };

  const handlePreviousLesson = () => {
    const currentIndex = lessons.findIndex(l => l._id === currentLesson._id);
    if (currentIndex > 0) {
      setCurrentLesson(lessons[currentIndex - 1]);
    }
  };

  const handleNextLesson = () => {
    const currentIndex = lessons.findIndex(l => l._id === currentLesson._id);
    if (currentIndex < lessons.length - 1) {
      setCurrentLesson(lessons[currentIndex + 1]);
    }
  };

  const handleLessonSelect = (lesson) => {
    // Check if lesson is accessible
    const lessonIndex = lessons.findIndex(l => l._id === lesson._id);
    if (lessonIndex === 0 || enrollment.progress.completedLessons.includes(lessons[lessonIndex - 1]._id)) {
      setCurrentLesson(lesson);
    }
  };

  const isLessonCompleted = (lessonId) => {
    return enrollment?.progress.completedLessons.includes(lessonId);
  };

  const isLessonAccessible = (lesson) => {
    const lessonIndex = lessons.findIndex(l => l._id === lesson._id);
    return lessonIndex === 0 || isLessonCompleted(lessons[lessonIndex - 1]._id);
  };

  if (loading) {
    return (
      <div className="course-player-loading">
        <div className="spinner"></div>
        <p>{t.loading}</p>
      </div>
    );
  }

  if (error === 'not_enrolled') {
    return (
      <div className="course-player-error">
        <h2>{t.notEnrolled}</h2>
        <button onClick={() => navigate(`/courses/${courseId}`)}>
          {t.enrollNow}
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-player-error">
        <h2>{t.error}</h2>
        <p>{error}</p>
        <button onClick={() => navigate(`/courses/${courseId}`)}>
          {t.backToCourse}
        </button>
      </div>
    );
  }

  if (!course || !enrollment || !currentLesson) {
    return null;
  }

  const currentIndex = lessons.findIndex(l => l._id === currentLesson._id);
  const isCurrentCompleted = isLessonCompleted(currentLesson._id);

  return (
    <div className="course-player-page">
      {/* Progress Tracker */}
      <ProgressTracker 
        enrollment={enrollment}
        course={course}
        onContinue={() => {}}
      />

      <div className="course-player-container">
        {/* Syllabus Sidebar */}
        <aside className={`syllabus-sidebar ${showSyllabus ? 'open' : 'closed'}`}>
          <div className="syllabus-header">
            <h3>{t.syllabus}</h3>
            <button 
              className="toggle-syllabus"
              onClick={() => setShowSyllabus(!showSyllabus)}
            >
              {showSyllabus ? '×' : '☰'}
            </button>
          </div>
          
          <div className="syllabus-content">
            {lessons.map((lesson, index) => (
              <div
                key={lesson._id}
                className={`syllabus-item ${
                  currentLesson._id === lesson._id ? 'active' : ''
                } ${isLessonCompleted(lesson._id) ? 'completed' : ''} ${
                  !isLessonAccessible(lesson) ? 'locked' : ''
                }`}
                onClick={() => handleLessonSelect(lesson)}
              >
                <div className="lesson-number">{index + 1}</div>
                <div className="lesson-info">
                  <h4>{lesson.title}</h4>
                  <span className="lesson-duration">{lesson.duration} min</span>
                </div>
                <div className="lesson-status">
                  {isLessonCompleted(lesson._id) && <span className="check">✓</span>}
                  {!isLessonAccessible(lesson) && <span className="lock">🔒</span>}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="lesson-main-content">
          {/* Lesson Header */}
          <div className="lesson-header">
            <button 
              className="back-button"
              onClick={() => navigate(`/courses/${courseId}`)}
            >
              ← {t.backToCourse}
            </button>
            <h1>{currentLesson.title}</h1>
            <p className="lesson-meta">
              {t.lesson} {currentIndex + 1} {t.of} {lessons.length}
            </p>
          </div>

          {/* Lesson Content */}
          <LessonContent 
            lesson={currentLesson}
            onComplete={handleLessonComplete}
            isCompleted={isCurrentCompleted}
          />

          {/* Navigation Controls */}
          <div className="lesson-navigation">
            <button
              className="nav-button prev"
              onClick={handlePreviousLesson}
              disabled={currentIndex === 0}
            >
              ← {t.previous}
            </button>

            {!isCurrentCompleted && (
              <button
                className="complete-button"
                onClick={handleLessonComplete}
              >
                {t.markComplete}
              </button>
            )}

            {isCurrentCompleted && (
              <span className="completed-badge">
                ✓ {t.completed}
              </span>
            )}

            <button
              className="nav-button next"
              onClick={handleNextLesson}
              disabled={currentIndex === lessons.length - 1}
            >
              {t.next} →
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CoursePlayerPage;
