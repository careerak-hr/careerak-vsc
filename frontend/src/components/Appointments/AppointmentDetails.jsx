import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import LazyImage from '../LazyImage/LazyImage';
import './AppointmentDetails.css';

/**
 * AppointmentDetails - عرض تفاصيل مقابلة كاملة مع روابط سريعة لمعلومات الشركة
 * Requirements: User Story 2 - عرض تفاصيل المقابلة الكاملة
 * Requirements: User Story 7 - روابط سريعة لمعلومات الشركة
 */

const t = {
  ar: {
    title: 'تفاصيل الموعد',
    loading: 'جاري التحميل...',
    notFound: 'الموعد غير موجود',
    error: 'فشل تحميل التفاصيل',
    back: 'رجوع',
    scheduledAt: 'وقت الموعد',
    duration: 'المدة',
    type: 'نوع المقابلة',
    status: 'الحالة',
    location: 'الموقع',
    meetLink: 'رابط الاجتماع',
    joinMeeting: 'انضم للاجتماع',
    organizer: 'المنظم',
    participants: 'المشاركون',
    company: 'الشركة',
    job: 'الوظيفة',
    notes: 'ملاحظات',
    minutes: 'دقيقة',
    hour: 'ساعة',
    hours: 'ساعات',
    types: {
      video_interview: 'مقابلة فيديو',
      phone_call: 'مقابلة هاتفية',
      in_person: 'حضوري',
    },
    statuses: {
      scheduled: 'مجدول',
      confirmed: 'مؤكد',
      completed: 'مكتمل',
      cancelled: 'ملغي',
      in_progress: 'جارٍ',
    },
    virtual: 'افتراضي',
    inPerson: 'حضوري',
    copyLink: 'نسخ الرابط',
    copied: 'تم النسخ!',
    // روابط سريعة
    quickLinks: 'روابط سريعة',
    viewCompany: 'صفحة الشركة',
    viewJob: 'تفاصيل الوظيفة',
    contactCompany: 'تواصل مع الشركة',
    companyInfo: 'معلومات الشركة',
    companyWebsite: 'الموقع الإلكتروني',
    companyLocation: 'الموقع',
    companyDescription: 'عن الشركة',
    verified: 'موثّق',
    loadingCompanyInfo: 'جاري تحميل معلومات الشركة...',
    noCompanyInfo: 'لا تتوفر معلومات إضافية عن الشركة',
  },
  en: {
    title: 'Appointment Details',
    loading: 'Loading...',
    notFound: 'Appointment not found',
    error: 'Failed to load details',
    back: 'Back',
    scheduledAt: 'Scheduled At',
    duration: 'Duration',
    type: 'Interview Type',
    status: 'Status',
    location: 'Location',
    meetLink: 'Meeting Link',
    joinMeeting: 'Join Meeting',
    organizer: 'Organizer',
    participants: 'Participants',
    company: 'Company',
    job: 'Job',
    notes: 'Notes',
    minutes: 'min',
    hour: 'hour',
    hours: 'hours',
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
    virtual: 'Virtual',
    inPerson: 'In Person',
    copyLink: 'Copy Link',
    copied: 'Copied!',
    // quick links
    quickLinks: 'Quick Links',
    viewCompany: 'Company Page',
    viewJob: 'Job Details',
    contactCompany: 'Contact Company',
    companyInfo: 'Company Info',
    companyWebsite: 'Website',
    companyLocation: 'Location',
    companyDescription: 'About Company',
    verified: 'Verified',
    loadingCompanyInfo: 'Loading company info...',
    noCompanyInfo: 'No additional company info available',
  },
  fr: {
    title: 'Détails du rendez-vous',
    loading: 'Chargement...',
    notFound: 'Rendez-vous introuvable',
    error: 'Échec du chargement',
    back: 'Retour',
    scheduledAt: 'Planifié le',
    duration: 'Durée',
    type: 'Type d\'entretien',
    status: 'Statut',
    location: 'Lieu',
    meetLink: 'Lien de réunion',
    joinMeeting: 'Rejoindre',
    organizer: 'Organisateur',
    participants: 'Participants',
    company: 'Entreprise',
    job: 'Poste',
    notes: 'Notes',
    minutes: 'min',
    hour: 'heure',
    hours: 'heures',
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
    virtual: 'Virtuel',
    inPerson: 'En personne',
    copyLink: 'Copier le lien',
    copied: 'Copié !',
    // liens rapides
    quickLinks: 'Liens rapides',
    viewCompany: 'Page entreprise',
    viewJob: 'Détails du poste',
    contactCompany: 'Contacter l\'entreprise',
    companyInfo: 'Infos entreprise',
    companyWebsite: 'Site web',
    companyLocation: 'Localisation',
    companyDescription: 'À propos',
    verified: 'Vérifié',
    loadingCompanyInfo: 'Chargement des infos entreprise...',
    noCompanyInfo: 'Aucune info supplémentaire disponible',
  },
};

const API_BASE = import.meta.env.VITE_API_URL || '';

const AppointmentDetails = ({ appointmentId, onBack, onNavigate }) => {
  const { language, token } = useApp();
  const tr = t[language] || t.ar;
  const isRTL = language === 'ar';
  const fontFamily = language === 'ar'
    ? 'Amiri, Cairo, serif'
    : language === 'fr'
    ? 'EB Garamond, serif'
    : 'Cormorant Garamond, serif';

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // معلومات الشركة
  const [companyData, setCompanyData] = useState(null);
  const [companyLoading, setCompanyLoading] = useState(false);

  useEffect(() => {
    if (!appointmentId) return;
    const fetchDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE}/api/appointments/${appointmentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || tr.error);
        setAppointment(data.appointment);
      } catch (err) {
        setError(err.message || tr.error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [appointmentId, token, tr.error]);

  // جلب معلومات الشركة بعد تحميل الموعد
  useEffect(() => {
    if (!appointmentId || !appointment) return;
    const fetchCompanyInfo = async () => {
      setCompanyLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/appointments/${appointmentId}/company-info`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setCompanyData(data);
        }
      } catch {
        // non-blocking - لا نُظهر خطأ إذا فشل جلب معلومات الشركة
      } finally {
        setCompanyLoading(false);
      }
    };
    fetchCompanyInfo();
  }, [appointmentId, appointment, token]);

  const formatDate = (d) =>
    new Date(d).toLocaleString(
      language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US',
      { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    );

  const formatDuration = (mins) => {
    if (mins < 60) return `${mins} ${tr.minutes}`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const hLabel = h === 1 ? tr.hour : tr.hours;
    return m > 0 ? `${h} ${hLabel} ${m} ${tr.minutes}` : `${h} ${hLabel}`;
  };

  const handleCopyLink = () => {
    if (!appointment?.meetingLink) return;
    navigator.clipboard.writeText(appointment.meetingLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const canJoin = () => {
    if (!appointment) return false;
    if (!['confirmed', 'scheduled'].includes(appointment.status)) return false;
    const diff = Math.abs(new Date(appointment.scheduledAt) - new Date());
    return diff < 15 * 60 * 1000 && appointment.meetingLink;
  };

  const getUserName = (u) => {
    if (!u) return '';
    return `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || '';
  };

  const handleNavigate = (path) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.href = path;
    }
  };

  if (loading) return (
    <div className="ad-container" dir={isRTL ? 'rtl' : 'ltr'} style={{ fontFamily }}>
      <div className="ad-loading">{tr.loading}</div>
    </div>
  );

  if (error || !appointment) return (
    <div className="ad-container" dir={isRTL ? 'rtl' : 'ltr'} style={{ fontFamily }}>
      <button className="ad-back-btn" onClick={onBack}>← {tr.back}</button>
      <div className="ad-error">{error || tr.notFound}</div>
    </div>
  );

  const isVirtual = appointment.type === 'video_interview' || appointment.type === 'phone_call';

  return (
    <div
      className={`ad-container${isRTL ? ' ad-rtl' : ' ad-ltr'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ fontFamily }}
    >
      <button className="ad-back-btn" onClick={onBack}>
        {isRTL ? '→' : '←'} {tr.back}
      </button>

      <div className="ad-card">
        {/* Header */}
        <div className="ad-header">
          <div className="ad-header-info">
            <h2 className="ad-title">{appointment.title}</h2>
            <div className="ad-badges">
              <span className={`ad-badge ad-badge--${appointment.status}`}>
                {tr.statuses[appointment.status] || appointment.status}
              </span>
              <span className="ad-type-badge">
                {isVirtual ? `🎥 ${tr.virtual}` : `📍 ${tr.inPerson}`}
              </span>
            </div>
          </div>
        </div>

        {/* تفاصيل الوقت */}
        <div className="ad-section">
          <div className="ad-row">
            <span className="ad-icon">🕐</span>
            <div>
              <div className="ad-row-label">{tr.scheduledAt}</div>
              <div className="ad-row-value">{formatDate(appointment.scheduledAt)}</div>
            </div>
          </div>
          <div className="ad-row">
            <span className="ad-icon">⏱️</span>
            <div>
              <div className="ad-row-label">{tr.duration}</div>
              <div className="ad-row-value">{formatDuration(appointment.duration)}</div>
            </div>
          </div>
          <div className="ad-row">
            <span className="ad-icon">📋</span>
            <div>
              <div className="ad-row-label">{tr.type}</div>
              <div className="ad-row-value">{tr.types[appointment.type] || appointment.type}</div>
            </div>
          </div>
        </div>

        {/* رابط الاجتماع */}
        {appointment.meetingLink && (
          <div className="ad-section ad-meet-section">
            <div className="ad-row-label">{tr.meetLink}</div>
            <div className="ad-meet-row">
              <span className="ad-meet-link">{appointment.meetingLink}</span>
              <div className="ad-meet-actions">
                <button className="ad-copy-btn" onClick={handleCopyLink}>
                  {copied ? tr.copied : tr.copyLink}
                </button>
                {canJoin() && (
                  <a
                    href={appointment.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ad-join-btn"
                  >
                    {tr.joinMeeting}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* الموقع */}
        {appointment.location && (
          <div className="ad-section">
            <div className="ad-row">
              <span className="ad-icon">📍</span>
              <div>
                <div className="ad-row-label">{tr.location}</div>
                <div className="ad-row-value">{appointment.location}</div>
              </div>
            </div>
          </div>
        )}

        {/* المنظم والمشاركون */}
        <div className="ad-section">
          {appointment.organizerId && (
            <div className="ad-person-row">
              <span className="ad-icon">🏢</span>
              <div>
                <div className="ad-row-label">{tr.organizer}</div>
                <div className="ad-person">
                  {appointment.organizerId.profilePicture && (
                    <img src={appointment.organizerId.profilePicture} alt="" className="ad-avatar" />
                  )}
                  <span className="ad-person-name">
                    {appointment.organizerId.companyName || getUserName(appointment.organizerId)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {appointment.participants?.length > 0 && (
            <div className="ad-person-row">
              <span className="ad-icon">👥</span>
              <div>
                <div className="ad-row-label">{tr.participants}</div>
                <div className="ad-participants-list">
                  {appointment.participants.map(p => {
                    const u = p.userId;
                    if (!u) return null;
                    return (
                      <div key={u._id} className="ad-person">
                        {u.profilePicture && (
                          <img src={u.profilePicture} alt="" className="ad-avatar" />
                        )}
                        <span className="ad-person-name">{getUserName(u)}</span>
                        <span className={`ad-participant-status ad-participant-status--${p.status}`}>
                          {p.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* الوظيفة */}
        {appointment.jobApplicationId && (
          <div className="ad-section">
            <div className="ad-row">
              <span className="ad-icon">💼</span>
              <div>
                <div className="ad-row-label">{tr.job}</div>
                <div className="ad-row-value">
                  {appointment.jobApplicationId.jobTitle || appointment.jobApplicationId}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ملاحظات */}
        {appointment.notes && (
          <div className="ad-section">
            <div className="ad-row-label">{tr.notes}</div>
            <p className="ad-notes">{appointment.notes}</p>
          </div>
        )}

        {/* ==================== معلومات الشركة والروابط السريعة ==================== */}
        <div className="ad-section ad-company-section">
          <div className="ad-section-title">
            <span className="ad-icon">🏢</span>
            <span>{tr.companyInfo}</span>
          </div>

          {companyLoading ? (
            <div className="ad-company-loading">{tr.loadingCompanyInfo}</div>
          ) : companyData ? (
            <>
              {/* بطاقة الشركة */}
              <div className="ad-company-card">
                <div className="ad-company-header">
                  {companyData.company.logo ? (
                    <LazyImage
                      publicId={companyData.company.logo}
                      alt={companyData.company.name}
                      preset="LOGO_SMALL"
                      placeholder={true}
                      className="ad-company-logo"
                    />
                  ) : (
                    <div className="ad-company-logo-placeholder">
                      {(companyData.company.name || '?')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="ad-company-meta">
                    <div className="ad-company-name">
                      {companyData.company.name}
                      {companyData.company.verified && (
                        <span className="ad-verified-badge" title={tr.verified}>✓</span>
                      )}
                    </div>
                    {companyData.company.industry && (
                      <div className="ad-company-industry">{companyData.company.industry}</div>
                    )}
                  </div>
                </div>

                {companyData.company.description && (
                  <p className="ad-company-description">{companyData.company.description}</p>
                )}

                <div className="ad-company-details">
                  {companyData.company.location && (
                    <div className="ad-company-detail-row">
                      <span className="ad-detail-icon">📍</span>
                      <span className="ad-detail-text">{companyData.company.location}</span>
                    </div>
                  )}
                  {companyData.company.website && (
                    <div className="ad-company-detail-row">
                      <span className="ad-detail-icon">🌐</span>
                      <a
                        href={companyData.company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ad-company-website"
                      >
                        {tr.companyWebsite}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* الروابط السريعة */}
              <div className="ad-quick-links">
                <div className="ad-quick-links-title">{tr.quickLinks}</div>
                <div className="ad-quick-links-grid">
                  {/* رابط صفحة الشركة */}
                  <button
                    className="ad-quick-link-btn ad-quick-link-btn--primary"
                    onClick={() => handleNavigate(companyData.links.companyPage)}
                    aria-label={tr.viewCompany}
                  >
                    <span className="ad-ql-icon">🏢</span>
                    <span className="ad-ql-label">{tr.viewCompany}</span>
                  </button>

                  {/* رابط الوظيفة */}
                  {companyData.links.jobPage && (
                    <button
                      className="ad-quick-link-btn ad-quick-link-btn--secondary"
                      onClick={() => handleNavigate(companyData.links.jobPage)}
                      aria-label={tr.viewJob}
                    >
                      <span className="ad-ql-icon">💼</span>
                      <span className="ad-ql-label">{tr.viewJob}</span>
                    </button>
                  )}

                  {/* رابط المحادثة */}
                  <button
                    className="ad-quick-link-btn ad-quick-link-btn--chat"
                    onClick={() => handleNavigate(
                      companyData.links.chatConversationId
                        ? `/chat/${companyData.links.chatConversationId}`
                        : companyData.links.startChat
                    )}
                    aria-label={tr.contactCompany}
                  >
                    <span className="ad-ql-icon">💬</span>
                    <span className="ad-ql-label">{tr.contactCompany}</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="ad-company-empty">{tr.noCompanyInfo}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetails;
