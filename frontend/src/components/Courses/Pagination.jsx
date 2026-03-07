import React from 'react';
import { useApp } from '../../context/AppContext';
import './Pagination.css';

const Pagination = ({ 
  currentPage = 1, 
  totalPages = 1, 
  totalResults = 0,
  onPageChange,
  resultsPerPage = 12
}) => {
  const { language } = useApp();

  // Translations
  const translations = {
    ar: {
      page: 'صفحة',
      of: 'من',
      results: 'نتيجة',
      previous: 'السابق',
      next: 'التالي',
      showing: 'عرض',
      to: 'إلى'
    },
    en: {
      page: 'Page',
      of: 'of',
      results: 'results',
      previous: 'Previous',
      next: 'Next',
      showing: 'Showing',
      to: 'to'
    },
    fr: {
      page: 'Page',
      of: 'de',
      results: 'résultats',
      previous: 'Précédent',
      next: 'Suivant',
      showing: 'Affichage',
      to: 'à'
    }
  };

  const t = translations[language] || translations.en;

  // Calculate range
  const startResult = totalResults === 0 ? 0 : (currentPage - 1) * resultsPerPage + 1;
  const endResult = Math.min(currentPage * resultsPerPage, totalResults);

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);
      
      // Calculate range around current page
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if at the beginning
      if (currentPage <= 3) {
        endPage = 4;
      }
      
      // Adjust if at the end
      if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
      }
      
      // Add ellipsis if needed
      if (startPage > 2) {
        pages.push('...');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      
      // Show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  // Don't render if no results or only one page
  if (totalResults === 0 || totalPages <= 1) {
    return null;
  }

  const pageNumbers = getPageNumbers();

  return (
    <div className="pagination-container">
      {/* Results info */}
      <div className="pagination-info">
        <span className="results-text">
          {t.showing} {startResult} {t.to} {endResult} {t.of} {totalResults} {t.results}
        </span>
      </div>

      {/* Pagination controls */}
      <div className="pagination-controls">
        {/* Previous button */}
        <button
          className="pagination-button pagination-prev"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label={t.previous}
        >
          <span className="button-icon">{language === 'ar' ? '→' : '←'}</span>
          <span className="button-text">{t.previous}</span>
        </button>

        {/* Page numbers */}
        <div className="pagination-pages">
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                  ...
                </span>
              );
            }
            
            return (
              <button
                key={page}
                className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                onClick={() => handlePageChange(page)}
                aria-label={`${t.page} ${page}`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next button */}
        <button
          className="pagination-button pagination-next"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label={t.next}
        >
          <span className="button-text">{t.next}</span>
          <span className="button-icon">{language === 'ar' ? '←' : '→'}</span>
        </button>
      </div>
    </div>
  );
};

export default Pagination;
