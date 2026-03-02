import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import './InterviewNotes.css';

/**
 * مكون إضافة الملاحظات والتقييم للمقابلة
 * Requirements: 8.4, 8.5
 */
const InterviewNotes = ({ interview, onUpdate }) => {
  const { language, fontFamily } = useApp();
  const [notes, setNotes] = useState(interview.notes || '');
  const [rating, setRating] = useState(interview.rating || 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const translations = {
    ar: {
      title: 'الملاحظات والتقييم',
      notesLabel: 'الملاحظات',
      notesPlaceholder: 'أضف ملاحظاتك حول المقابلة والمرشح...',
      ratingLabel: 'تقييم المرشح',
      ratingHint: 'اختر من 1 إلى 5 نجوم',
      save: 'حفظ',
      saving: 'جاري الحفظ...',
      success: 'تم الحفظ بنجاح',
      error: 'حدث خطأ أثناء الحفظ',
      notHost: 'فقط المضيف يمكنه إضافة ملاحظات وتقييم',
      notEnded: 'لا يمكن إضافة ملاحظات إلا بعد انتهاء المقابلة'
    },
    en: {
      title: 'Notes & Rating',
      notesLabel: 'Notes',
      notesPlaceholder: 'Add your notes about the interview and candidate...',
      ratingLabel: 'Candidate Rating',
      ratingHint: 'Choose from 1 to 5 stars',
      save: 'Save',
      saving: 'Saving...',
      success: 'Saved successfully',
      error: 'An error occurred while saving',
      notHost: 'Only the host can add notes and rating',
      notEnded: 'Notes can only be added after the interview ends'
    },
    fr: {
      title: 'Notes et évaluation',
      notesLabel: 'Notes',
      notesPlaceholder: 'Ajoutez vos notes sur l\'entretien et le candidat...',
      ratingLabel: 'Évaluation du candidat',
      ratingHint: 'Choisissez de 1 à 5 étoiles',
      save: 'Enregistrer',
      saving: 'Enregistrement...',
      success: 'Enregistré avec succès',
      error: 'Une erreur s\'est produite lors de l\'enregistrement',
      notHost: 'Seul l\'hôte peut ajouter des notes et une évaluation',
      notEnded: 'Les notes ne peuvent être ajoutées qu\'après la fin de l\'entretien'
    }
  };

  const t = translations[language] || translations.ar;

  const handleSaveNotes = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/video-interviews/${interview._id}/notes`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ notes })
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save notes');
      }

      setSuccess(true);
      if (onUpdate) onUpdate();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRating = async (newRating) => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/video-interviews/${interview._id}/rating`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ rating: newRating })
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save rating');
      }

      setRating(newRating);
      setSuccess(true);
      if (onUpdate) onUpdate();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const renderStars = () => {
    return (
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            className={`star ${rating >= star ? 'active' : ''}`}
            onClick={() => handleSaveRating(star)}
            disabled={saving}
          >
            ⭐
          </button>
        ))}
      </div>
    );
  };

  // التحقق من الصلاحيات
  const userId = localStorage.getItem('userId');
  const isHost = interview.hostId?._id === userId || interview.hostId === userId;
  const isEnded = interview.status === 'ended';

  if (!isHost) {
    return (
      <div className="interview-notes" style={{ fontFamily }}>
        <div className="warning">{t.notHost}</div>
      </div>
    );
  }

  if (!isEnded) {
    return (
      <div className="interview-notes" style={{ fontFamily }}>
        <div className="warning">{t.notEnded}</div>
      </div>
    );
  }

  return (
    <div className="interview-notes" style={{ fontFamily }}>
      <h2>{t.title}</h2>

      {error && <div className="error-message">{t.error}: {error}</div>}
      {success && <div className="success-message">{t.success}</div>}

      <div className="notes-section">
        <label>{t.notesLabel}</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t.notesPlaceholder}
          rows={6}
          disabled={saving}
        />
        <button
          onClick={handleSaveNotes}
          disabled={saving || !notes.trim()}
          className="save-btn"
        >
          {saving ? t.saving : t.save}
        </button>
      </div>

      <div className="rating-section">
        <label>{t.ratingLabel}</label>
        <p className="rating-hint">{t.ratingHint}</p>
        {renderStars()}
      </div>
    </div>
  );
};

export default InterviewNotes;
