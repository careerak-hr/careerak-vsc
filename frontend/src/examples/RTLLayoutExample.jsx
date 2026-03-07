/**
 * RTL Layout Example Component
 * 
 * Demonstrates RTL layout for Apply Page components in Arabic
 * Requirements: 9.8, 10.8
 */

import React, { useState } from 'react';
import '../styles/applyPageRTL.css';

const RTLLayoutExample = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [language, setLanguage] = useState('ar');

  // Toggle between RTL (Arabic) and LTR (English)
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ar' ? 'en' : 'ar');
  };

  const isRTL = language === 'ar';

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} lang={language}>
      <div style={{ padding: '2rem', fontFamily: isRTL ? 'Amiri, Cairo, serif' : 'Cormorant Garamond, serif' }}>
        
        {/* Language Toggle */}
        <div style={{ marginBottom: '2rem', textAlign: isRTL ? 'right' : 'left' }}>
          <button 
            onClick={toggleLanguage}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#304B60',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}
          >
            {isRTL ? 'Switch to English' : 'التبديل إلى العربية'}
          </button>
        </div>

        <h1 style={{ marginBottom: '2rem' }}>
          {isRTL ? 'نموذج التقديم على الوظيفة' : 'Job Application Form'}
        </h1>

        {/* Progress Indicator */}
        <div className="progress-indicator" style={{ 
          display: 'flex', 
          marginBottom: '2rem',
          gap: '1rem'
        }}>
          {[1, 2, 3, 4, 5].map(step => (
            <div 
              key={step}
              className="progress-step"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: step <= currentStep ? '#304B60' : '#E3DAD1',
                color: step <= currentStep ? 'white' : '#304B60',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}
            >
              {step}
            </div>
          ))}
        </div>

        {/* Form Fields */}
        <div style={{ marginBottom: '2rem' }}>
          <label className="form-field-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            {isRTL ? 'الاسم الكامل' : 'Full Name'}
          </label>
          <input 
            type="text"
            className="form-field"
            placeholder={isRTL ? 'أدخل اسمك الكامل' : 'Enter your full name'}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid #D4816180',
              borderRadius: '0.375rem',
              fontSize: '16px'
            }}
          />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label className="form-field-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            {isRTL ? 'البريد الإلكتروني' : 'Email'}
          </label>
          <input 
            type="email"
            className="form-field"
            placeholder={isRTL ? 'example@email.com' : 'example@email.com'}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid #D4816180',
              borderRadius: '0.375rem',
              fontSize: '16px'
            }}
          />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label className="form-field-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            {isRTL ? 'رسالة التغطية' : 'Cover Letter'}
          </label>
          <textarea 
            className="form-field"
            placeholder={isRTL ? 'اكتب رسالة التغطية هنا...' : 'Write your cover letter here...'}
            rows={5}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid #D4816180',
              borderRadius: '0.375rem',
              fontSize: '16px',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Checkbox */}
        <div style={{ marginBottom: '2rem' }}>
          <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" className="checkbox-input" />
            <span>{isRTL ? 'أوافق على الشروط والأحكام' : 'I agree to the terms and conditions'}</span>
          </label>
        </div>

        {/* File Upload */}
        <div style={{ marginBottom: '2rem' }}>
          <label className="form-field-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            {isRTL ? 'رفع الملفات' : 'Upload Files'}
          </label>
          <div 
            className="file-upload-area"
            style={{
              border: '2px dashed #D4816180',
              borderRadius: '0.375rem',
              padding: '2rem',
              textAlign: 'center',
              backgroundColor: '#E3DAD1'
            }}
          >
            <p>{isRTL ? 'اسحب الملفات هنا أو انقر للتحميل' : 'Drag files here or click to upload'}</p>
          </div>
        </div>

        {/* Validation Messages */}
        <div style={{ marginBottom: '1rem' }}>
          <div className="error-message" style={{ 
            padding: '0.75rem', 
            backgroundColor: '#fee', 
            color: '#c00',
            borderRadius: '0.375rem',
            marginBottom: '0.5rem'
          }}>
            <span className="error-icon">⚠️</span>
            {isRTL ? 'هذا الحقل مطلوب' : 'This field is required'}
          </div>
          
          <div className="success-message" style={{ 
            padding: '0.75rem', 
            backgroundColor: '#efe', 
            color: '#0a0',
            borderRadius: '0.375rem'
          }}>
            <span className="success-icon">✓</span>
            {isRTL ? 'تم الحفظ بنجاح' : 'Saved successfully'}
          </div>
        </div>

        {/* Button Group */}
        <div className="button-group" style={{ 
          display: 'flex', 
          gap: '1rem',
          marginTop: '2rem'
        }}>
          <button 
            className="btn-previous"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: currentStep === 1 ? '#ccc' : '#E3DAD1',
              color: '#304B60',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {isRTL ? 'السابق' : 'Previous'}
          </button>
          
          <button 
            className="btn-next"
            onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
            disabled={currentStep === 5}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: currentStep === 5 ? '#ccc' : '#304B60',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: currentStep === 5 ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {isRTL ? 'التالي' : 'Next'}
          </button>
        </div>

        {/* Status Timeline */}
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>
            {isRTL ? 'حالة الطلب' : 'Application Status'}
          </h2>
          <div className="status-timeline" style={{ 
            display: 'flex', 
            gap: '1rem',
            alignItems: 'center'
          }}>
            <div className="timeline-item" style={{ 
              padding: '1rem', 
              backgroundColor: '#304B60',
              color: 'white',
              borderRadius: '0.375rem',
              flex: 1,
              textAlign: 'center'
            }}>
              {isRTL ? 'تم الإرسال' : 'Submitted'}
            </div>
            <div className="timeline-item" style={{ 
              padding: '1rem', 
              backgroundColor: '#E3DAD1',
              color: '#304B60',
              borderRadius: '0.375rem',
              flex: 1,
              textAlign: 'center'
            }}>
              {isRTL ? 'تمت المراجعة' : 'Reviewed'}
            </div>
            <div className="timeline-item" style={{ 
              padding: '1rem', 
              backgroundColor: '#E3DAD1',
              color: '#304B60',
              borderRadius: '0.375rem',
              flex: 1,
              textAlign: 'center'
            }}>
              {isRTL ? 'تم القبول' : 'Accepted'}
            </div>
          </div>
        </div>

        {/* Modal Example */}
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>
            {isRTL ? 'مثال على النافذة المنبثقة' : 'Modal Example'}
          </h2>
          <div 
            className="modal"
            style={{
              border: '2px solid #304B60',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              backgroundColor: 'white'
            }}
          >
            <div className="modal-header" style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <h3 className="modal-title">{isRTL ? 'تأكيد الإرسال' : 'Confirm Submission'}</h3>
              <button className="modal-close" style={{ 
                background: 'none', 
                border: 'none', 
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}>×</button>
            </div>
            <div className="modal-body" style={{ marginBottom: '1rem' }}>
              <p>{isRTL ? 'هل أنت متأكد من إرسال الطلب؟' : 'Are you sure you want to submit the application?'}</p>
            </div>
            <div className="modal-footer" style={{ 
              display: 'flex', 
              gap: '1rem'
            }}>
              <button style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#E3DAD1',
                color: '#304B60',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer'
              }}>
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
              <button style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#304B60',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer'
              }}>
                {isRTL ? 'تأكيد' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>

        {/* Auto-Save Indicator */}
        <div style={{ marginTop: '2rem' }}>
          <div className="auto-save-indicator" style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#E3DAD1',
            borderRadius: '0.375rem'
          }}>
            <span className="save-icon">💾</span>
            <span>{isRTL ? 'تم الحفظ تلقائياً' : 'Auto-saved'}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RTLLayoutExample;
