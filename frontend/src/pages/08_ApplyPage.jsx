import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslate } from '../hooks/useTranslate';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import AlertModal from '../components/modals/AlertModal';
import './08_ApplyPage.css';

export default function ApplyPage() {
  const { id } = useParams();
  const { language, startBgMusic } = useAuth();
  const t = useTranslate();
  const applyT = t.applyPage;
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: '' });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const audioEnabled = localStorage.getItem('audioConsent') === 'true' || localStorage.getItem('audio_enabled') === 'true';
    if (audioEnabled && startBgMusic) {
      startBgMusic();
    }
    
    const fetchJob = async () => {
      try {
        const res = await api.get(`/job-postings/${id}`);
        setJob(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, startBgMusic]);

  const handleApply = async () => {
    setApplying(true);
    try {
      await api.post('/job-applications', { jobPostingId: id });
      setSuccess(true);
    } catch (err) {
      setAlertModal({ isOpen: true, message: applyT.alreadyApplied });
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="apply-loading-spinner-container"><div className="apply-loading-spinner"></div></div>;

  return (
    <div className={`apply-page-container ${isVisible ? 'opacity-100' : 'opacity-0'}`} dir="rtl">
      <Navbar />
      <main className="apply-page-main">
        <div className="apply-card">
          <div className="apply-header">
             <div className="apply-header-icon-container">🏢</div>
             <div className="apply-header-text-container">
                <h2>{job?.title}</h2>
                <p>{job?.companyName}</p>
             </div>
          </div>

          <div className="apply-content-container">
            <section className="apply-section">
              <h3>{applyT.description}</h3>
              <p>{job?.description}</p>
            </section>

            <section className="apply-section">
              <h3>{applyT.requirements}</h3>
              <p>{job?.requirements}</p>
            </section>
          </div>

          {success ? (
            <div className="apply-success-message">
              {applyT.success}
            </div>
          ) : (
            <button
              onClick={handleApply}
              disabled={applying}
              className="apply-submit-btn"
            >
              {applying ? "جاري التقديم..." : applyT.apply}
            </button>
          )}
        </div>
      </main>
      <Footer />

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ isOpen: false, message: '' })}
        message={alertModal.message}
        language={language}
        t={t}
      />
    </div>
  );
}
