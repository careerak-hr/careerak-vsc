import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import ContentReviewModal from '../../components/admin/ContentReviewModal';
import './ContentManagementPage.css';

const ContentManagementPage = () => {
  const { language, fontFamily } = useApp();
  const [activeTab, setActiveTab] = useState('pending-jobs');
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const fontStyle = {
    fontFamily: fontFamily,
    fontWeight: 'inherit',
    fontStyle: 'inherit'
  };

  const translations = {
    ar: {
      title: 'إدارة المحتوى',
      pendingJobs: 'الوظائف المعلقة',
      pendingCourses: 'الدورات المعلقة',
      flaggedContent: 'المحتوى المُبلغ عنه',
      noContent: 'لا يوجد محتوى',
      loading: 'جاري التحميل...',
      error: 'حدث خطأ أثناء تحميل المحتوى',
      approve: 'موافقة',
      reject: 'رفض',
      delete: 'حذف',
      review: 'مراجعة',
      company: 'الشركة',
      field: 'المجال',
      postedBy: 'نشر بواسطة',
      createdAt: 'تاريخ الإنشاء',
      flaggedBy: 'أبلغ عنه',
      flagReason: 'سبب الإبلاغ',
      rating: 'التقييم',
      loadMore: 'تحميل المزيد',
      page: 'صفحة'
    },
    en: {
      title: 'Content Management',
      pendingJobs: 'Pending Jobs',
      pendingCourses: 'Pending Courses',
      flaggedContent: 'Flagged Content',
      noContent: 'No content found',
      loading: 'Loading...',
      error: 'Error loading content',
      approve: 'Approve',
      reject: 'Reject',
      delete: 'Delete',
      review: 'Review',
      company: 'Company',
      field: 'Field',
      postedBy: 'Posted By',
      createdAt: 'Created At',
      flaggedBy: 'Flagged By',
      flagReason: 'Flag Reason',
      rating: 'Rating',
      loadMore: 'Load More',
      page: 'Page'
    },
    fr: {
      title: 'Gestion du Contenu',
      pendingJobs: 'Emplois en Attente',
      pendingCourses: 'Cours en Attente',
      flaggedContent: 'Contenu Signalé',
      noContent: 'Aucun contenu trouvé',
      loading: 'Chargement...',
      error: 'Erreur lors du chargement du contenu',
      approve: 'Approuver',
      reject: 'Rejeter',
      delete: 'Supprimer',
      review: 'Examiner',
      company: 'Entreprise',
      field: 'Domaine',
      postedBy: 'Publié Par',
      createdAt: 'Date de Création',
      flaggedBy: 'Signalé Par',
      flagReason: 'Raison du Signalement',
      rating: 'Évaluation',
      loadMore: 'Charger Plus',
      page: 'Page'
    }
  };

  const t = translations[language] || translations.en;

  useEffect(() => {
    fetchContent();
  }, [activeTab, pagination.page]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let endpoint = '';
      
      switch (activeTab) {
        case 'pending-jobs':
          endpoint = '/api/admin/content/pending-jobs';
          break;
        case 'pending-courses':
          endpoint = '/api/admin/content/pending-courses';
          break;
        case 'flagged-content':
          endpoint = '/api/admin/content/flagged';
          break;
        default:
          endpoint = '/api/admin/content/pending-jobs';
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || ''}${endpoint}?page=${pagination.page}&limit=${pagination.limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }

      const result = await response.json();
      setContent(result.data || []);
      setPagination(prev => ({
        ...prev,
        total: result.pagination?.total || 0,
        totalPages: result.pagination?.totalPages || 0
      }));
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (item) => {
    setSelectedContent(item);
    setShowReviewModal(true);
  };

  const handleCloseModal = () => {
    setShowReviewModal(false);
    setSelectedContent(null);
  };

  const handleActionComplete = () => {
    fetchContent();
    handleCloseModal();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const renderContentCard = (item) => {
    const contentType = activeTab === 'pending-jobs' ? 'job' : 
                       activeTab === 'pending-courses' ? 'course' : 'review';

    return (
      <div key={item._id} className="content-card" style={fontStyle}>
        <div className="content-card-header">
          <h3>{item.title || item.jobTitle || 'Untitled'}</h3>
          {item.status && (
            <span className={`status-badge status-${item.status}`}>
              {item.status}
            </span>
          )}
        </div>

        <div className="content-card-body">
          {contentType === 'job' && (
            <>
              <p><strong>{t.company}:</strong> {item.company?.name || 'N/A'}</p>
              <p><strong>{t.field}:</strong> {item.field || 'N/A'}</p>
            </>
          )}
          
          {contentType === 'course' && (
            <>
              <p><strong>{t.postedBy}:</strong> {item.postedBy?.name || 'N/A'}</p>
              <p><strong>{t.field}:</strong> {item.field || 'N/A'}</p>
            </>
          )}
          
          {contentType === 'review' && (
            <>
              <p><strong>{t.rating}:</strong> {'⭐'.repeat(item.overallRating || 0)}</p>
              <p><strong>{t.flaggedBy}:</strong> {item.flaggedBy?.length || 0} users</p>
              {item.flagReason && (
                <p><strong>{t.flagReason}:</strong> {item.flagReason}</p>
              )}
            </>
          )}

          <p className="content-preview">
            {item.description?.substring(0, 150) || item.comment?.substring(0, 150) || ''}
            {(item.description?.length > 150 || item.comment?.length > 150) && '...'}
          </p>

          <p className="content-date">
            <strong>{t.createdAt}:</strong> {new Date(item.createdAt).toLocaleDateString(language)}
          </p>
        </div>

        <div className="content-card-actions">
          <button
            className="btn btn-primary"
            onClick={() => handleReview(item)}
            style={fontStyle}
          >
            {t.review}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="content-management-page" style={fontStyle}>
      <div className="page-header">
        <h1>{t.title}</h1>
      </div>

      <div className="tabs-container">
        <button
          className={`tab ${activeTab === 'pending-jobs' ? 'active' : ''}`}
          onClick={() => handleTabChange('pending-jobs')}
          style={fontStyle}
        >
          {t.pendingJobs}
        </button>
        <button
          className={`tab ${activeTab === 'pending-courses' ? 'active' : ''}`}
          onClick={() => handleTabChange('pending-courses')}
          style={fontStyle}
        >
          {t.pendingCourses}
        </button>
        <button
          className={`tab ${activeTab === 'flagged-content' ? 'active' : ''}`}
          onClick={() => handleTabChange('flagged-content')}
          style={fontStyle}
        >
          {t.flaggedContent}
        </button>
      </div>

      <div className="content-container">
        {loading ? (
          <div className="loading-state" style={fontStyle}>{t.loading}</div>
        ) : content.length === 0 ? (
          <div className="empty-state" style={fontStyle}>{t.noContent}</div>
        ) : (
          <>
            <div className="content-grid">
              {content.map(item => renderContentCard(item))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-secondary"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  style={fontStyle}
                >
                  ←
                </button>
                <span style={fontStyle}>
                  {t.page} {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  className="btn btn-secondary"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  style={fontStyle}
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showReviewModal && selectedContent && (
        <ContentReviewModal
          content={selectedContent}
          contentType={activeTab === 'pending-jobs' ? 'job' : 
                      activeTab === 'pending-courses' ? 'course' : 'review'}
          onClose={handleCloseModal}
          onActionComplete={handleActionComplete}
        />
      )}
    </div>
  );
};

export default ContentManagementPage;
