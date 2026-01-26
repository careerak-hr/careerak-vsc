import React, { useState } from 'react';
import { useTranslate } from '../../hooks/useTranslate';

const ReportModal = ({ isOpen, onClose, targetType, targetId, targetName }) => {
  const t = useTranslate();
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
      // TODO: Implement API call to submit report
      const reportData = {
        targetType, // 'user', 'job_post', 'course', etc.
        targetId,
        reason,
        description,
        timestamp: new Date().toISOString()
      };

      console.log('Submitting report:', reportData);
      
      // Simulate API call
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-[#304B60] mb-4">
            {t.report} {targetName || t.report_content}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.reason_for_report} *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#304B60] focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.additional_details} ({t.optional})
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.describe_the_issue}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#304B60] focus:border-transparent resize-none"
                rows={4}
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-1">
                {description.length}/500
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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