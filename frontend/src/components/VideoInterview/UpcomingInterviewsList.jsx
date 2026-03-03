/**
 * UpcomingInterviewsList Component
 * قائمة المقابلات القادمة
 * 
 * Requirements: 8.1
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './UpcomingInterviewsList.css';

const UpcomingInterviewsList = () => {
  const { language, translations } = useApp();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const t = translations[language]?.videoInterview || {};

  useEffect(() => {
    fetchUpcomingInterviews();
  }, [pagination.page]);

  const fetchUpcomingInterviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/video-interviews/upcoming?page=${pagination.page}&limit=${pagination.limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('فشل في جلب المقابلات القادمة');
      }

      const data = await response.json();
      setInterviews(data.interviews);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching upcoming interviews:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeUntil = (dateString) => {
    const now = new Date();
    const scheduled = new Date(dateString);
    const diff = scheduled - now;
    
    if (diff < 0) return t.now || 'الآن';
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} ${t.days || 'يوم'}`;
    if (hours > 0) return `${hours} ${t.hours || 'ساعة'}`;
    return `${minutes} ${t.minutes || 'دقيقة'}`;
  };

  const canJoinNow = (dateString) => {
    const now = new Date();
    const scheduled = new Date(dateString);
    const diff = scheduled - now;
    const minutesUntil = Math.floor(diff / 60000);
    
    // يمكن الانضمام قبل 5 دقائق من الموعد
    return minutesUntil <= 5 && minutesUntil >= -30;
  };

  const handleJoinInterview = (interviewId) => {
    navigate(`/video-interview/${interviewId}`);
  };

  const handleViewDetails = (interviewId) => {
    navigate(`/interview-details/${interviewId}`);
  };

  if (loading) {
    return (
      <div className="upcoming-interviews-loading">
        <div className="spinner"></div>
        <p>{t.loading || 'جاري التحميل...'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="upcoming-interviews-error">
        <p>{error}</p>
        <button onClick={fetchUpcomingInterviews}>
          {t.retry || 'إعادة المحاولة'}
        </button>
      </div>
    );
  }

  if (interviews.length === 0) {
    return (
      <div className="upcoming-interviews-empty">
        <p>{t.noUpcoming || 'لا توجد مقابلات قادمة'}</p>
      </div>
    );
  }

  return (
    <div className="upcoming-interviews-container">
      <h2 className="upcoming-interviews-title">
        {t.upcomingInterviews || 'المقابلات القادمة'}
      </h2>

      <div className="upcoming-interviews-list">
        {interviews.map((interview) => (
          <div key={interview._id} className="interview-card">
            <div className="interview-header">
              <div className="interview-status">
                <span className={`status-badge status-${interview.status}`}>
                  {t[interview.status] || interview.status}
                </span>
                <span className="time-until">
                  {t.in || 'خلال'} {getTimeUntil(interview.scheduledAt)}
                </span>
              </div>
            </div>

            <div className="interview-body">
              <div className="interview-date">
                <i className="icon-calendar"></i>
                <div>
                  <p className="date">{formatDate(interview.scheduledAt)}</p>
                  <p className="time">{formatTime(interview.scheduledAt)}</p>
                </div>
              </div>

              <div className="interview-participants">
                <p className="label">{t.participants || 'المشاركون'}:</p>
                <div className="participants-list">
                  {interview.participants.map((participant) => (
                    <div key={participant.userId._id} className="participant">
                      <img
                        src={participant.userId.profilePicture || '/default-avatar.png'}
                        alt={participant.userId.name}
                        className="participant-avatar"
                      />
                      <span className="participant-name">
                        {participant.userId.name}
                      </span>
                      {participant.role === 'host' && (
                        <span className="host-badge">{t.host || 'مضيف'}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {interview.appointmentId && (
                <div className="interview-appointment">
                  <p className="appointment-title">
                    {interview.appointmentId.title}
                  </p>
                  {interview.appointmentId.description && (
                    <p className="appointment-description">
                      {interview.appointmentId.description}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="interview-footer">
              <button
                className="btn-secondary"
                onClick={() => handleViewDetails(interview._id)}
              >
                {t.viewDetails || 'عرض التفاصيل'}
              </button>
              
              {canJoinNow(interview.scheduledAt) ? (
                <button
                  className="btn-primary join-now"
                  onClick={() => handleJoinInterview(interview._id)}
                >
                  {t.joinNow || 'انضم الآن'}
                </button>
              ) : (
                <button className="btn-disabled" disabled>
                  {t.notYet || 'لم يحن الوقت بعد'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            disabled={pagination.page === 1}
            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
          >
            {t.previous || 'السابق'}
          </button>
          
          <span className="pagination-info">
            {t.page || 'صفحة'} {pagination.page} {t.of || 'من'} {pagination.pages}
          </span>
          
          <button
            className="pagination-btn"
            disabled={pagination.page === pagination.pages}
            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
          >
            {t.next || 'التالي'}
          </button>
        </div>
      )}
    </div>
  );
};

export default UpcomingInterviewsList;
