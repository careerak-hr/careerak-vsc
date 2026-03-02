/**
 * Host Waiting List Component
 * قائمة المنتظرين للمضيف
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import './HostWaitingList.css';

const HostWaitingList = ({ interviewId, onParticipantAdmitted }) => {
  const { language } = useApp();
  const [waitingList, setWaitingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [editingMessage, setEditingMessage] = useState(false);
  const intervalRef = useRef(null);

  // الترجمات
  const translations = {
    ar: {
      title: 'قائمة المنتظرين',
      noWaiting: 'لا يوجد منتظرين حالياً',
      admit: 'قبول',
      reject: 'رفض',
      position: 'الموقع',
      waitingTime: 'وقت الانتظار',
      welcomeMessage: 'رسالة الترحيب',
      edit: 'تعديل',
      save: 'حفظ',
      cancel: 'إلغاء',
      admitting: 'جاري القبول...',
      rejecting: 'جاري الرفض...',
      success: 'تم بنجاح',
      error: 'حدث خطأ',
      seconds: 'ثانية',
      minutes: 'دقيقة',
      hours: 'ساعة'
    },
    en: {
      title: 'Waiting List',
      noWaiting: 'No participants waiting',
      admit: 'Admit',
      reject: 'Reject',
      position: 'Position',
      waitingTime: 'Waiting Time',
      welcomeMessage: 'Welcome Message',
      edit: 'Edit',
      save: 'Save',
      cancel: 'Cancel',
      admitting: 'Admitting...',
      rejecting: 'Rejecting...',
      success: 'Success',
      error: 'Error occurred',
      seconds: 'seconds',
      minutes: 'minutes',
      hours: 'hours'
    },
    fr: {
      title: 'Liste d\'attente',
      noWaiting: 'Aucun participant en attente',
      admit: 'Admettre',
      reject: 'Rejeter',
      position: 'Position',
      waitingTime: 'Temps d\'attente',
      welcomeMessage: 'Message de bienvenue',
      edit: 'Modifier',
      save: 'Enregistrer',
      cancel: 'Annuler',
      admitting: 'Admission...',
      rejecting: 'Rejet...',
      success: 'Succès',
      error: 'Erreur',
      seconds: 'secondes',
      minutes: 'minutes',
      hours: 'heures'
    }
  };

  const t = translations[language] || translations.ar;

  // تحميل قائمة المنتظرين
  const loadWaitingList = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/waiting-rooms/${interviewId}/list`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load waiting list');
      }

      const data = await response.json();
      setWaitingList(data.data.participants || []);
      setWelcomeMessage(data.data.welcomeMessage || '');
      setLoading(false);
    } catch (err) {
      console.error('Error loading waiting list:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // قبول مشارك
  const handleAdmit = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/waiting-rooms/${interviewId}/admit/${userId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to admit participant');
      }

      // تحديث القائمة
      await loadWaitingList();

      // إشعار المكون الأب
      onParticipantAdmitted && onParticipantAdmitted(userId);
    } catch (err) {
      console.error('Error admitting participant:', err);
      alert(t.error);
    }
  };

  // رفض مشارك
  const handleReject = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/waiting-rooms/${interviewId}/reject/${userId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to reject participant');
      }

      // تحديث القائمة
      await loadWaitingList();
    } catch (err) {
      console.error('Error rejecting participant:', err);
      alert(t.error);
    }
  };

  // حفظ رسالة الترحيب
  const handleSaveWelcomeMessage = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/waiting-rooms/${interviewId}/welcome-message`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ welcomeMessage })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update welcome message');
      }

      setEditingMessage(false);
    } catch (err) {
      console.error('Error updating welcome message:', err);
      alert(t.error);
    }
  };

  // تنسيق وقت الانتظار
  const formatWaitingTime = (joinedAt) => {
    const seconds = Math.floor((Date.now() - new Date(joinedAt)) / 1000);
    
    if (seconds < 60) {
      return `${seconds} ${t.seconds}`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes} ${t.minutes}`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours} ${t.hours} ${minutes} ${t.minutes}`;
    }
  };

  useEffect(() => {
    loadWaitingList();

    // تحديث القائمة كل 3 ثواني
    intervalRef.current = setInterval(loadWaitingList, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [interviewId]);

  if (loading) {
    return (
      <div className="host-waiting-list">
        <div className="loading-state">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="host-waiting-list">
      <div className="waiting-list-header">
        <h3>{t.title}</h3>
        <span className="waiting-count">{waitingList.length}</span>
      </div>

      {/* رسالة الترحيب */}
      <div className="welcome-message-section">
        <label>{t.welcomeMessage}</label>
        {editingMessage ? (
          <div className="message-edit">
            <textarea
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              rows="3"
            />
            <div className="message-actions">
              <button onClick={handleSaveWelcomeMessage} className="btn-save">
                {t.save}
              </button>
              <button
                onClick={() => setEditingMessage(false)}
                className="btn-cancel"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        ) : (
          <div className="message-display">
            <p>{welcomeMessage}</p>
            <button onClick={() => setEditingMessage(true)} className="btn-edit">
              <i className="fas fa-edit"></i> {t.edit}
            </button>
          </div>
        )}
      </div>

      {/* قائمة المنتظرين */}
      <div className="participants-list">
        {waitingList.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-users"></i>
            <p>{t.noWaiting}</p>
          </div>
        ) : (
          waitingList.map((participant, index) => (
            <div key={participant.userId._id} className="participant-card">
              <div className="participant-info">
                <img
                  src={participant.userId.profilePicture || '/default-avatar.png'}
                  alt={participant.userId.name}
                  className="participant-avatar"
                />
                <div className="participant-details">
                  <h4>{participant.userId.name}</h4>
                  <p className="participant-email">{participant.userId.email}</p>
                  <div className="participant-meta">
                    <span>
                      <i className="fas fa-list-ol"></i> {t.position}: {index + 1}
                    </span>
                    <span>
                      <i className="fas fa-clock"></i> {formatWaitingTime(participant.joinedAt)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="participant-actions">
                <button
                  onClick={() => handleAdmit(participant.userId._id)}
                  className="btn-admit"
                >
                  <i className="fas fa-check"></i> {t.admit}
                </button>
                <button
                  onClick={() => handleReject(participant.userId._id)}
                  className="btn-reject"
                >
                  <i className="fas fa-times"></i> {t.reject}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HostWaitingList;
