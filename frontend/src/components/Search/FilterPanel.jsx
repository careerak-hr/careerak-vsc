import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import './FilterPanel.css';

/**
 * لوحة الفلاتر الجانبية
 * تدعم جميع أنواع الفلاتر بما في ذلك اختيار المهارات المتعددة
 */
const FilterPanel = ({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  resultCount,
  availableFilters = {},
  type = 'jobs'
}) => {
  const { language } = useApp();
  const [localFilters, setLocalFilters] = useState(filters);
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);

  // تحديث الفلاتر المحلية عند تغيير الفلاتر الخارجية
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // الترجمات
  const translations = {
    ar: {
      filters: 'الفلاتر',
      clearAll: 'مسح الكل',
      results: 'نتيجة',
      salary: 'الراتب',
      from: 'من',
      to: 'إلى',
      location: 'الموقع',
      enterLocation: 'أدخل المدينة أو الدولة',
      workType: 'نوع العمل',
      fullTime: 'دوام كامل',
      partTime: 'دوام جزئي',
      remote: 'عن بعد',
      hybrid: 'هجين',
      contract: 'عقد',
      internship: 'تدريب',
      experienceLevel: 'مستوى الخبرة',
      entry: 'مبتدئ',
      mid: 'متوسط',
      senior: 'خبير',
      lead: 'قيادي',
      executive: 'تنفيذي',
      skills: 'المهارات',
      skillsLogic: 'منطق المهارات',
      allSkills: 'جميع المهارات (AND)',
      anySkill: 'أي مهارة (OR)',
      searchSkills: 'ابحث عن مهارة...',
      selectedSkills: 'المهارات المختارة',
      noSkillsSelected: 'لم يتم اختيار مهارات',
      addSkill: 'إضافة مهارة',
      datePosted: 'تاريخ النشر',
      today: 'اليوم',
      week: 'آخر أسبوع',
      month: 'آخر شهر',
      all: 'الكل',
      companySize: 'حجم الشركة',
      small: 'صغيرة',
      medium: 'متوسطة',
      large: 'كبيرة',
      enterprise: 'مؤسسة',
      apply: 'تطبيق'
    },
    en: {
      filters: 'Filters',
      clearAll: 'Clear All',
      results: 'results',
      salary: 'Salary',
      from: 'From',
      to: 'To',
      location: 'Location',
      enterLocation: 'Enter city or country',
      workType: 'Work Type',
      fullTime: 'Full-time',
      partTime: 'Part-time',
      remote: 'Remote',
      hybrid: 'Hybrid',
      contract: 'Contract',
      internship: 'Internship',
      experienceLevel: 'Experience Level',
      entry: 'Entry',
      mid: 'Mid',
      senior: 'Senior',
      lead: 'Lead',
      executive: 'Executive',
      skills: 'Skills',
      skillsLogic: 'Skills Logic',
      allSkills: 'All Skills (AND)',
      anySkill: 'Any Skill (OR)',
      searchSkills: 'Search for a skill...',
      selectedSkills: 'Selected Skills',
      noSkillsSelected: 'No skills selected',
      addSkill: 'Add Skill',
      datePosted: 'Date Posted',
      today: 'Today',
      week: 'Last Week',
      month: 'Last Month',
      all: 'All',
      companySize: 'Company Size',
      small: 'Small',
      medium: 'Medium',
      large: 'Large',
      enterprise: 'Enterprise',
      apply: 'Apply'
    },
    fr: {
      filters: 'Filtres',
      clearAll: 'Tout effacer',
      results: 'résultats',
      salary: 'Salaire',
      from: 'De',
      to: 'À',
      location: 'Emplacement',
      enterLocation: 'Entrez la ville ou le pays',
      workType: 'Type de travail',
      fullTime: 'Temps plein',
      partTime: 'Temps partiel',
      remote: 'À distance',
      hybrid: 'Hybride',
      contract: 'Contrat',
      internship: 'Stage',
      experienceLevel: 'Niveau d\'expérience',
      entry: 'Débutant',
      mid: 'Intermédiaire',
      senior: 'Senior',
      lead: 'Lead',
      executive: 'Exécutif',
      skills: 'Compétences',
      skillsLogic: 'Logique des compétences',
      allSkills: 'Toutes les compétences (AND)',
      anySkill: 'N\'importe quelle compétence (OR)',
      searchSkills: 'Rechercher une compétence...',
      selectedSkills: 'Compétences sélectionnées',
      noSkillsSelected: 'Aucune compétence sélectionnée',
      addSkill: 'Ajouter une compétence',
      datePosted: 'Date de publication',
      today: 'Aujourd\'hui',
      week: 'Dernière semaine',
      month: 'Dernier mois',
      all: 'Tout',
      companySize: 'Taille de l\'entreprise',
      small: 'Petite',
      medium: 'Moyenne',
      large: 'Grande',
      enterprise: 'Entreprise',
      apply: 'Appliquer'
    }
  };

  const t = translations[language] || translations.ar;

  // معالجة تغيير الفلتر
  const handleFilterChange = (filterName, value) => {
    const updatedFilters = {
      ...localFilters,
      [filterName]: value
    };
    setLocalFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  // معالجة تغيير checkbox
  const handleCheckboxChange = (filterName, value) => {
    const currentValues = localFilters[filterName] || [];
    let newValues;

    if (currentValues.includes(value)) {
      newValues = currentValues.filter(v => v !== value);
    } else {
      newValues = [...currentValues, value];
    }

    handleFilterChange(filterName, newValues);
  };

  // معالجة إضافة مهارة
  const handleAddSkill = (skill) => {
    const currentSkills = localFilters.skills || [];
    
    if (!currentSkills.includes(skill)) {
      const newSkills = [...currentSkills, skill];
      handleFilterChange('skills', newSkills);
    }
    
    setSkillSearchQuery('');
    setShowSkillsDropdown(false);
  };

  // معالجة حذف مهارة
  const handleRemoveSkill = (skill) => {
    const currentSkills = localFilters.skills || [];
    const newSkills = currentSkills.filter(s => s !== skill);
    handleFilterChange('skills', newSkills);
  };

  // تصفية المهارات المتاحة
  const getFilteredSkills = () => {
    if (!skillSearchQuery || skillSearchQuery.length < 2) {
      return availableFilters.skills || [];
    }

    const query = skillSearchQuery.toLowerCase();
    const currentSkills = localFilters.skills || [];
    
    return (availableFilters.skills || [])
      .filter(skill => 
        skill.toLowerCase().includes(query) && 
        !currentSkills.includes(skill)
      )
      .slice(0, 10);
  };

  // مسح جميع الفلاتر
  const handleClearAll = () => {
    onClearFilters();
  };

  return (
    <div className="filter-panel">
      {/* Header */}
      <div className="filter-panel-header">
        <h3>{t.filters}</h3>
        <button 
          className="clear-filters-btn"
          onClick={handleClearAll}
        >
          {t.clearAll}
        </button>
      </div>

      {/* Result Count */}
      {resultCount !== undefined && (
        <div className="result-count">
          {resultCount} {t.results}
        </div>
      )}

      {/* Filters */}
      <div className="filter-sections">
        
        {/* Salary Filter (Jobs only) */}
        {type === 'jobs' && (
          <div className="filter-section">
            <h4>{t.salary}</h4>
            <div className="salary-inputs">
              <div className="input-group">
                <label>{t.from}</label>
                <input
                  type="number"
                  min="0"
                  value={localFilters.salaryMin || ''}
                  onChange={(e) => handleFilterChange('salaryMin', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="0"
                />
              </div>
              <div className="input-group">
                <label>{t.to}</label>
                <input
                  type="number"
                  min="0"
                  value={localFilters.salaryMax || ''}
                  onChange={(e) => handleFilterChange('salaryMax', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="∞"
                />
              </div>
            </div>
          </div>
        )}

        {/* Location Filter */}
        <div className="filter-section">
          <h4>{t.location}</h4>
          <input
            type="text"
            value={localFilters.location || ''}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            placeholder={t.enterLocation}
            className="location-input"
          />
        </div>

        {/* Work Type Filter (Jobs only) */}
        {type === 'jobs' && (
          <div className="filter-section">
            <h4>{t.workType}</h4>
            <div className="checkbox-group">
              {[
                { value: 'Full-time', label: t.fullTime },
                { value: 'Part-time', label: t.partTime },
                { value: 'Remote', label: t.remote },
                { value: 'Hybrid', label: t.hybrid },
                { value: 'Contract', label: t.contract },
                { value: 'Internship', label: t.internship }
              ].map(option => (
                <label key={option.value} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={(localFilters.workType || []).includes(option.value)}
                    onChange={() => handleCheckboxChange('workType', option.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Experience Level Filter (Jobs only) */}
        {type === 'jobs' && (
          <div className="filter-section">
            <h4>{t.experienceLevel}</h4>
            <div className="checkbox-group">
              {[
                { value: 'Entry', label: t.entry },
                { value: 'Mid', label: t.mid },
                { value: 'Senior', label: t.senior },
                { value: 'Lead', label: t.lead },
                { value: 'Executive', label: t.executive }
              ].map(option => (
                <label key={option.value} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={(localFilters.experienceLevel || []).includes(option.value)}
                    onChange={() => handleCheckboxChange('experienceLevel', option.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Skills Filter */}
        <div className="filter-section skills-section">
          <h4>{t.skills}</h4>
          
          {/* Skills Logic Toggle */}
          <div className="skills-logic-toggle">
            <label className="radio-label">
              <input
                type="radio"
                name="skillsLogic"
                value="OR"
                checked={localFilters.skillsLogic === 'OR' || !localFilters.skillsLogic}
                onChange={() => handleFilterChange('skillsLogic', 'OR')}
              />
              <span>{t.anySkill}</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="skillsLogic"
                value="AND"
                checked={localFilters.skillsLogic === 'AND'}
                onChange={() => handleFilterChange('skillsLogic', 'AND')}
              />
              <span>{t.allSkills}</span>
            </label>
          </div>

          {/* Skills Search */}
          <div className="skills-search-container">
            <input
              type="text"
              value={skillSearchQuery}
              onChange={(e) => {
                setSkillSearchQuery(e.target.value);
                setShowSkillsDropdown(e.target.value.length >= 2);
              }}
              onFocus={() => setShowSkillsDropdown(skillSearchQuery.length >= 2)}
              placeholder={t.searchSkills}
              className="skills-search-input"
            />
            
            {/* Skills Dropdown */}
            {showSkillsDropdown && getFilteredSkills().length > 0 && (
              <div className="skills-dropdown">
                {getFilteredSkills().map(skill => (
                  <div
                    key={skill}
                    className="skill-option"
                    onClick={() => handleAddSkill(skill)}
                  >
                    {skill}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Skills */}
          <div className="selected-skills">
            <div className="selected-skills-label">{t.selectedSkills}:</div>
            {(!localFilters.skills || localFilters.skills.length === 0) ? (
              <div className="no-skills">{t.noSkillsSelected}</div>
            ) : (
              <div className="skills-tags">
                {localFilters.skills.map(skill => (
                  <div key={skill} className="skill-tag">
                    <span>{skill}</span>
                    <button
                      className="remove-skill-btn"
                      onClick={() => handleRemoveSkill(skill)}
                      aria-label={`Remove ${skill}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Date Posted Filter */}
        <div className="filter-section">
          <h4>{t.datePosted}</h4>
          <div className="radio-group">
            {[
              { value: 'today', label: t.today },
              { value: 'week', label: t.week },
              { value: 'month', label: t.month },
              { value: 'all', label: t.all }
            ].map(option => (
              <label key={option.value} className="radio-label">
                <input
                  type="radio"
                  name="datePosted"
                  value={option.value}
                  checked={localFilters.datePosted === option.value || (!localFilters.datePosted && option.value === 'all')}
                  onChange={() => handleFilterChange('datePosted', option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Company Size Filter (Jobs only) */}
        {type === 'jobs' && (
          <div className="filter-section">
            <h4>{t.companySize}</h4>
            <div className="checkbox-group">
              {[
                { value: 'Small', label: t.small },
                { value: 'Medium', label: t.medium },
                { value: 'Large', label: t.large },
                { value: 'Enterprise', label: t.enterprise }
              ].map(option => (
                <label key={option.value} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={(localFilters.companySize || []).includes(option.value)}
                    onChange={() => handleCheckboxChange('companySize', option.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default FilterPanel;
