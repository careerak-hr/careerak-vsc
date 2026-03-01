/**
 * خدمة تسجيل المقابلات - Frontend
 * تتعامل مع MediaRecorder API لتسجيل الفيديو والصوت
 * 
 * Requirements: 2.1, 2.4
 * Design: Section 6 - RecordingService
 */
class RecordingService {
  constructor() {
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.stream = null;
    this.isRecording = false;
    this.startTime = null;
    this.recordingTimer = null;
    
    // إعدادات التسجيل
    this.options = {
      mimeType: this.getSupportedMimeType(),
      videoBitsPerSecond: 2500000, // 2.5 Mbps
      audioBitsPerSecond: 128000,  // 128 kbps
    };
  }

  /**
   * الحصول على نوع MIME المدعوم
   * يختار أفضل تنسيق متاح في المتصفح
   * 
   * @returns {string} نوع MIME
   */
  getSupportedMimeType() {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=h264,opus',
      'video/webm',
      'video/mp4',
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return 'video/webm'; // fallback
  }

  /**
   * بدء التسجيل
   * يبدأ تسجيل الفيديو والصوت من stream معين
   * 
   * @param {MediaStream} stream - stream الفيديو والصوت
   * @param {function} onDataAvailable - callback عند توفر بيانات
   * @param {function} onStop - callback عند إيقاف التسجيل
   * @returns {Promise<void>}
   * 
   * Requirements: 2.1
   */
  async startRecording(stream, onDataAvailable = null, onStop = null) {
    try {
      if (this.isRecording) {
        throw new Error('التسجيل قيد التشغيل بالفعل');
      }

      if (!stream) {
        throw new Error('لا يوجد stream للتسجيل');
      }

      // حفظ stream
      this.stream = stream;
      this.recordedChunks = [];
      
      // إنشاء MediaRecorder
      this.mediaRecorder = new MediaRecorder(stream, this.options);

      // معالج البيانات المتاحة
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
          
          if (onDataAvailable) {
            onDataAvailable(event.data);
          }
        }
      };

      // معالج إيقاف التسجيل
      this.mediaRecorder.onstop = async () => {
        this.isRecording = false;
        this.stopTimer();
        
        if (onStop) {
          const blob = this.getRecordedBlob();
          onStop(blob);
        }
      };

      // معالج الأخطاء
      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        this.isRecording = false;
        this.stopTimer();
      };

      // بدء التسجيل
      this.mediaRecorder.start(1000); // حفظ كل ثانية
      this.isRecording = true;
      this.startTime = Date.now();
      this.startTimer();

      console.log('Recording started with mimeType:', this.options.mimeType);
      
      return {
        success: true,
        message: 'تم بدء التسجيل بنجاح',
      };
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  /**
   * إيقاف التسجيل
   * يوقف MediaRecorder ويعيد Blob الفيديو
   * 
   * @returns {Promise<Blob>} ملف الفيديو
   * 
   * Requirements: 2.1
   */
  async stopRecording() {
    try {
      if (!this.isRecording) {
        throw new Error('لا يوجد تسجيل نشط');
      }

      return new Promise((resolve, reject) => {
        this.mediaRecorder.onstop = () => {
          this.isRecording = false;
          this.stopTimer();
          
          const blob = this.getRecordedBlob();
          resolve(blob);
        };

        this.mediaRecorder.stop();
      });
    } catch (error) {
      console.error('Error stopping recording:', error);
      throw error;
    }
  }

  /**
   * إيقاف مؤقت للتسجيل
   * 
   * @returns {void}
   */
  pauseRecording() {
    if (this.isRecording && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      this.stopTimer();
    }
  }

  /**
   * استئناف التسجيل
   * 
   * @returns {void}
   */
  resumeRecording() {
    if (this.isRecording && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      this.startTimer();
    }
  }

  /**
   * الحصول على Blob المسجل
   * 
   * @returns {Blob} ملف الفيديو
   */
  getRecordedBlob() {
    if (this.recordedChunks.length === 0) {
      return null;
    }

    const blob = new Blob(this.recordedChunks, {
      type: this.options.mimeType,
    });

    return blob;
  }

  /**
   * الحصول على مدة التسجيل
   * 
   * @returns {number} المدة بالثواني
   */
  getRecordingDuration() {
    if (!this.startTime) {
      return 0;
    }

    const duration = Math.floor((Date.now() - this.startTime) / 1000);
    return duration;
  }

  /**
   * بدء مؤقت التسجيل
   */
  startTimer() {
    this.recordingTimer = setInterval(() => {
      const duration = this.getRecordingDuration();
      
      // إطلاق حدث تحديث المدة
      const event = new CustomEvent('recording-duration-update', {
        detail: { duration },
      });
      window.dispatchEvent(event);
    }, 1000);
  }

  /**
   * إيقاف مؤقت التسجيل
   */
  stopTimer() {
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
      this.recordingTimer = null;
    }
  }

  /**
   * حفظ التسجيل كملف
   * 
   * @param {Blob} blob - ملف الفيديو
   * @param {string} filename - اسم الملف
   * @returns {void}
   * 
   * Requirements: 2.5
   */
  downloadRecording(blob, filename = 'interview-recording.webm') {
    if (!blob) {
      console.error('No recording blob available');
      return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    
    document.body.appendChild(a);
    a.click();
    
    // تنظيف
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  /**
   * رفع التسجيل إلى الخادم
   * 
   * @param {string} interviewId - معرف المقابلة
   * @param {Blob} blob - ملف الفيديو
   * @param {function} onProgress - callback لتتبع التقدم
   * @returns {Promise<object>} نتيجة الرفع
   * 
   * Requirements: 2.4, 2.5
   */
  async uploadRecording(interviewId, blob, onProgress = null) {
    try {
      if (!blob) {
        throw new Error('لا يوجد تسجيل للرفع');
      }

      // إنشاء FormData
      const formData = new FormData();
      formData.append('video', blob, 'recording.webm');
      formData.append('interviewId', interviewId);

      // رفع الملف
      const response = await fetch(`/api/interviews/${interviewId}/recording/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'فشل رفع التسجيل');
      }

      const result = await response.json();
      
      return {
        success: true,
        message: 'تم رفع التسجيل بنجاح',
        recording: result.recording,
      };
    } catch (error) {
      console.error('Error uploading recording:', error);
      throw error;
    }
  }

  /**
   * الحصول على معلومات التسجيل من الخادم
   * 
   * @param {string} interviewId - معرف المقابلة
   * @returns {Promise<object>} معلومات التسجيل
   */
  async getRecordingInfo(interviewId) {
    try {
      const response = await fetch(`/api/interviews/${interviewId}/recording`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'فشل الحصول على معلومات التسجيل');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error getting recording info:', error);
      throw error;
    }
  }

  /**
   * إضافة موافقة على التسجيل
   * 
   * @param {string} interviewId - معرف المقابلة
   * @param {boolean} consented - الموافقة
   * @returns {Promise<object>} نتيجة الإضافة
   * 
   * Requirements: 2.3
   */
  async addRecordingConsent(interviewId, consented) {
    try {
      const response = await fetch(`/api/interviews/${interviewId}/recording/consent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ consented }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'فشل إضافة الموافقة');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error adding recording consent:', error);
      throw error;
    }
  }

  /**
   * التحقق من موافقة جميع المشاركين
   * 
   * @param {string} interviewId - معرف المقابلة
   * @returns {Promise<object>} نتيجة التحقق
   */
  async checkAllConsents(interviewId) {
    try {
      const response = await fetch(`/api/interviews/${interviewId}/recording/consents`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'فشل التحقق من الموافقات');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error checking consents:', error);
      throw error;
    }
  }

  /**
   * بدء التسجيل على الخادم
   * 
   * @param {string} interviewId - معرف المقابلة
   * @returns {Promise<object>} نتيجة بدء التسجيل
   */
  async startRecordingOnServer(interviewId) {
    try {
      const response = await fetch(`/api/interviews/${interviewId}/recording/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'فشل بدء التسجيل');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error starting recording on server:', error);
      throw error;
    }
  }

  /**
   * إيقاف التسجيل على الخادم
   * 
   * @param {string} interviewId - معرف المقابلة
   * @returns {Promise<object>} نتيجة إيقاف التسجيل
   */
  async stopRecordingOnServer(interviewId) {
    try {
      const response = await fetch(`/api/interviews/${interviewId}/recording/stop`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'فشل إيقاف التسجيل');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error stopping recording on server:', error);
      throw error;
    }
  }

  /**
   * تنظيف الموارد
   */
  cleanup() {
    this.stopTimer();
    
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.stream = null;
    this.isRecording = false;
    this.startTime = null;
  }

  /**
   * التحقق من دعم المتصفح للتسجيل
   * 
   * @returns {boolean} true إذا كان المتصفح يدعم التسجيل
   */
  static isSupported() {
    return !!(navigator.mediaDevices && 
              navigator.mediaDevices.getUserMedia && 
              window.MediaRecorder);
  }

  /**
   * الحصول على معلومات الدعم
   * 
   * @returns {object} معلومات الدعم
   */
  static getSupportInfo() {
    return {
      isSupported: RecordingService.isSupported(),
      hasMediaDevices: !!navigator.mediaDevices,
      hasGetUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      hasMediaRecorder: !!window.MediaRecorder,
      supportedMimeTypes: [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=h264,opus',
        'video/webm',
        'video/mp4',
      ].filter(type => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(type)),
    };
  }
}

export default RecordingService;
