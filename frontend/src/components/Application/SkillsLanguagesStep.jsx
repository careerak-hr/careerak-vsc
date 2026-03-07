import React, { useEffect } from 'react';
import { useApplicationForm } from '../../context/ApplicationContext';
import './SkillsLanguagesStep.css';

function SkillsLanguagesStep({ errors = {} }) {
  const {
    formData,
    setSkill,
    addSkill,
    removeSkill,
    setLanguage,
    addLanguage,
    removeLanguage,
    clearError,
  } = useApplicationForm();

  // Auto-fill from user profile (will be implemented in task 8)
  useEffect(() => {
    // TODO: Load user profile and auto-fill skills and languages
    // This will be implemented in task 8
  }, []);

  const handleSkillChange = (category, index, field, value) => {
    const skill = formData[category][index];
    const updatedSkill = { ...skill, [field]: value };
    setSkill(category, index, updatedSkill);
  };

  const handleAddSkill = (category) => {
    addSkill(category, { skill: '', proficiency: '' });
  };

  const handleRemoveSkill = (category, index) => {
    removeSkill(category, index);
    if (errors.skills) {
      clearError('skills');
    }
  };

  const handleLanguageChange = (index, field, value) => {
    const language = formData.languages[index];
    const updatedLanguage = { ...language, [field]: value };
    setLanguage(index, updatedLanguage);
  };

  const handleAddLanguage = () => {
    addLanguage({ language: '', proficiency: '' });
  };

  const handleRemoveLanguage = (index) => {
    removeLanguage(index);
  };

  const renderSkillSection = (category, title) => {
    const skills = formData[category] || [];
    
    return (
      <div className="skill-category" role="group" aria-labelledby={`${category}-heading`}>
        <div className="category-header">
          <h4 id={`${category}-heading`} className="category-title">{title}</h4>
          <button
            type="button"
            className="btn-add-small"
            onClick={() => handleAddSkill(category)}
            aria-label={`Add ${title.toLowerCase()}`}
          >
            + Add
          </button>
        </div>

        {skills.length === 0 && (
          <p className="empty-message-small" role="status">No {title.toLowerCase()} added yet.</p>
        )}

        <div className="skills-list" role="list" aria-label={title}>
          {skills.map((skill, index) => (
            <div key={index} className="skill-item" role="listitem">
              <div className="skill-inputs">
                <input
                  type="text"
                  className="form-input skill-name"
                  value={skill.skill || ''}
                  onChange={(e) => handleSkillChange(category, index, 'skill', e.target.value)}
                  placeholder={`${title.slice(0, -1)} name`}
                  aria-label={`${title} name ${index + 1}`}
                />
                <select
                  className="form-input skill-proficiency"
                  value={skill.proficiency || ''}
                  onChange={(e) => handleSkillChange(category, index, 'proficiency', e.target.value)}
                  aria-label={`${title} proficiency level ${index + 1}`}
                >
                  <option value="">Proficiency</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
              <button
                type="button"
                className="btn-remove-small"
                onClick={() => handleRemoveSkill(category, index)}
                aria-label={`Remove ${title.toLowerCase()} ${index + 1}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="skills-languages-step" role="group" aria-labelledby="skills-languages-heading">
      <h2 id="skills-languages-heading" className="step-heading">Skills & Languages</h2>
      <p className="step-description">
        Add your skills and language proficiencies. At least one skill is required.
      </p>

      {/* Skills Section */}
      <section className="section" aria-labelledby="skills-section-heading">
        <h3 id="skills-section-heading" className="section-title">Skills</h3>
        
        {errors.skills && (
          <div className="section-error" role="alert" aria-live="polite">
            {errors.skills}
          </div>
        )}

        <div className="skills-grid" role="group" aria-label="Skills categories">
          {renderSkillSection('computerSkills', 'Computer Skills')}
          {renderSkillSection('softwareSkills', 'Software Skills')}
          {renderSkillSection('otherSkills', 'Other Skills')}
        </div>
      </section>

      {/* Languages Section */}
      <section className="section" aria-labelledby="languages-section-heading">
        <div className="section-header">
          <h3 id="languages-section-heading" className="section-title">Languages</h3>
          <button
            type="button"
            className="btn-add"
            onClick={handleAddLanguage}
            aria-label="Add language"
          >
            + Add Language
          </button>
        </div>

        {formData.languages.length === 0 && (
          <p className="empty-message" role="status">No languages added yet. Click "Add Language" to get started.</p>
        )}

        <div className="languages-list" role="list" aria-label="Languages">
          {formData.languages.map((lang, index) => (
            <div key={index} className="language-card" role="listitem">
              <div className="language-inputs">
                <div className="form-group">
                  <label htmlFor={`lang-name-${index}`} className="form-label">
                    Language
                  </label>
                  <input
                    type="text"
                    id={`lang-name-${index}`}
                    className="form-input"
                    value={lang.language || ''}
                    onChange={(e) => handleLanguageChange(index, 'language', e.target.value)}
                    placeholder="e.g., English, Arabic, French"
                    aria-label={`Language name ${index + 1}`}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor={`lang-prof-${index}`} className="form-label">
                    Proficiency
                  </label>
                  <select
                    id={`lang-prof-${index}`}
                    className="form-input"
                    value={lang.proficiency || ''}
                    onChange={(e) => handleLanguageChange(index, 'proficiency', e.target.value)}
                    aria-label={`Language proficiency level ${index + 1}`}
                  >
                    <option value="">Select proficiency</option>
                    <option value="Elementary">Elementary</option>
                    <option value="Limited Working">Limited Working</option>
                    <option value="Professional Working">Professional Working</option>
                    <option value="Full Professional">Full Professional</option>
                    <option value="Native">Native / Bilingual</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                className="btn-remove-card"
                onClick={() => handleRemoveLanguage(index)}
                aria-label={`Remove language ${index + 1}`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default SkillsLanguagesStep;
