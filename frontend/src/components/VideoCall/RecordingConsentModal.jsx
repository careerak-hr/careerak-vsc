import React, { useState, useEffect } from 'react';
import './RecordingConsentModal.css';

/**
 * RecordingConsentModal Component
 * نافذة طلب الموافقة على تسجيل المقابلة
 * 
 * Features:
 * - طلب موافقة صريحة من المستخدم
 * - شرح واضح لاستخدام التسجيل
 * - خيارات قبول/رفض واضحة
 * - دعم متعدد اللغات (ar, en, fr)
 * - تصميم متجاوب
 * - لا يمكن إغلاقها بدون اختيار
 * 
 * Requirements: 2.3 (موافقة المرشح إلزامية قبل التسجيل)
 */
const RecordingConsentModal = ({
  isOpen = false,
  onConsent,
  onDecline,
  hostName = '',
  language = 'ar',
  isLoading = false
}) => {
  const [hasResponded, setHasResponded] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setHasResponded(false);
    }
  }, [isOpen]);

  if (!isOpen || hasResponded) return null;

  const handleConsent = () => {
    setHasResponded(true);
    onConsent();
  };

  const handleDecline = () => {
    setHasResponded(true);
    onDecline();
  };

  const translations = {
    ar: {
      title: 'طلب موافقة على التسجيل',
      message: 'يرغب {hostName} في تسجيل هذه المقابلة',
      purpose: 'الغرض من التسجيل:',
      purposes: [
        'مراجعة المقابلة لاحقاً',
        'مشاركة التسجيل مع فريق التوظيف',
        'توثيق عملية التوظيف',
        'تحسين جودة المقابلات المستقبلية'
      ],
      privacy: 'الخصوصية والأمان:',
      privacyPoints: [
        'سيتم تخزين التسجيل بشكل آمن ومشفر',
        'لن يتم مشاركة التسجيل مع أطراف خارجية',
        'سيتم حذف التسجيل تلقائياً بعد 90 يوماً',
        'يمكنك طلب نسخة من التسجيل أو حذفه في أي وقت'
      ],
      rights: 'حقوقك:',
      rightsPoints: [
        'يمكنك رفض التسجيل دون أي تأثير على فرصتك',
        'يمكنك طلب إيقاف التسجيل في أي وقت أثناء المقابلة',
        'يمكنك الوصول إلى التسجيل بعد المقابلة'
      ],
      question: 'هل توافق على تسجيل هذه المقابلة؟',
      accept: 'أوافق على التسجيل',
      decline: 'لا أوافق',
      note: 'ملاحظة: لن تبدأ المقابلة حتى تقوم بالاختيار'
    },
    en: {
      title: 'Recording Consent Request',
      message: '{hostName} would like to record this interview',
      purpose: 'Purpose of recording:',
      purposes: [
        'Review the interview later',
        'Share the recording with the hiring team',
        'Document the hiring process',
        'Improve future interview quality'
      ],
      privacy: 'Privacy and Security:',
      privacyPoints: [
        'Recording will be stored securely and encrypted',
        'Recording will not be shared with external parties',
        'Recording will be automatically deleted after 90 days',
        'You can request a copy or deletion at any time'
      ],
      rights: 'Your Rights:',
      rightsPoints: [
        'You can decline recording without affecting your opportunity',
        'You can request to stop recording at any time during the interview',
        'You can access the recording after the interview'
      ],
      question: 'Do you consent to recording this interview?',
      accept: 'I Consent to Recording',
      decline: 'I Decline',
      note: 'Note: The interview will not start until you make a choice'
    },
    fr: {
      title: 'Demande de consentement pour l\'enregistrement',
      message: '{hostName} souhaite enregistrer cet entretien',
      purpose: 'Objectif de l\'enregistrement:',
      purposes: [
        'Examiner l\'entretien plus tard',
        'Partager l\'enregistrement avec l\'équipe de recrutement',
        'Documenter le processus de recrutement',
        'Améliorer la qualité des futurs entretiens'
      ],
      privacy: 'Confidentialité et sécurité:',
      privacyPoints: [
        'L\'enregistrement sera stocké de manière sécurisée et cryptée',
        'L\'enregistrement ne sera pas partagé avec des tiers',
        'L\'enregistrement sera automatiquement supprimé après 90 jours',
        'Vous pouvez demander une copie ou la suppression à tout moment'
      ],
      rights: 'Vos droits:',
      rightsPoints: [
        'Vous pouvez refuser l\'enregistrement sans affecter votre opportunité',
        'Vous pouvez demander l\'arrêt de l\'enregistrement à tout moment',
        'Vous pouvez accéder à l\'enregistrement après l\'entretien'
      ],
      question: 'Consentez-vous à l\'enregistrement de cet entretien?',
      accept: 'Je consens à l\'enregistrement',
      decline: 'Je refuse',
      note: 'Note: L\'entretien ne commencera pas tant que vous n\'aurez pas fait un choix'
    }
  };

  const t = translations[language] || translations.ar;
  const message = t.message.replace('{hostName}', hostName || 'المضيف');

  return (
    <div className="recording-consent-overlay">
      <div className="recording-consent-modal">
        {/* Header */}
        <div className="consent-header">
          <div className="consent-icon">🎥</div>
          <h2 className="consent-title">{t.title}</h2>
        </div>

        {/* Content */}
        <div className="consent-content">
          {/* Message */}
          <p className="consent-message">{message}</p>

          {/* Purpose */}
          <div className="consent-section">
            <h3 className="section-title">{t.purpose}</h3>
            <ul className="section-list">
              {t.purposes.map((purpose, index) => (
                <li key={index}>{purpose}</li>
              ))}
            </ul>
          </div>

          {/* Privacy */}
          <div className="consent-section">
            <h3 className="section-title">🔒 {t.privacy}</h3>
            <ul className="section-list">
              {t.privacyPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>

          {/* Rights */}
          <div className="consent-section">
            <h3 className="section-title">✅ {t.rights}</h3>
            <ul className="section-list">
              {t.rightsPoints.map((right, index) => (
                <li key={index}>{right}</li>
              ))}
            </ul>
          </div>

          {/* Question */}
          <div className="consent-question">
            <p>{t.question}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="consent-actions">
          <button
            className="consent-btn consent-btn-accept"
            onClick={handleConsent}
            disabled={isLoading}
          >
            {isLoading ? '⏳ جاري الإرسال...' : `✓ ${t.accept}`}
          </button>
          <button
            className="consent-btn consent-btn-decline"
            onClick={handleDecline}
            disabled={isLoading}
          >
            {isLoading ? '⏳ جاري الإرسال...' : `✗ ${t.decline}`}
          </button>
        </div>

        {/* Note */}
        <div className="consent-note">
          <p>ℹ️ {t.note}</p>
        </div>
      </div>
    </div>
  );
};

export default RecordingConsentModal;
