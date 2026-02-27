/**
 * 🔒 Tracking Preference Component
 * مكون إدارة تفضيلات التتبع
 * 
 * المتطلبات: Requirements 6.4 (خيار إيقاف التتبع)
 * 
 * يسمح للمستخدم بـ:
 * - تفعيل/تعطيل التتبع
 * - عرض حالة التتبع الحالية
 * - حذف جميع بيانات التتبع
 * - فهم تأثير التتبع على التوصيات
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import './TrackingPreference.css';

const TrackingPreference = () => {
  const { language, fontFamily } = useApp();
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [disabledAt, setDisabledAt] = useState(null);
  const [message, setMessage] = useState(null);
  
  const translations = {
    ar: {
      title: 'إعدادات الخصوصية والتتبع',
      subtitle: 'تحكم في كيفية استخدام بياناتك لتحسين تجربتك',
      trackingLabel: 'تفعيل التتبع الذكي',
      trackingDescription: 'السماح للنظام بتتبع تفاعلاتك لتقديم توصيات مخصصة أفضل',
      enabled: 'مفعّل',
      disabled: 'معطّل',
      disabledSince: 'معطّل منذ',
      whatIsTracking: 'ما هو التتبع؟',
      trackingExplanation: 'نقوم بتتبع تفاعلاتك مع الوظائف والدورات (مثل المشاهدة، الإعجاب، التقديم) لفهم تفضيلاتك وتقديم توصيات أفضل.',
      whenEnabled: 'عند التفعيل:',
      enabledBenefits: [
        'توصيات وظائف ودورات مخصصة بناءً على اهتماماتك',
        'تحسين دقة التوصيات مع الوقت',
        'اكتشاف فرص جديدة تناسب مهاراتك',
        'تحليل تقدمك المهني'
      ],
      whenDisabled: 'عند التعطيل:',
      disabledEffects: [
        'لن يتم تسجيل أي تفاعلات جديدة',
        'ستحصل على توصيات عامة فقط بناءً على ملفك الشخصي',
        'لن تتحسن التوصيات مع الوقت',
        'ستفقد ميزة التوصيات المخصصة'
      ],
      dataManagement: 'إدارة البيانات',
      deleteAllData: 'حذف جميع بيانات التتبع',
      deleteDataDescription: 'حذف جميع تفاعلاتك المسجلة بشكل دائم. لا يمكن التراجع عن هذا الإجراء.',
      deleteButton: 'حذف البيانات',
      deleteConfirmTitle: 'تأكيد الحذف',
      deleteConfirmMessage: 'هل أنت متأكد من حذف جميع بيانات التتبع؟ هذا الإجراء لا يمكن التراجع عنه.',
      deleteConfirmButton: 'نعم، احذف البيانات',
      cancelButton: 'إلغاء',
      saving: 'جاري الحفظ...',
      deleting: 'جاري الحذف...',
      savedSuccess: 'تم حفظ التفضيلات بنجاح',
      deletedSuccess: 'تم حذف جميع بيانات التتبع بنجاح',
      error: 'حدث خطأ. يرجى المحاولة مرة أخرى',
      privacyNote: 'ملاحظة: نحن نحترم خصوصيتك. بياناتك آمنة ولن تُشارك مع أطراف ثالثة.',
      learnMore: 'معرفة المزيد عن سياسة الخصوصية'
    },
    en: {
      title: 'Privacy & Tracking Settings',
      subtitle: 'Control how your data is used to improve your experience',
      trackingLabel: 'Enable Smart Tracking',
      trackingDescription: 'Allow the system to track your interactions for better personalized recommendations',
      enabled: 'Enabled',
      disabled: 'Disabled',
      disabledSince: 'Disabled since',
      whatIsTracking: 'What is tracking?',
      trackingExplanation: 'We track your interactions with jobs and courses (like viewing, liking, applying) to understand your preferences and provide better recommendations.',
      whenEnabled: 'When enabled:',
      enabledBenefits: [
        'Personalized job and course recommendations based on your interests',
        'Improved recommendation accuracy over time',
        'Discover new opportunities matching your skills',
        'Analyze your career progress'
      ],
      whenDisabled: 'When disabled:',
      disabledEffects: [
        'No new interactions will be recorded',
        'You\'ll receive generic recommendations based only on your profile',
        'Recommendations won\'t improve over time',
        'You\'ll lose personalized recommendation features'
      ],
      dataManagement: 'Data Management',
      deleteAllData: 'Delete All Tracking Data',
      deleteDataDescription: 'Permanently delete all your recorded interactions. This action cannot be undone.',
      deleteButton: 'Delete Data',
      deleteConfirmTitle: 'Confirm Deletion',
      deleteConfirmMessage: 'Are you sure you want to delete all tracking data? This action cannot be undone.',
      deleteConfirmButton: 'Yes, Delete Data',
      cancelButton: 'Cancel',
      saving: 'Saving...',
      deleting: 'Deleting...',
      savedSuccess: 'Preferences saved successfully',
      deletedSuccess: 'All tracking data deleted successfully',
      error: 'An error occurred. Please try again',
      privacyNote: 'Note: We respect your privacy. Your data is secure and will not be shared with third parties.',
      learnMore: 'Learn more about our privacy policy'
    },
    fr: {
      title: 'Paramètres de confidentialité et de suivi',
      subtitle: 'Contrôlez comment vos données sont utilisées pour améliorer votre expérience',
      trackingLabel: 'Activer le suivi intelligent',
      trackingDescription: 'Permettre au système de suivre vos interactions pour de meilleures recommandations personnalisées',
      enabled: 'Activé',
      disabled: 'Désactivé',
      disabledSince: 'Désactivé depuis',
      whatIsTracking: 'Qu\'est-ce que le suivi?',
      trackingExplanation: 'Nous suivons vos interactions avec les emplois et les cours (comme la visualisation, les likes, les candidatures) pour comprendre vos préférences et fournir de meilleures recommandations.',
      whenEnabled: 'Lorsqu\'activé:',
      enabledBenefits: [
        'Recommandations d\'emplois et de cours personnalisées selon vos intérêts',
        'Amélioration de la précision des recommandations au fil du temps',
        'Découvrir de nouvelles opportunités correspondant à vos compétences',
        'Analyser votre progression professionnelle'
      ],
      whenDisabled: 'Lorsque désactivé:',
      disabledEffects: [
        'Aucune nouvelle interaction ne sera enregistrée',
        'Vous recevrez des recommandations génériques basées uniquement sur votre profil',
        'Les recommandations ne s\'amélioreront pas avec le temps',
        'Vous perdrez les fonctionnalités de recommandations personnalisées'
      ],
      dataManagement: 'Gestion des données',
      deleteAllData: 'Supprimer toutes les données de suivi',
      deleteDataDescription: 'Supprimer définitivement toutes vos interactions enregistrées. Cette action ne peut pas être annulée.',
      deleteButton: 'Supprimer les données',
      deleteConfirmTitle: 'Confirmer la suppression',
      deleteConfirmMessage: 'Êtes-vous sûr de vouloir supprimer toutes les données de suivi? Cette action ne peut pas être annulée.',
      deleteConfirmButton: 'Oui, supprimer les données',
      cancelButton: 'Annuler',
      saving: 'Enregistrement...',
      deleting: 'Suppression...',
      savedSuccess: 'Préférences enregistrées avec succès',
      deletedSuccess: 'Toutes les données de suivi supprimées avec succès',
      error: 'Une erreur s\'est produite. Veuillez réessayer',
      privacyNote: 'Note: Nous respectons votre vie privée. Vos données sont sécurisées et ne seront pas partagées avec des tiers.',
      learnMore: 'En savoir plus sur notre politique de confidentialité'
    }
  };
  
  const t = translations[language] || translations.ar;
  
  const fontStyle = {
    fontFamily: fontFamily,
    fontWeight: 'inherit',
    fontStyle: 'inherit'
  };
  
  // جلب حالة التتبع الحالية
  useEffect(() => {
    fetchTrackingStatus();
  }, []);
  
  const fetchTrackingStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user-interactions/tracking/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTrackingEnabled(data.data.trackingEnabled);
        setDisabledAt(data.data.disabledAt);
      }
    } catch (error) {
      console.error('Error fetching tracking status:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleToggleTracking = async () => {
    try {
      setSaving(true);
      setMessage(null);
      
      const response = await fetch('/api/user-interactions/tracking/preference', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          enabled: !trackingEnabled,
          reason: !trackingEnabled ? null : 'تفضيل المستخدم'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setTrackingEnabled(data.data.trackingEnabled);
        setDisabledAt(data.data.disabledAt);
        setMessage({ type: 'success', text: t.savedSuccess });
      } else {
        setMessage({ type: 'error', text: t.error });
      }
    } catch (error) {
      console.error('Error updating tracking preference:', error);
      setMessage({ type: 'error', text: t.error });
    } finally {
      setSaving(false);
    }
  };
  
  const handleDeleteData = async () => {
    try {
      setDeleting(true);
      setMessage(null);
      
      const response = await fetch('/api/user-interactions/tracking/data', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: t.deletedSuccess });
        setShowDeleteConfirm(false);
      } else {
        setMessage({ type: 'error', text: t.error });
      }
    } catch (error) {
      console.error('Error deleting tracking data:', error);
      setMessage({ type: 'error', text: t.error });
    } finally {
      setDeleting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="tracking-preference-loading" style={fontStyle}>
        <div className="spinner"></div>
      </div>
    );
  }
  
  return (
    <div className="tracking-preference-container" style={fontStyle}>
      <div className="tracking-preference-header">
        <h2>{t.title}</h2>
        <p className="subtitle">{t.subtitle}</p>
      </div>
      
      {message && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}
      
      {/* Toggle التتبع */}
      <div className="tracking-toggle-section">
        <div className="toggle-header">
          <div className="toggle-info">
            <h3>{t.trackingLabel}</h3>
            <p>{t.trackingDescription}</p>
            {!trackingEnabled && disabledAt && (
              <p className="disabled-info">
                {t.disabledSince}: {new Date(disabledAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US')}
              </p>
            )}
          </div>
          <div className="toggle-control">
            <label className="switch">
              <input
                type="checkbox"
                checked={trackingEnabled}
                onChange={handleToggleTracking}
                disabled={saving}
              />
              <span className="slider"></span>
            </label>
            <span className={`status ${trackingEnabled ? 'enabled' : 'disabled'}`}>
              {trackingEnabled ? t.enabled : t.disabled}
            </span>
          </div>
        </div>
      </div>
      
      {/* شرح التتبع */}
      <div className="tracking-explanation">
        <h3>{t.whatIsTracking}</h3>
        <p>{t.trackingExplanation}</p>
        
        <div className="benefits-section">
          <h4>{t.whenEnabled}</h4>
          <ul className="benefits-list">
            {t.enabledBenefits.map((benefit, index) => (
              <li key={index}>
                <span className="icon">✓</span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="effects-section">
          <h4>{t.whenDisabled}</h4>
          <ul className="effects-list">
            {t.disabledEffects.map((effect, index) => (
              <li key={index}>
                <span className="icon">✗</span>
                {effect}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* إدارة البيانات */}
      <div className="data-management-section">
        <h3>{t.dataManagement}</h3>
        <div className="delete-data-card">
          <div className="delete-info">
            <h4>{t.deleteAllData}</h4>
            <p>{t.deleteDataDescription}</p>
          </div>
          <button
            className="delete-button"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleting}
          >
            {deleting ? t.deleting : t.deleteButton}
          </button>
        </div>
      </div>
      
      {/* ملاحظة الخصوصية */}
      <div className="privacy-note">
        <p>{t.privacyNote}</p>
        <a href="/policy" className="learn-more-link">
          {t.learnMore} →
        </a>
      </div>
      
      {/* نافذة تأكيد الحذف */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{t.deleteConfirmTitle}</h3>
            <p>{t.deleteConfirmMessage}</p>
            <div className="modal-actions">
              <button
                className="confirm-delete-button"
                onClick={handleDeleteData}
                disabled={deleting}
              >
                {deleting ? t.deleting : t.deleteConfirmButton}
              </button>
              <button
                className="cancel-button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                {t.cancelButton}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackingPreference;
