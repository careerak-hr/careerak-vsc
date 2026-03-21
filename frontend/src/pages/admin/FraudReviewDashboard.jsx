import React, { useState, useEffect, useCallback } from 'react';
import { Shield, AlertTriangle, Ban, CheckCircle, XCircle, Eye, RefreshCw, BarChart2 } from 'lucide-react';
import './FraudReviewDashboard.css';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://careerak-vsc.vercel.app';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
};

const STATUS_LABELS = {
  suspicious: { ar: 'مشبوه', color: '#D48161' },
  blocked: { ar: 'محظور', color: '#c0392b' },
  clean: { ar: 'نظيف', color: '#27ae60' },
  all: { ar: 'الكل', color: '#304B60' }
};

const FLAG_LABELS = {
  same_ip: 'نفس IP',
  same_device: 'نفس الجهاز',
  rapid_signups: 'تسجيل سريع',
  self_referral: 'إحالة ذاتية',
  same_ip_self_referral: 'إحالة ذاتية (IP)',
  same_device_self_referral: 'إحالة ذاتية (جهاز)',
  same_ip_concurrent_limit: 'تجاوز الحد المتزامن',
  same_ip_monthly_limit: 'تجاوز الحد الشهري',
  suspicious_pattern_ip_device: 'نمط مشبوه (IP+جهاز)',
  suspicious_pattern_burst: 'نمط انفجاري'
};

export default function FraudReviewDashboard() {
  const [checks, setChecks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('suspicious');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedCheck, setSelectedCheck] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchChecks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${BASE_URL}/fraud/suspicious?page=${page}&limit=15&status=${statusFilter}`,
        { headers: getAuthHeaders() }
      );
      const data = await res.json();
      if (res.ok) {
        setChecks(data.checks || []);
        setTotal(data.total || 0);
        setTotalPages(data.pages || 1);
      }
    } catch (e) {
      showToast('خطأ في جلب البيانات', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/fraud/stats`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch (e) {
      // stats optional
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChecks();
  }, [fetchChecks]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const openReviewModal = (check, action) => {
    setSelectedCheck(check);
    setPendingAction(action);
    setReviewNote('');
    setShowModal(true);
  };

  const confirmReview = async () => {
    if (!selectedCheck || !pendingAction) return;
    const referralId = selectedCheck.referralId?._id || selectedCheck.referralId;
    if (!referralId) {
      showToast('لا يوجد referralId لهذا السجل', 'error');
      setShowModal(false);
      return;
    }
    setActionLoading(selectedCheck._id);
    setShowModal(false);
    try {
      const res = await fetch(`${BASE_URL}/fraud/review/${referralId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: pendingAction, note: reviewNote })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'تمت العملية بنجاح');
        fetchChecks();
        fetchStats();
      } else {
        showToast(data.error || 'حدث خطأ', 'error');
      }
    } catch (e) {
      showToast('خطأ في الاتصال', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBlockUser = async (check) => {
    const userId = check.userId?._id || check.userId;
    if (!userId) return;
    if (!window.confirm('هل أنت متأكد من حظر هذا المستخدم وإلغاء مكافآته؟')) return;
    setActionLoading(check._id);
    try {
      const res = await fetch(`${BASE_URL}/fraud/block/${userId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ note: 'حظر يدوي من لوحة التحكم' })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('تم حظر المستخدم بنجاح');
        fetchChecks();
        fetchStats();
      } else {
        showToast(data.error || 'حدث خطأ', 'error');
      }
    } catch (e) {
      showToast('خطأ في الاتصال', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="frd-container" dir="rtl">
      {/* Toast */}
      {toast && (
        <div className={`frd-toast frd-toast--${toast.type}`}>{toast.msg}</div>
      )}

      {/* Header */}
      <div className="frd-header">
        <div className="frd-header__title">
          <Shield size={24} />
          <h1>لوحة مراجعة الاحتيال</h1>
        </div>
        <button className="frd-btn frd-btn--outline" onClick={() => { fetchChecks(); fetchStats(); }}>
          <RefreshCw size={16} /> تحديث
        </button>
      </div>

      {/* Stats Cards */}
      {!statsLoading && stats && (
        <div className="frd-stats">
          <div className="frd-stat-card frd-stat-card--total">
            <BarChart2 size={20} />
            <div>
              <span className="frd-stat-card__num">{stats.summary?.total || 0}</span>
              <span className="frd-stat-card__label">إجمالي الفحوصات</span>
            </div>
          </div>
          <div className="frd-stat-card frd-stat-card--suspicious">
            <AlertTriangle size={20} />
            <div>
              <span className="frd-stat-card__num">{stats.summary?.suspicious || 0}</span>
              <span className="frd-stat-card__label">مشبوه</span>
            </div>
          </div>
          <div className="frd-stat-card frd-stat-card--blocked">
            <Ban size={20} />
            <div>
              <span className="frd-stat-card__num">{stats.summary?.blocked || 0}</span>
              <span className="frd-stat-card__label">محظور</span>
            </div>
          </div>
          <div className="frd-stat-card frd-stat-card--clean">
            <CheckCircle size={20} />
            <div>
              <span className="frd-stat-card__num">{stats.summary?.clean || 0}</span>
              <span className="frd-stat-card__label">نظيف</span>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="frd-filters">
        <span className="frd-filters__label">فلترة حسب الحالة:</span>
        {['suspicious', 'blocked', 'clean', 'all'].map(s => (
          <button
            key={s}
            className={`frd-filter-btn ${statusFilter === s ? 'frd-filter-btn--active' : ''}`}
            style={statusFilter === s ? { borderColor: STATUS_LABELS[s].color, color: STATUS_LABELS[s].color } : {}}
            onClick={() => { setStatusFilter(s); setPage(1); }}
          >
            {STATUS_LABELS[s].ar}
          </button>
        ))}
        <span className="frd-filters__count">({total} سجل)</span>
      </div>

      {/* Table */}
      <div className="frd-table-wrap">
        {loading ? (
          <div className="frd-loading">
            <RefreshCw size={24} className="frd-spin" />
            <span>جاري التحميل...</span>
          </div>
        ) : checks.length === 0 ? (
          <div className="frd-empty">
            <Shield size={40} />
            <p>لا توجد سجلات بهذه الحالة</p>
          </div>
        ) : (
          <table className="frd-table">
            <thead>
              <tr>
                <th>المستخدم</th>
                <th>درجة الشك</th>
                <th>العلامات</th>
                <th>الحالة</th>
                <th>التاريخ</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {checks.map(check => (
                <FraudRow
                  key={check._id}
                  check={check}
                  actionLoading={actionLoading}
                  onApprove={() => openReviewModal(check, 'approve')}
                  onReject={() => openReviewModal(check, 'reject')}
                  onBlock={() => handleBlockUser(check)}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="frd-pagination">
          <button
            className="frd-btn frd-btn--outline"
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
          >
            السابق
          </button>
          <span>{page} / {totalPages}</span>
          <button
            className="frd-btn frd-btn--outline"
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            التالي
          </button>
        </div>
      )}

      {/* Review Modal */}
      {showModal && selectedCheck && (
        <div className="frd-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="frd-modal" onClick={e => e.stopPropagation()}>
            <h2 className="frd-modal__title">
              {pendingAction === 'approve' ? (
                <><CheckCircle size={20} color="#27ae60" /> تأكيد الموافقة</>
              ) : (
                <><XCircle size={20} color="#c0392b" /> تأكيد الرفض</>
              )}
            </h2>
            <p className="frd-modal__desc">
              {pendingAction === 'approve'
                ? 'سيتم قبول هذه الإحالة وتحديث حالتها إلى مكتملة.'
                : 'سيتم رفض هذه الإحالة وإلغاؤها.'}
            </p>
            <div className="frd-modal__field">
              <label>ملاحظة (اختياري)</label>
              <textarea
                value={reviewNote}
                onChange={e => setReviewNote(e.target.value)}
                placeholder="أضف ملاحظة للمراجعة..."
                rows={3}
              />
            </div>
            <div className="frd-modal__actions">
              <button
                className={`frd-btn ${pendingAction === 'approve' ? 'frd-btn--approve' : 'frd-btn--reject'}`}
                onClick={confirmReview}
              >
                {pendingAction === 'approve' ? 'موافقة' : 'رفض'}
              </button>
              <button className="frd-btn frd-btn--outline" onClick={() => setShowModal(false)}>
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FraudRow({ check, actionLoading, onApprove, onReject, onBlock }) {
  const isLoading = actionLoading === check._id;
  const user = check.userId;
  const statusInfo = STATUS_LABELS[check.status] || STATUS_LABELS.suspicious;

  return (
    <tr className={`frd-row frd-row--${check.status}`}>
      <td>
        <div className="frd-user">
          <span className="frd-user__name">{user?.name || 'مجهول'}</span>
          <span className="frd-user__email">{user?.email || '—'}</span>
        </div>
      </td>
      <td>
        <div className="frd-score">
          <div
            className="frd-score__bar"
            style={{ width: `${check.suspicionScore}%`, background: check.suspicionScore >= 70 ? '#c0392b' : check.suspicionScore >= 40 ? '#D48161' : '#27ae60' }}
          />
          <span>{check.suspicionScore}</span>
        </div>
      </td>
      <td>
        <div className="frd-flags">
          {(check.flags || []).map(f => (
            <span key={f} className="frd-flag">{FLAG_LABELS[f] || f}</span>
          ))}
          {(!check.flags || check.flags.length === 0) && <span className="frd-flag frd-flag--none">—</span>}
        </div>
      </td>
      <td>
        <span className="frd-status" style={{ color: statusInfo.color, borderColor: statusInfo.color }}>
          {statusInfo.ar}
        </span>
      </td>
      <td>
        <span className="frd-date">
          {check.createdAt ? new Date(check.createdAt).toLocaleDateString('ar-SA') : '—'}
        </span>
      </td>
      <td>
        <div className="frd-actions">
          {check.status === 'suspicious' && (
            <>
              <button
                className="frd-action-btn frd-action-btn--approve"
                title="قبول الإحالة"
                disabled={isLoading}
                onClick={onApprove}
              >
                <CheckCircle size={16} />
              </button>
              <button
                className="frd-action-btn frd-action-btn--reject"
                title="رفض الإحالة"
                disabled={isLoading}
                onClick={onReject}
              >
                <XCircle size={16} />
              </button>
            </>
          )}
          {check.status !== 'blocked' && (
            <button
              className="frd-action-btn frd-action-btn--block"
              title="حظر المستخدم"
              disabled={isLoading}
              onClick={onBlock}
            >
              <Ban size={16} />
            </button>
          )}
          {isLoading && <RefreshCw size={16} className="frd-spin" />}
        </div>
      </td>
    </tr>
  );
}
