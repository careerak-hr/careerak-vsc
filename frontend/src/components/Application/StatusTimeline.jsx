/**
 * StatusTimeline Component
 * 
 * Displays a visual timeline of application status progression
 * 
 * Features:
 * - Display status stages in chronological order
 * - Highlight current status
 * - Show timestamps for completed stages
 * - Handle different status types (accepted, rejected, withdrawn)
 * - Responsive layout for mobile, tablet, and desktop
 * - RTL support for Arabic
 * - Real-time updates via Pusher
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.5, 5.6, 5.7
 */

import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import pusherClient from '../../utils/pusherClient';
import './StatusTimeline.css';

const StatusTimeline = ({ 
  applicationId,
  currentStatus, 
  statusHistory = [], 
  className = '',
  onStatusUpdate
}) => {
  const { language } = useApp();
  const [localStatus, setLocalStatus] = useState(currentStatus);
  const [localHistory, setLocalHistory] = useState(statusHistory);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Update local state when props change
  useEffect(() => {
    setLocalStatus(currentStatus);
    setLocalHistory(statusHistory);
  }, [currentStatus, statusHistory]);

  // Handle status update from Pusher
  const handleStatusUpdate = useCallback((data) => {
    console.log('Status update received:', data);
    
    // Update local status
    setLocalStatus(data.status);
    
    // Add to history if not already present
    const newHistoryEntry = {
      status: data.status,
      timestamp: data.timestamp || new Date().toISOString(),
      note: data.note
    };
    
    setLocalHistory(prev => {
      // Check if this status already exists in history
      const exists = prev.some(entry => entry.status === data.status);
      if (exists) {
        return prev;
      }
      return [...prev, newHistoryEntry];
    });
    
    // Show notification
    const statusLabels = {
      'Submitted': { ar: 'تم التقديم', en: 'Submitted', fr: 'Soumis' },
      'Reviewed': { ar: 'تمت المراجعة', en: 'Reviewed', fr: 'Examiné' },
      'Shortlisted': { ar: 'القائمة المختصرة', en: 'Shortlisted', fr: 'Présélectionné' },
      'Interview Scheduled': { ar: 'تم جدولة المقابلة', en: 'Interview Scheduled', fr: 'Entretien Programmé' },
      'Accepted': { ar: 'مقبول', en: 'Accepted', fr: 'Accepté' },
      'Rejected': { ar: 'مرفوض', en: 'Rejected', fr: 'Rejeté' },
      'Withdrawn': { ar: 'تم السحب', en: 'Withdrawn', fr: 'Retiré' }
    };
    
    const statusLabel = statusLabels[data.status]?.[language] || data.status;
    const messages = {
      ar: `تم تحديث حالة طلبك إلى: ${statusLabel}`,
      en: `Your application status has been updated to: ${statusLabel}`,
      fr: `Le statut de votre candidature a été mis à jour: ${statusLabel}`
    };
    
    setNotificationMessage(messages[language]);
    setShowNotification(true);
    
    // Hide notification after 5 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
    
    // Call parent callback if provided
    if (onStatusUpdate) {
      onStatusUpdate(data);
    }
  }, [language, onStatusUpdate]);

  // Subscribe to Pusher channel for this application
  useEffect(() => {
    if (!applicationId || !pusherClient.isInitialized) {
      return;
    }

    // Subscribe to application-specific channel
    const channelName = `application-${applicationId}`;
    
    // Listen for status updates
    const handlePusherStatusUpdate = (data) => {
      handleStatusUpdate(data);
    };
    
    // Add event listener
    window.addEventListener(`pusher-application-status-${applicationId}`, handlePusherStatusUpdate);
    
    // Subscribe to channel if Pusher is available
    if (pusherClient.pusher) {
      const channel = pusherClient.pusher.subscribe(channelName);
      channel.bind('status-updated', handleStatusUpdate);
      
      console.log(`✅ Subscribed to ${channelName} for status updates`);
      
      // Cleanup
      return () => {
        window.removeEventListener(`pusher-application-status-${applicationId}`, handlePusherStatusUpdate);
        if (pusherClient.pusher) {
          pusherClient.pusher.unsubscribe(channelName);
          console.log(`Unsubscribed from ${channelName}`);
        }
      };
    }
    
    // Cleanup for event listener only
    return () => {
      window.removeEventListener(`pusher-application-status-${applicationId}`, handlePusherStatusUpdate);
    };
  }, [applicationId, handleStatusUpdate]);

  // Define all possible status stages in order
  const statusStages = useMemo(() => [
    {
      key: 'Submitted',
      label: {
        ar: 'تم التقديم',
        en: 'Submitted',
        fr: 'Soumis'
      },
      icon: '📝',
      color: '#304B60'
    },
    {
      key: 'Reviewed',
      label: {
        ar: 'تمت المراجعة',
        en: 'Reviewed',
        fr: 'Examiné'
      },
      icon: '👀',
      color: '#304B60'
    },
    {
      key: 'Shortlisted',
      label: {
        ar: 'القائمة المختصرة',
        en: 'Shortlisted',
        fr: 'Présélectionné'
      },
      icon: '⭐',
      color: '#304B60'
    },
    {
      key: 'Interview Scheduled',
      label: {
        ar: 'تم جدولة المقابلة',
        en: 'Interview Scheduled',
        fr: 'Entretien Programmé'
      },
      icon: '📅',
      color: '#304B60'
    },
    {
      key: 'Accepted',
      label: {
        ar: 'مقبول',
        en: 'Accepted',
        fr: 'Accepté'
      },
      icon: '✅',
      color: '#10B981' // Green
    },
    {
      key: 'Rejected',
      label: {
        ar: 'مرفوض',
        en: 'Rejected',
        fr: 'Rejeté'
      },
      icon: '❌',
      color: '#EF4444' // Red
    },
    {
      key: 'Withdrawn',
      label: {
        ar: 'تم السحب',
        en: 'Withdrawn',
        fr: 'Retiré'
      },
      icon: '🔙',
      color: '#6B7280' // Gray
    }
  ], []);

  // Create a map of status history for quick lookup
  const statusHistoryMap = useMemo(() => {
    const map = new Map();
    localHistory.forEach(entry => {
      map.set(entry.status, entry);
    });
    return map;
  }, [localHistory]);

  // Determine which stages to display based on current status
  const displayStages = useMemo(() => {
    // If status is Accepted, Rejected, or Withdrawn, show the terminal status
    if (['Accepted', 'Rejected', 'Withdrawn'].includes(localStatus)) {
      // Show all stages up to the terminal status
      const terminalIndex = statusStages.findIndex(stage => stage.key === localStatus);
      return statusStages.slice(0, terminalIndex + 1);
    }
    
    // Otherwise, show all stages except terminal ones
    return statusStages.filter(stage => !['Accepted', 'Rejected', 'Withdrawn'].includes(stage.key));
  }, [localStatus, statusStages]);

  // Determine the status of each stage (completed, current, pending)
  const getStageStatus = (stageKey) => {
    if (stageKey === localStatus) {
      return 'current';
    }
    
    // Check if this stage has been completed
    if (statusHistoryMap.has(stageKey)) {
      return 'completed';
    }
    
    // Check if this stage comes before the current status
    const currentIndex = displayStages.findIndex(stage => stage.key === localStatus);
    const stageIndex = displayStages.findIndex(stage => stage.key === stageKey);
    
    if (stageIndex < currentIndex) {
      return 'completed';
    }
    
    return 'pending';
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US', options);
  };

  // Get timestamp for a stage
  const getStageTimestamp = (stageKey) => {
    const historyEntry = statusHistoryMap.get(stageKey);
    return historyEntry ? historyEntry.timestamp : null;
  };

  // Get note for a stage
  const getStageNote = (stageKey) => {
    const historyEntry = statusHistoryMap.get(stageKey);
    return historyEntry ? historyEntry.note : null;
  };

  return (
    <div className={`status-timeline ${className}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Real-time update notification */}
      {showNotification && (
        <div className="status-update-notification" role="alert" aria-live="polite">
          <span className="notification-icon">🔔</span>
          <span className="notification-message">{notificationMessage}</span>
          <button
            className="notification-close"
            onClick={() => setShowNotification(false)}
            aria-label={language === 'ar' ? 'إغلاق' : language === 'fr' ? 'Fermer' : 'Close'}
          >
            ×
          </button>
        </div>
      )}

      <div className="status-timeline-container">
        {displayStages.map((stage, index) => {
          const stageStatus = getStageStatus(stage.key);
          const timestamp = getStageTimestamp(stage.key);
          const note = getStageNote(stage.key);
          const isLast = index === displayStages.length - 1;

          return (
            <div
              key={stage.key}
              className={`status-stage status-stage-${stageStatus}`}
              data-status={stage.key}
            >
              {/* Stage indicator */}
              <div className="stage-indicator-wrapper">
                <div
                  className="stage-indicator"
                  style={{
                    backgroundColor: stageStatus === 'pending' ? '#E3DAD1' : stage.color,
                    borderColor: stage.color
                  }}
                >
                  <span className="stage-icon" role="img" aria-label={stage.label[language]}>
                    {stage.icon}
                  </span>
                </div>
                
                {/* Connector line */}
                {!isLast && (
                  <div
                    className={`stage-connector ${stageStatus === 'completed' ? 'stage-connector-completed' : ''}`}
                    style={{
                      backgroundColor: stageStatus === 'completed' ? stage.color : '#E3DAD1'
                    }}
                  />
                )}
              </div>

              {/* Stage content */}
              <div className="stage-content">
                <div className="stage-label">
                  {stage.label[language]}
                </div>
                
                {timestamp && (
                  <div className="stage-timestamp">
                    {formatTimestamp(timestamp)}
                  </div>
                )}
                
                {note && (
                  <div className="stage-note">
                    {note}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusTimeline;
