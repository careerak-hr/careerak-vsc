import React, { useState } from 'react';
import InterviewTimer from '../components/VideoCall/InterviewTimer';

/**
 * InterviewTimer Example
 * مثال على استخدام مكون مؤقت المقابلة
 * 
 * Requirements: 6.5 - مؤقت يعرض مدة المقابلة
 */
const InterviewTimerExample = () => {
  const [startTime, setStartTime] = useState(null);
  const [isActive, setIsActive] = useState(true);
  const [language, setLanguage] = useState('ar');
  const [position, setPosition] = useState('top-right');
  const [showLabel, setShowLabel] = useState(true);

  const handleStart = () => {
    setStartTime(Date.now());
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleResume = () => {
    setIsActive(true);
  };

  const handleReset = () => {
    setStartTime(null);
    setIsActive(true);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>مثال على مؤقت المقابلة</h1>
      
      {/* Preview Area */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '800px',
        height: '450px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        margin: '20px 0',
        overflow: 'hidden'
      }}>
        <InterviewTimer
          startTime={startTime}
          isActive={isActive}
          language={language}
          showLabel={showLabel}
          position={position}
        />
        
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          textAlign: 'center'
        }}>
          <h2>منطقة معاينة المؤقت</h2>
          <p>المؤقت سيظهر في الموقع المحدد</p>
        </div>
      </div>

      {/* Controls */}
      <div style={{ marginBottom: '20px' }}>
        <h3>التحكم في المؤقت</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleStart}
            disabled={startTime !== null}
            style={{
              padding: '10px 20px',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: startTime !== null ? 'not-allowed' : 'pointer',
              opacity: startTime !== null ? 0.5 : 1
            }}
          >
            ▶️ بدء المقابلة
          </button>
          
          <button
            onClick={handlePause}
            disabled={!startTime || !isActive}
            style={{
              padding: '10px 20px',
              background: '#FFC107',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: (!startTime || !isActive) ? 'not-allowed' : 'pointer',
              opacity: (!startTime || !isActive) ? 0.5 : 1
            }}
          >
            ⏸️ إيقاف مؤقت
          </button>
          
          <button
            onClick={handleResume}
            disabled={!startTime || isActive}
            style={{
              padding: '10px 20px',
              background: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: (!startTime || isActive) ? 'not-allowed' : 'pointer',
              opacity: (!startTime || isActive) ? 0.5 : 1
            }}
          >
            ▶️ استئناف
          </button>
          
          <button
            onClick={handleReset}
            style={{
              padding: '10px 20px',
              background: '#F44336',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            🔄 إعادة تعيين
          </button>
        </div>
      </div>

      {/* Settings */}
      <div style={{ marginBottom: '20px' }}>
        <h3>الإعدادات</h3>
        
        {/* Language */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            اللغة:
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #ddd',
              minWidth: '200px'
            }}
          >
            <option value="ar">العربية</option>
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>
        </div>

        {/* Position */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            الموقع:
          </label>
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            style={{
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #ddd',
              minWidth: '200px'
            }}
          >
            <option value="top-left">أعلى اليسار</option>
            <option value="top-right">أعلى اليمين</option>
            <option value="bottom-left">أسفل اليسار</option>
            <option value="bottom-right">أسفل اليمين</option>
          </select>
        </div>

        {/* Show Label */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={showLabel}
              onChange={(e) => setShowLabel(e.target.checked)}
              style={{ width: '18px', height: '18px' }}
            />
            <span style={{ fontWeight: 'bold' }}>عرض التسمية</span>
          </label>
        </div>
      </div>

      {/* Status */}
      <div style={{
        padding: '15px',
        background: '#f5f5f5',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3>الحالة الحالية</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li><strong>حالة المقابلة:</strong> {startTime ? (isActive ? '🟢 نشطة' : '🟡 متوقفة مؤقتاً') : '⚪ لم تبدأ'}</li>
          <li><strong>وقت البدء:</strong> {startTime ? new Date(startTime).toLocaleTimeString('ar-EG') : 'غير محدد'}</li>
          <li><strong>اللغة:</strong> {language === 'ar' ? 'العربية' : language === 'en' ? 'English' : 'Français'}</li>
          <li><strong>الموقع:</strong> {position}</li>
          <li><strong>عرض التسمية:</strong> {showLabel ? 'نعم' : 'لا'}</li>
        </ul>
      </div>

      {/* Usage Examples */}
      <div style={{
        padding: '15px',
        background: '#e3f2fd',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3>أمثلة الاستخدام</h3>
        
        <h4>1. استخدام أساسي</h4>
        <pre style={{
          background: '#263238',
          color: '#aed581',
          padding: '15px',
          borderRadius: '6px',
          overflow: 'auto'
        }}>
{`import InterviewTimer from './components/VideoCall/InterviewTimer';

function VideoCallPage() {
  const [interviewStartTime] = useState(Date.now());

  return (
    <div>
      <InterviewTimer
        startTime={interviewStartTime}
        isActive={true}
        language="ar"
      />
    </div>
  );
}`}
        </pre>

        <h4>2. مع VideoCall Component</h4>
        <pre style={{
          background: '#263238',
          color: '#aed581',
          padding: '15px',
          borderRadius: '6px',
          overflow: 'auto'
        }}>
{`import VideoCall from './components/VideoCall/VideoCall';

function InterviewPage() {
  const [interviewStartTime] = useState(Date.now());

  return (
    <VideoCall
      localStream={localStream}
      remoteStream={remoteStream}
      interviewStartTime={interviewStartTime}
      showInterviewTimer={true}
      timerPosition="top-right"
      language="ar"
    />
  );
}`}
        </pre>

        <h4>3. مع إيقاف مؤقت</h4>
        <pre style={{
          background: '#263238',
          color: '#aed581',
          padding: '15px',
          borderRadius: '6px',
          overflow: 'auto'
        }}>
{`function InterviewWithPause() {
  const [startTime] = useState(Date.now());
  const [isPaused, setIsPaused] = useState(false);

  return (
    <>
      <InterviewTimer
        startTime={startTime}
        isActive={!isPaused}
        language="ar"
      />
      <button onClick={() => setIsPaused(!isPaused)}>
        {isPaused ? 'استئناف' : 'إيقاف مؤقت'}
      </button>
    </>
  );
}`}
        </pre>
      </div>

      {/* Features */}
      <div style={{
        padding: '15px',
        background: '#f1f8e9',
        borderRadius: '8px'
      }}>
        <h3>الميزات</h3>
        <ul>
          <li>✅ عرض الوقت المنقضي بصيغة HH:MM:SS</li>
          <li>✅ بدء تلقائي عند بدء المقابلة</li>
          <li>✅ إيقاف مؤقت واستئناف</li>
          <li>✅ دعم متعدد اللغات (ar, en, fr)</li>
          <li>✅ 4 مواقع مختلفة (top-left, top-right, bottom-left, bottom-right)</li>
          <li>✅ إخفاء/إظهار التسمية</li>
          <li>✅ تصميم متجاوب (Desktop, Tablet, Mobile)</li>
          <li>✅ تأثيرات بصرية (pulse animation)</li>
          <li>✅ دعم RTL/LTR</li>
          <li>✅ Dark mode support</li>
        </ul>
      </div>
    </div>
  );
};

export default InterviewTimerExample;
