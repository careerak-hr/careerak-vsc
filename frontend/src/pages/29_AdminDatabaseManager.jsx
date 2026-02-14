import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import './29_AdminDatabaseManager.css';

const AdminDatabaseManager = () => {
  const { language, startBgMusic } = useApp();
  const navigate = useNavigate();
  const [collections, setCollections] = useState([
    { name: 'users', count: 0, icon: '👥' },
    { name: 'jobPostings', count: 0, icon: '💼' },
    { name: 'jobApplications', count: 0, icon: '📄' },
    { name: 'educationalCourses', count: 0, icon: '🎓' },
    { name: 'trainingCourses', count: 0, icon: '📚' },
  ]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  // تشغيل الموسيقى عند فتح الصفحة
  useEffect(() => {
    if (startBgMusic) startBgMusic();
    loadCollectionsCounts();
  }, []);

  const loadCollectionsCounts = async () => {
    try {
      const response = await api.get('/admin/database/stats');
      if (response.data) {
        setCollections(prev => prev.map(col => ({
          ...col,
          count: response.data[col.name] || 0
        })));
      }
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  };

  const loadCollectionData = async (collectionName) => {
    setLoading(true);
    setSelectedCollection(collectionName);
    try {
      const response = await api.get(`/admin/database/${collectionName}`);
      setDocuments(response.data || []);
    } catch (error) {
      console.error('Error loading collection data:', error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (collectionName, docId) => {
    if (window.confirm(language === 'ar' ? 'هل تريد حذف هذا السجل؟' : 'Delete this record?')) {
      try {
        await api.delete(`/admin/database/${collectionName}/${docId}`);
        loadCollectionData(collectionName);
        loadCollectionsCounts();
        alert(language === 'ar' ? 'تم الحذف بنجاح' : 'Deleted successfully');
      } catch (error) {
        console.error('Error deleting document:', error);
        alert(language === 'ar' ? 'فشل الحذف' : 'Delete failed');
      }
    }
  };

  const exportCollection = async (collectionName) => {
    try {
      const response = await api.get(`/admin/database/${collectionName}/export`);
      const dataStr = JSON.stringify(response.data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${collectionName}-${new Date().toISOString()}.json`;
      a.click();
    } catch (error) {
      console.error('Error exporting collection:', error);
      alert(language === 'ar' ? 'فشل التصدير' : 'Export failed');
    }
  };

  return (
    <div className="admin-database-manager">
      <div className="adb-header">
        <button onClick={() => navigate('/admin-dashboard')} className="adb-back-btn">
          ← {language === 'ar' ? 'العودة' : 'Back'}
        </button>
        <h1 className="adb-title">
          {language === 'ar' ? '🗄️ إدارة قاعدة البيانات' : '🗄️ Database Manager'}
        </h1>
      </div>

      <div className="adb-content">
        {/* Collections List */}
        <div className="adb-collections-panel">
          <h2 className="adb-panel-title">
            {language === 'ar' ? 'المجموعات' : 'Collections'}
          </h2>
          <div className="adb-collections-list">
            {collections.map(col => (
              <button
                key={col.name}
                onClick={() => loadCollectionData(col.name)}
                className={`adb-collection-btn ${selectedCollection === col.name ? 'active' : ''}`}
              >
                <span className="adb-collection-icon">{col.icon}</span>
                <div className="adb-collection-info">
                  <div className="adb-collection-name">{col.name}</div>
                  <div className="adb-collection-count">{col.count} {language === 'ar' ? 'سجل' : 'records'}</div>
                </div>
              </button>
            ))}
          </div>
          <button onClick={loadCollectionsCounts} className="adb-refresh-btn">
            🔄 {language === 'ar' ? 'تحديث' : 'Refresh'}
          </button>
        </div>

        {/* Documents View */}
        <div className="adb-documents-panel">
          {!selectedCollection ? (
            <div className="adb-empty-state">
              <p>{language === 'ar' ? 'اختر مجموعة لعرض البيانات' : 'Select a collection to view data'}</p>
            </div>
          ) : loading ? (
            <div className="adb-loading">
              <div className="adb-spinner"></div>
              <p>{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
            </div>
          ) : (
            <>
              <div className="adb-documents-header">
                <h2 className="adb-panel-title">{selectedCollection}</h2>
                <button onClick={() => exportCollection(selectedCollection)} className="adb-export-btn">
                  💾 {language === 'ar' ? 'تصدير' : 'Export'}
                </button>
              </div>
              <div className="adb-documents-list">
                {documents.length === 0 ? (
                  <p className="adb-no-data">{language === 'ar' ? 'لا توجد بيانات' : 'No data'}</p>
                ) : (
                  documents.map((doc, index) => (
                    <div key={doc._id || index} className="adb-document-card">
                      <div className="adb-document-content">
                        <pre className="adb-document-json">
                          {JSON.stringify(doc, null, 2)}
                        </pre>
                      </div>
                      <div className="adb-document-actions">
                        <button
                          onClick={() => deleteDocument(selectedCollection, doc._id)}
                          className="adb-delete-btn"
                        >
                          🗑️ {language === 'ar' ? 'حذف' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Warning */}
      <div className="adb-warning">
        ⚠️ {language === 'ar' ? 'تحذير: التعديل المباشر على قاعدة البيانات قد يؤدي لمشاكل. استخدم بحذر!' : 
            'Warning: Direct database modifications may cause issues. Use with caution!'}
      </div>
    </div>
  );
};

export default AdminDatabaseManager;
