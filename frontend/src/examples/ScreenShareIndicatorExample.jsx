import React, { useState } from 'react';
import ScreenShareDisplay from '../components/VideoInterview/ScreenShareDisplay';
import ScreenShareControls from '../components/VideoInterview/ScreenShareControls';
import './ScreenShareIndicatorExample.css';

/**
 * مثال توضيحي لمؤشر "يشارك الشاشة الآن"
 * 
 * يوضح:
 * 1. مؤشر المشاركة النشطة في ScreenShareControls
 * 2. مؤشر المشاركة في ScreenShareDisplay
 * 3. التصميم المتجاوب للمؤشرات
 */
const ScreenShareIndicatorExample = () => {
  const [isSharing, setIsSharing] = useState(false);
  const [stream, setStream] = useState(null);
  const [shareType, setShareType] = useState(null);

  const handleShareStart = (newStream, type) => {
    setStream(newStream);
    setShareType(type);
    setIsSharing(true);
    console.log('✅ Screen share started:', type);
  };

  const handleShareStop = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setShareType(null);
    setIsSharing(false);
    console.log('⏹️ Screen share stopped');
  };

  return (
    <div className="screen-share-indicator-example">
      <div className="example-header">
        <h1>مؤشر "يشارك الشاشة الآن"</h1>
        <p>مثال توضيحي لمؤشرات مشاركة الشاشة</p>
      </div>

      <div className="example-content">
        {/* قسم التحكم */}
        <div className="control-section">
          <h2>التحكم في المشاركة</h2>
          <ScreenShareControls
            onShareStart={handleShareStart}
            onShareStop={handleShareStop}
          />
          
          <div className="status-info">
            <h3>الحالة الحالية:</h3>
            <ul>
              <li>
                <strong>المشاركة نشطة:</strong> {isSharing ? '✅ نعم' : '❌ لا'}
              </li>
              {isSharing && (
                <>
                  <li>
                    <strong>نوع المشاركة:</strong> {shareType}
                  </li>
                  <li>
                    <strong>المؤشرات المرئية:</strong>
                    <ul>
                      <li>✅ أيقونة نبض (sharing-pulse)</li>
                      <li>✅ نص "يشارك الآن"</li>
                      <li>✅ معلومات الجودة</li>
                      <li>✅ زر إيقاف واضح</li>
                    </ul>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* قسم العرض */}
        {isSharing && stream && (
          <div className="display-section">
            <h2>عرض الشاشة المشاركة</h2>
            <ScreenShareDisplay
              stream={stream}
              sharerName="أحمد محمد"
              shareType={shareType}
              onClose={handleShareStop}
            />
            
            <div className="display-info">
              <h3>المؤشرات في ScreenShareDisplay:</h3>
              <ul>
                <li>✅ Badge "يشارك الآن" في الأعلى</li>
                <li>✅ اسم المشارك</li>
                <li>✅ نوع المشاركة (شاشة/نافذة/تبويب)</li>
                <li>✅ معلومات الجودة (1920x1080)</li>
                <li>✅ حالة الاتصال</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* قسم الشرح */}
      <div className="explanation-section">
        <h2>📋 شرح المؤشرات</h2>
        
        <div className="explanation-card">
          <h3>1. مؤشر في ScreenShareControls</h3>
          <p>عندما تكون المشاركة نشطة، يظهر:</p>
          <ul>
            <li><strong>أيقونة نبض:</strong> دائرة متحركة تنبض كل ثانيتين</li>
            <li><strong>نص "يشارك الآن":</strong> مع نوع المشاركة (الشاشة الكاملة/نافذة/تبويب)</li>
            <li><strong>معلومات الجودة:</strong> الدقة وعدد الإطارات في الثانية</li>
            <li><strong>زر إيقاف واضح:</strong> باللون الأحمر مع أيقونة stop</li>
          </ul>
        </div>

        <div className="explanation-card">
          <h3>2. مؤشر في ScreenShareDisplay</h3>
          <p>في أعلى شاشة العرض، يظهر:</p>
          <ul>
            <li><strong>Badge "يشارك الآن":</strong> مع أيقونة نبض</li>
            <li><strong>اسم المشارك:</strong> من يشارك الشاشة</li>
            <li><strong>نوع المشاركة:</strong> الشاشة الكاملة/نافذة/تبويب</li>
            <li><strong>معلومات الجودة:</strong> الدقة (مثل 1920x1080)</li>
          </ul>
        </div>

        <div className="explanation-card">
          <h3>3. التصميم المتجاوب</h3>
          <p>المؤشرات تتكيف مع جميع الأجهزة:</p>
          <ul>
            <li><strong>Desktop:</strong> جميع المعلومات ظاهرة</li>
            <li><strong>Tablet:</strong> معلومات مختصرة</li>
            <li><strong>Mobile:</strong> المؤشرات الأساسية فقط</li>
          </ul>
        </div>

        <div className="explanation-card">
          <h3>4. الألوان والتصميم</h3>
          <ul>
            <li><strong>اللون:</strong> تدرج بنفسجي (gradient purple)</li>
            <li><strong>الأيقونة:</strong> دائرة نابضة (pulse animation)</li>
            <li><strong>الخط:</strong> واضح وسهل القراءة</li>
            <li><strong>الموقع:</strong> في الأعلى، واضح للجميع</li>
          </ul>
        </div>
      </div>

      {/* قسم الكود */}
      <div className="code-section">
        <h2>💻 الكود المستخدم</h2>
        
        <div className="code-block">
          <h3>في ScreenShareControls.jsx (السطر 147-150):</h3>
          <pre>{`<div className="sharing-indicator">
  <i className="fas fa-circle sharing-pulse"></i>
  <span>يشارك {getShareTypeText()}</span>
</div>`}</pre>
        </div>

        <div className="code-block">
          <h3>في ScreenShareDisplay.jsx (السطر 73-76):</h3>
          <pre>{`<div className="sharing-badge">
  <i className="fas fa-circle sharing-pulse"></i>
  <span>يشارك الآن</span>
</div>`}</pre>
        </div>

        <div className="code-block">
          <h3>CSS Animation (في كلا الملفين):</h3>
          <pre>{`@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.sharing-pulse {
  animation: pulse 2s ease-in-out infinite;
}`}</pre>
        </div>
      </div>

      {/* قسم المتطلبات */}
      <div className="requirements-section">
        <h2>✅ تحقيق المتطلبات</h2>
        
        <div className="requirement-item">
          <h3>Requirements 3.6: مؤشر "يشارك الشاشة الآن"</h3>
          <ul>
            <li>✅ مؤشر واضح ومرئي في ScreenShareControls</li>
            <li>✅ مؤشر واضح ومرئي في ScreenShareDisplay</li>
            <li>✅ أيقونة نابضة (pulse animation)</li>
            <li>✅ نص واضح "يشارك الآن"</li>
            <li>✅ معلومات إضافية (نوع المشاركة، الجودة)</li>
            <li>✅ تصميم متجاوب (Desktop, Tablet, Mobile)</li>
            <li>✅ دعم RTL/LTR</li>
            <li>✅ دعم Dark Mode</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ScreenShareIndicatorExample;
