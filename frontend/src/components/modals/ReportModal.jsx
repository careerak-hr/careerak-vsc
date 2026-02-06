import React, { useState } from 'react';
import './ReportModal.css';

const ReportModal = ({ isOpen, onClose, targetType, targetId, targetName }) => {
  // Note: useTranslate needs translations object parameter
  // For now using placeholder, should be updated with proper translations
  const t = (key) => key; // Placeholder translation function
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportReasons = [
    'harassment',
    'spam',
    'inappropriate_content',
    'fake_profile',
    'copyright_violation',
    'other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) return;

    setIsSubmitting(true);
    try {
      const reportData = {
        targetType,
        targetId,
        reason,
        description,
        timestamp: new Date().toISOString()
      };

      console.log('Submitting report:', reportData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(t.report_submitted_successfully);
      onClose();
      setReason('');
      setDescription('');
    } catch (error) {
      console.error('Error submitting report:', error);
      alert(t.report_submission_failed);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="report-modal-backdrop">
      <div className="report-modal-container">
        <div className="report-modal-content">
          <h2 className="report-modal-title">
            {t.report} {targetName || t.report_content}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="report-modal-label">
                {t.reason_for_report} *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="report-modal-select"
                required
              >
                <option value="">{t.select_reason}</option>
                {reportReasons.map((reportReason) => (
                  <option key={reportReason} value={reportReason}>
                    {t[`report_reason_${reportReason}`]}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="report-modal-label">
                {t.additional_details} ({t.optional})
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.describe_the_issue}
                className="report-modal-textarea"
                rows={4}
                maxLength={500}
              />
              <div className="report-modal-char-counter">
                {description.length}/500
              </div>
            </div>

            <div className="report-modal-actions">
              <button
                type="button"
                onClick={onClose}
                className="report-modal-btn report-modal-btn-secondary"
                disabled={isSubmitting}
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="report-modal-btn report-modal-btn-primary"
                disabled={isSubmitting || !reason}
              >
                {isSubmitting ? t.submitting : t.submit_report}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;