import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import pusherClient from '../../utils/pusherClient';

/**
 * NotificationBadge Component
 * 
 * Displays unread notification count badge with real-time updates via Pusher.
 * Requirements: 6.8, 6.9
 */
const NotificationBadge = ({ onClick, adminId }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUnreadCount();
    setupPusherListener();

    return () => {
      cleanupPusherListener();
    };
  }, [adminId]);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/admin/notifications/unread-count', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupPusherListener = () => {
    if (!adminId) return;

    const channel = pusherClient.subscribe(`private-admin-${adminId}`);
    
    channel.bind('new-notification', (data) => {
      setUnreadCount(prev => prev + 1);
    });

    channel.bind('notification-read', (data) => {
      setUnreadCount(prev => Math.max(0, prev - 1));
    });

    channel.bind('all-notifications-read', () => {
      setUnreadCount(0);
    });
  };

  const cleanupPusherListener = () => {
    if (adminId) {
      pusherClient.unsubscribe(`private-admin-${adminId}`);
    }
  };

  const handleClick = (e) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      disabled={isLoading}
    >
      <Bell className="w-6 h-6" />
      
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full min-w-[20px]">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBadge;
