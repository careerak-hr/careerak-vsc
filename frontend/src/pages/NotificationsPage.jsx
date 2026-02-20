/**
 * NotificationsPage Component
 * Task 4.4.4: Update notification list with stagger animation
 * 
 * Displays user notifications with stagger animation
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import NotificationList from '../components/NotificationList';
import PageTransition from '../components/PageTransition';
import InteractiveElement from '../components/InteractiveElement';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const { language, startBgMusic } = useApp();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read

  useEffect(() => {
    startBgMusic();
    fetchNotifications();
  }, [startBgMusic]);

  const fetchNotifications = async () => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock notification data
    const mockNotifications = [
      {
        id: 1,
        type: 'job_match',
        title: language === 'ar' ? 'وظيفة مناسبة لك' : language === 'fr' ? 'Emploi correspondant' : 'Job Match',
        message: language === 'ar' ? 'مطور React متقدم - شركة Tech Corp' : language === 'fr' ? 'Développeur React Senior - Tech Corp' : 'Senior React Developer - Tech Corp',
        priority: 'high',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        metadata: {
          actionText: language === 'ar' ? 'عرض الوظيفة' : language === 'fr' ? 'Voir l\'emploi' : 'View Job',
          actionUrl: '/job-postings/1'
        }
      },
      {
        id: 2,
        type: 'application_accepted',
        title: language === 'ar' ? 'تم قبول طلبك' : language === 'fr' ? 'Candidature acceptée' : 'Application Accepted',
        message: language === 'ar' ? 'تهانينا! تم قبول طلبك لوظيفة مهندس Backend' : language === 'fr' ? 'Félicitations! Votre candidature pour Ingénieur Backend a été acceptée' : 'Congratulations! Your application for Backend Engineer has been accepted',
        priority: 'urgent',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        metadata: {
          actionText: language === 'ar' ? 'عرض التفاصيل' : language === 'fr' ? 'Voir les détails' : 'View Details',
          actionUrl: '/applications/2'
        }
      },
      {
        id: 3,
        type: 'new_message',
        title: language === 'ar' ? 'رسالة جديدة' : language === 'fr' ? 'Nouveau message' : 'New Message',
        message: language === 'ar' ? 'أحمد محمد: مرحباً، لدي سؤال حول...' : language === 'fr' ? 'Ahmed Mohamed: Bonjour, j\'ai une question sur...' : 'Ahmed Mohamed: Hello, I have a question about...',
        priority: 'medium',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        metadata: {
          actionText: language === 'ar' ? 'الرد' : language === 'fr' ? 'Répondre' : 'Reply',
          actionUrl: '/messages/3'
        }
      },
      {
        id: 4,
        type: 'course_match',
        title: language === 'ar' ? 'دورة مناسبة لك' : language === 'fr' ? 'Cours correspondant' : 'Course Match',
        message: language === 'ar' ? 'أنماط React المتقدمة - مدرب: جون دو' : language === 'fr' ? 'Modèles React Avancés - Instructeur: John Doe' : 'Advanced React Patterns - Instructor: John Doe',
        priority: 'medium',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
        metadata: {
          actionText: language === 'ar' ? 'عرض الدورة' : language === 'fr' ? 'Voir le cours' : 'View Course',
          actionUrl: '/courses/4'
        }
      },
      {
        id: 5,
        type: 'application_reviewed',
        title: language === 'ar' ? 'تمت مراجعة طلبك' : language === 'fr' ? 'Candidature examinée' : 'Application Reviewed',
        message: language === 'ar' ? 'طلبك لوظيفة مطور Full Stack قيد المراجعة' : language === 'fr' ? 'Votre candidature pour Développeur Full Stack est en cours d\'examen' : 'Your application for Full Stack Developer is under review',
        priority: 'medium',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        metadata: {
          actionText: language === 'ar' ? 'عرض الحالة' : language === 'fr' ? 'Voir le statut' : 'View Status',
          actionUrl: '/applications/5'
        }
      },
      {
        id: 6,
        type: 'system',
        title: language === 'ar' ? 'تحديث النظام' : language === 'fr' ? 'Mise à jour système' : 'System Update',
        message: language === 'ar' ? 'إصدار جديد متاح. يرجى التحديث للحصول على أحدث الميزات.' : language === 'fr' ? 'Nouvelle version disponible. Veuillez mettre à jour pour obtenir les dernières fonctionnalités.' : 'New version available. Please update to get the latest features.',
        priority: 'low',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        metadata: {
          actionText: language === 'ar' ? 'التحديث' : language === 'fr' ? 'Mettre à jour' : 'Update',
          actionUrl: '/settings'
        }
      }
    ];
    
    setNotifications(mockNotifications);
    setLoading(false);
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    setNotifications(prev =>
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );

    // Navigate to action URL if available
    if (notification.metadata?.actionUrl) {
      navigate(notification.metadata.actionUrl);
    }
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getFilteredNotifications = () => {
    if (filter === 'unread') return notifications.filter(n => !n.read);
    if (filter === 'read') return notifications.filter(n => n.read);
    return notifications;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getTitle = () => {
    if (language === 'ar') return 'الإشعارات';
    if (language === 'fr') return 'Notifications';
    return 'Notifications';
  };

  const getFilterLabel = (filterType) => {
    const labels = {
      ar: { all: 'الكل', unread: 'غير مقروء', read: 'مقروء' },
      en: { all: 'All', unread: 'Unread', read: 'Read' },
      fr: { all: 'Tout', unread: 'Non lu', read: 'Lu' }
    };
    return labels[language]?.[filterType] || labels.en[filterType];
  };

  const getMarkAllReadLabel = () => {
    if (language === 'ar') return 'تحديد الكل كمقروء';
    if (language === 'fr') return 'Tout marquer comme lu';
    return 'Mark all as read';
  };

  if (loading) {
    return (
      <PageTransition variant="fadeIn">
        <div role="main" className="notifications-page">
          <div className="notifications-container">
            <h1 className="notifications-title">{getTitle()}</h1>
            <p className="notifications-loading">
              {language === 'ar' ? 'جاري التحميل...' : 
               language === 'fr' ? 'Chargement...' : 
               'Loading...'}
            </p>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition variant="fadeIn">
      <div role="main" className="notifications-page">
        <div className="notifications-container">
          {/* Header */}
          <div className="notifications-header">
            <div>
              <h1 className="notifications-title">{getTitle()}</h1>
              {unreadCount > 0 && (
                <p className="notifications-unread-count">
                  {unreadCount} {language === 'ar' ? 'غير مقروء' : 
                                 language === 'fr' ? 'non lu' : 
                                 'unread'}
                </p>
              )}
            </div>
            {unreadCount > 0 && (
              <InteractiveElement
                as="button"
                variant="primary"
                onClick={handleMarkAllRead}
                className="notifications-mark-all-btn"
                aria-label={getMarkAllReadLabel()}
              >
                {getMarkAllReadLabel()}
              </InteractiveElement>
            )}
          </div>

          {/* Filters */}
          <div className="notifications-filters" role="tablist">
            {['all', 'unread', 'read'].map((filterType) => (
              <InteractiveElement
                as="button"
                variant="subtle"
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`notifications-filter-btn ${filter === filterType ? 'active' : ''}`}
                role="tab"
                aria-selected={filter === filterType}
                aria-label={getFilterLabel(filterType)}
              >
                {getFilterLabel(filterType)}
                {filterType === 'unread' && unreadCount > 0 && (
                  <span className="filter-badge">{unreadCount}</span>
                )}
              </InteractiveElement>
            ))}
          </div>

          {/* Notification List with Stagger Animation */}
          <NotificationList
            notifications={getFilteredNotifications()}
            onNotificationClick={handleNotificationClick}
            language={language}
          />
        </div>
      </div>
    </PageTransition>
  );
};

export default NotificationsPage;
