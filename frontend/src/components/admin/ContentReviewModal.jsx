import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import './ContentReviewModal.css';

const ContentReviewModal = ({ content, contentType, onClose, onActionComplete }) => {
  const { language, fontFamily } = useApp();
  const [action, setAction] = useState(null); // 'approve', 'reject', 'delete'
  const [rejectReason, setRejectReason] = useState('');
  const [sendFeedback, setSendFeedback] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fontStyle = {
    fontFamily: fontFamily,
    fontWeight: 'inherit',
    fontStyle: 'inherit'
  };

  const translations = {
    ar: {
      reviewContent: 'مراجعة المحتوى',
      approve: 'موافقة',
      reject: 'رفض',
      delete: 'حذف',
      cancel: 'إلغاء',
      confirm: 'تأكيد',
      back: 'رجوع',
      approveConfirm: 'هل أنت متأكد من الموافقة على هذا المحتوى؟',
      rejectConfirm: 'هل أنت متأكد من رفض هذا المحتوى؟',
      deleteConfirm: 'هل أنت متأكد من حذف هذا المحتوى؟ هذا الإجراء لا يمكن التراجع عنه.',
      rejectReason: 'سبب الرفض',
      rejectReasonPlaceholder: 'أدخل سبب رفض هذا المحتوى...',
      rejectReasonRequired: 'سبب الرفض مطلوب',
      sendFeedback: 'إرسال ملاحظات للمنشئ',
      title: 'العنوان',
      description: 'الوصف',
      company: 'الشركة',
      field: 'المجال',
      postedBy: 'نشر بواسطة',
      createdAt: 'تاريخ الإنشاء',
      status: 'الحالة',
      rating: 'التقييم',
      comment: 'التعليق',
      flaggedBy: 'أبلغ عنه',
      flagReason: 'سبب الإبلاغ',
      actionSuccess: 'تم تنفيذ الإجراء بنجاح',
      actionError: 'حدث خطأ أثناء تنفيذ الإجراء',
      loading: 'جاري المعالجة...'
    },
    en: {
      reviewContent: 'Review Content',
      approve: 'Approve',
      reject: 'Reject',
      delete: 'Delete',
      cancel: 'Cancel',
      confirm: 'Confirm',
      back: 'Back',
      approveConfirm: 'Are you sure you want to approve this content?',
      rejectConfirm: 'Are you sure you want to reject this content?',
      deleteConfirm: 'Are you sure you want to delete this content? This action cannot be undone.',
      rejectReason: 'Rejection Reason',
      rejectReasonPlaceholder: 'Enter the reason for rejecting this content...',
      rejectReasonRequired: 'Rejection reason is required',
      sendFeedback: 'Send feedback to creator',
      title: 'Title',
      description: 'Description',
      company: 'Company',
      field: 'Field',
      postedBy: 'Posted By',
      createdAt: 'Created At',
      status: 'Status',
      rating: 'Rating',
      comment: 'Comment',
      flaggedBy: 'Flagged By',
      flagReason: 'Flag Reason',
      actionSuccess: 'Action completed successfully',
      actionError: 'Error performing action',
      loading: 'Processing...'
    },
    fr: {
      reviewContent: 'Examiner le Contenu',
      approve: 'Approuver',
      reject: 'Rejeter',
      delete: 'Supprimer',
      cancel: 'Annuler',
      confirm: 'Confirmer',
      back: 'Retour',
      approveConfirm: 'Êtes-vous sûr de vouloir approuver ce contenu?',
      rejectConfirm: 'Êtes-vous sûr de vouloir rejeter ce contenu?',
      deleteConfirm: 'Êtes-vous sûr de vouloir supprimer ce contenu? Cette action est irréversible.',
      rejectReason: 'Raison du Rejet',
      rejectReasonPlaceholder: 'Entrez la raison du rejet de ce contenu...',
      rejectReasonRequired: 'La raison du rejet est requise',
      sendFeedback: 'Envoyer des commentaires au créateur',
      title: 'Titre',
      description: 'Description',
      company: 'Entreprise',
      field: 'Domaine',
      postedBy: 'Publié Par',
      createdAt: 'Date de Création',
      status: 'Statut',
      rating: 'Évaluation',
      comment: 'Commentaire',
      flaggedBy: 'Signalé Par',
      flagReason: 'Raison du Signalement',
      actionSuccess: 'Action effectuée avec succès',
      actionError: 'Erreur lors de l\'exécution de l\'action',
      loading: 'Traitement en cours...'
    }
  };

  const t = translations[language] || translations.en;

  const handleAction = async () => {
    if (action === 'reject' && !rejectReason.trim()) {
      setError(t.rejectReasonRequired);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      let endpoint = '';
      let method = '';
      let body = {};

      if (action === 'approve') {
        endpoint = `/api/admin/content/${content._id}/approve`;
        method = 'PATCH';
        body = { contentType };
      } else if (action === 'reject') {
        endpoint = `/api/admin/content/${content._id}/reject`;
        method = 'PATCH';
        body = { contentType, reason: rejectReason };
      } else if (action === 'delete') {
        endpoint = `/api/admin/content/${content._id}?contentType=${contentType}`;
        method = 'DELETE';
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || ''}${endpoint}`,
        {
          method,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: method !== 'DELETE' ? JSON.stringify(body) : undefined
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Action failed');
      }

      onActionComplete();
    } catch (err) {
      console.error('Action error:', err);
      setError(err.message || t.actionError);
    } finally {
      setLoading(false);
    }
  };

  const renderContentDetails = () => {
    return (
      <div className="content-details" style={fontStyle}>
        <div className="detail-row">
          <strong>{t.title}:</strong>
          <span>{content.title || content.jobTitle || 'N/A'}</span>
        </div>

        {contentType === 'job' && (
          <>
            <div className="detail-row">
              <strong>{t.company}:</strong>
              <span>{content.company?.name || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <strong>{t.field}:</strong>
              <span>{content.field || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <strong>{t.description}:</strong>
              <p className="detail-description">{content.description || 'N/A'}</p>
            </div>
          </>
        )}

        {contentType === 'course' && (
          <>
            <div className="detail-row">
              <strong>{t.postedBy}:</strong>
              <span>{content.postedBy?.name || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <strong>{t.field}:</strong>
              <span>{content.field || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <strong>{t.description}:</strong>
              <p className="detail-description">{content.description || 'N/A'}</p>
            </div>
          </>
        )}

        {contentType === 'review' && (
          <>
            <div className="detail-row">
              <strong>{t.rating}:</strong>
              <span>{'⭐'.repeat(content.overallRating || 0)} ({content.overallRating}/5)</span>
            </div>
            <div className="detail-row">
              <strong>{t.comment}:</strong>
              <p className="detail-description">{content.comment || 'N/A'}</p>
            </div>
            <div className="detail-row">
              <strong>{t.flaggedBy}:</strong>
              <span>{content.flaggedBy?.length || 0} users</span>
            </div>
            {content.flagReason && (
              <div className="detail-row">
                <strong>{t.flagReason}:</strong>
                <span>{content.flagReason}</span>
              </div>
            )}
          </>
        )}

        <div className="detail-row">
          <strong>{t.createdAt}:</strong>
          <span>{new Date(content.createdAt).toLocaleString(language)}</span>
        </div>

        {content.status && (
          <div className="detail-row">
            <strong>{t.status}:</strong>
            <span className={`status-badge status-${content.status}`}>
              {content.status}
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderActionButtons = () => {
    return (
      <div className="action-buttons">
        <button
          className="btn btn-approve"
          onClick={() => setAction('approve')}
          disabled={loading}
          style={fontStyle}
        >
          {t.approve}
        </button>
        <button
          className="btn btn-reject"
          onClick={() => setAction('reject')}
          disabled={loading}
          style={fontStyle}
        >
          {t.reject}
        </button>
        <button
          className="btn btn-delete"
          onClick={() => setAction('delete')}
          disabled={loading}
          style={fontStyle}
        >
          {t.delete}
        </button>
      </div>
    );
  };

  const renderConfirmation = () => {
    let message = '';
    if (action === 'approve') message = t.approveConfirm;
    else if (action === 'reject') message = t.rejectConfirm;
    else if (action === 'delete') message = t.deleteConfirm;

    return (
      <div className="confirmation-section" style={fontStyle}>
        <p className="confirmation-message">{message}</p>

        {action === 'reject' && (
          <div className="reject-reason-section">
            <label htmlFor="rejectReason">{t.rejectReason}:</label>
            <textarea
              id="rejectReason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={t.rejectReasonPlaceholder}
              rows="4"
              style={fontStyle}
              disabled={loading}
            />
            <div className="checkbox-container">
              <input
                type="checkbox"
                id="sendFeedback"
                checked={sendFeedback}
                onChange={(e) => setSendFeedback(e.target.checked)}
                disabled={loading}
              />
              <label htmlFor="sendFeedback">{t.sendFeedback}</label>
            </div>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <div className="confirmation-buttons">
          <button
            className="btn btn-secondary"
            onClick={() => {
              setAction(null);
              setRejectReason('');
              setError('');
            }}
            disabled={loading}
            style={fontStyle}
          >
            {t.back}
          </button>
          <button
            className={`btn btn-${action}`}
            onClick={handleAction}
            disabled={loading}
            style={fontStyle}
          >
            {loading ? t.loading : t.confirm}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={fontStyle}>
        <div className="modal-header">
          <h2>{t.reviewContent}</h2>
          <button className="close-button" onClick={onClose} disabled={loading}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {!action ? (
            <>
              {renderContentDetails()}
              {renderActionButtons()}
            </>
          ) : (
            renderConfirmation()
          )}
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
            style={fontStyle}
          >
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentReviewModal;
