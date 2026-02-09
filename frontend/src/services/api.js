import axios from 'axios';

// تحميل monitoring بشكل آمن
// مراقب الأداء (تعليق لتجنب تحذير ESLint)
// eslint-disable-next-line no-unused-vars
let performanceMonitor = null;
let trackApiCall = null;
let logError = null;

try {
  const monitoring = require('../utils/monitoring');
  trackApiCall = monitoring.trackApiCall;
  logError = monitoring.logError;
} catch (error) {
  console.warn('Performance monitoring not available:', error.message);
  // إنشاء دوال بديلة فارغة
  trackApiCall = () => {};
  logError = () => {};
}

// ✅ استخدام متغير البيئة مع fallback للرابط المستقر
const BASE_URL = process.env.REACT_APP_API_URL || 'https://careerak-vsc.vercel.app';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

// 📊 Interceptor لتتبع الأداء
api.interceptors.request.use(
  (config) => {
    // إضافة وقت بداية الطلب
    config.metadata = { startTime: Date.now() };
    return config;
  },
  (error) => {
    if (logError) {
      logError({
        type: 'API Request Error',
        message: error.message,
        config: error.config,
        timestamp: Date.now()
      });
    }
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // حساب مدة الطلب
    const duration = Date.now() - response.config.metadata.startTime;
    
    // تتبع استدعاء API ناجح
    if (trackApiCall) {
      trackApiCall(
        response.config.method.toUpperCase(),
        response.config.url,
        duration,
        response.status
      );
    }
    
    return response;
  },
  (error) => {
    // حساب مدة الطلب حتى لو فشل
    const duration = error.config?.metadata?.startTime 
      ? Date.now() - error.config.metadata.startTime 
      : 0;
    
    // تتبع استدعاء API فاشل
    if (trackApiCall) {
      trackApiCall(
        error.config?.method?.toUpperCase() || 'UNKNOWN',
        error.config?.url || 'unknown',
        duration,
        error.response?.status || 0,
        error.message
      );
    }
    
    // تسجيل الخطأ
    if (logError) {
      logError({
        type: 'API Response Error',
        message: error.message,
        status: error.response?.status,
        url: error.config?.url,
        method: error.config?.method,
        timestamp: Date.now()
      });
    }
    
    return Promise.reject(error);
  }
);

export const discoverBestServer = async () => {
  // إرجاع Promise محلول مباشرة
  return Promise.resolve(BASE_URL);
};

export default api;
