import React from 'react';
import { useApp } from '../../context/AppContext';
import './ApplicationPreview.css';

/**
 * ApplicationPreview Component
 * 
 * Displays a read-only, formatted view of the complete application data
 * as it will appear to the employer. Provides edit buttons for each section
 * to allow users to return to specific steps for modifications.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.6
 */
function ApplicationPreview({ formData, onEdit, onSubmit, isSubmitting }) {
  const { language, fontFamily } = useApp();
  const isRTL = language === 'ar';

  const fontStyle = {
    fontFamily: fontFamily,
    fontWeight: 'inherit',
    fontStyle: 'inherit'
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString(language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US');
  };

  // Translations
  const translations = {
    ar: {
      title: 'معاينة الطلب',
      subtitle: 'يرجى مراجعة جميع المعلومات قبل التقديم النهائي',
      personalInfo: 'المعلومات الشخصية',
      education: 'التعليم',
      experience: 'الخبرة العملية',
      skills: 'المهارات',
      languages: 'اللغات',
      documents: 'المستندات',
      customQuestions: 'أسئلة إضافية',
      additionalInfo: 'معلومات إضافية',
      edit: 'تعديل',
      submit: 'تقديم الطلب',
      submitting: 'جاري التقديم...',
      fullName: 'الاسم الكامل',
      email: 'البريد الإلكتروني',
      phone: 'رقم الهاتف',
      country: 'الدولة',
      city: 'المدينة',
      degree: 'الدرجة',
      institution: 'المؤسسة',
      year: 'السنة',
      grade: 'التقدير',
      level: 'المستوى',
      company: 'الشركة',
      position: 'المنصب',
      from: 'من',
      to: 'إلى',
      current: 'حالياً',
      tasks: 'المهام',
      workType: 'نوع العمل',
      jobLevel: 'مستوى الوظيفة',
      computerSkills: 'مهارات الحاسوب',
      softwareSkills: 'مهارات البرمجيات',
      otherSkills: 'مهارات أخرى',
      skill: 'المهارة',
      proficiency: 'مستوى الإتقان',
      language: 'اللغة',
      fileName: 'اسم الملف',
      fileSize: 'الحجم',
      fileType: 'النوع',
      coverLetter: 'خطاب التقديم',
      expectedSalary: 'الراتب المتوقع',
      availableFrom: 'متاح من',
      noticePeriod: 'فترة الإشعار',
      noData: 'لا توجد بيانات',
      yes: 'نعم',
      no: 'لا',
    },
    en: {
      title: 'Application Preview',
      subtitle: 'Please review all information before final submission',
      personalInfo: 'Personal Information',
      education: 'Education',
      experience: 'Work Experience',
      skills: 'Skills',
      languages: 'Languages',
      documents: 'Documents',
      customQuestions: 'Additional Questions',
      additionalInfo: 'Additional Information',
      edit: 'Edit',
      submit: 'Submit Application',
      submitting: 'Submitting...',
      fullName: 'Full Name',
      email: 'Email',
      phone: 'Phone',
      country: 'Country',
      city: 'City',
      degree: 'Degree',
      institution: 'Institution',
      year: 'Year',
      grade: 'Grade',
      level: 'Level',
      company: 'Company',
      position: 'Position',
      from: 'From',
      to: 'To',
      current: 'Current',
      tasks: 'Tasks',
      workType: 'Work Type',
      jobLevel: 'Job Level',
      computerSkills: 'Computer Skills',
      softwareSkills: 'Software Skills',
      otherSkills: 'Other Skills',
      skill: 'Skill',
      proficiency: 'Proficiency',
      language: 'Language',
      fileName: 'File Name',
      fileSize: 'Size',
      fileType: 'Type',
      coverLetter: 'Cover Letter',
      expectedSalary: 'Expected Salary',
      availableFrom: 'Available From',
      noticePeriod: 'Notice Period',
      noData: 'No data',
      yes: 'Yes',
      no: 'No',
    },
    fr: {
      title: 'Aperçu de la candidature',
      subtitle: 'Veuillez vérifier toutes les informations avant la soumission finale',
      personalInfo: 'Informations personnelles',
      education: 'Éducation',
      experience: 'Expérience professionnelle',
      skills: 'Compétences',
      languages: 'Langues',
      documents: 'Documents',
      customQuestions: 'Questions supplémentaires',
      additionalInfo: 'Informations supplémentaires',
      edit: 'Modifier',
      submit: 'Soumettre la candidature',
      submitting: 'Soumission en cours...',
      fullName: 'Nom complet',
      email: 'Email',
      phone: 'Téléphone',
      country: 'Pays',
      city: 'Ville',
      degree: 'Diplôme',
      institution: 'Institution',
      year: 'Année',
      grade: 'Note',
      level: 'Niveau',
      company: 'Entreprise',
      position: 'Poste',
      from: 'De',
      to: 'À',
      current: 'Actuel',
      tasks: 'Tâches',
      workType: 'Type de travail',
      jobLevel: 'Niveau du poste',
      computerSkills: 'Compétences informatiques',
      softwareSkills: 'Compétences logicielles',
      otherSkills: 'Autres compétences',
      skill: 'Compétence',
      proficiency: 'Maîtrise',
      language: 'Langue',
      fileName: 'Nom du fichier',
      fileSize: 'Taille',
      fileType: 'Type',
      coverLetter: 'Lettre de motivation',
      expectedSalary: 'Salaire attendu',
      availableFrom: 'Disponible à partir de',
      noticePeriod: 'Période de préavis',
      noData: 'Aucune donnée',
      yes: 'Oui',
      no: 'Non',
    },
  };

  const t = translations[language] || translations.en;

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className={`application-preview ${isRTL ? 'rtl' : 'ltr'}`} style={fontStyle}>
      {/* Header */}
      <div className="preview-header">
        <h2 id="review-heading" className="preview-title">{t.title}</h2>
        <p className="preview-subtitle">{t.subtitle}</p>
      </div>

      {/* Personal Information Section */}
      <section className="preview-section" aria-labelledby="personal-info-preview-heading">
        <div className="section-header">
          <h3 id="personal-info-preview-heading" className="section-title">{t.personalInfo}</h3>
          <button
            type="button"
            className="btn-edit"
            onClick={() => onEdit(1)}
            disabled={isSubmitting}
            aria-label="Edit personal information"
          >
            {t.edit}
          </button>
        </div>
        <div className="section-content" role="group" aria-labelledby="personal-info-preview-heading">
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">{t.fullName}:</span>
              <span className="info-value">{formData.fullName || t.noData}</span>
            </div>
            <div className="info-item">
              <span className="info-label">{t.email}:</span>
              <span className="info-value">{formData.email || t.noData}</span>
            </div>
            <div className="info-item">
              <span className="info-label">{t.phone}:</span>
              <span className="info-value">{formData.phone || t.noData}</span>
            </div>
            {formData.country && (
              <div className="info-item">
                <span className="info-label">{t.country}:</span>
                <span className="info-value">{formData.country}</span>
              </div>
            )}
            {formData.city && (
              <div className="info-item">
                <span className="info-label">{t.city}:</span>
                <span className="info-value">{formData.city}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Education Section */}
      <div className="preview-section">
        <div className="section-header">
          <h3 className="section-title">{t.education}</h3>
          <button
            type="button"
            className="btn-edit"
            onClick={() => onEdit(2)}
            disabled={isSubmitting}
          >
            {t.edit}
          </button>
        </div>
        <div className="section-content">
          {formData.education && formData.education.length > 0 ? (
            <div className="entries-list">
              {formData.education.map((entry, index) => (
                <div key={index} className="entry-card">
                  <div className="entry-header">
                    <strong>{entry.degree || t.noData}</strong>
                    {entry.year && <span className="entry-year">{entry.year}</span>}
                  </div>
                  <div className="entry-details">
                    {entry.institution && <p>{entry.institution}</p>}
                    {(entry.city || entry.country) && (
                      <p className="entry-location">
                        {[entry.city, entry.country].filter(Boolean).join(', ')}
                      </p>
                    )}
                    {entry.level && <p>{t.level}: {entry.level}</p>}
                    {entry.grade && <p>{t.grade}: {entry.grade}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">{t.noData}</p>
          )}
        </div>
      </div>

      {/* Experience Section */}
      <div className="preview-section">
        <div className="section-header">
          <h3 className="section-title">{t.experience}</h3>
          <button
            type="button"
            className="btn-edit"
            onClick={() => onEdit(2)}
            disabled={isSubmitting}
          >
            {t.edit}
          </button>
        </div>
        <div className="section-content">
          {formData.experience && formData.experience.length > 0 ? (
            <div className="entries-list">
              {formData.experience.map((entry, index) => (
                <div key={index} className="entry-card">
                  <div className="entry-header">
                    <strong>{entry.position || t.noData}</strong>
                    {entry.current && <span className="entry-badge">{t.current}</span>}
                  </div>
                  <div className="entry-details">
                    {entry.company && <p className="entry-company">{entry.company}</p>}
                    {(entry.from || entry.to) && (
                      <p className="entry-period">
                        {formatDate(entry.from)} - {entry.current ? t.current : formatDate(entry.to)}
                      </p>
                    )}
                    {(entry.city || entry.country) && (
                      <p className="entry-location">
                        {[entry.city, entry.country].filter(Boolean).join(', ')}
                      </p>
                    )}
                    {entry.workType && <p>{t.workType}: {entry.workType}</p>}
                    {entry.jobLevel && <p>{t.jobLevel}: {entry.jobLevel}</p>}
                    {entry.tasks && <p className="entry-tasks">{entry.tasks}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">{t.noData}</p>
          )}
        </div>
      </div>

      {/* Skills Section */}
      <div className="preview-section">
        <div className="section-header">
          <h3 className="section-title">{t.skills}</h3>
          <button
            type="button"
            className="btn-edit"
            onClick={() => onEdit(3)}
            disabled={isSubmitting}
          >
            {t.edit}
          </button>
        </div>
        <div className="section-content">
          {/* Computer Skills */}
          {formData.computerSkills && formData.computerSkills.length > 0 && (
            <div className="skills-category">
              <h4 className="category-title">{t.computerSkills}</h4>
              <div className="skills-grid">
                {formData.computerSkills.map((skill, index) => (
                  <div key={index} className="skill-item">
                    <span className="skill-name">{skill.skill || skill}</span>
                    {skill.proficiency && (
                      <span className="skill-proficiency">{skill.proficiency}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Software Skills */}
          {formData.softwareSkills && formData.softwareSkills.length > 0 && (
            <div className="skills-category">
              <h4 className="category-title">{t.softwareSkills}</h4>
              <div className="skills-grid">
                {formData.softwareSkills.map((skill, index) => (
                  <div key={index} className="skill-item">
                    <span className="skill-name">{skill.software || skill}</span>
                    {skill.proficiency && (
                      <span className="skill-proficiency">{skill.proficiency}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other Skills */}
          {formData.otherSkills && formData.otherSkills.length > 0 && (
            <div className="skills-category">
              <h4 className="category-title">{t.otherSkills}</h4>
              <div className="skills-grid">
                {formData.otherSkills.map((skill, index) => (
                  <div key={index} className="skill-item">
                    <span className="skill-name">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!formData.computerSkills || formData.computerSkills.length === 0) &&
           (!formData.softwareSkills || formData.softwareSkills.length === 0) &&
           (!formData.otherSkills || formData.otherSkills.length === 0) && (
            <p className="no-data">{t.noData}</p>
          )}
        </div>
      </div>

      {/* Languages Section */}
      <div className="preview-section">
        <div className="section-header">
          <h3 className="section-title">{t.languages}</h3>
          <button
            type="button"
            className="btn-edit"
            onClick={() => onEdit(3)}
            disabled={isSubmitting}
          >
            {t.edit}
          </button>
        </div>
        <div className="section-content">
          {formData.languages && formData.languages.length > 0 ? (
            <div className="skills-grid">
              {formData.languages.map((lang, index) => (
                <div key={index} className="skill-item">
                  <span className="skill-name">{lang.language || lang}</span>
                  {lang.proficiency && (
                    <span className="skill-proficiency">{lang.proficiency}</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">{t.noData}</p>
          )}
        </div>
      </div>

      {/* Documents Section */}
      <div className="preview-section">
        <div className="section-header">
          <h3 className="section-title">{t.documents}</h3>
          <button
            type="button"
            className="btn-edit"
            onClick={() => onEdit(4)}
            disabled={isSubmitting}
          >
            {t.edit}
          </button>
        </div>
        <div className="section-content">
          {formData.files && formData.files.length > 0 ? (
            <div className="files-list">
              {formData.files.map((file, index) => (
                <div key={index} className="file-item">
                  <div className="file-icon">📄</div>
                  <div className="file-details">
                    <p className="file-name">{file.name}</p>
                    <p className="file-meta">
                      {formatFileSize(file.size)} • {file.type}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">{t.noData}</p>
          )}
        </div>
      </div>

      {/* Custom Questions Section */}
      {formData.customAnswers && Object.keys(formData.customAnswers).length > 0 && (
        <div className="preview-section">
          <div className="section-header">
            <h3 className="section-title">{t.customQuestions}</h3>
            <button
              type="button"
              className="btn-edit"
              onClick={() => onEdit(4)}
              disabled={isSubmitting}
            >
              {t.edit}
            </button>
          </div>
          <div className="section-content">
            <div className="custom-answers">
              {Object.entries(formData.customAnswers).map(([questionId, answer], index) => (
                <div key={questionId} className="custom-answer">
                  <p className="answer-question">Question {index + 1}</p>
                  <p className="answer-value">
                    {typeof answer === 'boolean' ? (answer ? t.yes : t.no) : answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Additional Information Section */}
      {(formData.coverLetter || formData.expectedSalary || formData.availableFrom || formData.noticePeriod) && (
        <div className="preview-section">
          <div className="section-header">
            <h3 className="section-title">{t.additionalInfo}</h3>
            <button
              type="button"
              className="btn-edit"
              onClick={() => onEdit(4)}
              disabled={isSubmitting}
            >
              {t.edit}
            </button>
          </div>
          <div className="section-content">
            <div className="info-grid">
              {formData.coverLetter && (
                <div className="info-item full-width">
                  <span className="info-label">{t.coverLetter}:</span>
                  <p className="info-value text-block">{formData.coverLetter}</p>
                </div>
              )}
              {formData.expectedSalary && (
                <div className="info-item">
                  <span className="info-label">{t.expectedSalary}:</span>
                  <span className="info-value">{formData.expectedSalary}</span>
                </div>
              )}
              {formData.availableFrom && (
                <div className="info-item">
                  <span className="info-label">{t.availableFrom}:</span>
                  <span className="info-value">{formatDate(formData.availableFrom)}</span>
                </div>
              )}
              {formData.noticePeriod && (
                <div className="info-item">
                  <span className="info-label">{t.noticePeriod}:</span>
                  <span className="info-value">{formData.noticePeriod}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="preview-footer">
        <button
          type="button"
          className="btn-submit"
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? t.submitting : t.submit}
        </button>
      </div>
    </div>
  );
}

export default ApplicationPreview;
