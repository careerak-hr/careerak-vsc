import React, { useState, useEffect } from 'react';
import RecordingConsentModal from './RecordingConsentModal';
import ConsentStatusIndicator from './ConsentStatusIndicator';
import VideoCall from './VideoCall';

/**
 * RecordingConsentExample Component
 * مثال كامل لاستخدام نظام الموافقة على التسجيل
 * 
 * يوضح:
 * - طلب الموافقة من المشاركين
 * - عرض حالة الموافقة للمضيف
 * - منع بدء التسجيل بدون موافقة الجميع
 * - التكامل مع Backend API
 * 
 * Requirements: 2.3 (موافقة المرشح إلزامية قبل التسجيل)
 */
const RecordingConsentExample = () => {
  const [interviewId] = useState('interview-123'); // من URL أو props
  const [userId] = useState('user-456'); // من authentication
  const [isHost] = useState(false); // true للمضيف، false للمشارك
  const [language] = useState('ar'); // من context أو settings

  // حالة المقابلة
  const [interview, setInterview] = useState(null);
  const [participants, setParticipants] = useState([]);
  
  // حالة الموافقة
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [isLoadingConsent, setIsLoadingConsent] = useState(false);
  const [hasAllConsents, setHasAllConsents] = useState(false);
  
  // حالة التسجيل
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // جلب معلومات المقابلة
  useEffect(() => {
    fetchInterviewDetails();
  }, [interviewId]);

  // التحقق من الموافقة عند تحميل المقابلة
  useEffect(() => {
    if (interview && interview.settings.recordingEnabled) {
      checkConsentStatus();
    }
  }, [interview]);

  const fetchInterviewDetails = async () => {
    try {
      const response = await fetch(`/api/interviews/${interviewId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setInterview(data.interview);
      }
    } catch (error) {
      console.error('Error fetching interview:', error);
    }
  };

  const checkConsentStatus = async () => {
    try {
      const response = await fetch(`/api/interviews/${interviewId}/recording/consents`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setHasAllConsents(data.hasAllConsents);
        setParticipants(data.consentStatus);
        
        // إذا كان المستخدم مشارك ولم يوافق بعد، عرض النافذة
        if (!isHost) {
          const myConsent = data.consentStatus.find(p => p.userId === userId);
          if (myConsent && myConsent.consented === null) {
            setShowConsentModal(true);
          }
        }
      }
    } catch (error) {
      console.error('Error checking consent status:', error);
    }
  };

  const handleConsent = async () => {
    setIsLoadingConsent(true);
    
    try {
      const response = await fetch(`/api/interviews/${interviewId}/recording/consent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ consented: true })
      });
      
      if (response.ok) {
        const data = await response.json();
        setShowConsentModal(false);
        setHasAllConsents(data.hasAllConsents);
        
        // تحديث حالة الموافقة
        await checkConsentStatus();
        
        alert('تم تسجيل موافقتك بنجاح');
      } else {
        throw new Error('فشل تسجيل الموافقة');
      }
    } catch (error) {
      console.error('Error adding consent:', error);
      alert('حدث خطأ أثناء تسجيل الموافقة. حاول مرة أخرى.');
    } finally {
      setIsLoadingConsent(false);
    }
  };

  const handleDecline = async () => {
    setIsLoadingConsent(true);
    
    try {
      const response = await fetch(`/api/interviews/${interviewId}/recording/consent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ consented: false })
      });
      
      if (response.ok) {
        setShowConsentModal(false);
        
        // تحديث حالة الموافقة
        await checkConsentStatus();
        
        alert('تم تسجيل رفضك للتسجيل. المقابلة ستستمر بدون تسجيل.');
      } else {
        throw new Error('فشل تسجيل الرفض');
      }
    } catch (error) {
      console.error('Error declining consent:', error);
      alert('حدث خطأ أثناء تسجيل الرفض. حاول مرة أخرى.');
    } finally {
      setIsLoadingConsent(false);
    }
  };

  const handleStartRecording = async () => {
    if (!hasAllConsents) {
      alert('لا يمكن بدء التسجيل. يجب الحصول على موافقة جميع المشاركين أولاً.');
      return;
    }
    
    try {
      const response = await fetch(`/api/interviews/${interviewId}/recording/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        setIsRecording(true);
        alert('تم بدء التسجيل بنجاح');
        
        // بدء عداد المدة
        const startTime = Date.now();
        const interval = setInterval(() => {
          setRecordingDuration(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);
        
        // حفظ interval للتنظيف لاحقاً
        window.recordingInterval = interval;
      } else {
        const data = await response.json();
        throw new Error(data.message || 'فشل بدء التسجيل');
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      alert(error.message);
    }
  };

  const handleStopRecording = async () => {
    try {
      const response = await fetch(`/api/interviews/${interviewId}/recording/stop`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        setIsRecording(false);
        
        // إيقاف عداد المدة
        if (window.recordingInterval) {
          clearInterval(window.recordingInterval);
          window.recordingInterval = null;
        }
        
        alert('تم إيقاف التسجيل بنجاح');
      } else {
        throw new Error('فشل إيقاف التسجيل');
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      alert('حدث خطأ أثناء إيقاف التسجيل');
    }
  };

  if (!interview) {
    return <div>جاري التحميل...</div>;
  }

  return (
    <div className="recording-consent-example">
      {/* نافذة طلب الموافقة (للمشاركين فقط) */}
      <RecordingConsentModal
        isOpen={showConsentModal}
        onConsent={handleConsent}
        onDecline={handleDecline}
        hostName={interview.hostId?.name || 'المضيف'}
        language={language}
        isLoading={isLoadingConsent}
      />

      {/* مؤشر حالة الموافقة (للمضيف فقط) */}
      {isHost && interview.settings.recordingEnabled && (
        <ConsentStatusIndicator
          participants={participants}
          language={language}
          showForHost={isHost}
        />
      )}

      {/* أزرار التحكم في التسجيل (للمضيف فقط) */}
      {isHost && interview.settings.recordingEnabled && (
        <div className="recording-controls">
          {!isRecording ? (
            <button
              onClick={handleStartRecording}
              disabled={!hasAllConsents}
              className="recording-btn recording-btn-start"
            >
              {hasAllConsents ? '🔴 بدء التسجيل' : '⏸️ في انتظار الموافقات'}
            </button>
          ) : (
            <button
              onClick={handleStopRecording}
              className="recording-btn recording-btn-stop"
            >
              ⏹️ إيقاف التسجيل
            </button>
          )}
        </div>
      )}

      {/* مكون مقابلة الفيديو */}
      <VideoCall
        localStream={null} // من WebRTC
        remoteStream={null} // من WebRTC
        onToggleAudio={() => {}}
        onToggleVideo={() => {}}
        isRecording={isRecording}
        recordingDuration={recordingDuration}
        language={language}
      />

      {/* معلومات إضافية */}
      <div className="example-info">
        <h3>معلومات المثال:</h3>
        <ul>
          <li>معرف المقابلة: {interviewId}</li>
          <li>معرف المستخدم: {userId}</li>
          <li>الدور: {isHost ? 'مضيف' : 'مشارك'}</li>
          <li>التسجيل مفعل: {interview.settings.recordingEnabled ? 'نعم' : 'لا'}</li>
          <li>جميع الموافقات: {hasAllConsents ? 'نعم ✓' : 'لا ✗'}</li>
          <li>حالة التسجيل: {isRecording ? 'جاري التسجيل 🔴' : 'متوقف'}</li>
        </ul>
      </div>
    </div>
  );
};

export default RecordingConsentExample;
