import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import postJobTranslations from '../data/postJobTranslations.json';
import './10_PostJobPage.css';

export default function PostJobPage() {
  const navigate = useNavigate();
  const { language, startBgMusic } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => { 
    setIsVisible(true); 
    
    const audioEnabled = localStorage.getItem('audioConsent') === 'true' || localStorage.getItem('audio_enabled') === 'true';
    if (audioEnabled && startBgMusic) {
      startBgMusic();
    }
  }, [startBgMusic]);

  const [formData, setFormData] = useState({
    title: '', description: '', requirements: '', location: '', jobType: 'Full Time', salary: { min: '', max: '' }
  });

  const t = postJobTranslations[language || 'ar'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/job-postings', formData);
      navigate('/job-postings');
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div className={`post-job-page-container ${isVisible ? 'opacity-100' : 'opacity-0'}`} dir="rtl">
      <Navbar />
      <main className="post-job-page-main">
        <div className="post-job-card">
          <div className="post-job-header">
            <h2 className="post-job-title">{t.title}</h2>
            <p className="post-job-subtitle">{t.sub}</p>
          </div>

          <form onSubmit={handleSubmit} className="post-job-form">
            <input type="text" placeholder={t.placeholders.title} className="post-job-input" value={formData.title} onChange={e=>setFormData({...formData, title:e.target.value})} required />
            <textarea placeholder={t.placeholders.description} className="post-job-input post-job-textarea" value={formData.description} onChange={e=>setFormData({...formData, description:e.target.value})} required />
            <textarea placeholder={t.placeholders.requirements} className="post-job-input post-job-textarea" value={formData.requirements} onChange={e=>setFormData({...formData, requirements:e.target.value})} required />
            <div className="post-job-grid">
               <input type="text" placeholder={t.placeholders.location} className="post-job-input" value={formData.location} onChange={e=>setFormData({...formData, location:e.target.value})} />
               <select className="post-job-input" value={formData.jobType} onChange={e=>setFormData({...formData, jobType:e.target.value})}>
                 <option value="Full Time">{t.options.fullTime}</option>
                 <option value="Part Time">{t.options.partTime}</option>
                 <option value="Remote">{t.options.remote}</option>
                 <option value="Contract">{t.options.contract}</option>
               </select>
            </div>
            <button type="submit" disabled={loading} className="post-job-submit-btn">
              {loading ? t.loading : t.btn}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}