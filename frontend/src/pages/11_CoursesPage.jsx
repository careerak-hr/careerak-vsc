import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import coursesTranslations from '../data/coursesTranslations.json';
import './11_CoursesPage.css';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const { language, startBgMusic } = useAuth();
  const isRTL = language === 'ar';

  useEffect(() => {
    setIsVisible(true);
    
    const audioEnabled = localStorage.getItem('audioConsent') === 'true' || localStorage.getItem('audio_enabled') === 'true';
    if (audioEnabled && startBgMusic) {
      startBgMusic();
    }
    
    const fetchCourses = async () => {
      try {
        const res = await api.get('/educational-courses');
        setCourses(res.data);
      } catch (err) {
        console.error("Failed to fetch courses", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [startBgMusic]);

  const t = coursesTranslations[language || 'ar'];

  return (
    <div className={`courses-page-container ${isVisible ? 'opacity-100' : 'opacity-0'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />
      
      <main className="courses-page-main">
        <div className="courses-header">
          <h2 className="courses-title">{t.title}</h2>
          <p className="courses-subtitle">{t.sub}</p>
        </div>

        {loading ? (
          <div className="courses-loading-container">
            <div className="courses-loading-spinner"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="courses-no-courses-container">
             <span className="courses-no-courses-icon">📚</span>
             <p className="courses-no-courses-text">{t.noCourses}</p>
          </div>
        ) : (
          <div className="courses-grid">
            {courses.map(course => (
              <div key={course._id} className="course-card">
                <div className="course-card-header">
                  <span className="course-card-icon">🎓</span>
                  <div className="course-card-category-badge">
                    {course.category || 'General'}
                  </div>
                </div>

                <div className="course-card-body">
                  <h3 className="course-card-title">{course.title}</h3>

                  <div className="course-card-details">
                    <div className="course-card-detail-item">
                      <span>{t.level}:</span>
                      <span className="course-card-detail-value">{course.skillLevel || 'Beginner'}</span>
                    </div>
                    <div className="course-card-detail-item">
                      <span>{t.price}:</span>
                      <span className="course-card-price">{course.price === 0 ? t.free : `$${course.price}`}</span>
                    </div>
                  </div>

                  <button className="course-card-enroll-btn">
                    {t.enroll}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}