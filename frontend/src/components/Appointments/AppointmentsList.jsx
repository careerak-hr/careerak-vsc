import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import './AppointmentsList.css';

/**
 * AppointmentsList - قائمة المواعيد مع فلترة وبحث وإجراءات
 * Requirements: User Story 2, 4 - عرض وإدارة المواعيد
 */

const t = {
  ar: {
    title: 'مواعيدي',
    search: 'بحث...',
    all: 'الكل',
    upcoming: 'القادمة',
    completed: 'المكتملة',
    cancelled: 'الملغاة',
    noAppointments: 'لا توجد مواعيد',
    noResults: 'لا توجد نتائج للبحث',
    loading: 'جاري التحميل...',
    cancel: 'إلغاء',
    reschedule: 'إعادة جدولة',
    viewDetails: 'التفاصيل',
    confirmCancel: 'هل أنت متأكد من إلغاء هذا الموعد؟',
    cancelReason: 'سبب الإلغاء (اختياري)',
    confirm: 'تأكيد',
    back: 'رجوع',
    cancelling: 'جاري الإلغاء...',
    cancelSuccess: 'تم الإلغاء بنجاح',
    cancelError: 'فشل الإلغاء',
    types: {
      video_interview: 'مقابلة فيديو',
      phone_call: 'هاتفية',
      in_person: 'حضوري',
    },
    statuses: {
      scheduled: 'مجدول',
      confirmed: 'مؤكد',
      completed: 'مكتمل',
      cancelled: 'ملغي',
      in_progress: 'جارٍ',
    },
    page: 'صفحة',
    of: 'من',
    prev: 'السابق',
    next: 'التالي',
    joinMeeting: 'انضم للاجتماع',
  },
  en: {
    title: 'My Appointments',
    search: 'Search...',
    all: 'All',
    upcoming: 'Upcoming',
    completed: 'Completed',
    cancelled: 'Cancelled',
    noAppointments: 'No appointments found',
    noResults: 'No search results',
    loading: 'Loading...',
    cancel: 'Cancel',
    reschedule: 'Reschedule',
    viewDetails: 'Details',
    confirmCancel: 'Are you sure you want to cancel this appointment?',
    cancelReason: 'Cancellation reason (optional)',
    confirm: 'Confirm',
    back: 'Back',
    cancelling: 'Cancelling...',
    cancelSuccess: 'Cancelled successfully',
    cancelError: 'Cancellation failed',
    types: {
      video_interview: 'Video Interview',
      phone_call: 'Phone Call',
      in_person: 'In Person',
    },
    statuses: {
      scheduled: 'Scheduled',
      confirmed: 'Confirmed',
      completed: 'Completed',
      cancelled: 'Cancelled',
      in_progress: 'In Progress',
    },
    page: 'Page',
    of: 'of',
    prev: 'Previous',
    next: 'Next',
    joinMeeting: 'Join Meeting',
  },
  fr: {
    title: 'Mes rendez-vous',
    search: 'Rechercher...',
    all: 'Tous',
    upcoming: 'À venir',
    completed: 'Terminés',
    cancelled: 'Annulés',
    noAppointments: 'Aucun rendez-vous',
    noResults: 'Aucun résultat',
    loading: 'Chargement...',
    cancel: 'Annuler',
    reschedule: 'Reprogrammer',
    viewDetails: 'Détails',
    confirmCancel: 'Confirmer l\'annulation de ce rendez-vous ?',
    cancelReason: 'Raison (optionnel)',
    confirm: 'Confirmer',
    back: 'Retour',
    cancelling: 'Annulation...',
    cancelSuccess: 'Annulé avec succès',
    cancelError: 'Échec de l\'annulation',
    types: {
      video_interview: 'Entretien vidéo',
      phone_call: 'Appel téléphonique',
      in_person: 'En personne',
    },
    statuses: {
      scheduled: 'Planifié',
      confirmed: 'Confirmé',
      completed: 'Terminé',
      cancelled: 'Annulé',
      in_progress: 'En cours',
    },
    page: 'Page',
    of: 'sur',
    prev: 'Précédent',
    next: 'Suivant',
    joinMeeting: 'Rejoindre',
  },
};

const API_BASE = import.meta.env.VITE_API_URL || '';
const LIMIT = 10;

const AppointmentsList = ({ onSelectAppointment }) => {
  const { language, token } = useApp();
  const tr = t[language] || t.ar;
  const isRTL = language === 'ar';
  const fontFamily = language === 'ar' ? 'Amiri, Cairo, serif' : language === 'fr' ? 'EB Garamond, serif' : 'Cormorant Garamond, serif';

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | upcoming | completed | cancelled
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [cancelModal, setCancelModal] = useState(null); // appointmentId | null
  const [cancelReason, setCancelReason] = useState('');
  const [cancelStatus, setCancelStatus] = useState('idle');

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (filter === 'upcoming') params.set('upcoming', 'true');
      else if (filter === 'completed') params.set('status', 'completed');
      else if (filter === 'cancelled') params.set('status', 'cancelled');

      const res = await fetch(`${API_BASE}/api/appointments?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(data.appointments || []);
        setPagination(data.pagination || { total: 0, pages: 1 });
      }
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    } finally {
      setLoading(false);
    }
  }, [token, filter, page]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  // فلترة بالبحث محلياً
  const filtered = search.trim()
    ? appointments.filter(a => {
        const q = search.toLowerCase();
        return (
          (a.title || '').toLowerCase().includes(q) ||
          (a.participants || []).some(p => {
            const u = p.userId;
            if (!u) return false;
            return `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase().includes(q);
          })
        );
      })
    : appointments;

  const handleCancel = async () => {
    if (!cancelModal) return;
    setCancelStatus('cancelling');
    try {
      const res = await fetch(`${API_BASE}/api/appointments/${cancelModal}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: cancelReason }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setCancelStatus('success');
      setTimeout(() => {
        setCancelModal(null);
        setCancelReason('');
        setCancelStatus('idle');
        fetchAppointments();
      }, 1200);
    } catch (err) {
      setCancelStatus('error');
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleString(language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US', {
      weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  const canCancel = (appt) => {
    if (!['scheduled', 'confirmed'].includes(appt.status)) return false;
    const diff = new Date(appt.scheduledAt) - new Date();
    return diff > 60 * 60 * 1000; // أكثر من ساعة
  };

  const canJoin = (appt) => {
    if (appt.status !== 'confirmed' && appt.status !== 'scheduled') return false;
    const diff = Math.abs(new Date(appt.scheduledAt) - new Date());
    return diff < 15 * 60 * 1000 && appt.meetingLink; // 15 دقيقة
  };

  return (
    <div className={`al-container${isRTL ? ' al-rtl' : ' al-ltr'}`} dir={isRTL ? 'rtl' : 'ltr'} style={{ fontFamily }}>
      <h2 className="al-title">{tr.title}</h2>

      {/* شريط الفلترة والبحث */}
      <div className="al-toolbar">
        <div className="al-filters">
          {['all', 'upcoming', 'completed', 'cancelled'].map(f => (
            <button
              key={f}
              className={`al-filter-btn${filter === f ? ' al-filter-btn--active' : ''}`}
              onClick={() => { setFilter(f); setPage(1); }}
            >
              {tr[f]}
            </button>
          ))}
        </div>
        <input
          className="al-search"
          type="text"
          placeholder={tr.search}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* القائمة */}
      {loading ? (
        <div className="al-loading">{tr.loading}</div>
      ) : filtered.length === 0 ? (
        <div className="al-empty">{search ? tr.noResults : tr.noAppointments}</div>
      ) : (
        <div className="al-list">
          {filtered.map(appt => (
            <div key={appt._id} className={`al-card al-card--${appt.status}`}>
              <div className="al-card-header">
                <span className={`al-badge al-badge--${appt.status}`}>
                  {tr.statuses[appt.status] || appt.status}
                </span>
                <span className="al-type">{tr.types[appt.type] || appt.type}</span>
              </div>

              <h3 className="al-card-title">{appt.title}</h3>
              <p className="al-card-date">{formatDate(appt.scheduledAt)}</p>

              {appt.participants?.length > 0 && (
                <div className="al-participants">
                  {appt.participants.slice(0, 3).map(p => {
                    const u = p.userId;
                    if (!u) return null;
                    return (
                      <span key={u._id} className="al-participant">
                        {u.firstName} {u.lastName}
                      </span>
                    );
                  })}
                </div>
              )}

              <div className="al-card-actions">
                <button
                  className="al-btn al-btn--outline"
                  onClick={() => onSelectAppointment?.(appt._id, appt.status)}
                >
                  {tr.viewDetails}
                </button>
                {canJoin(appt) && (
                  <a
                    href={appt.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="al-btn al-btn--primary"
                  >
                    {tr.joinMeeting}
                  </a>
                )}
                {canCancel(appt) && (
                  <button
                    className="al-btn al-btn--danger"
                    onClick={() => { setCancelModal(appt._id); setCancelStatus('idle'); }}
                  >
                    {tr.cancel}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="al-pagination">
          <button className="al-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            {tr.prev}
          </button>
          <span className="al-page-info">{tr.page} {page} {tr.of} {pagination.pages}</span>
          <button className="al-page-btn" disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)}>
            {tr.next}
          </button>
        </div>
      )}

      {/* نافذة تأكيد الإلغاء */}
      {cancelModal && (
        <div className="al-overlay" onClick={e => e.target === e.currentTarget && setCancelModal(null)}>
          <div className="al-cancel-modal" dir={isRTL ? 'rtl' : 'ltr'} style={{ fontFamily }}>
            <p className="al-cancel-msg">{tr.confirmCancel}</p>
            <textarea
              className="al-cancel-reason"
              placeholder={tr.cancelReason}
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              rows={3}
            />
            {cancelStatus === 'error' && <p className="al-cancel-error">{tr.cancelError}</p>}
            {cancelStatus === 'success' && <p className="al-cancel-success">{tr.cancelSuccess}</p>}
            <div className="al-cancel-actions">
              <button className="al-btn al-btn--outline" onClick={() => setCancelModal(null)} disabled={cancelStatus === 'cancelling'}>
                {tr.back}
              </button>
              <button className="al-btn al-btn--danger" onClick={handleCancel} disabled={cancelStatus === 'cancelling' || cancelStatus === 'success'}>
                {cancelStatus === 'cancelling' ? tr.cancelling : tr.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsList;
