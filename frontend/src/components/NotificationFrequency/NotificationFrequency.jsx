import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import './NotificationFrequency.css';

const NotificationFrequency = () => {
  const { language, fontFamily } = useApp();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [frequency, setFrequency] = useState({
    recommendations: 'daily',
    applications: 'instant',
    system: 'instant'
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const translations = {
    ar: {
      title: 'تخصيص تكرار الإشعارات',
      description: 'اختر عدد المرات التي تريد فيها تلقي الإشعارات',
      recommendations: 'إشعارات التوصيات',
      recommendationsDesc: 'وظائف ودورات مناسبة لك',
      applications: 'إشعارات التطبيقات',
      applicationsDesc: 'تحديثات على طلبات التوظيف',
      system: 'إشعارات النظام',
      systemDesc: 'إشعارات عامة من المنصة',
      instant: 'فوري',
      instantDesc: 'استلام الإشعارات فوراً',
      hourly: 'كل ساعة',
      hourlyDesc: 'إشعار واحد كل ساعة',
      daily: 'يومي',
      dailyDesc: 'إشعار واحد يومياً',
      weekly: 'أسبوعي',
      weeklyDesc: 'إشعار واحد أسبوعياً',
      disabled: 'معطل',
      disabledDesc: 'لا إشعارات',
      save: 'حفظ التغييرات',
      saving: 'جاري الحفظ...',
      success: 'تم تحديث إعدادات التكرار بنجاح',
      error: 'حدث خطأ أثناء التحديث',
      note: 'ملاحظة',
      noteText: 'الإشعارات الفورية تُرسل مباشرة، بينما الإشعارات المجمعة تُرسل في أوقات محددة حسب التكرار المختار.'
    },
    en: {
      title: 'Customize Notification Frequency',
      description: 'Choose how often you want to receive notifications',
      recommendations: 'Recommendation Notifications',
      recommendationsDesc: 'Jobs and courses matching your profile',
      applications: 'Application Notifications',
      applicationsDesc: 'Updates on your job applications',
      system: 'System Notifications',
      systemDesc: 'General notifications from the platform',
      instant: 'Instant',
      instantDesc: 'Receive notifications immediately',
      hourly: 'Hourly',
      hourlyDesc: 'One notification per hour',
      daily: 'Daily',
      dailyDesc: 'One notification per day',
      weekly: 'Weekly',
      weeklyDesc: 'One notification per week',
      disabled: 'Disabled',
      disabledDesc: 'No notifications',
      save: 'Save Changes',
      saving: 'Saving...',
      success: 'Frequency settings updated successfully',
      error: 'An error occurred while updating',
      note: 'Note',
      noteText: 'Instant notifications are sent immediately, while batched notifications are sent at specific times based on your chosen frequency.'
    },
    fr: {
      title: 'Personnaliser la fréquence des notifications',
      description: 'Choisissez la fréquence de réception des notifications',
      recommendations: 'Notifications de recommandations',
      recommendationsDesc: 'Emplois et cours correspondant à votre profil',
      applications: 'Notifications de candidatures',
      applicationsDesc: 'Mises à jour sur vos candidatures',
      system: 'Notifications système',
      systemDesc: 'Notifications générales de la plateforme',
      instant: 'Instantané',
      instantDesc: 'Recevoir les notifications immédiatement',
      hourly: 'Toutes les heures',
      hourlyDesc: 'Une notification par heure',
      daily: 'Quotidien',
      dailyDesc: 'Une notification par jour',
      weekly: 'Hebdomadaire',
      weeklyDesc: 'Une notification par semaine',
      disabled: 'Désactivé',
      disabledDesc: 'Aucune notification',
      save: 'Enregistrer les modifications',
      saving: 'Enregistrement...',
      success: 'Paramètres de fréquence mis à jour avec succès',
      error: 'Une erreur s\'est produite lors de la mise à jour',
      note: 'Remarque',
      noteText: 'Les notifications instantanées sont envoyées immédiatement, tandis que les notifications groupées sont envoyées à des moments spécifiques selon la fréquence choisie.'
    }
  };

  const t = translations[language] || translations.ar;

  const frequencyOptions = {
    recommendations: [
      { value: 'instant', label: t.instant, desc: t.instantDesc },
      { value: 'hourly', label: t.hourly, desc: t.hourlyDesc },
      { value: 'daily', label: t.daily, desc: t.dailyDesc },
      { value: 'weekly', label: t.weekly, desc: t.weeklyDesc },
      { value: 'disabled', label: t.disabled, desc: t.disabledDesc }
    ],
    applications: [
      { value: 'instant', label: t.instant, desc: t.instantDesc },
      { value: 'hourly', label: t.hourly, desc: t.hourlyDesc },
      { value: 'daily', label: t.daily, desc: t.dailyDesc },
      { value: 'disabled', label: t.disabled, desc: t.disabledDesc }
    ],
    system: [
      { value: 'instant', label: t.instant, desc: t.instantDesc },
      { value: 'daily', label: t.daily, desc: t.dailyDesc },
      { value: 'weekly', label: t.weekly, desc: t.weeklyDesc },
      { value: 'disabled', label: t.disabled, desc: t.disabledDesc }
    ]
  };

  useEffect(() => {
    fetchFrequency();
  }, []);

  const fetchFrequency = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/notifications/frequency`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setFrequency(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching frequency:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/notifications/frequency`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(frequency)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: t.success });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || t.error });
      }
    } catch (error) {
      console.error('Error updating frequency:', error);
      setMessage({ type: 'error', text: t.error });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (category, value) => {
    setFrequency(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const fontStyle = {
    fontFamily: fontFamily,
    fontWeight: 'inherit',
    fontStyle: 'inherit'
  };

  if (loading) {
    return (
      <div className="notification-frequency-loading" style={fontStyle}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="notification-frequency-container" style={fontStyle}>
      <div className="notification-frequency-header">
        <h2>{t.title}</h2>
        <p>{t.description}</p>
      </div>

      {message.text && (
        <div className={`notification-frequency-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="notification-frequency-sections">
        {/* التوصيات */}
        <div className="frequency-section">
          <div className="section-header">
            <h3>📊 {t.recommendations}</h3>
            <p>{t.recommendationsDesc}</p>
          </div>
          <div className="frequency-options">
            {frequencyOptions.recommendations.map(option => (
              <label key={option.value} className="frequency-option">
                <input
                  type="radio"
                  name="recommendations"
                  value={option.value}
                  checked={frequency.recommendations === option.value}
                  onChange={(e) => handleChange('recommendations', e.target.value)}
                />
                <div className="option-content">
                  <span className="option-label">{option.label}</span>
                  <span className="option-desc">{option.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* التطبيقات */}
        <div className="frequency-section">
          <div className="section-header">
            <h3>📋 {t.applications}</h3>
            <p>{t.applicationsDesc}</p>
          </div>
          <div className="frequency-options">
            {frequencyOptions.applications.map(option => (
              <label key={option.value} className="frequency-option">
                <input
                  type="radio"
                  name="applications"
                  value={option.value}
                  checked={frequency.applications === option.value}
                  onChange={(e) => handleChange('applications', e.target.value)}
                />
                <div className="option-content">
                  <span className="option-label">{option.label}</span>
                  <span className="option-desc">{option.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* النظام */}
        <div className="frequency-section">
          <div className="section-header">
            <h3>🔔 {t.system}</h3>
            <p>{t.systemDesc}</p>
          </div>
          <div className="frequency-options">
            {frequencyOptions.system.map(option => (
              <label key={option.value} className="frequency-option">
                <input
                  type="radio"
                  name="system"
                  value={option.value}
                  checked={frequency.system === option.value}
                  onChange={(e) => handleChange('system', e.target.value)}
                />
                <div className="option-content">
                  <span className="option-label">{option.label}</span>
                  <span className="option-desc">{option.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="notification-frequency-note">
        <strong>{t.note}:</strong> {t.noteText}
      </div>

      <div className="notification-frequency-actions">
        <button
          className="save-button"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? t.saving : t.save}
        </button>
      </div>
    </div>
  );
};

export default NotificationFrequency;
