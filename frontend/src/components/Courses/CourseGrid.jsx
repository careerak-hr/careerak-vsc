import React from 'react';
import { useApp } from '../../context/AppContext';
import CourseCard from './CourseCard';
import './CourseGrid.css';

const CourseGrid = ({ courses, view = 'grid', loading = false }) => {
  const { language } = useApp();

  // Translations
  const translations = {
    ar: {
      noCourses: 'لا توجد دورات',
      noCoursesMessage: 'لم نتمكن من العثور على أي دورات تطابق معايير البحث الخاصة بك.',
      tryAdjusting: 'حاول تعديل الفلاتر أو البحث عن شيء آخر.',
      clearFilters: 'مسح جميع الفلاتر',
      loading: 'جاري التحميل...'
    },
    en: {
      noCourses: 'No Courses Found',
      noCoursesMessage: 'We couldn\'t find any courses matching your search criteria.',
      tryAdjusting: 'Try adjusting your filters or search for something else.',
      clearFilters: 'Clear All Filters',
      loading: 'Loading...'
    },
    fr: {
      noCourses: 'Aucun cours trouvé',
      noCoursesMessage: 'Nous n\'avons trouvé aucun cours correspondant à vos critères de recherche.',
      tryAdjusting: 'Essayez d\'ajuster vos filtres ou de rechercher autre chose.',
      clearFilters: 'Effacer tous les filtres',
      loading: 'Chargement...'
    }
  };

  const t = translations[language] || translations.en;

  // Handle clear filters
  const handleClearFilters = () => {
    // Emit custom event to clear filters
    window.dispatchEvent(new CustomEvent('clearFilters'));
  };

  // Loading state
  if (loading) {
    return (
      <div className="course-grid-loading">
        <div className="loading-spinner"></div>
        <p>{t.loading}</p>
      </div>
    );
  }

  // Empty state
  if (!courses || courses.length === 0) {
    return (
      <div className="course-grid-empty">
        <div className="empty-icon">📚</div>
        <h3 className="empty-title">{t.noCourses}</h3>
        <p className="empty-message">{t.noCoursesMessage}</p>
        <p className="empty-suggestion">{t.tryAdjusting}</p>
        <button 
          className="clear-filters-button"
          onClick={handleClearFilters}
        >
          {t.clearFilters}
        </button>
      </div>
    );
  }

  // Render courses in grid or list layout
  return (
    <div className={`course-grid course-grid-${view}`}>
      {courses.map((course) => (
        <CourseCard 
          key={course._id} 
          course={course} 
          view={view}
        />
      ))}
    </div>
  );
};

export default CourseGrid;
