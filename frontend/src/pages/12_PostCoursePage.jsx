import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import postCourseTranslations from '../data/postCourseTranslations.json';
import './12_PostCoursePage.css';

export default function PostCoursePage() {
  const navigate = useNavigate();
  const { user, language, startBgMusic } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const isRTL = language === 'ar';

  useEffect(() => {
    setIsVisible(true);
    
    const audioEnabled = localStorage.getItem('audioConsent') === 'true' || localStorage.getItem('audio_enabled') === 'true';
    if (audioEnabled && startBgMusic) {
      startBgMusic();
    }
    
    if (user && user.role !== 'HR' && user.role !== 'Admin') {
      navigate('/courses');
    }
  }, [user, navigate, startBgMusic]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: '',
    category: '',
    skillLevel: 'Beginner',
    price: 0
  });

  const t = postCourseTranslations[language || 'ar'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/educational-courses', formData);
      navigate('/courses');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`post-course-page-container ${isVisible ? 'opacity-100' : 'opacity-0'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />

      <main className="post-course-page-main">
        <div className="post-course-card">
          <h2 className={`post-course-title ${isRTL ? 'border-r-8 pr-4' : 'border-l-8 pl-4'}`}>
            {t.title}
          </h2>

          <form onSubmit={handleSubmit} className="post-course-form">
            <div className="post-course-grid-container">
              <input
                type="text" placeholder={t.courseTitle}
                className="post-course-input"
                value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required
              />
              <input
                type="text" placeholder={t.instructor}
                className="post-course-input"
                value={formData.instructor} onChange={(e) => setFormData({...formData, instructor: e.target.value})} required
              />
            </div>

            <div className="post-course-grid-container-3-col">
              <input
                type="text" placeholder={t.category}
                className="post-course-input"
                value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}
              />
              <select
                className="post-course-input"
                value={formData.skillLevel} onChange={(e) => setFormData({...formData, skillLevel: e.target.value})}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <input
                type="number" placeholder={t.price}
                className="post-course-input"
                value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})}
              />
            </div>

            <textarea
              placeholder={t.desc}
              className="post-course-input post-course-textarea"
              value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required
            />

            <button
              type="submit"
              disabled={loading}
              className="post-course-submit-btn"
            >
              {loading ? t.loading : t.btn}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}