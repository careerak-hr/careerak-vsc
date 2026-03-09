import React, { useState } from 'react';
import useAutoSave from '../hooks/useAutoSave';
import useUndoStack from '../hooks/useUndoStack';
import AutoSaveIndicator from '../components/Settings/AutoSaveIndicator';
import UndoButton from '../components/Settings/UndoButton';
import UndoNotification from '../components/Settings/UndoNotification';
import ConfirmationModal from '../components/Settings/ConfirmationModal';

/**
 * Example component demonstrating all UX features:
 * - Auto-save system
 * - Undo system
 * - Confirmation dialogs
 */
const UXFeaturesExample = () => {
  // Form state
  const [formData, setFormData] = useState({
    name: 'أحمد محمد',
    email: 'ahmed@example.com',
    bio: 'مطور برمجيات'
  });

  // Notification state
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  // Confirmation modal state
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Auto-save hook
  const saveFunction = async (data) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Saved:', data);
  };

  const { isSaving, lastSaved, error, triggerSave } = useAutoSave(saveFunction, 2000);

  // Undo stack hook
  const { canUndo, undo, pushChange, getTimeRemaining } = useUndoStack(5, 30000);

  // Handle form change
  const handleChange = (field, value) => {
    const oldValue = formData[field];
    const newData = { ...formData, [field]: value };

    // Update form
    setFormData(newData);

    // Push to undo stack
    pushChange({
      data: { field, oldValue, newValue: value },
      revertFunction: async ({ field, oldValue }) => {
        setFormData(prev => ({ ...prev, [field]: oldValue }));
        setNotification({
          show: true,
          message: `تم التراجع عن تغيير ${getFieldLabel(field)}`,
          type: 'success'
        });
      },
      description: `تغيير ${getFieldLabel(field)}`
    });

    // Trigger auto-save
    triggerSave(newData);
  };

  // Get field label in Arabic
  const getFieldLabel = (field) => {
    const labels = {
      name: 'الاسم',
      email: 'البريد الإلكتروني',
      bio: 'النبذة'
    };
    return labels[field] || field;
  };

  // Handle undo
  const handleUndo = async () => {
    try {
      await undo();
    } catch (error) {
      setNotification({
        show: true,
        message: error.message,
        type: 'error'
      });
    }
  };

  // Handle delete account (sensitive action)
  const handleDeleteAccount = () => {
    setShowConfirmation(true);
  };

  const confirmDeleteAccount = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Account deleted');
    setNotification({
      show: true,
      message: 'تم حذف الحساب بنجاح',
      type: 'success'
    });
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
      <h1 style={{ marginBottom: '24px', fontFamily: 'Amiri, serif' }}>
        مثال على ميزات UX المحسّنة
      </h1>

      {/* Auto-save indicator */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
        <AutoSaveIndicator 
          isSaving={isSaving}
          lastSaved={lastSaved}
          error={error}
        />
      </div>

      {/* Form */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            الاسم
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #D4816180',
              borderRadius: '8px',
              fontSize: '16px'
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            البريد الإلكتروني
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #D4816180',
              borderRadius: '8px',
              fontSize: '16px'
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            النبذة
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            rows={4}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #D4816180',
              borderRadius: '8px',
              fontSize: '16px',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
        </div>
      </div>

      {/* Undo button */}
      {canUndo && (
        <div style={{ marginBottom: '24px' }}>
          <UndoButton
            canUndo={canUndo}
            onUndo={handleUndo}
            getTimeRemaining={getTimeRemaining}
            lastChangeDescription={`آخر تغيير`}
          />
        </div>
      )}

      {/* Sensitive action button */}
      <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid #e0e0e0' }}>
        <button
          onClick={handleDeleteAccount}
          style={{
            padding: '12px 24px',
            backgroundColor: '#F44336',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          حذف الحساب
        </button>
      </div>

      {/* Confirmation modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={confirmDeleteAccount}
        title="تأكيد حذف الحساب"
        message="هل أنت متأكد من رغبتك في حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه."
        confirmText="حذف الحساب"
        cancelText="إلغاء"
        variant="danger"
        requiresTyping={true}
        confirmationText="حذف"
      >
        <div style={{ textAlign: 'right', marginTop: '16px' }}>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
            سيتم حذف:
          </p>
          <ul style={{ fontSize: '14px', color: '#666', paddingRight: '20px' }}>
            <li>جميع بياناتك الشخصية</li>
            <li>جميع طلبات التوظيف</li>
            <li>جميع الرسائل والمحادثات</li>
            <li>جميع الدورات المسجلة</li>
          </ul>
        </div>
      </ConfirmationModal>

      {/* Undo notification */}
      <UndoNotification
        show={notification.show}
        message={notification.message}
        type={notification.type}
        duration={3000}
        onClose={() => setNotification({ ...notification, show: false })}
      />

      {/* Instructions */}
      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>التعليمات:</h3>
        <ul style={{ fontSize: '14px', lineHeight: '1.8', paddingRight: '20px' }}>
          <li>قم بتعديل أي حقل - سيتم الحفظ تلقائياً بعد ثانيتين</li>
          <li>انقر على "تراجع" للتراجع عن آخر تغيير (خلال 30 ثانية)</li>
          <li>انقر على "حذف الحساب" لرؤية نافذة التأكيد</li>
          <li>اكتب "حذف" في نافذة التأكيد لتفعيل زر الحذف</li>
        </ul>
      </div>
    </div>
  );
};

export default UXFeaturesExample;
