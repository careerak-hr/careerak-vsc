import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../../context/AppContext';

const translations = {
  ar: {
    title: 'الشهادات الصادرة',
    search: 'بحث باسم الطالب أو الدورة أو رقم الشهادة',
    filterStatus: 'الحالة',
    filterCourse: 'الدورة',
    allStatuses: 'جميع الحالات',
    allCourses: 'جميع الدورات',
    colStudent: 'الطالب',
    colCourse: 'الدورة',
    colDate: 'تاريخ الإصدار',
    colStatus: 'الحالة',
    colActions: 'الإجراءات',
    statusActive: 'نشطة',
    statusRevoked: 'ملغاة',
    statusExpired: 'منتهية',
    actionVerify: 'التحقق',
    actionRevoke: 'إلغاء',
    actionReissue: 'إعادة إصدار',
    loading: 'جاري التحميل...',
    noResults: 'لا توجد شهادات',
    total: 'الإجمالي',
    active: 'نشطة',
    revoked: 'ملغاة',
    expired: 'منتهية',
    page: 'صفحة',
    of: 'من',
    prev: 'السابق',
    next: 'التالي',
    linkedIn: 'LinkedIn',
    confirmRevoke: 'تأكيد إلغاء الشهادة',
    confirmRevokeMsg: 'هل أنت متأكد من إلغاء شهادة',
    confirmReissue: 'تأكيد إعادة إصدار الشهادة',
    confirmReissueMsg: 'هل تريد إعادة إصدار شهادة جديدة لـ',
    reasonLabel: 'السبب (اختياري)',
    reasonPlaceholder: 'أدخل سبب الإلغاء...',
    reissueReasonPlaceholder: 'أدخل سبب إعادة الإصدار...',
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    revokeSuccess: 'تم إلغاء الشهادة بنجاح',
    reissueSuccess: 'تم إعادة إصدار الشهادة بنجاح',
    errorAction: 'حدث خطأ، يرجى المحاولة مجدداً',
  },
  en: {
    title: 'Issued Certificates',
    search: 'Search by student name, course or certificate ID',
    filterStatus: 'Status',
    filterCourse: 'Course',
    allStatuses: 'All Statuses',
    allCourses: 'All Courses',
    colStudent: 'Student',
    colCourse: 'Course',
    colDate: 'Issue Date',
    colStatus: 'Status',
    colActions: 'Actions',
    statusActive: 'Active',
    statusRevoked: 'Revoked',
    statusExpired: 'Expired',
    actionVerify: 'Verify',
    actionRevoke: 'Revoke',
    actionReissue: 'Reissue',
    loading: 'Loading...',
    noResults: 'No certificates found',
    total: 'Total',
    active: 'Active',
    revoked: 'Revoked',
    expired: 'Expired',
    page: 'Page',
    of: 'of',
    prev: 'Prev',
    next: 'Next',
    linkedIn: 'LinkedIn',
    confirmRevoke: 'Confirm Certificate Revocation',
    confirmRevokeMsg: 'Are you sure you want to revoke the certificate for',
    confirmReissue: 'Confirm Certificate Reissue',
    confirmReissueMsg: 'Do you want to reissue a new certificate for',
    reasonLabel: 'Reason (optional)',
    reasonPlaceholder: 'Enter revocation reason...',
    reissueReasonPlaceholder: 'Enter reissue reason...',
    cancel: 'Cancel',
    confirm: 'Confirm',
    revokeSuccess: 'Certificate revoked successfully',
    reissueSuccess: 'Certificate reissued successfully',
    errorAction: 'An error occurred, please try again',
  },
  fr: {
    title: 'Certificats Émis',
    search: "Rechercher par nom d'étudiant, cours ou ID",
    filterStatus: 'Statut',
    filterCourse: 'Cours',
    allStatuses: 'Tous les Statuts',
    allCourses: 'Tous les Cours',
    colStudent: 'Étudiant',
    colCourse: 'Cours',
    colDate: "Date d'Émission",
    colStatus: 'Statut',
    colActions: 'Actions',
    statusActive: 'Actif',
    statusRevoked: 'Révoqué',
    statusExpired: 'Expiré',
    actionVerify: 'Vérifier',
    actionRevoke: 'Révoquer',
    actionReissue: 'Réémettre',
    loading: 'Chargement...',
    noResults: 'Aucun certificat trouvé',
    total: 'Total',
    active: 'Actifs',
    revoked: 'Révoqués',
    expired: 'Expirés',
    page: 'Page',
    of: 'sur',
    prev: 'Précédent',
    next: 'Suivant',
    linkedIn: 'LinkedIn',
    confirmRevoke: 'Confirmer la Révocation',
    confirmRevokeMsg: 'Êtes-vous sûr de révoquer le certificat de',
    confirmReissue: 'Confirmer la Réémission',
    confirmReissueMsg: 'Voulez-vous réémettre un certificat pour',
    reasonLabel: 'Raison (optionnel)',
    reasonPlaceholder: 'Entrez la raison de révocation...',
    reissueReasonPlaceholder: 'Entrez la raison de réémission...',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    revokeSuccess: 'Certificat révoqué avec succès',
    reissueSuccess: 'Certificat réémis avec succès',
    errorAction: 'Une erreur est survenue, veuillez réessayer',
  },
};

const LIMIT = 20;

// Confirmation modal for revoke/reissue
const ConfirmModal = ({ isOpen, type, certName, reason, onReasonChange, onConfirm, onCancel, t, isRTL, fontStyle, loading }) => {
  if (!isOpen) return null;
  const isRevoke = type === 'revoke';
  return (
    <div
      className="cert-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cert-modal-title"
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        className={`cert-modal-box ${isRTL ? 'rtl' : 'ltr'}`}
        style={fontStyle}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <h3 id="cert-modal-title" className={`cert-modal-title ${isRevoke ? 'revoke' : 'reissue'}`}>
          {isRevoke ? '🚫 ' + t.confirmRevoke : '🔄 ' + t.confirmReissue}
        </h3>
        <p className="cert-modal-msg">
          {isRevoke ? t.confirmRevokeMsg : t.confirmReissueMsg}{' '}
          <strong>{certName}</strong>?
        </p>
        <div className="cert-modal-field">
          <label className="cert-modal-label">{t.reasonLabel}</label>
          <textarea
            className="cert-modal-textarea"
            placeholder={isRevoke ? t.reasonPlaceholder : t.reissueReasonPlaceholder}
            value={reason}
            onChange={e => onReasonChange(e.target.value)}
            rows={3}
          />
        </div>
        <div className="cert-modal-actions">
          <button className="cert-modal-btn cancel" onClick={onCancel} disabled={loading}>
            {t.cancel}
          </button>
          <button
            className={`cert-modal-btn confirm ${isRevoke ? 'revoke' : 'reissue'}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? '...' : t.confirm}
          </button>
        </div>
      </div>
    </div>
  );
};

const IssuedCertificatesList = () => {
  const { language } = useApp();
  const t = translations[language] || translations.ar;
  const isRTL = language === 'ar';
  const fontFamily = language === 'ar' ? "'Amiri', 'Cairo', serif"
    : language === 'fr' ? "'EB Garamond', serif"
    : "'Cormorant Garamond', serif";

  const [certificates, setCertificates] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState({ total: 0, active: 0, revoked: 0, expired: 0 });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');

  // Modal state
  const [modal, setModal] = useState({ open: false, type: null, cert: null });
  const [modalReason, setModalReason] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const fontStyle = { fontFamily };

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/certificates/management/stats`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await res.json();
      if (res.ok && data.stats) setStats(data.stats);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  const fetchCertificates = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page,
        limit: LIMIT,
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(courseFilter && { courseId: courseFilter }),
      });

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/certificates/management/issued?${params}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setCertificates(data.certificates || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      if (data.courses) setCourses(data.courses);
    } catch (err) {
      console.error('Error fetching issued certificates:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, courseFilter]);

  useEffect(() => {
    fetchCertificates();
    fetchStats();
  }, [fetchCertificates, fetchStats]);

  useEffect(() => {
    const timer = setTimeout(() => setPage(1), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const openModal = (type, cert) => {
    setModal({ open: true, type, cert });
    setModalReason('');
  };

  const closeModal = () => {
    if (modalLoading) return;
    setModal({ open: false, type: null, cert: null });
    setModalReason('');
  };

  const handleConfirm = async () => {
    if (!modal.cert) return;
    setModalLoading(true);
    try {
      const token = localStorage.getItem('token');
      const { type, cert } = modal;
      const isRevoke = type === 'revoke';

      const url = `${import.meta.env.VITE_API_URL}/api/certificates/${cert.certificateId}/${isRevoke ? 'revoke' : 'reissue'}`;
      const method = isRevoke ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: modalReason }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.messageAr || data.message);

      showToast(isRevoke ? t.revokeSuccess : t.reissueSuccess);
      closeModal();
      fetchCertificates();
      fetchStats();
    } catch (err) {
      showToast(err.message || t.errorAction, true);
    } finally {
      setModalLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString(
      language === 'ar' ? 'ar-EG' : language === 'fr' ? 'fr-FR' : 'en-US'
    );
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const statusLabel = (status) => {
    if (status === 'active') return t.statusActive;
    if (status === 'revoked') return t.statusRevoked;
    if (status === 'expired') return t.statusExpired;
    return status;
  };

  return (
    <div className="issued-certs-section" style={fontStyle} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Toast */}
      {toast && (
        <div className={`cert-toast ${toast.isError ? 'error' : 'success'}`} role="alert">
          {toast.msg}
        </div>
      )}

      {/* Stats */}
      <div className="certs-stats-bar">
        <span className="stat-chip total">{t.total}: {stats.total}</span>
        <span className="stat-chip active">{t.active}: {stats.active}</span>
        <span className="stat-chip revoked">{t.revoked}: {stats.revoked}</span>
        {stats.expired > 0 && (
          <span className="stat-chip expired">{t.expired}: {stats.expired}</span>
        )}
      </div>

      {/* Filters */}
      <div className="issued-certs-filters">
        <div className="search-input-wrap">
          <span className={`search-icon ${isRTL ? 'rtl' : ''}`}>🔍</span>
          <input
            type="text"
            placeholder={t.search}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ paddingInlineStart: 38 }}
          />
        </div>

        <select
          className="filter-select"
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">{t.allStatuses}</option>
          <option value="active">{t.statusActive}</option>
          <option value="revoked">{t.statusRevoked}</option>
          <option value="expired">{t.statusExpired}</option>
        </select>

        {courses.length > 0 && (
          <select
            className="filter-select"
            value={courseFilter}
            onChange={e => { setCourseFilter(e.target.value); setPage(1); }}
          >
            <option value="">{t.allCourses}</option>
            {courses.map(c => (
              <option key={c._id} value={c._id}>{c.title}</option>
            ))}
          </select>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-spinner">⏳ {t.loading}</div>
      ) : certificates.length === 0 ? (
        <div className="empty-state-msg">
          <div className="empty-icon">📜</div>
          <p>{t.noResults}</p>
        </div>
      ) : (
        <div className="certs-table-wrap">
          <table className="certs-table">
            <thead>
              <tr>
                <th>{t.colStudent}</th>
                <th>{t.colCourse}</th>
                <th>{t.colDate}</th>
                <th>{t.colStatus}</th>
                <th>{t.colActions}</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map(cert => (
                <tr key={cert._id || cert.certificateId}>
                  <td>
                    <div className="user-cell">
                      {cert.userImage ? (
                        <img src={cert.userImage} alt={cert.userName} className="user-avatar" />
                      ) : (
                        <div className="user-avatar-placeholder">{getInitials(cert.userName)}</div>
                      )}
                      <div>
                        <div className="user-name">{cert.userName}</div>
                        <div className="user-email">{cert.userEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td>{cert.courseTitle || cert.courseName}</td>
                  <td>{formatDate(cert.issueDate)}</td>
                  <td>
                    <span className={`status-badge ${cert.status}`}>
                      {statusLabel(cert.status)}
                    </span>
                  </td>
                  <td>
                    <div className="cert-actions-cell">
                      <button
                        className="action-icon-btn"
                        title={t.actionVerify}
                        onClick={() => window.open(`/verify/${cert.certificateId}`, '_blank')}
                        aria-label={t.actionVerify}
                      >
                        ✓
                      </button>
                      {cert.status === 'active' && (
                        <button
                          className="action-icon-btn revoke"
                          title={t.actionRevoke}
                          onClick={() => openModal('revoke', cert)}
                          aria-label={t.actionRevoke}
                        >
                          🚫
                        </button>
                      )}
                      {cert.status === 'revoked' && (
                        <button
                          className="action-icon-btn reissue"
                          title={t.actionReissue}
                          onClick={() => openModal('reissue', cert)}
                          aria-label={t.actionReissue}
                        >
                          🔄
                        </button>
                      )}
                      {cert.linkedInShared && (
                        <span className="action-icon-btn linkedin" title={t.linkedIn} aria-label={t.linkedIn}>
                          in
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            {isRTL ? '›' : '‹'}
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const start = Math.max(1, Math.min(page - 2, totalPages - 4));
            const pageNum = start + i;
            return (
              <button
                key={pageNum}
                className={`page-btn ${pageNum === page ? 'active' : ''}`}
                onClick={() => setPage(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            className="page-btn"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            {isRTL ? '‹' : '›'}
          </button>
          <span className="page-info">
            {t.page} {page} {t.of} {totalPages}
          </span>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={modal.open}
        type={modal.type}
        certName={modal.cert?.userName}
        reason={modalReason}
        onReasonChange={setModalReason}
        onConfirm={handleConfirm}
        onCancel={closeModal}
        t={t}
        isRTL={isRTL}
        fontStyle={fontStyle}
        loading={modalLoading}
      />
    </div>
  );
};

export default IssuedCertificatesList;
