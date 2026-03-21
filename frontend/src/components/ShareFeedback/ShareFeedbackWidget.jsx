import React, { useState } from 'react';
import { FaStar, FaTimes } from 'react-icons/fa';
import { useApp } from '../../context/AppContext';
import './ShareFeedbackWidget.css';

const translations = {
  ar: {
    title: 'كيف كانت تجربة المشاركة؟',
    subtitle: 'ساعدنا في تحسين ميزة المشاركة',
    wasEasyLabel: 'هل كانت المشاركة سهلة؟',
    yes: 'نعم',
    no: 'لا',
    commentPlaceholder: 'أضف تعليقاً (اختياري)...',
    submit: 'إرسال',
    skip: 'تخطي',
    thankYou: 'شكراً على ملاحظاتك!',
    stars: ['ضعيف', 'مقبول', 'جيد', 'جيد جداً', 'ممتاز'],
  },
  en: {
    title: 'How was your sharing experience?',
    subtitle: 'Help us improve the sharing feature',
    wasEasyLabel: 'Was sharing easy?',
    yes: 'Yes',
    no: 'No',
    commentPlaceholder: 'Add a comment (optional)...',
    submit: 'Submit',
    skip: 'Skip',
    thankYou: 'Thank you for your feedback!',
    stars: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'],
  },
  fr: {
    title: 'Comment était votre expérience de partage ?',
    subtitle: "Aidez-nous à améliorer la fonctionnalité de partage",
    wasEasyLabel: 'Le partage était-il facile ?',
    yes: 'Oui',
    no: 'Non',
    commentPlaceholder: 'Ajouter un commentaire (optionnel)...',
    submit: 'Envoyer',
    skip: 'Ignorer',
    thankYou: 'Merci pour vos commentaires !',
    stars: ['Mauvais', 'Passable', 'Bien', 'Très bien', 'Excellent'],
  },
};

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * ShareFeedbackWidget - shown after a user performs a share action
 * Task 9.10: Gather user feedback on the content sharing feature
 *
 * Props:
 *   shareId      - optional ID of the recorded share event
 *   contentType  - 'job' | 'course' | 'profile' | 'company'
 *   contentId    - ID of the shared content
 *   shareMethod  - the platform used (facebook, whatsapp, etc.)
 *   onClose      - callback when widget is dismissed
 *   token        - optional JWT token for authenticated requests
 */
const ShareFeedbackWidget = ({
  shareId,
  contentType,
  contentId,
  shareMethod,
  onClose,
  token,
}) => {
  const { language } = useApp();
  const t = translations[language] || translations.ar;
  const isRTL = language === 'ar';

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [wasEasy, setWasEasy] = useState(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!rating) return;
    setLoading(true);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(`${API_BASE}/share-feedback`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          shareId: shareId || undefined,
          contentType,
          contentId,
          shareMethod,
          rating,
          comment: comment.trim() || undefined,
          wasEasy: wasEasy !== null ? wasEasy : undefined,
        }),
      });
    } catch (err) {
      // Silently fail — feedback is non-critical
      console.error('Failed to submit share feedback:', err);
    } finally {
      setLoading(false);
      setSubmitted(true);
      setTimeout(() => onClose?.(), 1800);
    }
  };

  if (submitted) {
    return (
      <div className={`sfb-widget sfb-widget--thank-you${isRTL ? ' sfb-rtl' : ''}`}>
        <span className="sfb-thank-you-icon">🎉</span>
        <p className="sfb-thank-you-text">{t.thankYou}</p>
      </div>
    );
  }

  return (
    <div className={`sfb-widget${isRTL ? ' sfb-rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Close button */}
      <button className="sfb-close" onClick={onClose} aria-label="close">
        <FaTimes size={14} />
      </button>

      <p className="sfb-title">{t.title}</p>
      <p className="sfb-subtitle">{t.subtitle}</p>

      {/* Star rating */}
      <div className="sfb-stars" role="group" aria-label="rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            className={`sfb-star${(hovered || rating) >= star ? ' sfb-star--active' : ''}`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            aria-label={t.stars[star - 1]}
            title={t.stars[star - 1]}
          >
            <FaStar />
          </button>
        ))}
      </div>

      {/* Was it easy? */}
      <div className="sfb-easy-row">
        <span className="sfb-easy-label">{t.wasEasyLabel}</span>
        <div className="sfb-easy-buttons">
          <button
            className={`sfb-easy-btn${wasEasy === true ? ' sfb-easy-btn--active' : ''}`}
            onClick={() => setWasEasy(true)}
          >
            {t.yes}
          </button>
          <button
            className={`sfb-easy-btn${wasEasy === false ? ' sfb-easy-btn--active' : ''}`}
            onClick={() => setWasEasy(false)}
          >
            {t.no}
          </button>
        </div>
      </div>

      {/* Optional comment */}
      <textarea
        className="sfb-comment"
        placeholder={t.commentPlaceholder}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={500}
        rows={2}
      />

      {/* Actions */}
      <div className="sfb-actions">
        <button className="sfb-btn sfb-btn--skip" onClick={onClose}>
          {t.skip}
        </button>
        <button
          className="sfb-btn sfb-btn--submit"
          onClick={handleSubmit}
          disabled={!rating || loading}
        >
          {t.submit}
        </button>
      </div>
    </div>
  );
};

export default ShareFeedbackWidget;
