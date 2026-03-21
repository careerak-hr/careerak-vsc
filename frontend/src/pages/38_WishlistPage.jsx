import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import CourseCard from '../components/Courses/CourseCard';
import './WishlistPage.css';

const WishlistPage = () => {
  const { user, language } = useApp();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingNotes, setEditingNotes] = useState(null);
  const [notes, setNotes] = useState('');

  const translations = {
    ar: {
      title: 'قائمة المفضلة',
      empty: 'قائمة المفضلة فارغة',
      emptyDesc: 'لم تقم بإضافة أي دورات إلى قائمة المفضلة بعد',
      browseCourses: 'تصفح الدورات',
      remove: 'إزالة',
      addNotes: 'إضافة ملاحظات',
      editNotes: 'تعديل الملاحظات',
      saveNotes: 'حفظ',
      cancelNotes: 'إلغاء',
      notesPlaceholder: 'أضف ملاحظاتك الشخصية عن هذه الدورة...',
      addedOn: 'أضيفت في',
      viewCourse: 'عرض الدورة',
      loading: 'جاري التحميل...',
      error: 'حدث خطأ في تحميل قائمة المفضلة',
      removeSuccess: 'تمت إزالة الدورة من المفضلة',
      notesSuccess: 'تم حفظ الملاحظات'
    },
    en: {
      title: 'My Wishlist',
      empty: 'Your wishlist is empty',
      emptyDesc: 'You haven\'t added any courses to your wishlist yet',
      browseCourses: 'Browse Courses',
      remove: 'Remove',
      addNotes: 'Add Notes',
      editNotes: 'Edit Notes',
      saveNotes: 'Save',
      cancelNotes: 'Cancel',
      notesPlaceholder: 'Add your personal notes about this course...',
      addedOn: 'Added on',
      viewCourse: 'View Course',
      loading: 'Loading...',
      error: 'Error loading wishlist',
      removeSuccess: 'Course removed from wishlist',
      notesSuccess: 'Notes saved successfully'
    },
    fr: {
      title: 'Ma Liste de Souhaits',
      empty: 'Votre liste de souhaits est vide',
      emptyDesc: 'Vous n\'avez pas encore ajouté de cours à votre liste de souhaits',
      browseCourses: 'Parcourir les Cours',
      remove: 'Retirer',
      addNotes: 'Ajouter des Notes',
      editNotes: 'Modifier les Notes',
      saveNotes: 'Enregistrer',
      cancelNotes: 'Annuler',
      notesPlaceholder: 'Ajoutez vos notes personnelles sur ce cours...',
      addedOn: 'Ajouté le',
      viewCourse: 'Voir le Cours',
      loading: 'Chargement...',
      error: 'Erreur lors du chargement de la liste de souhaits',
      removeSuccess: 'Cours retiré de la liste de souhaits',
      notesSuccess: 'Notes enregistrées avec succès'
    }
  };

  const t = translations[language] || translations.ar;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchWishlist();
  }, [user]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWishlist(data);
      } else {
        throw new Error('Failed to fetch wishlist');
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError(t.error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/wishlist/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setWishlist(prev => ({
          ...prev,
          courses: prev.courses.filter(item => item.course._id !== courseId)
        }));
        showNotification(t.removeSuccess, 'success');
      }
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      showNotification(t.error, 'error');
    }
  };

  const handleEditNotes = (courseId, currentNotes) => {
    setEditingNotes(courseId);
    setNotes(currentNotes || '');
  };

  const handleSaveNotes = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/wishlist/${courseId}/notes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes })
      });

      if (response.ok) {
        setWishlist(prev => ({
          ...prev,
          courses: prev.courses.map(item =>
            item.course._id === courseId ? { ...item, notes } : item
          )
        }));
        setEditingNotes(null);
        setNotes('');
        showNotification(t.notesSuccess, 'success');
      }
    } catch (err) {
      console.error('Error saving notes:', err);
      showNotification(t.error, 'error');
    }
  };

  const handleCancelNotes = () => {
    setEditingNotes(null);
    setNotes('');
  };

  const showNotification = (message, type) => {
    const notification = document.createElement('div');
    notification.className = `wishlist-notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : language === 'fr' ? 'fr-FR' : 'en-US');
  };

  if (loading) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-loading">
          <div className="spinner"></div>
          <p>{t.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-error">
          <p>{error}</p>
          <button onClick={fetchWishlist} className="retry-button">
            {t.browseCourses}
          </button>
        </div>
      </div>
    );
  }

  if (!wishlist || wishlist.courses?.length === 0) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-empty">
          <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <h2>{t.empty}</h2>
          <p>{t.emptyDesc}</p>
          <button onClick={() => navigate('/courses')} className="browse-button">
            {t.browseCourses}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <h1>{t.title}</h1>
        <span className="wishlist-count">{wishlist.courses.length}</span>
      </div>

      <div className="wishlist-grid">
        {wishlist.courses.map(item => (
          <div key={item.course._id} className="wishlist-item">
            <CourseCard course={item.course} view="grid" />
            
            <div className="wishlist-item-footer">
              <div className="wishlist-item-meta">
                <span className="added-date">
                  {t.addedOn} {formatDate(item.addedAt)}
                </span>
              </div>

              <div className="wishlist-item-actions">
                <button
                  onClick={() => navigate(`/courses/${item.course._id}`)}
                  className="view-course-button"
                >
                  {t.viewCourse}
                </button>
                <button
                  onClick={() => handleRemove(item.course._id)}
                  className="remove-button"
                >
                  {t.remove}
                </button>
              </div>

              {editingNotes === item.course._id ? (
                <div className="notes-editor">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t.notesPlaceholder}
                    rows="3"
                  />
                  <div className="notes-actions">
                    <button onClick={() => handleSaveNotes(item.course._id)} className="save-notes-button">
                      {t.saveNotes}
                    </button>
                    <button onClick={handleCancelNotes} className="cancel-notes-button">
                      {t.cancelNotes}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="notes-display">
                  {item.notes ? (
                    <>
                      <p className="notes-text">{item.notes}</p>
                      <button
                        onClick={() => handleEditNotes(item.course._id, item.notes)}
                        className="edit-notes-button"
                      >
                        {t.editNotes}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleEditNotes(item.course._id, '')}
                      className="add-notes-button"
                    >
                      {t.addNotes}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
