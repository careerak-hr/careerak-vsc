import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './SavedSearchesPanel.css';

const SavedSearchesPanel = () => {
  const { language, fontFamily } = useApp();
  const navigate = useNavigate();
  const [savedSearches, setSavedSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const translations = {
    ar: {
      title: 'عمليات البحث المحفوظة',
      noSearches: 'لا توجد عمليات بحث محفوظة',
      noSearchesDesc: 'احفظ عمليات البحث المفضلة لديك للوصول السريع',
      apply: 'تطبيق',
      edit: 'تعديل',
      delete: 'حذف',
      alertOn: 'التنبيهات مفعلة',
      alertOff: 'التنبيهات معطلة',
      confirmDelete: 'هل أنت متأكد من حذف عملية البحث؟',
      deleteSuccess: 'تم حذف عملية البحث بنجاح',
      deleteError: 'فشل حذف عملية البحث',
      loadError: 'فشل تحميل عمليات البحث المحفوظة',
      jobs: 'وظائف',
      courses: 'دورات'
    },
    en: {
      title: 'Saved Searches',
      noSearches: 'No saved searches',
      noSearchesDesc: 'Save your favorite searches for quick access',
      apply: 'Apply',
      edit: 'Edit',
      delete: 'Delete',
      alertOn: 'Alerts enabled',
      alertOff: 'Alerts disabled',
      confirmDelete: 'Are you sure you want to delete this search?',
      deleteSuccess: 'Search deleted successfully',
      deleteError: 'Failed to delete search',
      loadError: 'Failed to load saved searches',
      jobs: 'Jobs',
      courses: 'Courses'
    },
    fr: {
      title: 'Recherches enregistrées',
      noSearches: 'Aucune recherche enregistrée',
      noSearchesDesc: 'Enregistrez vos recherches préférées pour un accès rapide',
      apply: 'Appliquer',
      edit: 'Modifier',
      delete: 'Supprimer',
      alertOn: 'Alertes activées',
      alertOff: 'Alertes désactivées',
      confirmDelete: 'Êtes-vous sûr de vouloir supprimer cette recherche?',
      deleteSuccess: 'Recherche supprimée avec succès',
      deleteError: 'Échec de la suppression de la recherche',
      loadError: 'Échec du chargement des recherches enregistrées',
      jobs: 'Emplois',
      courses: 'Cours'
    }
  };

  const t = translations[language] || translations.ar;

  const fontStyle = {
    fontFamily: fontFamily,
    fontWeight: 'inherit',
    fontStyle: 'inherit'
  };

  useEffect(() => {
    fetchSavedSearches();
  }, []);

  const fetchSavedSearches = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/search/saved`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch saved searches');
      }

      const data = await response.json();
      setSavedSearches(data.data.savedSearches || []);
    } catch (err) {
      console.error('Error fetching saved searches:', err);
      setError(t.loadError);
    } finally {
      setLoading(false);
    }
  };

  const handleApplySearch = (search) => {
    // بناء URL مع معاملات البحث
    const params = new URLSearchParams();
    
    if (search.searchParams.query) {
      params.set('q', search.searchParams.query);
    }
    if (search.searchParams.location) {
      params.set('location', search.searchParams.location);
    }
    if (search.searchParams.salaryMin) {
      params.set('salaryMin', search.searchParams.salaryMin);
    }
    if (search.searchParams.salaryMax) {
      params.set('salaryMax', search.searchParams.salaryMax);
    }
    if (search.searchParams.workType && search.searchParams.workType.length > 0) {
      params.set('workType', search.searchParams.workType.join(','));
    }
    if (search.searchParams.experienceLevel && search.searchParams.experienceLevel.length > 0) {
      params.set('experienceLevel', search.searchParams.experienceLevel.join(','));
    }
    if (search.searchParams.skills && search.searchParams.skills.length > 0) {
      params.set('skills', search.searchParams.skills.join(','));
    }

    // الانتقال إلى صفحة البحث المناسبة
    const basePath = search.searchType === 'jobs' ? '/job-postings' : '/courses';
    navigate(`${basePath}?${params.toString()}`);
  };

  const handleDeleteSearch = async (searchId) => {
    if (!window.confirm(t.confirmDelete)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/search/saved/${searchId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete search');
      }

      // تحديث القائمة
      setSavedSearches(prev => prev.filter(s => s._id !== searchId));
      
      // إظهار رسالة نجاح (يمكن استخدام toast notification)
      alert(t.deleteSuccess);
    } catch (err) {
      console.error('Error deleting search:', err);
      alert(t.deleteError);
    }
  };

  if (loading) {
    return (
      <div className="saved-searches-panel" style={fontStyle}>
        <div className="saved-searches-loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="saved-searches-panel" style={fontStyle}>
        <div className="saved-searches-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="saved-searches-panel" style={fontStyle}>
      <h2 className="saved-searches-title">{t.title}</h2>
      
      {savedSearches.length === 0 ? (
        <div className="saved-searches-empty">
          <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="empty-title">{t.noSearches}</p>
          <p className="empty-desc">{t.noSearchesDesc}</p>
        </div>
      ) : (
        <div className="saved-searches-list">
          {savedSearches.map(search => (
            <div key={search._id} className="saved-search-card">
              <div className="search-header">
                <h3 className="search-name">{search.name}</h3>
                <span className="search-type-badge">
                  {search.searchType === 'jobs' ? t.jobs : t.courses}
                </span>
              </div>

              <div className="search-details">
                {search.searchParams.query && (
                  <div className="search-param">
                    <svg className="param-icon" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                    <span>{search.searchParams.query}</span>
                  </div>
                )}
                
                {search.searchParams.location && (
                  <div className="search-param">
                    <svg className="param-icon" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span>{search.searchParams.location}</span>
                  </div>
                )}

                {search.alertEnabled && (
                  <div className="search-alert-badge">
                    <svg className="alert-icon" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                    <span>{t.alertOn}</span>
                  </div>
                )}
              </div>

              <div className="search-actions">
                <button
                  className="btn-apply"
                  onClick={() => handleApplySearch(search)}
                >
                  {t.apply}
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDeleteSearch(search._id)}
                >
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {t.delete}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedSearchesPanel;
