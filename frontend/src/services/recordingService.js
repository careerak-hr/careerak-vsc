/**
 * Frontend Recording Service
 * إدارة تسجيل المقابلات من جانب العميل باستخدام MediaRecorder API
 * 
 * Requirements: 2.1, 2.4
 */
class RecordingService {
  constructor() {
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.stream = null;
    this.isRecording = false;
    this.startTime = null;
    this.recordingId = null;

    // إعدادات التسجيل
    this.options = {
      mimeType: this.getSupportedMimeType(),
      videoBitsPerSecond: 2500000, // 2.5 Mbps
      audioBitsPerSecond: 128000,  // 128 kbps
    };
  }

  /**
   * الحصول على mimeType المدعوم
   * @returns {string} mimeType
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
   * @param {MediaStream} stream - media stream للتسجيل
   * @param {Function} onDataAvailable - callback عند توفر بيانات
   * @param {Function} onStop - callback عند إيقاف التسجيل
   * @returns {Promise<Object>} معلومات التسجيل
   */
  async startRecording(stream, onDataAvailable = null, onStop = null) {
    try {
      if (this.isRecording) {
        throw new Error('Recording is already in progress');
      }

      if (!stream) {
        throw new Error('Media stream is required');
      }

      // التحقق من دعم MediaRecorder
      if (!window.MediaRecorder) {
        throw new Error('MediaRecorder is not supported in this browser');
      }

      this.stream = stream;
      this.recordedChunks = [];
      this.startTime = new Date();

      // إنشاء MediaRecorder
      this.mediaRecorder = new MediaRecorder(stream, this.options);

      // معالجة البيانات المتاحة
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
          
          if (onDataAvailable) {
            onDataAvailable(event.data);
          }
        }
      };

      // معالجة إيقاف التسجيل
      this.mediaRecorder.onstop = () => {
        this.isRecording = false;
        
        if (onStop) {
          const blob = this.getRecordingBlob();
          onStop(blob);
        }
      };

      // معالجة الأخطاء
      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        this.isRecording = false;
      };

      // بدء التسجيل
      this.mediaRecorder.start(1000); // حفظ chunk كل ثانية
      this.isRecording = true;

      return {
        success: true,
        startTime: this.startTime,
        mimeType: this.options.mimeType,
      };
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  /**
   * إيقاف التسجيل
   * @returns {Promise<Blob>} blob التسجيل
   */
  async stopRecording() {
    try {
      if (!this.isRecording || !this.mediaRecorder) {
        throw new Error('No active recording');
      }

      return new Promise((resolve, reject) => {
        this.mediaRecorder.onstop = () => {
          this.isRecording = false;
          const blob = this.getRecordingBlob();
          resolve(blob);
        };

        this.mediaRecorder.onerror = (event) => {
          this.isRecording = false;
          reject(event.error);
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
   */
  pauseRecording() {
    if (this.isRecording && this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
    }
  }

  /**
   * استئناف التسجيل
   */
  resumeRecording() {
    if (this.isRecording && this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
    }
  }

  /**
   * الحصول على blob التسجيل
   * @returns {Blob} blob التسجيل
   */
  getRecordingBlob() {
    if (this.recordedChunks.length === 0) {
      return null;
    }

    return new Blob(this.recordedChunks, {
      type: this.options.mimeType,
    });
  }

  /**
   * الحصول على مدة التسجيل
   * @returns {number} المدة بالثواني
   */
  getRecordingDuration() {
    if (!this.startTime) {
      return 0;
    }

    const endTime = new Date();
    return Math.floor((endTime - this.startTime) / 1000);
  }

  /**
   * الحصول على حجم التسجيل
   * @returns {number} الحجم بالبايت
   */
  getRecordingSize() {
    const blob = this.getRecordingBlob();
    return blob ? blob.size : 0;
  }

  /**
   * تحميل التسجيل كملف
   * @param {string} filename - اسم الملف
   */
  downloadRecording(filename = 'recording.webm') {
    const blob = this.getRecordingBlob();
    if (!blob) {
      throw new Error('No recording available');
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  /**
   * رفع التسجيل إلى الخادم
   * @param {string} interviewId - معرف المقابلة
   * @param {string} token - token المصادقة
   * @returns {Promise<Object>} نتيجة الرفع
   */
  async uploadRecording(interviewId, token) {
    try {
      const blob = this.getRecordingBlob();
      if (!blob) {
        throw new Error('No recording available');
      }

      // إنشاء FormData
      const formData = new FormData();
      formData.append('recording', blob, `interview-${interviewId}.webm`);
      formData.append('interviewId', interviewId);
      formData.append('duration', this.getRecordingDuration());
      formData.append('fileSize', blob.size);

      // رفع إلى الخادم
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/recordings/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error uploading recording:', error);
      throw error;
    }
  }

  /**
   * إعادة تعيين التسجيل
   */
  reset() {
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.stream = null;
    this.isRecording = false;
    this.startTime = null;
    this.recordingId = null;
  }

  /**
   * التحقق من دعم التسجيل
   * @returns {boolean}
   */
  static isSupported() {
    return !!(window.MediaRecorder && navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  /**
   * الحصول على قائمة mimeTypes المدعومة
   * @returns {Array<string>}
   */
  static getSupportedMimeTypes() {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=h264,opus',
      'video/webm',
      'video/mp4',
    ];

    return types.filter(type => MediaRecorder.isTypeSupported(type));
  }

  /**
   * تقدير حجم التسجيل
   * @param {number} durationSeconds - المدة بالثواني
   * @param {number} videoBitrate - bitrate الفيديو
   * @param {number} audioBitrate - bitrate الصوت
   * @returns {number} الحجم المقدر بالبايت
   */
  static estimateRecordingSize(durationSeconds, videoBitrate = 2500000, audioBitrate = 128000) {
    const totalBitrate = videoBitrate + audioBitrate;
    return Math.floor((totalBitrate / 8) * durationSeconds);
  }

  /**
   * تنسيق حجم الملف
   * @param {number} bytes - الحجم بالبايت
   * @returns {string} الحجم المنسق
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * تنسيق المدة
   * @param {number} seconds - المدة بالثواني
   * @returns {string} المدة المنسقة
   */
  static formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}

export default RecordingService;
