import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import './JobFilters.css';

const JobFilters = ({ onFilterChange, onClearFilters }) => {
  const { language } = useApp();
  const [filterOptions, setFilterOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    field: '',
    location: '',
    jobType: '',
    experienceLevel: '',
    minSalary: '',
    maxSalary: '',
    skills: [],
    // فلاتر متقدمة
    companySize: '',
    remote: '',
    benefits: [],
    postedWithin: ''
  });

  // الترجمات
  const translations = {
    ar: {
      filters: 'الفلاتر',
      search: 'البحث',
      searchPlaceholder: 'ابحث عن وظيفة...',
      field: 'المجال',
      selectField: 'اختر المجال',
      location: 'الموقع',
      selectLocation: 'اختر الموقع',
      jobType: 'نوع العمل',
      selectJobType: 'اختر نوع العمل',
      experienceLevel: 'مستوى الخبرة',
      selectExperience: 'اختر مستوى الخبرة',
      salary: 'الراتب',
      minSalary: 'الحد الأدنى',
      maxSalary: 'الحد الأقصى',
      skills: 'المهارات',
      selectSkills: 'اختر المهارات',
      clearFilters: 'مسح الفلاتر',
      applyFilters: 'تطبيق الفلاتر',
      resultsCount: 'نتيجة',
      advancedFilters: 'فلاتر متقدمة',
      showAdvanced: 'إظهار الفلاتر المتقدمة',
      hideAdvanced: 'إخفاء الفلاتر المتقدمة',
      companySize: 'حجم الشركة',
      selectCompanySize: 'اختر حجم الشركة',
      remote: 'العمل عن بعد',
      selectRemote: 'اختر نوع العمل',
      benefits: 'المزايا',
      selectBenefits: 'اختر المزايا',
      postedWithin: 'تاريخ النشر',
      selectPostedWithin: 'اختر الفترة',
      'Permanent Job': 'وظيفة دائمة',
      'Temporary/Lecturer': 'مؤقت/محاضر',
      'Consultancy': 'استشاري',
      'Practical Training': 'تدريب عملي',
      'Online Course': 'دورة أونلاين',
      'Full-time': 'دوام كامل',
      'Part-time': 'دوام جزئي',
      'Contract': 'عقد',
      'Temporary': 'مؤقت',
      'Entry': 'مبتدئ',
      'Mid': 'متوسط',
      'Senior': 'خبير',
      'Expert': 'محترف',
      'Small': 'صغيرة',
      'Medium': 'متوسطة',
      'Large': 'كبيرة',
      'Yes': 'نعم',
      'No': 'لا',
      'Hybrid': 'مختلط',
      'Health Insurance': 'تأمين صحي',
      'Paid Leave': 'إجازة مدفوعة',
      'Retirement Plan': 'خطة تقاعد',
      'Training': 'تدريب',
      'Flexible Hours': 'ساعات مرنة',
      'Last 24 hours': 'آخر 24 ساعة',
      'Last 7 days': 'آخر 7 أيام',
      'Last 30 days': 'آخر 30 يوم',
      'Any time': 'أي وقت'
    },
    en: {
      filters: 'Filters',
      search: 'Search',
      searchPlaceholder: 'Search for a job...',
      field: 'Field',
      selectField: 'Select Field',
      location: 'Location',
      selectLocation: 'Select Location',
      jobType: 'Job Type',
      selectJobType: 'Select Job Type',
      experienceLevel: 'Experience Level',
      selectExperience: 'Select Experience',
      salary: 'Salary',
      minSalary: 'Minimum',
      maxSalary: 'Maximum',
      skills: 'Skills',
      selectSkills: 'Select Skills',
      clearFilters: 'Clear Filters',
      applyFilters: 'Apply Filters',
      resultsCount: 'results',
      advancedFilters: 'Advanced Filters',
      showAdvanced: 'Show Advanced Filters',
      hideAdvanced: 'Hide Advanced Filters',
      companySize: 'Company Size',
      selectCompanySize: 'Select Company Size',
      remote: 'Remote Work',
      selectRemote: 'Select Remote Type',
      benefits: 'Benefits',
      selectBenefits: 'Select Benefits',
      postedWithin: 'Posted Within',
      selectPostedWithin: 'Select Time Period',
      'Permanent Job': 'Permanent Job',
      'Temporary/Lecturer': 'Temporary/Lecturer',
      'Consultancy': 'Consultancy',
      'Practical Training': 'Practical Training',
      'Online Course': 'Online Course',
      'Full-time': 'Full-time',
      'Part-time': 'Part-time',
      'Contract': 'Contract',
      'Temporary': 'Temporary',
      'Entry': 'Entry',
      'Mid': 'Mid',
      'Senior': 'Senior',
      'Expert': 'Expert',
      'Small': 'Small',
      'Medium': 'Medium',
      'Large': 'Large',
      'Yes': 'Yes',
      'No': 'No',
      'Hybrid': 'Hybrid',
      'Health Insurance': 'Health Insurance',
      'Paid Leave': 'Paid Leave',
      'Retirement Plan': 'Retirement Plan',
      'Training': 'Training',
      'Flexible Hours': 'Flexible Hours',
      'Last 24 hours': 'Last 24 hours',
      'Last 7 days': 'Last 7 days',
      'Last 30 days': 'Last 30 days',
      'Any time': 'Any time'
    },
    fr: {
      filters: 'Filtres',
      search: 'Recherche',
      searchPlaceholder: 'Rechercher un emploi...',
      field: 'Domaine',
      selectField: 'Sélectionner le domaine',
      location: 'Lieu',
      selectLocation: 'Sélectionner le lieu',
      jobType: 'Type d\'emploi',
      selectJobType: 'Sélectionner le type',
      experienceLevel: 'Niveau d\'expérience',
      selectExperience: 'Sélectionner l\'expérience',
      salary: 'Salaire',
      minSalary: 'Minimum',
      maxSalary: 'Maximum',
      skills: 'Compétences',
      selectSkills: 'Sélectionner les compétences',
      clearFilters: 'Effacer les filtres',
      applyFilters: 'Appliquer les filtres',
      resultsCount: 'résultats',
      advancedFilters: 'Filtres avancés',
      showAdvanced: 'Afficher les filtres avancés',
      hideAdvanced: 'Masquer les filtres avancés',
      companySize: 'Taille de l\'entreprise',
      selectCompanySize: 'Sélectionner la taille',
      remote: 'Travail à distance',
      selectRemote: 'Sélectionner le type',
      benefits: 'Avantages',
      selectBenefits: 'Sélectionner les avantages',
      postedWithin: 'Publié dans',
      selectPostedWithin: 'Sélectionner la période',
      'Permanent Job': 'Emploi permanent',
      'Temporary/Lecturer': 'Temporaire/Conférencier',
      'Consultancy': 'Consultation',
      'Practical Training': 'Formation pratique',
      'Online Course': 'Cours en ligne',
      'Full-time': 'Temps plein',
      'Part-time': 'Temps partiel',
      'Contract': 'Contrat',
      'Temporary': 'Temporaire',
      'Entry': 'Débutant',
      'Mid': 'Intermédiaire',
      'Senior': 'Senior',
      'Expert': 'Expert',
      'Small': 'Petite',
      'Medium': 'Moyenne',
      'Large': 'Grande',
      'Yes': 'Oui',
      'No': 'Non',
      'Hybrid': 'Hybride',
      'Health Insurance': 'Assurance santé',
      'Paid Leave': 'Congés payés',
      'Retirement Plan': 'Plan de retraite',
      'Training': 'Formation',
      'Flexible Hours': 'Horaires flexibles',
      'Last 24 hours': 'Dernières 24 heures',
      'Last 7 days': 'Derniers 7 jours',
      'Last 30 days': 'Derniers 30 jours',
      'Any time': 'N\'importe quand'
    }
  };

  const t = translations[language] || translations.en;

  // جلب خيارات الفلاتر من API
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await fetch('/api/job-postings/filter-options');
        const data = await response.json();
        setFilterOptions(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching filter options:', error);
        setLoading(false);
      }
    };

    fetchFilterOptions();
  }, []);

  // تحديث الفلتر
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // مسح جميع الفلاتر
  const handleClearFilters = () => {
    // إضافة animation
    setClearing(true);
    
    setTimeout(() => {
      const emptyFilters = {
        search: '',
        field: '',
        location: '',
        jobType: '',
        experienceLevel: '',
        minSalary: '',
        maxSalary: '',
        skills: [],
        // فلاتر متقدمة
        companySize: '',
        remote: '',
        benefits: [],
        postedWithin: ''
      };
      setFilters(emptyFilters);
      onClearFilters();
      setClearing(false);
      
      // إظهار رسالة تأكيد (يمكن استخدام toast library)
      console.log('Filters cleared successfully');
    }, 150);
  };

  // التحقق من وجود فلاتر نشطة
  const hasActiveFilters = () => {
    return filters.search !== '' ||
           filters.field !== '' ||
           filters.location !== '' ||
           filters.jobType !== '' ||
           filters.experienceLevel !== '' ||
           filters.minSalary !== '' ||
           filters.maxSalary !== '' ||
           filters.skills.length > 0 ||
           filters.companySize !== '' ||
           filters.remote !== '' ||
           filters.benefits.length > 0 ||
           filters.postedWithin !== '';
  };

  // التحقق من وجود فلاتر متقدمة نشطة
  const hasActiveAdvancedFilters = () => {
    return filters.companySize !== '' ||
           filters.remote !== '' ||
           filters.benefits.length > 0 ||
           filters.postedWithin !== '';
  };

  if (loading) {
    return (
      <div className="job-filters-skeleton">
        <div className="skeleton-line"></div>
        <div className="skeleton-line"></div>
        <div className="skeleton-line"></div>
      </div>
    );
  }

  return (
    <div className={`job-filters ${clearing ? 'clearing' : ''}`}>
      <div className="filters-header">
        <div className="filters-title">
          <Filter className="filter-icon" aria-hidden="true" />
          <h3>{t.filters}</h3>
        </div>
        <button 
          className={`clear-filters-btn ${!hasActiveFilters() ? 'disabled' : ''}`}
          onClick={handleClearFilters}
          disabled={!hasActiveFilters()}
          aria-label={t.clearFilters}
          title={t.clearFilters}
        >
          <X className="clear-icon" aria-hidden="true" />
          <span>{t.clearFilters}</span>
        </button>
      </div>

      {/* البحث النصي */}
      <div className="filter-group">
        <label htmlFor="search-input">{t.search}</label>
        <input
          id="search-input"
          type="text"
          className="filter-input"
          placeholder={t.searchPlaceholder}
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />
      </div>

      {/* المجال */}
      <div className="filter-group">
        <label htmlFor="field-select">{t.field}</label>
        <select
          id="field-select"
          className="filter-select"
          value={filters.field}
          onChange={(e) => handleFilterChange('field', e.target.value)}
        >
          <option value="">{t.selectField}</option>
          {filterOptions?.postingTypes?.map((type) => (
            <option key={type} value={type}>
              {t[type] || type}
            </option>
          ))}
        </select>
      </div>

      {/* الموقع */}
      <div className="filter-group">
        <label htmlFor="location-select">{t.location}</label>
        <select
          id="location-select"
          className="filter-select"
          value={filters.location}
          onChange={(e) => handleFilterChange('location', e.target.value)}
        >
          <option value="">{t.selectLocation}</option>
          <optgroup label="Cities">
            {filterOptions?.locations?.cities?.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </optgroup>
          <optgroup label="Countries">
            {filterOptions?.locations?.countries?.map((country) => (
              <option key={country} value={country}>{country}</option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* نوع العمل */}
      <div className="filter-group">
        <label htmlFor="jobtype-select">{t.jobType}</label>
        <select
          id="jobtype-select"
          className="filter-select"
          value={filters.jobType}
          onChange={(e) => handleFilterChange('jobType', e.target.value)}
        >
          <option value="">{t.selectJobType}</option>
          {filterOptions?.jobTypes?.map((type) => (
            <option key={type} value={type}>
              {t[type] || type}
            </option>
          ))}
        </select>
      </div>

      {/* مستوى الخبرة */}
      <div className="filter-group">
        <label htmlFor="experience-select">{t.experienceLevel}</label>
        <select
          id="experience-select"
          className="filter-select"
          value={filters.experienceLevel}
          onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
        >
          <option value="">{t.selectExperience}</option>
          {filterOptions?.experienceLevels?.map((level) => (
            <option key={level} value={level}>
              {t[level] || level}
            </option>
          ))}
        </select>
      </div>

      {/* الراتب */}
      <div className="filter-group">
        <label>{t.salary}</label>
        <div className="salary-inputs">
          <input
            type="number"
            className="filter-input"
            placeholder={t.minSalary}
            value={filters.minSalary}
            onChange={(e) => handleFilterChange('minSalary', e.target.value)}
            min={filterOptions?.salaryRange?.min || 0}
            max={filterOptions?.salaryRange?.max || 100000}
          />
          <span className="salary-separator">-</span>
          <input
            type="number"
            className="filter-input"
            placeholder={t.maxSalary}
            value={filters.maxSalary}
            onChange={(e) => handleFilterChange('maxSalary', e.target.value)}
            min={filterOptions?.salaryRange?.min || 0}
            max={filterOptions?.salaryRange?.max || 100000}
          />
        </div>
      </div>

      {/* زر الفلاتر المتقدمة */}
      <button
        className={`advanced-filters-toggle ${showAdvancedFilters ? 'active' : ''} ${hasActiveAdvancedFilters() ? 'has-active' : ''}`}
        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
        aria-expanded={showAdvancedFilters}
        aria-controls="advanced-filters-section"
      >
        <span>{showAdvancedFilters ? t.hideAdvanced : t.showAdvanced}</span>
        {showAdvancedFilters ? (
          <ChevronUp className="chevron-icon" aria-hidden="true" />
        ) : (
          <ChevronDown className="chevron-icon" aria-hidden="true" />
        )}
        {hasActiveAdvancedFilters() && (
          <span className="active-badge" aria-label="Active advanced filters">
            {Object.values({
              companySize: filters.companySize,
              remote: filters.remote,
              benefits: filters.benefits,
              postedWithin: filters.postedWithin
            }).filter(v => v && (Array.isArray(v) ? v.length > 0 : v !== '')).length}
          </span>
        )}
      </button>

      {/* الفلاتر المتقدمة (قابلة للطي) */}
      <div
        id="advanced-filters-section"
        className={`advanced-filters ${showAdvancedFilters ? 'expanded' : 'collapsed'}`}
        aria-hidden={!showAdvancedFilters}
      >
        {/* حجم الشركة */}
        <div className="filter-group">
          <label htmlFor="companysize-select">{t.companySize}</label>
          <select
            id="companysize-select"
            className="filter-select"
            value={filters.companySize}
            onChange={(e) => handleFilterChange('companySize', e.target.value)}
          >
            <option value="">{t.selectCompanySize}</option>
            <option value="Small">{t['Small']}</option>
            <option value="Medium">{t['Medium']}</option>
            <option value="Large">{t['Large']}</option>
          </select>
        </div>

        {/* العمل عن بعد */}
        <div className="filter-group">
          <label htmlFor="remote-select">{t.remote}</label>
          <select
            id="remote-select"
            className="filter-select"
            value={filters.remote}
            onChange={(e) => handleFilterChange('remote', e.target.value)}
          >
            <option value="">{t.selectRemote}</option>
            <option value="Yes">{t['Yes']}</option>
            <option value="No">{t['No']}</option>
            <option value="Hybrid">{t['Hybrid']}</option>
          </select>
        </div>

        {/* المزايا */}
        <div className="filter-group">
          <label htmlFor="benefits-select">{t.benefits}</label>
          <div className="benefits-checkboxes">
            {['Health Insurance', 'Paid Leave', 'Retirement Plan', 'Training', 'Flexible Hours'].map((benefit) => (
              <label key={benefit} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.benefits.includes(benefit)}
                  onChange={(e) => {
                    const newBenefits = e.target.checked
                      ? [...filters.benefits, benefit]
                      : filters.benefits.filter(b => b !== benefit);
                    handleFilterChange('benefits', newBenefits);
                  }}
                />
                <span>{t[benefit]}</span>
              </label>
            ))}
          </div>
        </div>

        {/* تاريخ النشر */}
        <div className="filter-group">
          <label htmlFor="posted-select">{t.postedWithin}</label>
          <select
            id="posted-select"
            className="filter-select"
            value={filters.postedWithin}
            onChange={(e) => handleFilterChange('postedWithin', e.target.value)}
          >
            <option value="">{t.selectPostedWithin}</option>
            <option value="24h">{t['Last 24 hours']}</option>
            <option value="7d">{t['Last 7 days']}</option>
            <option value="30d">{t['Last 30 days']}</option>
            <option value="any">{t['Any time']}</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default JobFilters;
