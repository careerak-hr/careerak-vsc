import React, { useState } from 'react';
import './CustomQuestionsManager.css';

const QUESTION_TYPES = [
  { value: 'short_text', label: { ar: 'نص قصير', en: 'Short Text', fr: 'Texte court' } },
  { value: 'long_text', label: { ar: 'نص طويل', en: 'Long Text', fr: 'Texte long' } },
  { value: 'single_choice', label: { ar: 'اختيار واحد', en: 'Single Choice', fr: 'Choix unique' } },
  { value: 'multiple_choice', label: { ar: 'اختيار متعدد', en: 'Multiple Choice', fr: 'Choix multiple' } },
  { value: 'yes_no', label: { ar: 'نعم/لا', en: 'Yes/No', fr: 'Oui/Non' } }
];

const MAX_QUESTIONS = 5;

const CustomQuestionsManager = ({ 
  questions = [], 
  onChange, 
  language = 'ar',
  disabled = false 
}) => {
  const [errors, setErrors] = useState({});

  const translations = {
    ar: {
      title: 'أسئلة مخصصة',
      description: 'أضف حتى 5 أسئلة مخصصة لجمع معلومات إضافية من المتقدمين',
      addQuestion: 'إضافة سؤال',
      maxQuestionsReached: 'تم الوصول للحد الأقصى (5 أسئلة)',
      questionLabel: 'السؤال',
      questionPlaceholder: 'اكتب سؤالك هنا...',
      questionType: 'نوع السؤال',
      required: 'إجباري',
      optional: 'اختياري',
      options: 'الخيارات',
      optionsPlaceholder: 'أدخل خياراً واحداً في كل سطر',
      moveUp: 'تحريك لأعلى',
      moveDown: 'تحريك لأسفل',
      remove: 'حذف',
      questionNumber: 'السؤال'
    },
    en: {
      title: 'Custom Questions',
      description: 'Add up to 5 custom questions to gather additional information from applicants',
      addQuestion: 'Add Question',
      maxQuestionsReached: 'Maximum limit reached (5 questions)',
      questionLabel: 'Question',
      questionPlaceholder: 'Enter your question here...',
      questionType: 'Question Type',
      required: 'Required',
      optional: 'Optional',
      options: 'Options',
      optionsPlaceholder: 'Enter one option per line',
      moveUp: 'Move Up',
      moveDown: 'Move Down',
      remove: 'Remove',
      questionNumber: 'Question'
    },
    fr: {
      title: 'Questions personnalisées',
      description: 'Ajoutez jusqu\'à 5 questions personnalisées pour recueillir des informations supplémentaires',
      addQuestion: 'Ajouter une question',
      maxQuestionsReached: 'Limite maximale atteinte (5 questions)',
      questionLabel: 'Question',
      questionPlaceholder: 'Entrez votre question ici...',
      questionType: 'Type de question',
      required: 'Obligatoire',
      optional: 'Optionnel',
      options: 'Options',
      optionsPlaceholder: 'Entrez une option par ligne',
      moveUp: 'Déplacer vers le haut',
      moveDown: 'Déplacer vers le bas',
      remove: 'Supprimer',
      questionNumber: 'Question'
    }
  };

  const t = translations[language] || translations.ar;

  const addQuestion = () => {
    if (questions.length >= MAX_QUESTIONS) return;

    const newQuestion = {
      id: `q_${Date.now()}`,
      questionText: '',
      questionType: 'short_text',
      options: [],
      required: false,
      order: questions.length
    };

    onChange([...questions, newQuestion]);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    
    // Clear options if question type doesn't support them
    if (field === 'questionType' && !['single_choice', 'multiple_choice'].includes(value)) {
      updated[index].options = [];
    }

    onChange(updated);
    
    // Clear error for this field
    if (errors[`${index}_${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`${index}_${field}`];
      setErrors(newErrors);
    }
  };

  const updateOptions = (index, optionsText) => {
    const optionsArray = optionsText
      .split('\n')
      .map(opt => opt.trim())
      .filter(opt => opt.length > 0);
    
    updateQuestion(index, 'options', optionsArray);
  };

  const removeQuestion = (index) => {
    const updated = questions.filter((_, i) => i !== index);
    // Reorder remaining questions
    updated.forEach((q, i) => {
      q.order = i;
    });
    onChange(updated);
  };

  const moveQuestion = (index, direction) => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === questions.length - 1)
    ) {
      return;
    }

    const updated = [...questions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap questions
    [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
    
    // Update order
    updated.forEach((q, i) => {
      q.order = i;
    });

    onChange(updated);
  };

  const validateQuestion = (question, index) => {
    const newErrors = {};

    if (!question.questionText || question.questionText.trim().length === 0) {
      newErrors[`${index}_questionText`] = true;
    }

    if (['single_choice', 'multiple_choice'].includes(question.questionType)) {
      if (!question.options || question.options.length < 2) {
        newErrors[`${index}_options`] = true;
      }
    }

    return newErrors;
  };

  const validateAll = () => {
    let allErrors = {};
    questions.forEach((q, i) => {
      const questionErrors = validateQuestion(q, i);
      allErrors = { ...allErrors, ...questionErrors };
    });
    setErrors(allErrors);
    return Object.keys(allErrors).length === 0;
  };

  // Expose validation method to parent
  React.useImperativeHandle(onChange.ref, () => ({
    validate: validateAll
  }));

  const needsOptions = (type) => {
    return ['single_choice', 'multiple_choice'].includes(type);
  };

  return (
    <div className="custom-questions-manager">
      <div className="custom-questions-header">
        <h3>{t.title}</h3>
        <p className="custom-questions-description">{t.description}</p>
      </div>

      <div className="custom-questions-list">
        {questions.map((question, index) => (
          <div key={question.id} className="custom-question-card">
            <div className="question-card-header">
              <span className="question-number">
                {t.questionNumber} {index + 1}
              </span>
              <div className="question-actions">
                <button
                  type="button"
                  onClick={() => moveQuestion(index, 'up')}
                  disabled={disabled || index === 0}
                  className="btn-icon"
                  aria-label={t.moveUp}
                  title={t.moveUp}
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveQuestion(index, 'down')}
                  disabled={disabled || index === questions.length - 1}
                  className="btn-icon"
                  aria-label={t.moveDown}
                  title={t.moveDown}
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeQuestion(index)}
                  disabled={disabled}
                  className="btn-icon btn-danger"
                  aria-label={t.remove}
                  title={t.remove}
                >
                  ×
                </button>
              </div>
            </div>

            <div className="question-card-body">
              {/* Question Text */}
              <div className="form-group">
                <label htmlFor={`question-text-${index}`}>
                  {t.questionLabel} *
                </label>
                <input
                  id={`question-text-${index}`}
                  type="text"
                  value={question.questionText}
                  onChange={(e) => updateQuestion(index, 'questionText', e.target.value)}
                  placeholder={t.questionPlaceholder}
                  disabled={disabled}
                  className={errors[`${index}_questionText`] ? 'error' : ''}
                  maxLength={500}
                />
                {errors[`${index}_questionText`] && (
                  <span className="error-message">
                    {language === 'ar' ? 'السؤال مطلوب' : 'Question is required'}
                  </span>
                )}
              </div>

              {/* Question Type */}
              <div className="form-group">
                <label htmlFor={`question-type-${index}`}>
                  {t.questionType} *
                </label>
                <select
                  id={`question-type-${index}`}
                  value={question.questionType}
                  onChange={(e) => updateQuestion(index, 'questionType', e.target.value)}
                  disabled={disabled}
                >
                  {QUESTION_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label[language]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Options (for choice questions) */}
              {needsOptions(question.questionType) && (
                <div className="form-group">
                  <label htmlFor={`question-options-${index}`}>
                    {t.options} * (min 2)
                  </label>
                  <textarea
                    id={`question-options-${index}`}
                    value={question.options.join('\n')}
                    onChange={(e) => updateOptions(index, e.target.value)}
                    placeholder={t.optionsPlaceholder}
                    disabled={disabled}
                    className={errors[`${index}_options`] ? 'error' : ''}
                    rows={4}
                  />
                  {errors[`${index}_options`] && (
                    <span className="error-message">
                      {language === 'ar' 
                        ? 'يجب إضافة خيارين على الأقل' 
                        : 'At least 2 options required'}
                    </span>
                  )}
                </div>
              )}

              {/* Required Toggle */}
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={question.required}
                    onChange={(e) => updateQuestion(index, 'required', e.target.checked)}
                    disabled={disabled}
                  />
                  <span>{t.required}</span>
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Question Button */}
      <div className="custom-questions-footer">
        {questions.length < MAX_QUESTIONS ? (
          <button
            type="button"
            onClick={addQuestion}
            disabled={disabled}
            className="btn-add-question"
          >
            + {t.addQuestion}
          </button>
        ) : (
          <p className="max-questions-message">
            {t.maxQuestionsReached}
          </p>
        )}
        <p className="questions-count">
          {questions.length} / {MAX_QUESTIONS}
        </p>
      </div>
    </div>
  );
};

export default CustomQuestionsManager;
