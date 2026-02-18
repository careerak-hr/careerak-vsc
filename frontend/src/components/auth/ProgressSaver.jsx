import React, { useState, useEffect } from 'react';

/**
 * ProgressSaver Component
 * حفظ واسترجاع تقدم التسجيل تلقائياً
 * يستخدم localStorage مع انتهاء صلاحية بعد 7 أيام
 */
function ProgressSaver({ onRestore, onClear }) {
  const [savedProgress, setSavedProgress] = useState(null);
  
  // سيتم التنفيذ في المهمة 9.2
  
  if (!savedProgress) return null;
  
  return (
    <div className="progress-saver">
      <div className="saved-progress-message">
        <p>لديك تسجيل غير مكتمل</p>
        <div className="actions">
          <button onClick={() => onRestore(savedProgress)}>
            المتابعة من حيث توقفت
          </button>
          <button onClick={onClear}>
            بدء من جديد
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProgressSaver;
