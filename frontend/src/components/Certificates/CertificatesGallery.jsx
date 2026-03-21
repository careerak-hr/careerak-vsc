import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useApp } from '../../context/AppContext';
import './CertificatesGallery.css';

const CertificatesGallery = ({ userId, isOwnProfile = false }) => {
  const { language, fontFamily } = useApp();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, revoked
  const [sortBy, setSortBy] = useState('date'); // date, name, custom
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [customOrder, setCustomOrder] = useState([]); // للترتيب المخصص

  const translations = {
    ar: {
      title: 'شهاداتي',
      noCertificates: 'لا توجد شهادات بعد',
      loading: 'جاري التحميل...',
      error: 'حدث خطأ أثناء تحميل الشهادات',
      filterAll: 'الكل',
      filterActive: 'نشطة',
      filterRevoked: 'ملغاة',
      sortByDate: 'التاريخ',
      sortByName: 'الاسم',
      sortByCustom: 'ترتيب مخصص',
      viewGrid: 'شبكة',
      viewList: 'قائمة',
      download: 'تحميل',
      share: 'مشاركة',
      verify: 'التحقق',
      hide: 'إخفاء',
      show: 'إظهار',
      issuedOn: 'تاريخ الإصدار',
      status: 'الحالة',
      active: 'نشطة',
      revoked: 'ملغاة',
      hidden: 'مخفية'
    },
    en: {
      title: 'My Certificates',
      noCertificates: 'No certificates yet',
      loading: 'Loading...',
      error: 'Error loading certificates',
      filterAll: 'All',
      filterActive: 'Active',
      filterRevoked: 'Revoked',
      sortByDate: 'Date',
      sortByName: 'Name',
      sortByCustom: 'Custom Order',
      viewGrid: 'Grid',
      viewList: 'List',
      download: 'Download',
      share: 'Share',
      verify: 'Verify',
      hide: 'Hide',
      show: 'Show',
      issuedOn: 'Issued on',
      status: 'Status',
      active: 'Active',
      revoked: 'Revoked',
      hidden: 'Hidden'
    },
    fr: {
      title: 'Mes Certificats',
      noCertificates: 'Aucun certificat pour le moment',
      loading: 'Chargement...',
      error: 'Erreur lors du chargement des certificats',
      filterAll: 'Tous',
      filterActive: 'Actifs',
      filterRevoked: 'Révoqués',
      sortByDate: 'Date',
      sortByName: 'Nom',
      sortByCustom: 'Ordre Personnalisé',
      viewGrid: 'Grille',
      viewList: 'Liste',
      download: 'Télécharger',
      share: 'Partager',
      verify: 'Vérifier',
      hide: 'Masquer',
      show: 'Afficher',
      issuedOn: 'Délivré le',
      status: 'Statut',
      active: 'Actif',
      revoked: 'Révoqué',
      hidden: 'Masqué'
    }
  };

  const t = translations[language] || translations.ar;

  const fontStyle = {
    fontFamily: fontFamily,
    fontWeight: 'inherit',
    fontStyle: 'inherit'
  };

  useEffect(() => {
    fetchCertificates();
  }, [userId]);

  useEffect(() => {
    // تحميل الترتيب المخصص من localStorage
    const savedOrder = localStorage.getItem(`certificates_order_${userId}`);
    if (savedOrder) {
      try {
        setCustomOrder(JSON.parse(savedOrder));
      } catch (err) {
        console.error('Error loading custom order:', err);
      }
    }
  }, [userId]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/certificates?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch certificates');
      }

      const data = await response.json();
      setCertificates(data.certificates || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = async (certificateId, currentVisibility) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/certificates/${certificateId}/visibility`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isHidden: !currentVisibility })
      });

      if (!response.ok) {
        throw new Error('Failed to update visibility');
      }

      // Update local state
      setCertificates(prev => prev.map(cert => 
        cert._id === certificateId 
          ? { ...cert, isHidden: !currentVisibility }
          : cert
      ));
    } catch (err) {
      console.error('Error toggling visibility:', err);
    }
  };

  const downloadCertificate = (pdfUrl) => {
    window.open(pdfUrl, '_blank');
  };

  const verifyCertificate = (certificateId) => {
    window.open(`/verify/${certificateId}`, '_blank');
  };

  const generateThumbnail = (certificate) => {
    // إذا كان هناك thumbnail URL، استخدمه
    if (certificate.thumbnailUrl) {
      return certificate.thumbnailUrl;
    }
    
    // إذا كان هناك PDF URL، حاول استخدام خدمة thumbnail
    if (certificate.pdfUrl) {
      // يمكن استخدام خدمة مثل Cloudinary أو خدمة مخصصة
      return certificate.pdfUrl.replace('.pdf', '-thumbnail.jpg');
    }
    
    // استخدم placeholder SVG
    return '/certificate-placeholder.svg';
  };

  const getFilteredCertificates = () => {
    let filtered = certificates;

    // Apply filter
    if (filter === 'active') {
      filtered = filtered.filter(cert => cert.status === 'active');
    } else if (filter === 'revoked') {
      filtered = filtered.filter(cert => cert.status === 'revoked');
    }

    // Apply sort
    if (sortBy === 'date') {
      filtered = [...filtered].sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));
    } else if (sortBy === 'name') {
      filtered = [...filtered].sort((a, b) => a.courseName.localeCompare(b.courseName));
    } else if (sortBy === 'custom' && customOrder.length > 0) {
      // ترتيب مخصص بناءً على customOrder
      filtered = [...filtered].sort((a, b) => {
        const indexA = customOrder.indexOf(a._id);
        const indexB = customOrder.indexOf(b._id);
        
        // إذا لم يكن في الترتيب المخصص، ضعه في النهاية
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        
        return indexA - indexB;
      });
    }

    return filtered;
  };

  const handleDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(getFilteredCertificates());
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // حفظ الترتيب الجديد
    const newOrder = items.map(item => item._id);
    setCustomOrder(newOrder);
    
    // حفظ في localStorage
    localStorage.setItem(`certificates_order_${userId}`, JSON.stringify(newOrder));
    
    // تغيير وضع الترتيب إلى custom تلقائياً
    if (sortBy !== 'custom') {
      setSortBy('custom');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : language === 'fr' ? 'fr-FR' : 'en-US');
  };

  if (loading) {
    return (
      <div className="certificates-gallery" style={fontStyle}>
        <div className="loading-state">{t.loading}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="certificates-gallery" style={fontStyle}>
        <div className="error-state">{t.error}</div>
      </div>
    );
  }

  const filteredCertificates = getFilteredCertificates();

  return (
    <div className="certificates-gallery" style={fontStyle}>
      <div className="gallery-header">
        <h2 className="gallery-title">{t.title}</h2>
        
        <div className="gallery-controls">
          {/* Filter */}
          <div className="control-group">
            <button
              className={`control-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              {t.filterAll}
            </button>
            <button
              className={`control-btn ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              {t.filterActive}
            </button>
            <button
              className={`control-btn ${filter === 'revoked' ? 'active' : ''}`}
              onClick={() => setFilter('revoked')}
            >
              {t.filterRevoked}
            </button>
          </div>

          {/* Sort */}
          <div className="control-group">
            <button
              className={`control-btn ${sortBy === 'date' ? 'active' : ''}`}
              onClick={() => setSortBy('date')}
            >
              {t.sortByDate}
            </button>
            <button
              className={`control-btn ${sortBy === 'name' ? 'active' : ''}`}
              onClick={() => setSortBy('name')}
            >
              {t.sortByName}
            </button>
            {isOwnProfile && (
              <button
                className={`control-btn ${sortBy === 'custom' ? 'active' : ''}`}
                onClick={() => setSortBy('custom')}
                title="Drag & Drop to reorder"
              >
                {t.sortByCustom}
              </button>
            )}
          </div>

          {/* View Mode */}
          <div className="control-group">
            <button
              className={`control-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              {t.viewGrid}
            </button>
            <button
              className={`control-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              {t.viewList}
            </button>
          </div>
        </div>
      </div>

      {filteredCertificates.length === 0 ? (
        <div className="empty-state">
          <p>{t.noCertificates}</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="certificates" direction={viewMode === 'grid' ? 'horizontal' : 'vertical'}>
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`certificates-container ${viewMode} ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
              >
                {filteredCertificates.map((certificate, index) => (
                  <Draggable
                    key={certificate._id}
                    draggableId={certificate._id}
                    index={index}
                    isDragDisabled={!isOwnProfile || sortBy !== 'custom'}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`certificate-card ${certificate.status} ${certificate.isHidden ? 'hidden' : ''} ${snapshot.isDragging ? 'dragging' : ''}`}
                        style={{
                          ...provided.draggableProps.style,
                          cursor: isOwnProfile && sortBy === 'custom' ? 'grab' : 'default'
                        }}
                      >
                        {isOwnProfile && sortBy === 'custom' && (
                          <div className="drag-handle">
                            <i className="fas fa-grip-vertical"></i>
                          </div>
                        )}
                        
                        <div className="certificate-thumbnail">
                          <img
                            src={generateThumbnail(certificate)}
                            alt={certificate.courseName}
                            loading="lazy"
                            onError={(e) => {
                              e.target.src = '/certificate-placeholder.svg';
                            }}
                          />
                          {certificate.isHidden && (
                            <div className="hidden-badge">{t.hidden}</div>
                          )}
                          {certificate.status === 'revoked' && (
                            <div className="revoked-badge">{t.revoked}</div>
                          )}
                        </div>

                        <div className="certificate-info">
                          <h3 className="certificate-course">{certificate.courseName}</h3>
                          <p className="certificate-date">
                            {t.issuedOn}: {formatDate(certificate.issueDate)}
                          </p>
                          <p className="certificate-status">
                            {t.status}: {certificate.status === 'active' ? t.active : t.revoked}
                          </p>
                        </div>

                        <div className="certificate-actions">
                          <button
                            className="action-btn download"
                            onClick={() => downloadCertificate(certificate.pdfUrl)}
                            title={t.download}
                          >
                            <i className="fas fa-download"></i>
                          </button>
                          
                          <button
                            className="action-btn verify"
                            onClick={() => verifyCertificate(certificate.certificateId)}
                            title={t.verify}
                          >
                            <i className="fas fa-check-circle"></i>
                          </button>

                          {isOwnProfile && (
                            <button
                              className="action-btn visibility"
                              onClick={() => toggleVisibility(certificate._id, certificate.isHidden)}
                              title={certificate.isHidden ? t.show : t.hide}
                            >
                              <i className={`fas ${certificate.isHidden ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
};

export default CertificatesGallery;
