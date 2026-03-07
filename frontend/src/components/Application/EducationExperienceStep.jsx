import React, { useEffect } from 'react';
import { useApplicationForm } from '../../context/ApplicationContext';
import { useListKeyboardNavigation } from '../../hooks/useFormKeyboardNavigation';
import './EducationExperienceStep.css';

function EducationExperienceStep({ errors = {} }) {
  const {
    formData,
    setEducationEntry,
    addEducationEntry,
    removeEducationEntry,
    setExperienceEntry,
    addExperienceEntry,
    removeExperienceEntry,
    clearError,
  } = useApplicationForm();

  // Keyboard navigation for education list
  const educationKeyboard = useListKeyboardNavigation(
    formData.education,
    handleAddEducation,
    handleRemoveEducation
  );

  // Keyboard navigation for experience list
  const experienceKeyboard = useListKeyboardNavigation(
    formData.experience,
    handleAddExperience,
    handleRemoveExperience
  );

  // Auto-fill from user profile (will be implemented in task 8)
  useEffect(() => {
    // TODO: Load user profile and auto-fill education and experience
    // This will be implemented in task 8
    
    // Initialize with at least one empty entry if none exist
    if (formData.education.length === 0) {
      addEducationEntry({
        level: '',
        degree: '',
        institution: '',
        city: '',
        country: '',
        year: '',
        grade: '',
      });
    }
  }, []);

  const handleEducationChange = (index, field, value) => {
    const updatedEntry = { ...formData.education[index], [field]: value };
    setEducationEntry(index, updatedEntry);
    
    const errorKey = `education_${index}_${field}`;
    if (errors[errorKey]) {
      clearError(errorKey);
    }
  };

  const handleAddEducation = () => {
    addEducationEntry({
      level: '',
      degree: '',
      institution: '',
      city: '',
      country: '',
      year: '',
      grade: '',
    });
  };

  const handleRemoveEducation = (index) => {
    removeEducationEntry(index);
  };

  const handleExperienceChange = (index, field, value) => {
    const updatedEntry = { ...formData.experience[index], [field]: value };
    setExperienceEntry(index, updatedEntry);
    
    const errorKey = `experience_${index}_${field}`;
    if (errors[errorKey]) {
      clearError(errorKey);
    }
  };

  const handleAddExperience = () => {
    addExperienceEntry({
      company: '',
      position: '',
      from: '',
      to: '',
      current: false,
      tasks: '',
      workType: '',
      jobLevel: '',
      country: '',
      city: '',
    });
  };

  const handleRemoveExperience = (index) => {
    removeExperienceEntry(index);
  };

  return (
    <div className="education-experience-step" role="group" aria-labelledby="education-experience-heading">
      <h2 id="education-experience-heading" className="step-heading">Education & Experience</h2>
      <p className="step-description">
        Add your educational background and work experience. You can add multiple entries.
      </p>

      {/* Education Section */}
      <section className="section" aria-labelledby="education-section-heading" onKeyDown={(e) => educationKeyboard.handleKeyDown(e)}>
        <div className="section-header">
          <h3 id="education-section-heading" className="section-title">Education</h3>
          <button
            type="button"
            className="btn-add"
            onClick={handleAddEducation}
            aria-label="Add education entry (Alt+A)"
            title="Add Education (Alt+A)"
          >
            + Add Education
          </button>
        </div>

        {errors.education && (
          <div className="section-error" role="alert" aria-live="polite">
            {errors.education}
          </div>
        )}

        <div className="entries-list" role="list" aria-label="Education entries">
          {formData.education.map((entry, index) => (
            <div key={index} className="entry-card" role="listitem" aria-label={`Education entry ${index + 1}`}>
              <div className="entry-header">
                <span className="entry-number" aria-label={`Education number ${index + 1}`}>Education #{index + 1}</span>
                {formData.education.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove remove-button"
                    onClick={() => handleRemoveEducation(index)}
                    onKeyDown={(e) => educationKeyboard.handleKeyDown(e, index)}
                    aria-label={`Remove education entry ${index + 1} (Delete or Backspace)`}
                    title="Remove (Delete/Backspace)"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="form-grid" role="group" aria-label={`Education ${index + 1} details`}>
                <div className="form-group">
                  <label htmlFor={`edu-level-${index}`} className="form-label">
                    Level
                  </label>
                  <select
                    id={`edu-level-${index}`}
                    className="form-input"
                    value={entry.level || ''}
                    onChange={(e) => handleEducationChange(index, 'level', e.target.value)}
                    aria-label={`Education level for entry ${index + 1}`}
                  >
                    <option value="">Select level</option>
                    <option value="High School">High School</option>
                    <option value="Associate">Associate Degree</option>
                    <option value="Bachelor">Bachelor's Degree</option>
                    <option value="Master">Master's Degree</option>
                    <option value="PhD">PhD</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor={`edu-degree-${index}`} className="form-label">
                    Degree <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id={`edu-degree-${index}`}
                    className={`form-input ${errors[`education_${index}_degree`] ? 'error' : ''}`}
                    value={entry.degree || ''}
                    onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                    placeholder="e.g., Computer Science"
                    aria-required="true"
                    aria-invalid={!!errors[`education_${index}_degree`]}
                    aria-describedby={errors[`education_${index}_degree`] ? `edu-degree-${index}-error` : undefined}
                  />
                  {errors[`education_${index}_degree`] && (
                    <span id={`edu-degree-${index}-error`} className="error-message" role="alert">
                      {errors[`education_${index}_degree`]}
                    </span>
                  )}
                </div>

                <div className="form-group full-width">
                  <label htmlFor={`edu-institution-${index}`} className="form-label">
                    Institution <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id={`edu-institution-${index}`}
                    className={`form-input ${errors[`education_${index}_institution`] ? 'error' : ''}`}
                    value={entry.institution || ''}
                    onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                    placeholder="University or School name"
                    aria-required="true"
                    aria-invalid={!!errors[`education_${index}_institution`]}
                    aria-describedby={errors[`education_${index}_institution`] ? `edu-institution-${index}-error` : undefined}
                  />
                  {errors[`education_${index}_institution`] && (
                    <span id={`edu-institution-${index}-error`} className="error-message" role="alert">
                      {errors[`education_${index}_institution`]}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor={`edu-city-${index}`} className="form-label">
                    City
                  </label>
                  <input
                    type="text"
                    id={`edu-city-${index}`}
                    className="form-input"
                    value={entry.city || ''}
                    onChange={(e) => handleEducationChange(index, 'city', e.target.value)}
                    placeholder="City"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor={`edu-country-${index}`} className="form-label">
                    Country
                  </label>
                  <input
                    type="text"
                    id={`edu-country-${index}`}
                    className="form-input"
                    value={entry.country || ''}
                    onChange={(e) => handleEducationChange(index, 'country', e.target.value)}
                    placeholder="Country"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor={`edu-year-${index}`} className="form-label">
                    Graduation Year
                  </label>
                  <input
                    type="text"
                    id={`edu-year-${index}`}
                    className="form-input"
                    value={entry.year || ''}
                    onChange={(e) => handleEducationChange(index, 'year', e.target.value)}
                    placeholder="YYYY"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor={`edu-grade-${index}`} className="form-label">
                    Grade/GPA
                  </label>
                  <input
                    type="text"
                    id={`edu-grade-${index}`}
                    className="form-input"
                    value={entry.grade || ''}
                    onChange={(e) => handleEducationChange(index, 'grade', e.target.value)}
                    placeholder="e.g., 3.8/4.0"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Experience Section */}
      <section className="section" aria-labelledby="experience-section-heading" onKeyDown={(e) => experienceKeyboard.handleKeyDown(e)}>
        <div className="section-header">
          <h3 id="experience-section-heading" className="section-title">Work Experience</h3>
          <button
            type="button"
            className="btn-add"
            onClick={handleAddExperience}
            aria-label="Add experience entry (Alt+A)"
            title="Add Experience (Alt+A)"
          >
            + Add Experience
          </button>
        </div>

        {formData.experience.length === 0 && (
          <p className="empty-message" role="status">No work experience added yet. Click "Add Experience" to get started.</p>
        )}

        <div className="entries-list" role="list" aria-label="Work experience entries">
          {formData.experience.map((entry, index) => (
            <div key={index} className="entry-card" role="listitem" aria-label={`Experience entry ${index + 1}`}>
              <div className="entry-header">
                <span className="entry-number" aria-label={`Experience number ${index + 1}`}>Experience #{index + 1}</span>
                <button
                  type="button"
                  className="btn-remove remove-button"
                  onClick={() => handleRemoveExperience(index)}
                  onKeyDown={(e) => experienceKeyboard.handleKeyDown(e, index)}
                  aria-label={`Remove experience entry ${index + 1} (Delete or Backspace)`}
                  title="Remove (Delete/Backspace)"
                >
                  Remove
                </button>
              </div>

              <div className="form-grid" role="group" aria-label={`Experience ${index + 1} details`}>
                <div className="form-group">
                  <label htmlFor={`exp-company-${index}`} className="form-label">
                    Company
                  </label>
                  <input
                    type="text"
                    id={`exp-company-${index}`}
                    className="form-input"
                    value={entry.company || ''}
                    onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                    placeholder="Company name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor={`exp-position-${index}`} className="form-label">
                    Position
                  </label>
                  <input
                    type="text"
                    id={`exp-position-${index}`}
                    className="form-input"
                    value={entry.position || ''}
                    onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                    placeholder="Job title"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor={`exp-from-${index}`} className="form-label">
                    From
                  </label>
                  <input
                    type="month"
                    id={`exp-from-${index}`}
                    className="form-input"
                    value={entry.from || ''}
                    onChange={(e) => handleExperienceChange(index, 'from', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor={`exp-to-${index}`} className="form-label">
                    To
                  </label>
                  <input
                    type="month"
                    id={`exp-to-${index}`}
                    className="form-input"
                    value={entry.to || ''}
                    onChange={(e) => handleExperienceChange(index, 'to', e.target.value)}
                    disabled={entry.current}
                    aria-label={`End date for experience ${index + 1}`}
                    aria-disabled={entry.current}
                  />
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={entry.current || false}
                      onChange={(e) => handleExperienceChange(index, 'current', e.target.checked)}
                      aria-label={`Currently working at this position`}
                    />
                    <span>Currently working here</span>
                  </label>
                </div>

                <div className="form-group full-width">
                  <label htmlFor={`exp-tasks-${index}`} className="form-label">
                    Responsibilities
                  </label>
                  <textarea
                    id={`exp-tasks-${index}`}
                    className="form-input"
                    rows="3"
                    value={entry.tasks || ''}
                    onChange={(e) => handleExperienceChange(index, 'tasks', e.target.value)}
                    placeholder="Describe your key responsibilities and achievements"
                    aria-label={`Responsibilities for experience ${index + 1}`}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor={`exp-workType-${index}`} className="form-label">
                    Work Type
                  </label>
                  <select
                    id={`exp-workType-${index}`}
                    className="form-input"
                    value={entry.workType || ''}
                    onChange={(e) => handleExperienceChange(index, 'workType', e.target.value)}
                  >
                    <option value="">Select type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor={`exp-jobLevel-${index}`} className="form-label">
                    Job Level
                  </label>
                  <select
                    id={`exp-jobLevel-${index}`}
                    className="form-input"
                    value={entry.jobLevel || ''}
                    onChange={(e) => handleExperienceChange(index, 'jobLevel', e.target.value)}
                  >
                    <option value="">Select level</option>
                    <option value="Entry">Entry Level</option>
                    <option value="Mid">Mid Level</option>
                    <option value="Senior">Senior Level</option>
                    <option value="Lead">Lead</option>
                    <option value="Manager">Manager</option>
                    <option value="Director">Director</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor={`exp-city-${index}`} className="form-label">
                    City
                  </label>
                  <input
                    type="text"
                    id={`exp-city-${index}`}
                    className="form-input"
                    value={entry.city || ''}
                    onChange={(e) => handleExperienceChange(index, 'city', e.target.value)}
                    placeholder="City"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor={`exp-country-${index}`} className="form-label">
                    Country
                  </label>
                  <input
                    type="text"
                    id={`exp-country-${index}`}
                    className="form-input"
                    value={entry.country || ''}
                    onChange={(e) => handleExperienceChange(index, 'country', e.target.value)}
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default EducationExperienceStep;
