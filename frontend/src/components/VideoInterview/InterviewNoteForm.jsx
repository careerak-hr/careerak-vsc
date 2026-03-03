import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import './InterviewNoteForm.css';

/**
 * InterviewNoteForm Component
 * نموذج إضافة ملاحظات وتقييم المقابلة
 * 
 * Requirements: 8.4, 8.5
 */

const InterviewNoteForm = ({ interviewId, candidateId, onSubmit, onCancel, initialData = null }) => {
  const { language } = useApp();

  const [formData, setFormData] = useState({
    overallRating: initialData?.overallRating || 3,
    ratings: {
      technicalSkills: initialData?.ratings?.technicalSkills || 3,
      communicationSkills: initialData?.ratings?.communicationSkills || 3,
      problemSolving: initialData?.ratings?.problemSolving || 3,
      experience: initialData?.ratings?.experience || 3,
      culturalFit: initialData?.ratings?.culturalFit || 3
    },
    notes: {
      strengths: initialData?.notes?.strengths || '',
      weaknesses: initialData?.notes?.weaknesses || '',
      generalNotes: initialData?.notes?.generalNotes || '',
      recommendations: initialData?.notes?.recommendations || ''
    },
    decision: initialData?.decision || 'pending',
    priority: initialData?.priority || 'medium',
    visibility: initialData?.visibility || 'private',
    status: initialData?.status || 'draft'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const translations = {
    ar: {
      title: 'ملاحظات وتقييم المقابلة',
      overallRating: 'التقييم الإجمالي',
      detailedRatings: 'التقييمات التفصيلية',
      technicalSkills: 'المهارات التقنية',
      communicationSkills: 'مهارات التواصل',
      problemSolving: 'حل المشكلات',
      experience: 'الخبرة',
      culturalFit: 'الملاءمة الثقافية',
      notes: 'الملاحظات',
      strengths: 'نقاط القوة',
      weaknesses: 'نقاط الضعف',
      generalNotes: 'ملاحظات عامة',
      recommendations: 'التوصيات',
      decision: 'القرار النهائي',
      hire: 'قبول',
      reject: 'رفض',
      maybe: 'ربما',
      pending: 'قيد المراجعة',
      priority: 'الأولوية',
      high: 'عالية',
      medium: 'متوسطة',
      low: 'منخفضة',
      visibility: 'الوصول',
      private: 'خاص',
      team: 'مشترك مع الفريق',
      status: 'الحالة',
      draft: 'مسودة',
      final: 'نهائي',
      save: 'حفظ',
      cancel: 'إلغاء',
      saving: 'جاري الحفظ...',
      strengthsPlaceholder: 'اذكر نقاط القوة التي لاحظتها...',
      weaknessesPlaceholder: 'اذكر نقاط الضعف أو المجالات التي تحتاج تحسين...',
      generalNotesPlaceholder: 'ملاحظات عامة عن المقابلة...',
      recommendationsPlaceholder: 'توصياتك بخصوص المرشح...'
    },
    en: {
      title: 'Interview Notes & Rating',
      overallRating: 'Overall Rating',
      detailedRatings: 'Detailed Ratings',
      technicalSkills: 'Technical Skills',
      communicationSkills: 'Communication Skills',
      problemSolving: 'Problem Solving',
      experience: 'Experience',
      culturalFit: 'Cultural Fit',
      notes: 'Notes',
      strengths: 'Strengths',
      weaknesses: 'Weaknesses',
      generalNotes: 'General Notes',
      recommendations: 'Recommendations',
      decision: 'Final Decision',
      hire: 'Hire',
      reject: 'Reject',
      maybe: 'Maybe',
      pending: 'Pending',
      priority: 'Priority',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      visibility: 'Visibility',
      private: 'Private',
      team: 'Shared with Team',
      status: 'Status',
      draft: 'Draft',
      final: 'Final',
      save: 'Save',
      cancel: 'Cancel',
      saving: 'Saving...',
      strengthsPlaceholder: 'Mention the strengths you noticed...',
      weaknessesPlaceholder: 'Mention weaknesses or areas that need improvement...',
      generalNotesPlaceholder: 'General notes about the interview...',
      recommendationsPlaceholder: 'Your recommendations regarding the candidate...'
    },
    fr: {
      title: 'Notes et Évaluation de l\'Entretien',
      overallRating: 'Évaluation Globale',
      detailedRatings: 'Évaluations Détaillées',
      technicalSkills: 'Compétences Techniques',
      communicationSkills: 'Compétences en Communication',
      problemSolving: 'Résolution de Problèmes',
      experience: 'Expérience',
      culturalFit: 'Adéquation Culturelle',
      notes: 'Notes',
      strengths: 'Points Forts',
      weaknesses: 'Points Faibles',
      generalNotes: 'Notes Générales',
      recommendations: 'Recommandations',
      decision: 'Décision Finale',
      hire: 'Embaucher',
      reject: 'Rejeter',
      maybe: 'Peut-être',
      pending: 'En Attente',
      priority: 'Priorité',
      high: 'Haute',
      medium: 'Moyenne',
      low: 'Basse',
      visibility: 'Visibilité',
      private: 'Privé',
      team: 'Partagé avec l\'Équipe',
      status: 'Statut',
      draft: 'Brouillon',
      final: 'Final',
      save: 'Enregistrer',
      cancel: 'Annuler',
      saving: 'Enregistrement...',
      strengthsPlaceholder: 'Mentionnez les points forts que vous avez remarqués...',
      weaknessesPlaceholder: 'Mentionnez les faiblesses ou les domaines à améliorer...',
      generalNotesPlaceholder: 'Notes générales sur l\'entretien...',
      recommendationsPlaceholder: 'Vos recommandations concernant le candidat...'
    }
  };

  const t = translations[language] || translations.ar;

  const handleRatingChange = (field, value) => {
    if (field === 'overallRating') {
      setFormData(prev => ({ ...prev, overallRating: value }));
    } else {
      setFormData(prev => ({
        ...prev,
        ratings: { ...prev.ratings, [field]: value }
      }));
    }
  };

  const handleNoteChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      notes: { ...prev.notes, [field]: value }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = {
        interviewId,
        candidateId,
        ...formData
      };

      await onSubmit(data);
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (value, onChange) => {
    return (
      <div className="stars-rating">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            className={`star ${star <= value ? 'active' : ''}`}
            onClick={() => onChange(star)}
            disabled={loading}
          >
            ★
          </button>
        ))}
        <span className="rating-value">{value}/5</span>
      </div>
    );
  };

  return (
    <div className="interview-note-form">
      <h2>{t.title}</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* التقييم الإجمالي */}
        <div className="form-section">
          <label>{t.overallRating}</label>
          {renderStars(formData.overallRating, (value) => handleRatingChange('overallRating', value))}
        </div>

        {/* التقييمات التفصيلية */}
        <div className="form-section">
          <h3>{t.detailedRatings}</h3>
          
          <div className="rating-item">
            <label>{t.technicalSkills}</label>
            {renderStars(formData.ratings.technicalSkills, (value) => handleRatingChange('technicalSkills', value))}
          </div>

          <div className="rating-item">
            <label>{t.communicationSkills}</label>
            {renderStars(formData.ratings.communicationSkills, (value) => handleRatingChange('communicationSkills', value))}
          </div>

          <div className="rating-item">
            <label>{t.problemSolving}</label>
            {renderStars(formData.ratings.problemSolving, (value) => handleRatingChange('problemSolving', value))}
          </div>

          <div className="rating-item">
            <label>{t.experience}</label>
            {renderStars(formData.ratings.experience, (value) => handleRatingChange('experience', value))}
          </div>

          <div className="rating-item">
            <label>{t.culturalFit}</label>
            {renderStars(formData.ratings.culturalFit, (value) => handleRatingChange('culturalFit', value))}
          </div>
        </div>

        {/* الملاحظات */}
        <div className="form-section">
          <h3>{t.notes}</h3>

          <div className="form-group">
            <label>{t.strengths}</label>
            <textarea
              value={formData.notes.strengths}
              onChange={(e) => handleNoteChange('strengths', e.target.value)}
              placeholder={t.strengthsPlaceholder}
              maxLength={1000}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>{t.weaknesses}</label>
            <textarea
              value={formData.notes.weaknesses}
              onChange={(e) => handleNoteChange('weaknesses', e.target.value)}
              placeholder={t.weaknessesPlaceholder}
              maxLength={1000}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>{t.generalNotes}</label>
            <textarea
              value={formData.notes.generalNotes}
              onChange={(e) => handleNoteChange('generalNotes', e.target.value)}
              placeholder={t.generalNotesPlaceholder}
              maxLength={2000}
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>{t.recommendations}</label>
            <textarea
              value={formData.notes.recommendations}
              onChange={(e) => handleNoteChange('recommendations', e.target.value)}
              placeholder={t.recommendationsPlaceholder}
              maxLength={1000}
              rows={3}
            />
          </div>
        </div>

        {/* القرار والإعدادات */}
        <div className="form-section">
          <div className="form-row">
            <div className="form-group">
              <label>{t.decision}</label>
              <select
                value={formData.decision}
                onChange={(e) => setFormData(prev => ({ ...prev, decision: e.target.value }))}
              >
                <option value="pending">{t.pending}</option>
                <option value="hire">{t.hire}</option>
                <option value="maybe">{t.maybe}</option>
                <option value="reject">{t.reject}</option>
              </select>
            </div>

            {formData.decision === 'hire' && (
              <div className="form-group">
                <label>{t.priority}</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                >
                  <option value="high">{t.high}</option>
                  <option value="medium">{t.medium}</option>
                  <option value="low">{t.low}</option>
                </select>
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{t.visibility}</label>
              <select
                value={formData.visibility}
                onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value }))}
              >
                <option value="private">{t.private}</option>
                <option value="team">{t.team}</option>
              </select>
            </div>

            <div className="form-group">
              <label>{t.status}</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="draft">{t.draft}</option>
                <option value="final">{t.final}</option>
              </select>
            </div>
          </div>
        </div>

        {/* الأزرار */}
        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn-cancel"
            disabled={loading}
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            className="btn-save"
            disabled={loading}
          >
            {loading ? t.saving : t.save}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InterviewNoteForm;
