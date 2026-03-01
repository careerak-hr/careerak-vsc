import React from 'react';
import './StopShareConfirmModal.css';

/**
 * مكون تأكيد إيقاف مشاركة الشاشة
 * يعرض نافذة تأكيد واضحة قبل إيقاف المشاركة
 */
const StopShareConfirmModal = ({ isOpen, onConfirm, onCancel, shareType }) => {
  if (!isOpen) return null;

  const getShareTypeText = () => {
    switch (shareType) {
      case 'screen':
        return 'الشاشة الكاملة';
      case 'window':
        return 'النافذة';
      case 'tab':
        return 'التبويب';
      default:
        return 'المشاركة';
    }
  };

  return (
    <div className="stop-share-modal-overlay" onClick={onCancel}>
      <div className="stop-share-modal" onClick={(e) => e.stopPropagation()}>
        {/* أيقونة التحذير */}
        <div className="modal-icon">
          <i className="fas fa-exclamation-triangle"></i>
        </div>

        {/* العنوان */}
        <h3 className="modal-title">إيقاف مشاركة الشاشة؟</h3>

        {/* الرسالة */}
        <p className="modal-message">
          هل أنت متأكد من إيقاف مشاركة {getShareTypeText()}؟
          <br />
          سيتوقف المشاركون الآخرون عن رؤية شاشتك.
        </p>

        {/* الأزرار */}
        <div className="modal-actions">
          <button
            className="btn-cancel"
            onClick={onCancel}
          >
            <i className="fas fa-times"></i>
            <span>إلغاء</span>
          </button>

          <button
            className="btn-confirm-stop"
            onClick={onConfirm}
          >
            <i className="fas fa-stop-circle"></i>
            <span>إيقاف المشاركة</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StopShareConfirmModal;
