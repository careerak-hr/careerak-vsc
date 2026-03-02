import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import './VideoChat.css';

/**
 * مكون الدردشة النصية الجانبية أثناء مقابلة الفيديو
 * يدعم إرسال واستقبال الرسائل في الوقت الفعلي
 */
function VideoChat({ interviewId, socket, currentUser, otherUser, isOpen, onToggle }) {
  const { language } = useApp();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const translations = {
    ar: {
      title: 'الدردشة',
      placeholder: 'اكتب رسالتك...',
      send: 'إرسال',
      typing: 'يكتب...',
      noMessages: 'لا توجد رسائل بعد',
      close: 'إغلاق',
    },
    en: {
      title: 'Chat',
      placeholder: 'Type your message...',
      send: 'Send',
      typing: 'typing...',
      noMessages: 'No messages yet',
      close: 'Close',
    },
    fr: {
      title: 'Discussion',
      placeholder: 'Tapez votre message...',
      send: 'Envoyer',
      typing: 'en train d\'écrire...',
      noMessages: 'Pas encore de messages',
      close: 'Fermer',
    },
  };

  const t = translations[language] || translations.ar;

  // التمرير للأسفل عند رسالة جديدة
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // الاستماع للرسائل الجديدة
  useEffect(() => {
    if (!socket) return;

    socket.on('video_chat_message', (data) => {
      if (data.interviewId === interviewId) {
        setMessages((prev) => [...prev, data.message]);
      }
    });

    socket.on('video_chat_typing', (data) => {
      if (data.interviewId === interviewId && data.userId !== currentUser._id) {
        setIsTyping(true);
      }
    });

    socket.on('video_chat_stop_typing', (data) => {
      if (data.interviewId === interviewId && data.userId !== currentUser._id) {
        setIsTyping(false);
      }
    });

    return () => {
      socket.off('video_chat_message');
      socket.off('video_chat_typing');
      socket.off('video_chat_stop_typing');
    };
  }, [socket, interviewId, currentUser._id]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);

    // إرسال مؤشر الكتابة
    if (socket) {
      socket.emit('video_chat_typing', {
        interviewId,
        userId: currentUser._id,
      });
    }

    // إيقاف مؤشر الكتابة بعد 3 ثواني
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (socket) {
        socket.emit('video_chat_stop_typing', {
          interviewId,
          userId: currentUser._id,
        });
      }
    }, 3000);
  };

  const handleSend = (e) => {
    e.preventDefault();

    if (!inputValue.trim() || !socket) return;

    const message = {
      id: Date.now(),
      sender: {
        _id: currentUser._id,
        name: currentUser.firstName || currentUser.companyName,
        profileImage: currentUser.profileImage,
      },
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    // إضافة الرسالة محلياً
    setMessages((prev) => [...prev, message]);

    // إرسال عبر Socket.IO
    socket.emit('video_chat_message', {
      interviewId,
      message,
    });

    // إيقاف مؤشر الكتابة
    socket.emit('video_chat_stop_typing', {
      interviewId,
      userId: currentUser._id,
    });

    setInputValue('');
  };

  if (!isOpen) return null;

  return (
    <div className={`video-chat ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="video-chat-header">
        <h3>{t.title}</h3>
        <button className="close-btn" onClick={onToggle} aria-label={t.close}>
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="video-chat-messages">
        {messages.length === 0 ? (
          <div className="no-messages">{t.noMessages}</div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`message ${
                message.sender._id === currentUser._id ? 'sent' : 'received'
              }`}
            >
              <div className="message-header">
                <img
                  src={message.sender.profileImage || '/default-avatar.png'}
                  alt={message.sender.name}
                  className="message-avatar"
                />
                <span className="message-sender">{message.sender.name}</span>
              </div>
              <div className="message-content">
                <p>{message.content}</p>
              </div>
              <div className="message-time">
                {new Date(message.timestamp).toLocaleTimeString(
                  language === 'ar' ? 'ar-EG' : language === 'fr' ? 'fr-FR' : 'en-US',
                  { hour: '2-digit', minute: '2-digit' }
                )}
              </div>
            </div>
          ))
        )}

        {isTyping && (
          <div className="typing-indicator">
            <span>
              {otherUser?.firstName || otherUser?.companyName} {t.typing}
            </span>
            <span className="dots">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form className="video-chat-input" onSubmit={handleSend}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={t.placeholder}
          maxLength={500}
        />
        <button type="submit" disabled={!inputValue.trim()}>
          {t.send}
        </button>
      </form>
    </div>
  );
}

export default VideoChat;
