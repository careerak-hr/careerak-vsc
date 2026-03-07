import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import PropTypes from 'prop-types';
import './AlertsManager.css';

/**
 * مكون إدارة التنبيهات للبحث المحفوظ
 * يسمح بتفعيل/تعطيل التنبيهات واختيار التكرار وطريقة الإشعار
 * @component
 */
const AlertsManager = ({ savedSearchId, onClose }) => {
  const { language, fontFamily } = useApp();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    frequency: 'instant',
    notificationMethod: 'push',
    isActive: true
  });

  // Translations
  const translations = {
    ar: {
      title: 'إدارة التنبيهات',
      enableAlerts: 'تفعيل التنبيهات',
      frequency: 'التكرار',
      instant: 'فوري',
      daily: 'يومي',
      weekly: 'أسبوعي',
      notificationMethod: 'طريقة الإشعار',
      push: 'إشعار داخل التطبيق',
      email: 'بريد إلكتروني',
      both: 'كلاهما',
      save: 'حفظ',
      cancel: 'إلغاء',
      delete: 'حذف التنبيه',
      saveSuccess: 'تم حفظ التنبيه بنجاح',
      saveError: 'فشل حفظ التنبيه',
      deleteSuccess: 'تم حذف التنبيه بنجاح',
      deleteError: 'فشل حذف التنبيه',
      confirmDelete: 'هل أنت متأكد من حذف التنبيه؟',
      description: 'سيتم إرسال إشعار عند ظهور وظائف جديدة تطابق معايير البحث',
      noAlerts: 'لا توجد تنبيهات مفعلة',
      createAlert: 'إنشاء تنبيه جديد'
    },
    en: {
      title: 'Manage Alerts',
      enableAlerts: 'Enable Alerts',
      frequency: 'Frequency',
      instant: 'Instant',
      daily: 'Daily',
      weekly: 'Weekly',
      notificationMethod: 'Notification Method',
      push: 'Push Notification',
      email: 'Email',
      both: 'Both',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete Alert',
      saveSuccess: 'Alert saved successfully',
      saveError: 'Failed to save alert',
      deleteSuccess: 'Alert deleted successfully',
      deleteError: 'Failed to delete alert',
      confirmDelete: 'Are you sure you want to delete this alert?',
      description: 'You will receive notifications when new jobs match your search criteria',
      noAlerts: 'No active alerts',
      createAlert: 'Create New Alert'
    },
    fr: {
      title: 'Gérer les alertes',
      enableAlerts: 'Activer les alertes',
      frequency: 'Fréquence',
      instant: 'Instantané',
      daily: 'Quotidien',
      weekly: 'Hebdomadaire',
      notificationMethod: 'Méthode de notification',
      push: 'Notification push',
      email: 'Email',
      both: 'Les deux',
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer l\'alerte',
      saveSuccess: 'Alerte enregistrée avec succès',
      saveError: 'Échec de l\'enregistrement de l\'alerte',
      deleteSuccess: 'Alerte supprimée avec succès',
      deleteError: 'Échec de la suppression de l\'alerte',
      confirmDelete: 'Êtes-vous sûr de vouloir supprimer cette alerte?',
      description: 'Vous recevrez des notifications lorsque de nouveaux emplois correspondent à vos critères de recherche',
      noAlerts: 'Aucune alerte active',
      createAlert: 'Créer une nouvelle alerte'
    }
  };

  const t = translations[language] || translations.ar;

  const fontStyle = {
    fontFamily: fontFamily,
    fontWeight: 'inherit',
    fontStyle: 'inherit'
  };

  useEffect(() => {
    if (savedSearchId) {
      fetchAlerts();
    }
  }, [savedSearchId]);

  /**
   * جلب التنبيهات الموجودة
   */
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/search/alerts?savedSearchId=${savedSearchId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }

      const data = await response.json();
      const alertsList = data.data?.alerts || [];
      setAlerts(alertsList);

      // إذا كان هناك تنبيه موجود، املأ النموذج
      if (alertsList.length > 0) {
        const alert = alertsList[0];
        setFormData({
          frequency: alert.frequency,
          notificationMethod: alert.notificationMethod,
          isActive: alert.isActive
        });
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * حفظ التنبيه
   */
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const token = localStorage.getItem('token');
      const existingAlert = alerts.length > 0 ? alerts[0] : null;
      
      const url = existingAlert
        ? `${import.meta.env.VITE_API_URL}/api/search/alerts/${existingAlert._id}`
        : `${import.meta.env.VITE_API_URL}/api/search/alerts`;
      
      const method = existingAlert ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          savedSearchId,
          ...formData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save alert');
      }

      // إظهار رسالة نجاح
      alert(t.saveSuccess);
      
      // إعادة جلب التنبيهات
      await fetchAlerts();
      
      // إغلاق النافذة إذا كانت موجودة
      if (onClose) {
        onClose();
      }
    } catch (err) {
      console.error('Error saving alert:', err);
      setError(t.saveError);
    } finally {
      setSaving(false);
    }
  };

  /**
   * حذف التنبيه
   */
  const handleDelete = async () => {
    if (!window.confirm(t.confirmDelete)) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const existingAlert = alerts[0];
      if (!existingAlert) {
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/search/alerts/${existingAlert._id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete alert');
      }

      // إظهار رسالة نجاح
      alert(t.deleteSuccess);
      
      // إعادة تعيين النموذج
      setAlerts([]);
      setFormData({
        frequency: 'instant',
        notificationMethod: 'push',
        isActive: true
      });
      
      // إغلاق النافذة إذا كانت موجودة
      if (onClose) {
        onClose();
      }
    } catch (err) {
      console.error('Error deleting alert:', err);
      setError(t.deleteError);
    } finally {
      setSaving(false);
    }
  };

  /**
   * معالجة تغيير الحقول
   */
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="alerts-manager" style={fontStyle}>
        <div className="alerts-loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="alerts-manager" style={fontStyle}>
      <div className="alerts-header">
        <h2 className="alerts-title">{t.title}</h2>
        {onClose && (
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      <p className="alerts-description">{t.description}</p>

      {error && (
        <div className="alerts-error">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="alerts-form">
        {/* Enable/Disable Toggle */}
        <div className="form-group">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => handleChange('isActive', e.target.checked)}
              className="toggle-input"
            />
            <span className="toggle-slider"></span>
            <span className="toggle-text">{t.enableAlerts}</span>
          </label>
        </div>

        {/* Frequency */}
        <div className="form-group">
          <label className="form-label">{t.frequency}</label>
          <div className="radio-group">
            {[
              { value: 'instant', label: t.instant },
              { value: 'daily', label: t.daily },
              { value: 'weekly', label: t.weekly }
            ].map(option => (
              <label key={option.value} className="radio-label">
                <input
                  type="radio"
                  name="frequency"
                  value={option.value}
                  checked={formData.frequency === option.value}
                  onChange={(e) => handleChange('frequency', e.target.value)}
                  disabled={!formData.isActive}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Notification Method */}
        <div className="form-group">
          <label className="form-label">{t.notificationMethod}</label>
          <div className="radio-group">
            {[
              { value: 'push', label: t.push },
              { value: 'email', label: t.email },
              { value: 'both', label: t.both }
            ].map(option => (
              <label key={option.value} className="radio-label">
                <input
                  type="radio"
                  name="notificationMethod"
                  value={option.value}
                  checked={formData.notificationMethod === option.value}
                  onChange={(e) => handleChange('notificationMethod', e.target.value)}
                  disabled={!formData.isActive}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="alerts-actions">
        <button
          className="btn-save"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <div className="btn-spinner"></div>
              <span>{t.save}...</span>
            </>
          ) : (
            t.save
          )}
        </button>

        {alerts.length > 0 && (
          <button
            className="btn-delete"
            onClick={handleDelete}
            disabled={saving}
          >
            {t.delete}
          </button>
        )}

        {onClose && (
          <button
            className="btn-cancel"
            onClick={onClose}
            disabled={saving}
          >
            {t.cancel}
          </button>
        )}
      </div>
    </div>
  );
};

AlertsManager.propTypes = {
  savedSearchId: PropTypes.string.isRequired,
  onClose: PropTypes.func
};

export default AlertsManager;
