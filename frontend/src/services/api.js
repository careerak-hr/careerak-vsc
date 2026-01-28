import axios from 'axios';
import performanceMonitor, { trackApiCall, logError } from '../utils/monitoring';

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
    logError({
      type: 'API Request Error',
      message: error.message,
      config: error.config,
      timestamp: Date.now()
    });
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // حساب مدة الطلب
    const duration = Date.now() - response.config.metadata.startTime;
    
    // تتبع استدعاء API ناجح
    trackApiCall(
      response.config.method.toUpperCase(),
      response.config.url,
      duration,
      response.status
    );
    
    return response;
  },
  (error) => {
    // حساب مدة الطلب حتى لو فشل
    const duration = error.config?.metadata?.startTime 
      ? Date.now() - error.config.metadata.startTime 
      : 0;
    
    // تتبع استدعاء API فاشل
    trackApiCall(
      error.config?.method?.toUpperCase() || 'UNKNOWN',
      error.config?.url || 'unknown',
      duration,
      error.response?.status || 0,
      error.message
    );
    
    // تسجيل الخطأ
    logError({
      type: 'API Response Error',
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      timestamp: Date.now()
    });
    
    return Promise.reject(error);
  }
);

export const discoverBestServer = async () => {
  return BASE_URL;
};

export default api;
