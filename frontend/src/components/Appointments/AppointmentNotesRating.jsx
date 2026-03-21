import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import './AppointmentNotesRating.css';

/**
 * AppointmentNotesRating
 * مكون لإضافة وعرض الملاحظات والتقييمات على المواعيد
 * Requirements: User Story 6 - نظام ملاحظات وتقييم
 */

const t = {
  ar: {
    notesTitle: 'الملاحظات',
    ratingTitle: 'التقييم',
    addNote: 'إضافة ملاحظة',
    notePlaceholder: 'اكتب ملاحظتك هنا...',
    noteType: 'نوع الملاحظة',
    preInterview: 'قبل المقابلة',
    postInterview: 'بعد المقابلة',
    submitNote: 'حفظ الملاحظة',
    rateInterview: 'تقييم المقابلة',
    commentPlaceholder: 'أضف تعليقاً (اختياري)...',
    submitRating: 'إرسال التقييم',
    loading: 'جاري التحميل...',
    saving: 'جاري الحفظ...',
    noNotes: 'لا توجد ملاحظات بعد',
    noRating: 'لم يتم التقييم بعد',
    alreadyRated: 'لقد قمت بتقييم هذه المقابلة',
    completedOnly: 'التقييم متاح فقط بعد اكتمال الموعد',
    errorLoad: 'فشل تحميل البيانات',
    errorSave: 'فشل الحفظ',
    successNote: 'تمت إضافة الملاحظة بنجاح',
    successRating: 'تم إرسال التقييمك بنجاح',
    yourRating: 'تقييمك',
    averageRating: 'متوسط التقييم',
    totalRatings: 'إجمالي التقييمات',
    stars: ['', 'ضعيف', 'مقبول', 'جيد', 'جيد جداً', 'ممتاز'],
    by: 'بواسطة',
    at: 'في',
  },
  en: {
    notesTitle: 'Notes',
    ratingTitle: 'Rating',
    addNote: 'Add Note',
    notePlaceholder: 'Write your note here...',
    noteType: 'Note Type',
    preInterview: 'Pre-Interview',
    postInterview: 'Post-Interview',
    submitNote: 'Save Note',
    rateInterview: 'Rate Interview',
    commentPlaceholder: 'Add a comment (optional)...',
    submitRating: 'Submit Rating',
    loading: 'Loading...',
    saving: 'Saving...',
    noNotes: 'No notes yet',
    noRating: 'Not rated yet',
    alreadyRated: 'You have already rated this interview',
    completedOnly: 'Rating is only available after the appointment is completed',
    errorLoad: 'Failed to load data',
    errorSave: 'Failed to save',
    successNote: 'Note added successfully',
    successRating: 'Rating submitted successfully',
    yourRating: 'Your Rating',
    averageRating: 'Average Rating',
    totalRatings: 'Total Ratings',
    stars: ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'],
    by: 'by',
    at: 'at',
  },
  fr: {
    notesTitle: 'Notes',
    ratingTitle: 'Évaluation',
    addNote: 'Ajouter une note',
    notePlaceholder: 'Écrivez votre note ici...',
    noteType: 'Type de note',
    preInterview: 'Avant l\'entretien',
    postInterview: 'Après l\'entretien',
    submitNote: 'Enregistrer',
    rateInterview: 'Évaluer l\'entretien',
    commentPlaceholder: 'Ajouter un commentaire (optionnel)...',
    submitRating: 'Soumettre',
    loading: 'Chargement...',
    saving: 'Enregistrement...',
    noNotes: 'Aucune note pour l\'instant',
    noRating: 'Pas encore évalué',
    alreadyRated: 'Vous avez déjà évalué cet entretien',
    completedOnly: 'L\'évaluation n\'est disponible qu\'après la fin du rendez-vous',
    errorLoad: 'Échec du chargement',
    errorSave: 'Échec de l\'enregistrement',
    successNote: 'Note ajoutée avec succès',
    successRating: 'Évaluation soumise avec succès',
    yourRating: 'Votre évaluation',
    averageRating: 'Note moyenne',
    totalRatings: 'Total des évaluations',
    stars: ['', 'Mauvais', 'Passable', 'Bien', 'Très bien', 'Excellent'],
    by: 'par',
    at: 'le',
  },
};

const API_BASE = import.meta.env.VITE_API_URL || '';

const StarRating = ({ value, onChange, readonly = false, size = 'md' }) => {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div className={`anr-stars anr-stars--${size}${readonly ? ' anr-stars--readonly' : ''}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`anr-star${display >= star ? ' anr-star--filled' : ''}`}
          onClick={() => !readonly && onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          disabled={readonly}
          aria-label={`${star} star`}
        >
          ★
        </button>
      ))}
    </div>
  );
};

const AppointmentNotesRating = ({ appointmentId, appointmentStatus }) => {
  const { language, token } = useApp();
  const tr = t[language] || t.ar;
  const isRTL = language === 'ar';
  const fontFamily =
    language === 'ar'
      ? 'Amiri, Cairo, serif'
      : language === 'fr'
      ? 'EB Garamond, serif'
      : 'Cormorant Garamond, serif';

  // Notes state
  const [notes, setNotes] = useState([]);
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState('post_interview');
  const [notesLoading, setNotesLoading] = useState(true);
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteMsg, setNoteMsg] = useState({ text: '', type: '' });

  // Rating state
  const [ratings, setRatings] = useState([]);
  const [avgScore, setAvgScore] = useState(null);
  const [myRating, setMyRating] = useState(null);
  const [ratingScore, setRatingScore] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingsLoading, setRatingsLoading] = useState(true);
  const [ratingSaving, setRatingSaving] = useState(false);
  const [ratingMsg, setRatingMsg] = useState({ text: '', type: '' });

  const isCompleted = appointmentStatus === 'completed';

  const fetchNotes = useCallback(async () => {
    if (!appointmentId || !token) return;
    setNotesLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/appointments/${appointmentId}/notes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setNotes(data.notes || []);
    } catch {
      setNoteMsg({ text: tr.errorLoad, type: 'error' });
    } finally {
      setNotesLoading(false);
    }
  }, [appointmentId, token, tr.errorLoad]);

  const fetchRatings = useCallback(async () => {
    if (!appointmentId || !token) return;
    setRatingsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/appointments/${appointmentId}/rating`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setRatings(data.ratings || []);
        setAvgScore(data.averageScore);
        setMyRating(data.myRating);
      }
    } catch {
      setRatingMsg({ text: tr.errorLoad, type: 'error' });
    } finally {
      setRatingsLoading(false);
    }
  }, [appointmentId, token, tr.errorLoad]);

  useEffect(() => {
    fetchNotes();
    fetchRatings();
  }, [fetchNotes, fetchRatings]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    setNoteSaving(true);
    setNoteMsg({ text: '', type: '' });
    try {
      const res = await fetch(`${API_BASE}/api/appointments/${appointmentId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: noteContent.trim(), noteType }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || tr.errorSave);
      setNoteMsg({ text: tr.successNote, type: 'success' });
      setNoteContent('');
      setNotes((prev) => [data.note, ...prev]);
    } catch (err) {
      setNoteMsg({ text: err.message || tr.errorSave, type: 'error' });
    } finally {
      setNoteSaving(false);
    }
  };

  const handleAddRating = async (e) => {
    e.preventDefault();
    if (!ratingScore) return;
    setRatingSaving(true);
    setRatingMsg({ text: '', type: '' });
    try {
      const res = await fetch(`${API_BASE}/api/appointments/${appointmentId}/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ score: ratingScore, comment: ratingComment.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || tr.errorSave);
      setRatingMsg({ text: tr.successRating, type: 'success' });
      setMyRating(data.rating);
      setRatings((prev) => [data.rating, ...prev]);
      const newTotal = ratings.length + 1;
      const newAvg =
        Math.round(
          ((avgScore || 0) * ratings.length + ratingScore) / newTotal * 10
        ) / 10;
      setAvgScore(newAvg);
    } catch (err) {
      setRatingMsg({ text: err.message || tr.errorSave, type: 'error' });
    } finally {
      setRatingSaving(false);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString(
      language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US',
      { year: 'numeric', month: 'short', day: 'numeric' }
    );

  const getUserName = (u) => {
    if (!u) return '';
    return `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || '';
  };

  return (
    <div
      className={`anr-container${isRTL ? ' anr-rtl' : ' anr-ltr'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ fontFamily }}
    >
      {/* ==================== قسم الملاحظات ==================== */}
      <section className="anr-section">
        <h3 className="anr-section-title">📝 {tr.notesTitle}</h3>

        {/* نموذج إضافة ملاحظة */}
        <form className="anr-form" onSubmit={handleAddNote}>
          <div className="anr-field">
            <label className="anr-label">{tr.noteType}</label>
            <select
              className="anr-select"
              value={noteType}
              onChange={(e) => setNoteType(e.target.value)}
            >
              <option value="pre_interview">{tr.preInterview}</option>
              <option value="post_interview">{tr.postInterview}</option>
            </select>
          </div>

          <div className="anr-field">
            <textarea
              className="anr-textarea"
              placeholder={tr.notePlaceholder}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={4}
              maxLength={5000}
            />
          </div>

          {noteMsg.text && (
            <div className={`anr-msg anr-msg--${noteMsg.type}`}>{noteMsg.text}</div>
          )}

          <button
            type="submit"
            className="anr-btn anr-btn--primary"
            disabled={noteSaving || !noteContent.trim()}
          >
            {noteSaving ? tr.saving : tr.submitNote}
          </button>
        </form>

        {/* قائمة الملاحظات */}
        <div className="anr-list">
          {notesLoading ? (
            <div className="anr-loading">{tr.loading}</div>
          ) : notes.length === 0 ? (
            <div className="anr-empty">{tr.noNotes}</div>
          ) : (
            notes.map((note) => (
              <div key={note._id} className="anr-note-card">
                <div className="anr-note-header">
                  <span className={`anr-note-type anr-note-type--${note.noteType}`}>
                    {note.noteType === 'pre_interview' ? tr.preInterview : tr.postInterview}
                  </span>
                  <span className="anr-note-meta">
                    {tr.by} {getUserName(note.userId)} · {formatDate(note.createdAt)}
                  </span>
                </div>
                <p className="anr-note-content">{note.content}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ==================== قسم التقييم ==================== */}
      <section className="anr-section">
        <h3 className="anr-section-title">⭐ {tr.ratingTitle}</h3>

        {/* ملخص التقييم */}
        {avgScore !== null && (
          <div className="anr-rating-summary">
            <div className="anr-avg-score">{avgScore}</div>
            <StarRating value={Math.round(avgScore)} readonly size="lg" />
            <div className="anr-rating-count">
              {ratings.length} {tr.totalRatings}
            </div>
          </div>
        )}

        {/* نموذج التقييم */}
        {!isCompleted ? (
          <div className="anr-info-msg">{tr.completedOnly}</div>
        ) : myRating ? (
          <div className="anr-my-rating">
            <div className="anr-my-rating-label">{tr.yourRating}</div>
            <StarRating value={myRating.score} readonly size="md" />
            {myRating.comment && <p className="anr-my-rating-comment">{myRating.comment}</p>}
          </div>
        ) : (
          <form className="anr-form" onSubmit={handleAddRating}>
            <div className="anr-field anr-field--center">
              <label className="anr-label">{tr.rateInterview}</label>
              <StarRating value={ratingScore} onChange={setRatingScore} size="xl" />
              {ratingScore > 0 && (
                <span className="anr-star-label">{tr.stars[ratingScore]}</span>
              )}
            </div>

            <div className="anr-field">
              <textarea
                className="anr-textarea"
                placeholder={tr.commentPlaceholder}
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                rows={3}
                maxLength={2000}
              />
            </div>

            {ratingMsg.text && (
              <div className={`anr-msg anr-msg--${ratingMsg.type}`}>{ratingMsg.text}</div>
            )}

            <button
              type="submit"
              className="anr-btn anr-btn--accent"
              disabled={ratingSaving || !ratingScore}
            >
              {ratingSaving ? tr.saving : tr.submitRating}
            </button>
          </form>
        )}

        {/* قائمة التقييمات */}
        <div className="anr-list">
          {ratingsLoading ? (
            <div className="anr-loading">{tr.loading}</div>
          ) : ratings.length === 0 ? (
            <div className="anr-empty">{tr.noRating}</div>
          ) : (
            ratings.map((rating) => (
              <div key={rating._id} className="anr-rating-card">
                <div className="anr-rating-header">
                  <StarRating value={rating.score} readonly size="sm" />
                  <span className="anr-note-meta">
                    {tr.by} {getUserName(rating.raterId)} · {formatDate(rating.createdAt)}
                  </span>
                </div>
                {rating.comment && <p className="anr-rating-comment">{rating.comment}</p>}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default AppointmentNotesRating;
