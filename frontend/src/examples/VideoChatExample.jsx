import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import VideoChat from '../components/VideoInterview/VideoChat';

/**
 * مثال على استخدام مكون الدردشة النصية أثناء مقابلة الفيديو
 * 
 * هذا المثال يوضح كيفية:
 * 1. الاتصال بـ Socket.IO
 * 2. الانضمام لمقابلة فيديو
 * 3. استخدام مكون VideoChat
 * 4. معالجة الرسائل والأحداث
 */
function VideoChatExample() {
  const [socket, setSocket] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(true);
  
  // بيانات وهمية للمثال
  const interviewId = 'interview_123';
  const currentUser = {
    _id: 'user_1',
    firstName: 'أحمد',
    profileImage: '/avatar1.jpg',
  };
  const otherUser = {
    _id: 'user_2',
    companyName: 'شركة التقنية',
    profileImage: '/avatar2.jpg',
  };

  useEffect(() => {
    // الاتصال بـ Socket.IO
    const token = localStorage.getItem('token');
    const newSocket = io('http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO');
      
      // الانضمام لمقابلة الفيديو
      newSocket.emit('join_video_interview', interviewId);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO');
    });

    setSocket(newSocket);

    return () => {
      // مغادرة المقابلة عند إلغاء التحميل
      newSocket.emit('leave_video_interview', interviewId);
      newSocket.disconnect();
    };
  }, []);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>مثال على الدردشة أثناء مقابلة الفيديو</h1>
      
      <div style={{ marginTop: '20px' }}>
        <button onClick={toggleChat}>
          {isChatOpen ? 'إخفاء الدردشة' : 'إظهار الدردشة'}
        </button>
      </div>

      {/* مكون الدردشة */}
      <VideoChat
        interviewId={interviewId}
        socket={socket}
        currentUser={currentUser}
        otherUser={otherUser}
        isOpen={isChatOpen}
        onToggle={toggleChat}
      />

      {/* محاكاة واجهة الفيديو */}
      <div
        style={{
          marginTop: '40px',
          padding: '20px',
          background: '#f5f5f5',
          borderRadius: '8px',
        }}
      >
        <h2>واجهة الفيديو (محاكاة)</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginTop: '20px',
          }}
        >
          <div
            style={{
              background: '#000',
              height: '300px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            فيديو المستخدم الحالي
          </div>
          <div
            style={{
              background: '#000',
              height: '300px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            فيديو المستخدم الآخر
          </div>
        </div>
      </div>

      {/* معلومات الاستخدام */}
      <div
        style={{
          marginTop: '40px',
          padding: '20px',
          background: '#e3f2fd',
          borderRadius: '8px',
        }}
      >
        <h3>كيفية الاستخدام:</h3>
        <ol>
          <li>افتح هذه الصفحة في نافذتين مختلفتين</li>
          <li>سجل دخول بمستخدمين مختلفين</li>
          <li>ابدأ الكتابة في الدردشة</li>
          <li>ستظهر الرسائل في الوقت الفعلي في النافذة الأخرى</li>
        </ol>
      </div>
    </div>
  );
}

export default VideoChatExample;
