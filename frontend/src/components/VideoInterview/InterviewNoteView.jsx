import React from 'react';
import { useApp } from '../../context/AppContext';
import './InterviewNoteView.css';

/**
 * InterviewNoteView Component
 * عرض ملاحظات وتقييم المقابلة
 * 
 * Requirements: 8.4, 8.5
 */

const InterviewNoteView = ({ note, onEdit, onDelete, canEdit = false }) => {
  const { language } = useApp();

  const translations = {
    ar: {
      overallRating: 'التقييم الإجمالي',
      detailedRatings: 'التقييمات التفصيلية',
      technicalSkills: 'المهارات التقنية',
      communicationSkills: 'مهارات التواصل',
      problemSolving: 'حل المشكلات',
      experience: 'الخبرة',
      culturalFit: 'الملاءمة الثقافية',
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
      status: 'الحالة',
      draft: 'مسودة',
      final: 'نهائي',
      evaluatedBy: 'تم التقييم بواسطة',
      evaluatedAt: 'تاريخ التقييم',
      edit: 'تعديل',
      delete: 'حذف',
      confirmDelete: 'هل أنت متأكد من حذف هذه الملاحظة؟',
      noNotes: 'لا توجد ملاحظات'
    },
    en: {
      overallRating: 'Overall Rating',
      detailedRatings: 'Detailed Ratings',
      technicalSkills: 'Technical Skills',
      communicationSkills: 'Communication Skills',
      problemSolving: 'Problem Solving',
      experience: 'Experience',
      culturalFit: 'Cultural Fit',
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
      status: 'Status',
      draft: 'Draft',
      final: 'Final',
      evaluatedBy: 'Evaluated By',
      evaluatedAt: 'Evaluation Date',
      edit: 'Edit',
      delete: 'Delete',
      confirmDelete: 'Are you sure you want to delete this note?',
      noNotes: 'No notes available'
    },
    fr: {
      overallRating: 'Évaluation Globale',
      detailedRatings: 'Évaluations Détaillées',
      technicalSkills: 'Compétences Techniques',
      communicationSkills: 'Compétences en Communication',
      problemSolving: 'Résolution de Problèmes',
      experience: 'Expérience',
      culturalFit: 'Adéquation Culturelle',
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
      status: 'Statut',
      draft: 'Brouillon',
      final: 'Final',
      evaluatedBy: 'Évalué Par',
      evaluatedAt: 'Date d\'Évaluation',
      edit: 'Modifier',
      delete: 'Supprimer',
      confirmDelete: 'Êtes-vous sûr de vouloir supprimer cette note?',
      noNotes: 'Aucune note disponible'
    }
  };

  const t = translations[language] || translations.ar;

  if (!note) {
    return <div className="no-notes">{t.noNotes}</div>;
  }

  const renderStars = (value) => {
    return (
      <div className="stars-display">
        {[1, 2, 3, 4, 5].map(star => (
          <span key={star} className={`star ${star <= value ? 'active' : ''}`}>
            ★
          </span>
        ))}
        <span className="rating-value">{value}/5</span>
      </div>
    );
  };

  const getDecisionClass = (decision) => {
    const classes = {
      hire: 'decision-hire',
      reject: 'decision-reject',
      maybe: 'decision-maybe',
      pending: 'decision-pending'
    };
    return classes[decision] || '';
  };

  const getPriorityClass = (priority) => {
    const classes = {
      high: 'priority-high',
      medium: 'priority-medium',
      low: 'priority-low'
    };
    return classes[priority] || '';
  };

  const handleDelete = () => {
    if (window.confirm(t.confirmDelete)) {
      onDelete(note._id);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(language === 'ar' ? 'ar-EG' : language === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="interview-note-view">
      {/* Header */}
      <div className="note-header">
        <div className="note-meta">
          <div className="evaluator-info">
            {note.evaluatorId?.profilePicture && (
              <img
                src={note.evaluatorId.profilePicture}
                alt={note.evaluatorId.name}
                className="evaluator-avatar"
              />
            )}
            <div>
              <div className="evaluator-name">{note.evaluatorId?.name}</div>
              <div className="evaluation-date">{formatDate(note.createdAt)}</div>
            </div>
          </div>

          {canEdit && (
            <div className="note-actions">
              <button onClick={() => onEdit(note)} className="btn-edit">
                {t.edit}
              </button>
              <button onClick={handleDelete} className="btn-delete">
                {t.delete}
              </button>
            </div>
          )}
        </div>

        <div className="note-badges">
          <span className={`badge ${getDecisionClass(note.decision)}`}>
            {t[note.decision]}
          </span>
          {note.decision === 'hire' && (
            <span className={`badge ${getPriorityClass(note.priority)}`}>
              {t[note.priority]}
            </span>
          )}
          <span className={`badge status-${note.status}`}>
            {t[note.status]}
          </span>
        </div>
      </div>

      {/* Overall Rating */}
      <div className="note-section">
        <h3>{t.overallRating}</h3>
        {renderStars(note.overallRating)}
      </div>

      {/* Detailed Ratings */}
      {note.ratings && (
        <div className="note-section">
          <h3>{t.detailedRatings}</h3>
          <div className="ratings-grid">
            {note.ratings.technicalSkills && (
              <div className="rating-item">
                <label>{t.technicalSkills}</label>
                {renderStars(note.ratings.technicalSkills)}
              </div>
            )}
            {note.ratings.communicationSkills && (
              <div className="rating-item">
                <label>{t.communicationSkills}</label>
                {renderStars(note.ratings.communicationSkills)}
              </div>
            )}
            {note.ratings.problemSolving && (
              <div className="rating-item">
                <label>{t.problemSolving}</label>
                {renderStars(note.ratings.problemSolving)}
              </div>
            )}
            {note.ratings.experience && (
              <div className="rating-item">
                <label>{t.experience}</label>
                {renderStars(note.ratings.experience)}
              </div>
            )}
            {note.ratings.culturalFit && (
              <div className="rating-item">
                <label>{t.culturalFit}</label>
                {renderStars(note.ratings.culturalFit)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {note.notes && (
        <>
          {note.notes.strengths && (
            <div className="note-section">
              <h3>{t.strengths}</h3>
              <p className="note-text">{note.notes.strengths}</p>
            </div>
          )}

          {note.notes.weaknesses && (
            <div className="note-section">
              <h3>{t.weaknesses}</h3>
              <p className="note-text">{note.notes.weaknesses}</p>
            </div>
          )}

          {note.notes.generalNotes && (
            <div className="note-section">
              <h3>{t.generalNotes}</h3>
              <p className="note-text">{note.notes.generalNotes}</p>
            </div>
          )}

          {note.notes.recommendations && (
            <div className="note-section">
              <h3>{t.recommendations}</h3>
              <p className="note-text">{note.notes.recommendations}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InterviewNoteView;
