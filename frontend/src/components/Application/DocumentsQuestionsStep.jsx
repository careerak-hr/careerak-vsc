/**
 * DocumentsQuestionsStep Component (Step 4)
 * 
 * Handles file uploads and custom company questions in the job application form.
 * 
 * Features:
 * - Integrates FileUploadManager for document uploads
 * - Displays custom questions dynamically based on job posting
 * - Renders different question types (short_text, long_text, single_choice, multiple_choice, yes_no)
 * - Validates required questions
 * - Responsive layout with RTL support
 * 
 * Requirements: 4.1-4.10, 8.3, 8.4, 8.5
 * Design: DocumentsQuestionsStep component
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import FileUploadManager from './FileUploadManager';
import './DocumentsQuestionsStep.css';

const DocumentsQuestionsStep = ({
  formData,
  onFieldChange,
  errors = {},
  jobPosting = null
}) => {
  const { language } = useApp();
  const [customAnswers, setCustomAnswers] = useState(formData.customAnswers || []);

  // Translations
  const translations = {
    ar: {
      title: 'المستندات والأسئلة',
      documentsSection: 'المستندات المطلوبة',
      documentsDescription: 'يرجى رفع المستندات المطلوبة (الحد الأقصى 10 ملفات، 5 ميجابايت لكل ملف)',
      customQuestionsSection: 'أسئلة إضافية',
      noCustomQuestions: 'لا توجد أسئلة إضافية لهذه الوظيفة',
      required: 'مطلوب',
      optional: 'اختياري',
      shortAnswer: 'إجابة قصيرة',
      longAnswer: 'إجابة مفصلة',
      selectOption: 'اختر خياراً',
      selectMultiple: 'اختر خيار أو أكثر',
      yes: 'نعم',
      no: 'لا',
      characterCount: 'عدد الأحرف',
      maxCharacters: 'الحد الأقصى',
      requiredField: 'هذا الحقل مطلوب',
      invalidAnswer: 'الرجاء تقديم إجابة صحيحة'
    },
    en: {
      title: 'Documents & Questions',
      documentsSection: 'Required Documents',
      documentsDescription: 'Please upload required documents (Maximum 10 files, 5MB per file)',
      customQuestionsSection: 'Additional Questions',
      noCustomQuestions: 'No additional questions for this position',
      required: 'Required',
      optional: 'Optional',
      shortAnswer: 'Short answer',
      longAnswer: 'Detailed answer',
      selectOption: 'Select an option',
      selectMultiple: 'Select one or more options',
      yes: 'Yes',
      no: 'No',
      characterCount: 'Character count',
      maxCharacters: 'Maximum',
      requiredField: 'This field is required',
      invalidAnswer: 'Please provide a valid answer'
    },
    fr: {
      title: 'Documents et Questions',
      documentsSection: 'Documents requis',
      documentsDescription: 'Veuillez télécharger les documents requis (Maximum 10 fichiers, 5Mo par fichier)',
      customQuestionsSection: 'Questions supplémentaires',
      noCustomQuestions: 'Aucune question supplémentaire pour ce poste',
      required: 'Requis',
      optional: 'Optionnel',
      shortAnswer: 'Réponse courte',
      longAnswer: 'Réponse détaillée',
      selectOption: 'Sélectionnez une option',
      selectMultiple: 'Sélectionnez une ou plusieurs options',
      yes: 'Oui',
      no: 'Non',
      characterCount: 'Nombre de caractères',
      maxCharacters: 'Maximum',
      requiredField: 'Ce champ est requis',
      invalidAnswer: 'Veuillez fournir une réponse valide'
    }
  };

  const t = translations[language] || translations.en;

  // Initialize custom answers from job posting questions
  useEffect(() => {
    if (jobPosting?.customQuestions && customAnswers.length === 0) {
      const initialAnswers = jobPosting.customQuestions.map(q => ({
        questionId: q.id,
        questionText: q.questionText,
        questionType: q.questionType,
        answer: q.questionType === 'multiple_choice' ? [] : ''
      }));
      setCustomAnswers(initialAnswers);
      onFieldChange('customAnswers', initialAnswers);
    }
  }, [jobPosting, customAnswers.length, onFieldChange]);

  // Handle files change
  const handleFilesChange = (files) => {
    onFieldChange('files', files);
  };

  // Handle custom answer change
  const handleAnswerChange = (questionId, value) => {
    const updatedAnswers = customAnswers.map(answer =>
      answer.questionId === questionId
        ? { ...answer, answer: value }
        : answer
    );
    setCustomAnswers(updatedAnswers);
    onFieldChange('customAnswers', updatedAnswers);
  };

  // Handle multiple choice change
  const handleMultipleChoiceChange = (questionId, option, checked) => {
    const answer = customAnswers.find(a => a.questionId === questionId);
    if (!answer) return;

    let newAnswer;
    if (checked) {
      newAnswer = [...(answer.answer || []), option];
    } else {
      newAnswer = (answer.answer || []).filter(opt => opt !== option);
    }

    handleAnswerChange(questionId, newAnswer);
  };

  // Render question based on type
  const renderQuestion = (question, index) => {
    const answer = customAnswers.find(a => a.questionId === question.id);
    const errorKey = `customAnswer_${question.id}`;
    const hasError = errors[errorKey];

    return (
      <div key={question.id} className={`question-item ${hasError ? 'has-error' : ''}`} role="listitem">
        <div className="question-header">
          <label className="question-label" id={`question-${question.id}-label`}>
            <span className="question-number" aria-hidden="true">{index + 1}.</span>
            <span className="question-text">{question.questionText}</span>
            {question.required && <span className="required-badge" aria-label="required">{t.required}</span>}
            {!question.required && <span className="optional-badge" aria-label="optional">{t.optional}</span>}
          </label>
        </div>

        {/* Short Text */}
        {question.questionType === 'short_text' && (
          <div className="answer-input">
            <input
              type="text"
              value={answer?.answer || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder={t.shortAnswer}
              className="text-input"
              maxLength={200}
              aria-labelledby={`question-${question.id}-label`}
              aria-required={question.required}
              aria-invalid={hasError}
              aria-describedby={hasError ? `question-${question.id}-error` : `question-${question.id}-count`}
            />
            <div id={`question-${question.id}-count`} className="character-count" aria-live="polite">
              {(answer?.answer || '').length} / 200 {t.characterCount}
            </div>
          </div>
        )}

        {/* Long Text */}
        {question.questionType === 'long_text' && (
          <div className="answer-input">
            <textarea
              value={answer?.answer || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder={t.longAnswer}
              className="textarea-input"
              rows={5}
              maxLength={1000}
              aria-labelledby={`question-${question.id}-label`}
              aria-required={question.required}
              aria-invalid={hasError}
              aria-describedby={hasError ? `question-${question.id}-error` : `question-${question.id}-count`}
            />
            <div id={`question-${question.id}-count`} className="character-count" aria-live="polite">
              {(answer?.answer || '').length} / 1000 {t.characterCount}
            </div>
          </div>
        )}

        {/* Single Choice */}
        {question.questionType === 'single_choice' && (
          <div className="answer-input">
            <select
              value={answer?.answer || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="select-input"
              aria-labelledby={`question-${question.id}-label`}
              aria-required={question.required}
              aria-invalid={hasError}
              aria-describedby={hasError ? `question-${question.id}-error` : undefined}
            >
              <option value="">{t.selectOption}</option>
              {question.options?.map((option, idx) => (
                <option key={idx} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Multiple Choice */}
        {question.questionType === 'multiple_choice' && (
          <div className="answer-input multiple-choice" role="group" aria-labelledby={`question-${question.id}-label`}>
            <p className="multiple-choice-hint">{t.selectMultiple}</p>
            {question.options?.map((option, idx) => (
              <label key={idx} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={(answer?.answer || []).includes(option)}
                  onChange={(e) => handleMultipleChoiceChange(question.id, option, e.target.checked)}
                  className="checkbox-input"
                  aria-label={option}
                />
                <span className="checkbox-text">{option}</span>
              </label>
            ))}
          </div>
        )}

        {/* Yes/No */}
        {question.questionType === 'yes_no' && (
          <div className="answer-input yes-no" role="radiogroup" aria-labelledby={`question-${question.id}-label`} aria-required={question.required}>
            <label className="radio-label">
              <input
                type="radio"
                name={`question_${question.id}`}
                value="yes"
                checked={answer?.answer === 'yes'}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                className="radio-input"
              />
              <span className="radio-text">{t.yes}</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name={`question_${question.id}`}
                value="no"
                checked={answer?.answer === 'no'}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                className="radio-input"
              />
              <span className="radio-text">{t.no}</span>
            </label>
          </div>
        )}

        {/* Error Message */}
        {hasError && (
          <div id={`question-${question.id}-error`} className="error-message" role="alert" aria-live="polite">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <circle cx="12" cy="12" r="10" strokeWidth={2} />
              <line x1="12" y1="8" x2="12" y2="12" strokeWidth={2} strokeLinecap="round" />
              <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth={2} strokeLinecap="round" />
            </svg>
            <span>{errors[errorKey]}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="documents-questions-step" role="group" aria-labelledby="documents-questions-heading">
      <h2 id="documents-questions-heading" className="step-title">{t.title}</h2>

      {/* Documents Section */}
      <section className="documents-section" aria-labelledby="documents-section-heading">
        <h3 id="documents-section-heading" className="section-title">{t.documentsSection}</h3>
        <p className="section-description">{t.documentsDescription}</p>
        
        <FileUploadManager
          files={formData.files || []}
          maxFiles={10}
          maxSizePerFile={5}
          allowedTypes={[
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/jpg',
            'image/png'
          ]}
          onFilesChange={handleFilesChange}
        />
      </section>

      {/* Custom Questions Section */}
      {jobPosting?.customQuestions && jobPosting.customQuestions.length > 0 && (
        <section className="custom-questions-section" aria-labelledby="custom-questions-heading">
          <h3 id="custom-questions-heading" className="section-title">{t.customQuestionsSection}</h3>
          
          <div className="questions-list" role="list" aria-label="Additional questions">
            {jobPosting.customQuestions.map((question, index) => 
              renderQuestion(question, index)
            )}
          </div>
        </section>
      )}

      {/* No Custom Questions */}
      {(!jobPosting?.customQuestions || jobPosting.customQuestions.length === 0) && (
        <section className="custom-questions-section" aria-labelledby="custom-questions-heading">
          <h3 id="custom-questions-heading" className="section-title">{t.customQuestionsSection}</h3>
          <p className="no-questions-text" role="status">{t.noCustomQuestions}</p>
        </section>
      )}
    </div>
  );
};

export default DocumentsQuestionsStep;
