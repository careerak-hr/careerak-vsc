import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield, AlertTriangle, Ban, CheckCircle, XCircle,
  RefreshCw, BarChart2, Unlock, Trash2, Eye, ChevronRight, ChevronLeft
} from 'lucide-react';
import './FraudDashboard.css';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://careerak-vsc.vercel.app';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
};

const STATUS_LABELS = {
  suspicious: { ar: 'مشبوه', color: '#D48161' },
  blocked:    { ar: 'محظور', color: '#c0392b' },
  clean:      { ar: 'نظيف',  color: '#27ae60' },
  all:        { ar: 'الكل',  color: '#304B60' }
};

const FLAG_LABELS = {
  same_ip:                    'نفس IP',
  same_device:                'نفس الجهاز',
  rapid_signups:              'تسجيل سريع',
  self_referral:              'إحالة ذاتية',
  same_ip_self_referral:      'إحالة ذاتية (IP)',
  same_device_self_referral:  'إحالة ذاتية (جهاز)',
  same_ip_concurrent_limit:   'تجاوز الحد المتزامن',
  same_ip_monthly_limit:      'تجاوز الحد الشهري',
  suspicious_pattern_ip_device: 'نمط مشبوه (IP+جهاز)',
  suspicious_pattern_burst:   'نمط انفجاري'
};

// ─── Modal تأكيد ────────────────────────────────────────────────────────────
function ConfirmModal({ open, title, desc, icon, confirmLabel, confirmClass, onConfirm, onCancel, children }) {
  if (!open) return null;
  return (
    <div className="fd-modal-overlay" onClick={onCancel}>
      <div className="fd-modal" onClick={e => e.stopPropagation()}>
        <h2 className="fd-modal__title">{icon}{title}</h2>
        {desc && <p className="fd-modal__desc">{desc}</p>}
        {children}
        <div className="fd-modal__actions">
          <button className={`fd-btn ${confirmClass}`} onClick={onConfirm}>{confirmLabel}</button>
          <button className="fd-btn fd-btn--outline" onClick={onCancel}>إلغاء</button>
        </div>
      </div>
    </div>
  );
}

// ─── صف الجدول ───────────────────────────────────────────────────────────────
function FraudRow({ check, actionLoading, onApprove, onReject, onBlock, onUnblock, onRevoke, onView }) {
  const isLoading = actionLoading === check._id;
  const user = check.userId;
  const statusInfo = STATUS_LABELS[check.status] || STATUS_LABELS.suspicious;
  const score = check.suspicionScore || 0;
  const scoreColor = score >= 70 ? '#c0392b' : score >= 40 ? '#D48161' : '#27ae60';

  return (
    <tr className={`fd-row fd-row--${check.status}`}>
      <td>
        <div className="fd-user">
          <span className="fd-user__name">{user?.name || 'مجهول'}</span>
          <span className="fd-user__email">{user?.email || '—'}</span>
        </div>
      </td>
      <td>
        <div className="fd-score">
          <div className="fd-score__bar-bg">
            <div className="fd-score__bar-fill" style={{ width: `${score}%`, background: scoreColor }} />
          </div>
          <span style={{ color: scoreColor, fontWeight: 700 }}>{score}</span>
        </div>
      </td>
      <td>
        <div className="fd-flags">
          {(check.flags || []).length > 0
            ? check.flags.map(f => <span key={f} className="fd-flag">{FLAG_LABELS[f] || f}</span>)
            : <span className="fd-flag fd-flag--none">—</span>}
        </div>
      </td>
      <td>
        <span className="fd-status" style={{ color: statusInfo.color, borderColor: statusInfo.color }}>
          {statusInfo.ar}
        </span>
      </td>
      <td>
        <span className="fd-date">
          {check.createdAt ? new Date(check.createdAt).toLocaleDateString('ar-SA') : '—'}
        </span>
      </td>
      <td>
        <div className="fd-actions">
          <button className="fd-action-btn fd-action-btn--view" title="عرض التفاصيل" onClick={onView}>
            <Eye size={15} />
          </button>
          {check.status === 'suspicious' && (
            <>
              <button className="fd-action-btn fd-action-btn--approve" title="قبول الإحالة" disabled={isLoading} onClick={onApprove}>
                <CheckCircle size={15} />
              </button>
              <button className="fd-action-btn fd-action-btn--reject" title="رفض الإحالة" disabled={isLoading} onClick={onReject}>
                <XCircle size={15} />
              </button>
            </>
          )}
          {check.status !== 'blocked' && (
            <button className="fd-action-btn fd-action-btn--block" title="حظر المستخدم" disabled={isLoading} onClick={onBlock}>
              <Ban size={15} />
            </button>
          )}
          {check.status === 'blocked' && (
            <button className="fd-action-btn fd-action-btn--unblock" title="رفع الحظر" disabled={isLoading} onClick={onUnblock}>
              <Unlock size={15} />
            </button>
          )}
          {check.referralId && (
            <button className="fd-action-btn fd-action-btn--revoke" title="إلغاء المكافآت" disabled={isLoading} onClick={onRevoke}>
              <Trash2 size={15} />
            </button>
          )}
          {isLoading && <RefreshCw size={15} className="fd-spin" />}
        </div>
      </td>
    </tr>
  );
}

// ─── المكوّن الرئيسي ──────────────────────────────────────────────────────────
export default function FraudDashboard() {
  const [checks, setChecks]           = useState([]);
  const [stats, setStats]             = useState(null);
  const [loading, setLoading]         = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('suspicious');
  const [minScore, setMinScore]       = useState('');
  const [maxScore, setMaxScore]       = useState('');
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [total, setTotal]             = useState(0);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast]             = useState(null);

  // Modal state
  const [modal, setModal] = useState({ open: false, type: null, check: null, note: '' });

  // Detail panel
  const [detailCheck, setDetailCheck] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchChecks = useCallback(async () => {
    setLoading(true);
    try {
      let url = `${BASE_URL}/fraud/suspicious?page=${page}&limit=15&status=${statusFilter}`;
      if (minScore !== '') url += `&minScore=${minScore}`;
      if (maxScore !== '') url += `&maxScore=${maxScore}`;
      const res = await fetch(url, { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok) {
        setChecks(data.checks || []);
        setTotal(data.total || 0);
        setTotalPages(data.pages || 1);
      }
    } catch {
      showToast('خطأ في جلب البيانات', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, minScore, maxScore]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/fraud/stats`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch { /* optional */ }
    finally { setStatsLoading(false); }
  }, []);

  useEffect(() => { fetchChecks(); }, [fetchChecks]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  // ── فتح التفاصيل ──
  const openDetail = async (check) => {
    setDetailLoading(true);
    setDetailCheck(check); // عرض فوري بالبيانات الموجودة
    try {
      const res = await fetch(`${BASE_URL}/fraud/suspicious/${check._id}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (res.ok) setDetailCheck(data.check);
    } catch { /* keep existing */ }
    finally { setDetailLoading(false); }
  };

  // ── فتح Modal ──
  const openModal = (type, check) => setModal({ open: true, type, check, note: '' });
  const closeModal = () => setModal({ open: false, type: null, check: null, note: '' });

  // ── تنفيذ الإجراء ──
  const executeAction = async () => {
    const { type, check, note } = modal;
    if (!check) return;
    closeModal();
    setActionLoading(check._id);

    try {
      let res, data;

      if (type === 'approve' || type === 'reject') {
        const referralId = check.referralId?._id || check.referralId;
        if (!referralId) { showToast('لا يوجد referralId لهذا السجل', 'error'); return; }
        res = await fetch(`${BASE_URL}/fraud/review/${referralId}`, {
          method: 'POST', headers: getAuthHeaders(),
          body: JSON.stringify({ action: type, note })
        });
      } else if (type === 'block') {
        const userId = check.userId?._id || check.userId;
        res = await fetch(`${BASE_URL}/fraud/block/${userId}`, {
          method: 'POST', headers: getAuthHeaders(),
          body: JSON.stringify({ note: note || 'حظر يدوي من لوحة التحكم' })
        });
      } else if (type === 'unblock') {
        const userId = check.userId?._id || check.userId;
        res = await fetch(`${BASE_URL}/fraud/unblock/${userId}`, {
          method: 'POST', headers: getAuthHeaders(),
          body: JSON.stringify({ note })
        });
      } else if (type === 'revoke') {
        const referralId = check.referralId?._id || check.referralId;
        if (!referralId) { showToast('لا يوجد referralId لهذا السجل', 'error'); return; }
        res = await fetch(`${BASE_URL}/fraud/revoke-rewards/${referralId}`, {
          method: 'POST', headers: getAuthHeaders(),
          body: JSON.stringify({ note })
        });
      }

      data = await res.json();
      if (res.ok) {
        showToast(data.message || 'تمت العملية بنجاح');
        fetchChecks();
        fetchStats();
        if (detailCheck?._id === check._id) openDetail(check);
      } else {
        showToast(data.error || 'حدث خطأ', 'error');
      }
    } catch {
      showToast('خطأ في الاتصال', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // ── إعدادات Modal حسب النوع ──
  const MODAL_CONFIG = {
    approve: { title: 'تأكيد الموافقة', desc: 'سيتم قبول هذه الإحالة وتحديث حالتها إلى مكتملة.', confirmLabel: 'موافقة', confirmClass: 'fd-btn--approve', icon: <CheckCircle size={18} color="#27ae60" /> },
    reject:  { title: 'تأكيد الرفض',   desc: 'سيتم رفض هذه الإحالة وإلغاؤها.',                  confirmLabel: 'رفض',    confirmClass: 'fd-btn--reject',  icon: <XCircle size={18} color="#c0392b" /> },
    block:   { title: 'حظر المستخدم',   desc: 'سيتم حظر المستخدم وإلغاء إحالاته المعلقة.',       confirmLabel: 'حظر',    confirmClass: 'fd-btn--block',   icon: <Ban size={18} color="#c0392b" /> },
    unblock: { title: 'رفع الحظر',      desc: 'سيتم رفع الحظر عن هذا المستخدم.',                 confirmLabel: 'رفع الحظر', confirmClass: 'fd-btn--approve', icon: <Unlock size={18} color="#27ae60" /> },
    revoke:  { title: 'إلغاء المكافآت', desc: 'سيتم إلغاء جميع مكافآت هذه الإحالة وخصم النقاط.', confirmLabel: 'إلغاء المكافآت', confirmClass: 'fd-btn--reject', icon: <Trash2 size={18} color="#c0392b" /> }
  };
  const mc = MODAL_CONFIG[modal.type] || {};

  return (
    <div className="fd-container" dir="rtl">
      {/* Toast */}
      {toast && <div className={`fd-toast fd-toast--${toast.type}`}>{toast.msg}</div>}

      {/* Header */}
      <div className="fd-header">
        <div className="fd-header__title">
          <Shield size={22} />
          <h1>لوحة مراجعة الاحتيال</h1>
        </div>
        <button className="fd-btn fd-btn--outline" onClick={() => { fetchChecks(); fetchStats(); }}>
          <RefreshCw size={15} /> تحديث
        </button>
      </div>

      {/* Stats */}
      {!statsLoading && stats && (
        <div className="fd-stats">
          {[
            { key: 'total',      label: 'إجمالي الفحوصات', icon: <BarChart2 size={18} />,    val: stats.summary?.total      || 0 },
            { key: 'suspicious', label: 'مشبوه',           icon: <AlertTriangle size={18} />, val: stats.summary?.suspicious || 0 },
            { key: 'blocked',    label: 'محظور',           icon: <Ban size={18} />,           val: stats.summary?.blocked    || 0 },
            { key: 'clean',      label: 'نظيف',            icon: <CheckCircle size={18} />,   val: stats.summary?.clean      || 0 }
          ].map(s => (
            <div key={s.key} className={`fd-stat-card fd-stat-card--${s.key}`}>
              {s.icon}
              <div>
                <span className="fd-stat-card__num">{s.val}</span>
                <span className="fd-stat-card__label">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="fd-filters">
        <span className="fd-filters__label">الحالة:</span>
        {['suspicious', 'blocked', 'clean', 'all'].map(s => (
          <button
            key={s}
            className={`fd-filter-btn ${statusFilter === s ? 'fd-filter-btn--active' : ''}`}
            style={statusFilter === s ? { background: STATUS_LABELS[s].color, borderColor: STATUS_LABELS[s].color, color: '#fff' } : {}}
            onClick={() => { setStatusFilter(s); setPage(1); }}
          >
            {STATUS_LABELS[s].ar}
          </button>
        ))}

        <span className="fd-filters__sep">|</span>
        <span className="fd-filters__label">درجة الشك:</span>
        <input
          className="fd-score-input"
          type="number" min="0" max="100" placeholder="من"
          value={minScore}
          onChange={e => { setMinScore(e.target.value); setPage(1); }}
        />
        <span>—</span>
        <input
          className="fd-score-input"
          type="number" min="0" max="100" placeholder="إلى"
          value={maxScore}
          onChange={e => { setMaxScore(e.target.value); setPage(1); }}
        />

        <span className="fd-filters__count">({total} سجل)</span>
      </div>

      {/* Layout: table + detail panel */}
      <div className={`fd-layout ${detailCheck ? 'fd-layout--split' : ''}`}>
        {/* Table */}
        <div className="fd-table-wrap">
          {loading ? (
            <div className="fd-loading"><RefreshCw size={22} className="fd-spin" /><span>جاري التحميل...</span></div>
          ) : checks.length === 0 ? (
            <div className="fd-empty"><Shield size={36} /><p>لا توجد سجلات بهذه الحالة</p></div>
          ) : (
            <table className="fd-table">
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
                    onApprove={() => openModal('approve', check)}
                    onReject={() => openModal('reject', check)}
                    onBlock={() => openModal('block', check)}
                    onUnblock={() => openModal('unblock', check)}
                    onRevoke={() => openModal('revoke', check)}
                    onView={() => openDetail(check)}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Detail Panel */}
        {detailCheck && (
          <div className="fd-detail">
            <div className="fd-detail__header">
              <h3>تفاصيل السجل</h3>
              <button className="fd-detail__close" onClick={() => setDetailCheck(null)}>✕</button>
            </div>
            {detailLoading ? (
              <div className="fd-loading"><RefreshCw size={18} className="fd-spin" /></div>
            ) : (
              <div className="fd-detail__body">
                <div className="fd-detail__row">
                  <span className="fd-detail__key">المستخدم</span>
                  <span className="fd-detail__val">{detailCheck.userId?.name || '—'}</span>
                </div>
                <div className="fd-detail__row">
                  <span className="fd-detail__key">البريد</span>
                  <span className="fd-detail__val">{detailCheck.userId?.email || '—'}</span>
                </div>
                <div className="fd-detail__row">
                  <span className="fd-detail__key">الحالة</span>
                  <span className="fd-status" style={{ color: STATUS_LABELS[detailCheck.status]?.color, borderColor: STATUS_LABELS[detailCheck.status]?.color }}>
                    {STATUS_LABELS[detailCheck.status]?.ar || detailCheck.status}
                  </span>
                </div>
                <div className="fd-detail__row">
                  <span className="fd-detail__key">درجة الشك</span>
                  <span className="fd-detail__val" style={{ fontWeight: 700, color: detailCheck.suspicionScore >= 70 ? '#c0392b' : '#D48161' }}>
                    {detailCheck.suspicionScore}
                  </span>
                </div>
                <div className="fd-detail__row">
                  <span className="fd-detail__key">العلامات</span>
                  <div className="fd-flags">
                    {(detailCheck.flags || []).map(f => <span key={f} className="fd-flag">{FLAG_LABELS[f] || f}</span>)}
                  </div>
                </div>
                {detailCheck.referralId && (
                  <>
                    <div className="fd-detail__row">
                      <span className="fd-detail__key">كود الإحالة</span>
                      <span className="fd-detail__val">{detailCheck.referralId?.referralCode || '—'}</span>
                    </div>
                    <div className="fd-detail__row">
                      <span className="fd-detail__key">حالة الإحالة</span>
                      <span className="fd-detail__val">{detailCheck.referralId?.status || '—'}</span>
                    </div>
                  </>
                )}
                {detailCheck.reviewedBy && (
                  <div className="fd-detail__row">
                    <span className="fd-detail__key">راجعه</span>
                    <span className="fd-detail__val">{detailCheck.reviewedBy?.name || '—'}</span>
                  </div>
                )}
                {detailCheck.reviewNote && (
                  <div className="fd-detail__row">
                    <span className="fd-detail__key">ملاحظة</span>
                    <span className="fd-detail__val">{detailCheck.reviewNote}</span>
                  </div>
                )}
                <div className="fd-detail__row">
                  <span className="fd-detail__key">تاريخ الإنشاء</span>
                  <span className="fd-detail__val">
                    {detailCheck.createdAt ? new Date(detailCheck.createdAt).toLocaleString('ar-SA') : '—'}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="fd-pagination">
          <button className="fd-btn fd-btn--outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
            <ChevronRight size={16} /> السابق
          </button>
          <span>{page} / {totalPages}</span>
          <button className="fd-btn fd-btn--outline" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
            التالي <ChevronLeft size={16} />
          </button>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        open={modal.open}
        title={mc.title}
        desc={mc.desc}
        icon={mc.icon}
        confirmLabel={mc.confirmLabel}
        confirmClass={mc.confirmClass}
        onConfirm={executeAction}
        onCancel={closeModal}
      >
        <div className="fd-modal__field">
          <label>ملاحظة (اختياري)</label>
          <textarea
            value={modal.note}
            onChange={e => setModal(m => ({ ...m, note: e.target.value }))}
            placeholder="أضف ملاحظة..."
            rows={3}
          />
        </div>
      </ConfirmModal>
    </div>
  );
}
