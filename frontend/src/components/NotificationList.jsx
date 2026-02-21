/**
 * NotificationList Component
 * Task 4.4.4: Update notification list with stagger animation
 * 
 * Displays a list of notifications with stagger animation (50ms delay between items)
 * Respects prefers-reduced-motion setting
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useAnimation } from '../context/AnimationContext';
import { listVariants } from '../utils/animationVariants';
import './NotificationList.css';

const NotificationList = ({ notifications = [], onNotificationClick, language = 'en' }) => {
  const { shouldAnimate } = useAnimation();

  // Get animation variants based on shouldAnimate
  const containerVariants = shouldAnimate ? listVariants.container : { initial: {}, animate: {} };
  const itemVariants = shouldAnimate ? listVariants.item : { initial: {}, animate: {} };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    const icons = {
      job_match: '🎯',
      application_accepted: '✅',
      application_rejected: '❌',
      application_reviewed: '📋',
      new_application: '📬',
      job_closed: '🔒',
      course_match: '📚',
      new_message: '💬',
      system: '🔔',
    };
    return icons[type] || '🔔';
  };

  // Get notification priority color
  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      high: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
      medium: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      low: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700',
    };
    return colors[priority] || colors.medium;
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return language === 'ar' ? 'الآن' : language === 'fr' ? 'Maintenant' : 'Now';
    if (diffMins < 60) return language === 'ar' ? `منذ ${diffMins} دقيقة` : language === 'fr' ? `Il y a ${diffMins} min` : `${diffMins}m ago`;
    if (diffHours < 24) return language === 'ar' ? `منذ ${diffHours} ساعة` : language === 'fr' ? `Il y a ${diffHours}h` : `${diffHours}h ago`;
    if (diffDays < 7) return language === 'ar' ? `منذ ${diffDays} يوم` : language === 'fr' ? `Il y a ${diffDays}j` : `${diffDays}d ago`;
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US');
  };

  if (!notifications || notifications.length === 0) {
    return (
      <div className="notification-list-empty" role="status">
        <div className="empty-icon">🔔</div>
        <p className="empty-text">
          {language === 'ar' ? 'لا توجد إشعارات' : 
           language === 'fr' ? 'Aucune notification' : 
           'No notifications'}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="notification-list"
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      role="list"
      aria-label={language === 'ar' ? 'قائمة الإشعارات' : 
                  language === 'fr' ? 'Liste des notifications' : 
                  'Notification list'}
    >
      {notifications.map((notification) => (
        <motion.button
          key={notification.id}
          className={`notification-item ${getPriorityColor(notification.priority)} ${
            !notification.read ? 'notification-unread' : ''
          }`}
          variants={itemVariants}
          onClick={() => onNotificationClick && onNotificationClick(notification)}
          role="listitem"
          aria-label={`${notification.title}: ${notification.message}`}
        >
          {/* Unread indicator */}
          {!notification.read && (
            <div 
              className="notification-unread-indicator"
              aria-label={language === 'ar' ? 'غير مقروء' : 
                          language === 'fr' ? 'Non lu' : 
                          'Unread'}
            />
          )}

          {/* Icon */}
          <div className="notification-icon" aria-hidden="true">
            {getNotificationIcon(notification.type)}
          </div>

          {/* Content */}
          <div className="notification-content">
            <div className="notification-header">
              <h3 className="notification-title">
                {notification.title}
              </h3>
              <span className="notification-time">
                {formatTimestamp(notification.createdAt)}
              </span>
            </div>
            <p className="notification-message">
              {notification.message}
            </p>
            {notification.metadata?.actionText && (
              <button 
                className="notification-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle action
                }}
                aria-label={notification.metadata.actionText}
              >
                {notification.metadata.actionText}
              </button>
            )}
          </div>
        </motion.button>
      ))}
    </motion.div>
  );
};

export default NotificationList;
