import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import FilterPanel from '../components/Certificates/FilterPanel';
import './CertificatesGalleryPage.css';

const CertificatesGalleryPage = () => {
  const { language, user } = useApp();
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ types: [], years: [], statuses: [] });
  
  // Translation object
  const translations = {
    ar: {
      title: 'معرض الشهادات',
      loading: 'جاري التحميل...',
      error: 'حدث خطأ أثناء تحميل الشهادات',
      noResults: 'لا توجد شهادات تطابق الفلاتر المحددة',
      noCertificates: 'لا توجد شهادات حتى الآن',
      viewCertificate: 'عرض الشهادة',
      download: 'تحميل',
      share: 'مشاركة',
      issuedOn: 'صدرت في',
      status: {
        active: 'صالحة',
        revoked: 'ملغاة',
        expired: 'منتهية'
      }
    },
    en: {
      title: 'Certificates Gallery',
      loading: 'Loading...',
      error: 'Error loading certificates',
      noResults: 'No certificates match the selected filters',
      noCertificates: 'No certificates yet',
      viewCertificate: 'View Certificate',
      download: 'Download',
      share: 'Share',
      issuedOn: 'Issued on',
      status: {
        active: 'Active',
        revoked: 'Revoked',
        expired: 'Expired'
      }
    },
    fr: {
      title: 'Galerie de Certificats',
      loading: 'Chargement...',
      error: 'Erreur lors du chargement des certificats',
      noResults: 'Aucun certificat ne correspond aux filtres sélectionnés',
      noCertificates: 'Aucun certificat pour le moment',
      viewCertificate: 'Voir le Certificat',
      download: 'Télécharger',
      share: 'Partager',
      issuedOn: 'Délivré le',
      status: {
        active: 'Actif',
        revoked: 'Révoqué',
        expired: 'Expiré'
      }
    }
  };
  
  const t = translations[language] || translations.en;
  
  // Fetch certificates
  useEffect(() => {
    const fetchCertificates = async () => {
      if (!user?._id) return;
      
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/certificates/user/${user._id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch certificates');
        }
        
        const data = await response.json();
        setCertificates(data.certificates || []);
        setFilteredCertificates(data.certificates || []);
      } catch (err) {
        console.error('Error fetching certificates:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCertificates();
  }, [user]);
  
  // Apply filters
  const applyFilters = useCallback((newFilters) => {
    setFilters(newFilters);
    
    let filtered = [...certificates];
    
    // Filter by type (course category)
    if (newFilters.types.length > 0) {
      filtered = filtered.filter(cert => 
        newFilters.types.includes(cert.courseCategory)
      );
    }
    
    // Filter by year
    if (newFilters.years.length > 0) {
      filtered = filtered.filter(cert => {
        const certYear = new Date(cert.issueDate).getFullYear();
        return newFilters.years.includes(certYear);
      });
    }
    
    // Filter by status
    if (newFilters.statuses.length > 0) {
      filtered = filtered.filter(cert => 
        newFilters.statuses.includes(cert.status)
      );
    }
    
    setFilteredCertificates(filtered);
  }, [certificates]);
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : language === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Handle certificate actions
  const handleViewCertificate = (certificateId) => {
    window.open(`/verify/${certificateId}`, '_blank');
  };
  
  const handleDownload = async (certificateId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/certificates/${certificateId}/download`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to download certificate');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${certificateId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading certificate:', err);
      alert('Failed to download certificate');
    }
  };
  
  const handleShare = (certificateId) => {
    const shareUrl = `${window.location.origin}/verify/${certificateId}`;
    
    if (navigator.share) {
      navigator.share({
        title: t.title,
        url: shareUrl
      }).catch(err => console.error('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };
  
  if (loading) {
    return (
      <div className="certificates-gallery-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>{t.loading}</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="certificates-gallery-page">
        <div className="error-container">
          <p className="error-message">{t.error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="certificates-gallery-page">
      <h1 className="page-title">{t.title}</h1>
      
      <div className="gallery-container">
        {/* Filter Panel */}
        <aside className="filter-sidebar">
          <FilterPanel 
            onFilterChange={applyFilters}
            totalCount={filteredCertificates.length}
          />
        </aside>
        
        {/* Certificates Grid */}
        <main className="certificates-grid">
          {filteredCertificates.length === 0 ? (
            <div className="empty-state">
              <p className="empty-message">
                {certificates.length === 0 ? t.noCertificates : t.noResults}
              </p>
            </div>
          ) : (
            filteredCertificates.map(cert => (
              <div key={cert.certificateId} className="certificate-card">
                {/* Thumbnail */}
                <div className="certificate-thumbnail">
                  {cert.courseThumbnail ? (
                    <img 
                      src={cert.courseThumbnail} 
                      alt={cert.courseName}
                      loading="lazy"
                    />
                  ) : (
                    <div className="placeholder-thumbnail">
                      <span>🎓</span>
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <span className={`status-badge status-${cert.status}`}>
                    {t.status[cert.status] || cert.status}
                  </span>
                </div>
                
                {/* Certificate Info */}
                <div className="certificate-info">
                  <h3 className="certificate-title">{cert.courseName}</h3>
                  <p className="certificate-date">
                    {t.issuedOn} {formatDate(cert.issueDate)}
                  </p>
                  
                  {/* Actions */}
                  <div className="certificate-actions">
                    <button 
                      className="action-btn primary"
                      onClick={() => handleViewCertificate(cert.certificateId)}
                    >
                      {t.viewCertificate}
                    </button>
                    <button 
                      className="action-btn secondary"
                      onClick={() => handleDownload(cert.certificateId)}
                    >
                      {t.download}
                    </button>
                    <button 
                      className="action-btn secondary"
                      onClick={() => handleShare(cert.certificateId)}
                    >
                      {t.share}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </main>
      </div>
    </div>
  );
};

export default CertificatesGalleryPage;
