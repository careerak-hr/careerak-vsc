import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import './BookingModal.css';

/**
 * BookingModal - نافذة حجز موعد مقابلة
 * Requirements: User Story 2 - حجز موعد مقابلة
 */

const t = {
  ar: {
    title: 'حجز موعد مقابلة',
    selectTime: 'اختر الوقت المناسب',
    duration: 'مدة المقابلة',
    type: 'نوع المقابلة',
    notes: 'ملاحظات (اختياري)',
    notesPlaceholder: 'أضف أي ملاحظات أو أسئلة...',
    confirm: 'تأكيد الحجز',
    cancel: 'إلغاء',
    booking: 'جاري الحجز...',
    success: 'تم الحجز بنجاح ✅',
    error: 'فشل الحجز، حاول مرة أخرى',
    types: { video_interview: 'مقابلة فيديو', phone_call: 'مقابلة هاتفية', in_person: 'حضوري' },
    durations: { 30: '30 دقيقة', 45: '45 دقيقة', 60: 'ساعة', 90: 'ساعة ونصف' },
    details: 'تفاصيل الموعد',
    interviewer: 'المقابل',
    company: 'الشركة',
    job: 'الوظيفة',
    required: 'هذا الحقل مطلوب',
  },
  en: {
    title: 'Book Interview',
    selectTime: 'Select a time slot',
    duration: 'Duration',
    type: 'Interview Type',
    notes: 'Notes (optional)',
    notesPlaceholder: 'Add any notes or questions...',
    confirm: 'Confirm Booking',
    cancel: 'Cancel',
    booking: 'Booking...',
    success: 'Booked successfully ✅',
    error: 'Booking failed, please try again',
    types: { video_interview: 'Video Interview', phone_call: 'Phone Call', in_person: 'In Person' },
    durations: { 30: '30 min', 45: '45 min', 60: '1 hour', 90: '1.5 hours' },
    details: 'Appointment Details',
    interviewer: 'Interviewer',
    company: 'Company',
    job: 'Job',
    required: 'This field is required',
  },
  fr: {
    title: 'Réserver un entretien',
    selectTime: 'Choisissez un créneau',
    duration: 'Durée',
    type: 'Type d\'entretien',
    notes: 'Notes (optionnel)',
    notesPlaceholder: 'Ajoutez des notes ou questions...',
    confirm: 'Confirmer',
    cancel: 'Annuler',
    booking: 'Réservation...',
    success: 'Réservé avec succès ✅',
    error: 'Échec de la réservation',
    types: { video_interview: 'Entretien vidéo', phone_call: 'Appel téléphonique', in_person: 'En personne' },
    durations: { 30: '30 min', 45: '45 min', 60: '1 heure', 90: '1h30' },
    details: 'Détails du rendez-vous',
    interviewer: 'Intervieweur',
    company: 'Entreprise',
    job: 'Poste',
    required: 'Ce champ est requis',
  },
};

const API_BASE = import.meta.env.VITE_API_URL || '';

const BookingModal = ({
  isOpen,
  onClose,
  onSuccess,
  slot,           // { scheduledAt: Date }
  companyId,
  jobApplicationId,
  interviewerName,
  companyName,
  jobTitle,
}) => {
  const { language, token } = useApp();
  const tr = t[language] || t.ar;
  const isRTL = language === 'ar';
  const fontFamily = language === 'ar' ? 'Amiri, Cairo, serif' : language === 'fr' ? 'EB Garamond, serif' : 'Cormorant Garamond, serif';

  const [form, setForm] = useState({ type: 'video_interview', duration: 60, notes: '' });
  const [status, setStatus] = useState('idle'); // idle | booking | success | error
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!slot?.scheduledAt) return;

    setStatus('booking');
    setErrorMsg('');

    try {
      const res = await fetch(`${API_BASE}/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          type: form.type,
          title: jobTitle ? `مقابلة - ${jobTitle}` : 'موعد مقابلة',
          scheduledAt: slot.scheduledAt,
          duration: form.duration,
          participants: companyId ? [companyId] : [],
          jobApplicationId: jobApplicationId || null,
          notes: form.notes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || tr.error);

      setStatus('success');
      setTimeout(() => {
        onSuccess?.(data.appointment);
        onClose();
        setStatus('idle');
      }, 1500);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || tr.error);
    }
  };

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleString(language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="bm-overlay" role="dialog" aria-modal="true" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`bm-modal${isRTL ? ' bm-rtl' : ' bm-ltr'}`} dir={isRTL ? 'rtl' : 'ltr'} style={{ fontFamily }}>
        <button className="bm-close" onClick={onClose} aria-label={tr.cancel}>×</button>

        <h2 className="bm-title">{tr.title}</h2>

        {/* تفاصيل الموعد */}
        <div className="bm-details">
          <h3 className="bm-details-title">{tr.details}</h3>
          <div className="bm-detail-row">
            <span className="bm-detail-icon">🕐</span>
            <span>{formatDate(slot?.scheduledAt)}</span>
          </div>
          {companyName && (
            <div className="bm-detail-row">
              <span className="bm-detail-icon">🏢</span>
              <span>{tr.company}: {companyName}</span>
            </div>
          )}
          {jobTitle && (
            <div className="bm-detail-row">
              <span className="bm-detail-icon">💼</span>
              <span>{tr.job}: {jobTitle}</span>
            </div>
          )}
          {interviewerName && (
            <div className="bm-detail-row">
              <span className="bm-detail-icon">👤</span>
              <span>{tr.interviewer}: {interviewerName}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bm-form">
          {/* نوع المقابلة */}
          <div className="bm-field">
            <label className="bm-label">{tr.type}</label>
            <select
              className="bm-select"
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            >
              {Object.entries(tr.types).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {/* المدة */}
          <div className="bm-field">
            <label className="bm-label">{tr.duration}</label>
            <select
              className="bm-select"
              value={form.duration}
              onChange={e => setForm(f => ({ ...f, duration: parseInt(e.target.value) }))}
            >
              {Object.entries(tr.durations).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {/* ملاحظات */}
          <div className="bm-field">
            <label className="bm-label">{tr.notes}</label>
            <textarea
              className="bm-textarea"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder={tr.notesPlaceholder}
              rows={3}
            />
          </div>

          {status === 'error' && <p className="bm-error">{errorMsg}</p>}
          {status === 'success' && <p className="bm-success">{tr.success}</p>}

          <div className="bm-actions">
            <button type="button" className="bm-btn bm-btn--ghost" onClick={onClose} disabled={status === 'booking'}>
              {tr.cancel}
            </button>
            <button type="submit" className="bm-btn bm-btn--primary" disabled={status === 'booking' || status === 'success'}>
              {status === 'booking' ? tr.booking : tr.confirm}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
