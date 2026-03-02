import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import './RaiseHand.css';

/**
 * مكون رفع اليد
 * 
 * Requirements: 6.3
 * 
 * الميزات:
 * - رفع اليد للإشارة
 * - خفض اليد
 * - عرض قائمة من رفعوا أيديهم
 * - دعم متعدد اللغات
 * - تصميم متجاوب
 */

const RaiseHand = ({ socket, roomId, isHost, currentUserId, currentUserName }) => {
  const { language } = useApp();
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [raisedHands, setRaisedHands] = useState([]);

  // الترجمات
  const translations = {
    ar: {
      raiseHand: 'رفع اليد',
      lowerHand: 'خفض اليد',
      raisedHands: 'الأيدي المرفوعة',
      noRaisedHands: 'لا توجد أيدي مرفوعة',
      you: 'أنت',
      raisedAt: 'رفع اليد في',
    },
    en: {
      raiseHand: 'Raise Hand',
      lowerHand: 'Lower Hand',
      raisedHands: 'Raised Hands',
      noRaisedHands: 'No raised hands',
      you: 'You',
      raisedAt: 'Raised at',
    },
    fr: {
      raiseHand: 'Lever la main',
      lowerHand: 'Baisser la main',
      raisedHands: 'Mains levées',
      noRaisedHands: 'Aucune main levée',
      you: 'Vous',
      raisedAt: 'Levé à',
    },
  };

  const t = translations[language] || translations.ar;

  useEffect(() => {
    if (!socket) return;

    // الاستماع لأحداث رفع اليد
    socket.on('hand-raised', (data) => {
      const { socketId, userId, userName, raisedAt } = data;
      
      // إضافة للقائمة إذا لم يكن موجوداً
      setRaisedHands((prev) => {
        const exists = prev.find((h) => h.userId === userId);
        if (exists) return prev;
        
        return [...prev, { socketId, userId, userName, raisedAt }];
      });

      // تحديث حالة المستخدم الحالي
      if (userId === currentUserId) {
        setIsHandRaised(true);
      }
    });

    // الاستماع لأحداث خفض اليد
    socket.on('hand-lowered', (data) => {
      const { userId } = data;
      
      // إزالة من القائمة
      setRaisedHands((prev) => prev.filter((h) => h.userId !== userId));

      // تحديث حالة المستخدم الحالي
      if (userId === currentUserId) {
        setIsHandRaised(false);
      }
    });

    // الاستماع لمغادرة المستخدمين
    socket.on('user-left', (data) => {
      const { userId } = data;
      
      // إزالة من القائمة إذا كان قد رفع يده
      setRaisedHands((prev) => prev.filter((h) => h.userId !== userId));
    });

    return () => {
      socket.off('hand-raised');
      socket.off('hand-lowered');
      socket.off('user-left');
    };
  }, [socket, currentUserId]);

  // رفع اليد
  const handleRaiseHand = () => {
    if (!socket || !roomId) return;

    socket.emit('raise-hand', { roomId });
    setIsHandRaised(true);
  };

  // خفض اليد
  const handleLowerHand = () => {
    if (!socket || !roomId) return;

    socket.emit('lower-hand', { roomId });
    setIsHandRaised(false);
  };

  // تنسيق الوقت
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="raise-hand-container">
      {/* زر رفع/خفض اليد */}
      <button
        className={`raise-hand-button ${isHandRaised ? 'hand-raised' : ''}`}
        onClick={isHandRaised ? handleLowerHand : handleRaiseHand}
        title={isHandRaised ? t.lowerHand : t.raiseHand}
        aria-label={isHandRaised ? t.lowerHand : t.raiseHand}
      >
        <span className="hand-icon" role="img" aria-label="hand">
          ✋
        </span>
        {isHandRaised && <span className="raised-indicator">!</span>}
      </button>

      {/* قائمة الأيدي المرفوعة (للمضيف فقط) */}
      {isHost && raisedHands.length > 0 && (
        <div className="raised-hands-list">
          <div className="raised-hands-header">
            <span className="hand-icon" role="img" aria-label="hand">
              ✋
            </span>
            <span className="raised-hands-title">{t.raisedHands}</span>
            <span className="raised-hands-count">{raisedHands.length}</span>
          </div>
          <div className="raised-hands-items">
            {raisedHands.map((hand) => (
              <div key={hand.userId} className="raised-hand-item">
                <span className="raised-hand-name">
                  {hand.userName}
                  {hand.userId === currentUserId && ` (${t.you})`}
                </span>
                <span className="raised-hand-time">
                  {formatTime(hand.raisedAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* مؤشر للمشاركين (غير المضيف) */}
      {!isHost && raisedHands.length > 0 && (
        <div className="raised-hands-indicator">
          <span className="hand-icon" role="img" aria-label="hand">
            ✋
          </span>
          <span className="raised-hands-count">{raisedHands.length}</span>
        </div>
      )}
    </div>
  );
};

export default RaiseHand;
